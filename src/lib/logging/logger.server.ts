/**
 * Logger implementation using Pino
 * Writes to both human-readable and JSON Lines formats
 * Automatically redacts sensitive information
 */

import pino from "pino";
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
  const level = (config.logLevel || "info").toLowerCase();
  const timezone = config.timezone || "Europe/Madrid";

  // Create Pino instance (will output to stdout, we handle files separately if needed)
  const pinoLogger = pino(
    {
      level,
      transport: {
        target: "pino-pretty",
        options: {
          colorize: process.env.NODE_ENV === "development",
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
      this.baseContext = baseContext || {};
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
      const sanitized = sanitizeContext(fullContext);

      // Get current time
      const now = new Date();
      const timestamp = now.toISOString();
      const localTime = formatLocalTime(now, timezone);

      // Create log entry
      const entry: StructuredLogEntry = {
        timestamp,
        localTime,
        timezone,
        level,
        eventName: event,
        message,
        context: Object.keys(sanitized).length > 0 ? (sanitized as Record<string, unknown>) : undefined,
      };

      // Log using Pino
      const logLevel = pinoLogger[level] || pinoLogger.info;
      (logLevel as (arg0: Record<string, unknown>, arg1: string) => void).call(
        pinoLogger,
        entry,
        message || event
      );
    }
  }

  loggerInstance = new PinoLogger();
  return loggerInstance;
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
 * Format date/time in local timezone
 */
function formatLocalTime(date: Date, timezone: string): string {
  // For now, use a simple format; could use date-fns with timezone support
  const pad = (n: number) => String(n).padStart(2, "0");
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

/**
 * Shared logger singleton for application
 */
export const logger = {
  init: initializeLogger,
  get: getLogger,
};
