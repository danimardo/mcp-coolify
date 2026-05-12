/**
 * Handlers para herramientas de Networks
 * Implementan la lógica de negocio y llamadas a la API de Coolify
 * 3 operaciones: listar, obtener, crear, eliminar redes Docker
 */

import type { ExtendedToolContext } from "$lib/tools/types";
import type {
  ListNetworksParams,
  GetNetworkParams,
  CreateNetworkParams,
  DeleteNetworkParams,
  NetworksList,
  NetworkDetail,
} from "./schemas";

/**
 * Handler para listar redes
 * GET /networks?limit=&skip=
 */
export async function listNetworksHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<NetworksList> {
  const params = parameters as ListNetworksParams;

  const queryParams = new URLSearchParams({
    limit: String(params.limit || 50),
    skip: String(params.skip || 0),
  });

  const response = await context.httpClient.get<any>(
    `/networks?${queryParams.toString()}`,
    {
      requestId: context.requestId,
    }
  );

  const networks = Array.isArray(response) ? response : response.networks || [];

  return {
    networks: networks.map((n: any) => ({
      uuid: n.uuid,
      name: n.name,
      driver: n.driver,
      created_at: n.created_at || new Date().toISOString(),
    })),
    total: networks.length,
  };
}

/**
 * Handler para obtener una red específica
 * GET /networks/{uuid}
 */
export async function getNetworkHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<NetworkDetail> {
  const params = parameters as GetNetworkParams;

  const response = await context.httpClient.get<NetworkDetail>(
    `/networks/${params.uuid}`,
    {
      requestId: context.requestId,
    }
  );

  return response;
}

/**
 * Handler para crear una red
 * POST /networks { name, driver, description }
 */
export async function createNetworkHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<NetworkDetail> {
  const params = parameters as CreateNetworkParams;

  const response = await context.httpClient.post<NetworkDetail>(
    "/networks",
    params,
    {
      requestId: context.requestId,
    }
  );

  return response;
}

/**
 * Handler para eliminar una red
 * DELETE /networks/{uuid}
 */
export async function deleteNetworkHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid } = parameters as DeleteNetworkParams;

  await context.httpClient.post(`/networks/${uuid}`, null, {
    requestId: context.requestId,
  });

  return {
    success: true,
    message: `Red ${uuid} eliminada correctamente`,
  };
}
