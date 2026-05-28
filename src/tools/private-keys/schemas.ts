/**
 * Zod schemas para herramientas de Private Keys
 * 5 herramientas para gestión de claves privadas
 */

import { z } from "zod";
import { coolifyIdSchema } from "$lib/schemas/common";

// ============================================================
// PARÁMETROS
// ============================================================

export const ListPrivateKeysSchema = z.object({
  limit: z.number().int().min(1).max(100).default(50).describe("Elementos por página"),
  skip: z.number().int().min(0).default(0).describe("Offset"),
}).strict();

export const GetPrivateKeySchema = z.object({
  uuid: coolifyIdSchema.describe("UUID de la clave privada"),
}).strict();

export const CreatePrivateKeySchema = z.object({
  name: z.string().min(1).describe("Nombre de la clave privada"),
  description: z.string().optional().describe("Descripción"),
  private_key: z.string().describe("Contenido de la clave privada"),
}).strict();

export const UpdatePrivateKeySchema = z.object({
  uuid: coolifyIdSchema.describe("UUID de la clave privada"),
  name: z.string().min(1).optional().describe("Nuevo nombre"),
  description: z.string().optional().describe("Nueva descripción"),
  private_key: z.string().optional().describe("Contenido de la clave privada actualizado"),
}).strict();

export const DeletePrivateKeySchema = z.object({
  uuid: coolifyIdSchema.describe("UUID de la clave privada"),
}).strict();

// ============================================================
// RESPUESTAS
// ============================================================

export const PrivateKeySchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  fingerprint: z.string().optional(),
  created_at: z.string().datetime(),
}).strict();

export const PrivateKeyDetailSchema = PrivateKeySchema.extend({
  is_git_compatible: z.boolean().optional(),
}).strict();

export const PrivateKeysListSchema = z.object({
  keys: z.array(PrivateKeySchema),
  total: z.number().int(),
}).strict();

export const ActionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
}).strict();

// ============================================================
// TIPOS INFERIDOS
// ============================================================

export type ListPrivateKeysParams = z.infer<typeof ListPrivateKeysSchema>;
export type GetPrivateKeyParams = z.infer<typeof GetPrivateKeySchema>;
export type CreatePrivateKeyParams = z.infer<typeof CreatePrivateKeySchema>;
export type UpdatePrivateKeyParams = z.infer<typeof UpdatePrivateKeySchema>;
export type DeletePrivateKeyParams = z.infer<typeof DeletePrivateKeySchema>;

export type PrivateKey = z.infer<typeof PrivateKeySchema>;
export type PrivateKeyDetail = z.infer<typeof PrivateKeyDetailSchema>;
export type PrivateKeysList = z.infer<typeof PrivateKeysListSchema>;
export type ActionResponse = z.infer<typeof ActionResponseSchema>;
