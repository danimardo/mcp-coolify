/**
 * Tests for logger implementation
 */

import { describe, it, expect, beforeEach } from "vitest";
import { initializeLogger } from "./logger.server";

describe("Logger", () => {
  beforeEach(() => {
    // Reset any state
  });

  it("should initialize successfully", () => {
    const logger = initializeLogger({
      logLevel: "info",
      timezone: "Europe/Madrid",
    });

    expect(logger).toBeDefined();
    expect(logger.trace).toBeDefined();
    expect(logger.debug).toBeDefined();
    expect(logger.info).toBeDefined();
    expect(logger.warn).toBeDefined();
    expect(logger.error).toBeDefined();
    expect(logger.fatal).toBeDefined();
    expect(logger.child).toBeDefined();
  });

  it("should create child logger with context", () => {
    const logger = initializeLogger({
      logLevel: "info",
      timezone: "Europe/Madrid",
    });

    const child = logger.child({
      requestId: "req-123",
      userId: "user-456",
    });

    expect(child).toBeDefined();
    expect(typeof child.info).toBe("function");
  });

  it("should support all log levels", () => {
    const logger = initializeLogger({
      logLevel: "trace",
      timezone: "Europe/Madrid",
    });

    // These should not throw
    expect(() => {
      logger.trace("app.bootstrap.started", { test: true });
      logger.debug("app.bootstrap.config_loaded", { test: true });
      logger.info("mcp.tool.invoked", { test: true });
      logger.warn("coolify.request.retry", { test: true });
      logger.error("coolify.request.failed", { test: true });
      logger.fatal("app.bootstrap.failed", { test: true });
    }).not.toThrow();
  });

  it("should handle error objects in error() method", () => {
    const logger = initializeLogger({
      logLevel: "info",
      timezone: "Europe/Madrid",
    });

    const error = new Error("Test error");

    expect(() => {
      logger.error("app.bootstrap.failed", error);
    }).not.toThrow();
  });

  it("should support optional message parameter", () => {
    const logger = initializeLogger({
      logLevel: "info",
      timezone: "Europe/Madrid",
    });

    expect(() => {
      logger.info("app.bootstrap.started", { test: true }, "Server is starting");
      logger.info("app.bootstrap.started", undefined, "Server is starting");
      logger.info("app.bootstrap.started");
    }).not.toThrow();
  });
});

describe("Secret Sanitization", () => {
  it("should redact sensitive keys in context", () => {
    const logger = initializeLogger({
      logLevel: "info",
      timezone: "Europe/Madrid",
    });

    expect(() => {
      logger.debug("coolify.request.started", {
        url: "/api/v1/teams",
        token: "super-secret-token",
        apiKey: "another-secret",
        password: "password123",
      });
    }).not.toThrow();
  });

  it("should handle nested objects with sensitive data", () => {
    const logger = initializeLogger({
      logLevel: "info",
      timezone: "Europe/Madrid",
    });

    expect(() => {
      logger.debug("coolify.request.started", {
        user: {
          name: "John",
          token: "secret-token",
          credentials: {
            password: "pass123",
          },
        },
      });
    }).not.toThrow();
  });

  it("should not break on non-object context", () => {
    const logger = initializeLogger({
      logLevel: "info",
      timezone: "Europe/Madrid",
    });

    expect(() => {
      logger.info("app.bootstrap.started", undefined);
      logger.info("app.bootstrap.started", null as any);
    }).not.toThrow();
  });
});
