/**
 * test_connection Tool
 * Comprehensive connectivity test between MCP and Coolify
 *
 * Category: Default
 * Status: Read-only (diagnostic)
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
  status: z
    .enum(["success", "partial", "failure"])
    .describe("Overall connection status"),
  checks: z
    .object({
      endpoint_reachable: z.boolean().describe("Can reach Coolify endpoint"),
      token_valid: z.boolean().describe("API token is valid"),
      server_healthy: z.boolean().describe("Server health check passed"),
      response_time_ms: z.number().int().describe("API response latency"),
    })
    .describe("Individual connectivity checks"),
  issues: z
    .array(z.string())
    .optional()
    .describe("List of issues found (if any)"),
  timestamp: z.string().datetime(),
});

/**
 * Tool definition
 */
export const testConnectionDefinition: ToolDefinition = {
  name: "test_connection",
  category: "default",
  description: "Comprehensive connectivity test to Coolify",
  summary: "Tests endpoint reachability, token validity, and server health",
  examples: [
    'invoke("test_connection", {}) → {status: "success", checks: {...}, timestamp: "..."}',
  ],
  parameters: {
    schema: parametersSchema,
    description: "No parameters required",
  },
  response: {
    schema: responseSchema,
    description: "Comprehensive connectivity check results",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 15000, // Longer timeout for multiple checks
  tags: ["diagnostic", "connectivity", "health"],
};

/**
 * Tool handler implementation
 */
async function testConnectionHandler(
  _parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const checks = {
    endpoint_reachable: false,
    token_valid: false,
    server_healthy: false,
    response_time_ms: 0,
  };

  const issues: string[] = [];
  const startTime = Date.now();

  try {
    // Check 1: Endpoint reachability
    try {
      await context.httpClient.get("/health", {
        requestId: context.requestId,
      });
      checks.endpoint_reachable = true;
    } catch (error) {
      issues.push("Cannot reach Coolify endpoint");
    }

    // Check 2: Token validity — GET /version requires a valid bearer token
    try {
      await context.httpClient.get("/version", {
        requestId: context.requestId,
      });
      checks.token_valid = true;
    } catch (error) {
      issues.push("API token is invalid or expired");
    }

    // Check 3: Server health
    try {
      const health = await context.httpClient.get<{ status: string }>("/health", {
        requestId: context.requestId,
      });
      if (health.status === "healthy" || health.status === "degraded") {
        checks.server_healthy = true;
      } else {
        issues.push("Server health check failed");
      }
    } catch (error) {
      issues.push("Could not check server health");
    }

    checks.response_time_ms = Date.now() - startTime;

    // Determine overall status
    let status: "success" | "partial" | "failure" = "success";
    if (Object.values(checks).some((v) => v === false && typeof v === "boolean")) {
      status = issues.length > 1 ? "failure" : "partial";
    }

    return {
      status,
      checks,
      issues: issues.length > 0 ? issues : undefined,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: "failure",
      checks,
      issues: ["Connection test failed: " + (error instanceof Error ? error.message : String(error))],
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Create wrapped tool with base functionality
 */
export const testConnectionTool: ToolHandler = createBaseTool(
  "test_connection",
  parametersSchema,
  responseSchema,
  testConnectionHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);
