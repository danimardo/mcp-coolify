/**
 * Handlers para la categoría Applications
 *
 * Implementa las llamadas HTTP a la API de Coolify para cada operación
 * de aplicaciones: listar, obtener, logs, iniciar, detener, reiniciar.
 */

import type { ExtendedToolContext } from "$lib/tools/types";
import type {
  ListApplicationsParams,
  GetApplicationParams,
  GetApplicationLogsParams,
  StartApplicationParams,
  StopApplicationParams,
  RestartApplicationParams,
  ApplicationsList,
  ApplicationDetail,
  ApplicationLogs,
  ApplicationAction,
} from "./schemas";

/**
 * Listar aplicaciones
 * GET /applications?project_uuid=&environment_name=&limit=&skip=
 */
export async function listApplicationsHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<ApplicationsList> {
  const params = parameters as ListApplicationsParams;

  const queryParams = new URLSearchParams();
  if (params.project_uuid) queryParams.append("project_uuid", params.project_uuid);
  if (params.environment_name) queryParams.append("environment_name", params.environment_name);
  queryParams.append("limit", String(params.limit));
  queryParams.append("skip", String(params.skip));

  const queryString = queryParams.toString();
  const url = `/applications${queryString ? `?${queryString}` : ""}`;

  return context.httpClient.get<ApplicationsList>(url, {
    requestId: context.requestId,
  });
}

/**
 * Obtener una aplicación por UUID
 * GET /applications/{uuid}
 */
export async function getApplicationHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<ApplicationDetail> {
  const { uuid } = parameters as GetApplicationParams;

  return context.httpClient.get<ApplicationDetail>(`/applications/${uuid}`, {
    requestId: context.requestId,
  });
}

/**
 * Obtener logs de una aplicación
 * GET /applications/{uuid}/logs?lines=N
 */
export async function getApplicationLogsHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<ApplicationLogs> {
  const { uuid, lines } = parameters as GetApplicationLogsParams;

  return context.httpClient.get<ApplicationLogs>(
    `/applications/${uuid}/logs?lines=${lines}`,
    { requestId: context.requestId }
  );
}

/**
 * Iniciar una aplicación
 * GET /applications/{uuid}/start
 */
export async function startApplicationHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<ApplicationAction> {
  const { uuid, force } = parameters as StartApplicationParams;

  return context.httpClient.get<ApplicationAction>(
    `/applications/${uuid}/start`,
    { params: { force }, requestId: context.requestId }
  );
}

/**
 * Detener una aplicación
 * GET /applications/{uuid}/stop
 */
export async function stopApplicationHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<ApplicationAction> {
  const { uuid } = parameters as StopApplicationParams;

  return context.httpClient.get<ApplicationAction>(
    `/applications/${uuid}/stop`,
    { requestId: context.requestId }
  );
}

/**
 * Reiniciar una aplicación
 * GET /applications/{uuid}/restart
 */
export async function restartApplicationHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<ApplicationAction> {
  const { uuid, force } = parameters as RestartApplicationParams;

  return context.httpClient.get<ApplicationAction>(
    `/applications/${uuid}/restart`,
    { params: { force }, requestId: context.requestId }
  );
}
