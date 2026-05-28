/**
 * Schemas Zod para la categoría "Deployments"
 *
 * Define validación de entrada y esquemas de salida
 * para todos los tools de despliegues en Coolify.
 */

import { z } from "zod";
import { coolifyIdSchema } from "$lib/schemas/common";

// ═══════════════════════════════════════════════════════════════════
// Schemas de entrada (parámetros)
// ═══════════════════════════════════════════════════════════════════

/**
 * Lista despliegues con filtros opcionales.
 * GET /deployments?application_uuid=&status=&limit=&skip=
 */
export const ListDeploymentsSchema = z.object({
  application_uuid: coolifyIdSchema.optional()
    .describe("UUID de la aplicación para filtrar despliegues"),
  status: z.string().optional()
    .describe("Filtrar por estado (pending, running, success, failed)"),
  limit: z.number().int().min(1).max(100).default(50)
    .describe("Cantidad máxima de registros (1-100, default 50)"),
  skip: z.number().int().min(0).default(0)
    .describe("Cantidad de registros a saltar para paginación"),
}).strict();

/**
 * Obtiene un despliegue específico por UUID.
 * GET /deployments/{uuid}
 */
export const GetDeploymentSchema = z.object({
  uuid: coolifyIdSchema.describe("UUID del despliegue"),
}).strict();

/**
 * Dispara un nuevo despliegue manual.
 * GET /deploy?uuid={application_uuid}&force={bool}
 */
export const TriggerDeploymentSchema = z.object({
  application_uuid: coolifyIdSchema.describe("UUID de la aplicación a desplegar"),
  force: z.boolean().optional().describe("Forzar rebuild sin usar caché de Docker"),
}).strict();

/**
 * Cancela un despliegue en curso.
 * POST /deployments/{uuid}/cancel
 */
export const CancelDeploymentSchema = z.object({
  uuid: coolifyIdSchema.describe("UUID del despliegue a cancelar"),
}).strict();

// ═══════════════════════════════════════════════════════════════════
// Schemas de salida (respuesta)
// ═══════════════════════════════════════════════════════════════════

/**
 * Representación base de un despliegue.
 */
export const DeploymentSchema = z.object({
  uuid: z.string().uuid().describe("UUID del despliegue"),
  application_uuid: z.string().uuid().describe("UUID de la aplicación asociada"),
  status: z.enum(["pending", "running", "success", "failed"])
    .describe("Estado actual del despliegue"),
  created_at: z.string().datetime().describe("Timestamp de creación"),
  started_at: z.string().datetime().optional()
    .describe("Timestamp de inicio (si ya comenzó)"),
  completed_at: z.string().datetime().optional()
    .describe("Timestamp de finalización (si ya terminó)"),
});

/**
 * Detalle extendido de un despliegue (incluye logs y entorno).
 */
export const DeploymentDetailSchema = DeploymentSchema.extend({
  logs: z.string().describe("Logs del despliegue"),
  environment: z.string().optional()
    .describe("Entorno del despliegue (ej. production, staging)"),
});

/**
 * Lista paginada de despliegues.
 */
export const DeploymentsListSchema = z.object({
  deployments: z.array(DeploymentSchema)
    .describe("Array de despliegues"),
  total: z.number().int().min(0)
    .describe("Total de despliegues disponibles para los filtros"),
});

/**
 * Resultado de una acción sobre un despliegue (trigger/cancel).
 */
export const DeploymentActionSchema = z.object({
  uuid: z.string().uuid().describe("UUID del despliegue afectado"),
  action: z.string().describe("Acción ejecutada (ej. trigger, cancel)"),
  status: z.string().describe("Estado resultante de la acción"),
  message: z.string().optional()
    .describe("Mensaje adicional sobre la acción"),
});
