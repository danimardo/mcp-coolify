/**
 * Projects Category Tools
 * Tools para gestión de proyectos en Coolify
 *
 * Categoría: Projects
 * Tools: list, get, create, update, delete, environments (6 total)
 */

import type { ToolDefinition, ToolHandler } from "$lib/tools/types";
import { createBaseTool } from "$lib/tools/base-tool";
import {
  projectResponseSchema,
  listProjectsResponseSchema,
} from "$lib/schemas/coolify-responses";
import {
  ListProjectsSchema,
  GetProjectSchema,
  CreateProjectSchema,
  UpdateProjectSchema,
  DeleteProjectSchema,
  ListProjectEnvironmentsSchema,
  UpdateProjectResponseSchema,
  DeleteProjectResponseSchema,
  ProjectEnvironmentsListSchema,
} from "./schemas";
import {
  listProjectsHandler,
  getProjectHandler,
  createProjectHandler,
  updateProjectHandler,
  deleteProjectHandler,
  listProjectEnvironmentsHandler,
} from "./handlers";

// === list_projects ===

/**
 * Tool definition: list_projects
 */
export const listProjectsDefinition: ToolDefinition = {
  name: "list_projects",
  category: "projects",
  description: "Listar todos los proyectos con filtrado y paginación opcionales",
  summary:
    "Devuelve lista paginada de proyectos, opcionalmente filtrados por equipo",
  examples: [
    'invoke("list_projects", {}) → {projects: [...], total: 5}',
    'invoke("list_projects", {team_uuid: "550e8400-...", limit: 10}) → {projects: [...], total: 1}',
  ],
  parameters: {
    schema: ListProjectsSchema,
    description: "Filtro por equipo y paginación opcionales",
  },
  response: {
    schema: listProjectsResponseSchema,
    description: "Lista paginada de proyectos",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["projects", "list", "read"],
};

/**
 * Tool handler: list_projects
 */
export const listProjectsTool: ToolHandler = createBaseTool(
  "list_projects",
  ListProjectsSchema,
  listProjectsResponseSchema,
  listProjectsHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

// === get_project ===

/**
 * Tool definition: get_project
 */
export const getProjectDefinition: ToolDefinition = {
  name: "get_project",
  category: "projects",
  description: "Obtener un proyecto específico por UUID",
  summary: "Devuelve los detalles de un proyecto por su identificador único",
  examples: [
    'invoke("get_project", {uuid: "550e8400-e29b-41d4-a716-446655440000"}) → {id: "...", name: "..."}',
  ],
  parameters: {
    schema: GetProjectSchema,
    description: "UUID del proyecto",
  },
  response: {
    schema: projectResponseSchema,
    description: "Detalles del proyecto",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["projects", "read"],
};

/**
 * Tool handler: get_project
 */
export const getProjectTool: ToolHandler = createBaseTool(
  "get_project",
  GetProjectSchema,
  projectResponseSchema,
  getProjectHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

// === create_project ===

/**
 * Tool definition: create_project
 */
export const createProjectDefinition: ToolDefinition = {
  name: "create_project",
  category: "projects",
  description: "Crear un nuevo proyecto",
  summary:
    "Crea un nuevo proyecto con nombre y descripción opcional. Requiere confirmación.",
  examples: [
    'invoke("create_project", {name: "Mi App"}) → {id: "...", name: "Mi App"}',
    'invoke("create_project", {name: "API", description: "Servicios backend"}) → {id: "...", name: "API"}',
  ],
  parameters: {
    schema: CreateProjectSchema,
    description: "Nombre del proyecto y descripción opcional",
  },
  response: {
    schema: projectResponseSchema,
    description: "Detalles del proyecto creado",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 15000,
  tags: ["projects", "create", "write"],
};

/**
 * Tool handler: create_project
 */
export const createProjectTool: ToolHandler = createBaseTool(
  "create_project",
  CreateProjectSchema,
  projectResponseSchema,
  createProjectHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === update_project ===

/**
 * Tool definition: update_project
 */
export const updateProjectDefinition: ToolDefinition = {
  name: "update_project",
  category: "projects",
  description: "Actualizar nombre o descripción de un proyecto",
  summary: "Modifica el nombre y/o descripción del proyecto especificado",
  examples: [
    'invoke("update_project", {uuid: "...", name: "Nuevo nombre"}) → {uuid: "...", name: "Nuevo nombre"}',
  ],
  parameters: {
    schema: UpdateProjectSchema,
    required: ["uuid"],
    description: "UUID del proyecto y campos a actualizar",
  },
  response: {
    schema: UpdateProjectResponseSchema,
    description: "Proyecto actualizado",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 15000,
  tags: ["projects", "update", "write"],
};

/**
 * Tool handler: update_project
 */
export const updateProjectTool: ToolHandler = createBaseTool(
  "update_project",
  UpdateProjectSchema,
  UpdateProjectResponseSchema,
  updateProjectHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === delete_project ===

/**
 * Tool definition: delete_project
 */
export const deleteProjectDefinition: ToolDefinition = {
  name: "delete_project",
  category: "projects",
  description: "Eliminar un proyecto",
  summary: "Elimina un proyecto (operación destructiva e irreversible)",
  examples: [
    'invoke("delete_project", {uuid: "..."}) → {success: true, message: "..."}',
  ],
  parameters: {
    schema: DeleteProjectSchema,
    required: ["uuid"],
    description: "UUID del proyecto a eliminar",
  },
  response: {
    schema: DeleteProjectResponseSchema,
    description: "Confirmación de eliminación",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 30000,
  tags: ["projects", "delete", "write", "destructive"],
};

/**
 * Tool handler: delete_project
 */
export const deleteProjectTool: ToolHandler = createBaseTool(
  "delete_project",
  DeleteProjectSchema,
  DeleteProjectResponseSchema,
  deleteProjectHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === list_project_environments ===

/**
 * Tool definition: list_project_environments
 */
export const listProjectEnvironmentsDefinition: ToolDefinition = {
  name: "list_project_environments",
  category: "projects",
  description: "Listar entornos de un proyecto",
  summary: "Devuelve los entornos disponibles dentro de un proyecto",
  examples: [
    'invoke("list_project_environments", {uuid: "..."}) → {environments: [{name: "production", ...}], total: 2}',
  ],
  parameters: {
    schema: ListProjectEnvironmentsSchema,
    required: ["uuid"],
    description: "UUID del proyecto",
  },
  response: {
    schema: ProjectEnvironmentsListSchema,
    description: "Lista de entornos",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["projects", "environments", "read"],
};

/**
 * Tool handler: list_project_environments
 */
export const listProjectEnvironmentsTool: ToolHandler = createBaseTool(
  "list_project_environments",
  ListProjectEnvironmentsSchema,
  ProjectEnvironmentsListSchema,
  listProjectEnvironmentsHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

// === Colección de tools ===

/**
 * Todos los tools de la categoría Projects (6 total)
 */
export const projectsTools = [
  { definition: listProjectsDefinition, handler: listProjectsTool },
  { definition: getProjectDefinition, handler: getProjectTool },
  { definition: createProjectDefinition, handler: createProjectTool },
  { definition: updateProjectDefinition, handler: updateProjectTool },
  { definition: deleteProjectDefinition, handler: deleteProjectTool },
  { definition: listProjectEnvironmentsDefinition, handler: listProjectEnvironmentsTool },
];
