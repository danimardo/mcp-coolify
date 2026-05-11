/**
 * Error response formatting
 * Converts errors to standardized MCP response format
 */

import { Logger } from "../logging/types";
import { CoolifyError } from "./error-types";
import { ErrorResponse } from "../schemas/common";

/**
 * Format error response for MCP
 */
export function formatErrorResponse(
  error: unknown,
  logger: Logger,
  requestId?: string
): ErrorResponse {
  let response: ErrorResponse;

  if (error instanceof CoolifyError) {
    response = error.toResponse();
  } else if (error instanceof Error) {
    // Unknown error
    response = {
      error: "UNKNOWN_ERROR",
      message: error.message || "An unexpected error occurred",
      hint: "Check server logs for more information",
    };

    // Log this unexpected error
    logger.error("error.unexpected", {
      requestId,
      errorName: error.constructor.name,
      message: error.message,
      stack: error.stack,
    });
  } else {
    // Non-Error object thrown
    response = {
      error: "UNKNOWN_ERROR",
      message: "An unexpected error occurred",
      hint: "Check server logs for more information",
    };

    logger.error("error.non_error_thrown", {
      requestId,
      value: error,
    });
  }

  // Add requestId if available
  if (requestId) {
    response.requestId = requestId;
  }

  return response;
}

/**
 * Log error with appropriate level based on error type
 */
export function logError(
  error: unknown,
  logger: Logger,
  context: {
    requestId?: string;
    operation?: string;
    toolName?: string;
  }
): void {
  if (error instanceof CoolifyError) {
    const level = error.statusCode >= 500 ? "error" : "warn";
    const method = level === "error" ? logger.error : logger.warn;

    method("coolify.request.failed", {
      requestId: context.requestId,
      operation: context.operation,
      toolName: context.toolName,
      errorCode: error.errorCode,
      message: error.message,
      statusCode: error.statusCode,
    });
  } else if (error instanceof Error) {
    logger.error("error.unexpected", {
      requestId: context.requestId,
      operation: context.operation,
      toolName: context.toolName,
      message: error.message,
      stack: error.stack,
    });
  }
}

/**
 * Convert HTTP status code to appropriate error
 */
export function statusCodeToError(
  statusCode: number,
  message: string,
  responseData?: unknown
): CoolifyError {
  switch (statusCode) {
    case 400:
      return new (require("./error-types")).ValidationError(message, responseData);

    case 401:
      return new (require("./error-types")).UnauthorizedError(message);

    case 403:
      return new (require("./error-types")).ForbiddenError(message);

    case 404:
      return new (require("./error-types")).NotFoundError(message);

    case 409:
      return new (require("./error-types")).ConflictError(message, responseData);

    case 429:
      return new (require("./error-types")).RateLimitError(message);

    case 500:
      return new (require("./error-types")).ServerError(message, responseData);

    case 502:
    case 503:
      return new (require("./error-types")).ServerError(message, responseData);

    case 504:
      return new (require("./error-types")).TimeoutError(message);

    default:
      return new (require("./error-types")).ServerError(
        `HTTP ${statusCode}: ${message}`,
        responseData
      );
  }
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (!(error instanceof CoolifyError)) {
    return false;
  }

  // Retry on 429, 502, 503, 504
  const retryableStatuses = [429, 502, 503, 504];
  return retryableStatuses.includes(error.statusCode);
}
