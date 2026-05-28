/**
 * Zod schemas para herramientas de Bases de Datos (Databases)
 * 21 herramientas para gestión de BD: PostgreSQL, MySQL, MongoDB, Redis, etc.
 */

import { z } from "zod";
import { coolifyIdSchema } from "$lib/schemas/common";

// ============================================================
// PARÁMETROS
// ============================================================

export const ListDatabasesSchema = z.object({}).strict();

export const GetDatabaseSchema = z.object({
  uuid: coolifyIdSchema,
}).strict();

export const CreateDatabasePostgresSchema = z.object({
  project_uuid: coolifyIdSchema,
  server_uuid: coolifyIdSchema,
  environment_name: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
}).strict();

export const CreateDatabaseMysqlSchema = CreateDatabasePostgresSchema;
export const CreateDatabaseMariadbSchema = CreateDatabasePostgresSchema;
export const CreateDatabaseMongodbSchema = CreateDatabasePostgresSchema;
export const CreateDatabaseRedisSchema = CreateDatabasePostgresSchema;
export const CreateDatabaseDragonflySchema = CreateDatabasePostgresSchema;
export const CreateDatabaseKeydbSchema = CreateDatabasePostgresSchema;
export const CreateDatabaseClickhouseSchema = CreateDatabasePostgresSchema;

export const UpdateDatabaseSchema = z.object({
  uuid: coolifyIdSchema,
  name: z.string().min(1).optional(),
  description: z.string().optional(),
}).strict();

export const DeleteDatabaseSchema = z.object({
  uuid: coolifyIdSchema,
}).strict();

export const StartDatabaseSchema = z.object({
  uuid: coolifyIdSchema,
}).strict();

export const StopDatabaseSchema = z.object({
  uuid: coolifyIdSchema,
}).strict();

export const RestartDatabaseSchema = z.object({
  uuid: coolifyIdSchema,
}).strict();

export const ListDatabaseBackupsSchema = z.object({
  uuid: coolifyIdSchema,
}).strict();

export const CreateDatabaseBackupSchema = z.object({
  uuid: coolifyIdSchema,
  frequency: z.enum(["daily", "weekly", "monthly"]),
  retention_days: z.number().int().positive(),
}).strict();

export const UpdateDatabaseBackupSchema = z.object({
  uuid: coolifyIdSchema,
  frequency: z.enum(["daily", "weekly", "monthly"]).optional(),
  retention_days: z.number().int().positive().optional(),
}).strict();

export const DeleteDatabaseBackupSchema = z.object({
  uuid: coolifyIdSchema,
}).strict();

export const ListBackupExecutionsSchema = z.object({
  limit: z.number().int().positive().optional().default(50),
}).strict();

export const DeleteBackupExecutionSchema = z.object({
  uuid: coolifyIdSchema,
}).strict();

// ============================================================
// RESPUESTAS
// ============================================================

export const DatabaseSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  type: z.string(),
  status: z.string(),
  created_at: z.string().datetime(),
});

export const DatabaseDetailSchema = DatabaseSchema.extend({
  version: z.string().optional(),
  port: z.number().int().optional(),
});

export const DatabasesListSchema = z.object({
  databases: z.array(DatabaseSchema),
  total: z.number().int(),
});

export const CreateDatabaseResponseSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  status: z.string(),
});

export const UpdateDatabaseResponseSchema = DatabaseDetailSchema;
export const DeleteDatabaseResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const ActionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const DatabaseBackupSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  frequency: z.string(),
  retention_days: z.number().int(),
});

export const DatabaseBackupsListSchema = z.object({
  backups: z.array(DatabaseBackupSchema),
  total: z.number().int(),
});

export const BackupExecutionSchema = z.object({
  uuid: z.string(),
  backup_uuid: z.string(),
  status: z.string(),
  created_at: z.string().datetime(),
  size_bytes: z.number().int().optional(),
});

export const BackupExecutionsListSchema = z.object({
  executions: z.array(BackupExecutionSchema),
  total: z.number().int(),
});

// Tipos TypeScript
export type ListDatabasesParams = z.infer<typeof ListDatabasesSchema>;
export type GetDatabaseParams = z.infer<typeof GetDatabaseSchema>;
export type CreateDatabaseParams = z.infer<typeof CreateDatabasePostgresSchema>;
export type UpdateDatabaseParams = z.infer<typeof UpdateDatabaseSchema>;
export type DeleteDatabaseParams = z.infer<typeof DeleteDatabaseSchema>;
export type StartDatabaseParams = z.infer<typeof StartDatabaseSchema>;
export type StopDatabaseParams = z.infer<typeof StopDatabaseSchema>;
export type RestartDatabaseParams = z.infer<typeof RestartDatabaseSchema>;
export type ListDatabaseBackupsParams = z.infer<typeof ListDatabaseBackupsSchema>;
export type CreateDatabaseBackupParams = z.infer<typeof CreateDatabaseBackupSchema>;
export type UpdateDatabaseBackupParams = z.infer<typeof UpdateDatabaseBackupSchema>;
export type DeleteDatabaseBackupParams = z.infer<typeof DeleteDatabaseBackupSchema>;
export type ListBackupExecutionsParams = z.infer<typeof ListBackupExecutionsSchema>;
export type DeleteBackupExecutionParams = z.infer<typeof DeleteBackupExecutionSchema>;

export type DatabasesList = z.infer<typeof DatabasesListSchema>;
export type DatabaseDetail = z.infer<typeof DatabaseDetailSchema>;
export type CreateDatabaseResponse = z.infer<typeof CreateDatabaseResponseSchema>;
export type DatabaseBackupsList = z.infer<typeof DatabaseBackupsListSchema>;
export type BackupExecutionsList = z.infer<typeof BackupExecutionsListSchema>;
