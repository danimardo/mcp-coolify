/**
 * HTTP Client for Coolify API
 * Features:
 * - Bearer token authentication
 * - Exponential backoff retry logic (1s, 2s, 4s)
 * - Request logging with coolify.request.* events
 * - Request timeout (30s default)
 * - UUID v4 request ID correlation
 */

import axios, { AxiosInstance, AxiosError } from "axios";
import { randomUUID } from "crypto";
import { Logger } from "./logging/types";
import { statusCodeToError } from "./errors/response-formatter";
import { CoolifyError, NetworkError, TimeoutError } from "./errors/error-types";

export interface HttpClientOptions {
  baseURL: string;
  token: string;
  timeout: number;
  maxRetries: number;
  logger: Logger;
}

export interface HttpRequestOptions {
  method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
  url: string;
  data?: unknown;
  params?: Record<string, unknown>;
}

/**
 * Status codes that warrant retry
 */
const RETRYABLE_STATUS_CODES = [429, 500, 502, 503, 504];

/**
 * Create configured HTTP client for Coolify API
 */
export function createHttpClient(options: HttpClientOptions): HttpClientInstance {
  return new HttpClientInstance(options);
}

class HttpClientInstance {
  private axiosClient: AxiosInstance;
  private logger: Logger;
  private maxRetries: number;

  constructor(options: HttpClientOptions) {
    this.logger = options.logger;
    this.maxRetries = options.maxRetries;

    // Create Axios instance with base configuration
    this.axiosClient = axios.create({
      baseURL: options.baseURL,
      timeout: options.timeout,
      headers: {
        "Authorization": `Bearer ${options.token}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "MCP-Coolify/1.0",
      },
    });
  }

  /**
   * Make HTTP request with automatic retry on transient errors
   */
  async request<T = unknown>(
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT",
    url: string,
    options?: {
      data?: unknown;
      params?: Record<string, unknown>;
      requestId?: string;
    }
  ): Promise<T> {
    const requestId = options?.requestId ?? randomUUID();
    const startTime = Date.now();

    this.logger.debug("coolify.request.started", {
      requestId,
      method,
      url,
      paramsCount: options?.params ? Object.keys(options.params).length : 0,
    });

    let lastError: AxiosError | null = null;

    // Retry loop with exponential backoff
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.axiosClient.request<T>({
          method,
          url,
          data: options?.data,
          params: options?.params,
        });

        const duration = Date.now() - startTime;
        this.logger.debug("coolify.request.completed", {
          requestId,
          method,
          url,
          status: response.status,
          durationMs: duration,
          attempt,
        });

        return response.data;
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Axios error type
        lastError = error instanceof AxiosError ? error : null;

        if (!lastError) {
          throw error;
        }

        const statusCode = lastError.response?.status;
        const duration = Date.now() - startTime;

        // Check if we should retry
        if (attempt < this.maxRetries && isRetryableStatus(statusCode)) {
          // Calculate delay: respect Retry-After header for 429, otherwise exponential backoff
          let delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s default

          if (statusCode === 429 && lastError.response?.headers) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Axios headers are typed as any
            const retryAfterHeader: string | number | undefined = (lastError.response.headers as Record<string, unknown>)["retry-after"] as string | number | undefined;
            if (typeof retryAfterHeader === "string") {
              // Retry-After can be in seconds or HTTP-date format
              const retryAfterNum = Number(retryAfterHeader);
              const retryAfterMs = isNaN(retryAfterNum)
                ? new Date(retryAfterHeader).getTime() - Date.now()
                : retryAfterNum * 1000;

              if (retryAfterMs > 0) {
                delay = retryAfterMs;
              }
            }
          }

          this.logger.warn("coolify.request.retry", {
            requestId,
            method,
            url,
            status: statusCode,
            attempt: attempt + 1,
            maxRetries: this.maxRetries,
            delayMs: delay,
            durationMs: duration,
            retryAfterHeader: statusCode === 429 ? lastError.response?.headers["retry-after"] : undefined,
          });

          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // Non-retryable or max retries exceeded
        this.logRequestError(requestId, method, url, lastError, duration, attempt);
        throw this.toCoolifyError(lastError);
      }
    }

    // Should not reach here, but handle just in case
    if (lastError) {
      const duration = Date.now() - startTime;
      this.logRequestError(requestId, method, url, lastError, duration, this.maxRetries);
      throw this.toCoolifyError(lastError);
    }

    throw new Error("Unexpected: No error to throw");
  }

  /**
   * GET request
   */
  async get<T = unknown>(
    url: string,
    options?: {
      params?: Record<string, unknown>;
      requestId?: string;
    }
  ): Promise<T> {
    return this.request<T>("GET", url, options);
  }

  /**
   * POST request
   */
  async post<T = unknown>(
    url: string,
    data: unknown,
    options?: {
      params?: Record<string, unknown>;
      requestId?: string;
    }
  ): Promise<T> {
    return this.request<T>("POST", url, {
      data,
      ...options,
    });
  }

  /**
   * PATCH request
   */
  async patch<T = unknown>(
    url: string,
    data: unknown,
    options?: {
      params?: Record<string, unknown>;
      requestId?: string;
    }
  ): Promise<T> {
    return this.request<T>("PATCH", url, {
      data,
      ...options,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(
    url: string,
    options?: {
      params?: Record<string, unknown>;
      requestId?: string;
    }
  ): Promise<T> {
    return this.request<T>("DELETE", url, options);
  }

  /**
   * PUT request
   */
  async put<T = unknown>(
    url: string,
    data: unknown,
    options?: {
      params?: Record<string, unknown>;
      requestId?: string;
    }
  ): Promise<T> {
    return this.request<T>("PUT", url, {
      data,
      ...options,
    });
  }

  /**
   * Convert an AxiosError into a typed CoolifyError, preserving the Coolify
   * response body in `details` so the MCP client receives the real cause
   * instead of a generic UNKNOWN_ERROR.
   */
  private toCoolifyError(error: AxiosError): CoolifyError {
    if (error.response) {
      const data: unknown = error.response.data;
      const message = extractCoolifyMessage(data) ?? error.message;
      const coolifyError = statusCodeToError(error.response.status, message, data);
      if (coolifyError.details === undefined && data !== undefined && data !== "") {
        coolifyError.details = data;
      }
      return coolifyError;
    }

    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return new TimeoutError(error.message);
    }

    return new NetworkError(error.message, error);
  }

  private logRequestError(
    requestId: string,
    method: string,
    url: string,
    error: AxiosError,
    duration: number,
    attempt: number
  ): void {
    const statusCode = error.response?.status;
    const coolifyMessage = extractCoolifyMessage(error.response?.data);

    // Log specific error types with appropriate levels and event names
    if (statusCode === 401) {
      this.logger.error("coolify.auth.failed", {
        requestId,
        method,
        url,
        status: statusCode,
        statusText: error.response?.statusText,
        durationMs: duration,
        attempt,
        reason: "Unauthorized - Token invalid or expired",
      });
    } else if (statusCode === 403) {
      this.logger.error("coolify.request.forbidden", {
        requestId,
        method,
        url,
        status: statusCode,
        statusText: error.response?.statusText,
        durationMs: duration,
        attempt,
        reason: "Forbidden - Insufficient permissions",
        coolifyMessage,
      });
    } else if (statusCode === 404) {
      this.logger.warn("coolify.request.not_found", {
        requestId,
        method,
        url,
        status: statusCode,
        statusText: error.response?.statusText,
        durationMs: duration,
        attempt,
        coolifyMessage,
      });
    } else if (statusCode === 429) {
      this.logger.warn("coolify.rate_limit.exceeded", {
        requestId,
        method,
        url,
        status: statusCode,
        durationMs: duration,
        attempt,
        retryAfter: error.response?.headers["retry-after"],
      });
    } else {
      this.logger.error("coolify.request.failed", {
        requestId,
        method,
        url,
        status: statusCode,
        statusText: error.response?.statusText,
        durationMs: duration,
        attempt,
        message: error.message,
        coolifyMessage,
      });
    }
  }
}

/**
 * Determine if HTTP status code is retryable
 */
function isRetryableStatus(statusCode: number | undefined): boolean {
  if (!statusCode) return false;
  return RETRYABLE_STATUS_CODES.includes(statusCode);
}

/**
 * Extract a human-readable message from a Coolify API error body.
 * Coolify typically returns { message: "..." } or { error: "..." }.
 */
function extractCoolifyMessage(data: unknown): string | undefined {
  if (data && typeof data === "object") {
    const body = data as Record<string, unknown>;
    if (typeof body.message === "string" && body.message.length > 0) {
      return body.message;
    }
    if (typeof body.error === "string" && body.error.length > 0) {
      return body.error;
    }
  }
  return undefined;
}
