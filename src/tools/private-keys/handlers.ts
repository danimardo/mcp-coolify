/**
 * Handlers para herramientas de Private Keys
 * Implementan la lógica de negocio y llamadas a la API de Coolify
 */

import type { ExtendedToolContext } from "$lib/tools/types";
import type {
  ListPrivateKeysParams,
  GetPrivateKeyParams,
  CreatePrivateKeyParams,
  UpdatePrivateKeyParams,
  DeletePrivateKeyParams,
  PrivateKeysList,
  PrivateKeyDetail,
} from "./schemas";

/**
 * Handler para listar claves privadas
 * GET /private-keys?limit=&skip=
 */
export async function listPrivateKeysHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<PrivateKeysList> {
  const params = parameters as ListPrivateKeysParams;

  const queryParams = new URLSearchParams({
    limit: String(params.limit || 50),
    skip: String(params.skip || 0),
  });

  const response = await context.httpClient.get<any>(
    `/private-keys?${queryParams.toString()}`,
    {
      requestId: context.requestId,
    }
  );

  const keys = Array.isArray(response) ? response : response.keys || [];

  return {
    keys: keys.map((k: any) => ({
      uuid: k.uuid,
      name: k.name,
      description: k.description,
      fingerprint: k.fingerprint,
      created_at: k.created_at || new Date().toISOString(),
    })),
    total: keys.length,
  };
}

/**
 * Handler para obtener una clave privada
 * GET /private-keys/{uuid}
 */
export async function getPrivateKeyHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<PrivateKeyDetail> {
  const params = parameters as GetPrivateKeyParams;

  const response = await context.httpClient.get<PrivateKeyDetail>(
    `/private-keys/${params.uuid}`,
    {
      requestId: context.requestId,
    }
  );

  return response;
}

/**
 * Handler para crear una clave privada
 * POST /private-keys { name, description, private_key }
 */
export async function createPrivateKeyHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<PrivateKeyDetail> {
  const params = parameters as CreatePrivateKeyParams;

  const response = await context.httpClient.post<PrivateKeyDetail>(
    "/private-keys",
    params,
    {
      requestId: context.requestId,
    }
  );

  return response;
}

/**
 * Handler para actualizar una clave privada
 * PATCH /private-keys/{uuid}
 */
export async function updatePrivateKeyHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<PrivateKeyDetail> {
  const params = parameters as UpdatePrivateKeyParams;
  const { uuid, ...updateData } = params;

  const response = await context.httpClient.patch<PrivateKeyDetail>(
    `/private-keys/${uuid}`,
    updateData,
    {
      requestId: context.requestId,
    }
  );

  return response;
}

/**
 * Handler para eliminar una clave privada
 * DELETE /private-keys/{uuid}
 */
export async function deletePrivateKeyHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid } = parameters as DeletePrivateKeyParams;

  await context.httpClient.delete(`/private-keys/${uuid}`, {
    requestId: context.requestId,
  });

  return {
    success: true,
    message: `Clave privada ${uuid} eliminada correctamente`,
  };
}
