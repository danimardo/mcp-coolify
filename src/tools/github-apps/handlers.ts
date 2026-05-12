/**
 * Handlers para herramientas de GitHub Apps
 */

import type { ExtendedToolContext } from "$lib/tools/types";
import { extractArray, asRecord, asString, asIsoDate, asNumberOpt } from "$lib/tools/response-helpers";
import type {
  ListGitHubAppsParams,
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

/** GET /github-apps */
export async function listGitHubAppsHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<GitHubAppsList> {
  const params = parameters as ListGitHubAppsParams;

  const queryParams = new URLSearchParams({
    limit: String(params.limit ?? 50),
    skip: String(params.skip ?? 0),
  });

  const response = await context.httpClient.get<unknown>(
    `/github-apps?${queryParams.toString()}`,
    { requestId: context.requestId }
  );

  const apps = extractArray(response, "apps");

  return {
    apps: apps.map((a) => ({
      uuid: asString(a.uuid),
      name: asString(a.name),
      organization: asString(a.organization),
      app_id: asNumberOpt(a.app_id) ?? 0,
      client_id: asString(a.client_id),
      created_at: asIsoDate(a.created_at),
    })),
    total: apps.length,
  };
}

/** POST /github-apps */
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

/** PATCH /github-apps/{uuid} */
export async function updateGitHubAppHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<GitHubAppDetail> {
  const { uuid, ...updateData } = parameters as UpdateGitHubAppParams;

  const response = await context.httpClient.patch<GitHubAppDetail>(
    `/github-apps/${uuid}`,
    updateData,
    { requestId: context.requestId }
  );

  return response;
}

/** DELETE /github-apps/{uuid} */
export async function deleteGitHubAppHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid } = parameters as DeleteGitHubAppParams;

  await context.httpClient.delete(`/github-apps/${uuid}`, {
    requestId: context.requestId,
  });

  return { success: true, message: `Aplicación GitHub ${uuid} eliminada correctamente` };
}

/** GET /github-apps/{uuid}/repositories */
export async function listRepositoriesHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<RepositoriesList> {
  const params = parameters as ListRepositoriesParams;

  const queryParams = new URLSearchParams({
    limit: String(params.limit ?? 50),
    skip: String(params.skip ?? 0),
  });

  const response = await context.httpClient.get<unknown>(
    `/github-apps/${params.uuid}/repositories?${queryParams.toString()}`,
    { requestId: context.requestId }
  );

  const repos = extractArray(response, "repositories");

  return {
    repositories: repos.map((r) => {
      const repo = asRecord(r);
      return {
        id: asNumberOpt(repo.id) ?? 0,
        name: asString(repo.name),
        full_name: asString(repo.full_name),
        url: asString(repo.url),
        private: typeof repo.private === "boolean" ? repo.private : false,
      };
    }),
    total: repos.length,
  };
}

/** GET /github-apps/{uuid}/repositories/{repository}/branches */
export async function listBranchesHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<BranchesList> {
  const params = parameters as ListBranchesParams;

  const queryParams = new URLSearchParams({
    limit: String(params.limit ?? 50),
    skip: String(params.skip ?? 0),
  });

  const response = await context.httpClient.get<unknown>(
    `/github-apps/${params.uuid}/repositories/${params.repository}/branches?${queryParams.toString()}`,
    { requestId: context.requestId }
  );

  const branches = extractArray(response, "branches");

  return {
    branches: branches.map((b) => {
      const branch = asRecord(b);
      const commit = typeof branch.commit === "object" && branch.commit !== null
        ? asRecord(branch.commit)
        : null;
      return {
        name: asString(branch.name),
        commit: commit
          ? { sha: asString(commit.sha), url: asString(commit.url) }
          : undefined,
      };
    }),
    total: branches.length,
  };
}
