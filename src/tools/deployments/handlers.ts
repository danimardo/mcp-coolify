/**
 * Handlers para la categoría "Deployments"
 *
 * Implementa la lógica de cada tool:
 * - list_deployments    → GET  /deployments
 * - get_deployment      → GET  /deployments/{uuid}
 * - trigger_deployment  → GET  /deploy?uuid={application_uuid}
 * - cancel_deployment   → POST /deployments/{uuid}/cancel
 */

import { ExtendedToolContext } from "$lib/tools/types";

// ───────────────────────────────────────────────────────────────────
// listDeploymentsHandler
// ───────────────────────────────────────────────────────────────────

/**
 * Lista despliegues con filtros opcionales.
 * GET /deployments?application_uuid=&status=&limit=&skip=
 */
export async function listDeploymentsHandler(
  params: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { application_uuid, status, limit, skip } = params as {
    application_uuid?: string;
    status?: string;
    limit: number;
    skip: number;
  };

  const queryParams: Record<string, string> = {
    limit: String(limit),
    skip: String(skip),
  };

  if (application_uuid) {
    queryParams.application_uuid = application_uuid;
  }

  if (status) {
    queryParams.status = status;
  }

  const queryString = new URLSearchParams(queryParams).toString();

  return context.httpClient.get(`/deployments?${queryString}`, {
    requestId: context.requestId,
  });
}

// ───────────────────────────────────────────────────────────────────
// getDeploymentHandler
// ───────────────────────────────────────────────────────────────────

/**
 * Obtiene detalle de un despliegue específico.
 * GET /deployments/{uuid}
 */
export async function getDeploymentHandler(
  params: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid } = params as { uuid: string };

  return context.httpClient.get(`/deployments/${uuid}`, {
    requestId: context.requestId,
  });
}

// ───────────────────────────────────────────────────────────────────
// triggerDeploymentHandler
// ───────────────────────────────────────────────────────────────────

/**
 * Dispara un nuevo despliegue para una aplicación.
 * GET /deploy?uuid={application_uuid}&force={bool}
 *
 * Coolify v4 despliega la rama configurada en la aplicación; el endpoint /deploy
 * no acepta rama ni commit arbitrarios (solo uuid/tag/force/pr).
 */
export async function triggerDeploymentHandler(
  params: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { application_uuid, force } = params as {
    application_uuid: string;
    force?: boolean;
  };

  const queryParams = new URLSearchParams();
  queryParams.append('uuid', application_uuid);
  if (force) {
    queryParams.append('force', 'true');
  }

  const queryString = queryParams.toString();

  return context.httpClient.get(`/deploy?${queryString}`, {
    requestId: context.requestId,
  });
}

// ───────────────────────────────────────────────────────────────────
// cancelDeploymentHandler
// ───────────────────────────────────────────────────────────────────

/**
 * Cancela un despliegue en curso.
 * POST /deployments/{uuid}/cancel
 */
export async function cancelDeploymentHandler(
  params: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid } = params as { uuid: string };

  return context.httpClient.post(
    `/deployments/${uuid}/cancel`,
    {},
    {
      requestId: context.requestId,
    }
  );
}
