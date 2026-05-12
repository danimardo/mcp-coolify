/**
 * Handlers para herramientas de Cloud Tokens
 */

import type { ExtendedToolContext } from "$lib/tools/types";
import { extractArray, asString, asStringOpt, asIsoDate } from "$lib/tools/response-helpers";
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

/** GET /cloud-tokens */
export async function listCloudTokensHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<CloudTokensList> {
  const params = parameters as ListCloudTokensParams;

  const queryParams = new URLSearchParams({
    limit: String(params.limit ?? 50),
    skip: String(params.skip ?? 0),
  });

  const response = await context.httpClient.get<unknown>(
    `/cloud-tokens?${queryParams.toString()}`,
    { requestId: context.requestId }
  );

  const tokens = extractArray(response, "tokens");

  return {
    tokens: tokens.map((t) => ({
      uuid: asString(t.uuid),
      name: asString(t.name),
      provider: asString(t.provider),
      description: asStringOpt(t.description),
      created_at: asIsoDate(t.created_at),
    })),
    total: tokens.length,
  };
}

/** GET /cloud-tokens/{uuid} */
export async function getCloudTokenHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<CloudTokenDetail> {
  const { uuid } = parameters as GetCloudTokenParams;

  const response = await context.httpClient.get<CloudTokenDetail>(
    `/cloud-tokens/${uuid}`,
    { requestId: context.requestId }
  );

  return response;
}

/** POST /cloud-tokens */
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

/** PATCH /cloud-tokens/{uuid} */
export async function updateCloudTokenHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<CloudTokenDetail> {
  const { uuid, ...updateData } = parameters as UpdateCloudTokenParams;

  const response = await context.httpClient.patch<CloudTokenDetail>(
    `/cloud-tokens/${uuid}`,
    updateData,
    { requestId: context.requestId }
  );

  return response;
}

/** DELETE /cloud-tokens/{uuid} */
export async function deleteCloudTokenHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid } = parameters as DeleteCloudTokenParams;

  await context.httpClient.delete(`/cloud-tokens/${uuid}`, {
    requestId: context.requestId,
  });

  return { success: true, message: `Token ${uuid} eliminado correctamente` };
}

/** POST /cloud-tokens/{uuid}/validate */
export async function validateTokenHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<ValidationResult> {
  const { uuid } = parameters as ValidateTokenParams;

  const response = await context.httpClient.post<ValidationResult>(
    `/cloud-tokens/${uuid}/validate`,
    {},
    { requestId: context.requestId }
  );

  return response;
}
