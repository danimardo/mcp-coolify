/**
 * Handlers para herramientas de Webhooks
 * Implementan la lógica de negocio y llamadas a la API de Coolify
 * 3 operaciones: listar, obtener, crear, eliminar webhooks
 */

import type { ExtendedToolContext } from "$lib/tools/types";
import type {
  ListWebhooksParams,
  GetWebhookParams,
  CreateWebhookParams,
  DeleteWebhookParams,
  WebhooksList,
  WebhookDetail,
} from "./schemas";

/**
 * Handler para listar webhooks
 * GET /webhooks?limit=&skip=
 */
export async function listWebhooksHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<WebhooksList> {
  const params = parameters as ListWebhooksParams;

  const queryParams = new URLSearchParams({
    limit: String(params.limit || 50),
    skip: String(params.skip || 0),
  });

  const response = await context.httpClient.get<any>(
    `/webhooks?${queryParams.toString()}`,
    {
      requestId: context.requestId,
    }
  );

  const webhooks = Array.isArray(response) ? response : response.webhooks || [];

  return {
    webhooks: webhooks.map((w: any) => ({
      uuid: w.uuid,
      url: w.url,
      events: w.events || [],
      active: w.active !== false,
      created_at: w.created_at || new Date().toISOString(),
    })),
    total: webhooks.length,
  };
}

/**
 * Handler para obtener un webhook específico
 * GET /webhooks/{uuid}
 */
export async function getWebhookHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<WebhookDetail> {
  const params = parameters as GetWebhookParams;

  const response = await context.httpClient.get<WebhookDetail>(
    `/webhooks/${params.uuid}`,
    {
      requestId: context.requestId,
    }
  );

  return response;
}

/**
 * Handler para crear un webhook
 * POST /webhooks { url, events, description, active }
 */
export async function createWebhookHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<WebhookDetail> {
  const params = parameters as CreateWebhookParams;

  const response = await context.httpClient.post<WebhookDetail>(
    "/webhooks",
    params,
    {
      requestId: context.requestId,
    }
  );

  return response;
}

/**
 * Handler para eliminar un webhook
 * DELETE /webhooks/{uuid}
 */
export async function deleteWebhookHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid } = parameters as DeleteWebhookParams;

  await context.httpClient.post(`/webhooks/${uuid}`, null, {
    requestId: context.requestId,
  });

  return {
    success: true,
    message: `Webhook ${uuid} eliminado correctamente`,
  };
}
