/**
 * Handlers para herramientas de Servidores
 * Implementan las llamadas HTTP a la API de Coolify
 */

import type { ExtendedToolContext } from "$lib/tools/types";
import type {
  GetServerParams,
  CreateServerParams,
  UpdateServerParams,
  DeleteServerParams,
  ValidateServerParams,
  GetServerResourcesParams,
  GetServerDomainsParams,
  ServersList,
  ServerDetail,
  CreateServerResponse,
  UpdateServerResponse,
  DeleteServerResponse,
  ValidateServerResponse,
  ServerResources,
  ServerDomainsList,
} from "./schemas";

/**
 * List all servers
 * GET /servers
 */
export async function listServersHandler(
  _parameters: unknown,
  context: ExtendedToolContext
): Promise<ServersList> {

  const response = await context.httpClient.get<any>(`/servers`, {
    requestId: context.requestId,
  });

  // Estructura respuesta si es necesario
  const servers = Array.isArray(response) ? response : response.servers || [];

  return {
    servers: servers.map((s: any) => ({
      uuid: s.uuid,
      name: s.name,
      ip: s.ip,
      status: s.status || "connected",
      created_at: s.created_at || new Date().toISOString(),
    })),
    total: servers.length,
  };
}

/**
 * Get server by UUID
 * GET /servers/{uuid}
 */
export async function getServerHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<ServerDetail> {
  const { uuid } = parameters as GetServerParams;

  const response = await context.httpClient.get<any>(`/servers/${uuid}`, {
    requestId: context.requestId,
  });

  return {
    uuid: response.uuid,
    name: response.name,
    ip: response.ip,
    status: response.status || "connected",
    os: response.os,
    docker_version: response.docker_version,
    port: response.port,
    user: response.user,
  };
}

/**
 * Create new server
 * POST /servers
 */
export async function createServerHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<CreateServerResponse> {
  const { name, ip, port, user } = parameters as CreateServerParams;

  const response = await context.httpClient.post<any>(
    `/servers`,
    {
      name,
      ip,
      port,
      user,
    },
    {
      requestId: context.requestId,
    }
  );

  return {
    uuid: response.uuid,
    name: response.name,
    ip: response.ip,
    status: response.status || "pending",
  };
}

/**
 * Update server
 * PATCH /servers/{uuid}
 */
export async function updateServerHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<UpdateServerResponse> {
  const { uuid, name, ip } = parameters as UpdateServerParams;

  const response = await context.httpClient.post<any>(
    `/servers/${uuid}`,
    {
      name,
      ip,
    },
    {
      requestId: context.requestId,
    }
  );

  return {
    uuid: response.uuid,
    name: response.name,
    ip: response.ip,
    status: response.status || "connected",
  };
}

/**
 * Delete server
 * DELETE /servers/{uuid}
 */
export async function deleteServerHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<DeleteServerResponse> {
  const { uuid } = parameters as DeleteServerParams;

  await context.httpClient.post<any>(`/servers/${uuid}`, null, {
    requestId: context.requestId,
  });

  return {
    success: true,
    message: `Servidor ${uuid} eliminado correctamente`,
  };
}

/**
 * Validate server connectivity
 * GET /servers/{uuid}/validate
 */
export async function validateServerHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<ValidateServerResponse> {
  const { uuid } = parameters as ValidateServerParams;

  const response = await context.httpClient.get<any>(
    `/servers/${uuid}/validate`,
    {
      requestId: context.requestId,
    }
  );

  return {
    status: response.status || "ok",
    message: response.message || "Servidor validado correctamente",
    details: response.details,
  };
}

/**
 * Get server resources (CPU, RAM, disk)
 * GET /servers/{uuid}/resources
 */
export async function getServerResourcesHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<ServerResources> {
  const { uuid } = parameters as GetServerResourcesParams;

  const response = await context.httpClient.get<any>(
    `/servers/${uuid}/resources`,
    {
      requestId: context.requestId,
    }
  );

  return {
    cpu_usage_percent: response.cpu_usage_percent || 0,
    memory_usage_percent: response.memory_usage_percent || 0,
    disk_usage_percent: response.disk_usage_percent || 0,
    disk_free_gb: response.disk_free_gb || 0,
    uptime_hours: response.uptime_hours || 0,
  };
}

/**
 * Get server domains
 * GET /servers/{uuid}/domains
 */
export async function getServerDomainsHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<ServerDomainsList> {
  const { uuid } = parameters as GetServerDomainsParams;

  const response = await context.httpClient.get<any>(
    `/servers/${uuid}/domains`,
    {
      requestId: context.requestId,
    }
  );

  const domains = Array.isArray(response) ? response : response.domains || [];

  return {
    domains: domains.map((d: any) => ({
      domain: d.domain,
      application_uuid: d.application_uuid,
      certificate_status: d.certificate_status,
    })),
    total: domains.length,
  };
}
