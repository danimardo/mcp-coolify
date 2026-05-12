/**
 * Gits Category Tools
 * Tools para gestión de repositorios Git en Coolify
 *
 * Categoría: Gits
 * Tools: list, get, create, delete = 4 total
 */

import type { ToolDefinition, ToolHandler } from "$lib/tools/types";
import { createBaseTool } from "$lib/tools/base-tool";
import {
  ListGitRepositoriesSchema,
  GetGitRepositorySchema,
  CreateGitRepositorySchema,
  DeleteGitRepositorySchema,
  GitRepositoriesListSchema,
  GitRepositoryDetailSchema,
  ActionResponseSchema,
} from "./schemas";
import {
  listGitRepositoriesHandler,
  getGitRepositoryHandler,
  createGitRepositoryHandler,
  deleteGitRepositoryHandler,
} from "./handlers";

// === list_git_repositories ===

export const listGitRepositoriesDefinition: ToolDefinition = {
  name: "list_git_repositories",
  category: "gits",
  description: "Listar todos los repositorios Git",
  summary: "Devuelve lista de repositorios Git configurados",
  examples: [
    'invoke("list_git_repositories", {}) → {repositories: [...], total: 5}',
  ],
  parameters: {
    schema: ListGitRepositoriesSchema,
    description: "Paginación",
  },
  response: {
    schema: GitRepositoriesListSchema,
    description: "Lista de repositorios",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["gits", "list", "read"],
};

export const listGitRepositoriesTool: ToolHandler = createBaseTool(
  "list_git_repositories",
  ListGitRepositoriesSchema,
  GitRepositoriesListSchema,
  listGitRepositoriesHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

// === get_git_repository ===

export const getGitRepositoryDefinition: ToolDefinition = {
  name: "get_git_repository",
  category: "gits",
  description: "Obtener detalles de un repositorio Git",
  summary: "Devuelve información del repositorio",
  examples: [
    'invoke("get_git_repository", {uuid: "550e8400-..."}) → {uuid: "...", name: "myrepo", url: "..."}',
  ],
  parameters: {
    schema: GetGitRepositorySchema,
    description: "UUID del repositorio",
  },
  response: {
    schema: GitRepositoryDetailSchema,
    description: "Detalles del repositorio",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["gits", "read"],
};

export const getGitRepositoryTool: ToolHandler = createBaseTool(
  "get_git_repository",
  GetGitRepositorySchema,
  GitRepositoryDetailSchema,
  getGitRepositoryHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

// === create_git_repository ===

export const createGitRepositoryDefinition: ToolDefinition = {
  name: "create_git_repository",
  category: "gits",
  description: "Crear un nuevo repositorio Git",
  summary: "Registra un nuevo repositorio Git. Requiere confirmación.",
  examples: [
    'invoke("create_git_repository", {name: "myrepo", url: "https://github.com/user/repo"}) → {uuid: "..."}',
  ],
  parameters: {
    schema: CreateGitRepositorySchema,
    description: "Nombre, URL, privado y descripción opcional",
  },
  response: {
    schema: GitRepositoryDetailSchema,
    description: "Repositorio creado",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 15000,
  tags: ["gits", "create", "write"],
};

export const createGitRepositoryTool: ToolHandler = createBaseTool(
  "create_git_repository",
  CreateGitRepositorySchema,
  GitRepositoryDetailSchema,
  createGitRepositoryHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === delete_git_repository ===

export const deleteGitRepositoryDefinition: ToolDefinition = {
  name: "delete_git_repository",
  category: "gits",
  description: "Eliminar un repositorio Git",
  summary: "Desregistra un repositorio Git (operación irreversible). Requiere confirmación.",
  examples: [
    'invoke("delete_git_repository", {uuid: "..."}) → {success: true, message: "..."}',
  ],
  parameters: {
    schema: DeleteGitRepositorySchema,
    required: ["uuid"],
    description: "UUID del repositorio a eliminar",
  },
  response: {
    schema: ActionResponseSchema,
    description: "Confirmación de eliminación",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 15000,
  tags: ["gits", "delete", "write", "destructive"],
};

export const deleteGitRepositoryTool: ToolHandler = createBaseTool(
  "delete_git_repository",
  DeleteGitRepositorySchema,
  ActionResponseSchema,
  deleteGitRepositoryHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === Colección de tools ===

/**
 * Todos los tools de la categoría Gits (4 total)
 */
export const gitsTools = [
  { definition: listGitRepositoriesDefinition, handler: listGitRepositoriesTool },
  { definition: getGitRepositoryDefinition, handler: getGitRepositoryTool },
  { definition: createGitRepositoryDefinition, handler: createGitRepositoryTool },
  { definition: deleteGitRepositoryDefinition, handler: deleteGitRepositoryTool },
];
