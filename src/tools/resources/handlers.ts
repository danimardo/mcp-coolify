/**
 * Handlers para herramientas de Recursos
 */

import type { ExtendedToolContext } from "$lib/tools/types";
import { extractArray, asRecord, asString, asStringOpt, asIsoDate } from "$lib/tools/response-helpers";
import type { ResourcesResponse } from "./schemas";

/** GET /resources */
export async function getResourcesHandler(
  _parameters: unknown,
  context: ExtendedToolContext
): Promise<ResourcesResponse> {
  const response = await context.httpClient.get<unknown>(`/resources`, {
    requestId: context.requestId,
  });

  const r = asRecord(response);
  const applications = extractArray(r.applications, "applications");
  const databases = extractArray(r.databases, "databases");
  const services = extractArray(r.services, "services");

  return {
    applications: applications.map((a) => ({
      uuid: asString(a.uuid),
      name: asString(a.name),
      status: asString(a.status, "unknown"),
      created_at: asIsoDate(a.created_at),
    })),
    databases: databases.map((d) => ({
      uuid: asString(d.uuid),
      name: asString(d.name),
      type: asString(d.type, "database"),
      status: asString(d.status, "unknown"),
      created_at: asIsoDate(d.created_at),
    })),
    services: services.map((s) => ({
      uuid: asString(s.uuid),
      name: asString(s.name),
      type: asStringOpt(s.type) ?? "service",
      status: asString(s.status, "unknown"),
      created_at: asIsoDate(s.created_at),
    })),
    total: applications.length + databases.length + services.length,
  };
}
