/**
 * Error response formatting
 * Converts errors to standardized MCP response format
 */

import { Logger } from "../logging/types";
import {
  CoolifyError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ServerError,
  TimeoutError,
} from "./error-types";
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
    const level = error.statusCode >= 500 ? "error" as const : "warn" as const;

    if (level === "error") {
      logger.error("coolify.request.failed", {
        requestId: context.requestId,
        operation: context.operation,
        toolName: context.toolName,
        errorCode: error.errorCode,
        message: error.message,
        statusCode: error.statusCode,
      });
    } else {
      logger.warn("coolify.request.failed", {
        requestId: context.requestId,
        operation: context.operation,
        toolName: context.toolName,
        errorCode: error.errorCode,
        message: error.message,
        statusCode: error.statusCode,
      });
    }
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
      return new ValidationError(message, responseData as Record<string, string>);

    case 401:
      return new UnauthorizedError(message);

    case 403:
      return new ForbiddenError(message);

    case 404:
      return new NotFoundError(message);

    case 409:
      return new ConflictError(message, responseData);

    case 429:
      return new RateLimitError(message);

    case 500:
      return new ServerError(message, responseData);

    case 502:
    case 503:
      return new ServerError(message, responseData);

    case 504:
      return new TimeoutError(message);

    default:
      return new ServerError(
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
