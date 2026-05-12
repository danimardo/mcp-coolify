/**
 * Tools de la Categoría Teams
 * Tools para consultar equipos en Coolify
 */

export { getCurrentTeamHandler, listAllTeamsHandler, getTeamByIdHandler, getCurrentTeamMembersHandler } from "./handlers";
export {
  GetCurrentTeamSchema,
  ListAllTeamsSchema,
  GetTeamByIdSchema,
  GetCurrentTeamMembersSchema,
  TeamSchema,
  TeamDetailSchema,
  TeamMemberSchema,
  TeamsListSchema,
  TeamMembersListSchema,
} from "./schemas";

import { ToolDefinition, ToolHandler } from "$lib/tools/types";
import { createBaseTool } from "$lib/tools/base-tool";
import {
  GetCurrentTeamSchema,
  ListAllTeamsSchema,
  GetTeamByIdSchema,
  GetCurrentTeamMembersSchema,
  TeamDetailSchema,
  TeamsListSchema,
  TeamMembersListSchema,
} from "./schemas";
import {
  getCurrentTeamHandler,
  listAllTeamsHandler,
  getTeamByIdHandler,
  getCurrentTeamMembersHandler,
} from "./handlers";

export const getCurrentTeamDefinition: ToolDefinition = {
  name: "get_current_team",
  category: "teams",
  description: "Obtiene el equipo actual del usuario autenticado",
  summary: "Devuelve la información del equipo actual con su nombre, descripción y cantidad de miembros",
  examples: [
    'invoke("get_current_team", {}) → {uuid: "...", name: "My Team", members_count: 5}',
  ],
  parameters: {
    schema: GetCurrentTeamSchema,
    description: "No requiere parámetros",
  },
  response: {
    schema: TeamDetailSchema,
    description: "Información del equipo actual incluyendo cantidad de miembros",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["teams", "current", "read"],
};

export const listAllTeamsDefinition: ToolDefinition = {
  name: "list_all_teams",
  category: "teams",
  description: "Lista todos los equipos visibles para el usuario autenticado",
  summary: "Devuelve un array de equipos con su información básica y el total",
  examples: [
    'invoke("list_all_teams", {}) → {teams: [...], total: 3}',
  ],
  parameters: {
    schema: ListAllTeamsSchema,
    description: "No requiere parámetros",
  },
  response: {
    schema: TeamsListSchema,
    description: "Lista de equipos con total",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["teams", "list", "read"],
};

export const getTeamByIdDefinition: ToolDefinition = {
  name: "get_team_by_id",
  category: "teams",
  description: "Obtiene la información de un equipo específico por su UUID",
  summary: "Devuelve los detalles del equipo incluyendo la cantidad de miembros",
  examples: [
    'invoke("get_team_by_id", {uuid: "550e8400-e29b-41d4-a716-446655440000"}) → {uuid: "...", name: "Team", members_count: 10}',
  ],
  parameters: {
    schema: GetTeamByIdSchema,
    description: "Requiere el UUID v4 del equipo",
    required: ["uuid"],
  },
  response: {
    schema: TeamDetailSchema,
    description: "Detalles del equipo con cantidad de miembros",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["teams", "detail", "read"],
};

export const getCurrentTeamMembersDefinition: ToolDefinition = {
  name: "get_current_team_members",
  category: "teams",
  description: "Obtiene la lista de miembros del equipo actual del usuario autenticado",
  summary: "Devuelve los miembros del equipo con su nombre, email y rol",
  examples: [
    'invoke("get_current_team_members", {}) → {members: [...], total: 5}',
  ],
  parameters: {
    schema: GetCurrentTeamMembersSchema,
    description: "No requiere parámetros",
  },
  response: {
    schema: TeamMembersListSchema,
    description: "Lista de miembros del equipo actual con total",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["teams", "members", "read"],
};

export const getCurrentTeamTool: ToolHandler = createBaseTool(
  "get_current_team",
  GetCurrentTeamSchema,
  TeamDetailSchema,
  getCurrentTeamHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

export const listAllTeamsTool: ToolHandler = createBaseTool(
  "list_all_teams",
  ListAllTeamsSchema,
  TeamsListSchema,
  listAllTeamsHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

export const getTeamByIdTool: ToolHandler = createBaseTool(
  "get_team_by_id",
  GetTeamByIdSchema,
  TeamDetailSchema,
  getTeamByIdHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

export const getCurrentTeamMembersTool: ToolHandler = createBaseTool(
  "get_current_team_members",
  GetCurrentTeamMembersSchema,
  TeamMembersListSchema,
  getCurrentTeamMembersHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

/** Todos los tools de la categoría Teams */
export const teamsTools = [
  { definition: getCurrentTeamDefinition, handler: getCurrentTeamTool },
  { definition: listAllTeamsDefinition, handler: listAllTeamsTool },
  { definition: getTeamByIdDefinition, handler: getTeamByIdTool },
  { definition: getCurrentTeamMembersDefinition, handler: getCurrentTeamMembersTool },
];
