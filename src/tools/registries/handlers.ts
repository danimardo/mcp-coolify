/**
 * Handlers para herramientas de Registries
 * Implementan la lógica de negocio y llamadas a la API de Coolify
 * 4 operaciones: listar, obtener, crear, eliminar registros Docker
 */

import type { ExtendedToolContext } from "$lib/tools/types";
import type {
  ListRegistriesParams,
  GetRegistryParams,
  CreateRegistryParams,
  DeleteRegistryParams,
  RegistriesList,
  RegistryDetail,
} from "./schemas";

/**
 * Handler para listar registros
 * GET /registries?limit=&skip=
 */
export async function listRegistriesHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<RegistriesList> {
  const params = parameters as ListRegistriesParams;

  const queryParams = new URLSearchParams({
    limit: String(params.limit || 50),
    skip: String(params.skip || 0),
  });

  const response = await context.httpClient.get<any>(
    `/registries?${queryParams.toString()}`,
    {
      requestId: context.requestId,
    }
  );

  const registries = Array.isArray(response) ? response : response.registries || [];

  return {
    registries: registries.map((r: any) => ({
      uuid: r.uuid,
      name: r.name,
      url: r.url,
      created_at: r.created_at || new Date().toISOString(),
    })),
    total: registries.length,
  };
}

/**
 * Handler para obtener un registro específico
 * GET /registries/{uuid}
 */
export async function getRegistryHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<RegistryDetail> {
  const params = parameters as GetRegistryParams;

  const response = await context.httpClient.get<RegistryDetail>(
    `/registries/${params.uuid}`,
    {
      requestId: context.requestId,
    }
  );

  return response;
}

/**
 * Handler para crear un registro
 * POST /registries { name, url, username, password, description }
 */
export async function createRegistryHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<RegistryDetail> {
  const params = parameters as CreateRegistryParams;

  const response = await context.httpClient.post<RegistryDetail>(
    "/registries",
    params,
    {
      requestId: context.requestId,
    }
  );

  return response;
}

/**
 * Handler para eliminar un registro
 * DELETE /registries/{uuid}
 */
export async function deleteRegistryHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid } = parameters as DeleteRegistryParams;

  await context.httpClient.post(`/registries/${uuid}`, null, {
    requestId: context.requestId,
  });

  return {
    success: true,
    message: `Registro ${uuid} eliminado correctamente`,
  };
}
