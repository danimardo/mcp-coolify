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
