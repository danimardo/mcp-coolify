/**
 * Zod schemas para herramientas de Git
 * 4 herramientas para gestión de repositorios Git
 */

import { z } from "zod";

// ============================================================
// PARÁMETROS
// ============================================================

export const ListGitRepositoriesSchema = z.object({
  limit: z.number().int().min(1).max(100).default(50).describe("Elementos por página"),
  skip: z.number().int().min(0).default(0).describe("Offset"),
}).strict();

export const GetGitRepositorySchema = z.object({
  uuid: z.string().uuid().describe("UUID del repositorio"),
}).strict();

export const CreateGitRepositorySchema = z.object({
  name: z.string().min(1).describe("Nombre del repositorio"),
  url: z.string().url().describe("URL del repositorio Git"),
  description: z.string().optional().describe("Descripción"),
  private: z.boolean().default(false).optional().describe("Repositorio privado"),
}).strict();

export const DeleteGitRepositorySchema = z.object({
  uuid: z.string().uuid().describe("UUID del repositorio"),
}).strict();

// ============================================================
// RESPUESTAS
// ============================================================

export const GitRepositorySchema = z.object({
  uuid: z.string(),
  name: z.string(),
  url: z.string(),
  private: z.boolean(),
  created_at: z.string().datetime(),
}).strict();

export const GitRepositoryDetailSchema = GitRepositorySchema.extend({
  description: z.string().optional(),
  branch_count: z.number().int().optional(),
  last_commit: z.string().optional(),
}).strict();

export const GitRepositoriesListSchema = z.object({
  repositories: z.array(GitRepositorySchema),
  total: z.number().int(),
}).strict();

export const ActionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
}).strict();

// ============================================================
// TIPOS INFERIDOS
// ============================================================

export type ListGitRepositoriesParams = z.infer<typeof ListGitRepositoriesSchema>;
export type GetGitRepositoryParams = z.infer<typeof GetGitRepositorySchema>;
export type CreateGitRepositoryParams = z.infer<typeof CreateGitRepositorySchema>;
export type DeleteGitRepositoryParams = z.infer<typeof DeleteGitRepositorySchema>;

export type GitRepository = z.infer<typeof GitRepositorySchema>;
export type GitRepositoryDetail = z.infer<typeof GitRepositoryDetailSchema>;
export type GitRepositoriesList = z.infer<typeof GitRepositoriesListSchema>;
export type ActionResponse = z.infer<typeof ActionResponseSchema>;
