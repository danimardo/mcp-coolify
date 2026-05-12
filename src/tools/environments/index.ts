/**
 * Environments Category Tools
 * Ambientes bajo /projects/{project_uuid}/environments
 *
 * Categoría: Environments
 * Tools: list, get, create, delete = 4 total
 * (update eliminado: no existe PATCH endpoint en Coolify API v4)
 */

import type { ToolDefinition, ToolHandler } from "$lib/tools/types";
import { createBaseTool } from "$lib/tools/base-tool";
import {
  ListEnvironmentsSchema,
  GetEnvironmentSchema,
  CreateEnvironmentSchema,
  DeleteEnvironmentSchema,
  EnvironmentsListSchema,
  EnvironmentDetailSchema,
  ActionResponseSchema,
} from "./schemas";
import {
  listEnvironmentsHandler,
  getEnvironmentHandler,
  createEnvironmentHandler,
  deleteEnvironmentHandler,
} from "./handlers";

// === list_environments ===

export const listEnvironmentsDefinition: ToolDefinition = {
  name: "list_environments",
  category: "environments",
  description: "Listar ambientes de un proyecto",
  summary: "Devuelve todos los ambientes del proyecto especificado",
  examples: [
    'invoke("list_environments", {project_uuid: "550e8400-..."}) → {environments: [...], total: 3}',
  ],
  parameters: {
    schema: ListEnvironmentsSchema,
    description: "UUID del proyecto",
    required: ["project_uuid"],
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
  { requiresConfirmation: false, readOnlyBlocks: false }
);

// === get_environment ===

export const getEnvironmentDefinition: ToolDefinition = {
  name: "get_environment",
  category: "environments",
  description: "Obtener detalles de un ambiente específico",
  summary: "Devuelve configuración del ambiente por nombre o UUID",
  examples: [
    'invoke("get_environment", {project_uuid: "...", environment_name_or_uuid: "production"}) → {name: "production", ...}',
  ],
  parameters: {
    schema: GetEnvironmentSchema,
    description: "UUID del proyecto y nombre o UUID del ambiente",
    required: ["project_uuid", "environment_name_or_uuid"],
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
  { requiresConfirmation: false, readOnlyBlocks: false }
);

// === create_environment ===

export const createEnvironmentDefinition: ToolDefinition = {
  name: "create_environment",
  category: "environments",
  description: "Crear un nuevo ambiente en un proyecto",
  summary: "Crea un nuevo ambiente. Requiere confirmación.",
  examples: [
    'invoke("create_environment", {project_uuid: "...", name: "staging"}) → {uuid: "..."}',
  ],
  parameters: {
    schema: CreateEnvironmentSchema,
    description: "UUID del proyecto, nombre y descripción opcional",
    required: ["project_uuid", "name"],
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
  { requiresConfirmation: true, readOnlyBlocks: true }
);

// === delete_environment ===

export const deleteEnvironmentDefinition: ToolDefinition = {
  name: "delete_environment",
  category: "environments",
  description: "Eliminar un ambiente de un proyecto",
  summary: "Elimina un ambiente (operación destructiva). Requiere confirmación.",
  examples: [
    'invoke("delete_environment", {project_uuid: "...", environment_name_or_uuid: "staging"}) → {success: true}',
  ],
  parameters: {
    schema: DeleteEnvironmentSchema,
    required: ["project_uuid", "environment_name_or_uuid"],
    description: "UUID del proyecto y nombre o UUID del ambiente a eliminar",
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
  { requiresConfirmation: true, readOnlyBlocks: true }
);

// === Colección de tools ===

/** Todos los tools de la categoría Environments (4 total) */
export const environmentsTools = [
  { definition: listEnvironmentsDefinition, handler: listEnvironmentsTool },
  { definition: getEnvironmentDefinition, handler: getEnvironmentTool },
  { definition: createEnvironmentDefinition, handler: createEnvironmentTool },
  { definition: deleteEnvironmentDefinition, handler: deleteEnvironmentTool },
];
