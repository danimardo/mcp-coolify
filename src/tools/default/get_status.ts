/**
 * get_status Tool
 * Returns server health and status
 *
 * Category: Default
 * Status: Read-only (no READ_ONLY block)
 * Confirmation: Not required
 */

import { z } from "zod";
import { ToolDefinition, ToolHandler } from "$lib/tools/types";
import { createBaseTool } from "$lib/tools/base-tool";
import { healthCheckResponseSchema } from "$lib/schemas/coolify-responses";

/**
 * Tool parameters (none required)
 */
const parametersSchema = z.object({}).strict();

/**
 * Tool response
 */
const responseSchema = z.object({
  status: z.enum(["healthy", "degraded", "unhealthy"]),
  uptime: z.number().int().min(0),
  version: z.string(),
  timestamp: z.string().datetime(),
});

/**
 * Tool definition
 */
export const getStatusDefinition: ToolDefinition = {
  name: "get_status",
  category: "default",
  description: "Get Coolify server status and health check",
  summary: "Returns current server health, uptime, and version",
  examples: [
    'invoke("get_status", {}) → {status: "healthy", uptime: 3600000, version: "4.0.0"}',
  ],
  parameters: {
    schema: parametersSchema,
    description: "No parameters required",
  },
  response: {
    schema: responseSchema,
    description: "Server health status with uptime and version",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 5000,
  tags: ["diagnostic", "health", "status"],
};

/**
 * Tool handler implementation
 */
async function getStatusHandler(
  _parameters: unknown,
  context: any
): Promise<unknown> {
  // Call Coolify API health endpoint
  const response = await context.httpClient.get("/health", {
    requestId: context.requestId,
  });

  // Ensure response includes timestamp
  return {
    ...response,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create wrapped tool with base functionality
 */
export const getStatusTool: ToolHandler = createBaseTool(
  "get_status",
  parametersSchema,
  responseSchema,
  getStatusHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);
