/**
 * Configuration management with Zod validation
 * Validates all environment variables at startup
 */

import { z } from "zod";

const configSchema = z.object({
  // Coolify API Configuration (required)
  coolifyBaseUrl: z
    .string()
    .min(1, "COOLIFY_BASE_URL is required")
    .url("COOLIFY_BASE_URL must be a valid URL")
    .refine(
      (url) => url.endsWith("/api/v1"),
      "COOLIFY_BASE_URL must end with /api/v1 (e.g., https://coolify.example.com/api/v1)"
    )
    .describe("Coolify API base URL (must include /api/v1)"),

  coolifyToken: z
    .string()
    .min(1, "COOLIFY_TOKEN is required")
    .regex(/^(tr_|[0-9]+\|)/, "COOLIFY_TOKEN debe ser un token válido (formato tr_* o [número]|*)")
    .describe("Coolify API authentication token (Bearer token)"),

  validateTokenOnStartup: z
    .boolean()
    .default(true)
    .describe("Validate Coolify token by calling /version endpoint on startup"),

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
    coolifyBaseUrl: process.env.COOLIFY_BASE_URL,
    coolifyToken: process.env.COOLIFY_TOKEN,
    validateTokenOnStartup: process.env.VALIDATE_TOKEN_ON_STARTUP === "false" ? false : true,
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

      // eslint-disable-next-line no-console -- No logger available before bootstrap, fatal config error
      console.error("Configuration validation failed:");
      // eslint-disable-next-line no-console
      console.error(errorMessage);
      // eslint-disable-next-line no-console
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
