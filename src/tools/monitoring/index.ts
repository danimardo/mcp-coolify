/**
 * Monitoring Category Tools
 * Tools para monitoreo, métricas, logs y alertas en Coolify
 *
 * Categoría: Monitoring
 * Tools: list_metrics, get_metrics, get_logs, list_alerts, create_alert, update_alert, delete_alert = 6 total
 */

import type { ToolDefinition, ToolHandler } from "$lib/tools/types";
import { createBaseTool } from "$lib/tools/base-tool";
import {
  ListMetricsSchema,
  GetMetricsSchema,
  GetLogsSchema,
  ListAlertsSchema,
  CreateAlertSchema,
  UpdateAlertSchema,
  DeleteAlertSchema,
  MetricsListSchema,
  LogsListSchema,
  AlertsListSchema,
  ActionResponseSchema,
} from "./schemas";
import {
  listMetricsHandler,
  getMetricsHandler,
  getLogsHandler,
  listAlertsHandler,
  createAlertHandler,
  updateAlertHandler,
  deleteAlertHandler,
} from "./handlers";

// === list_metrics ===

export const listMetricsDefinition: ToolDefinition = {
  name: "list_metrics",
  category: "monitoring",
  description: "Listar métricas de todos los recursos",
  summary: "Devuelve métricas agregadas con filtrado por tipo de recurso y rango de tiempo",
  examples: [
    'invoke("list_metrics", {resource_type: "all", time_range: "24h"}) → {metrics: [...], total: 50}',
  ],
  parameters: {
    schema: ListMetricsSchema,
    description: "Tipo de recurso y rango de tiempo",
  },
  response: {
    schema: MetricsListSchema,
    description: "Lista de métricas",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["monitoring", "metrics", "read"],
};

export const listMetricsTool: ToolHandler = createBaseTool(
  "list_metrics",
  ListMetricsSchema,
  MetricsListSchema,
  listMetricsHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

// === get_metrics ===

export const getMetricsDefinition: ToolDefinition = {
  name: "get_metrics",
  category: "monitoring",
  description: "Obtener métricas de un recurso específico",
  summary: "Devuelve métricas detalladas de CPU, memoria, red, etc.",
  examples: [
    'invoke("get_metrics", {resource_uuid: "...", metric_type: "all", time_range: "24h"}) → {metrics: [...], resource_uuid: "..."}',
  ],
  parameters: {
    schema: GetMetricsSchema,
    description: "UUID del recurso, tipo de métrica y rango de tiempo",
  },
  response: {
    schema: MetricsListSchema,
    description: "Métricas del recurso",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["monitoring", "metrics", "read"],
};

export const getMetricsTool: ToolHandler = createBaseTool(
  "get_metrics",
  GetMetricsSchema,
  MetricsListSchema,
  getMetricsHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

// === get_logs ===

export const getLogsDefinition: ToolDefinition = {
  name: "get_logs",
  category: "monitoring",
  description: "Obtener logs de un recurso",
  summary: "Devuelve últimas líneas de logs con filtrado por nivel",
  examples: [
    'invoke("get_logs", {resource_uuid: "...", level: "all", lines: 100}) → {logs: [...], total_entries: 100}',
  ],
  parameters: {
    schema: GetLogsSchema,
    description: "UUID del recurso, nivel de log y número de líneas",
  },
  response: {
    schema: LogsListSchema,
    description: "Logs del recurso",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["monitoring", "logs", "read"],
};

export const getLogsTool: ToolHandler = createBaseTool(
  "get_logs",
  GetLogsSchema,
  LogsListSchema,
  getLogsHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

// === list_alerts ===

export const listAlertsDefinition: ToolDefinition = {
  name: "list_alerts",
  category: "monitoring",
  description: "Listar alertas configuradas",
  summary: "Devuelve lista de alertas con filtrado por estado y severidad",
  examples: [
    'invoke("list_alerts", {status: "active", severity: "all"}) → {alerts: [...], total: 10}',
  ],
  parameters: {
    schema: ListAlertsSchema,
    description: "Estado, severidad y paginación",
  },
  response: {
    schema: AlertsListSchema,
    description: "Lista de alertas",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["monitoring", "alerts", "read"],
};

export const listAlertsTool: ToolHandler = createBaseTool(
  "list_alerts",
  ListAlertsSchema,
  AlertsListSchema,
  listAlertsHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

// === create_alert ===

export const createAlertDefinition: ToolDefinition = {
  name: "create_alert",
  category: "monitoring",
  description: "Crear una nueva alerta",
  summary: "Crea una alerta para monitorear una métrica. Requiere confirmación.",
  examples: [
    'invoke("create_alert", {resource_uuid: "...", name: "High CPU", metric_type: "cpu", threshold: 80, operator: "gte"}) → {uuid: "..."}',
  ],
  parameters: {
    schema: CreateAlertSchema,
    description: "Recurso, nombre, métrica, umbral y operador",
  },
  response: {
    schema: ActionResponseSchema,
    description: "Alerta creada",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 15000,
  tags: ["monitoring", "alerts", "create", "write"],
};

export const createAlertTool: ToolHandler = createBaseTool(
  "create_alert",
  CreateAlertSchema,
  ActionResponseSchema,
  createAlertHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === update_alert ===

export const updateAlertDefinition: ToolDefinition = {
  name: "update_alert",
  category: "monitoring",
  description: "Actualizar configuración de una alerta",
  summary: "Modifica nombre, umbral o estado de la alerta. Requiere confirmación.",
  examples: [
    'invoke("update_alert", {uuid: "...", threshold: 90}) → {success: true}',
  ],
  parameters: {
    schema: UpdateAlertSchema,
    required: ["uuid"],
    description: "UUID y campos a actualizar",
  },
  response: {
    schema: ActionResponseSchema,
    description: "Alerta actualizada",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 15000,
  tags: ["monitoring", "alerts", "update", "write"],
};

export const updateAlertTool: ToolHandler = createBaseTool(
  "update_alert",
  UpdateAlertSchema,
  ActionResponseSchema,
  updateAlertHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === delete_alert ===

export const deleteAlertDefinition: ToolDefinition = {
  name: "delete_alert",
  category: "monitoring",
  description: "Eliminar una alerta",
  summary: "Elimina una alerta configurada (operación irreversible). Requiere confirmación.",
  examples: [
    'invoke("delete_alert", {uuid: "..."}) → {success: true, message: "..."}',
  ],
  parameters: {
    schema: DeleteAlertSchema,
    required: ["uuid"],
    description: "UUID de la alerta a eliminar",
  },
  response: {
    schema: ActionResponseSchema,
    description: "Confirmación de eliminación",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 15000,
  tags: ["monitoring", "alerts", "delete", "write", "destructive"],
};

export const deleteAlertTool: ToolHandler = createBaseTool(
  "delete_alert",
  DeleteAlertSchema,
  ActionResponseSchema,
  deleteAlertHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === Colección de tools ===

/**
 * Todos los tools de la categoría Monitoring (6 total)
 */
export const monitoringTools = [
  { definition: listMetricsDefinition, handler: listMetricsTool },
  { definition: getMetricsDefinition, handler: getMetricsTool },
  { definition: getLogsDefinition, handler: getLogsTool },
  { definition: listAlertsDefinition, handler: listAlertsTool },
  { definition: createAlertDefinition, handler: createAlertTool },
  { definition: updateAlertDefinition, handler: updateAlertTool },
  { definition: deleteAlertDefinition, handler: deleteAlertTool },
];
