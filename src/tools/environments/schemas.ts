/**
 * Zod schemas para herramientas de Ambientes
 * 4 herramientas para gestión de ambientes: listar, obtener, crear, actualizar, eliminar
 */

import { z } from "zod";

// ============================================================
// PARÁMETROS
// ============================================================

export const ListEnvironmentsSchema = z.object({
  project_uuid: z.string().uuid().optional().describe("Filtrar por proyecto"),
  limit: z.number().int().min(1).max(100).default(50).describe("Elementos por página"),
  skip: z.number().int().min(0).default(0).describe("Offset"),
}).strict();

export const GetEnvironmentSchema = z.object({
  uuid: z.string().uuid().describe("UUID del ambiente"),
}).strict();

export const CreateEnvironmentSchema = z.object({
  project_uuid: z.string().uuid().describe("UUID del proyecto"),
  name: z.string().min(1).describe("Nombre del ambiente"),
  description: z.string().optional().describe("Descripción"),
}).strict();

export const UpdateEnvironmentSchema = z.object({
  uuid: z.string().uuid().describe("UUID del ambiente"),
  name: z.string().min(1).optional().describe("Nuevo nombre"),
  description: z.string().optional().describe("Nueva descripción"),
}).strict();

export const DeleteEnvironmentSchema = z.object({
  uuid: z.string().uuid().describe("UUID del ambiente"),
}).strict();

// ============================================================
// RESPUESTAS
// ============================================================

export const EnvironmentSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  project_uuid: z.string(),
  created_at: z.string().datetime(),
}).strict();

export const EnvironmentDetailSchema = EnvironmentSchema.extend({
  description: z.string().optional(),
  resource_count: z.number().int().optional(),
}).strict();

export const EnvironmentsListSchema = z.object({
  environments: z.array(EnvironmentSchema),
  total: z.number().int(),
}).strict();

export const ActionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
}).strict();

// ============================================================
// TIPOS INFERIDOS
// ============================================================

export type ListEnvironmentsParams = z.infer<typeof ListEnvironmentsSchema>;
export type GetEnvironmentParams = z.infer<typeof GetEnvironmentSchema>;
export type CreateEnvironmentParams = z.infer<typeof CreateEnvironmentSchema>;
export type UpdateEnvironmentParams = z.infer<typeof UpdateEnvironmentSchema>;
export type DeleteEnvironmentParams = z.infer<typeof DeleteEnvironmentSchema>;

export type Environment = z.infer<typeof EnvironmentSchema>;
export type EnvironmentDetail = z.infer<typeof EnvironmentDetailSchema>;
export type EnvironmentsList = z.infer<typeof EnvironmentsListSchema>;
export type ActionResponse = z.infer<typeof ActionResponseSchema>;
