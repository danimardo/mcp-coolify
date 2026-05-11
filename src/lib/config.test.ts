/**
 * Tests for configuration management
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getConfig, resetConfig, loadConfig } from "./config";

describe("Configuration", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    resetConfig();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    resetConfig();
  });

  it("should load valid configuration", () => {
    process.env.COOLIFY_URL = "https://coolify.example.com";
    process.env.COOLIFY_TOKEN = "test-token-123";

    resetConfig();
    const config = getConfig();

    expect(config).toBeDefined();
    expect(config.coolifyUrl).toBe("https://coolify.example.com");
    expect(config.coolifyToken).toBe("test-token-123");
    expect(config.nodeEnv).toBe("development");
    expect(config.logLevel).toBe("info");
    expect(config.readOnly).toBe(false);
  });

  it("should use default values when not provided", () => {
    process.env.COOLIFY_URL = "https://coolify.example.com";
    process.env.COOLIFY_TOKEN = "test-token-123";

    resetConfig();
    const config = getConfig();

    expect(config.port).toBe(3000);
    expect(config.logLevel).toBe("info");
    expect(config.logDir).toBe(".logs");
    expect(config.logToFiles).toBe(true);
    expect(config.readOnly).toBe(false);
    expect(config.requestTimeout).toBe(30000);
    expect(config.maxRetries).toBe(3);
  });

  it("should override defaults with env vars", () => {
    process.env.COOLIFY_URL = "https://coolify.example.com";
    process.env.COOLIFY_TOKEN = "test-token-123";
    process.env.PORT = "5000";
    process.env.LOG_LEVEL = "debug";
    process.env.READ_ONLY = "true";

    resetConfig();
    const config = getConfig();

    expect(config.port).toBe(5000);
    expect(config.logLevel).toBe("debug");
    expect(config.readOnly).toBe(true);
  });

  it("should parse numeric env vars correctly", () => {
    process.env.COOLIFY_URL = "https://coolify.example.com";
    process.env.COOLIFY_TOKEN = "test-token-123";
    process.env.REQUEST_TIMEOUT = "60000";
    process.env.MAX_RETRIES = "5";

    resetConfig();
    const config = getConfig();

    expect(config.requestTimeout).toBe(60000);
    expect(config.maxRetries).toBe(5);
  });

  it("should validate LOG_LEVEL enum", () => {
    process.env.COOLIFY_URL = "https://coolify.example.com";
    process.env.COOLIFY_TOKEN = "test-token-123";
    process.env.LOG_LEVEL = "invalid";

    resetConfig();
    expect(() => getConfig()).toThrow();
  });

  it("should validate URL format", () => {
    process.env.COOLIFY_URL = "not-a-url";
    process.env.COOLIFY_TOKEN = "test-token-123";

    resetConfig();
    expect(() => getConfig()).toThrow();
  });

  it("should require COOLIFY_URL", () => {
    delete process.env.COOLIFY_URL;
    process.env.COOLIFY_TOKEN = "test-token-123";

    resetConfig();
    expect(() => getConfig()).toThrow();
  });

  it("should require COOLIFY_TOKEN", () => {
    process.env.COOLIFY_URL = "https://coolify.example.com";
    delete process.env.COOLIFY_TOKEN;

    resetConfig();
    expect(() => getConfig()).toThrow();
  });

  it("should return singleton instance", () => {
    process.env.COOLIFY_URL = "https://coolify.example.com";
    process.env.COOLIFY_TOKEN = "test-token-123";

    resetConfig();
    const config1 = getConfig();
    const config2 = getConfig();

    expect(config1).toBe(config2);
  });

  it("should validate port range", () => {
    process.env.COOLIFY_URL = "https://coolify.example.com";
    process.env.COOLIFY_TOKEN = "test-token-123";
    process.env.PORT = "99999";

    resetConfig();
    expect(() => getConfig()).toThrow();
  });

  it("should validate request timeout constraints", () => {
    process.env.COOLIFY_URL = "https://coolify.example.com";
    process.env.COOLIFY_TOKEN = "test-token-123";
    process.env.REQUEST_TIMEOUT = "500"; // Less than 1000

    resetConfig();
    expect(() => getConfig()).toThrow();
  });
});
