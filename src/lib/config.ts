/**
 * Configuration management with Zod validation
 * Validates all environment variables at startup
 */

import { z } from "zod";
import { logger } from "./logging/logger.server";

const configSchema = z.object({
  // Coolify API Configuration (required)
  coolifyUrl: z
    .string()
    .min(1, "COOLIFY_URL is required")
    .url("COOLIFY_URL must be a valid URL")
    .describe("Coolify API base URL"),

  coolifyToken: z
    .string()
    .min(1, "COOLIFY_TOKEN is required")
    .describe("Coolify API authentication token"),

  // Server Configuration
  nodeEnv: z
    .enum(["development", "production", "test"])
    .default("development")
    .describe("Node environment"),

  port: z
    .number()
    .int()
    .min(1)
    .max(65535)
    .default(3000)
    .describe("Server port"),

  // Logging Configuration
  logLevel: z
    .enum(["trace", "debug", "info", "warn", "error", "fatal"])
    .default("info")
    .describe("Log level"),

  logDir: z
    .string()
    .default(".logs")
    .describe("Directory for log files"),

  logToFiles: z
    .boolean()
    .default(true)
    .describe("Enable file logging"),

  logTimezone: z
    .string()
    .default("Europe/Madrid")
    .describe("Timezone for log timestamps"),

  // Safety Configuration
  readOnly: z
    .boolean()
    .default(false)
    .describe("Block all destructive operations"),

  // Request Configuration
  requestTimeout: z
    .number()
    .int()
    .min(1000)
    .max(120000)
    .default(30000)
    .describe("HTTP request timeout in milliseconds"),

  maxRetries: z
    .number()
    .int()
    .min(0)
    .max(5)
    .default(3)
    .describe("Maximum retries for transient errors"),
});

export type AppConfig = z.infer<typeof configSchema>;

/**
 * Load and validate configuration from environment variables
 */
export function loadConfig(): AppConfig {
  const envVars = {
    coolifyUrl: process.env.COOLIFY_URL,
    coolifyToken: process.env.COOLIFY_TOKEN,
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : undefined,
    logLevel: process.env.LOG_LEVEL,
    logDir: process.env.LOG_DIR,
    logToFiles: process.env.LOG_TO_FILES === "false" ? false : true,
    logTimezone: process.env.LOG_TIMEZONE,
    readOnly: process.env.READ_ONLY === "true",
    requestTimeout: process.env.REQUEST_TIMEOUT
      ? parseInt(process.env.REQUEST_TIMEOUT, 10)
      : undefined,
    maxRetries: process.env.MAX_RETRIES
      ? parseInt(process.env.MAX_RETRIES, 10)
      : undefined,
  };

  try {
    const config = configSchema.parse(envVars);
    return config;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors
        .map(
          (err) =>
            `${err.path.join(".")}: ${err.message} (received: ${envVars[err.path[0] as keyof typeof envVars]})`
        )
        .join("\n");

      console.error("Configuration validation failed:");
      console.error(errorMessage);
      console.error("\nPlease check your .env file or environment variables.");

      process.exit(1);
    }

    throw error;
  }
}

/**
 * Get singleton config instance
 */
let configInstance: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (!configInstance) {
    configInstance = loadConfig();
  }
  return configInstance;
}

/**
 * Reset config (for testing)
 */
export function resetConfig(): void {
  configInstance = null;
}
