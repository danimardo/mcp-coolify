/**
 * Networks Category Tools
 * Tools para gestión de redes Docker en Coolify
 *
 * Categoría: Networks
 * Tools: list, get, create, delete = 4 total (pero 3 listados originalmente)
 */

import type { ToolDefinition, ToolHandler } from "$lib/tools/types";
import { createBaseTool } from "$lib/tools/base-tool";
import {
  ListNetworksSchema,
  GetNetworkSchema,
  CreateNetworkSchema,
  DeleteNetworkSchema,
  NetworksListSchema,
  NetworkDetailSchema,
  ActionResponseSchema,
} from "./schemas";
import {
  listNetworksHandler,
  getNetworkHandler,
  createNetworkHandler,
  deleteNetworkHandler,
} from "./handlers";

// === list_networks ===

export const listNetworksDefinition: ToolDefinition = {
  name: "list_networks",
  category: "networks",
  description: "Listar todas las redes Docker",
  summary: "Devuelve lista de redes configuradas",
  examples: [
    'invoke("list_networks", {}) → {networks: [...], total: 5}',
  ],
  parameters: {
    schema: ListNetworksSchema,
    description: "Paginación",
  },
  response: {
    schema: NetworksListSchema,
    description: "Lista de redes",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["networks", "list", "read"],
};

export const listNetworksTool: ToolHandler = createBaseTool(
  "list_networks",
  ListNetworksSchema,
  NetworksListSchema,
  listNetworksHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

// === get_network ===

export const getNetworkDefinition: ToolDefinition = {
  name: "get_network",
  category: "networks",
  description: "Obtener detalles de una red Docker",
  summary: "Devuelve información de la red",
  examples: [
    'invoke("get_network", {uuid: "550e8400-..."}) → {uuid: "...", name: "bridge-network", driver: "bridge"}',
  ],
  parameters: {
    schema: GetNetworkSchema,
    description: "UUID de la red",
  },
  response: {
    schema: NetworkDetailSchema,
    description: "Detalles de la red",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["networks", "read"],
};

export const getNetworkTool: ToolHandler = createBaseTool(
  "get_network",
  GetNetworkSchema,
  NetworkDetailSchema,
  getNetworkHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

// === create_network ===

export const createNetworkDefinition: ToolDefinition = {
  name: "create_network",
  category: "networks",
  description: "Crear una nueva red Docker",
  summary: "Crea una nueva red Docker. Requiere confirmación.",
  examples: [
    'invoke("create_network", {name: "app-network", driver: "bridge"}) → {uuid: "..."}',
  ],
  parameters: {
    schema: CreateNetworkSchema,
    description: "Nombre, driver y descripción",
  },
  response: {
    schema: NetworkDetailSchema,
    description: "Red creada",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 15000,
  tags: ["networks", "create", "write"],
};

export const createNetworkTool: ToolHandler = createBaseTool(
  "create_network",
  CreateNetworkSchema,
  NetworkDetailSchema,
  createNetworkHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === delete_network ===

export const deleteNetworkDefinition: ToolDefinition = {
  name: "delete_network",
  category: "networks",
  description: "Eliminar una red Docker",
  summary: "Elimina una red Docker (operación irreversible). Requiere confirmación.",
  examples: [
    'invoke("delete_network", {uuid: "..."}) → {success: true, message: "..."}',
  ],
  parameters: {
    schema: DeleteNetworkSchema,
    required: ["uuid"],
    description: "UUID de la red a eliminar",
  },
  response: {
    schema: ActionResponseSchema,
    description: "Confirmación de eliminación",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 15000,
  tags: ["networks", "delete", "write", "destructive"],
};

export const deleteNetworkTool: ToolHandler = createBaseTool(
  "delete_network",
  DeleteNetworkSchema,
  ActionResponseSchema,
  deleteNetworkHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === Colección de tools ===

/**
 * Todos los tools de la categoría Networks (4 total)
 */
export const networksTools = [
  { definition: listNetworksDefinition, handler: listNetworksTool },
  { definition: getNetworkDefinition, handler: getNetworkTool },
  { definition: createNetworkDefinition, handler: createNetworkTool },
  { definition: deleteNetworkDefinition, handler: deleteNetworkTool },
];
