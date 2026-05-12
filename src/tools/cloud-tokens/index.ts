/**
 * Cloud Tokens Category Tools
 * Tools para gestión de tokens en la nube
 *
 * Categoría: cloud-tokens
 * Tools: list, get, create, update, delete, validate = 6 total
 */

import type { ToolDefinition, ToolHandler } from "$lib/tools/types";
import { createBaseTool } from "$lib/tools/base-tool";
import {
  ListCloudTokensSchema,
  GetCloudTokenSchema,
  CreateCloudTokenSchema,
  UpdateCloudTokenSchema,
  DeleteCloudTokenSchema,
  ValidateTokenSchema,
  CloudTokensListSchema,
  CloudTokenDetailSchema,
  ValidationResultSchema,
  ActionResponseSchema,
} from "./schemas";
import {
  listCloudTokensHandler,
  getCloudTokenHandler,
  createCloudTokenHandler,
  updateCloudTokenHandler,
  deleteCloudTokenHandler,
  validateTokenHandler,
} from "./handlers";

export const listCloudTokensDefinition: ToolDefinition = {
  name: "list_cloud_tokens",
  category: "cloud-tokens",
  description: "Listar todos los tokens en la nube",
  summary: "Devuelve lista de tokens configurados",
  examples: ['invoke("list_cloud_tokens", {}) → {tokens: [...], total: 3}'],
  parameters: { schema: ListCloudTokensSchema, description: "Paginación" },
  response: { schema: CloudTokensListSchema, description: "Lista de tokens" },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["cloud-tokens", "list", "read"],
};

export const listCloudTokensTool: ToolHandler = createBaseTool(
  "list_cloud_tokens",
  ListCloudTokensSchema,
  CloudTokensListSchema,
  listCloudTokensHandler,
  { requiresConfirmation: false, readOnlyBlocks: false }
);

export const getCloudTokenDefinition: ToolDefinition = {
  name: "get_cloud_token",
  category: "cloud-tokens",
  description: "Obtener detalles de un token",
  summary: "Devuelve información del token",
  examples: ['invoke("get_cloud_token", {uuid: "..."}) → {uuid: "...", name: "...", provider: "..."}'],
  parameters: { schema: GetCloudTokenSchema, description: "UUID del token" },
  response: { schema: CloudTokenDetailSchema, description: "Detalles del token" },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["cloud-tokens", "read"],
};

export const getCloudTokenTool: ToolHandler = createBaseTool(
  "get_cloud_token",
  GetCloudTokenSchema,
  CloudTokenDetailSchema,
  getCloudTokenHandler,
  { requiresConfirmation: false, readOnlyBlocks: false }
);

export const createCloudTokenDefinition: ToolDefinition = {
  name: "create_cloud_token",
  category: "cloud-tokens",
  description: "Crear un nuevo token en la nube",
  summary: "Registra un nuevo token. Requiere confirmación.",
  examples: ['invoke("create_cloud_token", {name: "aws-token", provider: "aws", token: "..."}) → {uuid: "..."}'],
  parameters: { schema: CreateCloudTokenSchema, description: "Datos del token" },
  response: { schema: CloudTokenDetailSchema, description: "Token creado" },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 15000,
  tags: ["cloud-tokens", "create", "write", "secret"],
};

export const createCloudTokenTool: ToolHandler = createBaseTool(
  "create_cloud_token",
  CreateCloudTokenSchema,
  CloudTokenDetailSchema,
  createCloudTokenHandler,
  { requiresConfirmation: true, readOnlyBlocks: true }
);

export const updateCloudTokenDefinition: ToolDefinition = {
  name: "update_cloud_token",
  category: "cloud-tokens",
  description: "Actualizar un token en la nube",
  summary: "Actualiza datos de un token existente",
  examples: ['invoke("update_cloud_token", {uuid: "...", name: "new-name"}) → {uuid: "...", name: "new-name"}'],
  parameters: { schema: UpdateCloudTokenSchema, description: "UUID y datos a actualizar" },
  response: { schema: CloudTokenDetailSchema, description: "Token actualizado" },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 15000,
  tags: ["cloud-tokens", "update", "write"],
};

export const updateCloudTokenTool: ToolHandler = createBaseTool(
  "update_cloud_token",
  UpdateCloudTokenSchema,
  CloudTokenDetailSchema,
  updateCloudTokenHandler,
  { requiresConfirmation: true, readOnlyBlocks: true }
);

export const deleteCloudTokenDefinition: ToolDefinition = {
  name: "delete_cloud_token",
  category: "cloud-tokens",
  description: "Eliminar un token en la nube",
  summary: "Elimina un token (irreversible). Requiere confirmación.",
  examples: ['invoke("delete_cloud_token", {uuid: "..."}) → {success: true}'],
  parameters: { schema: DeleteCloudTokenSchema, required: ["uuid"], description: "UUID del token" },
  response: { schema: ActionResponseSchema, description: "Confirmación de eliminación" },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 15000,
  tags: ["cloud-tokens", "delete", "write", "destructive"],
};

export const deleteCloudTokenTool: ToolHandler = createBaseTool(
  "delete_cloud_token",
  DeleteCloudTokenSchema,
  ActionResponseSchema,
  deleteCloudTokenHandler,
  { requiresConfirmation: true, readOnlyBlocks: true }
);

export const validateTokenDefinition: ToolDefinition = {
  name: "validate_cloud_token",
  category: "cloud-tokens",
  description: "Validar un token en la nube",
  summary: "Verifica que el token sea válido y funcional",
  examples: ['invoke("validate_cloud_token", {uuid: "..."}) → {valid: true, message: "..."}'],
  parameters: { schema: ValidateTokenSchema, description: "UUID del token" },
  response: { schema: ValidationResultSchema, description: "Resultado de validación" },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["cloud-tokens", "validate", "read"],
};

export const validateTokenTool: ToolHandler = createBaseTool(
  "validate_cloud_token",
  ValidateTokenSchema,
  ValidationResultSchema,
  validateTokenHandler,
  { requiresConfirmation: false, readOnlyBlocks: false }
);

export const cloudTokensTools = [
  { definition: listCloudTokensDefinition, handler: listCloudTokensTool },
  { definition: getCloudTokenDefinition, handler: getCloudTokenTool },
  { definition: createCloudTokenDefinition, handler: createCloudTokenTool },
  { definition: updateCloudTokenDefinition, handler: updateCloudTokenTool },
  { definition: deleteCloudTokenDefinition, handler: deleteCloudTokenTool },
  { definition: validateTokenDefinition, handler: validateTokenTool },
];
