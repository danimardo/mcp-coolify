/**
 * MCP Confirmation Flow Implementation
 *
 * 4-step process:
 * 1. Agent invokes critical operation
 * 2. Server requests confirmation (returns token + operationId)
 * 3. Agent confirms with confirm_operation (token + operationId)
 * 4. Server executes the original operation and returns the result
 *
 * Tokens expire after 5 minutes
 */

import { randomUUID } from "crypto";
import type { Logger } from "../logging/types";

export interface ConfirmationContext {
  operationId: string;
  operationName: string;
  parameters: Record<string, unknown>;
  reason: string;
  requiredConfirmation: boolean;
}

export interface ConfirmationToken {
  token: string;
  operationId: string;
  expiresAt: number;
}

type StoredHandler = (params: unknown, ctx: unknown) => Promise<unknown>;

interface PendingOperation {
  token: string;
  operationId: string;
  handler: StoredHandler;
  parameters: Record<string, unknown>;
  context: unknown;
  expiresAt: number;
}

/**
 * In-memory store for pending confirmations and operations
 */
class ConfirmationStore {
  private pendingConfirmations = new Map<string, ConfirmationToken>();
  private pendingOperations = new Map<string, PendingOperation>();
  private confirmedOperations = new Map<string, number>(); // operationId -> expiresAt

  createToken(operationId: string): string {
    const token = randomUUID();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    this.pendingConfirmations.set(token, { token, operationId, expiresAt });
    return token;
  }

  /**
   * Store an operation for deferred execution after confirmation
   */
  storePendingOperation(
    operationId: string,
    token: string,
    handler: StoredHandler,
    parameters: Record<string, unknown>,
    context: unknown
  ): void {
    const expiresAt = Date.now() + 5 * 60 * 1000;
    this.pendingOperations.set(operationId, {
      token,
      operationId,
      handler,
      parameters,
      context,
      expiresAt,
    });
  }

  /**
   * Verify token and execute the stored operation.
   * Returns the operation result or null if token is invalid/expired.
   */
  verifyAndExecute(operationId: string, token: string): Promise<unknown> | null {
    const op = this.pendingOperations.get(operationId);

    if (!op) return null;
    if (op.token !== token) return null;
    if (op.expiresAt < Date.now()) {
      this.pendingOperations.delete(operationId);
      return null;
    }

    this.pendingOperations.delete(operationId); // consume it
    return op.handler(op.parameters, op.context);
  }

  verifyToken(token: string, operationId: string): boolean {
    const confirmation = this.pendingConfirmations.get(token);
    if (!confirmation) return false;
    if (confirmation.expiresAt < Date.now()) {
      this.pendingConfirmations.delete(token);
      return false;
    }
    if (confirmation.operationId !== operationId) return false;

    const confirmedExpiresAt = Date.now() + 30 * 1000;
    this.confirmedOperations.set(operationId, confirmedExpiresAt);
    this.pendingConfirmations.delete(token);
    return true;
  }

  isConfirmed(operationId: string): boolean {
    const expiresAt = this.confirmedOperations.get(operationId);
    if (!expiresAt) return false;
    if (expiresAt < Date.now()) {
      this.confirmedOperations.delete(operationId);
      return false;
    }
    return true;
  }

  clearConfirmed(operationId: string): void {
    this.confirmedOperations.delete(operationId);
    this.pendingOperations.delete(operationId);
  }
}

const store = new ConfirmationStore();

export class ConfirmationFlow {
  constructor(private logger: Logger) {}

  requestConfirmation(context: ConfirmationContext): string {
    const token = store.createToken(context.operationId);

    this.logger.info("operation.confirmation.requested", {
      operationId: context.operationId,
      operationName: context.operationName,
      reason: context.reason,
      tokenExpiresInSeconds: 300,
    });

    return token;
  }

  /**
   * Store the operation for deferred execution after the agent confirms it.
   * Must be called right after requestConfirmation with the same operationId and token.
   */
  storeOperation(
    operationId: string,
    token: string,
    handler: StoredHandler,
    parameters: Record<string, unknown>,
    context: unknown
  ): void {
    store.storePendingOperation(operationId, token, handler, parameters, context);
  }

  /**
   * Verify the confirmation token and execute the stored operation.
   * Returns the result or null if the token is invalid/expired.
   */
  executeConfirmed(operationId: string, token: string): Promise<unknown> | null {
    const resultPromise = store.verifyAndExecute(operationId, token);

    if (resultPromise !== null) {
      this.logger.info("operation.confirmed", { operationId });
    } else {
      this.logger.warn("operation.confirmation_failed", {
        operationId,
        reason: "Invalid or expired token",
      });
    }

    return resultPromise;
  }

  verifyConfirmation(operationId: string, token: string): boolean {
    const isValid = store.verifyToken(token, operationId);
    if (isValid) {
      this.logger.info("operation.confirmed", { operationId });
    } else {
      this.logger.warn("operation.confirmation_failed", {
        operationId,
        reason: "Invalid or expired token",
      });
    }
    return isValid;
  }

  isConfirmed(operationId: string): boolean {
    return store.isConfirmed(operationId);
  }

  clearConfirmed(operationId: string): void {
    store.clearConfirmed(operationId);
  }

  cancelConfirmation(operationId: string): void {
    store.clearConfirmed(operationId);
    this.logger.info("operation.cancelled", { operationId });
  }
}

/**
 * Check if a tool requires confirmation based on the critical operations list.
 * NOTE: The server also checks ToolDefinition.requiresConfirmation - this function
 * is kept for backward compatibility but the definition flag takes precedence.
 */
export function requiresConfirmation(toolName: string): boolean {
  const criticalOperations = [
    // Project operations
    "create_project", "update_project", "delete_project",
    // Application operations
    "create_application", "update_application", "delete_application",
    "restart_application", "stop_application", "start_application",
    // Deployment operations
    "trigger_deployment", "cancel_deployment", "rollback_deployment",
    // Database operations
    "create_database_postgres", "create_database_mysql", "create_database_mariadb",
    "create_database_mongodb", "create_database_redis", "create_database_dragonfly",
    "create_database_keydb", "create_database_clickhouse",
    "update_database", "delete_database",
    "start_database", "stop_database", "restart_database",
    "create_database_backup", "update_database_backup", "delete_database_backup",
    "delete_backup_execution",
    // Service operations
    "create_service", "update_service", "delete_service",
    "start_service", "stop_service", "restart_service",
    "update_service_env",
    // Server operations
    "create_server", "update_server", "delete_server",
    // Environment operations
    "create_environment", "delete_environment",
    // Secret operations
    "create_private_key", "update_private_key", "delete_private_key",
    "create_cloud_token", "update_cloud_token", "delete_cloud_token",
    // GitHub Apps
    "create_github_app", "update_github_app", "delete_github_app",
    // Hetzner
    "create_hetzner_server",
  ];

  return criticalOperations.includes(toolName);
}

export function getConfirmationReason(toolName: string): string {
  const reasons: Record<string, string> = {
    delete_application: "Operación destructiva - la aplicación se eliminará permanentemente",
    delete_project: "Operación destructiva - el proyecto y todos sus recursos se eliminarán",
    delete_database: "Operación destructiva - la base de datos y sus datos se eliminarán",
    delete_service: "Operación destructiva - el servicio se eliminará permanentemente",
    delete_server: "Operación destructiva - el servidor se desconectará y eliminará",
    delete_environment: "Operación destructiva - el ambiente y sus recursos se eliminarán",
    stop_application: "Detiene la aplicación en ejecución",
    stop_database: "Detiene la base de datos en ejecución",
    stop_service: "Detiene el servicio en ejecución",
    restart_application: "Reinicia la aplicación (causa downtime breve)",
    restart_database: "Reinicia la base de datos (causa downtime breve)",
    restart_service: "Reinicia el servicio (causa downtime breve)",
    trigger_deployment: "Inicia un nuevo despliegue en producción",
    create_private_key: "Crea una clave privada sensible",
    create_cloud_token: "Crea un token de nube con acceso a infraestructura",
    create_github_app: "Crea una aplicación GitHub con acceso a repositorios",
  };

  return reasons[toolName] ?? "Operación que requiere confirmación explícita";
}
