/**
 * Private Keys Category Tools
 * Tools para gestión de claves privadas en Coolify
 *
 * Categoría: private-keys
 * Tools: list, get, create, update, delete = 5 total
 */

import type { ToolDefinition, ToolHandler } from "$lib/tools/types";
import { createBaseTool } from "$lib/tools/base-tool";
import {
  ListPrivateKeysSchema,
  GetPrivateKeySchema,
  CreatePrivateKeySchema,
  UpdatePrivateKeySchema,
  DeletePrivateKeySchema,
  PrivateKeysListSchema,
  PrivateKeyDetailSchema,
  ActionResponseSchema,
} from "./schemas";
import {
  listPrivateKeysHandler,
  getPrivateKeyHandler,
  createPrivateKeyHandler,
  updatePrivateKeyHandler,
  deletePrivateKeyHandler,
} from "./handlers";

// === list_private_keys ===

export const listPrivateKeysDefinition: ToolDefinition = {
  name: "list_private_keys",
  category: "private-keys",
  description: "Listar todas las claves privadas",
  summary: "Devuelve lista de claves privadas configuradas",
  examples: [
    'invoke("list_private_keys", {}) → {keys: [...], total: 5}',
  ],
  parameters: {
    schema: ListPrivateKeysSchema,
    description: "Paginación",
  },
  response: {
    schema: PrivateKeysListSchema,
    description: "Lista de claves privadas",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["private-keys", "list", "read"],
};

export const listPrivateKeysTool: ToolHandler = createBaseTool(
  "list_private_keys",
  ListPrivateKeysSchema,
  PrivateKeysListSchema,
  listPrivateKeysHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

// === get_private_key ===

export const getPrivateKeyDefinition: ToolDefinition = {
  name: "get_private_key",
  category: "private-keys",
  description: "Obtener detalles de una clave privada",
  summary: "Devuelve información de la clave privada",
  examples: [
    'invoke("get_private_key", {uuid: "550e8400-..."}) → {uuid: "...", name: "...", fingerprint: "..."}',
  ],
  parameters: {
    schema: GetPrivateKeySchema,
    description: "UUID de la clave privada",
  },
  response: {
    schema: PrivateKeyDetailSchema,
    description: "Detalles de la clave privada",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["private-keys", "read"],
};

export const getPrivateKeyTool: ToolHandler = createBaseTool(
  "get_private_key",
  GetPrivateKeySchema,
  PrivateKeyDetailSchema,
  getPrivateKeyHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

// === create_private_key ===

export const createPrivateKeyDefinition: ToolDefinition = {
  name: "create_private_key",
  category: "private-keys",
  description: "Crear una nueva clave privada",
  summary: "Registra una nueva clave privada. Requiere confirmación.",
  examples: [
    'invoke("create_private_key", {name: "deploy-key", private_key: "..."}) → {uuid: "..."}',
  ],
  parameters: {
    schema: CreatePrivateKeySchema,
    description: "Nombre, descripción y contenido de la clave",
  },
  response: {
    schema: PrivateKeyDetailSchema,
    description: "Clave privada creada",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 15000,
  tags: ["private-keys", "create", "write", "secret"],
};

export const createPrivateKeyTool: ToolHandler = createBaseTool(
  "create_private_key",
  CreatePrivateKeySchema,
  PrivateKeyDetailSchema,
  createPrivateKeyHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === update_private_key ===

export const updatePrivateKeyDefinition: ToolDefinition = {
  name: "update_private_key",
  category: "private-keys",
  description: "Actualizar una clave privada",
  summary: "Actualiza datos de una clave privada existente",
  examples: [
    'invoke("update_private_key", {uuid: "...", name: "new-name"}) → {uuid: "...", name: "new-name"}',
  ],
  parameters: {
    schema: UpdatePrivateKeySchema,
    description: "UUID y datos a actualizar",
  },
  response: {
    schema: PrivateKeyDetailSchema,
    description: "Clave privada actualizada",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 15000,
  tags: ["private-keys", "update", "write"],
};

export const updatePrivateKeyTool: ToolHandler = createBaseTool(
  "update_private_key",
  UpdatePrivateKeySchema,
  PrivateKeyDetailSchema,
  updatePrivateKeyHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === delete_private_key ===

export const deletePrivateKeyDefinition: ToolDefinition = {
  name: "delete_private_key",
  category: "private-keys",
  description: "Eliminar una clave privada",
  summary: "Elimina una clave privada (operación irreversible). Requiere confirmación.",
  examples: [
    'invoke("delete_private_key", {uuid: "..."}) → {success: true, message: "..."}',
  ],
  parameters: {
    schema: DeletePrivateKeySchema,
    required: ["uuid"],
    description: "UUID de la clave a eliminar",
  },
  response: {
    schema: ActionResponseSchema,
    description: "Confirmación de eliminación",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 15000,
  tags: ["private-keys", "delete", "write", "destructive"],
};

export const deletePrivateKeyTool: ToolHandler = createBaseTool(
  "delete_private_key",
  DeletePrivateKeySchema,
  ActionResponseSchema,
  deletePrivateKeyHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === Colección de tools ===

/**
 * Todos los tools de la categoría Private Keys (5 total)
 */
export const privateKeysTools = [
  { definition: listPrivateKeysDefinition, handler: listPrivateKeysTool },
  { definition: getPrivateKeyDefinition, handler: getPrivateKeyTool },
  { definition: createPrivateKeyDefinition, handler: createPrivateKeyTool },
  { definition: updatePrivateKeyDefinition, handler: updatePrivateKeyTool },
  { definition: deletePrivateKeyDefinition, handler: deletePrivateKeyTool },
];
