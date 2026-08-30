/**
 * Tests for configuration management
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getConfig, resetConfig } from "./config";

describe("Configuration", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    resetConfig();
    process.env = { ...originalEnv };
    vi.spyOn(process, "exit").mockImplementation((() => {
      throw new Error("process.exit called");
    }) as never);
  });

  afterEach(() => {
    process.env = originalEnv;
    resetConfig();
    vi.restoreAllMocks();
  });

  it("should load valid configuration", () => {
    process.env.NODE_ENV = "development";
    process.env.COOLIFY_BASE_URL = "https://coolify.example.com/api/v1";
    process.env.COOLIFY_TOKEN = "tr_test_token_123";

    resetConfig();
    const config = getConfig();

    expect(config).toBeDefined();
    expect(config.coolifyBaseUrl).toBe("https://coolify.example.com/api/v1");
    expect(config.coolifyToken).toBe("tr_test_token_123");
    expect(config.nodeEnv).toBe("development");
    expect(config.logLevel).toBe("info");
    expect(config.readOnly).toBe(false);
  });

  it("should use default values when not provided", () => {
    process.env.COOLIFY_BASE_URL = "https://coolify.example.com/api/v1";
    process.env.COOLIFY_TOKEN = "tr_test_token_123";

    resetConfig();
    const config = getConfig();

    expect(config.port).toBe(3000);
    expect(config.logLevel).toBe("info");
    expect(config.logDir).toBe(".logs");
    expect(config.logToFiles).toBe(true);
    expect(config.readOnly).toBe(false);
    expect(config.requestTimeout).toBe(30000);
    expect(config.maxRetries).toBe(3);
    expect(config.validateTokenOnStartup).toBe(true);
  });

  it("should override defaults with env vars", () => {
    process.env.COOLIFY_BASE_URL = "https://coolify.example.com/api/v1";
    process.env.COOLIFY_TOKEN = "tr_test_token_123";
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
    process.env.COOLIFY_BASE_URL = "https://coolify.example.com/api/v1";
    process.env.COOLIFY_TOKEN = "tr_test_token_123";
    process.env.COOLIFY_REQUEST_TIMEOUT = "60000";
    process.env.COOLIFY_MAX_RETRIES = "5";

    resetConfig();
    const config = getConfig();

    expect(config.requestTimeout).toBe(60000);
    expect(config.maxRetries).toBe(5);
  });

  it("should validate LOG_LEVEL enum", () => {
    process.env.COOLIFY_BASE_URL = "https://coolify.example.com/api/v1";
    process.env.COOLIFY_TOKEN = "tr_test_token_123";
    process.env.LOG_LEVEL = "invalid";

    resetConfig();
    expect(() => getConfig()).toThrow();
  });

  it("should validate URL format", () => {
    process.env.COOLIFY_BASE_URL = "not-a-url";
    process.env.COOLIFY_TOKEN = "tr_test_token_123";

    resetConfig();
    expect(() => getConfig()).toThrow();
  });

  it("should require COOLIFY_BASE_URL", () => {
    delete process.env.COOLIFY_BASE_URL;
    process.env.COOLIFY_TOKEN = "tr_test_token_123";

    resetConfig();
    expect(() => getConfig()).toThrow();
  });

  it("should require COOLIFY_TOKEN", () => {
    process.env.COOLIFY_BASE_URL = "https://coolify.example.com/api/v1";
    delete process.env.COOLIFY_TOKEN;

    resetConfig();
    expect(() => getConfig()).toThrow();
  });

  it("should return singleton instance", () => {
    process.env.COOLIFY_BASE_URL = "https://coolify.example.com/api/v1";
    process.env.COOLIFY_TOKEN = "tr_test_token_123";

    resetConfig();
    const config1 = getConfig();
    const config2 = getConfig();

    expect(config1).toBe(config2);
  });

  it("should validate port range", () => {
    process.env.COOLIFY_BASE_URL = "https://coolify.example.com/api/v1";
    process.env.COOLIFY_TOKEN = "tr_test_token_123";
    process.env.PORT = "99999";

    resetConfig();
    expect(() => getConfig()).toThrow();
  });

  it("should validate request timeout constraints", () => {
    process.env.COOLIFY_BASE_URL = "https://coolify.example.com/api/v1";
    process.env.COOLIFY_TOKEN = "tr_test_token_123";
    process.env.COOLIFY_REQUEST_TIMEOUT = "500"; // Less than 1000

    resetConfig();
    expect(() => getConfig()).toThrow();
  });

  it("should default SSH to disabled", () => {
    process.env.COOLIFY_BASE_URL = "https://coolify.example.com/api/v1";
    process.env.COOLIFY_TOKEN = "tr_test_token_123";

    resetConfig();
    const config = getConfig();

    expect(config.sshEnabled).toBe(false);
    expect(config.sshPort).toBe(22);
    expect(config.sshStrictHostKeyChecking).toBe("accept-new");
    expect(config.sshCommandTimeoutMs).toBe(20000);
  });

  it("should reject SSH_ENABLED=true without host/user/key", () => {
    process.env.COOLIFY_BASE_URL = "https://coolify.example.com/api/v1";
    process.env.COOLIFY_TOKEN = "tr_test_token_123";
    process.env.SSH_ENABLED = "true";

    resetConfig();
    expect(() => getConfig()).toThrow();
  });

  it("should accept a complete SSH configuration", () => {
    process.env.COOLIFY_BASE_URL = "https://coolify.example.com/api/v1";
    process.env.COOLIFY_TOKEN = "tr_test_token_123";
    process.env.SSH_ENABLED = "true";
    process.env.SSH_HOST = "coolify.example.com";
    process.env.SSH_USER = "deploy";
    process.env.SSH_PRIVATE_KEY_PATH = "/home/deploy/.ssh/id_ed25519";
    process.env.SSH_PORT = "2222";

    resetConfig();
    const config = getConfig();

    expect(config.sshEnabled).toBe(true);
    expect(config.sshHost).toBe("coolify.example.com");
    expect(config.sshUser).toBe("deploy");
    expect(config.sshPort).toBe(2222);
  });
});
