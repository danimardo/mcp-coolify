/**
 * Tests for confirmation flow
 */

import { describe, it, expect, beforeEach } from "vitest";
import { ConfirmationFlow, requiresConfirmation, getConfirmationReason } from "./flow";
import { initializeLogger } from "../logging/logger.server";
import type { Logger } from "../logging/types";

describe("Confirmation Flow", () => {
  let flow: ConfirmationFlow;
  let logger: Logger;

  beforeEach(() => {
    logger = initializeLogger({
      logLevel: "info",
      timezone: "Europe/Madrid",
    });
    flow = new ConfirmationFlow(logger);
  });

  describe("requestConfirmation", () => {
    it("should return a token", () => {
      const token = flow.requestConfirmation({
        operationId: "op-123",
        operationName: "delete_team",
        parameters: { teamId: "team-123" },
        reason: "Destructive operation",
        requiredConfirmation: true,
      });

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);
    });

    it("should create different tokens for different operations", () => {
      const token1 = flow.requestConfirmation({
        operationId: "op-1",
        operationName: "delete_team",
        parameters: {},
        reason: "Test",
        requiredConfirmation: true,
      });

      const token2 = flow.requestConfirmation({
        operationId: "op-2",
        operationName: "delete_team",
        parameters: {},
        reason: "Test",
        requiredConfirmation: true,
      });

      expect(token1).not.toBe(token2);
    });
  });

  describe("verifyConfirmation", () => {
    it("should verify valid token", () => {
      const opId = "op-123";
      const token = flow.requestConfirmation({
        operationId: opId,
        operationName: "delete_team",
        parameters: {},
        reason: "Test",
        requiredConfirmation: true,
      });

      const isValid = flow.verifyConfirmation(opId, token);
      expect(isValid).toBe(true);
    });

    it("should reject invalid token", () => {
      const isValid = flow.verifyConfirmation("op-123", "invalid-token");
      expect(isValid).toBe(false);
    });

    it("should reject mismatched operation ID", () => {
      const token = flow.requestConfirmation({
        operationId: "op-1",
        operationName: "delete_team",
        parameters: {},
        reason: "Test",
        requiredConfirmation: true,
      });

      const isValid = flow.verifyConfirmation("op-2", token);
      expect(isValid).toBe(false);
    });

    it("should mark operation as confirmed after verification", () => {
      const opId = "op-123";
      const token = flow.requestConfirmation({
        operationId: opId,
        operationName: "delete_team",
        parameters: {},
        reason: "Test",
        requiredConfirmation: true,
      });

      flow.verifyConfirmation(opId, token);
      expect(flow.isConfirmed(opId)).toBe(true);
    });

    it("should consume token (prevent reuse)", () => {
      const opId = "op-123";
      const token = flow.requestConfirmation({
        operationId: opId,
        operationName: "delete_team",
        parameters: {},
        reason: "Test",
        requiredConfirmation: true,
      });

      // First verification should succeed
      expect(flow.verifyConfirmation(opId, token)).toBe(true);

      // Second verification should fail (token consumed)
      expect(flow.verifyConfirmation(opId, token)).toBe(false);
    });
  });

  describe("isConfirmed", () => {
    it("should return false for unconfirmed operations", () => {
      expect(flow.isConfirmed("op-unknown")).toBe(false);
    });

    it("should return true after confirmation", () => {
      const opId = "op-123";
      const token = flow.requestConfirmation({
        operationId: opId,
        operationName: "delete_team",
        parameters: {},
        reason: "Test",
        requiredConfirmation: true,
      });

      flow.verifyConfirmation(opId, token);
      expect(flow.isConfirmed(opId)).toBe(true);
    });
  });

  describe("clearConfirmed", () => {
    it("should clear confirmed status", () => {
      const opId = "op-123";
      const token = flow.requestConfirmation({
        operationId: opId,
        operationName: "delete_team",
        parameters: {},
        reason: "Test",
        requiredConfirmation: true,
      });

      flow.verifyConfirmation(opId, token);
      expect(flow.isConfirmed(opId)).toBe(true);

      flow.clearConfirmed(opId);
      expect(flow.isConfirmed(opId)).toBe(false);
    });
  });
});

describe("requiresConfirmation", () => {
  it("should return true for destructive operations", () => {
    expect(requiresConfirmation("delete_team")).toBe(true);
    expect(requiresConfirmation("delete_project")).toBe(true);
    expect(requiresConfirmation("delete_application")).toBe(true);
  });

  it("should return true for lifecycle operations", () => {
    expect(requiresConfirmation("start_application")).toBe(true);
    expect(requiresConfirmation("stop_application")).toBe(true);
    expect(requiresConfirmation("restart_application")).toBe(true);
  });

  it("should return true for dangerous operations", () => {
    expect(requiresConfirmation("install_docker")).toBe(true);
    expect(requiresConfirmation("cleanup_server")).toBe(true);
  });

  it("should return false for read-only operations", () => {
    expect(requiresConfirmation("list_teams")).toBe(false);
    expect(requiresConfirmation("get_team")).toBe(false);
    expect(requiresConfirmation("list_applications")).toBe(false);
  });
});

describe("getConfirmationReason", () => {
  it("should provide reason for deletion operations", () => {
    const reason = getConfirmationReason("delete_team");
    expect(reason).toContain("Destructive");
  });

  it("should provide reason for lifecycle operations", () => {
    const reason = getConfirmationReason("restart_application");
    expect(reason).toContain("application");
  });

  it("should provide generic reason for unknown operations", () => {
    const reason = getConfirmationReason("unknown_operation");
    expect(reason).toBe("Operation requires confirmation");
  });
});
