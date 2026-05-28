/**
 * Confirmation Tool - Permite al agente confirmar operaciones críticas
 *
 * Flujo:
 * 1. Agente invoca operación crítica (ej: delete_application)
 * 2. Servidor devuelve { requiresConfirmation: true, operationId, confirmationToken }
 * 3. Agente invoca confirm_operation con ambos valores
 * 4. Servidor verifica token, ejecuta la operación original y devuelve el resultado
 */

import { z } from "zod";
import type { ExtendedToolContext } from "$lib/tools/types";
import type { ToolDefinition, ToolHandler } from "$lib/tools/types";
import { createBaseTool } from "$lib/tools/base-tool";

const ConfirmOperationSchema = z.object({
  operationId: z.string().uuid().describe("ID único de la operación a confirmar"),
  confirmationToken: z.string().uuid().describe("Token de confirmación recibido del servidor"),
});

type ConfirmOperationParams = z.infer<typeof ConfirmOperationSchema>;

const ConfirmationSuccessSchema = z.object({
  success: z.literal(true),
  operationId: z.string().uuid(),
  message: z.string(),
  result: z.unknown(),
});

const ConfirmationErrorSchema = z.object({
  success: z.literal(false),
  operationId: z.string().uuid(),
  message: z.string(),
  reason: z.enum(["invalid_token", "expired_token", "operation_not_found", "operation_failed"]),
  result: z.unknown().optional(),
});

const ConfirmOperationResponseSchema = z.union([
  ConfirmationSuccessSchema,
  ConfirmationErrorSchema,
]);

/**
 * Handler para confirmar y ejecutar una operación crítica
 */
export async function confirmOperationHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<z.infer<typeof ConfirmOperationResponseSchema>> {
  const { operationId, confirmationToken } = parameters as ConfirmOperationParams;

  const resultPromise = context.confirmationFlow.executeConfirmed(operationId, confirmationToken);

  if (resultPromise === null) {
    return {
      success: false,
      operationId,
      message: "Token inválido o expirado. La operación no se pudo ejecutar.",
      reason: "invalid_token",
    };
  }

  const result = await resultPromise;

  // La operación interna (envuelta por createBaseTool) captura sus propios
  // errores y devuelve { success: false }. Si falló, propagamos el fallo al
  // nivel superior en lugar de informar éxito sobre un error real.
  if (isFailedToolResult(result)) {
    return {
      success: false,
      operationId,
      message: "La operación se confirmó pero falló durante su ejecución.",
      reason: "operation_failed",
      result,
    };
  }

  return {
    success: true,
    operationId,
    message: "Operación confirmada y ejecutada exitosamente.",
    result,
  };
}

/**
 * Detecta si el resultado de la operación confirmada representa un fallo.
 * Los handlers envueltos con createBaseTool devuelven { success: false } al fallar.
 */
function isFailedToolResult(result: unknown): boolean {
  return (
    typeof result === "object" &&
    result !== null &&
    (result as { success?: unknown }).success === false
  );
}

export const confirmOperationDefinition: ToolDefinition = {
  name: "confirm_operation",
  category: "confirmation",
  description: "Confirma y ejecuta una operación crítica que requiere confirmación explícita",
  summary:
    "Envía el token de confirmación para autorizar y ejecutar una operación crítica. Devuelve el resultado de la operación.",
  examples: [
    'invoke("confirm_operation", {operationId: "550e8400-...", confirmationToken: "abc123..."}) → {success: true, result: {...}}',
  ],
  parameters: {
    schema: ConfirmOperationSchema,
    description: "operationId y confirmationToken recibidos de la operación crítica",
    required: ["operationId", "confirmationToken"],
  },
  response: {
    schema: ConfirmOperationResponseSchema,
    description: "Resultado de la confirmación y ejecución",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 30000,
  tags: ["confirmation", "critical", "security"],
};

export const confirmOperationTool: ToolHandler = createBaseTool(
  "confirm_operation",
  ConfirmOperationSchema,
  ConfirmOperationResponseSchema,
  confirmOperationHandler,
  { requiresConfirmation: false, readOnlyBlocks: false }
);

export const confirmationTools = [
  { definition: confirmOperationDefinition, handler: confirmOperationTool },
];
