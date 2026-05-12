/**
 * Webhooks Category Tools
 * Tools para gestión de webhooks en Coolify
 *
 * Categoría: Webhooks
 * Tools: list, get, create, delete = 4 total
 */

import type { ToolDefinition, ToolHandler } from "$lib/tools/types";
import { createBaseTool } from "$lib/tools/base-tool";
import {
  ListWebhooksSchema,
  GetWebhookSchema,
  CreateWebhookSchema,
  DeleteWebhookSchema,
  WebhooksListSchema,
  WebhookDetailSchema,
  ActionResponseSchema,
} from "./schemas";
import {
  listWebhooksHandler,
  getWebhookHandler,
  createWebhookHandler,
  deleteWebhookHandler,
} from "./handlers";

// === list_webhooks ===

export const listWebhooksDefinition: ToolDefinition = {
  name: "list_webhooks",
  category: "webhooks",
  description: "Listar todos los webhooks",
  summary: "Devuelve lista de webhooks configurados",
  examples: [
    'invoke("list_webhooks", {}) → {webhooks: [...], total: 5}',
  ],
  parameters: {
    schema: ListWebhooksSchema,
    description: "Paginación",
  },
  response: {
    schema: WebhooksListSchema,
    description: "Lista de webhooks",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["webhooks", "list", "read"],
};

export const listWebhooksTool: ToolHandler = createBaseTool(
  "list_webhooks",
  ListWebhooksSchema,
  WebhooksListSchema,
  listWebhooksHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

// === get_webhook ===

export const getWebhookDefinition: ToolDefinition = {
  name: "get_webhook",
  category: "webhooks",
  description: "Obtener detalles de un webhook",
  summary: "Devuelve información del webhook",
  examples: [
    'invoke("get_webhook", {uuid: "550e8400-..."}) → {uuid: "...", url: "...", events: [...]}',
  ],
  parameters: {
    schema: GetWebhookSchema,
    description: "UUID del webhook",
  },
  response: {
    schema: WebhookDetailSchema,
    description: "Detalles del webhook",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["webhooks", "read"],
};

export const getWebhookTool: ToolHandler = createBaseTool(
  "get_webhook",
  GetWebhookSchema,
  WebhookDetailSchema,
  getWebhookHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

// === create_webhook ===

export const createWebhookDefinition: ToolDefinition = {
  name: "create_webhook",
  category: "webhooks",
  description: "Crear un nuevo webhook",
  summary: "Registra un nuevo webhook. Requiere confirmación.",
  examples: [
    'invoke("create_webhook", {url: "https://example.com/hook", events: ["deployment"]}) → {uuid: "..."}',
  ],
  parameters: {
    schema: CreateWebhookSchema,
    description: "URL, eventos, descripción y activo",
  },
  response: {
    schema: WebhookDetailSchema,
    description: "Webhook creado",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 15000,
  tags: ["webhooks", "create", "write"],
};

export const createWebhookTool: ToolHandler = createBaseTool(
  "create_webhook",
  CreateWebhookSchema,
  WebhookDetailSchema,
  createWebhookHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === delete_webhook ===

export const deleteWebhookDefinition: ToolDefinition = {
  name: "delete_webhook",
  category: "webhooks",
  description: "Eliminar un webhook",
  summary: "Elimina un webhook (operación irreversible). Requiere confirmación.",
  examples: [
    'invoke("delete_webhook", {uuid: "..."}) → {success: true, message: "..."}',
  ],
  parameters: {
    schema: DeleteWebhookSchema,
    required: ["uuid"],
    description: "UUID del webhook a eliminar",
  },
  response: {
    schema: ActionResponseSchema,
    description: "Confirmación de eliminación",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 15000,
  tags: ["webhooks", "delete", "write", "destructive"],
};

export const deleteWebhookTool: ToolHandler = createBaseTool(
  "delete_webhook",
  DeleteWebhookSchema,
  ActionResponseSchema,
  deleteWebhookHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === Colección de tools ===

/**
 * Todos los tools de la categoría Webhooks (4 total)
 */
export const webhooksTools = [
  { definition: listWebhooksDefinition, handler: listWebhooksTool },
  { definition: getWebhookDefinition, handler: getWebhookTool },
  { definition: createWebhookDefinition, handler: createWebhookTool },
  { definition: deleteWebhookDefinition, handler: deleteWebhookTool },
];
