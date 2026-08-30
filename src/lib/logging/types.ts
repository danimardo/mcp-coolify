/**
 * Logging type definitions and interfaces
 * Defines the contract for all logging in MCP Coolify
 */

export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

/**
 * Stable event names following domain.category.event pattern
 * Used for structured logging and monitoring
 */
export type EventName =
  // Bootstrap events
  | "app.bootstrap.started"
  | "app.bootstrap.config_loaded"
  | "app.bootstrap.token_validated"
  | "app.bootstrap.token_validation_failed"
  | "app.bootstrap.token_validation_skipped"
  | "app.bootstrap.server_initialized"
  | "app.bootstrap.completed"
  | "app.bootstrap.failed"

  // Tool invocation events
  | "mcp.tool.invoked"
  | "mcp.tool.parameters_invalid"
  | "mcp.tool.completed"
  | "mcp.tool.failed"

  // Coolify API request events
  | "coolify.request.started"
  | "coolify.request.completed"
  | "coolify.request.retry"
  | "coolify.request.failed"
  | "coolify.request.rate_limited"
  | "coolify.request.not_found"
  | "coolify.request.forbidden"
  | "coolify.auth.failed"
  | "coolify.rate_limit.exceeded"

  // Confirmation flow events
  | "operation.confirmation.requested"
  | "operation.confirmed"
  | "operation.cancelled"
  | "operation.confirmation.expired"
  | "operation.confirmation_failed"

  // Safety events
  | "read_only.blocked_operation"
  | "auth.token_invalid"
  | "auth.unauthorized"
  | "auth.forbidden"

  // SSH / container-logs events
  | "ssh.command.started"
  | "ssh.command.completed"
  | "ssh.command.failed"
  | "ssh.disabled"

  // Response validation
  | "response.validation_failed"
  | "response.validation_passed"

  // Registry events
  | "tool.registered"
  | "mcp.tools.registered"

  // Error events
  | "error.unexpected"
  | "error.non_error_thrown"

  // Shutdown events
  | "app.shutdown.requested";

/**
 * Structured log entry - what gets written to logs
 */
export interface StructuredLogEntry {
  timestamp: string; // ISO 8601
  localTime: string; // "DD/MM/YYYY HH:mm:ss"
  timezone: string;
  level: LogLevel;
  eventName: EventName;
  message?: string;
  context?: Record<string, unknown>;
  requestId?: string;
  error?: {
    message: string;
    code?: string;
    stack?: string;
  };
}

/**
 * Logger interface - public API
 */
export interface Logger {
  trace(event: EventName, context?: Record<string, unknown>, message?: string): void;
  debug(event: EventName, context?: Record<string, unknown>, message?: string): void;
  info(event: EventName, context?: Record<string, unknown>, message?: string): void;
  warn(event: EventName, context?: Record<string, unknown>, message?: string): void;
  error(
    event: EventName,
    context?: Record<string, unknown> | Error,
    message?: string
  ): void;
  fatal(
    event: EventName,
    context?: Record<string, unknown> | Error,
    message?: string
  ): void;

  child(context: Record<string, unknown>): Logger;
}

/**
 * Tool execution context containing logger instance
 */
export interface ToolContext {
  requestId: string;
  logger: Logger;
  startTime: number; // milliseconds
}
