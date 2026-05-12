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
  version: z.string().describe("Coolify version string"),
});

/**
 * Tool definition
 */
export const getInfoDefinition: ToolDefinition = {
  name: "get_info",
  category: "default",
  description: "Get Coolify server information and features",
  summary: "Returns the Coolify server version string",
  examples: [
    'invoke("get_info", {}) → {version: "4.0.0-beta.384"}',
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
  // GET /version returns a plain version string
  const raw = await context.httpClient.get<unknown>("/version", {
    requestId: context.requestId,
  });
  const version = typeof raw === "string" ? raw : JSON.stringify(raw);
  return { version };
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
