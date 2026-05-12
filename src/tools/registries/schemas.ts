/**
 * Zod schemas para herramientas de Registries (Registros Docker)
 * 4 herramientas para gestión de registros de Docker
 */

import { z } from "zod";

// ============================================================
// PARÁMETROS
// ============================================================

export const ListRegistriesSchema = z.object({
  limit: z.number().int().min(1).max(100).default(50).describe("Elementos por página"),
  skip: z.number().int().min(0).default(0).describe("Offset"),
}).strict();

export const GetRegistrySchema = z.object({
  uuid: z.string().uuid().describe("UUID del registro"),
}).strict();

export const CreateRegistrySchema = z.object({
  name: z.string().min(1).describe("Nombre del registro"),
  url: z.string().url().describe("URL del registro"),
  username: z.string().optional().describe("Usuario para autenticación"),
  password: z.string().optional().describe("Contraseña para autenticación"),
  description: z.string().optional().describe("Descripción"),
}).strict();

export const DeleteRegistrySchema = z.object({
  uuid: z.string().uuid().describe("UUID del registro"),
}).strict();

// ============================================================
// RESPUESTAS
// ============================================================

export const RegistrySchema = z.object({
  uuid: z.string(),
  name: z.string(),
  url: z.string(),
  created_at: z.string().datetime(),
}).strict();

export const RegistryDetailSchema = RegistrySchema.extend({
  description: z.string().optional(),
  authenticated: z.boolean().optional(),
  image_count: z.number().int().optional(),
}).strict();

export const RegistriesListSchema = z.object({
  registries: z.array(RegistrySchema),
  total: z.number().int(),
}).strict();

export const ActionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
}).strict();

// ============================================================
// TIPOS INFERIDOS
// ============================================================

export type ListRegistriesParams = z.infer<typeof ListRegistriesSchema>;
export type GetRegistryParams = z.infer<typeof GetRegistrySchema>;
export type CreateRegistryParams = z.infer<typeof CreateRegistrySchema>;
export type DeleteRegistryParams = z.infer<typeof DeleteRegistrySchema>;

export type Registry = z.infer<typeof RegistrySchema>;
export type RegistryDetail = z.infer<typeof RegistryDetailSchema>;
export type RegistriesList = z.infer<typeof RegistriesListSchema>;
export type ActionResponse = z.infer<typeof ActionResponseSchema>;
