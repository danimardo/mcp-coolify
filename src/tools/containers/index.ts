/**
 * Containers Category Tools
 *
 * Herramientas que acceden a los contenedores Docker del host de Coolify vía
 * SSH, cubriendo lo que la API REST de Coolify v4 no expone (logs de runtime
 * de servicios y bases de datos).
 *
 * Categoría: containers
 * Operaciones de lectura: get_container_logs
 * Requiere: SSH_ENABLED=true (+ SSH_HOST, SSH_USER, SSH_PRIVATE_KEY_PATH)
 */

import type { ToolDefinition, ToolHandler } from "$lib/tools/types";
import { createBaseTool } from "$lib/tools/base-tool";
import {
  GetContainerLogsSchema,
  ContainerLogsResponseSchema,
} from "./schemas";
import { getContainerLogsHandler } from "./handlers";

// ============================================================
// get_container_logs
// ============================================================

export const getContainerLogsDefinition: ToolDefinition = {
  name: "get_container_logs",
  category: "containers",
  description:
    "Obtiene los logs de runtime de los contenedores Docker de un recurso Coolify (aplicación, servicio o base de datos) vía SSH al host",
  summary:
    "docker logs sobre el host de Coolify. Cubre servicios y bases de datos, que la API REST no expone. Requiere SSH_ENABLED=true",
  examples: [
    'invoke("get_container_logs", {resource_type: "service", resource_uuid: "f8s0c0k4wgok8sccg0w4k8sg"}) → {containers: [{name: "web-f8s0c0k4...", logs: "..."}]}',
    'invoke("get_container_logs", {resource_type: "application", resource_uuid: "a4kw8sgc0co8gk00ggkcg84w", tail: 50, since: "15m"}) → {containers: [...]}',
    'invoke("get_container_logs", {resource_type: "service", resource_uuid: "f8s0c0k4wgok8sccg0w4k8sg", container: "postgresql-f8s0c0k4wgok8sccg0w4k8sg"}) → {containers: [{...}]}',
  ],
  parameters: {
    schema: GetContainerLogsSchema,
    required: ["resource_type", "resource_uuid"],
    description:
      "Tipo y UUID del recurso Coolify, con filtros opcionales de contenedor, nº de líneas y ventana temporal",
  },
  response: {
    schema: ContainerLogsResponseSchema,
    description: "Logs por contenedor más metadatos del host consultado",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 30000,
  tags: ["containers", "logs", "read", "ssh"],
};

export const getContainerLogsTool: ToolHandler = createBaseTool(
  "get_container_logs",
  GetContainerLogsSchema,
  ContainerLogsResponseSchema,
  getContainerLogsHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

// ============================================================
// Colección de herramientas de la categoría
// ============================================================

export const containersTools = [
  { definition: getContainerLogsDefinition, handler: getContainerLogsTool },
];
