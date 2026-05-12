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
 * Tool response - sanitized configuration (no secrets)
 */
const responseSchema = z.object({
  environment: z.enum(["development", "production"]),
  debug: z.boolean().optional(),
  logging: z
    .object({
      level: z.string(),
      format: z.string().optional(),
    })
    .optional(),
  features: z
    .object({
      dockerSupport: z.boolean(),
      kubernetesSupport: z.boolean(),
      gitIntegration: z.boolean(),
      webhooksEnabled: z.boolean(),
    })
    .optional(),
  limits: z
    .object({
      maxApplications: z.number().int().optional(),
      maxDeployments: z.number().int().optional(),
      requestTimeout: z.number().int().optional(),
    })
    .optional(),
});

/**
 * Tool definition
 */
export const getConfigDefinition: ToolDefinition = {
  name: "get_config",
  category: "default",
  description: "Get Coolify server configuration",
  summary: "Returns current server configuration (non-sensitive values only)",
  examples: [
    'invoke("get_config", {}) → {environment: "production", debug: false, features: {...}}',
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
async function getConfigHandler(
  _parameters: unknown,
  context: ExtendedToolContext
): Promise<Record<string, unknown>> {
  // Call Coolify API config endpoint
  const response = await context.httpClient.get<Record<string, unknown>>("/config", {
    requestId: context.requestId,
  });

  // Ensure sensitive fields are removed (double-check in addition to logger sanitization)
  const sanitized = sanitizeConfig(response);

  return sanitized;
}

/**
 * Remove sensitive configuration fields
 */
function sanitizeConfig(config: Record<string, unknown>): Record<string, unknown> {
  const sensitiveKeys = [
    "token",
    "password",
    "secret",
    "key",
    "apiKey",
    "apiSecret",
    "privateKey",
    "connectionString",
    "dbPassword",
  ];

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(config)) {
    if (
      sensitiveKeys.some((sensitive) =>
        key.toLowerCase().includes(sensitive.toLowerCase())
      )
    ) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeConfig(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
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
