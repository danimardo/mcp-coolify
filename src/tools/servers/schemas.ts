/**
 * Zod schemas para herramientas de Servidores (Servers)
 */

import { z } from "zod";

// ============================================================
// PARÁMETROS
// ============================================================

export const ListServersSchema = z.object({}).strict();

export const GetServerSchema = z.object({
  uuid: z.string().uuid("UUID válido requerido"),
}).strict();

export const CreateServerSchema = z.object({
  name: z.string().min(1, "Nombre de servidor requerido"),
  ip: z.string().ip({ message: "IP o hostname válido requerido" }),
  port: z.number().int().min(1).max(65535).optional().default(22),
  user: z.string().optional().default("root"),
}).strict();

export const UpdateServerSchema = z.object({
  uuid: z.string().uuid("UUID válido requerido"),
  name: z.string().min(1).optional(),
  ip: z.string().ip().optional(),
}).strict();

export const DeleteServerSchema = z.object({
  uuid: z.string().uuid("UUID válido requerido"),
}).strict();

export const ValidateServerSchema = z.object({
  uuid: z.string().uuid("UUID válido requerido"),
}).strict();

export const GetServerResourcesSchema = z.object({
  uuid: z.string().uuid("UUID válido requerido"),
}).strict();

export const GetServerDomainsSchema = z.object({
  uuid: z.string().uuid("UUID válido requerido"),
}).strict();

// ============================================================
// RESPUESTAS
// ============================================================

export const ServerSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  ip: z.string(),
  status: z.enum(["connected", "disconnected", "pending"]),
  created_at: z.string().datetime(),
});

export const ServersListSchema = z.object({
  servers: z.array(ServerSchema),
  total: z.number().int(),
});

export const ServerDetailSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  ip: z.string(),
  status: z.enum(["connected", "disconnected", "pending"]),
  os: z.string().optional(),
  docker_version: z.string().optional(),
  port: z.number().int().optional(),
  user: z.string().optional(),
});

export const CreateServerResponseSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  ip: z.string(),
  status: z.string(),
});

export const UpdateServerResponseSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  ip: z.string(),
  status: z.string(),
});

export const DeleteServerResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const ValidateServerResponseSchema = z.object({
  status: z.enum(["ok", "error"]),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
});

export const ServerResourcesSchema = z.object({
  cpu_usage_percent: z.number(),
  memory_usage_percent: z.number(),
  disk_usage_percent: z.number(),
  disk_free_gb: z.number(),
  uptime_hours: z.number(),
});

export const ServerDomainSchema = z.object({
  domain: z.string(),
  application_uuid: z.string(),
  certificate_status: z.string(),
});

export const ServerDomainsListSchema = z.object({
  domains: z.array(ServerDomainSchema),
  total: z.number().int(),
});

// Tipos TypeScript derivados
export type ListServersParams = z.infer<typeof ListServersSchema>;
export type GetServerParams = z.infer<typeof GetServerSchema>;
export type CreateServerParams = z.infer<typeof CreateServerSchema>;
export type UpdateServerParams = z.infer<typeof UpdateServerSchema>;
export type DeleteServerParams = z.infer<typeof DeleteServerSchema>;
export type ValidateServerParams = z.infer<typeof ValidateServerSchema>;
export type GetServerResourcesParams = z.infer<typeof GetServerResourcesSchema>;
export type GetServerDomainsParams = z.infer<typeof GetServerDomainsSchema>;

export type ServersList = z.infer<typeof ServersListSchema>;
export type ServerDetail = z.infer<typeof ServerDetailSchema>;
export type CreateServerResponse = z.infer<typeof CreateServerResponseSchema>;
export type UpdateServerResponse = z.infer<typeof UpdateServerResponseSchema>;
export type DeleteServerResponse = z.infer<typeof DeleteServerResponseSchema>;
export type ValidateServerResponse = z.infer<typeof ValidateServerResponseSchema>;
export type ServerResources = z.infer<typeof ServerResourcesSchema>;
export type ServerDomainsList = z.infer<typeof ServerDomainsListSchema>;
