/**
 * Handlers de la categoría Teams
 * Cada handler consulta la API de Coolify y transforma la respuesta
 * al formato esperado por el schema de salida
 */

import { z } from "zod";
import type { ExtendedToolContext } from "$lib/tools/types";
import {
  teamResponseSchema,
  listTeamsResponseSchema,
  teamMemberResponseSchema,
} from "$lib/schemas/coolify-responses";

/** Obtiene el equipo actual del usuario autenticado */
export async function getCurrentTeamHandler(
  _parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const raw = await context.httpClient.get("/teams/current", {
    requestId: context.requestId,
  });

  const team = teamResponseSchema.parse(raw);

  return {
    uuid: team.id,
    name: team.name,
    description: team.description ?? null,
    created_at: team.createdAt ?? null,
    members_count: 0,
  };
}

/** Lista todos los equipos visibles para el usuario autenticado */
export async function listAllTeamsHandler(
  _parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const raw = await context.httpClient.get("/teams", {
    requestId: context.requestId,
  });

  const response = listTeamsResponseSchema.parse(raw);

  return {
    teams: response.teams.map((team) => ({
      uuid: team.id,
      name: team.name,
      description: team.description ?? null,
      created_at: team.createdAt ?? null,
    })),
    total: response.total,
  };
}

/** Obtiene un equipo específico por su UUID */
export async function getTeamByIdHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid } = parameters as { uuid: string };
  const raw = await context.httpClient.get(`/teams/${uuid}`, {
    requestId: context.requestId,
  });

  const team = teamResponseSchema.parse(raw);

  return {
    uuid: team.id,
    name: team.name,
    description: team.description ?? null,
    created_at: team.createdAt ?? null,
    members_count: 0,
  };
}

/** Obtiene los miembros del equipo actual */
export async function getCurrentTeamMembersHandler(
  _parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const raw = await context.httpClient.get("/teams/current/members", {
    requestId: context.requestId,
  });

  const members = z.array(teamMemberResponseSchema).parse(raw);

  return {
    members: members.map((member) => ({
      uuid: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
    })),
    total: members.length,
  };
}
