/**
 * Handlers para herramientas de Servicios
 */

import type { ExtendedToolContext } from "$lib/tools/types";
import {
  extractArray,
  asRecord,
  asString,
  asStringOpt,
  asIsoDate,
} from "$lib/tools/response-helpers";
import type {
  ListServicesParams,
  GetServiceParams,
  CreateServiceParams,
  UpdateServiceParams,
  DeleteServiceParams,
  StartServiceParams,
  StopServiceParams,
  RestartServiceParams,
  UpdateServiceEnvParams,
  ServicesList,
  ServiceDetail,
} from "./schemas";

/** GET /services */
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

  const response = await context.httpClient.get<unknown>(path, {
    requestId: context.requestId,
  });

  const services = extractArray(response, "services");

  return {
    services: services.map((s) => ({
      uuid: asString(s.uuid),
      name: asString(s.name),
      image: asString(s.image),
      status: asString(s.status, "unknown"),
      created_at: asIsoDate(s.created_at),
    })),
    total: services.length,
  };
}

/** GET /services/{uuid} */
export async function getServiceHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<ServiceDetail> {
  const { uuid } = parameters as GetServiceParams;

  const response = await context.httpClient.get<unknown>(`/services/${uuid}`, {
    requestId: context.requestId,
  });

  const s = asRecord(response);
  return {
    uuid: asString(s.uuid),
    name: asString(s.name),
    image: asString(s.image),
    status: asString(s.status, "unknown"),
    created_at: asIsoDate(s.created_at),
    description: asStringOpt(s.description),
  };
}

/** POST /services */
export async function createServiceHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<ServiceDetail> {
  const params = parameters as CreateServiceParams;

  const response = await context.httpClient.post<unknown>("/services", params, {
    requestId: context.requestId,
  });

  const s = asRecord(response);
  return {
    uuid: asString(s.uuid),
    name: asString(s.name),
    image: asString(s.image),
    status: asString(s.status, "created"),
    created_at: asIsoDate(s.created_at),
    description: asStringOpt(s.description),
  };
}

/** PATCH /services/{uuid} */
export async function updateServiceHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<ServiceDetail> {
  const { uuid, name, image, description } = parameters as UpdateServiceParams;

  const response = await context.httpClient.patch<unknown>(
    `/services/${uuid}`,
    { name, image, description },
    { requestId: context.requestId }
  );

  const s = asRecord(response);
  return {
    uuid: asString(s.uuid),
    name: asString(s.name),
    image: asString(s.image),
    status: asString(s.status, "unknown"),
    created_at: asIsoDate(s.created_at),
    description: asStringOpt(s.description),
  };
}

/** DELETE /services/{uuid} */
export async function deleteServiceHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid } = parameters as DeleteServiceParams;

  await context.httpClient.delete(`/services/${uuid}`, {
    requestId: context.requestId,
  });

  return { success: true, message: `Servicio ${uuid} eliminado correctamente` };
}

/** GET /services/{uuid}/start */
export async function startServiceHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid } = parameters as StartServiceParams;

  await context.httpClient.get<unknown>(`/services/${uuid}/start`, {
    requestId: context.requestId,
  });

  return { success: true, message: `Servicio ${uuid} iniciado` };
}

/** GET /services/{uuid}/stop */
export async function stopServiceHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid } = parameters as StopServiceParams;

  await context.httpClient.get<unknown>(`/services/${uuid}/stop`, {
    requestId: context.requestId,
  });

  return { success: true, message: `Servicio ${uuid} detenido` };
}

/** GET /services/{uuid}/restart */
export async function restartServiceHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid } = parameters as RestartServiceParams;

  await context.httpClient.get<unknown>(`/services/${uuid}/restart`, {
    requestId: context.requestId,
  });

  return { success: true, message: `Servicio ${uuid} reiniciado` };
}

/** POST /services/{uuid}/envs */
export async function updateServiceEnvHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid, variables } = parameters as UpdateServiceEnvParams;

  const response = await context.httpClient.post<unknown>(
    `/services/${uuid}/envs`,
    { variables },
    { requestId: context.requestId }
  );

  return { success: true, message: "Variables de entorno actualizadas", result: response };
}
