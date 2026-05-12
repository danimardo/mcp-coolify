/**
 * Services Category Tools
 * Tools para gestión de servicios (contenedores) en Coolify
 *
 * Categoría: Services
 * Tools: list, get, create, update, delete, start, stop, restart, logs, scale, env, restart_container, metrics = 13 total
 */

import type { ToolDefinition, ToolHandler } from "$lib/tools/types";
import { createBaseTool } from "$lib/tools/base-tool";
import {
  ListServicesSchema,
  GetServiceSchema,
  CreateServiceSchema,
  UpdateServiceSchema,
  DeleteServiceSchema,
  StartServiceSchema,
  StopServiceSchema,
  RestartServiceSchema,
  GetServiceLogsSchema,
  ScaleServiceSchema,
  UpdateServiceEnvSchema,
  RestartServiceContainerSchema,
  GetServiceMetricsSchema,
  ServicesListSchema,
  ServiceDetailSchema,
  ServiceLogsSchema,
  ServiceMetricsSchema,
  ActionResponseSchema,
  CreateServiceResponseSchema,
} from "./schemas";
import {
  listServicesHandler,
  getServiceHandler,
  createServiceHandler,
  updateServiceHandler,
  deleteServiceHandler,
  startServiceHandler,
  stopServiceHandler,
  restartServiceHandler,
  getServiceLogsHandler,
  scaleServiceHandler,
  updateServiceEnvHandler,
  restartServiceContainerHandler,
  getServiceMetricsHandler,
} from "./handlers";

// === list_services ===

export const listServicesDefinition: ToolDefinition = {
  name: "list_services",
  category: "services",
  description: "Listar todos los servicios",
  summary: "Devuelve lista de servicios con filtrado y paginación",
  examples: [
    'invoke("list_services", {}) → {services: [...], total: 10}',
    'invoke("list_services", {project_uuid: "...", limit: 20}) → {services: [...], total: 5}',
  ],
  parameters: {
    schema: ListServicesSchema,
    description: "Filtros opcionales por proyecto/ambiente y paginación",
  },
  response: {
    schema: ServicesListSchema,
    description: "Lista paginada de servicios",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["services", "list", "read"],
};

export const listServicesTool: ToolHandler = createBaseTool(
  "list_services",
  ListServicesSchema,
  ServicesListSchema,
  listServicesHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

// === get_service ===

export const getServiceDefinition: ToolDefinition = {
  name: "get_service",
  category: "services",
  description: "Obtener detalles de un servicio específico",
  summary: "Devuelve configuración completa y estado del servicio",
  examples: [
    'invoke("get_service", {uuid: "550e8400-..."}) → {uuid: "...", name: "api", image: "...", ...}',
  ],
  parameters: {
    schema: GetServiceSchema,
    description: "UUID del servicio",
  },
  response: {
    schema: ServiceDetailSchema,
    description: "Detalles del servicio",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["services", "read"],
};

export const getServiceTool: ToolHandler = createBaseTool(
  "get_service",
  GetServiceSchema,
  ServiceDetailSchema,
  getServiceHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

// === create_service ===

export const createServiceDefinition: ToolDefinition = {
  name: "create_service",
  category: "services",
  description: "Crear un nuevo servicio",
  summary: "Crea un nuevo servicio con imagen Docker. Requiere confirmación.",
  examples: [
    'invoke("create_service", {project_uuid: "...", environment_name: "prod", name: "api", image: "myapp:latest"}) → {uuid: "..."}',
  ],
  parameters: {
    schema: CreateServiceSchema,
    description: "Proyecto, ambiente, nombre e imagen",
  },
  response: {
    schema: CreateServiceResponseSchema,
    description: "Servicio creado",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 20000,
  tags: ["services", "create", "write"],
};

export const createServiceTool: ToolHandler = createBaseTool(
  "create_service",
  CreateServiceSchema,
  CreateServiceResponseSchema,
  createServiceHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === update_service ===

export const updateServiceDefinition: ToolDefinition = {
  name: "update_service",
  category: "services",
  description: "Actualizar configuración de un servicio",
  summary: "Modifica nombre, imagen o descripción. Requiere confirmación.",
  examples: [
    'invoke("update_service", {uuid: "...", image: "myapp:v2.0"}) → {success: true}',
  ],
  parameters: {
    schema: UpdateServiceSchema,
    required: ["uuid"],
    description: "UUID y campos a actualizar",
  },
  response: {
    schema: ServiceDetailSchema,
    description: "Servicio actualizado",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 15000,
  tags: ["services", "update", "write"],
};

export const updateServiceTool: ToolHandler = createBaseTool(
  "update_service",
  UpdateServiceSchema,
  ServiceDetailSchema,
  updateServiceHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === delete_service ===

export const deleteServiceDefinition: ToolDefinition = {
  name: "delete_service",
  category: "services",
  description: "Eliminar un servicio",
  summary: "Elimina un servicio (operación irreversible). Requiere confirmación.",
  examples: [
    'invoke("delete_service", {uuid: "..."}) → {success: true, message: "..."}',
  ],
  parameters: {
    schema: DeleteServiceSchema,
    required: ["uuid"],
    description: "UUID del servicio a eliminar",
  },
  response: {
    schema: ActionResponseSchema,
    description: "Confirmación de eliminación",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 20000,
  tags: ["services", "delete", "write", "destructive"],
};

export const deleteServiceTool: ToolHandler = createBaseTool(
  "delete_service",
  DeleteServiceSchema,
  ActionResponseSchema,
  deleteServiceHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === start_service ===

export const startServiceDefinition: ToolDefinition = {
  name: "start_service",
  category: "services",
  description: "Iniciar un servicio detenido",
  summary: "Inicia todos los contenedores del servicio. Requiere confirmación.",
  examples: [
    'invoke("start_service", {uuid: "..."}) → {success: true}',
  ],
  parameters: {
    schema: StartServiceSchema,
    required: ["uuid"],
    description: "UUID del servicio",
  },
  response: {
    schema: ActionResponseSchema,
    description: "Confirmación de inicio",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 20000,
  tags: ["services", "control", "write"],
};

export const startServiceTool: ToolHandler = createBaseTool(
  "start_service",
  StartServiceSchema,
  ActionResponseSchema,
  startServiceHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === stop_service ===

export const stopServiceDefinition: ToolDefinition = {
  name: "stop_service",
  category: "services",
  description: "Detener un servicio",
  summary: "Detiene todos los contenedores del servicio. Requiere confirmación.",
  examples: [
    'invoke("stop_service", {uuid: "..."}) → {success: true}',
  ],
  parameters: {
    schema: StopServiceSchema,
    required: ["uuid"],
    description: "UUID del servicio",
  },
  response: {
    schema: ActionResponseSchema,
    description: "Confirmación de detención",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 20000,
  tags: ["services", "control", "write"],
};

export const stopServiceTool: ToolHandler = createBaseTool(
  "stop_service",
  StopServiceSchema,
  ActionResponseSchema,
  stopServiceHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === restart_service ===

export const restartServiceDefinition: ToolDefinition = {
  name: "restart_service",
  category: "services",
  description: "Reiniciar un servicio",
  summary: "Reinicia todos los contenedores del servicio. Requiere confirmación.",
  examples: [
    'invoke("restart_service", {uuid: "..."}) → {success: true}',
  ],
  parameters: {
    schema: RestartServiceSchema,
    required: ["uuid"],
    description: "UUID del servicio",
  },
  response: {
    schema: ActionResponseSchema,
    description: "Confirmación de reinicio",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 20000,
  tags: ["services", "control", "write"],
};

export const restartServiceTool: ToolHandler = createBaseTool(
  "restart_service",
  RestartServiceSchema,
  ActionResponseSchema,
  restartServiceHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === get_service_logs ===

export const getServiceLogsDefinition: ToolDefinition = {
  name: "get_service_logs",
  category: "services",
  description: "Obtener logs de un servicio",
  summary: "Devuelve las últimas líneas de logs del servicio",
  examples: [
    'invoke("get_service_logs", {uuid: "...", lines: 50}) → {logs: [...], total_lines: 50}',
  ],
  parameters: {
    schema: GetServiceLogsSchema,
    required: ["uuid"],
    description: "UUID y número de líneas",
  },
  response: {
    schema: ServiceLogsSchema,
    description: "Logs del servicio",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["services", "logs", "read"],
};

export const getServiceLogsTool: ToolHandler = createBaseTool(
  "get_service_logs",
  GetServiceLogsSchema,
  ServiceLogsSchema,
  getServiceLogsHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

// === scale_service ===

export const scaleServiceDefinition: ToolDefinition = {
  name: "scale_service",
  category: "services",
  description: "Escalar número de réplicas de un servicio",
  summary: "Aumenta o disminuye el número de instancias. Requiere confirmación.",
  examples: [
    'invoke("scale_service", {uuid: "...", replicas: 3}) → {success: true}',
  ],
  parameters: {
    schema: ScaleServiceSchema,
    required: ["uuid", "replicas"],
    description: "UUID y número de réplicas",
  },
  response: {
    schema: ActionResponseSchema,
    description: "Confirmación de escalado",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 15000,
  tags: ["services", "scale", "write"],
};

export const scaleServiceTool: ToolHandler = createBaseTool(
  "scale_service",
  ScaleServiceSchema,
  ActionResponseSchema,
  scaleServiceHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === update_service_env ===

export const updateServiceEnvDefinition: ToolDefinition = {
  name: "update_service_env",
  category: "services",
  description: "Actualizar variables de entorno",
  summary: "Modifica las variables de entorno del servicio. Requiere confirmación.",
  examples: [
    'invoke("update_service_env", {uuid: "...", variables: {NODE_ENV: "production", PORT: "3000"}}) → {success: true}',
  ],
  parameters: {
    schema: UpdateServiceEnvSchema,
    required: ["uuid", "variables"],
    description: "UUID y objeto con variables",
  },
  response: {
    schema: ActionResponseSchema,
    description: "Variables actualizadas",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 15000,
  tags: ["services", "env", "write"],
};

export const updateServiceEnvTool: ToolHandler = createBaseTool(
  "update_service_env",
  UpdateServiceEnvSchema,
  ActionResponseSchema,
  updateServiceEnvHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === restart_service_container ===

export const restartServiceContainerDefinition: ToolDefinition = {
  name: "restart_service_container",
  category: "services",
  description: "Reiniciar un contenedor específico",
  summary: "Reinicia un contenedor individual sin afectar otros. Requiere confirmación.",
  examples: [
    'invoke("restart_service_container", {uuid: "...", container_id: "abc123"}) → {success: true}',
  ],
  parameters: {
    schema: RestartServiceContainerSchema,
    required: ["uuid"],
    description: "UUID del servicio e ID opcional del contenedor",
  },
  response: {
    schema: ActionResponseSchema,
    description: "Contenedor reiniciado",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 15000,
  tags: ["services", "containers", "write"],
};

export const restartServiceContainerTool: ToolHandler = createBaseTool(
  "restart_service_container",
  RestartServiceContainerSchema,
  ActionResponseSchema,
  restartServiceContainerHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === get_service_metrics ===

export const getServiceMetricsDefinition: ToolDefinition = {
  name: "get_service_metrics",
  category: "services",
  description: "Obtener métricas de rendimiento del servicio",
  summary: "Devuelve CPU, memoria, red y disco actuales",
  examples: [
    'invoke("get_service_metrics", {uuid: "...", metric_type: "all"}) → {cpu_percent: 45.2, memory_bytes: 512000000, ...}',
  ],
  parameters: {
    schema: GetServiceMetricsSchema,
    required: ["uuid"],
    description: "UUID y tipo de métrica",
  },
  response: {
    schema: ServiceMetricsSchema,
    description: "Métricas del servicio",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["services", "metrics", "read"],
};

export const getServiceMetricsTool: ToolHandler = createBaseTool(
  "get_service_metrics",
  GetServiceMetricsSchema,
  ServiceMetricsSchema,
  getServiceMetricsHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

// === Colección de tools ===

/**
 * Todos los tools de la categoría Services (13 total)
 */
export const servicesTools = [
  { definition: listServicesDefinition, handler: listServicesTool },
  { definition: getServiceDefinition, handler: getServiceTool },
  { definition: createServiceDefinition, handler: createServiceTool },
  { definition: updateServiceDefinition, handler: updateServiceTool },
  { definition: deleteServiceDefinition, handler: deleteServiceTool },
  { definition: startServiceDefinition, handler: startServiceTool },
  { definition: stopServiceDefinition, handler: stopServiceTool },
  { definition: restartServiceDefinition, handler: restartServiceTool },
  { definition: getServiceLogsDefinition, handler: getServiceLogsTool },
  { definition: scaleServiceDefinition, handler: scaleServiceTool },
  { definition: updateServiceEnvDefinition, handler: updateServiceEnvTool },
  { definition: restartServiceContainerDefinition, handler: restartServiceContainerTool },
  { definition: getServiceMetricsDefinition, handler: getServiceMetricsTool },
];
