/**
 * Handlers para herramientas de Servidores
 */

import type { ExtendedToolContext } from "$lib/tools/types";
import {
  extractArray,
  asRecord,
  asString,
  asStringOpt,
  asNumberOpt,
  asIsoDate,
} from "$lib/tools/response-helpers";
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

/** GET /servers */
export async function listServersHandler(
  _parameters: unknown,
  context: ExtendedToolContext
): Promise<ServersList> {
  const response = await context.httpClient.get<unknown>(`/servers`, {
    requestId: context.requestId,
  });

  const servers = extractArray(response, "servers");

  const validStatus = new Set(["connected", "disconnected", "pending"]);
  return {
    servers: servers.map((s) => {
      const raw = asString(s.status, "connected");
      const status = validStatus.has(raw) ? raw as "connected" | "disconnected" | "pending" : "connected";
      return { uuid: asString(s.uuid), name: asString(s.name), ip: asString(s.ip), status, created_at: asIsoDate(s.created_at) };
    }),
    total: servers.length,
  };
}

/** GET /servers/{uuid} */
export async function getServerHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<ServerDetail> {
  const { uuid } = parameters as GetServerParams;

  const response = await context.httpClient.get<unknown>(`/servers/${uuid}`, {
    requestId: context.requestId,
  });

  const s = asRecord(response);
  const validStatus = new Set(["connected", "disconnected", "pending"]);
  const rawStatus = asString(s.status, "connected");
  const status = validStatus.has(rawStatus) ? rawStatus as "connected" | "disconnected" | "pending" : "connected";
  return {
    uuid: asString(s.uuid),
    name: asString(s.name),
    ip: asString(s.ip),
    status,
    os: asStringOpt(s.os),
    docker_version: asStringOpt(s.docker_version),
    port: asNumberOpt(s.port),
    user: asStringOpt(s.user),
  };
}

/** POST /servers */
export async function createServerHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<CreateServerResponse> {
  const { name, ip, port, user } = parameters as CreateServerParams;

  const response = await context.httpClient.post<unknown>(
    `/servers`,
    { name, ip, port, user },
    { requestId: context.requestId }
  );

  const s = asRecord(response);
  return {
    uuid: asString(s.uuid),
    name: asString(s.name),
    ip: asString(s.ip),
    status: asString(s.status, "pending"),
  };
}

/** PATCH /servers/{uuid} */
export async function updateServerHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<UpdateServerResponse> {
  const { uuid, name, ip } = parameters as UpdateServerParams;

  const response = await context.httpClient.patch<unknown>(
    `/servers/${uuid}`,
    { name, ip },
    { requestId: context.requestId }
  );

  const s = asRecord(response);
  return {
    uuid: asString(s.uuid),
    name: asString(s.name),
    ip: asString(s.ip),
    status: asString(s.status, "connected"),
  };
}

/** DELETE /servers/{uuid} */
export async function deleteServerHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<DeleteServerResponse> {
  const { uuid } = parameters as DeleteServerParams;

  await context.httpClient.delete(`/servers/${uuid}`, {
    requestId: context.requestId,
  });

  return { success: true, message: `Servidor ${uuid} eliminado correctamente` };
}

/** GET /servers/{uuid}/validate */
export async function validateServerHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<ValidateServerResponse> {
  const { uuid } = parameters as ValidateServerParams;

  const response = await context.httpClient.get<unknown>(
    `/servers/${uuid}/validate`,
    { requestId: context.requestId }
  );

  const r = asRecord(response);
  const rawStatus = asString(r.status, "ok");
  const status = rawStatus === "error" ? "error" as const : "ok" as const;
  return {
    status,
    message: asString(r.message, "Servidor validado correctamente"),
    details: typeof r.details === "object" && r.details !== null ? r.details as Record<string, unknown> : undefined,
  };
}

/** GET /servers/{uuid}/resources */
export async function getServerResourcesHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<ServerResources> {
  const { uuid } = parameters as GetServerResourcesParams;

  const response = await context.httpClient.get<unknown>(
    `/servers/${uuid}/resources`,
    { requestId: context.requestId }
  );

  const r = asRecord(response);
  return {
    cpu_usage_percent: asNumberOpt(r.cpu_usage_percent) ?? 0,
    memory_usage_percent: asNumberOpt(r.memory_usage_percent) ?? 0,
    disk_usage_percent: asNumberOpt(r.disk_usage_percent) ?? 0,
    disk_free_gb: asNumberOpt(r.disk_free_gb) ?? 0,
    uptime_hours: asNumberOpt(r.uptime_hours) ?? 0,
  };
}

/** GET /servers/{uuid}/domains */
export async function getServerDomainsHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<ServerDomainsList> {
  const { uuid } = parameters as GetServerDomainsParams;

  const response = await context.httpClient.get<unknown>(
    `/servers/${uuid}/domains`,
    { requestId: context.requestId }
  );

  const domains = extractArray(response, "domains");

  return {
    domains: domains.map((d) => ({
      domain: asString(d.domain),
      application_uuid: asString(d.application_uuid),
      certificate_status: asString(d.certificate_status),
    })),
    total: domains.length,
  };
}
