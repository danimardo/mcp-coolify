# Roadmap de Implementación: Herramientas Faltantes

## Status Actual
- **Implementadas**: 23/107 tools (21%)
- **Faltantes**: 84/107 tools (79%)

## Priorización

### 🔴 CRÍTICAS para MVP (Fase 1) - 48 tools
Debe implementarse para completar MVP Phase 1:

1. **Servers** (8 tools) - ⚡ FÁCIL
   - list_servers, get_server, validate_server, get_server_resources
   - [4 más por definir]

2. **Databases** (21 tools) - 🔥 GRANDE
   - list_databases, get_database
   - Backups: create, list, get, restore
   - Snapshots: create, list, restore
   - Sync: configure, start, stop, status
   - [Más operaciones]

3. **Services** (13 tools) - 🔥 GRANDE
   - list_services, get_service, create_service
   - update_service, delete_service
   - [8 más]

4. **Projects** (6 tools faltantes) - ⚠️ PARCIAL
   - Actualmente: list, get, create (3/9)
   - Faltantes: update, delete, get_environments, etc.

5. **Applications** (13 tools faltantes) - ⚠️ PARCIAL
   - Actualmente: list, get, logs, start, stop, restart (6/19)
   - Faltantes: create, update, delete, environment vars, etc.

6. **Deployments** (1 faltante) - ⚡ FÁCIL
   - Actualmente: list, get, trigger, cancel (4/5)
   - Faltante: get_deployment_logs

7. **Resources** (1 tool) - ⚡ TRIVIAL
   - unified_resource_view (overview de todos los recursos)

### 🟡 SECUNDARIAS (Fase 2) - 36 tools

8. **Private Keys** (5 tools)
9. **GitHub Apps** (7 tools)
10. **Cloud Tokens** (6 tools)
11. **Hetzner** (5 tools)

## Estrategia de Implementación

### Fase 1A: Completar MVP Básico (48 tools) - ~2-3 sesiones
- Semana 1: Servers (8) + Resources (1) + Projects (6)
- Semana 2: Databases (21) - Split en 3 partes
- Semana 3: Services (13)

### Fase 1B: Completar Categorías Actuales (14 tools) - ~1 sesión
- Applications: Add create, update, delete, env vars (7 tools)
- Deployments: Add get_logs (1 tool)

### Fase 2: Secundarias (36 tools) - ~2 sesiones
- Private Keys, GitHub Apps, Cloud Tokens, Hetzner

## Template para Nueva Herramienta

Para cada tool:

1. **schemas.ts**: Zod schema para params + response
2. **handlers.ts**: Lógica HTTP a Coolify API
3. **index.ts**: Definición + handler

Ejemplo:
```typescript
// Servers Category
export const listServersDefinition: ToolDefinition = {
  name: "list_servers",
  category: "servers",
  description: "Lista todos los servidores disponibles",
  // ... fields ...
  requiresConfirmation: false,  // READ only
  readOnlyBlocks: false,
};

export const listServersTool: ToolHandler = createBaseTool(
  "list_servers",
  ListServersSchema,
  ServersListSchema,
  listServersHandler,
  { requiresConfirmation: false, readOnlyBlocks: false }
);
```

## Plan Inmediato: Comenzar con Servers (8 tools)

✅ Razones:
- Categoría pequeña (8 tools)
- No tiene dependencias complejas
- Patrón claro (list, get, validate, resources)
- Rápida victoria

Próximo paso: Crear `src/tools/servers/` con:
- schemas.ts (ZOD definitions)
- handlers.ts (API calls)
- index.ts (8 tool definitions)
