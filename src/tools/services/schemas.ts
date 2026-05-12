/**
 * Zod schemas para herramientas de Servicios
 * 13 herramientas para gestión de servicios: listar, obtener, crear, actualizar, eliminar, controlar, logs, métricas
 */

import { z } from "zod";
import { uuidSchema } from "$lib/schemas/common";

// ============================================================
// PARÁMETROS
// ============================================================

export const ListServicesSchema = z.object({
  project_uuid: uuidSchema.optional().describe("Filtrar por proyecto"),
  environment_name: z.string().optional().describe("Filtrar por ambiente"),
  limit: z.number().int().min(1).max(100).default(50).describe("Elementos por página"),
  skip: z.number().int().min(0).default(0).describe("Offset"),
}).strict();

export const GetServiceSchema = z.object({
  uuid: z.string().uuid("UUID válido requerido").describe("UUID del servicio"),
}).strict();

export const CreateServiceSchema = z.object({
  project_uuid: z.string().uuid().describe("UUID del proyecto"),
  environment_name: z.string().min(1).describe("Nombre del ambiente"),
  name: z.string().min(1).describe("Nombre del servicio"),
  image: z.string().min(1).describe("Imagen Docker"),
  description: z.string().optional().describe("Descripción"),
}).strict();

export const UpdateServiceSchema = z.object({
  uuid: z.string().uuid().describe("UUID del servicio"),
  name: z.string().min(1).optional().describe("Nuevo nombre"),
  image: z.string().min(1).optional().describe("Nueva imagen"),
  description: z.string().optional().describe("Nueva descripción"),
}).strict();

export const DeleteServiceSchema = z.object({
  uuid: z.string().uuid().describe("UUID del servicio"),
}).strict();

export const StartServiceSchema = z.object({
  uuid: z.string().uuid().describe("UUID del servicio"),
}).strict();

export const StopServiceSchema = z.object({
  uuid: z.string().uuid().describe("UUID del servicio"),
}).strict();

export const RestartServiceSchema = z.object({
  uuid: z.string().uuid().describe("UUID del servicio"),
}).strict();

export const GetServiceLogsSchema = z.object({
  uuid: z.string().uuid().describe("UUID del servicio"),
  lines: z.number().int().min(1).max(1000).default(100).describe("Número de líneas"),
  follow: z.boolean().optional().describe("Seguir logs en tiempo real"),
}).strict();

export const ScaleServiceSchema = z.object({
  uuid: z.string().uuid().describe("UUID del servicio"),
  replicas: z.number().int().min(1).max(100).describe("Número de réplicas"),
}).strict();

export const UpdateServiceEnvSchema = z.object({
  uuid: z.string().uuid().describe("UUID del servicio"),
  variables: z.record(z.string()).describe("Variables de entorno"),
}).strict();

export const RestartServiceContainerSchema = z.object({
  uuid: z.string().uuid().describe("UUID del servicio"),
  container_id: z.string().optional().describe("ID específico del contenedor"),
}).strict();

export const GetServiceMetricsSchema = z.object({
  uuid: z.string().uuid().describe("UUID del servicio"),
  metric_type: z.enum(["cpu", "memory", "network", "disk", "all"]).default("all").describe("Tipo de métrica"),
}).strict();

// ============================================================
// RESPUESTAS
// ============================================================

export const ServiceSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  image: z.string(),
  status: z.string(),
  created_at: z.string().datetime(),
}).strict();

export const ServiceDetailSchema = ServiceSchema.extend({
  description: z.string().optional(),
  replicas: z.number().int().optional(),
  cpu_limit: z.string().optional(),
  memory_limit: z.string().optional(),
  environment: z.record(z.string()).optional(),
}).strict();

export const ServicesListSchema = z.object({
  services: z.array(ServiceSchema),
  total: z.number().int(),
}).strict();

export const ServiceLogsSchema = z.object({
  uuid: z.string(),
  logs: z.array(z.object({
    timestamp: z.string(),
    message: z.string(),
    level: z.string().optional(),
  })),
  total_lines: z.number().int(),
}).strict();

export const ServiceMetricsSchema = z.object({
  uuid: z.string(),
  cpu_percent: z.number().optional(),
  memory_bytes: z.number().optional(),
  network_in: z.number().optional(),
  network_out: z.number().optional(),
  disk_used: z.number().optional(),
  timestamp: z.string().datetime(),
}).strict();

export const ActionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
}).strict();

export const CreateServiceResponseSchema = ServiceSchema;

// ============================================================
// TIPOS INFERIDOS
// ============================================================

export type ListServicesParams = z.infer<typeof ListServicesSchema>;
export type GetServiceParams = z.infer<typeof GetServiceSchema>;
export type CreateServiceParams = z.infer<typeof CreateServiceSchema>;
export type UpdateServiceParams = z.infer<typeof UpdateServiceSchema>;
export type DeleteServiceParams = z.infer<typeof DeleteServiceSchema>;
export type StartServiceParams = z.infer<typeof StartServiceSchema>;
export type StopServiceParams = z.infer<typeof StopServiceSchema>;
export type RestartServiceParams = z.infer<typeof RestartServiceSchema>;
export type GetServiceLogsParams = z.infer<typeof GetServiceLogsSchema>;
export type ScaleServiceParams = z.infer<typeof ScaleServiceSchema>;
export type UpdateServiceEnvParams = z.infer<typeof UpdateServiceEnvSchema>;
export type RestartServiceContainerParams = z.infer<typeof RestartServiceContainerSchema>;
export type GetServiceMetricsParams = z.infer<typeof GetServiceMetricsSchema>;

export type Service = z.infer<typeof ServiceSchema>;
export type ServiceDetail = z.infer<typeof ServiceDetailSchema>;
export type ServicesList = z.infer<typeof ServicesListSchema>;
export type ServiceLogs = z.infer<typeof ServiceLogsSchema>;
export type ServiceMetrics = z.infer<typeof ServiceMetricsSchema>;
export type ActionResponse = z.infer<typeof ActionResponseSchema>;
