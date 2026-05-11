/**
 * READ_ONLY Mode Safety Guardrail
 *
 * When READ_ONLY=true, all destructive operations are blocked.
 * Prevents accidental infrastructure modifications.
 */

import { Logger } from "../logging/types";
import { ReadOnlyError } from "../errors/error-types";

/**
 * All operations that are blocked in READ_ONLY mode
 * These correspond to HTTP methods: POST, PATCH, DELETE
 * Plus lifecycle operations: start, stop, restart
 */
const DESTRUCTIVE_OPERATIONS = [
  // Team operations - all mutations
  "create_team",
  "update_team",
  "delete_team",
  "add_team_member",

  // Project operations - all mutations
  "create_project",
  "update_project",
  "delete_project",

  // Application operations - all mutations
  "create_application",
  "update_application",
  "delete_application",
  "restart_application",
  "stop_application",
  "start_application",

  // Deployment operations - all mutations
  "create_deployment",
  "update_deployment",
  "delete_deployment",
  "trigger_deployment",
  "rollback_deployment",

  // Server operations - all mutations
  "install_docker",
  "cleanup_server",
];

/**
 * Check if a tool is blocked in READ_ONLY mode
 */
export function isDestructiveOperation(toolName: string): boolean {
  return DESTRUCTIVE_OPERATIONS.includes(toolName);
}

/**
 * Guard against destructive operations in READ_ONLY mode
 * Throws ReadOnlyError if operation is blocked
 */
export function guardReadOnly(
  toolName: string,
  readOnlyMode: boolean,
  logger: Logger
): void {
  if (!readOnlyMode) {
    // Not in READ_ONLY mode, allow operation
    return;
  }

  if (!isDestructiveOperation(toolName)) {
    // Read-only operation, allow it
    return;
  }

  // Operation is destructive and READ_ONLY mode is enabled
  logger.warn("read_only.blocked_operation", {
    toolName,
    reason: "Server is in READ_ONLY mode",
  });

  throw new ReadOnlyError(
    `Operation blocked: Server is in READ_ONLY mode`,
    toolName
  );
}

/**
 * Categorize operations by type
 */
export function getOperationCategory(
  toolName: string
): "read" | "write" | "dangerous" | "lifecycle" {
  // Dangerous operations (require confirmation + READ_ONLY blocks)
  if (toolName.includes("delete") || toolName.includes("cleanup")) {
    return "dangerous";
  }

  // Lifecycle operations (start, stop, restart)
  if (
    toolName.includes("start") ||
    toolName.includes("stop") ||
    toolName.includes("restart")
  ) {
    return "lifecycle";
  }

  // Write operations (create, update, etc.)
  if (
    toolName.includes("create") ||
    toolName.includes("update") ||
    toolName.includes("add")
  ) {
    return "write";
  }

  // Default to read
  return "read";
}
