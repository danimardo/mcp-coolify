/**
 * Esquemas Zod para la categoría Applications
 *
 * Define validación de parámetros de entrada y esquemas de respuesta
 * para todas las herramientas de aplicaciones.
 */

import { z } from "zod";
import { uuidSchema, isoDateSchema } from "$lib/schemas/common";

// ============================================================
// Esquemas de Entrada (Parámetros)
// ============================================================

/**
 * Parámetros para listar aplicaciones
 */
export const ListApplicationsSchema = z.object({
  project_uuid: uuidSchema.optional().describe("Filtrar por proyecto"),
  environment_name: z.string().optional().describe("Filtrar por entorno"),
  limit: z
    .number()
    .int()
    .min(1, "Límite mínimo es 1")
    .max(100, "Límite máximo es 100")
    .default(50)
    .describe("Cantidad de aplicaciones por página"),
  skip: z
    .number()
    .int()
    .min(0, "Skip debe ser >= 0")
    .default(0)
    .describe("Cantidad de aplicaciones a omitir"),
});

export type ListApplicationsParams = z.infer<typeof ListApplicationsSchema>;

/**
 * Parámetros para obtener una aplicación
 */
export const GetApplicationSchema = z.object({
  uuid: uuidSchema.describe("UUID de la aplicación"),
});

export type GetApplicationParams = z.infer<typeof GetApplicationSchema>;

/**
 * Parámetros para obtener logs de una aplicación
 */
export const GetApplicationLogsSchema = z.object({
  uuid: uuidSchema.describe("UUID de la aplicación"),
  lines: z
    .number()
    .int()
    .min(1, "Mínimo 1 línea")
    .max(1000, "Máximo 1000 líneas")
    .default(100)
    .describe("Número de líneas de log a recuperar"),
});

export type GetApplicationLogsParams = z.infer<typeof GetApplicationLogsSchema>;

/**
 * Parámetros para iniciar una aplicación
 */
export const StartApplicationSchema = z.object({
  uuid: uuidSchema.describe("UUID de la aplicación"),
  force: z
    .boolean()
    .default(false)
    .describe("Forzar inicio incluso si ya está corriendo"),
});

export type StartApplicationParams = z.infer<typeof StartApplicationSchema>;

/**
 * Parámetros para detener una aplicación
 */
export const StopApplicationSchema = z.object({
  uuid: uuidSchema.describe("UUID de la aplicación"),
  force: z
    .boolean()
    .default(false)
    .describe("Forzar detención incluso si ya está detenida"),
});

export type StopApplicationParams = z.infer<typeof StopApplicationSchema>;

/**
 * Parámetros para reiniciar una aplicación
 */
export const RestartApplicationSchema = z.object({
  uuid: uuidSchema.describe("UUID de la aplicación"),
  force: z
    .boolean()
    .default(false)
    .describe("Forzar reinicio sin esperar graceful shutdown"),
});

export type RestartApplicationParams = z.infer<typeof RestartApplicationSchema>;

// ============================================================
// Esquemas de Salida (Respuestas)
// ============================================================

/**
 * Esquema base de aplicación
 */
export const ApplicationSchema = z.object({
  uuid: uuidSchema.describe("UUID de la aplicación"),
  name: z.string().describe("Nombre de la aplicación"),
  description: z.string().optional().describe("Descripción de la aplicación"),
  git_repository: z.string().optional().describe("URL del repositorio Git"),
  docker_image: z.string().optional().describe("Imagen Docker"),
  status: z
    .enum(["running", "stopped", "error"])
    .describe("Estado actual de la aplicación"),
  created_at: isoDateSchema.describe("Fecha de creación"),
  updated_at: isoDateSchema.describe("Fecha de última actualización"),
});

export type Application = z.infer<typeof ApplicationSchema>;

/**
 * Esquema detallado de aplicación (extiende el base)
 */
export const ApplicationDetailSchema = ApplicationSchema.extend({
  deployments_count: z
    .number()
    .int()
    .min(0)
    .describe("Cantidad de deployments realizados"),
  environments: z
    .array(z.string())
    .describe("Entornos donde está desplegada"),
});

export type ApplicationDetail = z.infer<typeof ApplicationDetailSchema>;

/**
 * Esquema de lista de aplicaciones
 */
export const ApplicationsListSchema = z.object({
  applications: z.array(ApplicationSchema).describe("Lista de aplicaciones"),
  total: z.number().int().describe("Total de aplicaciones"),
});

export type ApplicationsList = z.infer<typeof ApplicationsListSchema>;

/**
 * Esquema de entrada de log individual
 */
const LogEntrySchema = z.object({
  timestamp: isoDateSchema.describe("Timestamp del log"),
  level: z.string().describe("Nivel del log (info, warn, error, debug)"),
  message: z.string().describe("Mensaje del log"),
});

/**
 * Esquema de logs de aplicación
 */
export const ApplicationLogsSchema = z.object({
  logs: z.array(LogEntrySchema).describe("Entradas de log"),
  total: z.number().int().describe("Total de líneas de log"),
});

export type ApplicationLogs = z.infer<typeof ApplicationLogsSchema>;

/**
 * Esquema de resultado de acción (start/stop/restart)
 */
export const ApplicationActionSchema = z.object({
  uuid: uuidSchema.describe("UUID de la aplicación"),
  action: z
    .enum(["start", "stop", "restart"])
    .describe("Acción ejecutada"),
  status: z
    .enum(["scheduled", "in_progress", "completed", "failed"])
    .describe("Estado de la acción"),
  started_at: isoDateSchema.describe("Timestamp de inicio de la acción"),
  message: z.string().optional().describe("Mensaje adicional de estado"),
});

export type ApplicationAction = z.infer<typeof ApplicationActionSchema>;
