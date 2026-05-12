# MCP Coolify Server 🚀

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MCP](https://img.shields.io/badge/MCP-1.0-purple.svg)](https://modelcontextprotocol.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**MCP Coolify Server** es un servidor [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) que expone la API de **Coolify v4** como ~107 herramientas programables para agentes de IA (Claude Code, etc.).

Permite que agentes de inteligencia artificial consulten, monitoreen y administren infraestructura Coolify de forma segura, auditable y controlada.

---

## ✨ Características Principales

- **🛡️ Seguridad de Primer Nivel**: Modo READ_ONLY, confirmación de operaciones críticas, redacción automática de secretos en logs
- **📊 Auditoría Completa**: Logging estructurado con eventos estables, trazabilidad via requestId, durationMs en operaciones
- **⚡ Resilencia**: Retry automático con exponential backoff, respeta header Retry-After (429), valida tokens al bootstrap
- **🔍 Observabilidad**: Logs persistentes en `.logs/app.jsonl` (JSON Lines), timestamps con timezone correcto
- **✅ Type-Safe**: TypeScript 5.0 strict mode, Zod validation para todos los inputs, cero `any` types
- **🔧 ~107 Herramientas** en 13 categorías:
  - Default (info, versión, health)
  - Teams, Projects, Applications, Deployments
  - Databases, Services, Servers, Resources
  - Private Keys, GitHub Apps, Cloud Tokens, Hetzner

---

## 🚀 Inicio Rápido

### Requisitos Previos

- **Node.js**: 18.x o superior (recomendado: 20.x LTS)
- **npm/pnpm**: 9.0+
- **Coolify API Token**: Generar en panel Coolify → Settings → API
- **URL de Coolify**: Base URL de tu instancia Coolify (ej: `https://coolify.midominio.com/api/v1`)

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/mcp-coolify.git
cd mcp-coolify

# Instalar dependencias
npm install

# Copiar archivo de configuración
cp .env.example .env

# Editar .env con tus credenciales
nano .env
```

### Configuración (.env)

```bash
# REQUERIDOS
COOLIFY_BASE_URL=https://coolify.midominio.com/api/v1
COOLIFY_TOKEN=tr_xxxxxxxxxxxxxxxxxxxx

# OPCIONALES (defaults mostrados)
NODE_ENV=development
PORT=3000
LOG_LEVEL=info
LOG_DIR=.logs
LOG_TO_FILES=true
LOG_TIMEZONE=Europe/Madrid

READ_ONLY=false                          # true = bloquea POST/PATCH/DELETE
REQUEST_TIMEOUT=30000                    # ms
MAX_RETRIES=3
VALIDATE_TOKEN_ON_STARTUP=true           # Validar token al iniciar
```

### Ejecutar Servidor

```bash
# Desarrollo (con reloading)
npm run dev

# Producción
npm run build
npm start

# Tests
npm test
npm run test:coverage

# Linting
npm run lint
npm run lint:fix
```

---

## 🔌 Uso con Claude Code

Este MCP está diseñado para usarse con **Claude Code CLI** o **Claude Code Web**.

### Conectar a Claude Code

**Opción 1: Via stdio (recomendado)**

En tu `~/.claude/mcp.json`:

```json
{
  "mcpServers": {
    "coolify": {
      "command": "node",
      "args": ["/path/to/mcp-coolify/dist/server/index.js"],
      "env": {
        "COOLIFY_BASE_URL": "https://coolify.midominio.com/api/v1",
        "COOLIFY_TOKEN": "tr_xxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

Luego en Claude Code:
```
@coolify list_applications
@coolify get_application --uuid <app-uuid>
@coolify restart_application --uuid <app-uuid>
```

---

## 📋 Herramientas Disponibles (Fase 1 MVP)

### Default (4 herramientas)
- `get_version` — Obtener versión de Coolify
- `get_health` — Comprobar estado del servidor
- `validate_token` — Validar token de API
- `test_connection` — Probar conexión a API

### Teams (4 herramientas)
- `get_current_team` — Obtener equipo actual
- `list_all_teams` — Listar todos los equipos
- `get_team_by_id` — Obtener equipo por ID
- `get_team_members` — Obtener miembros del equipo

### Projects (3 herramientas)
- `list_projects` — Listar todos los proyectos
- `get_project` — Obtener proyecto por ID
- `create_project` — Crear nuevo proyecto

### Applications (6 herramientas)
- `list_applications` — Listar aplicaciones
- `get_application` — Obtener aplicación
- `get_application_logs` — Obtener logs
- `start_application` — Iniciar aplicación
- `stop_application` — Detener aplicación
- `restart_application` — Reiniciar aplicación

### Deployments (4 herramientas)
- `list_deployments` — Listar deployments
- `get_deployment` — Obtener deployment
- `trigger_deployment` — Disparar deployment
- `cancel_deployment` — Cancelar deployment

### Servers (4 herramientas)
- `list_servers` — Listar servidores
- `get_server` — Obtener servidor
- `validate_server` — Validar servidor
- `get_server_resources` — Obtener recursos

**[Ver especificación completa](specs/001-mcp-coolify/spec.md) para todas las 107 herramientas y fases posteriores.**

---

## 🔐 Seguridad & Operaciones Críticas

### Operaciones Que Requieren Confirmación

Estas 19 operaciones requieren confirmación explícita del usuario:

**Deletions (irreversibles)**:
- `delete_project`, `delete_application`, `delete_environment`
- `delete_database`, `delete_service`, `delete_server`
- `delete_private_key`, `delete_github_app`, `delete_cloud_token`
- `delete_database_backup`, `delete_backup_execution`

**Destructive Actions (detenimiento)**:
- `cancel_deployment`, `stop_application`
- `stop_database`, `stop_service`

**Production/Cost**:
- `trigger_deployment` (en main/production)
- `create_hetzner_server`

**Secrets**:
- `create_private_key`, `create_cloud_token`, `create_github_app`
- `create_application_environment_variable` (con secreto)

### Flujo de Confirmación Explícita

Para operaciones críticas, el MCP implementa un flujo de confirmación en 4 pasos:

```
1. Agente invoca operación crítica
   ↓
2. Servidor devuelve:
   {
     requiresConfirmation: true,
     operationId: "550e8400-...",
     confirmationToken: "a1b2c3d4-...",
     reason: "Destructive operation - application will be permanently deleted"
   }
   ↓
3. Agente invoca confirm_operation(operationId, confirmationToken)
   ↓
4. Agente reinvoca la operación original (se ejecuta sin pedir confirmación nuevamente)
```

**Características**:
- Tokens expiran después de 5 minutos de inactividad
- Cada token es un UUID aleatorio (imposible de predecir)
- Confirmaciones se marcan con event `operation.confirmed` en logs
- Operaciones confirmadas quedan vigentes 30 segundos para reinvocación

**Ejemplo en Claude Code**:
```
@coolify restart_application --uuid app-123

→ Respuesta: {
    requiresConfirmation: true,
    operationId: "op-abc123...",
    confirmationToken: "token-xyz789..."
}

@coolify confirm_operation --operationId op-abc123... --token token-xyz789...

→ Respuesta: {
    success: true,
    message: "Confirmación aceptada. La operación se ejecutará."
}

@coolify restart_application --uuid app-123

→ Respuesta: {
    uuid: "app-123",
    action: "restart",
    status: "scheduled"
}
```

### Modo READ_ONLY

Para testing y validación sin side effects:

```bash
READ_ONLY=true npm run dev
```

En este modo:
- ✅ Todas las operaciones GET funcionan normalmente
- ❌ POST, PATCH, DELETE, start/stop/restart bloqueados
- 📝 Evento `read_only.blocked_operation` registrado
- 💡 Error response incluye hint para desactivar READ_ONLY

---

## 📊 Logging & Auditoría

### Logs en Desarrollo

El servidor escribe logs en dos formatos:

**`.logs/app.log`** — Human-readable:
```
12/05/2026 10:40:50  [INFO]  mcp.tool.completed
  requestId: "550e8400-e29b-41d4-a716-446655440000"
  tool: "list_applications"
  durationMs: 543
```

**`.logs/app.jsonl`** — JSON Lines (una línea por evento):
```json
{"timestamp":"2026-05-12T10:40:50.000Z","localTime":"12/05/2026 10:40:50","timezone":"Europe/Madrid","level":"info","eventName":"mcp.tool.completed","context":{"requestId":"550e8400-e29b-41d4-a716-446655440000","tool":"list_applications","durationMs":543}}
```

### Niveles de Log

```bash
LOG_LEVEL=trace     # Detalles extremadamente verbosos
LOG_LEVEL=debug     # Información de diagnóstico
LOG_LEVEL=info      # Eventos operacionales (default)
LOG_LEVEL=warn      # Situaciones anómalas (reintentos, confirmación fallida)
LOG_LEVEL=error     # Fallos reales (4xx, 401, 403)
LOG_LEVEL=fatal     # Errores irrecuperables (bootstrap falló)
```

### Eventos Clave

| Evento | Nivel | Cuándo |
|--------|-------|--------|
| `app.bootstrap.started` | info | Servidor iniciando |
| `app.bootstrap.token_validated` | info | Token validado |
| `mcp.tool.invoked` | debug | Herramienta solicitada |
| `mcp.tool.completed` | info | Herramienta completada |
| `mcp.tool.failed` | warn | Herramienta falló |
| `coolify.request.started` | debug | Request a API iniciado |
| `coolify.request.retry` | warn | Reintentando (429, 5xx) |
| `coolify.request.failed` | error | Request falló |
| `coolify.auth.failed` | error | Token inválido (401) |
| `operation.confirmation.requested` | info | Confirmación requerida |
| `operation.confirmed` | info | Operación confirmada |
| `read_only.blocked_operation` | warn | Bloqueado en modo READ_ONLY |

**Redacción Automática**: Todos los tokens, passwords, API keys se redactan automáticamente como `[REDACTED]`.

---

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch
npm test -- --watch

# Con cobertura
npm test:coverage

# Un archivo específico
npm test src/lib/config.test.ts
```

**Estado Actual**: ✅ 101/101 tests passing

**Cobertura Mínima**: 
- Validación (Zod): 90%
- Logging: 85%
- Bootstrap: 90%
- Error handling: 85%
- Reintentos: 80%
- Redacción de secrets: 95%
- READ_ONLY: 90%
- Confirmación: 80%

---

## 🏗️ Arquitectura

### Estructura de Archivos

```
src/
├── lib/
│   ├── logging/              # Sistema de logging
│   │   ├── logger.server.ts  # Pino + file transports
│   │   ├── sanitize.ts       # Redacción de secretos
│   │   └── types.ts          # Contrato de logger
│   │
│   ├── mcp/                  # Protocolo MCP
│   │   ├── registry.ts       # Registro de herramientas
│   │   ├── types.ts          # Tipos MCP
│   │   └── invoker.ts        # Handler de invocación
│   │
│   ├── coolify/              # Cliente de Coolify API
│   │   ├── client.ts         # HTTP con retry/timeout
│   │   ├── errors.ts         # Manejo de errores
│   │   └── types.ts          # Tipos de API
│   │
│   ├── config.ts             # Configuración centralizada
│   ├── http-client.ts        # Cliente HTTP Axios
│   ├── confirmation/         # Flow de confirmación
│   ├── safety/               # Guardia READ_ONLY
│   ├── errors/               # Tipos de error
│   └── schemas/              # Zod schemas
│
├── server/
│   ├── index.ts              # Entry point
│   ├── config.ts             # Bootstrap
│   └── logging/              # Inicialización logger
│
├── tools/                    # 13 categorías, ~107 herramientas
│   ├── default/
│   ├── teams/
│   ├── projects/
│   ├── applications/
│   └── ... (10 más)
│
└── main.ts

tests/
├── unit/                     # Tests unitarios
├── integration/              # Tests de integración
└── mocks/                    # Mocks de API

.logs/                        # Logs (gitignored)
├── app.log                   # Human-readable
└── app.jsonl                 # JSON Lines
```

### Request Flow

```
1. Agente → MCP solicita herramienta X
2. Handler valida parámetros con Zod
3. Si inválido → error 400 + log
4. Verifica READ_ONLY flag
5. Si bloqueado → error 403 + log
6. ¿Requiere confirmación?
7. Si crítico → espera confirmación del agente
8. Invoca Coolify API
9. Maneja reintentos (exponential backoff)
10. Valida respuesta con Zod
11. Logea evento + responde a agente
```

---

## 🔧 Desarrollo

### Pre-commit Hooks

```bash
npm run precommit   # Corre lint, type-check, tests
```

### Build

```bash
npm run build       # TypeScript → dist/
npm run dist:watch  # Build en modo watch
```

### Environment Variables

Ver `.env.example` para todas las opciones.

---

## 📚 Documentación Adicional

- **[Especificación Técnica](specs/001-mcp-coolify/spec.md)** — Arquitectura, protocolo MCP, logging
- **[Constitución](CLAUDE.md)** — Principios, ADRs, governance
- **[Eventos de Logging](logging-events.md)** — Catálogo de 50+ eventos
- **[API Coolify v4](docs/manual_api_coolify_programador.md)** — Referencia de endpoints
- **[Implementation Review](IMPLEMENTATION_REVIEW.md)** — Análisis de calidad post-revisión

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/amazing`)
3. Commit los cambios (`git commit -am 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing`)
5. Abre un Pull Request

**Requisitos para PR**:
- ✅ Todos los tests pasan (`npm test`)
- ✅ Linting limpio (`npm run lint`)
- ✅ TypeScript strict (`npm run type-check`)
- ✅ Nuevos tests para features nuevas
- ✅ Documentación actualizada

---

## 📄 Licencia

MIT — ver [LICENSE](LICENSE) para detalles.

---

## 🚨 Soporte & Problemas

- 📖 Lee la [documentación de Coolify v4](https://docs.coolify.io/)
- 🐛 Reporta bugs en [GitHub Issues](https://github.com/tu-usuario/mcp-coolify/issues)
- 💬 Discusiones en [GitHub Discussions](https://github.com/tu-usuario/mcp-coolify/discussions)

---

## 🔑 Características Planificadas

- [ ] Herramientas Fase 2 (Databases read, Services read)
- [ ] Herramientas Fase 3 (Full write access, todos los 107 tools)
- [ ] Webhook support para eventos Coolify
- [ ] Caché en memoria para operaciones frecuentes
- [ ] Métricas Prometheus para observabilidad
- [ ] Dashboard de auditoría
- [ ] Integración con webhooks de GitHub
- [ ] Soporte para múltiples instancias de Coolify

---

**Hecho con ❤️ para DevOps engineers y AI agents.**

*Última actualización: 2026-05-12*
