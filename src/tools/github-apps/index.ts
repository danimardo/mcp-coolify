/**
 * GitHub Apps Category Tools
 * Tools para gestión de aplicaciones GitHub en Coolify
 *
 * Categoría: github-apps
 * Tools: list, create, update, delete, list_repositories, list_branches = 6 total
 * (get_github_app eliminado: GET /github-apps/{uuid} no existe en Coolify API v4)
 */

import type { ToolDefinition, ToolHandler } from "$lib/tools/types";
import { createBaseTool } from "$lib/tools/base-tool";
import {
  ListGitHubAppsSchema,
  CreateGitHubAppSchema,
  UpdateGitHubAppSchema,
  DeleteGitHubAppSchema,
  ListRepositoriesSchema,
  ListBranchesSchema,
  GitHubAppsListSchema,
  GitHubAppDetailSchema,
  RepositoriesListSchema,
  BranchesListSchema,
  ActionResponseSchema,
} from "./schemas";
import {
  listGitHubAppsHandler,
  createGitHubAppHandler,
  updateGitHubAppHandler,
  deleteGitHubAppHandler,
  listRepositoriesHandler,
  listBranchesHandler,
} from "./handlers";

// === list_github_apps ===

export const listGitHubAppsDefinition: ToolDefinition = {
  name: "list_github_apps",
  category: "github-apps",
  description: "Listar todas las aplicaciones GitHub",
  summary: "Devuelve lista de aplicaciones GitHub configuradas",
  examples: ['invoke("list_github_apps", {}) → {apps: [...], total: 2}'],
  parameters: {
    schema: ListGitHubAppsSchema,
    description: "Paginación",
  },
  response: {
    schema: GitHubAppsListSchema,
    description: "Lista de aplicaciones GitHub",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["github-apps", "list", "read"],
};

export const listGitHubAppsTool: ToolHandler = createBaseTool(
  "list_github_apps",
  ListGitHubAppsSchema,
  GitHubAppsListSchema,
  listGitHubAppsHandler,
  { requiresConfirmation: false, readOnlyBlocks: false }
);

// === create_github_app ===

export const createGitHubAppDefinition: ToolDefinition = {
  name: "create_github_app",
  category: "github-apps",
  description: "Crear una nueva aplicación GitHub",
  summary: "Registra una nueva aplicación GitHub. Requiere confirmación.",
  examples: ['invoke("create_github_app", {name: "...", organization: "...", app_id: 123, client_id: "...", client_secret: "...", private_key: "..."}) → {uuid: "..."}'],
  parameters: {
    schema: CreateGitHubAppSchema,
    description: "Datos de la aplicación GitHub",
  },
  response: {
    schema: GitHubAppDetailSchema,
    description: "Aplicación creada",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 15000,
  tags: ["github-apps", "create", "write", "secret"],
};

export const createGitHubAppTool: ToolHandler = createBaseTool(
  "create_github_app",
  CreateGitHubAppSchema,
  GitHubAppDetailSchema,
  createGitHubAppHandler,
  { requiresConfirmation: true, readOnlyBlocks: true }
);

// === update_github_app ===

export const updateGitHubAppDefinition: ToolDefinition = {
  name: "update_github_app",
  category: "github-apps",
  description: "Actualizar una aplicación GitHub",
  summary: "Actualiza datos de una aplicación GitHub",
  examples: ['invoke("update_github_app", {uuid: "...", name: "new-name"}) → {uuid: "...", name: "new-name"}'],
  parameters: {
    schema: UpdateGitHubAppSchema,
    description: "UUID y datos a actualizar",
  },
  response: {
    schema: GitHubAppDetailSchema,
    description: "Aplicación actualizada",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 15000,
  tags: ["github-apps", "update", "write"],
};

export const updateGitHubAppTool: ToolHandler = createBaseTool(
  "update_github_app",
  UpdateGitHubAppSchema,
  GitHubAppDetailSchema,
  updateGitHubAppHandler,
  { requiresConfirmation: true, readOnlyBlocks: true }
);

// === delete_github_app ===

export const deleteGitHubAppDefinition: ToolDefinition = {
  name: "delete_github_app",
  category: "github-apps",
  description: "Eliminar una aplicación GitHub",
  summary: "Elimina una aplicación GitHub (irreversible). Requiere confirmación.",
  examples: ['invoke("delete_github_app", {uuid: "..."}) → {success: true}'],
  parameters: {
    schema: DeleteGitHubAppSchema,
    required: ["uuid"],
    description: "UUID de la aplicación",
  },
  response: {
    schema: ActionResponseSchema,
    description: "Confirmación de eliminación",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 15000,
  tags: ["github-apps", "delete", "write", "destructive"],
};

export const deleteGitHubAppTool: ToolHandler = createBaseTool(
  "delete_github_app",
  DeleteGitHubAppSchema,
  ActionResponseSchema,
  deleteGitHubAppHandler,
  { requiresConfirmation: true, readOnlyBlocks: true }
);

// === list_repositories ===

export const listRepositoriesDefinition: ToolDefinition = {
  name: "list_repositories",
  category: "github-apps",
  description: "Listar repositorios de una aplicación GitHub",
  summary: "Devuelve lista de repositorios accesibles",
  examples: ['invoke("list_repositories", {uuid: "..."}) → {repositories: [...], total: 10}'],
  parameters: {
    schema: ListRepositoriesSchema,
    description: "UUID de la aplicación",
  },
  response: {
    schema: RepositoriesListSchema,
    description: "Lista de repositorios",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["github-apps", "repositories", "read"],
};

export const listRepositoriesTool: ToolHandler = createBaseTool(
  "list_repositories",
  ListRepositoriesSchema,
  RepositoriesListSchema,
  listRepositoriesHandler,
  { requiresConfirmation: false, readOnlyBlocks: false }
);

// === list_branches ===

export const listBranchesDefinition: ToolDefinition = {
  name: "list_branches",
  category: "github-apps",
  description: "Listar ramas de un repositorio GitHub",
  summary: "Devuelve lista de ramas del repositorio",
  examples: ['invoke("list_branches", {uuid: "...", repository: "owner/repo"}) → {branches: [...], total: 5}'],
  parameters: {
    schema: ListBranchesSchema,
    description: "UUID y repositorio",
  },
  response: {
    schema: BranchesListSchema,
    description: "Lista de ramas",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["github-apps", "branches", "read"],
};

export const listBranchesTool: ToolHandler = createBaseTool(
  "list_branches",
  ListBranchesSchema,
  BranchesListSchema,
  listBranchesHandler,
  { requiresConfirmation: false, readOnlyBlocks: false }
);

// === Colección de tools ===

/** Todos los tools de la categoría GitHub Apps (6 total) */
export const githubAppsTools = [
  { definition: listGitHubAppsDefinition, handler: listGitHubAppsTool },
  { definition: createGitHubAppDefinition, handler: createGitHubAppTool },
  { definition: updateGitHubAppDefinition, handler: updateGitHubAppTool },
  { definition: deleteGitHubAppDefinition, handler: deleteGitHubAppTool },
  { definition: listRepositoriesDefinition, handler: listRepositoriesTool },
  { definition: listBranchesDefinition, handler: listBranchesTool },
];
