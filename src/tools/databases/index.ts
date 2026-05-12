/**
 * Databases Category Tools
 * Tools para gestión de bases de datos en Coolify
 *
 * Categoría: Databases
 * Tools: list, get, create (8 tipos), update, delete, start, stop, restart, backup (6 ops) = 21 total
 */

import type { ToolDefinition, ToolHandler } from "$lib/tools/types";
import { createBaseTool } from "$lib/tools/base-tool";
import {
  ListDatabasesSchema,
  GetDatabaseSchema,
  CreateDatabasePostgresSchema,
  CreateDatabaseMysqlSchema,
  CreateDatabaseMariadbSchema,
  CreateDatabaseMongodbSchema,
  CreateDatabaseRedisSchema,
  CreateDatabaseDragonflySchema,
  CreateDatabaseKeydbSchema,
  CreateDatabaseClickhouseSchema,
  UpdateDatabaseSchema,
  DeleteDatabaseSchema,
  StartDatabaseSchema,
  StopDatabaseSchema,
  RestartDatabaseSchema,
  ListDatabaseBackupsSchema,
  CreateDatabaseBackupSchema,
  UpdateDatabaseBackupSchema,
  DeleteDatabaseBackupSchema,
  ListBackupExecutionsSchema,
  DeleteBackupExecutionSchema,
  DatabasesListSchema,
  DatabaseDetailSchema,
  CreateDatabaseResponseSchema,
  DatabaseBackupsListSchema,
  BackupExecutionsListSchema,
  ActionResponseSchema,
} from "./schemas";
import {
  listDatabasesHandler,
  getDatabaseHandler,
  createDatabasePostgresHandler,
  createDatabaseMysqlHandler,
  createDatabaseMariadbHandler,
  createDatabaseMongodbHandler,
  createDatabaseRedisHandler,
  createDatabaseDragonflyHandler,
  createDatabaseKeydbHandler,
  createDatabaseClickhouseHandler,
  updateDatabaseHandler,
  deleteDatabaseHandler,
  startDatabaseHandler,
  stopDatabaseHandler,
  restartDatabaseHandler,
  listDatabaseBackupsHandler,
  createDatabaseBackupHandler,
  updateDatabaseBackupHandler,
  deleteDatabaseBackupHandler,
  listBackupExecutionsHandler,
  deleteBackupExecutionHandler,
} from "./handlers";

// === list_databases ===

export const listDatabasesDefinition: ToolDefinition = {
  name: "list_databases",
  category: "databases",
  description: "Listar todas las bases de datos",
  summary: "Devuelve lista de todas las bases de datos del ambiente",
  examples: [
    'invoke("list_databases", {}) → {databases: [...], total: 5}',
  ],
  parameters: {
    schema: ListDatabasesSchema,
    description: "Sin parámetros requeridos",
  },
  response: {
    schema: DatabasesListSchema,
    description: "Lista de bases de datos",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["databases", "list", "read"],
};

export const listDatabasesTool: ToolHandler = createBaseTool(
  "list_databases",
  ListDatabasesSchema,
  DatabasesListSchema,
  listDatabasesHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

// === get_database ===

export const getDatabaseDefinition: ToolDefinition = {
  name: "get_database",
  category: "databases",
  description: "Obtener una base de datos específica por UUID",
  summary: "Devuelve detalles de una base de datos",
  examples: [
    'invoke("get_database", {uuid: "550e8400-..."}) → {uuid: "...", name: "mydb", ...}',
  ],
  parameters: {
    schema: GetDatabaseSchema,
    description: "UUID de la base de datos",
  },
  response: {
    schema: DatabaseDetailSchema,
    description: "Detalles de la base de datos",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["databases", "read"],
};

export const getDatabaseTool: ToolHandler = createBaseTool(
  "get_database",
  GetDatabaseSchema,
  DatabaseDetailSchema,
  getDatabaseHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

// === create_database_postgres ===

export const createDatabasePostgresDefinition: ToolDefinition = {
  name: "create_database_postgres",
  category: "databases",
  description: "Crear una base de datos PostgreSQL",
  summary: "Crea una nueva base de datos PostgreSQL. Requiere confirmación.",
  examples: [
    'invoke("create_database_postgres", {project_uuid: "...", server_uuid: "...", environment_name: "production", name: "mydb"}) → {uuid: "...", name: "mydb"}',
  ],
  parameters: {
    schema: CreateDatabasePostgresSchema,
    description:
      "Proyecto, servidor, ambiente y nombre de la base de datos",
  },
  response: {
    schema: CreateDatabaseResponseSchema,
    description: "Base de datos creada",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 30000,
  tags: ["databases", "create", "postgres", "write"],
};

export const createDatabasePostgresTool: ToolHandler = createBaseTool(
  "create_database_postgres",
  CreateDatabasePostgresSchema,
  CreateDatabaseResponseSchema,
  createDatabasePostgresHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === create_database_mysql ===

export const createDatabaseMysqlDefinition: ToolDefinition = {
  name: "create_database_mysql",
  category: "databases",
  description: "Crear una base de datos MySQL",
  summary: "Crea una nueva base de datos MySQL. Requiere confirmación.",
  examples: [
    'invoke("create_database_mysql", {project_uuid: "...", server_uuid: "...", environment_name: "production", name: "mydb"}) → {uuid: "...", name: "mydb"}',
  ],
  parameters: {
    schema: CreateDatabaseMysqlSchema,
    description:
      "Proyecto, servidor, ambiente y nombre de la base de datos",
  },
  response: {
    schema: CreateDatabaseResponseSchema,
    description: "Base de datos creada",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 30000,
  tags: ["databases", "create", "mysql", "write"],
};

export const createDatabaseMysqlTool: ToolHandler = createBaseTool(
  "create_database_mysql",
  CreateDatabaseMysqlSchema,
  CreateDatabaseResponseSchema,
  createDatabaseMysqlHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === create_database_mariadb ===

export const createDatabaseMariadbDefinition: ToolDefinition = {
  name: "create_database_mariadb",
  category: "databases",
  description: "Crear una base de datos MariaDB",
  summary: "Crea una nueva base de datos MariaDB. Requiere confirmación.",
  examples: [
    'invoke("create_database_mariadb", {project_uuid: "...", server_uuid: "...", environment_name: "production", name: "mydb"}) → {uuid: "...", name: "mydb"}',
  ],
  parameters: {
    schema: CreateDatabaseMariadbSchema,
    description:
      "Proyecto, servidor, ambiente y nombre de la base de datos",
  },
  response: {
    schema: CreateDatabaseResponseSchema,
    description: "Base de datos creada",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 30000,
  tags: ["databases", "create", "mariadb", "write"],
};

export const createDatabaseMariadbTool: ToolHandler = createBaseTool(
  "create_database_mariadb",
  CreateDatabaseMariadbSchema,
  CreateDatabaseResponseSchema,
  createDatabaseMariadbHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === create_database_mongodb ===

export const createDatabaseMongodbDefinition: ToolDefinition = {
  name: "create_database_mongodb",
  category: "databases",
  description: "Crear una base de datos MongoDB",
  summary: "Crea una nueva base de datos MongoDB. Requiere confirmación.",
  examples: [
    'invoke("create_database_mongodb", {project_uuid: "...", server_uuid: "...", environment_name: "production", name: "mydb"}) → {uuid: "...", name: "mydb"}',
  ],
  parameters: {
    schema: CreateDatabaseMongodbSchema,
    description:
      "Proyecto, servidor, ambiente y nombre de la base de datos",
  },
  response: {
    schema: CreateDatabaseResponseSchema,
    description: "Base de datos creada",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 30000,
  tags: ["databases", "create", "mongodb", "write"],
};

export const createDatabaseMongodbTool: ToolHandler = createBaseTool(
  "create_database_mongodb",
  CreateDatabaseMongodbSchema,
  CreateDatabaseResponseSchema,
  createDatabaseMongodbHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === create_database_redis ===

export const createDatabaseRedisDefinition: ToolDefinition = {
  name: "create_database_redis",
  category: "databases",
  description: "Crear una instancia Redis",
  summary: "Crea una nueva instancia Redis. Requiere confirmación.",
  examples: [
    'invoke("create_database_redis", {project_uuid: "...", server_uuid: "...", environment_name: "production", name: "cache"}) → {uuid: "...", name: "cache"}',
  ],
  parameters: {
    schema: CreateDatabaseRedisSchema,
    description:
      "Proyecto, servidor, ambiente y nombre de la instancia",
  },
  response: {
    schema: CreateDatabaseResponseSchema,
    description: "Instancia creada",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 30000,
  tags: ["databases", "create", "redis", "cache", "write"],
};

export const createDatabaseRedisTool: ToolHandler = createBaseTool(
  "create_database_redis",
  CreateDatabaseRedisSchema,
  CreateDatabaseResponseSchema,
  createDatabaseRedisHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === create_database_dragonfly ===

export const createDatabaseDragonflyDefinition: ToolDefinition = {
  name: "create_database_dragonfly",
  category: "databases",
  description: "Crear una instancia Dragonfly",
  summary: "Crea una nueva instancia Dragonfly. Requiere confirmación.",
  examples: [
    'invoke("create_database_dragonfly", {project_uuid: "...", server_uuid: "...", environment_name: "production", name: "cache"}) → {uuid: "...", name: "cache"}',
  ],
  parameters: {
    schema: CreateDatabaseDragonflySchema,
    description:
      "Proyecto, servidor, ambiente y nombre de la instancia",
  },
  response: {
    schema: CreateDatabaseResponseSchema,
    description: "Instancia creada",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 30000,
  tags: ["databases", "create", "dragonfly", "cache", "write"],
};

export const createDatabaseDragonflyTool: ToolHandler = createBaseTool(
  "create_database_dragonfly",
  CreateDatabaseDragonflySchema,
  CreateDatabaseResponseSchema,
  createDatabaseDragonflyHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === create_database_keydb ===

export const createDatabaseKeydbDefinition: ToolDefinition = {
  name: "create_database_keydb",
  category: "databases",
  description: "Crear una instancia KeyDB",
  summary: "Crea una nueva instancia KeyDB. Requiere confirmación.",
  examples: [
    'invoke("create_database_keydb", {project_uuid: "...", server_uuid: "...", environment_name: "production", name: "cache"}) → {uuid: "...", name: "cache"}',
  ],
  parameters: {
    schema: CreateDatabaseKeydbSchema,
    description:
      "Proyecto, servidor, ambiente y nombre de la instancia",
  },
  response: {
    schema: CreateDatabaseResponseSchema,
    description: "Instancia creada",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 30000,
  tags: ["databases", "create", "keydb", "cache", "write"],
};

export const createDatabaseKeydbTool: ToolHandler = createBaseTool(
  "create_database_keydb",
  CreateDatabaseKeydbSchema,
  CreateDatabaseResponseSchema,
  createDatabaseKeydbHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === create_database_clickhouse ===

export const createDatabaseClickhouseDefinition: ToolDefinition = {
  name: "create_database_clickhouse",
  category: "databases",
  description: "Crear una base de datos ClickHouse",
  summary: "Crea una nueva base de datos ClickHouse. Requiere confirmación.",
  examples: [
    'invoke("create_database_clickhouse", {project_uuid: "...", server_uuid: "...", environment_name: "production", name: "analytics"}) → {uuid: "...", name: "analytics"}',
  ],
  parameters: {
    schema: CreateDatabaseClickhouseSchema,
    description:
      "Proyecto, servidor, ambiente y nombre de la base de datos",
  },
  response: {
    schema: CreateDatabaseResponseSchema,
    description: "Base de datos creada",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 30000,
  tags: ["databases", "create", "clickhouse", "analytics", "write"],
};

export const createDatabaseClickhouseTool: ToolHandler = createBaseTool(
  "create_database_clickhouse",
  CreateDatabaseClickhouseSchema,
  CreateDatabaseResponseSchema,
  createDatabaseClickhouseHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === update_database ===

export const updateDatabaseDefinition: ToolDefinition = {
  name: "update_database",
  category: "databases",
  description: "Actualizar nombre o descripción de una base de datos",
  summary: "Modifica el nombre y/o descripción de la base de datos",
  examples: [
    'invoke("update_database", {uuid: "...", name: "nuevo_nombre"}) → {uuid: "...", name: "nuevo_nombre"}',
  ],
  parameters: {
    schema: UpdateDatabaseSchema,
    required: ["uuid"],
    description: "UUID y campos a actualizar",
  },
  response: {
    schema: DatabaseDetailSchema,
    description: "Base de datos actualizada",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 15000,
  tags: ["databases", "update", "write"],
};

export const updateDatabaseTool: ToolHandler = createBaseTool(
  "update_database",
  UpdateDatabaseSchema,
  DatabaseDetailSchema,
  updateDatabaseHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === delete_database ===

export const deleteDatabaseDefinition: ToolDefinition = {
  name: "delete_database",
  category: "databases",
  description: "Eliminar una base de datos",
  summary:
    "Elimina una base de datos (operación destructiva e irreversible)",
  examples: [
    'invoke("delete_database", {uuid: "..."}) → {success: true, message: "..."}',
  ],
  parameters: {
    schema: DeleteDatabaseSchema,
    required: ["uuid"],
    description: "UUID de la base de datos a eliminar",
  },
  response: {
    schema: ActionResponseSchema,
    description: "Confirmación de eliminación",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 30000,
  tags: ["databases", "delete", "write", "destructive"],
};

export const deleteDatabaseTool: ToolHandler = createBaseTool(
  "delete_database",
  DeleteDatabaseSchema,
  ActionResponseSchema,
  deleteDatabaseHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === start_database ===

export const startDatabaseDefinition: ToolDefinition = {
  name: "start_database",
  category: "databases",
  description: "Iniciar una base de datos detenida",
  summary: "Inicia una base de datos que está detenida. Requiere confirmación.",
  examples: [
    'invoke("start_database", {uuid: "..."}) → {success: true, message: "..."}',
  ],
  parameters: {
    schema: StartDatabaseSchema,
    required: ["uuid"],
    description: "UUID de la base de datos",
  },
  response: {
    schema: ActionResponseSchema,
    description: "Confirmación de inicio",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 20000,
  tags: ["databases", "control", "write"],
};

export const startDatabaseTool: ToolHandler = createBaseTool(
  "start_database",
  StartDatabaseSchema,
  ActionResponseSchema,
  startDatabaseHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === stop_database ===

export const stopDatabaseDefinition: ToolDefinition = {
  name: "stop_database",
  category: "databases",
  description: "Detener una base de datos",
  summary: "Detiene una base de datos en ejecución. Requiere confirmación.",
  examples: [
    'invoke("stop_database", {uuid: "..."}) → {success: true, message: "..."}',
  ],
  parameters: {
    schema: StopDatabaseSchema,
    required: ["uuid"],
    description: "UUID de la base de datos",
  },
  response: {
    schema: ActionResponseSchema,
    description: "Confirmación de detención",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 20000,
  tags: ["databases", "control", "write"],
};

export const stopDatabaseTool: ToolHandler = createBaseTool(
  "stop_database",
  StopDatabaseSchema,
  ActionResponseSchema,
  stopDatabaseHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === restart_database ===

export const restartDatabaseDefinition: ToolDefinition = {
  name: "restart_database",
  category: "databases",
  description: "Reiniciar una base de datos",
  summary: "Reinicia una base de datos. Requiere confirmación.",
  examples: [
    'invoke("restart_database", {uuid: "..."}) → {success: true, message: "..."}',
  ],
  parameters: {
    schema: RestartDatabaseSchema,
    required: ["uuid"],
    description: "UUID de la base de datos",
  },
  response: {
    schema: ActionResponseSchema,
    description: "Confirmación de reinicio",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 20000,
  tags: ["databases", "control", "write"],
};

export const restartDatabaseTool: ToolHandler = createBaseTool(
  "restart_database",
  RestartDatabaseSchema,
  ActionResponseSchema,
  restartDatabaseHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === list_database_backups ===

export const listDatabaseBackupsDefinition: ToolDefinition = {
  name: "list_database_backups",
  category: "databases",
  description: "Listar políticas de backup de una base de datos",
  summary: "Devuelve las políticas de backup configuradas",
  examples: [
    'invoke("list_database_backups", {uuid: "..."}) → {backups: [...], total: 2}',
  ],
  parameters: {
    schema: ListDatabaseBackupsSchema,
    required: ["uuid"],
    description: "UUID de la base de datos",
  },
  response: {
    schema: DatabaseBackupsListSchema,
    description: "Lista de políticas de backup",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["databases", "backups", "read"],
};

export const listDatabaseBackupsTool: ToolHandler = createBaseTool(
  "list_database_backups",
  ListDatabaseBackupsSchema,
  DatabaseBackupsListSchema,
  listDatabaseBackupsHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

// === create_database_backup ===

export const createDatabaseBackupDefinition: ToolDefinition = {
  name: "create_database_backup",
  category: "databases",
  description: "Crear política de backup para una base de datos",
  summary: "Crea una nueva política de backup automático",
  examples: [
    'invoke("create_database_backup", {uuid: "...", frequency: "daily", retention_days: 30}) → {...}',
  ],
  parameters: {
    schema: CreateDatabaseBackupSchema,
    required: ["uuid", "frequency", "retention_days"],
    description: "UUID, frecuencia y días de retención",
  },
  response: {
    schema: ActionResponseSchema,
    description: "Política de backup creada",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 15000,
  tags: ["databases", "backups", "write"],
};

export const createDatabaseBackupTool: ToolHandler = createBaseTool(
  "create_database_backup",
  CreateDatabaseBackupSchema,
  ActionResponseSchema,
  createDatabaseBackupHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === update_database_backup ===

export const updateDatabaseBackupDefinition: ToolDefinition = {
  name: "update_database_backup",
  category: "databases",
  description: "Actualizar política de backup",
  summary: "Modifica la frecuencia y/o días de retención de un backup",
  examples: [
    'invoke("update_database_backup", {uuid: "...", frequency: "weekly"}) → {...}',
  ],
  parameters: {
    schema: UpdateDatabaseBackupSchema,
    required: ["uuid"],
    description: "UUID y campos a actualizar",
  },
  response: {
    schema: ActionResponseSchema,
    description: "Política de backup actualizada",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 15000,
  tags: ["databases", "backups", "write"],
};

export const updateDatabaseBackupTool: ToolHandler = createBaseTool(
  "update_database_backup",
  UpdateDatabaseBackupSchema,
  ActionResponseSchema,
  updateDatabaseBackupHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === delete_database_backup ===

export const deleteDatabaseBackupDefinition: ToolDefinition = {
  name: "delete_database_backup",
  category: "databases",
  description: "Eliminar política de backup",
  summary: "Elimina una política de backup (operación irreversible)",
  examples: [
    'invoke("delete_database_backup", {uuid: "..."}) → {success: true, message: "..."}',
  ],
  parameters: {
    schema: DeleteDatabaseBackupSchema,
    required: ["uuid"],
    description: "UUID de la política de backup",
  },
  response: {
    schema: ActionResponseSchema,
    description: "Confirmación de eliminación",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 15000,
  tags: ["databases", "backups", "delete", "write"],
};

export const deleteDatabaseBackupTool: ToolHandler = createBaseTool(
  "delete_database_backup",
  DeleteDatabaseBackupSchema,
  ActionResponseSchema,
  deleteDatabaseBackupHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === list_backup_executions ===

export const listBackupExecutionsDefinition: ToolDefinition = {
  name: "list_backup_executions",
  category: "databases",
  description: "Listar ejecuciones de backup",
  summary: "Devuelve el histórico de ejecuciones de backup",
  examples: [
    'invoke("list_backup_executions", {limit: 50}) → {executions: [...], total: 150}',
  ],
  parameters: {
    schema: ListBackupExecutionsSchema,
    description: "Límite de resultados (default 50)",
  },
  response: {
    schema: BackupExecutionsListSchema,
    description: "Lista de ejecuciones de backup",
  },
  requiresConfirmation: false,
  readOnlyBlocks: false,
  timeout: 10000,
  tags: ["databases", "backups", "read"],
};

export const listBackupExecutionsTool: ToolHandler = createBaseTool(
  "list_backup_executions",
  ListBackupExecutionsSchema,
  BackupExecutionsListSchema,
  listBackupExecutionsHandler,
  {
    requiresConfirmation: false,
    readOnlyBlocks: false,
  }
);

// === delete_backup_execution ===

export const deleteBackupExecutionDefinition: ToolDefinition = {
  name: "delete_backup_execution",
  category: "databases",
  description: "Eliminar registro de ejecución de backup",
  summary: "Elimina un registro de ejecución de backup (no el backup)",
  examples: [
    'invoke("delete_backup_execution", {uuid: "..."}) → {success: true, message: "..."}',
  ],
  parameters: {
    schema: DeleteBackupExecutionSchema,
    required: ["uuid"],
    description: "UUID de la ejecución",
  },
  response: {
    schema: ActionResponseSchema,
    description: "Confirmación de eliminación",
  },
  requiresConfirmation: true,
  readOnlyBlocks: true,
  timeout: 15000,
  tags: ["databases", "backups", "delete", "write"],
};

export const deleteBackupExecutionTool: ToolHandler = createBaseTool(
  "delete_backup_execution",
  DeleteBackupExecutionSchema,
  ActionResponseSchema,
  deleteBackupExecutionHandler,
  {
    requiresConfirmation: true,
    readOnlyBlocks: true,
  }
);

// === Colección de tools ===

/**
 * Todos los tools de la categoría Databases (21 total)
 */
export const databasesTools = [
  { definition: listDatabasesDefinition, handler: listDatabasesTool },
  { definition: getDatabaseDefinition, handler: getDatabaseTool },
  {
    definition: createDatabasePostgresDefinition,
    handler: createDatabasePostgresTool,
  },
  { definition: createDatabaseMysqlDefinition, handler: createDatabaseMysqlTool },
  {
    definition: createDatabaseMariadbDefinition,
    handler: createDatabaseMariadbTool,
  },
  {
    definition: createDatabaseMongodbDefinition,
    handler: createDatabaseMongodbTool,
  },
  { definition: createDatabaseRedisDefinition, handler: createDatabaseRedisTool },
  {
    definition: createDatabaseDragonflyDefinition,
    handler: createDatabaseDragonflyTool,
  },
  { definition: createDatabaseKeydbDefinition, handler: createDatabaseKeydbTool },
  {
    definition: createDatabaseClickhouseDefinition,
    handler: createDatabaseClickhouseTool,
  },
  { definition: updateDatabaseDefinition, handler: updateDatabaseTool },
  { definition: deleteDatabaseDefinition, handler: deleteDatabaseTool },
  { definition: startDatabaseDefinition, handler: startDatabaseTool },
  { definition: stopDatabaseDefinition, handler: stopDatabaseTool },
  { definition: restartDatabaseDefinition, handler: restartDatabaseTool },
  {
    definition: listDatabaseBackupsDefinition,
    handler: listDatabaseBackupsTool,
  },
  {
    definition: createDatabaseBackupDefinition,
    handler: createDatabaseBackupTool,
  },
  {
    definition: updateDatabaseBackupDefinition,
    handler: updateDatabaseBackupTool,
  },
  {
    definition: deleteDatabaseBackupDefinition,
    handler: deleteDatabaseBackupTool,
  },
  {
    definition: listBackupExecutionsDefinition,
    handler: listBackupExecutionsTool,
  },
  {
    definition: deleteBackupExecutionDefinition,
    handler: deleteBackupExecutionTool,
  },
];
