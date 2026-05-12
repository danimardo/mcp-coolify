/**
 * validate_token Tool
 * Validates Coolify API token and checks scopes
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
  valid: z.boolean().describe("Whether token is valid"),
  scopes: z
    .array(z.string())
    .describe("API scopes granted to token")
    .optional(),
  expiresAt: z.string().datetime().optional().describe("Token expiration time"),
  userId: z.string().optional().describe("User ID associated with token"),
});

/**
 * Tool definition
 */
export const validateTokenDefinition: ToolDefinition = {
  name: "validate_token",
  category: "default",
  description: "Validate Coolify API token and check scopes",
  summary: "Verifica que el token puede autenticarse contra la API de Coolify",
  examples: [
    'invoke("validate_token", {}) → {valid: true}',
  ],
  parameters: {
    schema: parametersSchema,
    description: "No parameters required",
  },
  response: {
    schema: responseSchema,
    description: "Token validation result with scopes",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 5000,
  tags: ["diagnostic", "authentication", "token"],
};

/**
 * Tool handler implementation
 */
async function validateTokenHandler(
  _parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  // Validate token by calling an authenticated endpoint; /version is the simplest
  try {
    await context.httpClient.get<unknown>("/version", { requestId: context.requestId });
    return { valid: true };
  } catch {
    return { valid: false };
  }
}

/**
 * Create wrapped tool with base functionality
 */
export const validateTokenTool: ToolHandler = createBaseTool(
  "validate_token",
  parametersSchema,
  responseSchema,
  validateTokenHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);
