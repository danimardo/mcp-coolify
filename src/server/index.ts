/**
 * MCP Coolify Server Entry Point
 *
 * Initializes:
 * 1. Configuration from environment
 * 2. Logging system
 * 3. HTTP client for Coolify API
 * 4. MCP server with tool registry
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { randomUUID } from "node:crypto";
import { getConfig, type AppConfig } from "../lib/config.js";
import { initializeLogger, getLogger } from "../lib/logging/index.js";
import { createHttpClient } from "../lib/http-client.js";
import { createToolRegistry } from "../lib/tools/registry.js";
import { registerAllTools } from "../tools/index.js";
import type { ExtendedToolContext } from "../lib/tools/types.js";
import type { Logger } from "../lib/logging/types.js";

/**
 * Crea el contexto de ejecución para un tool
 */
function createToolContext(
  requestId: string,
  logger: Logger,
  config: AppConfig,
  httpClient: ReturnType<typeof createHttpClient>
): ExtendedToolContext {
  return {
    requestId,
    logger,
    startTime: Date.now(),
    config: {
      coolifyBaseUrl: config.coolifyBaseUrl,
      readOnly: config.readOnly,
      requestTimeout: config.requestTimeout,
    },
    httpClient: {
      get: <T>(url: string, options?: Record<string, unknown>) =>
        httpClient.get<T>(url, {
          params: options,
          requestId,
        }),
      post: <T>(url: string, data: unknown, options?: Record<string, unknown>) =>
        httpClient.post<T>(url, data, {
          params: options,
          requestId,
        }),
      patch: <T>(url: string, data: unknown, options?: Record<string, unknown>) =>
        httpClient.patch<T>(url, data, {
          params: options,
          requestId,
        }),
      delete: <T>(url: string, options?: Record<string, unknown>) =>
        httpClient.delete<T>(url, {
          params: options,
          requestId,
        }),
    },
  };
}

/**
 * Main entry point - bootstrap the MCP server
 */
async function main(): Promise<void> {
  // eslint-disable-next-line no-console -- Before logger initialization
  let log = console;

  try {
    // Phase 1: Load configuration
    const config = getConfig();
    // eslint-disable-next-line no-console -- Pre-logger bootstrap
    log.info("[BOOTSTRAP] Configuration loaded", {
      environment: config.nodeEnv,
      logLevel: config.logLevel,
      readOnly: config.readOnly,
    });

    // Phase 2: Initialize logger
    const logger = initializeLogger({
      logLevel: config.logLevel,
      logDir: config.logDir,
      logToFiles: config.logToFiles,
      timezone: config.logTimezone,
    });

    log = logger as unknown as Console;
    logger.info("app.bootstrap.started", {
      environment: config.nodeEnv,
      version: "1.0.0-rc.1",
    });

    logger.debug("app.bootstrap.config_loaded", {
      environment: config.nodeEnv,
      logLevel: config.logLevel,
      readOnly: config.readOnly,
      timeout: config.requestTimeout,
    });

    // Phase 3: Create HTTP client for Coolify API
    const httpClient = createHttpClient({
      baseURL: config.coolifyBaseUrl,
      token: config.coolifyToken,
      timeout: config.requestTimeout,
      maxRetries: config.maxRetries,
      logger,
    });

    // Phase 3b: Validate token at bootstrap if configured
    if (config.validateTokenOnStartup) {
      try {
        const startValidation = Date.now();
        await httpClient.get<{ version: string }>("/version", {
          requestId: `bootstrap-${Date.now()}`,
        });
        const validationDuration = Date.now() - startValidation;

        logger.info("app.bootstrap.token_validated", {
          endpoint: config.coolifyBaseUrl,
          durationMs: validationDuration,
        });
      } catch (error) {
        logger.fatal(
          "app.bootstrap.token_validation_failed",
          error instanceof Error ? error : new Error(String(error)),
          "Failed to validate Coolify token - check COOLIFY_TOKEN and COOLIFY_BASE_URL"
        );
        process.exit(1);
      }
    } else {
      logger.debug("app.bootstrap.token_validation_skipped", {
        reason: "VALIDATE_TOKEN_ON_STARTUP=false",
      });
    }

    // Phase 4: Initialize tool registry
    const registry = createToolRegistry(logger);
    const toolCount = registerAllTools(registry, logger);

    logger.debug("app.bootstrap.server_initialized", {
      name: "mcp-coolify",
      version: "1.0.0-rc.1",
      toolCount,
    });

    // Phase 5: Initialize MCP server and register tools
    const server = new McpServer({
      name: "mcp-coolify",
      version: "1.0.0-rc.1",
    });

    // Registrar todos los tools en el servidor MCP
    for (const entry of registry.list()) {
      const def = entry.definition;

      // For MCP compatibility, pass the Zod schema directly
      // MCP SDK will handle the schema validation
      // MCP SDK expects inputSchema to be a schema type - cast Zod safely
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- MCP SDK schema typing
      const inputSchemaAsSchema = def.parameters.schema as unknown;
      const toolDef = {
        description: def.description,
        inputSchema: inputSchemaAsSchema,
      };

      server.registerTool(
        def.name,
        toolDef,
        async (params: unknown) => {
          const requestId = randomUUID();
          const context = createToolContext(requestId, logger, config, httpClient);
          const result = await entry.handler(params, context);

          // Format result as MCP-compliant response
          const text = JSON.stringify(result, null, 2);
          return {
            content: [{ type: "text" as const, text }],
          };
        }
      );
    }

    // Phase 6: Start server
    const transport = new StdioServerTransport();
    await server.connect(transport);

    logger.info("app.bootstrap.completed", {
      environment: config.nodeEnv,
      toolCount,
    });

    // Keep process alive
    process.on("SIGINT", () => {
      void (async () => {
        logger.info("app.shutdown.requested");
        await server.close();
        process.exit(0);
      })();
    });

    process.on("SIGTERM", () => {
      void (async () => {
        logger.info("app.shutdown.requested");
        await server.close();
        process.exit(0);
      })();
    });
  } catch (error) {
    const logger = getLogger();
    logger.fatal(
      "app.bootstrap.failed",
      error instanceof Error ? error : new Error(String(error)),
      error instanceof Error ? error.message : String(error)
    );

    process.exit(1);
  }
}

// Start the server
main().catch((error) => {
  // eslint-disable-next-line no-console -- Fatal error before logger initialization
  console.error("Fatal error:", error);
  process.exit(1);
});
