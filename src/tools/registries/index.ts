/**
 * Registries Category Tools
 * Tools para gestión de registros Docker en Coolify
 *
 * Categoría: Registries
 * Tools: list, get, create, delete = 4 total
 */

import type { ToolDefinition, ToolHandler } from "$lib/tools/types";
import { createBaseTool } from "$lib/tools/base-tool";
import {
  ListRegistriesSchema,
  GetRegistrySchema,
  CreateRegistrySchema,
  DeleteRegistrySchema,
  RegistriesListSchema,
  RegistryDetailSchema,
  ActionResponseSchema,
} from "./schemas";
import {
  listRegistriesHandler,
  getRegistryHandler,
  createRegistryHandler,
  deleteRegistryHandler,
} from "./handlers";

// === list_registries ===

export const listRegistriesDefinition: ToolDefinition = {
  name: "list_registries",
  category: "registries",
  description: "Listar todos los registros Docker",
  summary: "Devuelve lista de registros configurados",
  examples: [
    'invoke("list_registries", {}) → {registries: [...], total: 3}',
  ],
  parameters: {
    schema: ListRegistriesSchema,
    description: "Paginación",
  },
  response: {
    schema: RegistriesListSchema,
    description: "Lista de registros",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["registries", "list", "read"],
};

export const listRegistriesTool: ToolHandler = createBaseTool(
  "list_registries",
  ListRegistriesSchema,
  RegistriesListSchema,
  listRegistriesHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

// === get_registry ===

export const getRegistryDefinition: ToolDefinition = {
  name: "get_registry",
  category: "registries",
  description: "Obtener detalles de un registro Docker",
  summary: "Devuelve información del registro",
  examples: [
    'invoke("get_registry", {uuid: "550e8400-..."}) → {uuid: "...", name: "docker-hub", url: "..."}',
  ],
  parameters: {
    schema: GetRegistrySchema,
    description: "UUID del registro",
  },
  response: {
    schema: RegistryDetailSchema,
    description: "Detalles del registro",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["registries", "read"],
};

export const getRegistryTool: ToolHandler = createBaseTool(
  "get_registry",
  GetRegistrySchema,
  RegistryDetailSchema,
  getRegistryHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

// === create_registry ===

export const createRegistryDefinition: ToolDefinition = {
  name: "create_registry",
  category: "registries",
  description: "Crear un nuevo registro Docker",
  summary: "Registra un nuevo registro Docker. Requiere confirmación.",
  examples: [
    'invoke("create_registry", {name: "docker-hub", url: "https://index.docker.io/v1/"}) → {uuid: "..."}',
  ],
  parameters: {
    schema: CreateRegistrySchema,
    description: "Nombre, URL, credenciales y descripción",
  },
  response: {
    schema: RegistryDetailSchema,
    description: "Registro creado",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 15000,
  tags: ["registries", "create", "write"],
};

export const createRegistryTool: ToolHandler = createBaseTool(
  "create_registry",
  CreateRegistrySchema,
  RegistryDetailSchema,
  createRegistryHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === delete_registry ===

export const deleteRegistryDefinition: ToolDefinition = {
  name: "delete_registry",
  category: "registries",
  description: "Eliminar un registro Docker",
  summary: "Desregistra un registro Docker (operación irreversible). Requiere confirmación.",
  examples: [
    'invoke("delete_registry", {uuid: "..."}) → {success: true, message: "..."}',
  ],
  parameters: {
    schema: DeleteRegistrySchema,
    required: ["uuid"],
    description: "UUID del registro a eliminar",
  },
  response: {
    schema: ActionResponseSchema,
    description: "Confirmación de eliminación",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 15000,
  tags: ["registries", "delete", "write", "destructive"],
};

export const deleteRegistryTool: ToolHandler = createBaseTool(
  "delete_registry",
  DeleteRegistrySchema,
  ActionResponseSchema,
  deleteRegistryHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === Colección de tools ===

/**
 * Todos los tools de la categoría Registries (4 total)
 */
export const registriesTools = [
  { definition: listRegistriesDefinition, handler: listRegistriesTool },
  { definition: getRegistryDefinition, handler: getRegistryTool },
  { definition: createRegistryDefinition, handler: createRegistryTool },
  { definition: deleteRegistryDefinition, handler: deleteRegistryTool },
];
