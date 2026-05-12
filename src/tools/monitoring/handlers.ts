/**
 * Handlers para herramientas de Monitoreo
 * Implementan la lógica de negocio y llamadas a la API de Coolify
 * 6 operaciones: listar métricas, obtener métricas, obtener logs, listar alertas, crear/actualizar/eliminar alertas
 */

import type { ExtendedToolContext } from "$lib/tools/types";
import type {
  ListMetricsParams,
  GetMetricsParams,
  GetLogsParams,
  ListAlertsParams,
  CreateAlertParams,
  UpdateAlertParams,
  DeleteAlertParams,
  MetricsList,
  LogsList,
  AlertsList,
} from "./schemas";

/**
 * Handler para listar métricas
 * GET /monitoring/metrics?resource_type=all&time_range=24h
 */
export async function listMetricsHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<MetricsList> {
  const params = parameters as ListMetricsParams;

  const queryParams = new URLSearchParams({
    resource_type: params.resource_type || "all",
    time_range: params.time_range || "24h",
    limit: String(params.limit || 50),
  });

  const response = await context.httpClient.get<any>(
    `/monitoring/metrics?${queryParams.toString()}`,
    {
      requestId: context.requestId,
    }
  );

  const metrics = Array.isArray(response) ? response : response.metrics || [];

  return {
    metrics: metrics.map((m: any) => ({
      name: m.name,
      value: m.value,
      unit: m.unit || "",
      timestamp: m.timestamp || new Date().toISOString(),
    })),
    resource_uuid: response.resource_uuid || "",
    time_range: params.time_range || "24h",
    total: metrics.length,
  };
}

/**
 * Handler para obtener métricas de un recurso específico
 * GET /monitoring/metrics/{resource_uuid}?metric_type=all&time_range=24h
 */
export async function getMetricsHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<MetricsList> {
  const params = parameters as GetMetricsParams;

  const queryParams = new URLSearchParams({
    metric_type: params.metric_type || "all",
    time_range: params.time_range || "24h",
  });

  const response = await context.httpClient.get<any>(
    `/monitoring/metrics/${params.resource_uuid}?${queryParams.toString()}`,
    {
      requestId: context.requestId,
    }
  );

  const metrics = Array.isArray(response) ? response : response.metrics || [];

  return {
    metrics: metrics.map((m: any) => ({
      name: m.name,
      value: m.value,
      unit: m.unit || "",
      timestamp: m.timestamp || new Date().toISOString(),
    })),
    resource_uuid: params.resource_uuid,
    time_range: params.time_range || "24h",
    total: metrics.length,
  };
}

/**
 * Handler para obtener logs de un recurso
 * GET /monitoring/logs/{resource_uuid}?level=all&lines=100
 */
export async function getLogsHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<LogsList> {
  const params = parameters as GetLogsParams;

  const queryParams = new URLSearchParams({
    level: params.level || "all",
    lines: String(params.lines || 100),
  });

  const response = await context.httpClient.get<any>(
    `/monitoring/logs/${params.resource_uuid}?${queryParams.toString()}`,
    {
      requestId: context.requestId,
    }
  );

  const logs = Array.isArray(response) ? response : response.logs || [];

  return {
    logs: logs.map((l: any) => ({
      timestamp: l.timestamp || new Date().toISOString(),
      level: l.level || "info",
      message: l.message || "",
      source: l.source,
    })),
    resource_uuid: params.resource_uuid,
    total_entries: logs.length,
  };
}

/**
 * Handler para listar alertas
 * GET /monitoring/alerts?status=all&severity=all
 */
export async function listAlertsHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<AlertsList> {
  const params = parameters as ListAlertsParams;

  const queryParams = new URLSearchParams({
    status: params.status || "all",
    severity: params.severity || "all",
    limit: String(params.limit || 50),
  });

  const response = await context.httpClient.get<any>(
    `/monitoring/alerts?${queryParams.toString()}`,
    {
      requestId: context.requestId,
    }
  );

  const alerts = Array.isArray(response) ? response : response.alerts || [];

  return {
    alerts: alerts.map((a: any) => ({
      uuid: a.uuid,
      name: a.name,
      resource_uuid: a.resource_uuid,
      metric_type: a.metric_type,
      threshold: a.threshold,
      operator: a.operator,
      status: a.status || "active",
      severity: a.severity || "medium",
      created_at: a.created_at || new Date().toISOString(),
    })),
    total: alerts.length,
  };
}

/**
 * Handler para crear una alerta
 * POST /monitoring/alerts { name, resource_uuid, metric_type, threshold, operator }
 */
export async function createAlertHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<any> {
  const params = parameters as CreateAlertParams;

  const response = await context.httpClient.post<any>(
    "/monitoring/alerts",
    params,
    {
      requestId: context.requestId,
    }
  );

  return {
    uuid: response.uuid || "",
    name: response.name || "",
    resource_uuid: response.resource_uuid || "",
    metric_type: response.metric_type || "",
    threshold: response.threshold || 0,
    operator: response.operator || "",
    status: response.status || "active",
    severity: response.severity || "medium",
    created_at: response.created_at || new Date().toISOString(),
  };
}

/**
 * Handler para actualizar una alerta
 * PATCH /monitoring/alerts/{uuid}
 */
export async function updateAlertHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<any> {
  const { uuid, name, threshold, enabled } = parameters as UpdateAlertParams;

  const response = await context.httpClient.post<any>(
    `/monitoring/alerts/${uuid}`,
    {
      name,
      threshold,
      enabled,
    },
    {
      requestId: context.requestId,
    }
  );

  return {
    success: true,
    message: "Alerta actualizada correctamente",
    result: response,
  };
}

/**
 * Handler para eliminar una alerta
 * DELETE /monitoring/alerts/{uuid}
 */
export async function deleteAlertHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<any> {
  const { uuid } = parameters as DeleteAlertParams;

  await context.httpClient.post(`/monitoring/alerts/${uuid}`, null, {
    requestId: context.requestId,
  });

  return {
    success: true,
    message: `Alerta ${uuid} eliminada correctamente`,
  };
}
