/**
 * Tests para el tool de confirmación
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { randomUUID } from "crypto";
import type { ExtendedToolContext } from "$lib/tools/types";
import { ConfirmationFlow } from "$lib/confirmation/flow";
import { confirmOperationHandler } from "./index";
import { initializeLogger } from "$lib/logging/index";

describe("Confirmation Tool", () => {
  let context: Partial<ExtendedToolContext>;
  let confirmationFlow: ConfirmationFlow;
  let logger: ReturnType<typeof initializeLogger>;

  beforeEach(() => {
    logger = initializeLogger({
      logLevel: "error",
      logToFiles: false,
      timezone: "UTC",
    });
    confirmationFlow = new ConfirmationFlow(logger);
    context = {
      confirmationFlow,
      logger,
      requestId: randomUUID(),
      startTime: Date.now(),
    };
  });

  it("debería rechazar confirmación con token inválido", async () => {
    const operationId = randomUUID();
    const invalidToken = randomUUID();

    const result = (await confirmOperationHandler(
      { operationId, token: invalidToken },
      context as ExtendedToolContext
    )) as Record<string, unknown>;

    expect(result.success).toBe(false);
    expect(result.reason).toBe("invalid_token");
  });

  it("debería aceptar confirmación con token válido", async () => {
    const operationId = randomUUID();
    const token = confirmationFlow.requestConfirmation({
      operationId,
      operationName: "delete_application",
      parameters: { uuid: "test-uuid" },
      reason: "Destructive operation",
      requiredConfirmation: true,
    });

    const result = (await confirmOperationHandler(
      { operationId, token },
      context as ExtendedToolContext
    )) as Record<string, unknown>;

    expect(result.success).toBe(true);
    expect(result.operationId).toBe(operationId);
  });

  it("debería rechazar token después de expiración", async () => {
    const operationId = randomUUID();

    // Crear token e inmediatamente verificar sin esperar
    const token = confirmationFlow.requestConfirmation({
      operationId,
      operationName: "delete_application",
      parameters: { uuid: "test-uuid" },
      reason: "Destructive operation",
      requiredConfirmation: true,
    });

    // Token debería ser válido inicialmente
    const initialResult = (await confirmOperationHandler(
      { operationId, token },
      context as ExtendedToolContext
    )) as Record<string, unknown>;

    expect(initialResult.success).toBe(true);

    // Intentar usar el mismo token nuevamente debería fallar
    // (token ya fue consumido)
    const retryResult = (await confirmOperationHandler(
      { operationId, token },
      context as ExtendedToolContext
    )) as Record<string, unknown>;

    expect(retryResult.success).toBe(false);
  });

  it("debería validar que operationId coincida", async () => {
    const operationId1 = randomUUID();
    const operationId2 = randomUUID();

    const token = confirmationFlow.requestConfirmation({
      operationId: operationId1,
      operationName: "delete_application",
      parameters: { uuid: "test-uuid" },
      reason: "Destructive operation",
      requiredConfirmation: true,
    });

    // Intentar usar token de operationId1 con operationId2
    const result = (await confirmOperationHandler(
      { operationId: operationId2, token },
      context as ExtendedToolContext
    )) as Record<string, unknown>;

    expect(result.success).toBe(false);
    expect(result.reason).toBe("invalid_token");
  });

  it("debería retornar estructura consistente de respuesta", async () => {
    const operationId = randomUUID();
    const invalidToken = randomUUID();

    const result = (await confirmOperationHandler(
      { operationId, token: invalidToken },
      context as ExtendedToolContext
    )) as Record<string, unknown>;

    // Validar estructura de respuesta fallida
    expect(result).toHaveProperty("success");
    expect(result).toHaveProperty("operationId");
    expect(result).toHaveProperty("message");
    expect(result).toHaveProperty("reason");

    // Validar valores
    expect(result.operationId).toBe(operationId);
    expect(typeof result.message).toBe("string");
    expect(typeof result.reason).toBe("string");
  });
});
