/**
 * Custom error types for MCP Coolify
 * Each error type maps to a specific HTTP status and MCP response
 */

import { ErrorResponse } from "../schemas/common";

/**
 * Base error class for all MCP Coolify errors
 */
export abstract class CoolifyError extends Error {
  abstract statusCode: number;
  abstract errorCode: string;
  abstract hint?: string;
  abstract details?: unknown;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toResponse(): ErrorResponse {
    return {
      error: this.errorCode,
      message: this.message,
      details: this.details,
      hint: this.hint,
    };
  }
}

/**
 * Validation error (400 Bad Request)
 * Thrown when tool parameters fail Zod validation
 */
export class ValidationError extends CoolifyError {
  statusCode = 400;
  errorCode = "VALIDATION_ERROR";
  hint = "Check tool parameter types and constraints";

  constructor(
    message: string,
    public details?: Record<string, string>
  ) {
    super(message);
  }
}

/**
 * Not found error (404)
 * Thrown when a requested resource doesn't exist
 */
export class NotFoundError extends CoolifyError {
  statusCode = 404;
  errorCode = "NOT_FOUND";

  constructor(
    message: string,
    public resourceType?: string,
    public resourceId?: string
  ) {
    super(message);
  }

  get hint(): string {
    if (this.resourceType && this.resourceId) {
      return `${this.resourceType} "${this.resourceId}" does not exist`;
    }
    return "The requested resource was not found";
  }
}

/**
 * Unauthorized error (401)
 * Thrown when authentication fails or token is invalid
 */
export class UnauthorizedError extends CoolifyError {
  statusCode = 401;
  errorCode = "UNAUTHORIZED";
  hint = "Check COOLIFY_TOKEN is valid and not expired";

  constructor(message: string) {
    super(message);
  }
}

/**
 * Forbidden error (403)
 * Thrown when user lacks permission for operation
 */
export class ForbiddenError extends CoolifyError {
  statusCode = 403;
  errorCode = "FORBIDDEN";
  hint = "Check that your API token has permission for this operation";

  constructor(message: string) {
    super(message);
  }
}

/**
 * Conflict error (409)
 * Thrown when operation conflicts with existing state
 */
export class ConflictError extends CoolifyError {
  statusCode = 409;
  errorCode = "CONFLICT";

  constructor(message: string, public details?: unknown) {
    super(message);
  }
}

/**
 * Rate limit error (429)
 * Thrown when Coolify API rate limit is exceeded
 */
export class RateLimitError extends CoolifyError {
  statusCode = 429;
  errorCode = "RATE_LIMIT_EXCEEDED";
  hint = "Please wait before retrying this operation";

  constructor(
    message: string,
    public retryAfter?: number
  ) {
    super(message);
  }
}

/**
 * READ_ONLY mode error
 * Thrown when attempting destructive operation in READ_ONLY mode
 */
export class ReadOnlyError extends CoolifyError {
  statusCode = 403;
  errorCode = "READ_ONLY_MODE";
  hint = "Server is in READ_ONLY mode. Destructive operations are blocked.";

  constructor(
    message: string,
    public operation?: string
  ) {
    super(message);
  }
}

/**
 * Confirmation required error
 * Thrown when critical operation requires explicit confirmation
 */
export class ConfirmationRequiredError extends CoolifyError {
  statusCode = 200; // Special case: not really an error, but requires flow change
  errorCode = "CONFIRMATION_REQUIRED";

  constructor(
    message: string,
    public confirmationToken?: string,
    public details?: unknown
  ) {
    super(message);
  }
}

/**
 * Server error (500)
 * Generic server error from Coolify API
 */
export class ServerError extends CoolifyError {
  statusCode = 500;
  errorCode = "SERVER_ERROR";
  hint = "Coolify API returned an unexpected error. Check Coolify server status.";

  constructor(
    message: string,
    public details?: unknown
  ) {
    super(message);
  }
}

/**
 * Timeout error
 * Thrown when request exceeds timeout
 */
export class TimeoutError extends CoolifyError {
  statusCode = 504;
  errorCode = "REQUEST_TIMEOUT";
  hint = "Request took too long. Try again or use shorter timeout.";

  constructor(message: string) {
    super(message);
  }
}

/**
 * Network error
 * Thrown when network call fails (connection refused, etc.)
 */
export class NetworkError extends CoolifyError {
  statusCode = 503;
  errorCode = "NETWORK_ERROR";
  hint = "Cannot reach Coolify server. Check COOLIFY_URL and network connectivity.";

  constructor(
    message: string,
    public originalError?: Error
  ) {
    super(message);
  }
}

/**
 * Response validation error
 * Thrown when Coolify API response doesn't match expected schema
 */
export class ResponseValidationError extends CoolifyError {
  statusCode = 502;
  errorCode = "INVALID_API_RESPONSE";
  hint = "Coolify API returned unexpected response format. Check Coolify version.";

  constructor(
    message: string,
    public details?: unknown
  ) {
    super(message);
  }
}
