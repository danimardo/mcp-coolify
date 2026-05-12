/**
 * Handlers para herramientas de Ambientes
 * Endpoints: /projects/{project_uuid}/environments
 */

import type { ExtendedToolContext } from "$lib/tools/types";
import { extractArray, asRecord, asString, asStringOpt, asIsoDate } from "$lib/tools/response-helpers";
import type {
  ListEnvironmentsParams,
  GetEnvironmentParams,
  CreateEnvironmentParams,
  DeleteEnvironmentParams,
  EnvironmentsList,
  EnvironmentDetail,
} from "./schemas";

/** GET /projects/{project_uuid}/environments */
export async function listEnvironmentsHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<EnvironmentsList> {
  const { project_uuid } = parameters as ListEnvironmentsParams;

  const response = await context.httpClient.get<unknown>(
    `/projects/${project_uuid}/environments`,
    { requestId: context.requestId }
  );

  const environments = extractArray(response, "environments");

  return {
    environments: environments.map((e) => {
      const env = asRecord(e);
      return {
        uuid: asStringOpt(env.uuid),
        name: asString(env.name),
        project_uuid: asStringOpt(env.project_uuid),
        created_at: asIsoDate(env.created_at),
      };
    }),
    total: environments.length,
  };
}

/** GET /projects/{project_uuid}/{environment_name_or_uuid} */
export async function getEnvironmentHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<EnvironmentDetail> {
  const { project_uuid, environment_name_or_uuid } = parameters as GetEnvironmentParams;

  const response = await context.httpClient.get<unknown>(
    `/projects/${project_uuid}/${environment_name_or_uuid}`,
    { requestId: context.requestId }
  );

  const env = asRecord(response);
  return {
    uuid: asStringOpt(env.uuid),
    name: asString(env.name),
    project_uuid: asStringOpt(env.project_uuid),
    created_at: asIsoDate(env.created_at),
    description: asStringOpt(env.description),
  };
}

/** POST /projects/{project_uuid}/environments */
export async function createEnvironmentHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<EnvironmentDetail> {
  const { project_uuid, name, description } = parameters as CreateEnvironmentParams;

  const response = await context.httpClient.post<unknown>(
    `/projects/${project_uuid}/environments`,
    { name, description },
    { requestId: context.requestId }
  );

  const env = asRecord(response);
  return {
    uuid: asStringOpt(env.uuid),
    name: asString(env.name, name),
    project_uuid: asStringOpt(env.project_uuid) ?? project_uuid,
    created_at: asIsoDate(env.created_at),
    description: asStringOpt(env.description),
  };
}

/** DELETE /projects/{project_uuid}/environments/{environment_name_or_uuid} */
export async function deleteEnvironmentHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { project_uuid, environment_name_or_uuid } = parameters as DeleteEnvironmentParams;

  await context.httpClient.delete(
    `/projects/${project_uuid}/environments/${environment_name_or_uuid}`,
    { requestId: context.requestId }
  );

  return { success: true, message: `Ambiente ${environment_name_or_uuid} eliminado correctamente` };
}
