# Tools del MCP Coolify

Cada directorio representa una categoría de tools alineada con la API de Coolify.
La categoría se define en `ToolCategory` (`src/lib/tools/types.ts`).

## Categorías

| Directorio | Categoría | Estado | Descripción |
|---|---|---|---|
| `default/` | `default` | Implementado | Tools generales (help, status, etc.) |
| `teams/` | `teams` | Implementado | Gestión de equipos |
| `projects/` | `projects` | Implementado | Gestión de proyectos |
| `applications/` | `applications` | Implementado | Gestión de aplicaciones |
| `deployments/` | `deployments` | Implementado | Gestión de despliegues |
| `databases/` | `databases` | Placeholder | Gestión de bases de datos |
| `services/` | `services` | Placeholder | Gestión de servicios |
| `servers/` | `servers` | Placeholder | Gestión de servidores |
| `resources/` | `resources` | Placeholder | Gestión de recursos |
| `private-keys/` | `private-keys` | Placeholder | Gestión de claves privadas |
| `github-apps/` | `github-apps` | Placeholder | Gestión de GitHub Apps |
| `cloud-tokens/` | `cloud-tokens` | Placeholder | Gestión de tokens cloud |
| `hetzner/` | `hetzner` | Placeholder | Gestión de servidores Hetzner |

## Convención de exportación

Cada `index.ts` exporta un array con nombre `{categoria}Tools` (ej. `databasesTools`, `servicesTools`).

Las categorías en estado "Placeholder" exportan un array vacío (`ToolHandler[] = []`)
y serán implementadas en fases posteriores.
