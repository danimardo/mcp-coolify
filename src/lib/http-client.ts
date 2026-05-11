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
  private timeout: number;

  constructor(private options: HttpClientOptions) {
    this.logger = options.logger;
    this.maxRetries = options.maxRetries;
    this.timeout = options.timeout;

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
    const requestId = options?.requestId || randomUUID();
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
        lastError = error instanceof AxiosError ? error : null;

        if (!lastError) {
          throw error;
        }

        const statusCode = lastError.response?.status;
        const duration = Date.now() - startTime;

        // Check if we should retry
        if (attempt < this.maxRetries && isRetryableStatus(statusCode)) {
          const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s

          this.logger.warn("coolify.request.retry", {
            requestId,
            method,
            url,
            status: statusCode,
            attempt: attempt + 1,
            maxRetries: this.maxRetries,
            delayMs: delay,
            durationMs: duration,
          });

          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // Non-retryable or max retries exceeded
        this.logRequestError(requestId, method, url, lastError, duration, attempt);
        throw lastError;
      }
    }

    // Should not reach here, but handle just in case
    if (lastError) {
      const duration = Date.now() - startTime;
      this.logRequestError(requestId, method, url, lastError, duration, this.maxRetries);
      throw lastError;
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

  private logRequestError(
    requestId: string,
    method: string,
    url: string,
    error: AxiosError,
    duration: number,
    attempt: number
  ): void {
    const statusCode = error.response?.status;
    const errorData = error.response?.data;

    if (statusCode === 401 || statusCode === 403) {
      this.logger.error("coolify.request.failed", {
        requestId,
        method,
        url,
        status: statusCode,
        statusText: error.response?.statusText,
        durationMs: duration,
        attempt,
        reason: statusCode === 401 ? "Unauthorized" : "Forbidden",
      });
    } else if (statusCode === 404) {
      this.logger.warn("coolify.request.failed", {
        requestId,
        method,
        url,
        status: statusCode,
        statusText: error.response?.statusText,
        durationMs: duration,
        attempt,
        reason: "Not Found",
      });
    } else if (statusCode === 429) {
      this.logger.warn("coolify.request.rate_limited", {
        requestId,
        method,
        url,
        status: statusCode,
        durationMs: duration,
        attempt,
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
        data: errorData,
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
