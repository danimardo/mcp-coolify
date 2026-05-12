/**
 * Zod schemas para herramientas de Cloud Tokens
 * 6 herramientas para gestión de tokens en la nube
 */

import { z } from "zod";

export const ListCloudTokensSchema = z.object({
  limit: z.number().int().min(1).max(100).default(50).describe("Elementos por página"),
  skip: z.number().int().min(0).default(0).describe("Offset"),
}).strict();

export const GetCloudTokenSchema = z.object({
  uuid: z.string().uuid().describe("UUID del token"),
}).strict();

export const CreateCloudTokenSchema = z.object({
  name: z.string().min(1).describe("Nombre del token"),
  provider: z.enum(["aws", "gcp", "azure", "digitalocean", "linode"]).describe("Proveedor de nube"),
  token: z.string().min(1).describe("Token o credenciales"),
  description: z.string().optional().describe("Descripción"),
}).strict();

export const UpdateCloudTokenSchema = z.object({
  uuid: z.string().uuid().describe("UUID del token"),
  name: z.string().min(1).optional().describe("Nuevo nombre"),
  token: z.string().optional().describe("Nuevo token"),
  description: z.string().optional().describe("Nueva descripción"),
}).strict();

export const DeleteCloudTokenSchema = z.object({
  uuid: z.string().uuid().describe("UUID del token"),
}).strict();

export const ValidateTokenSchema = z.object({
  uuid: z.string().uuid().describe("UUID del token"),
}).strict();

export const CloudTokenSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  provider: z.string(),
  description: z.string().optional(),
  created_at: z.string().datetime(),
}).strict();

export const CloudTokenDetailSchema = CloudTokenSchema.extend({
  is_valid: z.boolean().optional(),
  last_validated: z.string().datetime().optional(),
}).strict();

export const CloudTokensListSchema = z.object({
  tokens: z.array(CloudTokenSchema),
  total: z.number().int(),
}).strict();

export const ValidationResultSchema = z.object({
  valid: z.boolean(),
  message: z.string(),
}).strict();

export const ActionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
}).strict();

export type ListCloudTokensParams = z.infer<typeof ListCloudTokensSchema>;
export type GetCloudTokenParams = z.infer<typeof GetCloudTokenSchema>;
export type CreateCloudTokenParams = z.infer<typeof CreateCloudTokenSchema>;
export type UpdateCloudTokenParams = z.infer<typeof UpdateCloudTokenSchema>;
export type DeleteCloudTokenParams = z.infer<typeof DeleteCloudTokenSchema>;
export type ValidateTokenParams = z.infer<typeof ValidateTokenSchema>;

export type CloudToken = z.infer<typeof CloudTokenSchema>;
export type CloudTokenDetail = z.infer<typeof CloudTokenDetailSchema>;
export type CloudTokensList = z.infer<typeof CloudTokensListSchema>;
export type ValidationResult = z.infer<typeof ValidationResultSchema>;
export type ActionResponse = z.infer<typeof ActionResponseSchema>;
