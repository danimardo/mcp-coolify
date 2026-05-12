/**
 * Handlers para herramientas de Hetzner
 */

import type { ExtendedToolContext } from "$lib/tools/types";
import {
  extractArray,
  asRecord,
  asString,
  asStringOpt,
  asNumberOpt,
} from "$lib/tools/response-helpers";
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

/** GET /hetzner/locations */
export async function listLocationsHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<LocationsList> {
  const params = parameters as ListLocationsParams;

  const queryParams = new URLSearchParams({
    limit: String(params.limit ?? 50),
    skip: String(params.skip ?? 0),
  });

  const response = await context.httpClient.get<unknown>(
    `/hetzner/locations?${queryParams.toString()}`,
    { requestId: context.requestId }
  );

  const locations = extractArray(response, "locations");

  return {
    locations: locations.map((l) => {
      const loc = asRecord(l);
      return {
        id: asNumberOpt(loc.id) ?? 0,
        name: asString(loc.name),
        description: asString(loc.description),
        country: asString(loc.country),
        city: asString(loc.city),
        latitude: asNumberOpt(loc.latitude) ?? 0,
        longitude: asNumberOpt(loc.longitude) ?? 0,
      };
    }),
    total: locations.length,
  };
}

/** GET /hetzner/server-types */
export async function listServerTypesHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<ServerTypesList> {
  const params = parameters as ListServerTypesParams;

  const queryParams = new URLSearchParams({
    limit: String(params.limit ?? 50),
    skip: String(params.skip ?? 0),
  });

  const response = await context.httpClient.get<unknown>(
    `/hetzner/server-types?${queryParams.toString()}`,
    { requestId: context.requestId }
  );

  const types = extractArray(response, "server_types");

  return {
    server_types: types.map((t) => {
      const st = asRecord(t);
      return {
        id: asNumberOpt(st.id) ?? 0,
        name: asString(st.name),
        description: asString(st.description),
        cores: asNumberOpt(st.cores) ?? 0,
        memory: asNumberOpt(st.memory) ?? 0,
        disk: asNumberOpt(st.disk) ?? 0,
        prices: Array.isArray(st.prices) ? st.prices as { location: string; price_hourly: { net: string; gross: string }; price_monthly: { net: string; gross: string } }[] : undefined,
      };
    }),
    total: types.length,
  };
}

/** GET /hetzner/images */
export async function listImagesHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<ImagesList> {
  const params = parameters as ListImagesParams;

  const queryParams = new URLSearchParams({
    limit: String(params.limit ?? 50),
    skip: String(params.skip ?? 0),
  });

  const response = await context.httpClient.get<unknown>(
    `/hetzner/images?${queryParams.toString()}`,
    { requestId: context.requestId }
  );

  const images = extractArray(response, "images");

  return {
    images: images.map((i) => {
      const img = asRecord(i);
      return {
        id: asNumberOpt(img.id) ?? 0,
        type: asString(img.type),
        status: asString(img.status),
        name: asString(img.name),
        description: asStringOpt(img.description),
      };
    }),
    total: images.length,
  };
}

/** GET /hetzner/ssh-keys */
export async function listSSHKeysHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<SSHKeysList> {
  const params = parameters as ListSSHKeysParams;

  const queryParams = new URLSearchParams({
    limit: String(params.limit ?? 50),
    skip: String(params.skip ?? 0),
  });

  const response = await context.httpClient.get<unknown>(
    `/hetzner/ssh-keys?${queryParams.toString()}`,
    { requestId: context.requestId }
  );

  const keys = extractArray(response, "ssh_keys");

  return {
    ssh_keys: keys.map((k) => {
      const key = asRecord(k);
      return {
        id: asNumberOpt(key.id) ?? 0,
        name: asString(key.name),
        public_key: asString(key.public_key),
        labels: typeof key.labels === "object" && key.labels !== null ? key.labels as Record<string, string> : undefined,
      };
    }),
    total: keys.length,
  };
}

/** POST /hetzner/servers */
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
