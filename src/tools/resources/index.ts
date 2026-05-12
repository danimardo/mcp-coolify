/**
 * Resources Category Tools
 * Vista consolidada de todos los recursos (aplicaciones, bases de datos, servicios)
 */

import type { ToolDefinition, ToolHandler } from "$lib/tools/types";
import { createBaseTool } from "$lib/tools/base-tool";
import { GetResourcesSchema, ResourcesResponseSchema } from "./schemas";
import { getResourcesHandler } from "./handlers";

// ============================================================
// get_resources (unified view)
// ============================================================

export const getResourcesDefinition: ToolDefinition = {
  name: "get_resources",
  category: "resources",
  description: "Obtiene vista consolidada de todos los recursos del equipo",
  summary:
    "Devuelve lista completa de aplicaciones, bases de datos y servicios",
  examples: [
    'invoke("get_resources", {}) → {applications: [...], databases: [...], services: [...], total: 15}',
  ],
  parameters: {
    schema: GetResourcesSchema,
    description: "Sin parámetros requeridos",
  },
  response: {
    schema: ResourcesResponseSchema,
    description: "Vista consolidada de todos los recursos",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 15000,
  tags: ["resources", "overview", "read"],
};

export const getResourcesTool: ToolHandler = createBaseTool(
  "get_resources",
  GetResourcesSchema,
  ResourcesResponseSchema,
  getResourcesHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

/**
 * Todas las herramientas de la categoría resources (1 tool)
 */
export const resourcesTools = [
  { definition: getResourcesDefinition, handler: getResourcesTool },
];
