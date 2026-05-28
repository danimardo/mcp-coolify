/**
 * Deployments Category Tools
 *
 * Tools para gestionar despliegues en Coolify:
 * - list_deployments   (read-only)
 * - get_deployment     (read-only)
 * - trigger_deployment (requiere confirmación)
 * - cancel_deployment  (requiere confirmación)
 */

import { ToolDefinition, ToolHandler } from "$lib/tools/types";
import { createBaseTool } from "$lib/tools/base-tool";
import {
  ListDeploymentsSchema,
  GetDeploymentSchema,
  TriggerDeploymentSchema,
  CancelDeploymentSchema,
  DeploymentsListSchema,
  DeploymentDetailSchema,
  DeploymentActionSchema,
} from "./schemas";
import {
  listDeploymentsHandler,
  getDeploymentHandler,
  triggerDeploymentHandler,
  cancelDeploymentHandler,
} from "./handlers";

// ───────────────────────────────────────────────────────────────────
// list_deployments
// ───────────────────────────────────────────────────────────────────

export const listDeploymentsDefinition: ToolDefinition = {
  name: "list_deployments",
  category: "deployments",
  description: "Listar despliegues con filtros opcionales por aplicación, estado y paginación",
  summary: "Obtiene una lista paginada de despliegues, opcionalmente filtrada",
  examples: [
    'invoke("list_deployments", {}) → {deployments: [...], total: 42}',
    'invoke("list_deployments", {application_uuid: "...", limit: 10}) → {deployments: [...], total: 42}',
  ],
  parameters: {
    schema: ListDeploymentsSchema,
    description: "Filtros opcionales: application_uuid, status, limit (1-100, default 50), skip (default 0)",
  },
  response: {
    schema: DeploymentsListSchema,
    description: "Lista paginada de despliegues con total",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["deployments", "list", "read-only"],
};

export const listDeploymentsTool: ToolHandler = createBaseTool(
  "list_deployments",
  ListDeploymentsSchema,
  DeploymentsListSchema,
  listDeploymentsHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

// ───────────────────────────────────────────────────────────────────
// get_deployment
// ───────────────────────────────────────────────────────────────────

export const getDeploymentDefinition: ToolDefinition = {
  name: "get_deployment",
  category: "deployments",
  description: "Obtener detalle de un despliegue específico por UUID, incluyendo logs",
  summary: "Devuelve detalles completos de un despliegue: estado, logs y entorno",
  examples: [
    'invoke("get_deployment", {uuid: "a1b2c3d4-..."}) → {uuid: "...", status: "success", logs: "..."}',
  ],
  parameters: {
    schema: GetDeploymentSchema,
    description: "UUID del despliegue a consultar",
  },
  response: {
    schema: DeploymentDetailSchema,
    description: "Detalle completo del despliegue con logs y entorno",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["deployments", "detail", "read-only"],
};

export const getDeploymentTool: ToolHandler = createBaseTool(
  "get_deployment",
  GetDeploymentSchema,
  DeploymentDetailSchema,
  getDeploymentHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

// ───────────────────────────────────────────────────────────────────
// trigger_deployment
// ───────────────────────────────────────────────────────────────────

export const triggerDeploymentDefinition: ToolDefinition = {
  name: "trigger_deployment",
  category: "deployments",
  description: "Disparar un nuevo despliegue manual para una aplicación (requiere confirmación)",
  summary: "Inicia un despliegue de la rama configurada en la aplicación; opcionalmente fuerza rebuild sin caché",
  examples: [
    'invoke("trigger_deployment", {application_uuid: "..."}) → {deployments: [{deployment_uuid: "...", ...}]}',
    'invoke("trigger_deployment", {application_uuid: "...", force: true}) → {...}',
  ],
  parameters: {
    schema: TriggerDeploymentSchema,
    description: "UUID de la aplicación, y opcionalmente force (rebuild sin caché de Docker)",
  },
  response: {
    schema: DeploymentActionSchema,
    description: "Resultado de la acción de despliegue",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 30000,
  tags: ["deployments", "trigger", "destructive"],
};

export const triggerDeploymentTool: ToolHandler = createBaseTool(
  "trigger_deployment",
  TriggerDeploymentSchema,
  DeploymentActionSchema,
  triggerDeploymentHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// ───────────────────────────────────────────────────────────────────
// cancel_deployment
// ───────────────────────────────────────────────────────────────────

export const cancelDeploymentDefinition: ToolDefinition = {
  name: "cancel_deployment",
  category: "deployments",
  description: "Cancelar un despliegue en curso (requiere confirmación)",
  summary: "Detiene un despliegue que está en estado pending o running",
  examples: [
    'invoke("cancel_deployment", {uuid: "a1b2c3d4-..."}) → {uuid: "...", action: "cancel", status: "cancelled"}',
  ],
  parameters: {
    schema: CancelDeploymentSchema,
    description: "UUID del despliegue a cancelar",
  },
  response: {
    schema: DeploymentActionSchema,
    description: "Resultado de la cancelación",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 15000,
  tags: ["deployments", "cancel", "destructive"],
};

export const cancelDeploymentTool: ToolHandler = createBaseTool(
  "cancel_deployment",
  CancelDeploymentSchema,
  DeploymentActionSchema,
  cancelDeploymentHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// ───────────────────────────────────────────────────────────────────
// Exportación agrupada
// ───────────────────────────────────────────────────────────────────

/**
 * Todos los tools de la categoría deployments
 */
export const deploymentsTools = [
  { definition: listDeploymentsDefinition, handler: listDeploymentsTool },
  { definition: getDeploymentDefinition, handler: getDeploymentTool },
  { definition: triggerDeploymentDefinition, handler: triggerDeploymentTool },
  { definition: cancelDeploymentDefinition, handler: cancelDeploymentTool },
];
