/**
 * Environments Category Tools
 * Tools para gestión de ambientes en Coolify
 *
 * Categoría: Environments
 * Tools: list, get, create, update, delete = 4 total
 */

import type { ToolDefinition, ToolHandler } from "$lib/tools/types";
import { createBaseTool } from "$lib/tools/base-tool";
import {
  ListEnvironmentsSchema,
  GetEnvironmentSchema,
  CreateEnvironmentSchema,
  UpdateEnvironmentSchema,
  DeleteEnvironmentSchema,
  EnvironmentsListSchema,
  EnvironmentDetailSchema,
  ActionResponseSchema,
} from "./schemas";
import {
  listEnvironmentsHandler,
  getEnvironmentHandler,
  createEnvironmentHandler,
  updateEnvironmentHandler,
  deleteEnvironmentHandler,
} from "./handlers";

// === list_environments ===

export const listEnvironmentsDefinition: ToolDefinition = {
  name: "list_environments",
  category: "environments",
  description: "Listar todos los ambientes",
  summary: "Devuelve lista de ambientes con filtrado y paginación",
  examples: [
    'invoke("list_environments", {}) → {environments: [...], total: 3}',
    'invoke("list_environments", {project_uuid: "...", limit: 20}) → {environments: [...], total: 2}',
  ],
  parameters: {
    schema: ListEnvironmentsSchema,
    description: "Filtro por proyecto y paginación",
  },
  response: {
    schema: EnvironmentsListSchema,
    description: "Lista de ambientes",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["environments", "list", "read"],
};

export const listEnvironmentsTool: ToolHandler = createBaseTool(
  "list_environments",
  ListEnvironmentsSchema,
  EnvironmentsListSchema,
  listEnvironmentsHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

// === get_environment ===

export const getEnvironmentDefinition: ToolDefinition = {
  name: "get_environment",
  category: "environments",
  description: "Obtener detalles de un ambiente específico",
  summary: "Devuelve configuración y recursos del ambiente",
  examples: [
    'invoke("get_environment", {uuid: "550e8400-..."}) → {uuid: "...", name: "production", ...}',
  ],
  parameters: {
    schema: GetEnvironmentSchema,
    description: "UUID del ambiente",
  },
  response: {
    schema: EnvironmentDetailSchema,
    description: "Detalles del ambiente",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["environments", "read"],
};

export const getEnvironmentTool: ToolHandler = createBaseTool(
  "get_environment",
  GetEnvironmentSchema,
  EnvironmentDetailSchema,
  getEnvironmentHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

// === create_environment ===

export const createEnvironmentDefinition: ToolDefinition = {
  name: "create_environment",
  category: "environments",
  description: "Crear un nuevo ambiente",
  summary: "Crea un nuevo ambiente en un proyecto. Requiere confirmación.",
  examples: [
    'invoke("create_environment", {project_uuid: "...", name: "staging"}) → {uuid: "..."}',
  ],
  parameters: {
    schema: CreateEnvironmentSchema,
    description: "Proyecto, nombre y descripción opcional",
  },
  response: {
    schema: EnvironmentDetailSchema,
    description: "Ambiente creado",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 15000,
  tags: ["environments", "create", "write"],
};

export const createEnvironmentTool: ToolHandler = createBaseTool(
  "create_environment",
  CreateEnvironmentSchema,
  EnvironmentDetailSchema,
  createEnvironmentHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === update_environment ===

export const updateEnvironmentDefinition: ToolDefinition = {
  name: "update_environment",
  category: "environments",
  description: "Actualizar configuración de un ambiente",
  summary: "Modifica nombre o descripción del ambiente",
  examples: [
    'invoke("update_environment", {uuid: "...", name: "staging-v2"}) → {uuid: "..."}',
  ],
  parameters: {
    schema: UpdateEnvironmentSchema,
    required: ["uuid"],
    description: "UUID y campos a actualizar",
  },
  response: {
    schema: EnvironmentDetailSchema,
    description: "Ambiente actualizado",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 15000,
  tags: ["environments", "update", "write"],
};

export const updateEnvironmentTool: ToolHandler = createBaseTool(
  "update_environment",
  UpdateEnvironmentSchema,
  EnvironmentDetailSchema,
  updateEnvironmentHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === delete_environment ===

export const deleteEnvironmentDefinition: ToolDefinition = {
  name: "delete_environment",
  category: "environments",
  description: "Eliminar un ambiente",
  summary: "Elimina un ambiente (operación destructiva). Requiere confirmación.",
  examples: [
    'invoke("delete_environment", {uuid: "..."}) → {success: true, message: "..."}',
  ],
  parameters: {
    schema: DeleteEnvironmentSchema,
    required: ["uuid"],
    description: "UUID del ambiente a eliminar",
  },
  response: {
    schema: ActionResponseSchema,
    description: "Confirmación de eliminación",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 20000,
  tags: ["environments", "delete", "write", "destructive"],
};

export const deleteEnvironmentTool: ToolHandler = createBaseTool(
  "delete_environment",
  DeleteEnvironmentSchema,
  ActionResponseSchema,
  deleteEnvironmentHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === Colección de tools ===

/**
 * Todos los tools de la categoría Environments (4 total)
 */
export const environmentsTools = [
  { definition: listEnvironmentsDefinition, handler: listEnvironmentsTool },
  { definition: getEnvironmentDefinition, handler: getEnvironmentTool },
  { definition: createEnvironmentDefinition, handler: createEnvironmentTool },
  { definition: updateEnvironmentDefinition, handler: updateEnvironmentTool },
  { definition: deleteEnvironmentDefinition, handler: deleteEnvironmentTool },
];
