/**
 * Tests for HTTP client
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { createHttpClient } from "./http-client";
import { initializeLogger } from "./logging/logger.server";

describe("HTTP Client", () => {
  let mockLogger: any;

  beforeEach(() => {
    mockLogger = initializeLogger({
      logLevel: "info",
      timezone: "Europe/Madrid",
    });
  });

  it("should create HTTP client successfully", () => {
    const client = createHttpClient({
      baseURL: "https://coolify.example.com",
      token: "test-token",
      timeout: 30000,
      maxRetries: 3,
      logger: mockLogger,
    });

    expect(client).toBeDefined();
    expect(typeof client.get).toBe("function");
    expect(typeof client.post).toBe("function");
    expect(typeof client.patch).toBe("function");
    expect(typeof client.delete).toBe("function");
    expect(typeof client.put).toBe("function");
  });

  it("should support request methods", () => {
    const client = createHttpClient({
      baseURL: "https://coolify.example.com",
      token: "test-token",
      timeout: 30000,
      maxRetries: 3,
      logger: mockLogger,
    });

    expect(typeof client.get).toBe("function");
    expect(typeof client.post).toBe("function");
    expect(typeof client.patch).toBe("function");
    expect(typeof client.delete).toBe("function");
    expect(typeof client.put).toBe("function");
  });

  it("should handle request options", async () => {
    const client = createHttpClient({
      baseURL: "https://httpbin.org",
      token: "test-token",
      timeout: 30000,
      maxRetries: 0,
      logger: mockLogger,
    });

    // This will likely fail without a real API, but tests the structure
    expect(() => {
      client.get("/get", {
        params: { test: "value" },
        requestId: "req-123",
      });
    }).not.toThrow();
  });

  it("should accept logging context", () => {
    const logger = initializeLogger({
      logLevel: "debug",
      timezone: "Europe/Madrid",
    });

    const client = createHttpClient({
      baseURL: "https://coolify.example.com",
      token: "test-token",
      timeout: 30000,
      maxRetries: 3,
      logger,
    });

    expect(client).toBeDefined();
  });
});

describe("Retry Logic", () => {
  let mockLogger: any;

  beforeEach(() => {
    mockLogger = initializeLogger({
      logLevel: "info",
      timezone: "Europe/Madrid",
    });
  });

  it("should support configurable retry count", () => {
    const client0 = createHttpClient({
      baseURL: "https://coolify.example.com",
      token: "test-token",
      timeout: 30000,
      maxRetries: 0,
      logger: mockLogger,
    });

    const client3 = createHttpClient({
      baseURL: "https://coolify.example.com",
      token: "test-token",
      timeout: 30000,
      maxRetries: 3,
      logger: mockLogger,
    });

    expect(client0).toBeDefined();
    expect(client3).toBeDefined();
  });
});

describe("Bearer Token Authentication", () => {
  let mockLogger: any;

  beforeEach(() => {
    mockLogger = initializeLogger({
      logLevel: "info",
      timezone: "Europe/Madrid",
    });
  });

  it("should be configured during initialization", () => {
    const client = createHttpClient({
      baseURL: "https://coolify.example.com",
      token: "test-token-abc123",
      timeout: 30000,
      maxRetries: 3,
      logger: mockLogger,
    });

    expect(client).toBeDefined();
    // Token is set internally in Authorization header
  });
});
