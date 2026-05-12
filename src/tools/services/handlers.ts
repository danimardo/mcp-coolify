/**
 * Handlers para herramientas de Servicios
 * Implementan la lógica de negocio y llamadas a la API de Coolify
 * 13 operaciones: listar, obtener, crear, actualizar, eliminar, control, logs, escala, env, métricas
 */

import type { ExtendedToolContext } from "$lib/tools/types";
import type {
  ListServicesParams,
  GetServiceParams,
  CreateServiceParams,
  UpdateServiceParams,
  DeleteServiceParams,
  StartServiceParams,
  StopServiceParams,
  RestartServiceParams,
  GetServiceLogsParams,
  ScaleServiceParams,
  UpdateServiceEnvParams,
  RestartServiceContainerParams,
  GetServiceMetricsParams,
  ServicesList,
  ServiceDetail,
  ServiceLogs,
  ServiceMetrics,
} from "./schemas";

/**
 * Handler para listar servicios
 * GET /services?project_uuid=&environment_name=&limit=&skip=
 */
export async function listServicesHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<ServicesList> {
  const params = parameters as ListServicesParams;
  const queryParams: Record<string, string> = {};

  if (params.project_uuid) queryParams.project_uuid = params.project_uuid;
  if (params.environment_name) queryParams.environment_name = params.environment_name;
  if (params.limit !== undefined) queryParams.limit = String(params.limit);
  if (params.skip !== undefined) queryParams.skip = String(params.skip);

  const queryString = new URLSearchParams(queryParams).toString();
  const path = queryString ? `/services?${queryString}` : "/services";

  const response = await context.httpClient.get<any>(path, {
    requestId: context.requestId,
  });

  const services = Array.isArray(response) ? response : response.services || [];

  return {
    services: services.map((s: any) => ({
      uuid: s.uuid,
      name: s.name,
      image: s.image,
      status: s.status || "unknown",
      created_at: s.created_at || new Date().toISOString(),
    })),
    total: services.length,
  };
}

/**
 * Handler para obtener un servicio específico
 * GET /services/{uuid}
 */
export async function getServiceHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<ServiceDetail> {
  const params = parameters as GetServiceParams;

  const response = await context.httpClient.get<ServiceDetail>(
    `/services/${params.uuid}`,
    {
      requestId: context.requestId,
    }
  );

  return response;
}

/**
 * Handler para crear un servicio
 * POST /services { name, image, ... }
 */
export async function createServiceHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<any> {
  const params = parameters as CreateServiceParams;

  const response = await context.httpClient.post<any>(
    "/services",
    params,
    {
      requestId: context.requestId,
    }
  );

  return {
    uuid: response.uuid || "",
    name: response.name || "",
    image: response.image || "",
    status: response.status || "created",
    created_at: response.created_at || new Date().toISOString(),
  };
}

/**
 * Handler para actualizar un servicio
 * PATCH /services/{uuid}
 */
export async function updateServiceHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<ServiceDetail> {
  const { uuid, name, image, description } = parameters as UpdateServiceParams;

  const response = await context.httpClient.post<ServiceDetail>(
    `/services/${uuid}`,
    {
      name,
      image,
      description,
    },
    {
      requestId: context.requestId,
    }
  );

  return response;
}

/**
 * Handler para eliminar un servicio
 * DELETE /services/{uuid}
 */
export async function deleteServiceHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid } = parameters as DeleteServiceParams;

  await context.httpClient.post(`/services/${uuid}`, null, {
    requestId: context.requestId,
  });

  return {
    success: true,
    message: `Servicio ${uuid} eliminado correctamente`,
  };
}

/**
 * Handler para iniciar un servicio
 * POST /services/{uuid}/start
 */
export async function startServiceHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid } = parameters as StartServiceParams;

  await context.httpClient.post(
    `/services/${uuid}/start`,
    {},
    {
      requestId: context.requestId,
    }
  );

  return {
    success: true,
    message: `Servicio ${uuid} iniciado`,
  };
}

/**
 * Handler para detener un servicio
 * POST /services/{uuid}/stop
 */
export async function stopServiceHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid } = parameters as StopServiceParams;

  await context.httpClient.post(
    `/services/${uuid}/stop`,
    {},
    {
      requestId: context.requestId,
    }
  );

  return {
    success: true,
    message: `Servicio ${uuid} detenido`,
  };
}

/**
 * Handler para reiniciar un servicio
 * POST /services/{uuid}/restart
 */
export async function restartServiceHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid } = parameters as RestartServiceParams;

  await context.httpClient.post(
    `/services/${uuid}/restart`,
    {},
    {
      requestId: context.requestId,
    }
  );

  return {
    success: true,
    message: `Servicio ${uuid} reiniciado`,
  };
}

/**
 * Handler para obtener logs de un servicio
 * GET /services/{uuid}/logs?lines=100&follow=false
 */
export async function getServiceLogsHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<ServiceLogs> {
  const params = parameters as GetServiceLogsParams;
  const queryParams = new URLSearchParams({
    lines: String(params.lines || 100),
  });
  if (params.follow) queryParams.append("follow", String(params.follow));

  const response = await context.httpClient.get<any>(
    `/services/${params.uuid}/logs?${queryParams.toString()}`,
    {
      requestId: context.requestId,
    }
  );

  const logs = Array.isArray(response) ? response : response.logs || [];

  return {
    uuid: params.uuid,
    logs: logs.map((l: any) => ({
      timestamp: l.timestamp || new Date().toISOString(),
      message: l.message || String(l),
      level: l.level,
    })),
    total_lines: logs.length,
  };
}

/**
 * Handler para escalar un servicio
 * POST /services/{uuid}/scale { replicas }
 */
export async function scaleServiceHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid, replicas } = parameters as ScaleServiceParams;

  const response = await context.httpClient.post(
    `/services/${uuid}/scale`,
    { replicas },
    {
      requestId: context.requestId,
    }
  );

  return {
    success: true,
    message: `Servicio escalado a ${replicas} réplicas`,
    result: response,
  };
}

/**
 * Handler para actualizar variables de entorno
 * POST /services/{uuid}/env
 */
export async function updateServiceEnvHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid, variables } = parameters as UpdateServiceEnvParams;

  const response = await context.httpClient.post(
    `/services/${uuid}/env`,
    { variables },
    {
      requestId: context.requestId,
    }
  );

  return {
    success: true,
    message: "Variables de entorno actualizadas",
    result: response,
  };
}

/**
 * Handler para reiniciar un contenedor específico
 * POST /services/{uuid}/containers/restart
 */
export async function restartServiceContainerHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid, container_id } = parameters as RestartServiceContainerParams;

  const response = await context.httpClient.post(
    `/services/${uuid}/containers/restart`,
    { container_id },
    {
      requestId: context.requestId,
    }
  );

  return {
    success: true,
    message: "Contenedor reiniciado",
    result: response,
  };
}

/**
 * Handler para obtener métricas de un servicio
 * GET /services/{uuid}/metrics?metric_type=all
 */
export async function getServiceMetricsHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<ServiceMetrics> {
  const params = parameters as GetServiceMetricsParams;

  const response = await context.httpClient.get<any>(
    `/services/${params.uuid}/metrics?metric_type=${params.metric_type || "all"}`,
    {
      requestId: context.requestId,
    }
  );

  return {
    uuid: params.uuid,
    cpu_percent: response.cpu_percent,
    memory_bytes: response.memory_bytes,
    network_in: response.network_in,
    network_out: response.network_out,
    disk_used: response.disk_used,
    timestamp: response.timestamp || new Date().toISOString(),
  };
}
