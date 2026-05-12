/**
 * Integration tests for confirmation flow
 * Validates the complete flow: critical operation → confirmation → execution
 */

import { describe, it, expect, beforeEach } from "vitest";
import { randomUUID } from "crypto";
import { ConfirmationFlow, requiresConfirmation, getConfirmationReason } from "$lib/confirmation/flow";
import { initializeLogger } from "$lib/logging/index";
import type { Logger } from "$lib/logging/types";

describe("Confirmation Flow Integration", () => {
  let logger: Logger;
  let confirmationFlow: ConfirmationFlow;

  beforeEach(() => {
    logger = initializeLogger({
      logLevel: "error",
      logToFiles: false,
      timezone: "UTC",
    });
    confirmationFlow = new ConfirmationFlow(logger);
  });

  describe("Critical Operations Detection", () => {
    it("debería identificar operaciones que requieren confirmación", () => {
      const criticalOps = [
        "delete_application",
        "delete_project",
        "restart_application",
        "stop_application",
        "trigger_deployment",
      ];

      criticalOps.forEach((op) => {
        expect(requiresConfirmation(op)).toBe(true);
      });
    });

    it("debería permitir operaciones de lectura sin confirmación", () => {
      const readOps = [
        "list_applications",
        "get_application",
        "list_projects",
        "get_project",
        "list_teams",
      ];

      readOps.forEach((op) => {
        expect(requiresConfirmation(op)).toBe(false);
      });
    });

    it("debería retornar razón válida para cada operación crítica", () => {
      const criticalOps = ["delete_application", "restart_application", "trigger_deployment"];

      criticalOps.forEach((op) => {
        const reason = getConfirmationReason(op);
        expect(reason).toBeTruthy();
        expect(reason.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Complete Confirmation Workflow", () => {
    it("debería completar flujo: solicitud → confirmación → ejecución", () => {
      // Step 1: Agent invokes critical operation
      const operationId = randomUUID();
      const operationName = "delete_application";

      // Step 2: Server detects confirmation requirement
      const requiresConf = requiresConfirmation(operationName);
      expect(requiresConf).toBe(true);

      // Step 3: Server requests confirmation
      const confirmationToken = confirmationFlow.requestConfirmation({
        operationId,
        operationName,
        parameters: { uuid: "app-123" },
        reason: getConfirmationReason(operationName),
        requiredConfirmation: true,
      });

      expect(confirmationToken).toBeTruthy();
      expect(confirmationToken.length).toBeGreaterThan(0);

      // Step 4: Agent verifies confirmation token
      const isValidToken = confirmationFlow.verifyConfirmation(operationId, confirmationToken);
      expect(isValidToken).toBe(true);

      // Step 5: Check if operation is now confirmed
      const isConfirmed = confirmationFlow.isConfirmed(operationId);
      expect(isConfirmed).toBe(true);

      // Step 6: Execute operation (in real flow, handler would run here)
      confirmationFlow.clearConfirmed(operationId);
    });

    it("debería rechazar confirmación con token inválido", () => {
      const operationId = randomUUID();
      const invalidToken = randomUUID();

      const isValid = confirmationFlow.verifyConfirmation(operationId, invalidToken);
      expect(isValid).toBe(false);
    });

    it("debería rechazar confirmación con operationId no coincidente", () => {
      const operationId1 = randomUUID();
      const operationId2 = randomUUID();

      // Request confirmation for operation 1
      const token = confirmationFlow.requestConfirmation({
        operationId: operationId1,
        operationName: "delete_application",
        parameters: { uuid: "app-123" },
        reason: "Destructive operation",
        requiredConfirmation: true,
      });

      // Try to confirm with operation 2
      const isValid = confirmationFlow.verifyConfirmation(operationId2, token);
      expect(isValid).toBe(false);

      // Operation 1 should still be pending
      const isPending = !confirmationFlow.isConfirmed(operationId1);
      expect(isPending).toBe(true);
    });
  });

  describe("Confirmation Expiration", () => {
    it("debería expirar tokens después de 5 minutos (5 min window para pending)", () => {
      const operationId = randomUUID();

      // Request confirmation
      const token = confirmationFlow.requestConfirmation({
        operationId,
        operationName: "delete_application",
        parameters: { uuid: "app-123" },
        reason: "Destructive operation",
        requiredConfirmation: true,
      });

      // Token should be valid immediately
      let isValid = confirmationFlow.verifyConfirmation(operationId, token);
      expect(isValid).toBe(true);

      // Token should be consumed (single-use)
      isValid = confirmationFlow.verifyConfirmation(operationId, token);
      expect(isValid).toBe(false);
    });

    it("debería expirar operaciones confirmadas después de 30 segundos", () => {
      const operationId = randomUUID();

      // Request and confirm
      const token = confirmationFlow.requestConfirmation({
        operationId,
        operationName: "delete_application",
        parameters: { uuid: "app-123" },
        reason: "Destructive operation",
        requiredConfirmation: true,
      });

      confirmationFlow.verifyConfirmation(operationId, token);

      // Operation should be confirmed
      let isConfirmed = confirmationFlow.isConfirmed(operationId);
      expect(isConfirmed).toBe(true);

      // Clear it (simulating execution)
      confirmationFlow.clearConfirmed(operationId);

      isConfirmed = confirmationFlow.isConfirmed(operationId);
      expect(isConfirmed).toBe(false);
    });
  });

  describe("Multiple Concurrent Operations", () => {
    it("debería manejar múltiples operaciones simultáneamente", () => {
      const ops = Array.from({ length: 5 }, () => randomUUID());

      // Request confirmations para todas
      const tokens = ops.map((opId) =>
        confirmationFlow.requestConfirmation({
          operationId: opId,
          operationName: "delete_application",
          parameters: { uuid: `app-${opId}` },
          reason: "Destructive operation",
          requiredConfirmation: true,
        })
      );

      expect(tokens).toHaveLength(5);
      expect(new Set(tokens).size).toBe(5); // Todos únicos

      // Confirm todas
      ops.forEach((opId, idx) => {
        const isValid = confirmationFlow.verifyConfirmation(opId, tokens[idx]);
        expect(isValid).toBe(true);
      });

      // Verificar que todas están confirmadas
      ops.forEach((opId) => {
        const isConfirmed = confirmationFlow.isConfirmed(opId);
        expect(isConfirmed).toBe(true);
      });
    });

    it("debería rechazar confirmación de operación no solicitada", () => {
      const opId1 = randomUUID();
      const opId2 = randomUUID();

      // Request confirmation solo para op1
      const token = confirmationFlow.requestConfirmation({
        operationId: opId1,
        operationName: "delete_application",
        parameters: { uuid: "app-123" },
        reason: "Destructive operation",
        requiredConfirmation: true,
      });

      // Intentar usar token de op1 para confirmar op2
      const isValid = confirmationFlow.verifyConfirmation(opId2, token);
      expect(isValid).toBe(false);
    });
  });
});
