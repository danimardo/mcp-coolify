/**
 * Handlers para herramientas de Hetzner
 */

import type { ExtendedToolContext } from "$lib/tools/types";
import type {
  ListLocationsParams,
  ListServerTypesParams,
  ListImagesParams,
  ListSSHKeysParams,
  CreateServerParams,
  LocationsList,
  ServerTypesList,
  ImagesList,
  SSHKeysList,
  ServerDetail,
} from "./schemas";

export async function listLocationsHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<LocationsList> {
  const params = parameters as ListLocationsParams;

  const queryParams = new URLSearchParams({
    limit: String(params.limit || 50),
    skip: String(params.skip || 0),
  });

  const response = await context.httpClient.get<any>(
    `/hetzner/locations?${queryParams.toString()}`,
    { requestId: context.requestId }
  );

  const locations = Array.isArray(response) ? response : response.locations || [];

  return {
    locations: locations.map((l: any) => ({
      id: l.id,
      name: l.name,
      description: l.description,
      country: l.country,
      city: l.city,
      latitude: l.latitude,
      longitude: l.longitude,
    })),
    total: locations.length,
  };
}

export async function listServerTypesHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<ServerTypesList> {
  const params = parameters as ListServerTypesParams;

  const queryParams = new URLSearchParams({
    limit: String(params.limit || 50),
    skip: String(params.skip || 0),
  });

  const response = await context.httpClient.get<any>(
    `/hetzner/server-types?${queryParams.toString()}`,
    { requestId: context.requestId }
  );

  const types = Array.isArray(response) ? response : response.server_types || [];

  return {
    server_types: types.map((t: any) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      cores: t.cores,
      memory: t.memory,
      disk: t.disk,
      prices: t.prices,
    })),
    total: types.length,
  };
}

export async function listImagesHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<ImagesList> {
  const params = parameters as ListImagesParams;

  const queryParams = new URLSearchParams({
    limit: String(params.limit || 50),
    skip: String(params.skip || 0),
  });

  const response = await context.httpClient.get<any>(
    `/hetzner/images?${queryParams.toString()}`,
    { requestId: context.requestId }
  );

  const images = Array.isArray(response) ? response : response.images || [];

  return {
    images: images.map((i: any) => ({
      id: i.id,
      type: i.type,
      status: i.status,
      name: i.name,
      description: i.description,
    })),
    total: images.length,
  };
}

export async function listSSHKeysHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<SSHKeysList> {
  const params = parameters as ListSSHKeysParams;

  const queryParams = new URLSearchParams({
    limit: String(params.limit || 50),
    skip: String(params.skip || 0),
  });

  const response = await context.httpClient.get<any>(
    `/hetzner/ssh-keys?${queryParams.toString()}`,
    { requestId: context.requestId }
  );

  const keys = Array.isArray(response) ? response : response.ssh_keys || [];

  return {
    ssh_keys: keys.map((k: any) => ({
      id: k.id,
      name: k.name,
      public_key: k.public_key,
      labels: k.labels,
    })),
    total: keys.length,
  };
}

export async function createServerHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<ServerDetail> {
  const params = parameters as CreateServerParams;

  const response = await context.httpClient.post<ServerDetail>(
    "/hetzner/servers",
    params,
    { requestId: context.requestId }
  );

  return response;
}
