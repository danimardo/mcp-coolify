/**
 * Tests for tool registry
 */

import { describe, it, expect, beforeEach } from "vitest";
import { createToolRegistry } from "./registry";
import { initializeLogger } from "../logging/logger.server";
import { z } from "zod";

describe("Tool Registry", () => {
  let registry: any;
  let logger: any;

  beforeEach(() => {
    logger = initializeLogger({
      logLevel: "info",
      timezone: "Europe/Madrid",
    });
    registry = createToolRegistry(logger);
  });

  it("should create registry successfully", () => {
    expect(registry).toBeDefined();
    expect(registry.count()).toBe(0);
  });

  it("should register a tool", () => {
    registry.register(
      {
        name: "test_tool",
        category: "default",
        description: "Test tool",
        parameters: {
          schema: z.object({ id: z.string() }),
        },
        response: {
          schema: z.object({ success: z.boolean() }),
        },
      },
      async () => ({ success: true })
    );

    expect(registry.count()).toBe(1);
  });

  it("should prevent duplicate tool registration", () => {
    registry.register(
      {
        name: "test_tool",
        category: "default",
        description: "Test tool",
        parameters: {
          schema: z.object({ id: z.string() }),
        },
        response: {
          schema: z.object({ success: z.boolean() }),
        },
      },
      async () => ({ success: true })
    );

    expect(() => {
      registry.register(
        {
          name: "test_tool",
          category: "default",
          description: "Duplicate",
          parameters: {
            schema: z.object({ id: z.string() }),
          },
          response: {
            schema: z.object({ success: z.boolean() }),
          },
        },
        async () => ({ success: true })
      );
    }).toThrow();
  });

  it("should retrieve tool by name", () => {
    const handler = async () => ({ success: true });
    const definition = {
      name: "test_tool",
      category: "default" as const,
      description: "Test tool",
      parameters: {
        schema: z.object({ id: z.string() }),
      },
      response: {
        schema: z.object({ success: z.boolean() }),
      },
    };

    registry.register(definition, handler);

    const tool = registry.get("test_tool");
    expect(tool).toBeDefined();
    expect(tool.definition.name).toBe("test_tool");
    expect(tool.handler).toBe(handler);
  });

  it("should return undefined for nonexistent tool", () => {
    expect(registry.get("nonexistent")).toBeUndefined();
  });

  it("should list all tools", () => {
    registry.register(
      {
        name: "tool1",
        category: "default",
        description: "Tool 1",
        parameters: { schema: z.object({}) },
        response: { schema: z.object({}) },
      },
      async () => ({})
    );

    registry.register(
      {
        name: "tool2",
        category: "teams",
        description: "Tool 2",
        parameters: { schema: z.object({}) },
        response: { schema: z.object({}) },
      },
      async () => ({})
    );

    const tools = registry.list();
    expect(tools).toHaveLength(2);
  });

  it("should list tools by category", () => {
    registry.register(
      {
        name: "default_tool",
        category: "default",
        description: "Default tool",
        parameters: { schema: z.object({}) },
        response: { schema: z.object({}) },
      },
      async () => ({})
    );

    registry.register(
      {
        name: "teams_tool1",
        category: "teams",
        description: "Teams tool 1",
        parameters: { schema: z.object({}) },
        response: { schema: z.object({}) },
      },
      async () => ({})
    );

    registry.register(
      {
        name: "teams_tool2",
        category: "teams",
        description: "Teams tool 2",
        parameters: { schema: z.object({}) },
        response: { schema: z.object({}) },
      },
      async () => ({})
    );

    const defaultTools = registry.listByCategory("default");
    expect(defaultTools).toHaveLength(1);

    const teamsTools = registry.listByCategory("teams");
    expect(teamsTools).toHaveLength(2);
  });

  it("should return empty array for empty category", () => {
    const tools = registry.listByCategory("applications");
    expect(tools).toEqual([]);
  });

  it("should provide category summary", () => {
    registry.register(
      {
        name: "default_tool",
        category: "default",
        description: "Default tool",
        parameters: { schema: z.object({}) },
        response: { schema: z.object({}) },
      },
      async () => ({})
    );

    registry.register(
      {
        name: "teams_tool",
        category: "teams",
        description: "Teams tool",
        parameters: { schema: z.object({}) },
        response: { schema: z.object({}) },
      },
      async () => ({})
    );

    const summary = (registry as any).getSummary();
    expect(summary.default).toBe(1);
    expect(summary.teams).toBe(1);
    expect(summary.applications).toBe(0);
  });
});
