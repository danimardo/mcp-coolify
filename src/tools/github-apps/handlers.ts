/**
 * Handlers para herramientas de GitHub Apps
 * Implementan la lógica de negocio y llamadas a la API de Coolify
 */

import type { ExtendedToolContext } from "$lib/tools/types";
import type {
  ListGitHubAppsParams,
  GetGitHubAppParams,
  CreateGitHubAppParams,
  UpdateGitHubAppParams,
  DeleteGitHubAppParams,
  ListRepositoriesParams,
  ListBranchesParams,
  GitHubAppsList,
  GitHubAppDetail,
  RepositoriesList,
  BranchesList,
} from "./schemas";

export async function listGitHubAppsHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<GitHubAppsList> {
  const params = parameters as ListGitHubAppsParams;

  const queryParams = new URLSearchParams({
    limit: String(params.limit || 50),
    skip: String(params.skip || 0),
  });

  const response = await context.httpClient.get<any>(
    `/github-apps?${queryParams.toString()}`,
    { requestId: context.requestId }
  );

  const apps = Array.isArray(response) ? response : response.apps || [];

  return {
    apps: apps.map((a: any) => ({
      uuid: a.uuid,
      name: a.name,
      organization: a.organization,
      app_id: a.app_id,
      client_id: a.client_id,
      created_at: a.created_at || new Date().toISOString(),
    })),
    total: apps.length,
  };
}

export async function getGitHubAppHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<GitHubAppDetail> {
  const params = parameters as GetGitHubAppParams;

  const response = await context.httpClient.get<GitHubAppDetail>(
    `/github-apps/${params.uuid}`,
    { requestId: context.requestId }
  );

  return response;
}

export async function createGitHubAppHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<GitHubAppDetail> {
  const params = parameters as CreateGitHubAppParams;

  const response = await context.httpClient.post<GitHubAppDetail>(
    "/github-apps",
    params,
    { requestId: context.requestId }
  );

  return response;
}

export async function updateGitHubAppHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<GitHubAppDetail> {
  const params = parameters as UpdateGitHubAppParams;
  const { uuid, ...updateData } = params;

  const response = await context.httpClient.patch<GitHubAppDetail>(
    `/github-apps/${uuid}`,
    updateData,
    { requestId: context.requestId }
  );

  return response;
}

export async function deleteGitHubAppHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid } = parameters as DeleteGitHubAppParams;

  await context.httpClient.delete(`/github-apps/${uuid}`, {
    requestId: context.requestId,
  });

  return {
    success: true,
    message: `Aplicación GitHub ${uuid} eliminada correctamente`,
  };
}

export async function listRepositoriesHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<RepositoriesList> {
  const params = parameters as ListRepositoriesParams;

  const queryParams = new URLSearchParams({
    limit: String(params.limit || 50),
    skip: String(params.skip || 0),
  });

  const response = await context.httpClient.get<any>(
    `/github-apps/${params.uuid}/repositories?${queryParams.toString()}`,
    { requestId: context.requestId }
  );

  const repos = Array.isArray(response) ? response : response.repositories || [];

  return {
    repositories: repos.map((r: any) => ({
      id: r.id,
      name: r.name,
      full_name: r.full_name,
      url: r.url,
      private: r.private || false,
    })),
    total: repos.length,
  };
}

export async function listBranchesHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<BranchesList> {
  const params = parameters as ListBranchesParams;

  const queryParams = new URLSearchParams({
    limit: String(params.limit || 50),
    skip: String(params.skip || 0),
  });

  const response = await context.httpClient.get<any>(
    `/github-apps/${params.uuid}/repositories/${params.repository}/branches?${queryParams.toString()}`,
    { requestId: context.requestId }
  );

  const branches = Array.isArray(response) ? response : response.branches || [];

  return {
    branches: branches.map((b: any) => ({
      name: b.name,
      commit: b.commit ? {
        sha: b.commit.sha,
        url: b.commit.url,
      } : undefined,
    })),
    total: branches.length,
  };
}
