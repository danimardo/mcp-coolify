/**
 * Handlers para tools del dominio Projects
 */

import type { ExtendedToolContext } from "$lib/tools/types";
import { extractArray, asRecord, asString, asStringOpt, asIsoDate } from "$lib/tools/response-helpers";
import type {
  ListProjectsParams,
  GetProjectParams,
  CreateProjectParams,
  UpdateProjectParams,
  DeleteProjectParams,
  ListProjectEnvironmentsParams,
} from "./schemas";

/** GET /projects */
export async function listProjectsHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const params = parameters as ListProjectsParams;
  const queryParams: Record<string, string> = {};

  if (params.team_uuid) queryParams.team_uuid = params.team_uuid;
  if (params.limit !== undefined) queryParams.limit = String(params.limit);
  if (params.skip !== undefined) queryParams.skip = String(params.skip);

  const queryString = new URLSearchParams(queryParams).toString();
  const path = queryString ? `/projects?${queryString}` : "/projects";

  const response = await context.httpClient.get<unknown>(path, {
    requestId: context.requestId,
  });

  return response;
}

/** GET /projects/{uuid} */
export async function getProjectHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid } = parameters as GetProjectParams;

  const response = await context.httpClient.get<unknown>(`/projects/${uuid}`, {
    requestId: context.requestId,
  });

  return response;
}

/** POST /projects */
export async function createProjectHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const params = parameters as CreateProjectParams;

  const response = await context.httpClient.post<unknown>("/projects", params, {
    requestId: context.requestId,
  });

  return response;
}

/** PATCH /projects/{uuid} */
export async function updateProjectHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid, name, description } = parameters as UpdateProjectParams;

  const response = await context.httpClient.patch<unknown>(
    `/projects/${uuid}`,
    { name, description },
    { requestId: context.requestId }
  );

  return response;
}

/** DELETE /projects/{uuid} */
export async function deleteProjectHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid } = parameters as DeleteProjectParams;

  await context.httpClient.delete(`/projects/${uuid}`, {
    requestId: context.requestId,
  });

  return { success: true, message: `Proyecto ${uuid} eliminado correctamente` };
}

/** GET /projects/{uuid}/environments */
export async function listProjectEnvironmentsHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid } = parameters as ListProjectEnvironmentsParams;

  const response = await context.httpClient.get<unknown>(
    `/projects/${uuid}/environments`,
    { requestId: context.requestId }
  );

  const environments = extractArray(response, "environments");

  return {
    environments: environments.map((e) => {
      const env = asRecord(e);
      return {
        uuid: asStringOpt(env.uuid),
        name: asString(env.name),
        created_at: asIsoDate(env.created_at),
      };
    }),
    total: environments.length,
  };
}
