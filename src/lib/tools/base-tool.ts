/**
 * Base Tool Implementation Mixin
 *
 * Provides common functionality for all tools:
 * - Parameter validation
 * - Response passthrough (response schema is documentation-only)
 * - Error handling
 * - Logging
 * - READ_ONLY guard
 */

import { z } from "zod";
import { ExtendedToolContext, ToolHandler, ToolResponse } from "./types";
import {
  ValidationError,
} from "../errors/error-types";
import { formatErrorResponse, logError } from "../errors/response-formatter";
import { guardReadOnly, isDestructiveOperation } from "../safety/readonly-guard";

/**
 * Wrap a tool handler with common logic.
 * Note: response schema is documentation-only — runtime response is passed through as-is.
 * Confirmation flow is handled upstream by the MCP server (server/index.ts).
 */
export function createBaseTool(
  toolName: string,
  parameterSchema: z.ZodType,
  _responseSchema: z.ZodType,
  handler: (
    parameters: unknown,
    context: ExtendedToolContext
  ) => Promise<unknown>,
  options?: {
    requiresConfirmation?: boolean;
    readOnlyBlocks?: boolean;
  }
): ToolHandler {
  return async (parameters: unknown, context: ExtendedToolContext) => {
    const startTime = Date.now();
    const { requestId, logger } = context;

    // Phase 1: Log invocation
    logger.debug("mcp.tool.invoked", {
      requestId,
      toolName,
      requiresConfirmation: options?.requiresConfirmation ?? false,
    });

    try {
      // Phase 2: Check READ_ONLY guard
      if (options?.readOnlyBlocks ?? isDestructiveOperation(toolName)) {
        guardReadOnly(toolName, context.config.readOnly, logger);
      }

      // Phase 3: Validate parameters
      let validatedParameters: unknown;
      try {
        validatedParameters = await parameterSchema.parseAsync(parameters);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errorPaths = error.errors.map((e: z.ZodIssue) => e.path.map((p: string | number) => String(p)).join(".")).join(", ");
          const validationError = new ValidationError(
            `Parameter validation failed: ${errorPaths}`,
            error.errors.reduce<Record<string, string>>(
              (acc: Record<string, string>, err: z.ZodIssue) => ({
                ...acc,
                [err.path.join(".")]: err.message,
              }),
              {}
            )
          );

          logger.warn("mcp.tool.parameters_invalid", {
            requestId,
            toolName,
            errors: validationError.details,
          });

          throw validationError;
        }
        throw error;
      }

      // Phase 4: Execute handler
      const result = await handler(validatedParameters, context);

      // Phase 5: Log success
      const duration = Date.now() - startTime;
      logger.info("mcp.tool.completed", {
        requestId,
        toolName,
        durationMs: duration,
        success: true,
      });

      return {
        success: true,
        data: result,
        meta: {
          requestId,
          duration,
          timestamp: new Date().toISOString(),
        },
      } satisfies ToolResponse;
    } catch (error) {
      // Phase 6: Handle errors
      const duration = Date.now() - startTime;

      logError(error, logger, {
        requestId,
        operation: "tool_execution",
        toolName,
      });

      const errorResponse = formatErrorResponse(error, logger, requestId);

      logger.warn("mcp.tool.failed", {
        requestId,
        toolName,
        durationMs: duration,
        errorCode: errorResponse.error,
      });

      return {
        success: false,
        error: {
          code: errorResponse.error || "UNKNOWN_ERROR",
          message: errorResponse.message,
          hint: errorResponse.hint,
        },
        meta: {
          requestId,
          duration,
          timestamp: new Date().toISOString(),
        },
      } satisfies ToolResponse;
    }
  };
}
