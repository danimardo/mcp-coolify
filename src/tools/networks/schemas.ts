/**
 * Zod schemas para herramientas de Networks
 * 3 herramientas para gestión de redes Docker
 */

import { z } from "zod";

// ============================================================
// PARÁMETROS
// ============================================================

export const ListNetworksSchema = z.object({
  limit: z.number().int().min(1).max(100).default(50).describe("Elementos por página"),
  skip: z.number().int().min(0).default(0).describe("Offset"),
}).strict();

export const GetNetworkSchema = z.object({
  uuid: z.string().uuid().describe("UUID de la red"),
}).strict();

export const CreateNetworkSchema = z.object({
  name: z.string().min(1).describe("Nombre de la red"),
  driver: z.enum(["bridge", "overlay", "host", "none"]).default("bridge").describe("Driver de red"),
  description: z.string().optional().describe("Descripción"),
}).strict();

export const DeleteNetworkSchema = z.object({
  uuid: z.string().uuid().describe("UUID de la red"),
}).strict();

// ============================================================
// RESPUESTAS
// ============================================================

export const NetworkSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  driver: z.string(),
  created_at: z.string().datetime(),
}).strict();

export const NetworkDetailSchema = NetworkSchema.extend({
  description: z.string().optional(),
  container_count: z.number().int().optional(),
  subnet: z.string().optional(),
}).strict();

export const NetworksListSchema = z.object({
  networks: z.array(NetworkSchema),
  total: z.number().int(),
}).strict();

export const ActionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
}).strict();

// ============================================================
// TIPOS INFERIDOS
// ============================================================

export type ListNetworksParams = z.infer<typeof ListNetworksSchema>;
export type GetNetworkParams = z.infer<typeof GetNetworkSchema>;
export type CreateNetworkParams = z.infer<typeof CreateNetworkSchema>;
export type DeleteNetworkParams = z.infer<typeof DeleteNetworkSchema>;

export type Network = z.infer<typeof NetworkSchema>;
export type NetworkDetail = z.infer<typeof NetworkDetailSchema>;
export type NetworksList = z.infer<typeof NetworksListSchema>;
export type ActionResponse = z.infer<typeof ActionResponseSchema>;
