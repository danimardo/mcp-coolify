/**
 * Schemas para la categoría Teams
 * Schemas de parámetros de entrada y schemas de salida para validación
 */

import { z } from "zod";
import { coolifyTeamIdSchema } from "$lib/schemas/common";

/**
 * Schemas de parámetros para cada tool
 */

/** No requiere parámetros */
export const GetCurrentTeamSchema = z.object({}).strict();

/** No requiere parámetros */
export const ListAllTeamsSchema = z.object({}).strict();

/** Requiere UUID v4 del equipo */
export const GetTeamByIdSchema = z.object({
  uuid: coolifyTeamIdSchema,
});

/** No requiere parámetros */
export const GetCurrentTeamMembersSchema = z.object({}).strict();

/**
 * Schemas de salida
 */

/** Información básica de un equipo */
export const TeamSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  created_at: z.string().datetime().optional(),
});

/** Información detallada de un equipo incluyendo cantidad de miembros */
export const TeamDetailSchema = TeamSchema.extend({
  members_count: z.number().int().min(0),
});

/** Información de un miembro del equipo */
export const TeamMemberSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(["owner", "admin", "member"]),
});

/** Lista de equipos con total */
export const TeamsListSchema = z.object({
  teams: z.array(TeamSchema),
  total: z.number().int(),
});

/** Lista de miembros con total */
export const TeamMembersListSchema = z.object({
  members: z.array(TeamMemberSchema),
  total: z.number().int(),
});
