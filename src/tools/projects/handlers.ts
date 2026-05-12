/**
 * Handlers para tools del dominio Projects
 * Implementan la lógica de negocio y llamadas a la API de Coolify
 *
 * Categoría: Projects
 */

import type { ExtendedToolContext } from "$lib/tools/types";
import type {
  ListProjectsParams,
  GetProjectParams,
  CreateProjectParams,
  UpdateProjectParams,
  DeleteProjectParams,
  ListProjectEnvironmentsParams,
} from "./schemas";

/**
 * Handler para listar proyectos
 * GET /projects?team_uuid=&limit=&skip=
 */
export async function listProjectsHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const params = parameters as ListProjectsParams;
  const queryParams: Record<string, string> = {};

  if (params.team_uuid) queryParams.team_uuid = params.team_uuid;
  if (params.limit !== undefined)
    queryParams.limit = String(params.limit);
  if (params.skip !== undefined)
    queryParams.skip = String(params.skip);

  const queryString = new URLSearchParams(queryParams).toString();
  const path = queryString ? `/projects?${queryString}` : "/projects";

  const response = await context.httpClient.get(path, {
    requestId: context.requestId,
  });

  return response;
}

/**
 * Handler para obtener un proyecto por UUID
 * GET /projects/{uuid}
 */
export async function getProjectHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const params = parameters as GetProjectParams;

  const response = await context.httpClient.get(
    `/projects/${params.uuid}`,
    {
      requestId: context.requestId,
    }
  );

  return response;
}

/**
 * Handler para crear un nuevo proyecto
 * POST /projects { name, description }
 */
export async function createProjectHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const params = parameters as CreateProjectParams;

  const response = await context.httpClient.post("/projects", params, {
    requestId: context.requestId,
  });

  return response;
}

/**
 * Handler para actualizar un proyecto
 * PATCH /projects/{uuid}
 */
export async function updateProjectHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid, name, description } = parameters as UpdateProjectParams;

  const response = await context.httpClient.post(
    `/projects/${uuid}`,
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
 * Handler para eliminar un proyecto
 * DELETE /projects/{uuid}
 */
export async function deleteProjectHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid } = parameters as DeleteProjectParams;

  await context.httpClient.post(`/projects/${uuid}`, null, {
    requestId: context.requestId,
  });

  return {
    success: true,
    message: `Proyecto ${uuid} eliminado correctamente`,
  };
}

/**
 * Handler para listar entornos de un proyecto
 * GET /projects/{uuid}/environments
 */
export async function listProjectEnvironmentsHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid } = parameters as ListProjectEnvironmentsParams;

  const response = await context.httpClient.get<any>(
    `/projects/${uuid}/environments`,
    {
      requestId: context.requestId,
    }
  );

  const environments = Array.isArray(response) ? response : response.environments || [];

  return {
    environments: environments.map((e: any) => ({
      uuid: e.uuid,
      name: e.name,
      created_at: e.created_at,
    })),
    total: environments.length,
  };
}
