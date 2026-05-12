/**
 * Handlers para herramientas de Recursos
 */

import type { ExtendedToolContext } from "$lib/tools/types";
import type { ResourcesResponse } from "./schemas";

/**
 * Get all resources (applications, databases, services)
 * GET /resources
 */
export async function getResourcesHandler(
  _parameters: unknown,
  context: ExtendedToolContext
): Promise<ResourcesResponse> {
  const response = await context.httpClient.get<any>(`/resources`, {
    requestId: context.requestId,
  });

  const applications = Array.isArray(response.applications)
    ? response.applications
    : [];
  const databases = Array.isArray(response.databases) ? response.databases : [];
  const services = Array.isArray(response.services) ? response.services : [];

  return {
    applications: applications.map((a: any) => ({
      uuid: a.uuid,
      name: a.name,
      status: a.status || "unknown",
      created_at: a.created_at || new Date().toISOString(),
    })),
    databases: databases.map((d: any) => ({
      uuid: d.uuid,
      name: d.name,
      type: d.type || "database",
      status: d.status || "unknown",
      created_at: d.created_at || new Date().toISOString(),
    })),
    services: services.map((s: any) => ({
      uuid: s.uuid,
      name: s.name,
      type: s.type || "service",
      status: s.status || "unknown",
      created_at: s.created_at || new Date().toISOString(),
    })),
    total: applications.length + databases.length + services.length,
  };
}
