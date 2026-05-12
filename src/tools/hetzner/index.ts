/**
 * Hetzner Category Tools
 * Tools para gestión de Hetzner Cloud
 *
 * Categoría: hetzner
 * Tools: list_locations, list_server_types, list_images, list_ssh_keys, create_server = 5 total
 */

import type { ToolDefinition, ToolHandler } from "$lib/tools/types";
import { createBaseTool } from "$lib/tools/base-tool";
import {
  ListLocationsSchema,
  ListServerTypesSchema,
  ListImagesSchema,
  ListSSHKeysSchema,
  CreateServerSchema,
  LocationsListSchema,
  ServerTypesListSchema,
  ImagesListSchema,
  SSHKeysListSchema,
  ServerDetailSchema,
} from "./schemas";
import {
  listLocationsHandler,
  listServerTypesHandler,
  listImagesHandler,
  listSSHKeysHandler,
  createServerHandler,
} from "./handlers";

export const listLocationsDefinition: ToolDefinition = {
  name: "list_hetzner_locations",
  category: "hetzner",
  description: "Listar ubicaciones disponibles en Hetzner",
  summary: "Devuelve lista de ubicaciones geográficas",
  examples: ['invoke("list_hetzner_locations", {}) → {locations: [...], total: 5}'],
  parameters: { schema: ListLocationsSchema, description: "Paginación" },
  response: { schema: LocationsListSchema, description: "Lista de ubicaciones" },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["hetzner", "locations", "read"],
};

export const listLocationsTool: ToolHandler = createBaseTool(
  "list_hetzner_locations",
  ListLocationsSchema,
  LocationsListSchema,
  listLocationsHandler,
  { requiresConfirmation: false, readOnlyBlocks: false }
);

export const listServerTypesDefinition: ToolDefinition = {
  name: "list_server_types",
  category: "hetzner",
  description: "Listar tipos de servidor disponibles en Hetzner",
  summary: "Devuelve lista de tipos de servidor con precios",
  examples: ['invoke("list_server_types", {}) → {server_types: [...], total: 10}'],
  parameters: { schema: ListServerTypesSchema, description: "Paginación" },
  response: { schema: ServerTypesListSchema, description: "Lista de tipos de servidor" },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["hetzner", "server-types", "read"],
};

export const listServerTypesTool: ToolHandler = createBaseTool(
  "list_server_types",
  ListServerTypesSchema,
  ServerTypesListSchema,
  listServerTypesHandler,
  { requiresConfirmation: false, readOnlyBlocks: false }
);

export const listImagesDefinition: ToolDefinition = {
  name: "list_hetzner_images",
  category: "hetzner",
  description: "Listar imágenes de sistema operativo disponibles",
  summary: "Devuelve lista de imágenes del SO para servidores",
  examples: ['invoke("list_hetzner_images", {}) → {images: [...], total: 15}'],
  parameters: { schema: ListImagesSchema, description: "Paginación" },
  response: { schema: ImagesListSchema, description: "Lista de imágenes" },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["hetzner", "images", "read"],
};

export const listImagesTool: ToolHandler = createBaseTool(
  "list_hetzner_images",
  ListImagesSchema,
  ImagesListSchema,
  listImagesHandler,
  { requiresConfirmation: false, readOnlyBlocks: false }
);

export const listSSHKeysDefinition: ToolDefinition = {
  name: "list_ssh_keys",
  category: "hetzner",
  description: "Listar claves SSH en Hetzner",
  summary: "Devuelve lista de claves SSH configuradas",
  examples: ['invoke("list_ssh_keys", {}) → {ssh_keys: [...], total: 3}'],
  parameters: { schema: ListSSHKeysSchema, description: "Paginación" },
  response: { schema: SSHKeysListSchema, description: "Lista de claves SSH" },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["hetzner", "ssh-keys", "read"],
};

export const listSSHKeysTool: ToolHandler = createBaseTool(
  "list_ssh_keys",
  ListSSHKeysSchema,
  SSHKeysListSchema,
  listSSHKeysHandler,
  { requiresConfirmation: false, readOnlyBlocks: false }
);

export const createServerDefinition: ToolDefinition = {
  name: "create_hetzner_server",
  category: "hetzner",
  description: "Crear un nuevo servidor en Hetzner Cloud",
  summary: "Provisiona un nuevo servidor. Requiere confirmación.",
  examples: ['invoke("create_hetzner_server", {name: "web-server", server_type: "cx11", image: "ubuntu-22.04", location: "fsn1"}) → {server: {...}}'],
  parameters: { schema: CreateServerSchema, description: "Datos del servidor" },
  response: { schema: ServerDetailSchema, description: "Servidor creado" },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 30000,
  tags: ["hetzner", "servers", "create", "write", "cost"],
};

export const createServerTool: ToolHandler = createBaseTool(
  "create_hetzner_server",
  CreateServerSchema,
  ServerDetailSchema,
  createServerHandler,
  { requiresConfirmation: true, readOnlyBlocks: true }
);

export const hetznerTools = [
  { definition: listLocationsDefinition, handler: listLocationsTool },
  { definition: listServerTypesDefinition, handler: listServerTypesTool },
  { definition: listImagesDefinition, handler: listImagesTool },
  { definition: listSSHKeysDefinition, handler: listSSHKeysTool },
  { definition: createServerDefinition, handler: createServerTool },
];
