/**
 * Handlers para herramientas de Bases de Datos
 */

import type { ExtendedToolContext } from "$lib/tools/types";
import {
  extractArray,
  asRecord,
  asString,
  asStringOpt,
  asNumberOpt,
  asIsoDate,
} from "$lib/tools/response-helpers";
import type {
  GetDatabaseParams,
  CreateDatabaseParams,
  UpdateDatabaseParams,
  DeleteDatabaseParams,
  StartDatabaseParams,
  StopDatabaseParams,
  RestartDatabaseParams,
  ListDatabaseBackupsParams,
  CreateDatabaseBackupParams,
  UpdateDatabaseBackupParams,
  DeleteDatabaseBackupParams,
  ListBackupExecutionsParams,
  DeleteBackupExecutionParams,
  DatabasesList,
  DatabaseDetail,
  CreateDatabaseResponse,
  DatabaseBackupsList,
  BackupExecutionsList,
} from "./schemas";

/** GET /databases */
export async function listDatabasesHandler(
  _parameters: unknown,
  context: ExtendedToolContext
): Promise<DatabasesList> {
  const response = await context.httpClient.get<unknown>(`/databases`, {
    requestId: context.requestId,
  });

  const databases = extractArray(response, "databases");

  return {
    databases: databases.map((db) => ({
      uuid: asString(db.uuid),
      name: asString(db.name),
      type: asString(db.type),
      status: asString(db.status, "unknown"),
      created_at: asIsoDate(db.created_at),
    })),
    total: databases.length,
  };
}

/** GET /databases/{uuid} */
export async function getDatabaseHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<DatabaseDetail> {
  const { uuid } = parameters as GetDatabaseParams;

  const response = await context.httpClient.get<unknown>(`/databases/${uuid}`, {
    requestId: context.requestId,
  });

  const db = asRecord(response);
  return {
    uuid: asString(db.uuid),
    name: asString(db.name),
    type: asString(db.type),
    status: asString(db.status, "unknown"),
    created_at: asIsoDate(db.created_at),
    version: asStringOpt(db.version),
    port: asNumberOpt(db.port),
  };
}

/** POST /databases/postgresql */
export async function createDatabasePostgresHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<CreateDatabaseResponse> {
  const params = parameters as CreateDatabaseParams;
  const response = await context.httpClient.post<unknown>("/databases/postgresql", params, {
    requestId: context.requestId,
  });
  const r = asRecord(response);
  return { uuid: asString(r.uuid), name: asString(r.name), status: asString(r.status, "created") };
}

/** POST /databases/mysql */
export async function createDatabaseMysqlHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<CreateDatabaseResponse> {
  const params = parameters as CreateDatabaseParams;
  const response = await context.httpClient.post<unknown>("/databases/mysql", params, {
    requestId: context.requestId,
  });
  const r = asRecord(response);
  return { uuid: asString(r.uuid), name: asString(r.name), status: asString(r.status, "created") };
}

/** POST /databases/mariadb */
export async function createDatabaseMariadbHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<CreateDatabaseResponse> {
  const params = parameters as CreateDatabaseParams;
  const response = await context.httpClient.post<unknown>("/databases/mariadb", params, {
    requestId: context.requestId,
  });
  const r = asRecord(response);
  return { uuid: asString(r.uuid), name: asString(r.name), status: asString(r.status, "created") };
}

/** POST /databases/mongodb */
export async function createDatabaseMongodbHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<CreateDatabaseResponse> {
  const params = parameters as CreateDatabaseParams;
  const response = await context.httpClient.post<unknown>("/databases/mongodb", params, {
    requestId: context.requestId,
  });
  const r = asRecord(response);
  return { uuid: asString(r.uuid), name: asString(r.name), status: asString(r.status, "created") };
}

/** POST /databases/redis */
export async function createDatabaseRedisHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<CreateDatabaseResponse> {
  const params = parameters as CreateDatabaseParams;
  const response = await context.httpClient.post<unknown>("/databases/redis", params, {
    requestId: context.requestId,
  });
  const r = asRecord(response);
  return { uuid: asString(r.uuid), name: asString(r.name), status: asString(r.status, "created") };
}

/** POST /databases/dragonfly */
export async function createDatabaseDragonflyHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<CreateDatabaseResponse> {
  const params = parameters as CreateDatabaseParams;
  const response = await context.httpClient.post<unknown>("/databases/dragonfly", params, {
    requestId: context.requestId,
  });
  const r = asRecord(response);
  return { uuid: asString(r.uuid), name: asString(r.name), status: asString(r.status, "created") };
}

/** POST /databases/keydb */
export async function createDatabaseKeydbHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<CreateDatabaseResponse> {
  const params = parameters as CreateDatabaseParams;
  const response = await context.httpClient.post<unknown>("/databases/keydb", params, {
    requestId: context.requestId,
  });
  const r = asRecord(response);
  return { uuid: asString(r.uuid), name: asString(r.name), status: asString(r.status, "created") };
}

/** POST /databases/clickhouse */
export async function createDatabaseClickhouseHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<CreateDatabaseResponse> {
  const params = parameters as CreateDatabaseParams;
  const response = await context.httpClient.post<unknown>("/databases/clickhouse", params, {
    requestId: context.requestId,
  });
  const r = asRecord(response);
  return { uuid: asString(r.uuid), name: asString(r.name), status: asString(r.status, "created") };
}

/** PATCH /databases/{uuid} */
export async function updateDatabaseHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<DatabaseDetail> {
  const { uuid, name, description } = parameters as UpdateDatabaseParams;

  const response = await context.httpClient.patch<unknown>(
    `/databases/${uuid}`,
    { name, description },
    { requestId: context.requestId }
  );

  const db = asRecord(response);
  return {
    uuid: asString(db.uuid),
    name: asString(db.name),
    type: asString(db.type),
    status: asString(db.status, "unknown"),
    created_at: asIsoDate(db.created_at),
    version: asStringOpt(db.version),
    port: asNumberOpt(db.port),
  };
}

/** DELETE /databases/{uuid} */
export async function deleteDatabaseHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid } = parameters as DeleteDatabaseParams;

  await context.httpClient.delete(`/databases/${uuid}`, {
    requestId: context.requestId,
  });

  return { success: true, message: `Base de datos ${uuid} eliminada correctamente` };
}

/** GET /databases/{uuid}/start */
export async function startDatabaseHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid } = parameters as StartDatabaseParams;

  await context.httpClient.get<unknown>(`/databases/${uuid}/start`, {
    requestId: context.requestId,
  });

  return { success: true, message: `Base de datos ${uuid} iniciada` };
}

/** GET /databases/{uuid}/stop */
export async function stopDatabaseHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid } = parameters as StopDatabaseParams;

  await context.httpClient.get<unknown>(`/databases/${uuid}/stop`, {
    requestId: context.requestId,
  });

  return { success: true, message: `Base de datos ${uuid} detenida` };
}

/** GET /databases/{uuid}/restart */
export async function restartDatabaseHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid } = parameters as RestartDatabaseParams;

  await context.httpClient.get<unknown>(`/databases/${uuid}/restart`, {
    requestId: context.requestId,
  });

  return { success: true, message: `Base de datos ${uuid} reiniciada` };
}

/** GET /databases/{uuid}/backups */
export async function listDatabaseBackupsHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<DatabaseBackupsList> {
  const { uuid } = parameters as ListDatabaseBackupsParams;

  const response = await context.httpClient.get<unknown>(
    `/databases/${uuid}/backups`,
    { requestId: context.requestId }
  );

  const backups = extractArray(response, "backups");

  return {
    backups: backups.map((b) => ({
      uuid: asString(b.uuid),
      name: asString(b.name),
      frequency: asString(b.frequency),
      retention_days: asNumberOpt(b.retention_days) ?? 0,
    })),
    total: backups.length,
  };
}

/** POST /databases/{uuid}/backups */
export async function createDatabaseBackupHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid, frequency, retention_days } = parameters as CreateDatabaseBackupParams;

  const response = await context.httpClient.post<unknown>(
    `/databases/${uuid}/backups`,
    { frequency, retention_days },
    { requestId: context.requestId }
  );

  return response;
}

/** PATCH /databases/backups/{backup_uuid} */
export async function updateDatabaseBackupHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid: backup_uuid, frequency, retention_days } =
    parameters as UpdateDatabaseBackupParams;

  const response = await context.httpClient.patch<unknown>(
    `/databases/backups/${backup_uuid}`,
    { frequency, retention_days },
    { requestId: context.requestId }
  );

  return response;
}

/** DELETE /databases/backups/{backup_uuid} */
export async function deleteDatabaseBackupHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid: backup_uuid } = parameters as DeleteDatabaseBackupParams;

  await context.httpClient.delete(`/databases/backups/${backup_uuid}`, {
    requestId: context.requestId,
  });

  return { success: true, message: `Política de backup eliminada correctamente` };
}

/** GET /databases/backup-executions?limit=N */
export async function listBackupExecutionsHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<BackupExecutionsList> {
  const params = parameters as ListBackupExecutionsParams;
  const queryString = `?limit=${params.limit ?? 50}`;

  const response = await context.httpClient.get<unknown>(
    `/databases/backup-executions${queryString}`,
    { requestId: context.requestId }
  );

  const executions = extractArray(response, "executions");

  return {
    executions: executions.map((e) => ({
      uuid: asString(e.uuid),
      backup_uuid: asString(e.backup_uuid),
      status: asString(e.status),
      created_at: asIsoDate(e.created_at),
      size_bytes: asNumberOpt(e.size_bytes),
    })),
    total: executions.length,
  };
}

/** DELETE /databases/backup-executions/{uuid} */
export async function deleteBackupExecutionHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid } = parameters as DeleteBackupExecutionParams;

  await context.httpClient.delete(`/databases/backup-executions/${uuid}`, {
    requestId: context.requestId,
  });

  return { success: true, message: `Ejecución de backup ${uuid} eliminada correctamente` };
}
