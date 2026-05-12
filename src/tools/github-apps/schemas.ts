/**
 * Zod schemas para herramientas de GitHub Apps
 * 7 herramientas para gestión de aplicaciones GitHub
 */

import { z } from "zod";

// ============================================================
// PARÁMETROS
// ============================================================

export const ListGitHubAppsSchema = z.object({
  limit: z.number().int().min(1).max(100).default(50).describe("Elementos por página"),
  skip: z.number().int().min(0).default(0).describe("Offset"),
}).strict();

export const GetGitHubAppSchema = z.object({
  uuid: z.string().uuid().describe("UUID de la aplicación GitHub"),
}).strict();

export const CreateGitHubAppSchema = z.object({
  name: z.string().min(1).describe("Nombre de la aplicación GitHub"),
  organization: z.string().min(1).describe("Organización GitHub"),
  app_id: z.number().int().positive().describe("ID de la aplicación GitHub"),
  client_id: z.string().min(1).describe("Client ID de la aplicación"),
  client_secret: z.string().min(1).describe("Client Secret de la aplicación"),
  webhook_secret: z.string().optional().describe("Secreto del webhook"),
  private_key: z.string().describe("Clave privada de la aplicación GitHub"),
}).strict();

export const UpdateGitHubAppSchema = z.object({
  uuid: z.string().uuid().describe("UUID de la aplicación GitHub"),
  name: z.string().min(1).optional().describe("Nuevo nombre"),
  webhook_secret: z.string().optional().describe("Nuevo secreto del webhook"),
  private_key: z.string().optional().describe("Nueva clave privada"),
}).strict();

export const DeleteGitHubAppSchema = z.object({
  uuid: z.string().uuid().describe("UUID de la aplicación GitHub"),
}).strict();

export const ListRepositoriesSchema = z.object({
  uuid: z.string().uuid().describe("UUID de la aplicación GitHub"),
  limit: z.number().int().min(1).max(100).default(50).describe("Elementos por página"),
  skip: z.number().int().min(0).default(0).describe("Offset"),
}).strict();

export const ListBranchesSchema = z.object({
  uuid: z.string().uuid().describe("UUID de la aplicación GitHub"),
  repository: z.string().min(1).describe("Nombre del repositorio"),
  limit: z.number().int().min(1).max(100).default(50).describe("Elementos por página"),
  skip: z.number().int().min(0).default(0).describe("Offset"),
}).strict();

// ============================================================
// RESPUESTAS
// ============================================================

export const GitHubAppSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  organization: z.string(),
  app_id: z.number().int(),
  client_id: z.string(),
  created_at: z.string().datetime(),
}).strict();

export const GitHubAppDetailSchema = GitHubAppSchema.extend({
  installations_count: z.number().int().optional(),
  last_sync: z.string().datetime().optional(),
}).strict();

export const GitHubAppsListSchema = z.object({
  apps: z.array(GitHubAppSchema),
  total: z.number().int(),
}).strict();

export const RepositorySchema = z.object({
  id: z.number().int(),
  name: z.string(),
  full_name: z.string(),
  url: z.string().url(),
  private: z.boolean(),
}).strict();

export const RepositoriesListSchema = z.object({
  repositories: z.array(RepositorySchema),
  total: z.number().int(),
}).strict();

export const BranchSchema = z.object({
  name: z.string(),
  commit: z.object({
    sha: z.string(),
    url: z.string().url(),
  }).optional(),
}).strict();

export const BranchesListSchema = z.object({
  branches: z.array(BranchSchema),
  total: z.number().int(),
}).strict();

export const ActionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
}).strict();

// ============================================================
// TIPOS INFERIDOS
// ============================================================

export type ListGitHubAppsParams = z.infer<typeof ListGitHubAppsSchema>;
export type GetGitHubAppParams = z.infer<typeof GetGitHubAppSchema>;
export type CreateGitHubAppParams = z.infer<typeof CreateGitHubAppSchema>;
export type UpdateGitHubAppParams = z.infer<typeof UpdateGitHubAppSchema>;
export type DeleteGitHubAppParams = z.infer<typeof DeleteGitHubAppSchema>;
export type ListRepositoriesParams = z.infer<typeof ListRepositoriesSchema>;
export type ListBranchesParams = z.infer<typeof ListBranchesSchema>;

export type GitHubApp = z.infer<typeof GitHubAppSchema>;
export type GitHubAppDetail = z.infer<typeof GitHubAppDetailSchema>;
export type GitHubAppsList = z.infer<typeof GitHubAppsListSchema>;
export type Repository = z.infer<typeof RepositorySchema>;
export type RepositoriesList = z.infer<typeof RepositoriesListSchema>;
export type Branch = z.infer<typeof BranchSchema>;
export type BranchesList = z.infer<typeof BranchesListSchema>;
export type ActionResponse = z.infer<typeof ActionResponseSchema>;
