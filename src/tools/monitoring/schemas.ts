/**
 * Zod schemas para herramientas de Monitoreo
 * 6 herramientas para visualización y alertas: métricas, logs, alertas, dashboards
 */

import { z } from "zod";

// ============================================================
// PARÁMETROS
// ============================================================

export const ListMetricsSchema = z.object({
  resource_type: z.enum(["application", "service", "database", "server", "all"]).default("all").describe("Tipo de recurso"),
  time_range: z.enum(["1h", "6h", "24h", "7d", "30d"]).default("24h").describe("Rango de tiempo"),
  limit: z.number().int().min(1).max(100).default(50).describe("Elementos por página"),
}).strict();

export const GetMetricsSchema = z.object({
  resource_uuid: z.string().uuid().describe("UUID del recurso"),
  metric_type: z.enum(["cpu", "memory", "disk", "network", "http", "all"]).default("all").describe("Tipo de métrica"),
  time_range: z.enum(["1h", "6h", "24h", "7d", "30d"]).default("24h").describe("Rango de tiempo"),
}).strict();

export const GetLogsSchema = z.object({
  resource_uuid: z.string().uuid().describe("UUID del recurso"),
  level: z.enum(["debug", "info", "warn", "error", "all"]).default("all").describe("Nivel de log"),
  lines: z.number().int().min(1).max(1000).default(100).describe("Número de líneas"),
}).strict();

export const ListAlertsSchema = z.object({
  status: z.enum(["active", "resolved", "all"]).default("all").describe("Estado de alerta"),
  severity: z.enum(["critical", "high", "medium", "low", "all"]).default("all").describe("Severidad"),
  limit: z.number().int().min(1).max(100).default(50).describe("Elementos por página"),
}).strict();

export const CreateAlertSchema = z.object({
  resource_uuid: z.string().uuid().describe("UUID del recurso"),
  name: z.string().min(1).describe("Nombre de la alerta"),
  metric_type: z.string().min(1).describe("Tipo de métrica a monitorear"),
  threshold: z.number().describe("Valor de umbral"),
  operator: z.enum(["gt", "gte", "lt", "lte", "eq"]).describe("Operador de comparación"),
  enabled: z.boolean().default(true).optional().describe("Habilitar alerta"),
}).strict();

export const UpdateAlertSchema = z.object({
  uuid: z.string().uuid().describe("UUID de la alerta"),
  name: z.string().min(1).optional().describe("Nuevo nombre"),
  threshold: z.number().optional().describe("Nuevo umbral"),
  enabled: z.boolean().optional().describe("Habilitar/deshabilitar"),
}).strict();

export const DeleteAlertSchema = z.object({
  uuid: z.string().uuid().describe("UUID de la alerta"),
}).strict();

// ============================================================
// RESPUESTAS
// ============================================================

export const MetricSchema = z.object({
  name: z.string(),
  value: z.number(),
  unit: z.string(),
  timestamp: z.string().datetime(),
}).strict();

export const MetricsListSchema = z.object({
  metrics: z.array(MetricSchema),
  resource_uuid: z.string(),
  time_range: z.string(),
  total: z.number().int(),
}).strict();

export const LogEntrySchema = z.object({
  timestamp: z.string().datetime(),
  level: z.string(),
  message: z.string(),
  source: z.string().optional(),
}).strict();

export const LogsListSchema = z.object({
  logs: z.array(LogEntrySchema),
  resource_uuid: z.string(),
  total_entries: z.number().int(),
}).strict();

export const AlertSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  resource_uuid: z.string(),
  metric_type: z.string(),
  threshold: z.number(),
  operator: z.string(),
  status: z.string(),
  severity: z.string(),
  created_at: z.string().datetime(),
}).strict();

export const AlertsListSchema = z.object({
  alerts: z.array(AlertSchema),
  total: z.number().int(),
}).strict();

export const ActionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
}).strict();

// ============================================================
// TIPOS INFERIDOS
// ============================================================

export type ListMetricsParams = z.infer<typeof ListMetricsSchema>;
export type GetMetricsParams = z.infer<typeof GetMetricsSchema>;
export type GetLogsParams = z.infer<typeof GetLogsSchema>;
export type ListAlertsParams = z.infer<typeof ListAlertsSchema>;
export type CreateAlertParams = z.infer<typeof CreateAlertSchema>;
export type UpdateAlertParams = z.infer<typeof UpdateAlertSchema>;
export type DeleteAlertParams = z.infer<typeof DeleteAlertSchema>;

export type Metric = z.infer<typeof MetricSchema>;
export type MetricsList = z.infer<typeof MetricsListSchema>;
export type LogEntry = z.infer<typeof LogEntrySchema>;
export type LogsList = z.infer<typeof LogsListSchema>;
export type Alert = z.infer<typeof AlertSchema>;
export type AlertsList = z.infer<typeof AlertsListSchema>;
export type ActionResponse = z.infer<typeof ActionResponseSchema>;
