/**
 * Base Tool Implementation Mixin
 *
 * Provides common functionality for all tools:
 * - Parameter validation
 * - Response validation
 * - Error handling
 * - Logging
 * - Confirmation flow
 * - READ_ONLY guard
 */

import { z } from "zod";
import { ExtendedToolContext, ToolHandler, ToolResponse } from "./types";
import { Logger } from "../logging/types";
import {
  ValidationError,
  ResponseValidationError,
  CoolifyError,
} from "../errors/error-types";
import { formatErrorResponse, logError } from "../errors/response-formatter";
import { guardReadOnly, isDestructiveOperation } from "../safety/readonly-guard";
import {
  ConfirmationFlow,
  requiresConfirmation,
  getConfirmationReason,
} from "../confirmation/flow";

/**
 * Wrap a tool handler with common logic
 */
export function createBaseTool(
  toolName: string,
  parameterSchema: z.ZodType,
  responseSchema: z.ZodType,
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
      requiresConfirmation: options?.requiresConfirmation || false,
    });

    try {
      // Phase 2: Check READ_ONLY guard
      if (options?.readOnlyBlocks || isDestructiveOperation(toolName)) {
        guardReadOnly(toolName, context.config.readOnly, logger);
      }

      // Phase 3: Validate parameters
      let validatedParameters: unknown;
      try {
        validatedParameters = await parameterSchema.parseAsync(parameters);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const validationError = new ValidationError(
            `Parameter validation failed: ${error.errors.map((e) => e.path.join("."))}`,
            error.errors.reduce(
              (acc, err) => ({
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

      // Phase 4: Check confirmation requirement
      const confirmationFlow = new ConfirmationFlow(logger);
      if (options?.requiresConfirmation || requiresConfirmation(toolName)) {
        if (!confirmationFlow.isConfirmed(requestId)) {
          const token = confirmationFlow.requestConfirmation({
            operationId: requestId,
            operationName: toolName,
            parameters: validatedParameters,
            reason: getConfirmationReason(toolName),
            requiredConfirmation: true,
          });

          return {
            success: false,
            error: {
              code: "CONFIRMATION_REQUIRED",
              message: `Operation requires confirmation: ${getConfirmationReason(toolName)}`,
              hint: `Confirm with token: ${token}`,
            },
            meta: {
              requestId,
              duration: Date.now() - startTime,
              timestamp: new Date().toISOString(),
              confirmationToken: token,
            },
          } as ToolResponse;
        }

        // Operation was confirmed
        confirmationFlow.clearConfirmed(requestId);
      }

      // Phase 5: Execute handler
      const result = await handler(validatedParameters, context);

      // Phase 6: Validate response
      let validatedResponse: unknown;
      try {
        validatedResponse = await responseSchema.parseAsync(result);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const responseError = new ResponseValidationError(
            `Response validation failed: Coolify API returned unexpected format`,
            {
              expectedSchema: responseSchema,
              actualData: result,
              errors: error.errors,
            }
          );

          logger.error("response.validation_failed", {
            requestId,
            toolName,
            errors: error.errors,
          });

          throw responseError;
        }
        throw error;
      }

      // Phase 7: Log success
      const duration = Date.now() - startTime;
      logger.debug("mcp.tool.completed", {
        requestId,
        toolName,
        durationMs: duration,
        success: true,
      });

      return {
        success: true,
        data: validatedResponse,
        meta: {
          requestId,
          duration,
          timestamp: new Date().toISOString(),
        },
      } as ToolResponse;
    } catch (error) {
      // Phase 8: Handle errors
      const duration = Date.now() - startTime;

      logError(error, logger, {
        requestId,
        operation: "tool_execution",
        toolName,
      });

      const errorResponse = formatErrorResponse(error, logger, requestId);

      logger.debug("mcp.tool.failed", {
        requestId,
        toolName,
        durationMs: duration,
        errorCode: errorResponse.error,
      });

      return {
        success: false,
        error: errorResponse,
        meta: {
          requestId,
          duration,
          timestamp: new Date().toISOString(),
        },
      } as ToolResponse;
    }
  };
}
