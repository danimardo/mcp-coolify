/**
 * Coolify API Response Schemas
 * Used for strict validation of API responses
 */

import { z } from "zod";
import { uuidSchema, isoDateSchema } from "./common";

// === Common Response Types ===

/**
 * Base team response from Coolify API
 */
export const teamResponseSchema = z.object({
  id: uuidSchema,
  name: z.string(),
  description: z.string().nullable().optional(),
  createdAt: isoDateSchema.optional(),
  updatedAt: isoDateSchema.optional(),
});

export type TeamResponse = z.infer<typeof teamResponseSchema>;

/**
 * Base project response
 */
export const projectResponseSchema = z.object({
  id: uuidSchema,
  name: z.string(),
  description: z.string().nullable().optional(),
  teamId: uuidSchema,
  createdAt: isoDateSchema.optional(),
  updatedAt: isoDateSchema.optional(),
});

export type ProjectResponse = z.infer<typeof projectResponseSchema>;

/**
 * Base application response
 */
export const applicationResponseSchema = z.object({
  id: uuidSchema,
  name: z.string(),
  description: z.string().nullable().optional(),
  projectId: uuidSchema,
  status: z.enum(["running", "stopped", "error", "unknown"]),
  createdAt: isoDateSchema.optional(),
  updatedAt: isoDateSchema.optional(),
});

export type ApplicationResponse = z.infer<typeof applicationResponseSchema>;

/**
 * Deployment response
 */
export const deploymentResponseSchema = z.object({
  id: uuidSchema,
  applicationId: uuidSchema,
  status: z.enum(["pending", "running", "success", "failed"]),
  createdAt: isoDateSchema.optional(),
  startedAt: isoDateSchema.nullable().optional(),
  completedAt: isoDateSchema.nullable().optional(),
});

export type DeploymentResponse = z.infer<typeof deploymentResponseSchema>;

/**
 * Server response
 */
export const serverResponseSchema = z.object({
  id: uuidSchema,
  name: z.string(),
  ip: z.string().ip(),
  port: z.number().int().min(1).max(65535),
  status: z.enum(["online", "offline", "unknown"]),
  createdAt: isoDateSchema.optional(),
});

export type ServerResponse = z.infer<typeof serverResponseSchema>;

/**
 * Database response
 */
export const databaseResponseSchema = z.object({
  id: uuidSchema,
  name: z.string(),
  type: z.string(), // e.g., "postgresql", "mysql", "mongodb"
  status: z.enum(["running", "stopped", "error"]),
  createdAt: isoDateSchema.optional(),
});

export type DatabaseResponse = z.infer<typeof databaseResponseSchema>;

/**
 * Team member response
 */
export const teamMemberResponseSchema = z.object({
  id: uuidSchema,
  name: z.string(),
  email: z.string().email(),
  role: z.enum(["owner", "admin", "member"]),
  joinedAt: isoDateSchema.optional(),
});

export type TeamMemberResponse = z.infer<typeof teamMemberResponseSchema>;

// === List Responses ===

export const listTeamsResponseSchema = z.object({
  teams: z.array(teamResponseSchema),
  total: z.number().int(),
  limit: z.number().int().optional(),
  offset: z.number().int().optional(),
});

export type ListTeamsResponse = z.infer<typeof listTeamsResponseSchema>;

export const listProjectsResponseSchema = z.object({
  projects: z.array(projectResponseSchema),
  total: z.number().int(),
  limit: z.number().int().optional(),
  offset: z.number().int().optional(),
});

export type ListProjectsResponse = z.infer<typeof listProjectsResponseSchema>;

export const listApplicationsResponseSchema = z.object({
  applications: z.array(applicationResponseSchema),
  total: z.number().int(),
  limit: z.number().int().optional(),
  offset: z.number().int().optional(),
});

export type ListApplicationsResponse = z.infer<typeof listApplicationsResponseSchema>;

export const listDeploymentsResponseSchema = z.object({
  deployments: z.array(deploymentResponseSchema),
  total: z.number().int(),
  limit: z.number().int().optional(),
  offset: z.number().int().optional(),
});

export type ListDeploymentsResponse = z.infer<typeof listDeploymentsResponseSchema>;

export const listServersResponseSchema = z.object({
  servers: z.array(serverResponseSchema),
  total: z.number().int(),
  limit: z.number().int().optional(),
  offset: z.number().int().optional(),
});

export type ListServersResponse = z.infer<typeof listServersResponseSchema>;

// === Success Response Wrapper ===

/**
 * Successful API response wrapper
 */
export function createSuccessResponseSchema<T extends z.ZodType>(dataSchema: T) {
  return z.object({
    success: z.literal(true),
    data: dataSchema,
  });
}

/**
 * Server health check response
 */
export const healthCheckResponseSchema = z.object({
  status: z.enum(["healthy", "degraded", "unhealthy"]),
  version: z.string(),
  uptime: z.number().int(),
});

export type HealthCheckResponse = z.infer<typeof healthCheckResponseSchema>;

/**
 * Server info response
 */
export const serverInfoResponseSchema = z.object({
  version: z.string(),
  environment: z.enum(["development", "production"]),
  features: z.array(z.string()),
});

export type ServerInfoResponse = z.infer<typeof serverInfoResponseSchema>;
