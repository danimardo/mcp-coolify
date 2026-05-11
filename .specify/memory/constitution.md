# MCP Coolify - Constitución SpecKit

**Version**: 2.0.0 | **Ratified**: 2026-05-11 | **Audience**: Development Team | **Última revisión**: 2026-05-11

---

## Project Identity

**MCP Coolify** es un servidor Model Context Protocol (MCP) que expone la API de Coolify v4 como un conjunto de ~107 herramientas programables para agentes de inteligencia artificial.

- **Propósito**: Permitir que agentes de IA (Claude Code, etc.) consulten, monitoreen y administren infraestructura Coolify de forma segura, auditable y controlada
- **Tecnología Base**: Node.js 18+ | TypeScript 5.0+ | MCP v1.0+ | Coolify API v4
- **Usuarios**: DevOps engineers, SREs, automation engineers, agentes de IA a través de MCP
- **Scope**: ~107 tools en 13 categorías (Applications, Databases, Deployments, Services, Servers, etc.)

---

## Versionado de Tecnologías (No Negociable)

### Runtime
- **Node.js**: 18.x o superior (recomendado: 20.x LTS)
- **npm/pnpm**: 9.0+

### Dependencias Principales
| Paquete | Versión | Propósito |
|---------|---------|----------|
| `@modelcontextprotocol/sdk` | Latest 1.x | Protocolo MCP oficial |
| `typescript` | 5.0+ | Tipado estricto |
| `zod` | 3.22+ | Validación de datos |
| `pino` | 8.16+ | Logging estructurado |
| `axios` | 1.6+ | Cliente HTTP |
| `dotenv` | 16.3+ | Gestión de .env |
| `date-fns` | 2.30+ | Manejo de fechas/timezones |

### DevDependencies
- `@types/node` 20.x+
- `@typescript-eslint/eslint-plugin` 6.x+
- `eslint` 8.x+
- `vitest` 0.34+ (testing)
- `supertest` 6.3+ (integration testing)

### Coolify API
- **Versión**: v4 (compatibilidad mínima)
- **Endpoint base**: `https://<coolify-domain>/api/v1`
- **Autenticación**: Bearer Token (generar en panel Coolify)

---

## Core Principles

### I. Fail-Fast on Bootstrap

Si la configuración es inválida, el servidor NO inicia. Mejor descubrirlo en startup que en producción. Toda validación de entorno ocurre en `src/server/config.ts` con Zod.

### II. Redaction Over Exposure

Todos los secrets (tokens, passwords, API keys) se redactan automáticamente en logs. SENSITIVE_FIELDS está centralizado en `sanitize.ts`. Cero secretos en salida de logs.

### III. Observable Operations (Mandatory)

Cada operación genera eventos de log estructurados con requestId para correlación. Event names son estables (dot-separated: `domain.category.event`). Logs incluyen durationMs para observabilidad de performance.

### IV. Defensive Validation (Mandatory)

Datos externos (Coolify API, user input) se validan CON Zod ANTES de usar. Esquemas Zod son el contrato. TypeScript types se infieren con `z.infer<>`.

### V. Read-Only Safety Mode

Modo READ_ONLY bloquea mutaciones; modo normal permite ambas. Permite auditoría y testing sin side effects. Herramientas que mutan verifican este flag obligatoriamente.

---

## Non-Negotiable Frameworks & Architecture Decisions (ADRs)

### ADR-001: Validación de Datos — Zod

**Contexto**: ¿Usar Zod, Ajv, or-tools o confiar en TypeScript types?

**Decisión**: Zod obligatoriamente para todos los inputs.

**Razones**:
- Schema → Type inference automático (DRY: una fuente de verdad)
- Runtime validation de datos externos (Coolify API, agente)
- Error messages específicos y reutilizables
- TypeScript strict garantiza seguridad

**Consecuencias**: Poco overhead de CPU (negligible), código más seguro.

---

### Validación de Datos — Zod (Implementación)

**Regla**: Cada parámetro de tool, cada respuesta API externa, cada variable de entorno MUST tener un Zod schema.

```typescript
const CreateServerSchema = z.object({
  name: z.string().min(3),
  ip: z.string().ip(),
  port: z.number().int().min(1).max(65535)
});

type CreateServerParams = z.infer<typeof CreateServerSchema>;
```

**Por qué**: Type inference automático. Si validación pasa, TypeScript garantiza tipos.

### Gestión Centralizada de Configuración

**Regla**: Cero `process.env.VAR` directo. Todo pasa por `src/server/config.ts::bootstrap()`.

```typescript
const ConfigSchema = z.object({
  COOLIFY_TOKEN: z.string().startsWith('tr_'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  READ_ONLY: z.string().transform(v => v === 'true').default('false')
});

export async function bootstrap() {
  try {
    const config = ConfigSchema.parse(process.env);
    logger.info('app.bootstrap.config_loaded', { environment: config.NODE_ENV });
    return config;
  } catch (error) {
    logger.fatal('app.bootstrap.failed', { reason: 'Invalid configuration' });
    process.exit(1); // Fail-fast
  }
}
```

**Por qué**: Fail-fast garantiza que errores de config se detectan inmediatamente.

### Logging Estructurado — Pino + Eventos Estables

**Regla**: Logging usa Pino con event names estables. Redacción automática de secrets.

```typescript
logger.info('mcp.tool.completed', {
  tool: 'restart_application',
  requestId: 'req-abc123',
  durationMs: 2543
});

logger.error('coolify.request.failed', {
  endpoint: '/applications',
  requestId: 'req-xyz',
  statusCode: 500
});
```

**Event Names Estables** (50+ eventos documentados):
- `app.bootstrap.*` — Server startup
- `mcp.tool.*` — Tool invocation
- `coolify.request.*` — API calls
- `operation.confirmation.*` — User confirmations
- `read_only.blocked_operation` — READ_ONLY mode blocks

**Redacción Automática**: `password`, `token`, `api_key`, `authorization`, `cookie`, `secret` se redactan a `[REDACTED]`.

**Por qué**: Auditoría observable + seguridad por defecto.

---

## Operaciones Críticas (Requieren Confirmación Explícita)

### Categoría 1: Deletions (Irreversibles)
- `delete_project`
- `delete_application`
- `delete_environment`
- `delete_database`
- `delete_service`
- `delete_server`
- `delete_private_key`
- `delete_github_app`
- `delete_cloud_token`
- `delete_database_backup`
- `delete_backup_execution`

### Categoría 2: Cambios Destructivos (Stop/Cancel)
- `cancel_deployment`
- `stop_application`
- `stop_database`
- `stop_service`

### Categoría 3: Creaciones en Entorno Productivo
- `trigger_deployment` (especialmente en main/production)
- `create_hetzner_server` (implicación financiera)

### Categoría 4: Gestión de Secretos (Sensible)
- `create_private_key`
- `create_cloud_token`
- `create_github_app`
- `create_application_environment_variable` (si es secreto)

**Formato de confirmación requerida**:
```json
{
  "confirmationRequired": true,
  "operation": "delete_application",
  "severity": "critical",
  "message": "¿Eliminar aplicación 'api-backend' de PRODUCCIÓN? Esta acción es irreversible.",
  "details": {
    "application_uuid": "app-123",
    "application_name": "api-backend",
    "environment": "production",
    "has_active_deployment": true
  }
}
```

---

## Arquitectura Técnica

```
src/
├── lib/
│   ├── logging/           # Contrato + tipos + redacción
│   │   ├── types.ts       # LoggerContract
│   │   ├── events.ts      # Nombres estables (50+)
│   │   ├── sanitize.ts    # Redacción automática
│   │   └── levels.ts      # Definiciones de niveles
│   │
│   ├── mcp/               # Definiciones de tools (107)
│   │   ├── registry.ts    # Registro centralizado
│   │   ├── handlers/      # Por categoría
│   │   └── schemas/       # Zod schemas (validación)
│   │
│   ├── coolify/           # Cliente HTTP de Coolify API
│   │   ├── client.ts      # HTTP con reintentos + backoff
│   │   ├── errors.ts      # Error handling específico
│   │   └── types.ts       # Tipos de Coolify API
│   │
│   └── config.ts          # Re-export centralizado
│
├── server/
│   ├── config.ts          # Bootstrap + validación env
│   ├── logging/           # Pino + transports a .logs/
│   ├── mcp/               # Handler + invoker
│   └── bootstrap.ts       # Inicialización
│
└── tools/                 # 13 categorías, ~107 tools
    ├── default/           # 4 tools (version, health, etc)
    ├── teams/             # 4 tools
    ├── projects/          # 9 tools
    ├── applications/      # 19 tools
    ├── deployments/       # 5 tools
    ├── databases/         # 21 tools
    ├── services/          # 13 tools
    ├── servers/           # 8 tools
    ├── resources/         # 1 tool
    ├── private-keys/      # 5 tools
    ├── github-apps/       # 7 tools
    ├── cloud-tokens/      # 6 tools
    └── hetzner/           # 5 tools
```

**Request Flow**:
```
1. Agente → MCP solicita tool X
2. Handler recibe → valida parámetros con Zod
3. ✗ Invalid → error 400 + log
4. ✓ Valid → verifica READ_ONLY
5. ✗ Bloqueado → error 403 + log
6. ✓ Permitido → ¿requiere confirmación?
7. ✗ Crítico → request confirmación, espera respuesta
8. ✓ Confirmado/no-crítico → invoca Coolify API
9. Maneja reintentos (backoff exponencial) + respeta rate limits
10. Valida respuesta → log evento → responde a agente
```

---

## Fases de Implementación

### MVP — Fase 1 (v1.0.0)
**Alcance**: ~45 tools. Bootstrap, lectura y operaciones básicas.

Categorías completas:
- Default (4/4)
- Teams (4/4)

Categorías parciales:
- Projects: `list`, `get`, `create` (3/9)
- Applications: `list`, `get`, `logs`, `start/stop/restart` (6/19)
- Deployments: `list`, `get`, `trigger`, `cancel` (4/5)
- Servers: `list`, `get`, `validate`, `resources` (4/8)

**Hito**: MVP funcional, auditable, READ_ONLY listo.

---

### Fase 2 (v1.1-1.5)
**Alcance**: ~65 tools. Expansión a datos y operaciones intermedias.

Agregar:
- Projects (resto: update, delete, environments)
- Applications (resto: create variants, update, env vars)
- Deployments (resto)
- Databases (lectura: list, get; backups read)
- Services (lectura: list, get)
- GitHub Apps (lectura: list, get, repos, branches)
- Private Keys (lectura)
- Cloud Tokens (lectura)

**Hito**: Capacidades de lectura/escritura amplias. Testing completo.

---

### Fase 3 (v2.0+)
**Alcance**: Todos los ~107 tools.

Agregar:
- Databases (escritura: create, update, delete, backups write)
- Services (escritura: create, update, delete, env vars)
- Private Keys (escritura)
- GitHub Apps (escritura)
- Cloud Tokens (escritura)
- Hetzner (all)

**Hito**: Funcionalidad completa. Permisos granulares opcionales.

---

## Code Review Checklist

### Validación & Tipado
- [ ] Zod schema existe para TODOS los parámetros de tool
- [ ] Schema incluye validaciones útiles (min/max, regex, etc)
- [ ] `z.infer<>` usado para tipos, no `interface` manual
- [ ] No `any` types en código (TypeScript strict + ESLint)
- [ ] Tipos genéricos bien acotados `<T extends BaseType>`

### Configuración & Secretos
- [ ] Config leída SOLO via `bootstrap()`, nunca `process.env.VAR` directo
- [ ] Secretos en SENSITIVE_FIELDS centralizado
- [ ] `.env` incluido en `.gitignore`
- [ ] `.env.example` actualizado con nuevas vars

### Logging & Observabilidad
- [ ] Event names estables: `domain.category.event` (dot-separated)
- [ ] `requestId` incluido en TODOS los logs relacionados
- [ ] Contexto sin valores sensibles (sanitized)
- [ ] `durationMs` en eventos de operación
- [ ] Niveles correctos: `debug` para diagnóstico, `info` para operaciones
- [ ] Sin `console.*` directo (solo logger)

### Manejo de Errores & Reintentos
- [ ] Errores retryables (429, 5xx) con backoff exponencial
- [ ] Errores no-retryables (400, 401, 403, 404, 422) immediato
- [ ] Max reintentos configurable vía COOLIFY_MAX_RETRIES
- [ ] Rate limiting respetado (retry-after header)
- [ ] Errores formatean con error code + message + hint

### READ_ONLY & Confirmación
- [ ] Mutating tools verifican `READ_ONLY` flag
- [ ] Operaciones críticas requieren confirmación (ver lista oficial)
- [ ] Confirmación token verificado antes de ejecutar
- [ ] Logs registran confirmación/cancelación

### Testing
- [ ] Unit tests para validación (Zod schemas)
- [ ] Unit tests para logging (eventos se emiten)
- [ ] Integration tests contra mock Coolify API
- [ ] Tests de error handling (429, 5xx, 4xx)
- [ ] Coverage ≥ mínimo de categoría

### Seguridad
- [ ] No credenciales en logs (redactadas automáticamente)
- [ ] No credenciales en errores expuestos al cliente
- [ ] Token Bearer validado al bootstrap
- [ ] Respuestas de error no exponen rutas internas

---

## Testing & Coverage Minimums

| Componente | Mínimo | Obligatorio Validar |
|-----------|--------|-------------------|
| **Validación (Zod)** | 90% | Happy path + límites (min/max, regex) + errores |
| **Logging events** | 85% | Al menos 1 evento por nivel (trace, debug, info, warn, error) |
| **Config bootstrap** | 90% | Config válida + env vars faltantes + valores inválidos |
| **Error handling** | 85% | 4xx (400, 401, 403, 404, 422) + 5xx (500, 503, 429) |
| **Reintentos** | 80% | Backoff exponencial funciona + max reintentos respetado |
| **Secret sanitization** | 95% | **Zero tolerance**: Tokens, passwords, keys no en logs |
| **READ_ONLY enforcement** | 90% | Mutating ops bloqueadas + error 403 correcto |
| **Confirmation flow** | 80% | Request enviado + confirmado → ejecuta + cancelado → no ejecuta |
| **Tools (API calls)** | 70% | Happy path + error esperado de Coolify |

**Casos de Test Críticos**:

1. **Bootstrap falla correctamente**:
   - Token ausente/inválido → exit(1)
   - Coolify no disponible → exit(1)
   - Config inválida → exit(1)

2. **Validación de parámetros**:
   - UUID inválido → error antes de API call
   - Falta parámetro requerido → error antes de API call
   - Parámetro fuera de rango → error antes de API call

3. **Reintentos automáticos**:
   - 429 rate limit → reintenta con backoff
   - 503 service unavailable → reintenta hasta max
   - 400 bad request → NO reintenta

4. **Logging observable**:
   - `LOG_LEVEL=debug` emite más logs que `info`
   - `LOG_LEVEL=info` NO emite logs `debug`
   - Tokens redactados en TODOS los niveles

5. **READ_ONLY bloqueando**:
   - Con `READ_ONLY=true`, `create_*` → 403
   - Con `READ_ONLY=true`, `delete_*` → 403
   - Con `READ_ONLY=true`, `GET` → OK

6. **Confirmación crítica**:
   - `delete_application` requiere confirmación
   - Sin confirmación → error con hint
   - Con confirmación falsa → rechaza

---

## Safety Guardrails & Prohibiciones

| ✓ DO | ❌ DON'T |
|-----|---------|
| `const params = MySchema.parse(input);` | `const params = input as MyType;` |
| `z.infer<typeof MySchema>` | `type MyType = { any };` |
| `logger.info('domain.category.event', {})` | `console.log('msg')` |
| Incluir `requestId` en logs | Log sin correlación |
| `const token = config.COOLIFY_TOKEN;` | `const token = process.env.VAR;` |
| Validar respuestas API con Zod | Confiar en APIs externas |
| Fail-fast en bootstrap | Log warning y continuar |
| Bloquear en READ_ONLY | Ignorar flag READ_ONLY |
| Requerir confirmación para críticas | Ejecutar sin preguntar |
| Redactar secrets automáticamente | Loguear secretos directo |

### Prohibiciones Absolutas (Críticas)
- ❌ **NUNCA** `process.env.VAR` directo (solo via `config.ts`)
- ❌ **NUNCA** `console.*` en código app (solo logger)
- ❌ **NUNCA** `any` type en TypeScript
- ❌ **NUNCA** confiar en tipos de Coolify API sin Zod validation
- ❌ **NUNCA** loguear secretos/tokens/passwords
- ❌ **NUNCA** ejecutar mutaciones si `READ_ONLY=true`
- ❌ **NUNCA** operación crítica sin confirmación explícita

---

## Configuración Coolify API (No Negociable)

### Variables de Entorno Requeridas
```bash
# URL base de Coolify (sin trailing slash)
COOLIFY_BASE_URL=https://coolify.midominio.com/api/v1

# Token Bearer (generar en panel > Settings > API)
COOLIFY_TOKEN=tr_xxxxxxxxxxxxxxxxxxxx

# Timeout para HTTP requests (milliseconds)
COOLIFY_REQUEST_TIMEOUT=30000

# Máximo reintentos para fallos transitorios
COOLIFY_MAX_RETRIES=3

# Modo lectura (bloquea POST/PATCH/DELETE)
READ_ONLY=false

# Nivel de logging
LOG_LEVEL=info

# Directorio de logs
LOG_DIR=.logs

# Habilitar escritura a .logs/
LOG_TO_FILES=true

# Timezone para timestamps
LOG_TIMEZONE=Europe/Madrid

# Validar token al bootstrap
VALIDATE_TOKEN_ON_STARTUP=true
```

### Coolify API Contract
- **Versión mínima**: 4.0.0
- **Endpoint base**: `/api/v1`
- **Autenticación**: Bearer Token
- **Métodos**: GET, POST, PATCH, DELETE
- **Respuestas**: JSON

---

## Governance & Amendment Process

**Constitution Supersedes**: Todas las prácticas y decisiones deben alinearse.

**Non-Negotiable Pillars**:
1. Zod validation para TODOS los inputs
2. Configuración centralizada via `bootstrap()`
3. Logging estructurado con eventos estables
4. Redacción automática de secretos
5. Fail-fast en bootstrap
6. Confirmación para operaciones críticas

**Code Reviews**: TODOS los PRs deben verificar el checklist.

**Amendments**: Cambios a esta constitución requieren:
1. RFC en GitHub Issues
2. Documentación del cambio
3. Análisis de impacto
4. Plan de migración
5. Aprobación team lead

---

## Quick Reference

### Read Configuration
```typescript
import { config } from '$lib/config';
const token = config.COOLIFY_TOKEN;
```

### Log Event
```typescript
logger.info('domain.category.event', {
  field: value,
  requestId: req.id,
  durationMs: elapsed
});
```

### Validate Input
```typescript
const params = MyToolSchema.parse(input);
// If invalid → Zod throws → handler logs → responds 400
```

### Retry Pattern
```typescript
async function invokeWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
      logger.warn('coolify.request.retry', { 
        attempt: i + 1, 
        delayMs: delay 
      });
      await new Promise(r => setTimeout(r, delay));
    }
  }
}
```

---

---

## Documentación Relacionada

### Arquitectura & Visión
- **`constitution.md`** (este archivo) — Principios, frameworks, ADRs, governance (~1500 líneas)
- **`spec.md`** — Arquitectura técnica, protocolo MCP, logging detallado (~1500 líneas)
- **`CLAUDE.md`** — Guía de diagnostico para agentes IA, logging, troubleshooting

### Especificaciones & API
- **`specifications.md`** — Catálogo de ~107 tools, 13 categorías, parámetros, errores (~2500 líneas)
- **`logging-events.md`** — Definiciones de 50+ eventos estables, contextos, niveles
- **`docs/manual_api_coolify_programador.md`** — Referencia de API Coolify v4
- **`docs/coolify_api_postman_openapi.yaml`** — Schema OpenAPI de Coolify API

### Configuración & Setup
- **`.env.example`** — Plantilla de variables de entorno con comentarios
- **`package.json`** — Versionado exacto de dependencias
- **`.eslintrc.js`** — Reglas ESLint (prohibición de console.*, any types)
- **`tsconfig.json`** — TypeScript strict mode

---

## Diagrama de Decisiones Clave (ADRs)

```
┌─ ADR-001: Validación (Zod obligatorio)
│  ├─ Decision: Todo input validado con Zod
│  └─ Razón: DRY, type inference, runtime safety
│
├─ ADR-002: Configuración Centralizada
│  ├─ Decision: Solo via bootstrap(), nunca process.env directo
│  └─ Razón: Fail-fast en startup, single source of truth
│
├─ ADR-003: Logging Estructurado
│  ├─ Decision: Pino + eventos estables (domain.category.event)
│  └─ Razón: Observable, auditable, redacción automática
│
├─ ADR-004: READ_ONLY Global
│  ├─ Decision: Todo o nada, no granular por tool
│  └─ Razón: Simplicidad, no false security sense
│
├─ ADR-005: Confirmación Obligatoria
│  ├─ Decision: 4 categorías de operaciones críticas
│  └─ Razón: Prevenir cambios accidentales
│
└─ ADR-006: Fases de Implementación
   ├─ Decision: MVP → Fase 2 → Fase 3 (~45 → 65 → 107 tools)
   └─ Razón: Entrega incremental, testing, stabilidad

```

---

## Quick Links para Desarrolladores

- **Empezar rápido**: Lee `spec.md` sección 1-3 (Visión, Arquitectura, Config)
- **Implementar un tool**: Lee `specifications.md` para tu categoría + `spec.md` sección 8
- **Debuggear problemas**: Lee `CLAUDE.md` + `logging-events.md`
- **Code review**: Usa el **Code Review Checklist** arriba ↑
- **Testear**: Sigue `spec.md` sección 11 (Testing)

---

**Versión del documento**: 2.0.0  
**Última actualización**: 2026-05-11  
**Próxima revisión**: Cuando se agreguen nuevos principios o frameworks obligatorios
