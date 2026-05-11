/**
 * Tool Registry Implementation
 * Manages all available tools
 */

import {
  ToolDefinition,
  ToolHandler,
  ToolRegistry,
  ToolDefinitionWithHandler,
  ToolCategory,
} from "./types";
import { Logger } from "../logging/types";

export class ToolRegistryImpl implements ToolRegistry {
  private tools = new Map<string, ToolDefinitionWithHandler>();
  private byCategory = new Map<ToolCategory, ToolDefinitionWithHandler[]>();

  constructor(private logger: Logger) {}

  /**
   * Register a new tool
   */
  register(definition: ToolDefinition, handler: ToolHandler): void {
    if (this.tools.has(definition.name)) {
      throw new Error(`Tool "${definition.name}" is already registered`);
    }

    const entry = { definition, handler };
    this.tools.set(definition.name, entry);

    // Add to category index
    if (!this.byCategory.has(definition.category)) {
      this.byCategory.set(definition.category, []);
    }
    this.byCategory.get(definition.category)!.push(entry);

    this.logger.debug("tool.registered", {
      toolName: definition.name,
      category: definition.category,
      requiresConfirmation: definition.requiresConfirmation || false,
      readOnlyBlocks: definition.readOnlyBlocks || false,
    });
  }

  /**
   * Get a tool by name
   */
  get(toolName: string): ToolDefinitionWithHandler | undefined {
    return this.tools.get(toolName);
  }

  /**
   * List all tools
   */
  list(): ToolDefinitionWithHandler[] {
    return Array.from(this.tools.values());
  }

  /**
   * List tools by category
   */
  listByCategory(category: ToolCategory): ToolDefinitionWithHandler[] {
    return this.byCategory.get(category) || [];
  }

  /**
   * Get total tool count
   */
  count(): number {
    return this.tools.size;
  }

  /**
   * Get count by category
   */
  countByCategory(category: ToolCategory): number {
    return this.byCategory.get(category)?.length || 0;
  }

  /**
   * Get summary of all categories and counts
   */
  getSummary(): Record<ToolCategory, number> {
    const summary: Record<ToolCategory, number> = {
      default: 0,
      teams: 0,
      projects: 0,
      applications: 0,
      deployments: 0,
      databases: 0,
      services: 0,
      servers: 0,
      resources: 0,
      "private-keys": 0,
      "github-apps": 0,
      "cloud-tokens": 0,
      hetzner: 0,
    };

    for (const [category, tools] of this.byCategory.entries()) {
      summary[category] = tools.length;
    }

    return summary;
  }
}

/**
 * Create a tool registry instance
 */
export function createToolRegistry(logger: Logger): ToolRegistry {
  return new ToolRegistryImpl(logger);
}
