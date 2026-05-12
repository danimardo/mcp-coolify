/**
 * get_config Tool
 * Returns current Coolify server configuration
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
 * Tool response - MCP server configuration (no secrets)
 */
const responseSchema = z.object({
  coolifyBaseUrl: z.string().describe("URL base de la instancia Coolify"),
  readOnly: z.boolean().describe("Modo solo lectura activo"),
  requestTimeout: z.number().int().describe("Timeout de requests en ms"),
});

/**
 * Tool definition
 */
export const getConfigDefinition: ToolDefinition = {
  name: "get_config",
  category: "default",
  description: "Get MCP server configuration (non-sensitive values)",
  summary: "Returns Coolify base URL, read-only mode status and request timeout",
  examples: [
    'invoke("get_config", {}) → {coolifyBaseUrl: "https://coolify.example.com", readOnly: false, requestTimeout: 30000}',
  ],
  parameters: {
    schema: parametersSchema,
    description: "No parameters required",
  },
  response: {
    schema: responseSchema,
    description: "Server configuration (secrets redacted)",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 5000,
  tags: ["diagnostic", "configuration", "settings"],
};

/**
 * Tool handler implementation
 */
function getConfigHandler(
  _parameters: unknown,
  context: ExtendedToolContext
): Promise<Record<string, unknown>> {
  return Promise.resolve({
    coolifyBaseUrl: context.config.coolifyBaseUrl,
    readOnly: context.config.readOnly,
    requestTimeout: context.config.requestTimeout,
  });
}

/**
 * Create wrapped tool with base functionality
 */
export const getConfigTool: ToolHandler = createBaseTool(
  "get_config",
  parametersSchema,
  responseSchema,
  getConfigHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);
