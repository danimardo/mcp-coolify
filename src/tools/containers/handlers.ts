/**
 * Handlers para la categoría Containers
 */

import type { ExtendedToolContext } from "$lib/tools/types";
import { SshDisabledError, SshCommandError } from "$lib/errors/error-types";
import {
  runSsh,
  buildContainerLogsScript,
  parseContainerLogsOutput,
  type SshConnection,
} from "$lib/ssh/runner.server";
import type { GetContainerLogsParams, ContainerLogsResponse } from "./schemas";

/**
 * Resuelve la conexión SSH desde el contexto o lanza SshDisabledError con una
 * pista accionable si SSH_ENABLED no está configurado correctamente.
 */
function resolveSshConnection(context: ExtendedToolContext): SshConnection {
  const ssh = context.config.ssh;
  if (!ssh?.enabled) {
    context.logger.warn("ssh.disabled", { requestId: context.requestId });
    throw new SshDisabledError(
      "SSH está deshabilitado. Define SSH_ENABLED=true junto con SSH_HOST, SSH_USER y SSH_PRIVATE_KEY_PATH."
    );
  }
  if (!ssh.host || !ssh.user || !ssh.privateKeyPath) {
    throw new SshDisabledError(
      "Configuración SSH incompleta: faltan SSH_HOST, SSH_USER o SSH_PRIVATE_KEY_PATH."
    );
  }
  return {
    host: ssh.host,
    port: ssh.port,
    user: ssh.user,
    privateKeyPath: ssh.privateKeyPath,
    strictHostKeyChecking: ssh.strictHostKeyChecking,
    knownHostsPath: ssh.knownHostsPath,
    commandTimeoutMs: ssh.commandTimeoutMs,
  };
}

/**
 * Obtener logs de los contenedores Docker de un recurso Coolify.
 * No usa la API de Coolify: abre SSH contra el host Docker y ejecuta
 * `docker ps` / `docker inspect` / `docker logs` (operación de solo lectura).
 */
export async function getContainerLogsHandler(
  parameters: unknown,
  context: ExtendedToolContext
): Promise<ContainerLogsResponse> {
  const params = parameters as GetContainerLogsParams;
  const conn = resolveSshConnection(context);

  const script = buildContainerLogsScript({
    uuid: params.resource_uuid,
    tail: params.tail,
    since: params.since,
    timestamps: params.timestamps,
    container: params.container,
  });

  const startedAt = Date.now();
  context.logger.info("ssh.command.started", {
    requestId: context.requestId,
    host: conn.host,
    resourceType: params.resource_type,
    resourceUuid: params.resource_uuid,
    container: params.container,
    tail: params.tail,
  });

  const result = await runSsh(conn, script);
  const durationMs = Date.now() - startedAt;

  if (result.exitCode === 3) {
    context.logger.warn("ssh.command.failed", {
      requestId: context.requestId,
      host: conn.host,
      reason: "no_containers",
      resourceUuid: params.resource_uuid,
      durationMs,
    });
    throw new SshCommandError(
      `No se encontraron contenedores para ${params.resource_type} ${params.resource_uuid} en ${conn.host}.`,
      { stderr: result.stderr.trim() }
    );
  }

  if (result.exitCode !== 0) {
    context.logger.error("ssh.command.failed", {
      requestId: context.requestId,
      host: conn.host,
      exitCode: result.exitCode,
      resourceUuid: params.resource_uuid,
      durationMs,
    });
    throw new SshCommandError(
      `El comando remoto falló (exit ${result.exitCode}) en ${conn.host}.`,
      { stderr: result.stderr.trim().slice(0, 2000) }
    );
  }

  const parsed = parseContainerLogsOutput(result.stdout);

  context.logger.info("ssh.command.completed", {
    requestId: context.requestId,
    host: conn.host,
    resourceUuid: params.resource_uuid,
    containers: parsed.length,
    durationMs,
  });

  return {
    server: { host: conn.host, user: conn.user, port: conn.port },
    resource_type: params.resource_type,
    resource_uuid: params.resource_uuid,
    matched_containers: parsed.map((c) => c.name),
    containers: parsed.map((c) => ({
      name: c.name,
      state: c.state,
      service: c.service,
      lines: c.lines,
      logs: c.logs,
    })),
  };
}
