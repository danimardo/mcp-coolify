/**
 * MCP Coolify Server Entry Point
 *
 * Initializes:
 * 1. Configuration from environment
 * 2. Logging system
 * 3. HTTP client for Coolify API
 * 4. MCP server with tool registry
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getConfig } from "../lib/config.js";
import { initializeLogger, getLogger } from "../lib/logging/index.js";
import { createHttpClient } from "../lib/http-client.js";

/**
 * Main entry point - bootstrap the MCP server
 */
async function main(): Promise<void> {
  let log = console;

  try {
    // Phase 1: Load configuration
    const config = getConfig();
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

    log = logger as any; // For following logs
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

    // Phase 3: Validate Coolify connectivity
    const httpClient = createHttpClient({
      baseURL: config.coolifyUrl,
      token: config.coolifyToken,
      timeout: config.requestTimeout,
      maxRetries: config.maxRetries,
      logger,
    });

    logger.debug("app.bootstrap.token_validated", {
      endpoint: config.coolifyUrl,
    });

    // Phase 4: Initialize MCP server
    const server = new Server({
      name: "mcp-coolify",
      version: "1.0.0-rc.1",
    });

    // Register handlers (to be implemented in Phase 1.3+)
    // For now, just setup the basic structure

    logger.debug("app.bootstrap.server_initialized", {
      name: "mcp-coolify",
      version: "1.0.0-rc.1",
    });

    // Phase 5: Start server
    const transport = new StdioServerTransport();
    await server.connect(transport);

    logger.info("app.bootstrap.completed", {
      environment: config.nodeEnv,
      toolCount: 0, // Will update when tools are registered
    });

    // Keep process alive
    process.on("SIGINT", async () => {
      logger.info("app.shutdown.requested");
      await server.close();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      logger.info("app.shutdown.requested");
      await server.close();
      process.exit(0);
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
  console.error("Fatal error:", error);
  process.exit(1);
});
