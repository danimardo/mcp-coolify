/**
 * Esquemas Zod para la categoría Containers
 *
 * Herramientas que acceden a los contenedores Docker del host de Coolify vía
 * SSH (no cubierto por la API REST de Coolify v4). Requiere SSH_ENABLED=true.
 */

import { z } from "zod";
import { coolifyIdSchema } from "$lib/schemas/common";

// ============================================================
// Entrada
// ============================================================

/**
 * `--since` de `docker logs`: duración relativa (`10m`, `2h`, `1d`, `30s`)
 * o timestamp ISO 8601 (`2026-08-30T00:00:00Z`). Se valida de forma estricta
 * porque el valor se interpola en el script remoto.
 */
export const dockerSinceSchema = z
  .string()
  .regex(
    /^(\d+[smhd]|\d{4}-\d{2}-\d{2}([T ][0-9:]+(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?)$/,
    "since debe ser una duración (10m, 2h, 1d) o un timestamp ISO 8601"
  )
  .describe("Filtro temporal para docker logs (--since)");

export const GetContainerLogsSchema = z
  .object({
    resource_type: z
      .enum(["application", "service", "database"])
      .describe("Tipo de recurso Coolify al que pertenece el contenedor"),
    resource_uuid: coolifyIdSchema.describe(
      "UUID Coolify del recurso (el mismo que devuelve list_applications/list_services/list_databases)"
    ),
    container: z
      .string()
      .min(1)
      .max(128)
      .regex(
        /^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/,
        "Nombre de contenedor inválido"
      )
      .optional()
      .describe(
        "Nombre exacto del contenedor. Útil cuando el recurso tiene varios (servicios multi-contenedor). Si se omite, se devuelven todos."
      ),
    tail: z
      .number()
      .int()
      .min(1, "Mínimo 1 línea")
      .max(10000, "Máximo 10000 líneas")
      .default(200)
      .describe("Número de líneas finales de log por contenedor"),
    since: dockerSinceSchema.optional(),
    timestamps: z
      .boolean()
      .default(false)
      .describe("Prefijar cada línea con timestamp RFC3339"),
  })
  .strict();

export type GetContainerLogsParams = z.infer<typeof GetContainerLogsSchema>;

// ============================================================
// Salida
// ============================================================

export const ContainerLogSchema = z.object({
  name: z.string().describe("Nombre del contenedor Docker"),
  state: z
    .string()
    .optional()
    .describe("Estado del contenedor (running, exited, ...)"),
  service: z
    .string()
    .optional()
    .describe("Nombre del servicio compose (com.docker.compose.service)"),
  lines: z.number().int().describe("Líneas de log devueltas"),
  logs: z.string().describe("Salida combinada stdout+stderr de docker logs"),
});

export const ContainerLogsResponseSchema = z.object({
  server: z
    .object({ host: z.string(), user: z.string(), port: z.number().int() })
    .describe("Host SSH consultado"),
  resource_type: z.enum(["application", "service", "database"]),
  resource_uuid: z.string(),
  matched_containers: z
    .array(z.string())
    .describe("Contenedores resueltos para el recurso"),
  containers: z.array(ContainerLogSchema),
});

export type ContainerLogsResponse = z.infer<typeof ContainerLogsResponseSchema>;
