/**
 * Zod schemas para herramientas de Webhooks
 * 3 herramientas para gestión de webhooks
 */

import { z } from "zod";

// ============================================================
// PARÁMETROS
// ============================================================

export const ListWebhooksSchema = z.object({
  limit: z.number().int().min(1).max(100).default(50).describe("Elementos por página"),
  skip: z.number().int().min(0).default(0).describe("Offset"),
}).strict();

export const GetWebhookSchema = z.object({
  uuid: z.string().uuid().describe("UUID del webhook"),
}).strict();

export const CreateWebhookSchema = z.object({
  url: z.string().url().describe("URL del webhook"),
  events: z.array(z.string()).describe("Eventos a escuchar"),
  description: z.string().optional().describe("Descripción"),
  active: z.boolean().default(true).optional().describe("Activar webhook"),
}).strict();

export const DeleteWebhookSchema = z.object({
  uuid: z.string().uuid().describe("UUID del webhook"),
}).strict();

// ============================================================
// RESPUESTAS
// ============================================================

export const WebhookSchema = z.object({
  uuid: z.string(),
  url: z.string(),
  events: z.array(z.string()),
  active: z.boolean(),
  created_at: z.string().datetime(),
}).strict();

export const WebhookDetailSchema = WebhookSchema.extend({
  description: z.string().optional(),
  last_triggered: z.string().datetime().optional(),
  success_count: z.number().int().optional(),
}).strict();

export const WebhooksListSchema = z.object({
  webhooks: z.array(WebhookSchema),
  total: z.number().int(),
}).strict();

export const ActionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
}).strict();

// ============================================================
// TIPOS INFERIDOS
// ============================================================

export type ListWebhooksParams = z.infer<typeof ListWebhooksSchema>;
export type GetWebhookParams = z.infer<typeof GetWebhookSchema>;
export type CreateWebhookParams = z.infer<typeof CreateWebhookSchema>;
export type DeleteWebhookParams = z.infer<typeof DeleteWebhookSchema>;

export type Webhook = z.infer<typeof WebhookSchema>;
export type WebhookDetail = z.infer<typeof WebhookDetailSchema>;
export type WebhooksList = z.infer<typeof WebhooksListSchema>;
export type ActionResponse = z.infer<typeof ActionResponseSchema>;
