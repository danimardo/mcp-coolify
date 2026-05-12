/**
 * Zod schemas para herramientas de Recursos (Resources)
 */

import { z } from "zod";

export const GetResourcesSchema = z.object({}).strict();

// Resources response types
export const ResourceItemSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  type: z.enum(["application", "database", "service"]),
  status: z.string(),
});

export const ResourcesResponseSchema = z.object({
  applications: z.array(
    z.object({
      uuid: z.string(),
      name: z.string(),
      status: z.string(),
      created_at: z.string().datetime(),
    })
  ),
  databases: z.array(
    z.object({
      uuid: z.string(),
      name: z.string(),
      type: z.string(),
      status: z.string(),
      created_at: z.string().datetime(),
    })
  ),
  services: z.array(
    z.object({
      uuid: z.string(),
      name: z.string(),
      type: z.string(),
      status: z.string(),
      created_at: z.string().datetime(),
    })
  ),
  total: z.number().int(),
});

export type GetResourcesParams = z.infer<typeof GetResourcesSchema>;
export type ResourcesResponse = z.infer<typeof ResourcesResponseSchema>;
