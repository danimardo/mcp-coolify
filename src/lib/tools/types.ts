/**
 * Tool definition types and interfaces
 * Core contracts for all MCP tools
 */

import { z } from "zod";
import type { ToolContext } from "../logging/types";

export type { ToolContext };

/**
 * Tool categories in MCP Coolify
 */
export type ToolCategory =
  | "default"
  | "teams"
  | "projects"
  | "applications"
  | "deployments"
  | "databases"
  | "services"
  | "servers"
  | "resources"
  | "private-keys"
  | "github-apps"
  | "cloud-tokens"
  | "hetzner";

/**
 * Tool definition - metadata about a tool
 */
export interface ToolDefinition {
  name: string;
  category: ToolCategory;
  description: string;
  summary?: string;
  examples?: string[];

  // Parameters validation schema
  parameters: {
    schema: z.ZodType;
    required?: string[];
    description?: string;
  };

  // Response validation schema
  response: {
    schema: z.ZodType;
    description?: string;
  };

  // Execution context
  requiresConfirmation?: boolean;
  readOnlyBlocks?: boolean;
  timeout?: number; // milliseconds
  tags?: string[];
}

/**
 * Tool execution context
 */
export interface ExtendedToolContext extends ToolContext {
  config: {
    coolifyBaseUrl: string;
    readOnly: boolean;
    requestTimeout: number;
  };
  httpClient: {
    get<T>(url: string, options?: Record<string, unknown>): Promise<T>;
    post<T>(url: string, data: unknown, options?: Record<string, unknown>): Promise<T>;
    patch<T>(url: string, data: unknown, options?: Record<string, unknown>): Promise<T>;
    delete<T>(url: string, options?: Record<string, unknown>): Promise<T>;
  };
}

/**
 * Tool handler function signature
 */
export type ToolHandler = (
  parameters: unknown,
  context: ExtendedToolContext
) => Promise<unknown>;

/**
 * Tool invocation request
 */
export interface ToolInvocation {
  toolName: string;
  parameters: unknown;
}

/**
 * Tool response
 */
export interface ToolResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    hint?: string;
  };
  meta?: {
    requestId: string;
    duration: number;
    timestamp: string;
    confirmationToken?: string;
  };
}

/**
 * Tool registry for managing all tools
 */
export interface ToolRegistry {
  register(definition: ToolDefinition, handler: ToolHandler): void;
  get(toolName: string): ToolDefinitionWithHandler | undefined;
  list(): ToolDefinitionWithHandler[];
  listByCategory(category: ToolCategory): ToolDefinitionWithHandler[];
  count(): number;
}

export interface ToolDefinitionWithHandler {
  definition: ToolDefinition;
  handler: ToolHandler;
}

/**
 * Tool execution result
 */
export interface ToolExecutionResult<T = unknown> {
  tool: string;
  requestId: string;
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
    hint?: string;
  };
  duration: number;
  timestamp: string;
}
