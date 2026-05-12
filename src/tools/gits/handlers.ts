/**
 * Handlers para herramientas de Git
 * Implementan la lógica de negocio y llamadas a la API de Coolify
 * 4 operaciones: listar, obtener, crear, eliminar repositorios Git
 */

import type { ExtendedToolContext } from "$lib/tools/types";
import type {
  ListGitRepositoriesParams,
  GetGitRepositoryParams,
  CreateGitRepositoryParams,
  DeleteGitRepositoryParams,
  GitRepositoriesList,
  GitRepositoryDetail,
} from "./schemas";

/**
 * Handler para listar repositorios Git
 * GET /git/repositories?limit=&skip=
 */
export async function listGitRepositoriesHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<GitRepositoriesList> {
  const params = parameters as ListGitRepositoriesParams;

  const queryParams = new URLSearchParams({
    limit: String(params.limit || 50),
    skip: String(params.skip || 0),
  });

  const response = await context.httpClient.get<any>(
    `/git/repositories?${queryParams.toString()}`,
    {
      requestId: context.requestId,
    }
  );

  const repositories = Array.isArray(response) ? response : response.repositories || [];

  return {
    repositories: repositories.map((r: any) => ({
      uuid: r.uuid,
      name: r.name,
      url: r.url,
      private: r.private || false,
      created_at: r.created_at || new Date().toISOString(),
    })),
    total: repositories.length,
  };
}

/**
 * Handler para obtener un repositorio Git específico
 * GET /git/repositories/{uuid}
 */
export async function getGitRepositoryHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<GitRepositoryDetail> {
  const params = parameters as GetGitRepositoryParams;

  const response = await context.httpClient.get<GitRepositoryDetail>(
    `/git/repositories/${params.uuid}`,
    {
      requestId: context.requestId,
    }
  );

  return response;
}

/**
 * Handler para crear un repositorio Git
 * POST /git/repositories { name, url, private, description }
 */
export async function createGitRepositoryHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<GitRepositoryDetail> {
  const params = parameters as CreateGitRepositoryParams;

  const response = await context.httpClient.post<GitRepositoryDetail>(
    "/git/repositories",
    params,
    {
      requestId: context.requestId,
    }
  );

  return response;
}

/**
 * Handler para eliminar un repositorio Git
 * DELETE /git/repositories/{uuid}
 */
export async function deleteGitRepositoryHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid } = parameters as DeleteGitRepositoryParams;

  await context.httpClient.post(`/git/repositories/${uuid}`, null, {
    requestId: context.requestId,
  });

  return {
    success: true,
    message: `Repositorio Git ${uuid} eliminado correctamente`,
  };
}
