/**
 * Handlers para herramientas de Ambientes
 * Implementan la lógica de negocio y llamadas a la API de Coolify
 * 4 operaciones: listar, obtener, crear, actualizar, eliminar ambientes
 */

import type { ExtendedToolContext } from "$lib/tools/types";
import type {
  ListEnvironmentsParams,
  GetEnvironmentParams,
  CreateEnvironmentParams,
  UpdateEnvironmentParams,
  DeleteEnvironmentParams,
  EnvironmentsList,
  EnvironmentDetail,
} from "./schemas";

/**
 * Handler para listar ambientes
 * GET /environments?project_uuid=&limit=&skip=
 */
export async function listEnvironmentsHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<EnvironmentsList> {
  const params = parameters as ListEnvironmentsParams;
  const queryParams: Record<string, string> = {};

  if (params.project_uuid) queryParams.project_uuid = params.project_uuid;
  if (params.limit !== undefined) queryParams.limit = String(params.limit);
  if (params.skip !== undefined) queryParams.skip = String(params.skip);

  const queryString = new URLSearchParams(queryParams).toString();
  const path = queryString ? `/environments?${queryString}` : "/environments";

  const response = await context.httpClient.get<any>(path, {
    requestId: context.requestId,
  });

  const environments = Array.isArray(response) ? response : response.environments || [];

  return {
    environments: environments.map((e: any) => ({
      uuid: e.uuid,
      name: e.name,
      project_uuid: e.project_uuid,
      created_at: e.created_at || new Date().toISOString(),
    })),
    total: environments.length,
  };
}

/**
 * Handler para obtener un ambiente específico
 * GET /environments/{uuid}
 */
export async function getEnvironmentHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<EnvironmentDetail> {
  const params = parameters as GetEnvironmentParams;

  const response = await context.httpClient.get<EnvironmentDetail>(
    `/environments/${params.uuid}`,
    {
      requestId: context.requestId,
    }
  );

  return response;
}

/**
 * Handler para crear un ambiente
 * POST /environments { project_uuid, name, description }
 */
export async function createEnvironmentHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<EnvironmentDetail> {
  const params = parameters as CreateEnvironmentParams;

  const response = await context.httpClient.post<EnvironmentDetail>(
    "/environments",
    params,
    {
      requestId: context.requestId,
    }
  );

  return response;
}

/**
 * Handler para actualizar un ambiente
 * PATCH /environments/{uuid}
 */
export async function updateEnvironmentHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<EnvironmentDetail> {
  const { uuid, name, description } = parameters as UpdateEnvironmentParams;

  const response = await context.httpClient.post<EnvironmentDetail>(
    `/environments/${uuid}`,
    {
      name,
      description,
    },
    {
      requestId: context.requestId,
    }
  );

  return response;
}

/**
 * Handler para eliminar un ambiente
 * DELETE /environments/{uuid}
 */
export async function deleteEnvironmentHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid } = parameters as DeleteEnvironmentParams;

  await context.httpClient.post(`/environments/${uuid}`, null, {
    requestId: context.requestId,
  });

  return {
    success: true,
    message: `Ambiente ${uuid} eliminado correctamente`,
  };
}
