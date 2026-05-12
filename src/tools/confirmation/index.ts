/**
 * Confirmation Tool - Permite al agente confirmar operaciones críticas
 *
 * Flujo:
 * 1. Agente invoca operación crítica (ej: delete_application)
 * 2. Servidor devuelve { requiresConfirmation: true, operationId, token }
 * 3. Agente invoca confirm_operation con token
 * 4. Servidor verifica token y ejecuta operación original
 */

import { z } from "zod";
import type { ExtendedToolContext } from "$lib/tools/types";
import type { ToolDefinition, ToolHandler } from "$lib/tools/types";
import { createBaseTool } from "$lib/tools/base-tool";

// Schema para confirmar una operación
const ConfirmOperationSchema = z.object({
  operationId: z.string().uuid().describe("ID único de la operación a confirmar"),
  token: z.string().uuid().describe("Token de confirmación recibido del servidor"),
});

type ConfirmOperationParams = z.infer<typeof ConfirmOperationSchema>;

// Respuesta de confirmación exitosa
const ConfirmationSuccessSchema = z.object({
  success: z.literal(true),
  operationId: z.string().uuid(),
  message: z.string(),
});

// Respuesta de confirmación fallida
const ConfirmationErrorSchema = z.object({
  success: z.literal(false),
  operationId: z.string().uuid(),
  message: z.string(),
  reason: z.enum(["invalid_token", "expired_token", "operation_not_found"]),
});

const ConfirmOperationResponseSchema = z.union([
  ConfirmationSuccessSchema,
  ConfirmationErrorSchema,
]);

/**
 * Handler para confirmar una operación crítica
 */
function confirmOperationHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<z.infer<typeof ConfirmOperationResponseSchema>> {
  const params = parameters as ConfirmOperationParams;

  const isValid = context.confirmationFlow.verifyConfirmation(
    params.operationId,
    params.token
  );

  if (isValid) {
    return Promise.resolve({
      success: true,
      operationId: params.operationId,
      message: "Confirmación aceptada. La operación se ejecutará.",
    });
  } else {
    return Promise.resolve({
      success: false,
      operationId: params.operationId,
      message: "Confirmación rechazada",
      reason: "invalid_token",
    });
  }
}

/**
 * Definición del tool confirm_operation
 */
export const confirmOperationDefinition: ToolDefinition = {
  name: "confirm_operation",
  category: "confirmation",
  description: "Confirma una operación crítica que requiere confirmación explícita",
  summary:
    "Envía un token de confirmación para autorizar una operación crítica (delete, restart, etc)",
  examples: [
    'invoke("confirm_operation", {operationId: "550e8400-e29b-41d4-a716-446655440000", token: "abc123..."}) → {success: true}',
  ],
  parameters: {
    schema: ConfirmOperationSchema,
    description:
      "operationId y token recibidos cuando se intentó la operación crítica",
    required: ["operationId", "token"],
  },
  response: {
    schema: ConfirmOperationResponseSchema,
    description: "Resultado de la confirmación",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 5000,
  tags: ["confirmation", "critical", "security"],
};

/**
 * Handler MCP para confirm_operation
 */
export const confirmOperationTool: ToolHandler = createBaseTool(
  "confirm_operation",
  ConfirmOperationSchema,
  ConfirmOperationResponseSchema,
  confirmOperationHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

/**
 * Exportar como tool entry para registro
 */
export const confirmationTools = [
  { definition: confirmOperationDefinition, handler: confirmOperationTool },
];
