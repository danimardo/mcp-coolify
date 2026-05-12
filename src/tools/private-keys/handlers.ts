/**
 * Handlers para herramientas de Private Keys
 */

import type { ExtendedToolContext } from "$lib/tools/types";
import { extractArray, asString, asStringOpt, asIsoDate } from "$lib/tools/response-helpers";
import type {
  ListPrivateKeysParams,
  GetPrivateKeyParams,
  CreatePrivateKeyParams,
  UpdatePrivateKeyParams,
  DeletePrivateKeyParams,
  PrivateKeysList,
  PrivateKeyDetail,
} from "./schemas";

/** GET /private-keys */
export async function listPrivateKeysHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<PrivateKeysList> {
  const params = parameters as ListPrivateKeysParams;

  const queryParams = new URLSearchParams({
    limit: String(params.limit ?? 50),
    skip: String(params.skip ?? 0),
  });

  const response = await context.httpClient.get<unknown>(
    `/private-keys?${queryParams.toString()}`,
    { requestId: context.requestId }
  );

  const keys = extractArray(response, "keys");

  return {
    keys: keys.map((k) => ({
      uuid: asString(k.uuid),
      name: asString(k.name),
      description: asStringOpt(k.description),
      fingerprint: asStringOpt(k.fingerprint),
      created_at: asIsoDate(k.created_at),
    })),
    total: keys.length,
  };
}

/** GET /private-keys/{uuid} */
export async function getPrivateKeyHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<PrivateKeyDetail> {
  const { uuid } = parameters as GetPrivateKeyParams;

  const response = await context.httpClient.get<PrivateKeyDetail>(
    `/private-keys/${uuid}`,
    { requestId: context.requestId }
  );

  return response;
}

/** POST /private-keys */
export async function createPrivateKeyHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<PrivateKeyDetail> {
  const params = parameters as CreatePrivateKeyParams;

  const response = await context.httpClient.post<PrivateKeyDetail>(
    "/private-keys",
    params,
    { requestId: context.requestId }
  );

  return response;
}

/** PATCH /private-keys/{uuid} */
export async function updatePrivateKeyHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<PrivateKeyDetail> {
  const { uuid, ...updateData } = parameters as UpdatePrivateKeyParams;

  const response = await context.httpClient.patch<PrivateKeyDetail>(
    `/private-keys/${uuid}`,
    updateData,
    { requestId: context.requestId }
  );

  return response;
}

/** DELETE /private-keys/{uuid} */
export async function deletePrivateKeyHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid } = parameters as DeletePrivateKeyParams;

  await context.httpClient.delete(`/private-keys/${uuid}`, {
    requestId: context.requestId,
  });

  return { success: true, message: `Clave privada ${uuid} eliminada correctamente` };
}
