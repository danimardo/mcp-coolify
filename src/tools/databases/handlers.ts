/**
 * Handlers para herramientas de Bases de Datos
 * Implementan la lógica de negocio y llamadas a la API de Coolify
 * 21 operaciones: list, get, create (8 tipos), update, delete, start, stop, restart, backup (6 ops)
 */

import type { ExtendedToolContext } from "$lib/tools/types";
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

/**
 * Handler para listar todas las bases de datos
 * GET /databases
 */
export async function listDatabasesHandler(
  _parameters: unknown,
  context: ExtendedToolContext
): Promise<DatabasesList> {
  const response = await context.httpClient.get<any>(`/databases`, {
    requestId: context.requestId,
  });

  const databases = Array.isArray(response) ? response : response.databases || [];

  return {
    databases: databases.map((db: any) => ({
      uuid: db.uuid,
      name: db.name,
      type: db.type,
      status: db.status || "unknown",
      created_at: db.created_at || new Date().toISOString(),
    })),
    total: databases.length,
  };
}

/**
 * Handler para obtener una base de datos específica
 * GET /databases/{uuid}
 */
export async function getDatabaseHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<DatabaseDetail> {
  const params = parameters as GetDatabaseParams;

  const response = await context.httpClient.get<DatabaseDetail>(
    `/databases/${params.uuid}`,
    {
      requestId: context.requestId,
    }
  );

  return response;
}

/**
 * Handler para crear una base de datos PostgreSQL
 * POST /databases { type: 'postgresql', ... }
 */
export async function createDatabasePostgresHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<CreateDatabaseResponse> {
  const params = parameters as CreateDatabaseParams;

  const payload = {
    ...params,
    type: "postgresql",
  };

  const response = await context.httpClient.post<CreateDatabaseResponse>(
    "/databases",
    payload,
    {
      requestId: context.requestId,
    }
  );

  return response;
}

/**
 * Handler para crear una base de datos MySQL
 * POST /databases { type: 'mysql', ... }
 */
export async function createDatabaseMysqlHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<CreateDatabaseResponse> {
  const params = parameters as CreateDatabaseParams;

  const payload = {
    ...params,
    type: "mysql",
  };

  const response = await context.httpClient.post<CreateDatabaseResponse>(
    "/databases",
    payload,
    {
      requestId: context.requestId,
    }
  );

  return response;
}

/**
 * Handler para crear una base de datos MariaDB
 * POST /databases { type: 'mariadb', ... }
 */
export async function createDatabaseMariadbHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<CreateDatabaseResponse> {
  const params = parameters as CreateDatabaseParams;

  const payload = {
    ...params,
    type: "mariadb",
  };

  const response = await context.httpClient.post<CreateDatabaseResponse>(
    "/databases",
    payload,
    {
      requestId: context.requestId,
    }
  );

  return response;
}

/**
 * Handler para crear una base de datos MongoDB
 * POST /databases { type: 'mongodb', ... }
 */
export async function createDatabaseMongodbHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<CreateDatabaseResponse> {
  const params = parameters as CreateDatabaseParams;

  const payload = {
    ...params,
    type: "mongodb",
  };

  const response = await context.httpClient.post<CreateDatabaseResponse>(
    "/databases",
    payload,
    {
      requestId: context.requestId,
    }
  );

  return response;
}

/**
 * Handler para crear una base de datos Redis
 * POST /databases { type: 'redis', ... }
 */
export async function createDatabaseRedisHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<CreateDatabaseResponse> {
  const params = parameters as CreateDatabaseParams;

  const payload = {
    ...params,
    type: "redis",
  };

  const response = await context.httpClient.post<CreateDatabaseResponse>(
    "/databases",
    payload,
    {
      requestId: context.requestId,
    }
  );

  return response;
}

/**
 * Handler para crear una base de datos Dragonfly
 * POST /databases { type: 'dragonfly', ... }
 */
export async function createDatabaseDragonflyHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<CreateDatabaseResponse> {
  const params = parameters as CreateDatabaseParams;

  const payload = {
    ...params,
    type: "dragonfly",
  };

  const response = await context.httpClient.post<CreateDatabaseResponse>(
    "/databases",
    payload,
    {
      requestId: context.requestId,
    }
  );

  return response;
}

/**
 * Handler para crear una base de datos KeyDB
 * POST /databases { type: 'keydb', ... }
 */
export async function createDatabaseKeydbHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<CreateDatabaseResponse> {
  const params = parameters as CreateDatabaseParams;

  const payload = {
    ...params,
    type: "keydb",
  };

  const response = await context.httpClient.post<CreateDatabaseResponse>(
    "/databases",
    payload,
    {
      requestId: context.requestId,
    }
  );

  return response;
}

/**
 * Handler para crear una base de datos ClickHouse
 * POST /databases { type: 'clickhouse', ... }
 */
export async function createDatabaseClickhouseHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<CreateDatabaseResponse> {
  const params = parameters as CreateDatabaseParams;

  const payload = {
    ...params,
    type: "clickhouse",
  };

  const response = await context.httpClient.post<CreateDatabaseResponse>(
    "/databases",
    payload,
    {
      requestId: context.requestId,
    }
  );

  return response;
}

/**
 * Handler para actualizar una base de datos
 * PATCH /databases/{uuid}
 */
export async function updateDatabaseHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<DatabaseDetail> {
  const { uuid, name, description } = parameters as UpdateDatabaseParams;

  const response = await context.httpClient.post<DatabaseDetail>(
    `/databases/${uuid}`,
    {
      name,
      description,
    },
    {
      requestId: context.requestId,
    }
  );

  return response;
}

/**
 * Handler para eliminar una base de datos
 * DELETE /databases/{uuid}
 */
export async function deleteDatabaseHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid } = parameters as DeleteDatabaseParams;

  await context.httpClient.post(`/databases/${uuid}`, null, {
    requestId: context.requestId,
  });

  return {
    success: true,
    message: `Base de datos ${uuid} eliminada correctamente`,
  };
}

/**
 * Handler para iniciar una base de datos
 * POST /databases/{uuid}/start
 */
export async function startDatabaseHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid } = parameters as StartDatabaseParams;

  const response = await context.httpClient.post(
    `/databases/${uuid}/start`,
    {},
    {
      requestId: context.requestId,
    }
  );

  return {
    success: true,
    message: `Base de datos ${uuid} iniciada`,
    result: response,
  };
}

/**
 * Handler para detener una base de datos
 * POST /databases/{uuid}/stop
 */
export async function stopDatabaseHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid } = parameters as StopDatabaseParams;

  const response = await context.httpClient.post(
    `/databases/${uuid}/stop`,
    {},
    {
      requestId: context.requestId,
    }
  );

  return {
    success: true,
    message: `Base de datos ${uuid} detenida`,
    result: response,
  };
}

/**
 * Handler para reiniciar una base de datos
 * POST /databases/{uuid}/restart
 */
export async function restartDatabaseHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid } = parameters as RestartDatabaseParams;

  const response = await context.httpClient.post(
    `/databases/${uuid}/restart`,
    {},
    {
      requestId: context.requestId,
    }
  );

  return {
    success: true,
    message: `Base de datos ${uuid} reiniciada`,
    result: response,
  };
}

/**
 * Handler para listar backups de una base de datos
 * GET /databases/{uuid}/backups
 */
export async function listDatabaseBackupsHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<DatabaseBackupsList> {
  const { uuid } = parameters as ListDatabaseBackupsParams;

  const response = await context.httpClient.get<any>(
    `/databases/${uuid}/backups`,
    {
      requestId: context.requestId,
    }
  );

  const backups = Array.isArray(response) ? response : response.backups || [];

  return {
    backups: backups.map((b: any) => ({
      uuid: b.uuid,
      name: b.name,
      frequency: b.frequency,
      retention_days: b.retention_days,
    })),
    total: backups.length,
  };
}

/**
 * Handler para crear un backup para una base de datos
 * POST /databases/{uuid}/backups { frequency, retention_days }
 */
export async function createDatabaseBackupHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid, frequency, retention_days } =
    parameters as CreateDatabaseBackupParams;

  const response = await context.httpClient.post(
    `/databases/${uuid}/backups`,
    {
      frequency,
      retention_days,
    },
    {
      requestId: context.requestId,
    }
  );

  return response;
}

/**
 * Handler para actualizar configuración de backup
 * PATCH /databases/{uuid}/backups/{backup_uuid}
 */
export async function updateDatabaseBackupHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid, frequency, retention_days } =
    parameters as UpdateDatabaseBackupParams;

  const response = await context.httpClient.post(
    `/databases/${uuid}/backups`,
    {
      frequency,
      retention_days,
    },
    {
      requestId: context.requestId,
    }
  );

  return response;
}

/**
 * Handler para eliminar una política de backup
 * DELETE /databases/{uuid}/backups/{backup_uuid}
 */
export async function deleteDatabaseBackupHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid } = parameters as DeleteDatabaseBackupParams;

  await context.httpClient.post(`/databases/${uuid}/backups`, null, {
    requestId: context.requestId,
  });

  return {
    success: true,
    message: `Política de backup eliminada correctamente`,
  };
}

/**
 * Handler para listar ejecuciones de backup
 * GET /backups/executions?limit=50
 */
export async function listBackupExecutionsHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<BackupExecutionsList> {
  const params = parameters as ListBackupExecutionsParams;

  const queryString = `?limit=${params.limit || 50}`;

  const response = await context.httpClient.get<any>(
    `/backups/executions${queryString}`,
    {
      requestId: context.requestId,
    }
  );

  const executions = Array.isArray(response)
    ? response
    : response.executions || [];

  return {
    executions: executions.map((e: any) => ({
      uuid: e.uuid,
      backup_uuid: e.backup_uuid,
      status: e.status,
      created_at: e.created_at || new Date().toISOString(),
      size_bytes: e.size_bytes,
    })),
    total: executions.length,
  };
}

/**
 * Handler para eliminar una ejecución de backup
 * DELETE /backups/executions/{uuid}
 */
export async function deleteBackupExecutionHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<unknown> {
  const { uuid } = parameters as DeleteBackupExecutionParams;

  await context.httpClient.post(`/backups/executions/${uuid}`, null, {
    requestId: context.requestId,
  });

  return {
    success: true,
    message: `Ejecución de backup ${uuid} eliminada correctamente`,
  };
}
