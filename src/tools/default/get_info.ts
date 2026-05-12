/**
 * get_info Tool
 * Returns Coolify server information and capabilities
 *
 * Category: Default
 * Status: Read-only
 * Confirmation: Not required
 */

import { z } from "zod";
import type { ExtendedToolContext } from "$lib/tools/types";
import { ToolDefinition, ToolHandler } from "$lib/tools/types";
import { createBaseTool } from "$lib/tools/base-tool";

/**
 * Tool parameters (none required)
 */
const parametersSchema = z.object({}).strict();

/**
 * Tool response
 */
const responseSchema = z.object({
  version: z.string().describe("Coolify version"),
  environment: z.enum(["development", "production"]),
  features: z
    .array(z.string())
    .describe("Available features/capabilities"),
  timezone: z.string().optional(),
  apiVersion: z.string().optional(),
});

/**
 * Tool definition
 */
export const getInfoDefinition: ToolDefinition = {
  name: "get_info",
  category: "default",
  description: "Get Coolify server information and features",
  summary: "Returns version, environment, and available features",
  examples: [
    'invoke("get_info", {}) → {version: "4.0.0", environment: "production", features: ["docker", "git", ...]}',
  ],
  parameters: {
    schema: parametersSchema,
    description: "No parameters required",
  },
  response: {
    schema: responseSchema,
    description: "Server information with version and features",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 5000,
  tags: ["diagnostic", "information", "features"],
};

/**
 * Tool handler implementation
 */
async function getInfoHandler(
  _parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  // Call Coolify API info endpoint
  const response = await context.httpClient.get("/info", {
    requestId: context.requestId,
  });

  return response;
}

/**
 * Create wrapped tool with base functionality
 */
export const getInfoTool: ToolHandler = createBaseTool(
  "get_info",
  parametersSchema,
  responseSchema,
  getInfoHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);
