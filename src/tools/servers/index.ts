/**
 * Servers Category Tools
 * Herramientas para gestionar servidores en Coolify
 *
 * Categoría: servers
 * Operaciones de lectura: list, get, validate, resources, domains
 * Operaciones de escritura: create, update, delete (requieren confirmación)
 */

import type { ToolDefinition, ToolHandler } from "$lib/tools/types";
import { createBaseTool } from "$lib/tools/base-tool";
import {
  ListServersSchema,
  GetServerSchema,
  CreateServerSchema,
  UpdateServerSchema,
  DeleteServerSchema,
  ValidateServerSchema,
  GetServerResourcesSchema,
  GetServerDomainsSchema,
  ServersListSchema,
  ServerDetailSchema,
  CreateServerResponseSchema,
  UpdateServerResponseSchema,
  DeleteServerResponseSchema,
  ValidateServerResponseSchema,
  ServerResourcesSchema,
  ServerDomainsListSchema,
} from "./schemas";
import {
  listServersHandler,
  getServerHandler,
  createServerHandler,
  updateServerHandler,
  deleteServerHandler,
  validateServerHandler,
  getServerResourcesHandler,
  getServerDomainsHandler,
} from "./handlers";

// ============================================================
// list_servers
// ============================================================

export const listServersDefinition: ToolDefinition = {
  name: "list_servers",
  category: "servers",
  description: "Lista todos los servidores conectados a Coolify",
  summary: "Devuelve lista de todos los servidores con estado e información básica",
  examples: [
    'invoke("list_servers", {}) → {servers: [...], total: 3}',
  ],
  parameters: {
    schema: ListServersSchema,
    description: "Sin parámetros requeridos",
  },
  response: {
    schema: ServersListSchema,
    description: "Lista de servidores con total",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["servers", "list", "read"],
};

export const listServersTool: ToolHandler = createBaseTool(
  "list_servers",
  ListServersSchema,
  ServersListSchema,
  listServersHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

// ============================================================
// get_server
// ============================================================

export const getServerDefinition: ToolDefinition = {
  name: "get_server",
  category: "servers",
  description: "Obtiene detalles completos de un servidor",
  summary: "Devuelve información detallada del servidor incluyendo SO y versión Docker",
  examples: [
    'invoke("get_server", {uuid: "server-uuid"}) → {uuid: "...", name: "prod-1", os: "Ubuntu 22.04", ...}',
  ],
  parameters: {
    schema: GetServerSchema,
    required: ["uuid"],
    description: "UUID del servidor a consultar",
  },
  response: {
    schema: ServerDetailSchema,
    description: "Detalle completo del servidor",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["servers", "detail", "read"],
};

export const getServerTool: ToolHandler = createBaseTool(
  "get_server",
  GetServerSchema,
  ServerDetailSchema,
  getServerHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

// ============================================================
// create_server
// ============================================================

export const createServerDefinition: ToolDefinition = {
  name: "create_server",
  category: "servers",
  description: "Crea/registra un nuevo servidor en Coolify",
  summary: "Registra un servidor con su IP y credenciales SSH",
  examples: [
    'invoke("create_server", {name: "prod-2", ip: "192.168.1.20"}) → {uuid: "...", status: "pending"}',
  ],
  parameters: {
    schema: CreateServerSchema,
    required: ["name", "ip"],
    description: "Nombre, IP, puerto SSH opcional y usuario SSH opcional",
  },
  response: {
    schema: CreateServerResponseSchema,
    description: "Servidor creado con UUID y estado inicial",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 30000,
  tags: ["servers", "create", "write"],
};

export const createServerTool: ToolHandler = createBaseTool(
  "create_server",
  CreateServerSchema,
  CreateServerResponseSchema,
  createServerHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// ============================================================
// update_server
// ============================================================

export const updateServerDefinition: ToolDefinition = {
  name: "update_server",
  category: "servers",
  description: "Actualiza información de un servidor",
  summary: "Modifica nombre, IP u otros parámetros del servidor",
  examples: [
    'invoke("update_server", {uuid: "server-uuid", name: "prod-1-new"}) → {uuid: "...", name: "prod-1-new", ...}',
  ],
  parameters: {
    schema: UpdateServerSchema,
    required: ["uuid"],
    description: "UUID del servidor y campos opcionales a actualizar",
  },
  response: {
    schema: UpdateServerResponseSchema,
    description: "Servidor actualizado con nuevos valores",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 30000,
  tags: ["servers", "update", "write"],
};

export const updateServerTool: ToolHandler = createBaseTool(
  "update_server",
  UpdateServerSchema,
  UpdateServerResponseSchema,
  updateServerHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// ============================================================
// delete_server
// ============================================================

export const deleteServerDefinition: ToolDefinition = {
  name: "delete_server",
  category: "servers",
  description: "Elimina un servidor de Coolify",
  summary: "Desconecta y elimina un servidor (operación destructiva)",
  examples: [
    'invoke("delete_server", {uuid: "server-uuid"}) → {success: true, message: "Servidor eliminado"}',
  ],
  parameters: {
    schema: DeleteServerSchema,
    required: ["uuid"],
    description: "UUID del servidor a eliminar",
  },
  response: {
    schema: DeleteServerResponseSchema,
    description: "Confirmación de eliminación",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 30000,
  tags: ["servers", "delete", "write", "destructive"],
};

export const deleteServerTool: ToolHandler = createBaseTool(
  "delete_server",
  DeleteServerSchema,
  DeleteServerResponseSchema,
  deleteServerHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// ============================================================
// validate_server
// ============================================================

export const validateServerDefinition: ToolDefinition = {
  name: "validate_server",
  category: "servers",
  description: "Valida conectividad y configuración de un servidor",
  summary: "Verifica que el servidor sea accesible y esté correctamente configurado",
  examples: [
    'invoke("validate_server", {uuid: "server-uuid"}) → {status: "ok", message: "Server is reachable..."}',
  ],
  parameters: {
    schema: ValidateServerSchema,
    required: ["uuid"],
    description: "UUID del servidor a validar",
  },
  response: {
    schema: ValidateServerResponseSchema,
    description: "Estado de validación con detalles",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 15000,
  tags: ["servers", "validate", "read"],
};

export const validateServerTool: ToolHandler = createBaseTool(
  "validate_server",
  ValidateServerSchema,
  ValidateServerResponseSchema,
  validateServerHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

// ============================================================
// get_server_resources
// ============================================================

export const getServerResourcesDefinition: ToolDefinition = {
  name: "get_server_resources",
  category: "servers",
  description: "Obtiene uso de recursos del servidor (CPU, RAM, disco)",
  summary: "Devuelve porcentajes y valores absolutos de recursos en tiempo real",
  examples: [
    'invoke("get_server_resources", {uuid: "server-uuid"}) → {cpu_usage_percent: 45.2, memory_usage_percent: 62.8, ...}',
  ],
  parameters: {
    schema: GetServerResourcesSchema,
    required: ["uuid"],
    description: "UUID del servidor",
  },
  response: {
    schema: ServerResourcesSchema,
    description: "Métricas de CPU, memoria, disco y uptime",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["servers", "resources", "metrics", "read"],
};

export const getServerResourcesTool: ToolHandler = createBaseTool(
  "get_server_resources",
  GetServerResourcesSchema,
  ServerResourcesSchema,
  getServerResourcesHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

// ============================================================
// get_server_domains
// ============================================================

export const getServerDomainsDefinition: ToolDefinition = {
  name: "get_server_domains",
  category: "servers",
  description: "Lista dominios asignados a un servidor",
  summary: "Devuelve todos los dominios que apuntan a aplicaciones en el servidor",
  examples: [
    'invoke("get_server_domains", {uuid: "server-uuid"}) → {domains: [{domain: "app.example.com", ...}], total: 2}',
  ],
  parameters: {
    schema: GetServerDomainsSchema,
    required: ["uuid"],
    description: "UUID del servidor",
  },
  response: {
    schema: ServerDomainsListSchema,
    description: "Lista de dominios con estados de certificado",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["servers", "domains", "read"],
};

export const getServerDomainsTool: ToolHandler = createBaseTool(
  "get_server_domains",
  GetServerDomainsSchema,
  ServerDomainsListSchema,
  getServerDomainsHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

// ============================================================
// Colección de herramientas de la categoría
// ============================================================

/**
 * Todas las herramientas de la categoría servers (8 tools)
 */
export const serversTools = [
  { definition: listServersDefinition, handler: listServersTool },
  { definition: getServerDefinition, handler: getServerTool },
  { definition: createServerDefinition, handler: createServerTool },
  { definition: updateServerDefinition, handler: updateServerTool },
  { definition: deleteServerDefinition, handler: deleteServerTool },
  { definition: validateServerDefinition, handler: validateServerTool },
  { definition: getServerResourcesDefinition, handler: getServerResourcesTool },
  { definition: getServerDomainsDefinition, handler: getServerDomainsTool },
];
