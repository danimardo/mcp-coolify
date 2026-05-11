/**
 * MCP Confirmation Flow Implementation
 *
 * 4-step process:
 * 1. Agent invokes critical operation
 * 2. Server requests confirmation (returns token)
 * 3. Agent confirms with token
 * 4. Server executes operation
 *
 * Tokens expire after 5 minutes
 */

import { randomUUID } from "crypto";
import { Logger } from "../logging/types";

export interface ConfirmationContext {
  operationId: string;
  operationName: string;
  parameters: Record<string, unknown>;
  reason: string; // Why confirmation is required (e.g., "Destructive", "Cost Impact")
  requiredConfirmation: boolean;
}

export interface ConfirmationToken {
  token: string;
  operationId: string;
  expiresAt: number;
}

/**
 * In-memory store for pending confirmations
 * In production, would use Redis or database
 */
class ConfirmationStore {
  private pendingConfirmations = new Map<string, ConfirmationToken>();
  private confirmedOperations = new Set<string>();

  /**
   * Create a new confirmation token
   */
  createToken(operationId: string): string {
    const token = randomUUID();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    this.pendingConfirmations.set(token, {
      token,
      operationId,
      expiresAt,
    });

    return token;
  }

  /**
   * Verify and consume a confirmation token
   */
  verifyToken(token: string, operationId: string): boolean {
    const confirmation = this.pendingConfirmations.get(token);

    if (!confirmation) {
      return false;
    }

    // Check expiration
    if (confirmation.expiresAt < Date.now()) {
      this.pendingConfirmations.delete(token);
      return false;
    }

    // Check operation ID matches
    if (confirmation.operationId !== operationId) {
      return false;
    }

    // Token is valid - mark operation as confirmed and remove token
    this.confirmedOperations.add(operationId);
    this.pendingConfirmations.delete(token);

    return true;
  }

  /**
   * Check if operation was confirmed
   */
  isConfirmed(operationId: string): boolean {
    return this.confirmedOperations.has(operationId);
  }

  /**
   * Clear confirmed operation (after execution)
   */
  clearConfirmed(operationId: string): void {
    this.confirmedOperations.delete(operationId);
  }
}

const store = new ConfirmationStore();

/**
 * Confirmation flow handler
 */
export class ConfirmationFlow {
  constructor(private logger: Logger) {}

  /**
   * Request confirmation for a critical operation
   * Returns confirmation token to send back to agent
   */
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
   * Verify confirmation from agent
   * Agent provides the token they received
   */
  verifyConfirmation(operationId: string, token: string): boolean {
    const isValid = store.verifyToken(token, operationId);

    if (isValid) {
      this.logger.info("operation.confirmed", {
        operationId,
      });
    } else {
      this.logger.warn("operation.confirmation_failed", {
        operationId,
        reason: "Invalid or expired token",
      });
    }

    return isValid;
  }

  /**
   * Check if operation was confirmed (without consuming token)
   */
  isConfirmed(operationId: string): boolean {
    return store.isConfirmed(operationId);
  }

  /**
   * Clear confirmed status after execution
   */
  clearConfirmed(operationId: string): void {
    store.clearConfirmed(operationId);
  }

  /**
   * Cancel a pending confirmation
   */
  cancelConfirmation(operationId: string): void {
    store.clearConfirmed(operationId);
    this.logger.info("operation.cancelled", {
      operationId,
    });
  }
}

/**
 * Check if a tool requires confirmation
 */
export function requiresConfirmation(toolName: string): boolean {
  // All operations that modify state require confirmation
  const criticalOperations = [
    // Team operations
    "create_team",
    "update_team",
    "delete_team",
    "add_team_member",

    // Project operations
    "create_project",
    "update_project",
    "delete_project",

    // Application operations
    "create_application",
    "update_application",
    "delete_application",
    "restart_application",
    "stop_application",
    "start_application",

    // Deployment operations
    "create_deployment",
    "update_deployment",
    "delete_deployment",
    "trigger_deployment",
    "rollback_deployment",

    // Server operations
    "install_docker",
    "cleanup_server",
  ];

  return criticalOperations.includes(toolName);
}

/**
 * Get reason why confirmation is required
 */
export function getConfirmationReason(toolName: string): string {
  const reasons: Record<string, string> = {
    // Deletions are irreversible
    delete_team: "Destructive operation - team will be permanently deleted",
    delete_project: "Destructive operation - project will be permanently deleted",
    delete_application: "Destructive operation - application will be permanently deleted",
    delete_deployment: "Destructive operation - deployment will be permanently deleted",

    // Lifecycle changes
    restart_application: "Restarts running application",
    stop_application: "Stops running application",
    start_application: "Starts application",

    // Dangerous server operations
    install_docker: "Long-running operation - installs Docker on server",
    cleanup_server: "Dangerous operation - cleans up server storage",
    rollback_deployment: "Rolls back deployment to previous version",

    // Other critical operations
    create_team: "Creates new team",
    create_project: "Creates new project",
    create_application: "Creates new application",
    create_deployment: "Creates new deployment",
    trigger_deployment: "Triggers deployment",
  };

  return reasons[toolName] || "Operation requires confirmation";
}
