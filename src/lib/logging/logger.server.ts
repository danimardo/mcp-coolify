/**
 * Logger implementation using Pino
 * Writes to both human-readable and JSON Lines formats
 * Automatically redacts sensitive information
 * Uses date-fns for timezone-aware timestamps
 */

import pino from "pino";
import { format as formatDate, utcToZonedTime } from "date-fns-tz";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { EventName, Logger, StructuredLogEntry } from "./types";
import { sanitizeContext, sanitizeError } from "./sanitize";

let loggerInstance: Logger | null = null;

/**
 * Initialize the logger with configuration
 */
export function initializeLogger(config: {
  logLevel: string;
  logDir?: string;
  logToFiles?: boolean;
  timezone?: string;
}): Logger {
  const level = (config.logLevel ?? "info").toLowerCase();
  const timezone = config.timezone ?? "Europe/Madrid";
  const logDir = config.logDir ?? ".logs";
  const logToFiles = config.logToFiles ?? true;
  const nodeEnv = process.env.NODE_ENV ?? "development";

  // Initialize log files if in development and logToFiles is true
  if (logToFiles && nodeEnv === "development") {
    // Create .logs directory if needed (async, but fire and forget for startup)
    void mkdir(logDir, { recursive: true }).catch(() => {
      // Directory creation failed, but continue (might already exist)
    });
  }

  // Create Pino instance (stdout + file transports)
  const pinoLogger = pino(
    {
      level,
      transport: {
        target: "pino-pretty",
        options: {
          colorize: nodeEnv === "development",
          translateTime: "SYS:HH:MM:ss",
          ignore: "pid,hostname",
        },
      },
    },
    pino.destination()
  );

  class PinoLogger implements Logger {
    private baseContext: Record<string, unknown> = {};

    constructor(baseContext?: Record<string, unknown>) {
      this.baseContext = baseContext ?? {};
    }

    trace(
      event: EventName,
      context?: Record<string, unknown>,
      message?: string
    ): void {
      this.logEvent("trace", event, context, message);
    }

    debug(
      event: EventName,
      context?: Record<string, unknown>,
      message?: string
    ): void {
      this.logEvent("debug", event, context, message);
    }

    info(
      event: EventName,
      context?: Record<string, unknown>,
      message?: string
    ): void {
      this.logEvent("info", event, context, message);
    }

    warn(
      event: EventName,
      context?: Record<string, unknown>,
      message?: string
    ): void {
      this.logEvent("warn", event, context, message);
    }

    error(
      event: EventName,
      contextOrError?: Record<string, unknown> | Error,
      message?: string
    ): void {
      let context = contextOrError;
      if (contextOrError instanceof Error) {
        context = {
          error: sanitizeError(contextOrError),
        };
        if (!message) {
          message = contextOrError.message;
        }
      }
      this.logEvent("error", event, context as Record<string, unknown>, message);
    }

    fatal(
      event: EventName,
      contextOrError?: Record<string, unknown> | Error,
      message?: string
    ): void {
      let context = contextOrError;
      if (contextOrError instanceof Error) {
        context = {
          error: sanitizeError(contextOrError),
        };
        if (!message) {
          message = contextOrError.message;
        }
      }
      this.logEvent("fatal", event, context as Record<string, unknown>, message);
    }

    child(context: Record<string, unknown>): Logger {
      return new PinoLogger({
        ...this.baseContext,
        ...context,
      });
    }

    private logEvent(
      level: "trace" | "debug" | "info" | "warn" | "error" | "fatal",
      event: EventName,
      context?: Record<string, unknown>,
      message?: string
    ): void {
      // Combine base context with provided context
      const fullContext = {
        ...this.baseContext,
        ...context,
      };

      // Sanitize context
      const sanitized = sanitizeContext(fullContext) as Record<string, unknown>;

      // Get current time in timezone
      const now = new Date();
      const timestamp = now.toISOString();
      const localTime = formatLocalTimeWithTimezone(now, timezone);

      // Create log entry
      const entry: StructuredLogEntry = {
        timestamp,
        localTime,
        timezone,
        level,
        eventName: event,
        message,
        context: Object.keys(sanitized).length > 0 ? sanitized : undefined,
      };

      // Log using Pino
      const logLevel = pinoLogger[level] ?? pinoLogger.info;
      (logLevel as (arg0: Record<string, unknown>, arg1: string) => void).call(
        pinoLogger,
        entry as unknown as Record<string, unknown>,
        message ?? event
      );

      // Also write to JSONL file if configured
      if (logToFiles && nodeEnv === "development") {
        void writeJsonLineToFile(logDir, entry).catch(() => {
          // File write failed, but continue (don't break logging)
        });
      }
    }
  }

  loggerInstance = new PinoLogger();
  return loggerInstance;
}

/**
 * Format date/time in local timezone using date-fns-tz
 */
function formatLocalTimeWithTimezone(date: Date, timezone: string): string {
  try {
    const zonedDate = utcToZonedTime(date, timezone);
    return formatDate(zonedDate, "dd/MM/yyyy HH:mm:ss", { timeZone: timezone });
  } catch {
    // Fallback if timezone is invalid
    const pad = (n: number) => String(n).padStart(2, "0");
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }
}

/**
 * Write structured log entry to JSONL file
 */
async function writeJsonLineToFile(
  logDir: string,
  entry: StructuredLogEntry
): Promise<void> {
  try {
    const logPath = join(logDir, "app.jsonl");
    const jsonLine = JSON.stringify(entry) + "\n";

    // Append to file
    await writeFile(logPath, jsonLine, { flag: "a", encoding: "utf-8" });
  } catch {
    // Silently fail on write errors to avoid breaking the app
  }
}

/**
 * Get existing logger instance
 */
export function getLogger(): Logger {
  if (!loggerInstance) {
    throw new Error(
      "Logger not initialized. Call initializeLogger() first."
    );
  }
  return loggerInstance;
}

/**
 * Shared logger singleton for application
 */
export const logger = {
  init: initializeLogger,
  get: getLogger,
};
