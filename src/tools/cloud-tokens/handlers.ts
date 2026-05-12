/**
 * Handlers para herramientas de Cloud Tokens
 */

import type { ExtendedToolContext } from "$lib/tools/types";
import type {
  ListCloudTokensParams,
  GetCloudTokenParams,
  CreateCloudTokenParams,
  UpdateCloudTokenParams,
  DeleteCloudTokenParams,
  ValidateTokenParams,
  CloudTokensList,
  CloudTokenDetail,
  ValidationResult,
} from "./schemas";

export async function listCloudTokensHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<CloudTokensList> {
  const params = parameters as ListCloudTokensParams;

  const queryParams = new URLSearchParams({
    limit: String(params.limit || 50),
    skip: String(params.skip || 0),
  });

  const response = await context.httpClient.get<any>(
    `/cloud-tokens?${queryParams.toString()}`,
    { requestId: context.requestId }
  );

  const tokens = Array.isArray(response) ? response : response.tokens || [];

  return {
    tokens: tokens.map((t: any) => ({
      uuid: t.uuid,
      name: t.name,
      provider: t.provider,
      description: t.description,
      created_at: t.created_at || new Date().toISOString(),
    })),
    total: tokens.length,
  };
}

export async function getCloudTokenHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<CloudTokenDetail> {
  const params = parameters as GetCloudTokenParams;

  const response = await context.httpClient.get<CloudTokenDetail>(
    `/cloud-tokens/${params.uuid}`,
    { requestId: context.requestId }
  );

  return response;
}

export async function createCloudTokenHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<CloudTokenDetail> {
  const params = parameters as CreateCloudTokenParams;

  const response = await context.httpClient.post<CloudTokenDetail>(
    "/cloud-tokens",
    params,
    { requestId: context.requestId }
  );

  return response;
}

export async function updateCloudTokenHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<CloudTokenDetail> {
  const params = parameters as UpdateCloudTokenParams;
  const { uuid, ...updateData } = params;

  const response = await context.httpClient.patch<CloudTokenDetail>(
    `/cloud-tokens/${uuid}`,
    updateData,
    { requestId: context.requestId }
  );

  return response;
}

export async function deleteCloudTokenHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid } = parameters as DeleteCloudTokenParams;

  await context.httpClient.delete(`/cloud-tokens/${uuid}`, {
    requestId: context.requestId,
  });

  return {
    success: true,
    message: `Token ${uuid} eliminado correctamente`,
  };
}

export async function validateTokenHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<ValidationResult> {
  const params = parameters as ValidateTokenParams;

  const response = await context.httpClient.post<ValidationResult>(
    `/cloud-tokens/${params.uuid}/validate`,
    {},
    { requestId: context.requestId }
  );

  return response;
}
