/**
 * Zod schemas para herramientas de Ambientes
 * Ambientes se gestionan bajo /projects/{project_uuid}/environments
 */

import { z } from "zod";

// ============================================================
// PARÁMETROS
// ============================================================

export const ListEnvironmentsSchema = z.object({
  project_uuid: z.string().uuid().describe("UUID del proyecto"),
}).strict();

export const GetEnvironmentSchema = z.object({
  project_uuid: z.string().uuid().describe("UUID del proyecto"),
  environment_name_or_uuid: z.string().min(1).describe("Nombre o UUID del ambiente"),
}).strict();

export const CreateEnvironmentSchema = z.object({
  project_uuid: z.string().uuid().describe("UUID del proyecto"),
  name: z.string().min(1).describe("Nombre del ambiente"),
  description: z.string().optional().describe("Descripción"),
}).strict();

export const DeleteEnvironmentSchema = z.object({
  project_uuid: z.string().uuid().describe("UUID del proyecto"),
  environment_name_or_uuid: z.string().min(1).describe("Nombre o UUID del ambiente a eliminar"),
}).strict();

// ============================================================
// RESPUESTAS
// ============================================================

export const EnvironmentSchema = z.object({
  uuid: z.string().optional(),
  name: z.string(),
  project_uuid: z.string().optional(),
  created_at: z.string().datetime().optional(),
});

export const EnvironmentDetailSchema = EnvironmentSchema.extend({
  description: z.string().optional(),
});

export const EnvironmentsListSchema = z.object({
  environments: z.array(EnvironmentSchema),
  total: z.number().int(),
});

export const ActionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// ============================================================
// TIPOS INFERIDOS
// ============================================================

export type ListEnvironmentsParams = z.infer<typeof ListEnvironmentsSchema>;
export type GetEnvironmentParams = z.infer<typeof GetEnvironmentSchema>;
export type CreateEnvironmentParams = z.infer<typeof CreateEnvironmentSchema>;
export type DeleteEnvironmentParams = z.infer<typeof DeleteEnvironmentSchema>;

export type Environment = z.infer<typeof EnvironmentSchema>;
export type EnvironmentDetail = z.infer<typeof EnvironmentDetailSchema>;
export type EnvironmentsList = z.infer<typeof EnvironmentsListSchema>;
export type ActionResponse = z.infer<typeof ActionResponseSchema>;
