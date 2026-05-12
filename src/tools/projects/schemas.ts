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

// === Tipos Inferidos ===

export type ListProjectsParams = z.infer<typeof ListProjectsSchema>;
export type GetProjectParams = z.infer<typeof GetProjectSchema>;
export type CreateProjectParams = z.infer<typeof CreateProjectSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type ProjectDetail = z.infer<typeof ProjectDetailSchema>;
export type ProjectsList = z.infer<typeof ProjectsListSchema>;
