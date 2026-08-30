/**
 * Registro maestro de tools MCP Coolify
 * Agrega todas las categorías de tools para registrar en el servidor MCP
 */

import type { ToolDefinition, ToolHandler, ToolRegistry } from "$lib/tools/types";
import type { Logger } from "$lib/logging/types";

import { defaultTools } from "./default/index";
import { teamsTools } from "./teams/index";
import { projectsTools } from "./projects/index";
import { applicationTools } from "./applications/index";
import { deploymentsTools } from "./deployments/index";
import { databasesTools } from "./databases/index";
import { servicesTools } from "./services/index";
import { serversTools } from "./servers/index";
import { resourcesTools } from "./resources/index";
import { containersTools } from "./containers/index";
import { privateKeysTools } from "./private-keys/index";
import { githubAppsTools } from "./github-apps/index";
import { cloudTokensTools } from "./cloud-tokens/index";
import { hetznerTools } from "./hetzner/index";
import { environmentsTools } from "./environments/index";

// monitoring, gits, registries, networks, webhooks eliminados:
// esos endpoints no existen en Coolify API v4

/** Todas las categorías de tools agregadas */
const allToolEntries: { definition: ToolDefinition; handler: ToolHandler }[] = [
  ...defaultTools,
  ...teamsTools,
  ...projectsTools,
  ...applicationTools,
  ...deploymentsTools,
  ...databasesTools,
  ...servicesTools,
  ...serversTools,
  ...resourcesTools,
  ...containersTools,
  ...privateKeysTools,
  ...githubAppsTools,
  ...cloudTokensTools,
  ...hetznerTools,
  ...environmentsTools,
  // Confirmation tools are registered separately in server initialization
];

/**
 * Registra todos los tools en el registry proporcionado
 */
export function registerAllTools(registry: ToolRegistry, logger: Logger): number {
  for (const entry of allToolEntries) {
    registry.register(entry.definition, entry.handler);
  }

  const count = registry.count();
  logger.info("mcp.tools.registered", {
    toolCount: count,
    categories: Object.keys(getCategorySummary()).length,
  });

  return count;
}

/**
 * Obtiene resumen de tools por categoría
 */
export function getCategorySummary(): Record<string, number> {
  const summary: Record<string, number> = {};
  for (const entry of allToolEntries) {
    const cat = entry.definition.category;
    summary[cat] = (summary[cat] || 0) + 1;
  }
  return summary;
}

/**
 * Total de tools disponibles
 */
export function getTotalToolCount(): number {
  return allToolEntries.length;
}

export { allToolEntries };
