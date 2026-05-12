/**
 * Aplicaciones Category Tools
 * Herramientas para gestionar aplicaciones en Coolify
 *
 * Categoría: applications
 * Operaciones de lectura: list, get, logs
 * Operaciones de escritura: start, stop, restart (requieren confirmación)
 */

import { ToolDefinition, ToolHandler } from "$lib/tools/types";
import { createBaseTool } from "$lib/tools/base-tool";
import {
  ListApplicationsSchema,
  GetApplicationSchema,
  GetApplicationLogsSchema,
  StartApplicationSchema,
  StopApplicationSchema,
  RestartApplicationSchema,
  ApplicationDetailSchema,
  ApplicationsListSchema,
  ApplicationLogsSchema,
  ApplicationActionSchema,
} from "./schemas";
import {
  listApplicationsHandler,
  getApplicationHandler,
  getApplicationLogsHandler,
  startApplicationHandler,
  stopApplicationHandler,
  restartApplicationHandler,
} from "./handlers";

// ============================================================
// list_applications
// ============================================================

export const listApplicationsDefinition: ToolDefinition = {
  name: "list_applications",
  category: "applications",
  description: "Lista todas las aplicaciones con filtros opcionales",
  summary:
    "Devuelve lista paginada de aplicaciones, filtrable por proyecto y entorno",
  examples: [
    'invoke("list_applications", {}) → {applications: [...], total: 10}',
    'invoke("list_applications", {project_uuid: "uuid-123", limit: 10}) → {applications: [...], total: 3}',
  ],
  parameters: {
    schema: ListApplicationsSchema,
    description: "Filtros opcionales y parámetros de paginación",
  },
  response: {
    schema: ApplicationsListSchema,
    description: "Lista paginada de aplicaciones con total",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["applications", "list", "read"],
};

export const listApplicationsTool: ToolHandler = createBaseTool(
  "list_applications",
  ListApplicationsSchema,
  ApplicationsListSchema,
  listApplicationsHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

// ============================================================
// get_application
// ============================================================

export const getApplicationDefinition: ToolDefinition = {
  name: "get_application",
  category: "applications",
  description: "Obtiene el detalle de una aplicación por UUID",
  summary:
    "Devuelve información completa de la aplicación incluyendo deployments y entornos",
  examples: [
    'invoke("get_application", {uuid: "uuid-123"}) → {uuid: "...", name: "...", status: "running", ...}',
  ],
  parameters: {
    schema: GetApplicationSchema,
    required: ["uuid"],
    description: "UUID de la aplicación a consultar",
  },
  response: {
    schema: ApplicationDetailSchema,
    description: "Detalle completo de la aplicación",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["applications", "detail", "read"],
};

export const getApplicationTool: ToolHandler = createBaseTool(
  "get_application",
  GetApplicationSchema,
  ApplicationDetailSchema,
  getApplicationHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

// ============================================================
// get_application_logs
// ============================================================

export const getApplicationLogsDefinition: ToolDefinition = {
  name: "get_application_logs",
  category: "applications",
  description: "Obtiene los logs recientes de una aplicación",
  summary: "Devuelve las últimas N líneas de log de la aplicación",
  examples: [
    'invoke("get_application_logs", {uuid: "uuid-123"}) → {logs: [...], total: 100}',
    'invoke("get_application_logs", {uuid: "uuid-123", lines: 50}) → {logs: [...], total: 50}',
  ],
  parameters: {
    schema: GetApplicationLogsSchema,
    required: ["uuid"],
    description: "UUID de la aplicación y número opcional de líneas",
  },
  response: {
    schema: ApplicationLogsSchema,
    description: "Entradas de log estructuradas con nivel y timestamp",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 15000,
  tags: ["applications", "logs", "read"],
};

export const getApplicationLogsTool: ToolHandler = createBaseTool(
  "get_application_logs",
  GetApplicationLogsSchema,
  ApplicationLogsSchema,
  getApplicationLogsHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

// ============================================================
// start_application
// ============================================================

export const startApplicationDefinition: ToolDefinition = {
  name: "start_application",
  category: "applications",
  description: "Inicia una aplicación detenida",
  summary: "Envía comando de inicio a la aplicación especificada",
  examples: [
    'invoke("start_application", {uuid: "uuid-123"}) → {uuid: "...", action: "start", status: "scheduled"}',
    'invoke("start_application", {uuid: "uuid-123", force: true}) → {uuid: "...", action: "start", status: "in_progress"}',
  ],
  parameters: {
    schema: StartApplicationSchema,
    required: ["uuid"],
    description: "UUID de la aplicación y opción force",
  },
  response: {
    schema: ApplicationActionSchema,
    description: "Resultado de la acción de inicio",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 30000,
  tags: ["applications", "start", "write", "action"],
};

export const startApplicationTool: ToolHandler = createBaseTool(
  "start_application",
  StartApplicationSchema,
  ApplicationActionSchema,
  startApplicationHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// ============================================================
// stop_application
// ============================================================

export const stopApplicationDefinition: ToolDefinition = {
  name: "stop_application",
  category: "applications",
  description: "Detiene una aplicación en ejecución",
  summary: "Envía comando de detención a la aplicación especificada",
  examples: [
    'invoke("stop_application", {uuid: "uuid-123"}) → {uuid: "...", action: "stop", status: "scheduled"}',
    'invoke("stop_application", {uuid: "uuid-123", force: true}) → {uuid: "...", action: "stop", status: "in_progress"}',
  ],
  parameters: {
    schema: StopApplicationSchema,
    required: ["uuid"],
    description: "UUID de la aplicación y opción force",
  },
  response: {
    schema: ApplicationActionSchema,
    description: "Resultado de la acción de detención",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 30000,
  tags: ["applications", "stop", "write", "action"],
};

export const stopApplicationTool: ToolHandler = createBaseTool(
  "stop_application",
  StopApplicationSchema,
  ApplicationActionSchema,
  stopApplicationHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// ============================================================
// restart_application
// ============================================================

export const restartApplicationDefinition: ToolDefinition = {
  name: "restart_application",
  category: "applications",
  description: "Reinicia una aplicación",
  summary: "Envía comando de reinicio a la aplicación especificada",
  examples: [
    'invoke("restart_application", {uuid: "uuid-123"}) → {uuid: "...", action: "restart", status: "scheduled"}',
    'invoke("restart_application", {uuid: "uuid-123", force: true}) → {uuid: "...", action: "restart", status: "in_progress"}',
  ],
  parameters: {
    schema: RestartApplicationSchema,
    required: ["uuid"],
    description: "UUID de la aplicación y opción force",
  },
  response: {
    schema: ApplicationActionSchema,
    description: "Resultado de la acción de reinicio",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 60000,
  tags: ["applications", "restart", "write", "action"],
};

export const restartApplicationTool: ToolHandler = createBaseTool(
  "restart_application",
  RestartApplicationSchema,
  ApplicationActionSchema,
  restartApplicationHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// ============================================================
// Colección de herramientas de la categoría
// ============================================================

/**
 * Todas las herramientas de la categoría applications
 */
export const applicationTools = [
  { definition: listApplicationsDefinition, handler: listApplicationsTool },
  { definition: getApplicationDefinition, handler: getApplicationTool },
  { definition: getApplicationLogsDefinition, handler: getApplicationLogsTool },
  { definition: startApplicationDefinition, handler: startApplicationTool },
  { definition: stopApplicationDefinition, handler: stopApplicationTool },
  { definition: restartApplicationDefinition, handler: restartApplicationTool },
];
