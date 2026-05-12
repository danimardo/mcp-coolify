/**
 * Esquemas Zod para el dominio Projects
 * Parámetros de entrada y esquemas de salida
 *
 * Categoría: Projects
 */

import { z } from "zod";
import { uuidSchema, isoDateSchema } from "$lib/schemas/common";

// === Esquemas de Parámetros de Entrada ===

/**
 * Parámetros para listar proyectos con filtrado opcional y paginación
 */
export const ListProjectsSchema = z.object({
  team_uuid: uuidSchema
    .optional()
    .describe("Filtrar proyectos por equipo (UUID)"),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(50)
    .describe("Elementos por página"),
  skip: z
    .number()
    .int()
    .min(0)
    .default(0)
    .describe("Elementos a omitir (offset)"),
});

/**
 * Parámetros para obtener un proyecto específico
 */
export const GetProjectSchema = z.object({
  uuid: z.string().uuid("UUID inválido").describe("UUID del proyecto"),
});

/**
 * Parámetros para crear un nuevo proyecto
 */
export const CreateProjectSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre no puede estar vacío")
    .max(255, "El nombre debe tener <= 255 caracteres")
    .describe("Nombre del proyecto"),
  description: z
    .string()
    .max(1000, "La descripción debe tener <= 1000 caracteres")
    .optional()
    .describe("Descripción del proyecto"),
});

/**
 * Parámetros para actualizar un proyecto
 */
export const UpdateProjectSchema = z.object({
  uuid: z.string().uuid("UUID inválido").describe("UUID del proyecto"),
  name: z
    .string()
    .min(1)
    .max(255)
    .optional()
    .describe("Nuevo nombre del proyecto"),
  description: z
    .string()
    .max(1000)
    .optional()
    .describe("Nueva descripción del proyecto"),
});

/**
 * Parámetros para eliminar un proyecto
 */
export const DeleteProjectSchema = z.object({
  uuid: z.string().uuid("UUID inválido").describe("UUID del proyecto a eliminar"),
});

/**
 * Parámetros para listar entornos de un proyecto
 */
export const ListProjectEnvironmentsSchema = z.object({
  uuid: z.string().uuid("UUID inválido").describe("UUID del proyecto"),
});

// === Esquemas de Salida ===

/**
 * Esquema de proyecto base
 */
export const ProjectSchema = z.object({
  uuid: uuidSchema,
  name: z.string(),
  description: z.string().nullable().optional(),
  created_at: isoDateSchema,
  updated_at: isoDateSchema,
});

/**
 * Esquema de proyecto con detalle extendido
 */
export const ProjectDetailSchema = ProjectSchema.extend({
  environments_count: z.number().int().min(0),
});

/**
 * Esquema de lista de proyectos paginada
 */
export const ProjectsListSchema = z.object({
  projects: z.array(ProjectSchema),
  total: z.number().int().min(0),
});

/**
 * Esquema de entorno de proyecto
 */
export const ProjectEnvironmentSchema = z.object({
  uuid: uuidSchema,
  name: z.string(),
  created_at: isoDateSchema.optional(),
});

/**
 * Esquema de lista de entornos
 */
export const ProjectEnvironmentsListSchema = z.object({
  environments: z.array(ProjectEnvironmentSchema),
  total: z.number().int().min(0),
});

/**
 * Esquema de respuesta de actualización
 */
export const UpdateProjectResponseSchema = ProjectSchema;

/**
 * Esquema de respuesta de eliminación
 */
export const DeleteProjectResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// === Tipos Inferidos ===

export type ListProjectsParams = z.infer<typeof ListProjectsSchema>;
export type GetProjectParams = z.infer<typeof GetProjectSchema>;
export type CreateProjectParams = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectParams = z.infer<typeof UpdateProjectSchema>;
export type DeleteProjectParams = z.infer<typeof DeleteProjectSchema>;
export type ListProjectEnvironmentsParams = z.infer<typeof ListProjectEnvironmentsSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type ProjectDetail = z.infer<typeof ProjectDetailSchema>;
export type ProjectsList = z.infer<typeof ProjectsListSchema>;
export type ProjectEnvironment = z.infer<typeof ProjectEnvironmentSchema>;
export type ProjectEnvironmentsList = z.infer<typeof ProjectEnvironmentsListSchema>;
export type UpdateProjectResponse = z.infer<typeof UpdateProjectResponseSchema>;
export type DeleteProjectResponse = z.infer<typeof DeleteProjectResponseSchema>;
