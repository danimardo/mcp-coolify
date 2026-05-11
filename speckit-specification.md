# SpecKit Specification: MCP Coolify

**Project**: MCP Coolify — Servidor MCP que expone API de Coolify como herramientas para agentes de IA

**Purpose**: Permitir que agentes de IA (Claude Code CLI, etc.) gestionen infraestructura Coolify a través de un contrato estable, auditable y seguro.

**Status**: Specification Phase | **Updated**: 2026-05-11

---

## 1. Project Identity

**MCP Coolify** es un servidor Node.js que implementa el Model Context Protocol para exponer 107 herramientas organizadas en 13 categorías (Applications, Deployments, Databases, Servers, Projects, etc.).

**Usuarios**: DevOps engineers, SREs, automation engineers — trabajando a través de agentes de IA.

**Principios Fundamentales**:
- 🔒 **Seguridad Primero**: Redacción automática de secrets, validación defensiva, modo READ_ONLY para auditoría
- 📋 **Auditoría Obligatoria**: Cada operación genera eventos estructurados con correlación por requestId
- 🛡️ **Resiliencia**: Retry con exponential backoff, timeout handling, graceful degradation
- 🎯 **Observable**: Logs estructurados, eventos estables, fácil diagnostics

---

## 2. Non-Negotiable Frameworks

Estos son **marcos obligatorios**. No hay alternativas aceptables; no son opciones de diseño.

### 2.1 Validación de Datos — Zod

**Decisión**: Toda validación runtime usa **Zod** con type inference (`z.infer<>`).

**Regla**: Cada parámetro de tool, cada respuesta de API externa, cada variable de entorno MUST tener un Zod schema.

```typescript
// ✓ CORRECTO
import { z } from 'zod';

const CreateServerParams = z.object({
  name: z.string().min(3).max(255),
  ip: z.string().ip('v4'),
  port: z.number().int().min(1).max(65535),
  region: z.enum(['us-east', 'eu-west', 'asia-pacific']).optional()
});

type CreateServerInput = z.infer<typeof CreateServerParams>;

async function createServer(params: CreateServerInput) {
  // TypeScript infiere tipos automáticamente de Zod schema
  console.log(params.name); // string
  console.log(params.port);  // number
}

// ❌ PROHIBIDO
function createServer(params: any) { }
async function createServer(params: { name, ip, port }) { } // Sin Zod
```

**Por qué**: Zod cierra la brecha entre validación runtime y types TypeScript. Si la validación pasa, TypeScript garantiza los tipos.

**Scope**: 
- Parámetros de tools (107 tools = 107+ schemas)
- Respuestas de Coolify API
- Variables de entorno
- Configuración de bootstrap

---

### 2.2 Gestión Centralizada de Configuración

**Decisión**: Cero acceso directo a `process.env.VAR`. Todo pasa por `src/server/config.ts` con validación y fail-fast.

```typescript
// src/server/config.ts
import { z } from 'zod';

const ConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  COOLIFY_API_URL: z.string().url(),
  COOLIFY_TOKEN: z.string().startsWith('tr_'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  LOG_DIR: z.string().default('.logs'),
  LOG_TIMEZONE: z.string().default('Europe/Madrid'),
  READ_ONLY: z.string().transform(v => v === 'true').default('false'),
  MAX_RETRIES: z.string().transform(Number).default('3'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('60000')
});

export async function bootstrap() {
  try {
    const config = ConfigSchema.parse(process.env);
    logger.info('app.bootstrap.config_loaded', {
      environment: config.NODE_ENV,
      readOnly: config.READ_ONLY
    });
    return config;
  } catch (error) {
    logger.fatal('app.bootstrap.failed', {
      reason: 'Invalid configuration',
      error: error.message
    });
    process.exit(1); // Fail-fast: no startup si config es inválida
  }
}

// En cualquier archivo:
import { config } from '$lib/config';
const token = config.COOLIFY_TOKEN; // ✓ CORRECTO
const token = process.env.COOLIFY_TOKEN; // ❌ PROHIBIDO
```

**Por qué**: Fail-fast on bootstrap es crítico. Mejor descubrirlo en local development que en producción.

**Scope**: 
- 8+ variables de entorno
- Bootstrap validation en server startup
- Validación Zod obligatoria

---

### 2.3 Logging Estructurado — Pino + Eventos Estables

**Decisión**: Logging basado en **Pino** (logger) + nombres de eventos estables (dot-separated) + redacción automática de secrets.

```typescript
// ✓ CORRECTO: Evento estable + contexto no-sensible + requestId
import { logger } from '$lib/logging/logger.server';

logger.info('mcp.tool.completed', {
  tool: 'restart_application',
  requestId: 'req-abc123def456',
  durationMs: 2543,
  status: 'success'
});

logger.error('coolify.request.failed', {
  endpoint: '/applications',
  requestId: 'req-xyz789',
  statusCode: 500,
  retryAttempt: 2
});

// ❌ PROHIBIDO
console.log('Tool completed'); // ESLint rechaza console.*
logger.info('Operación completada', {}); // eventName libre (no estable)
logger.debug('api_key', { api_key: 'secret123' }); // Secret sin redacción
```

**Eventos Estables** (50+ documentados en `logging-events.md`):

```
app.bootstrap.started
app.bootstrap.config_loaded
app.bootstrap.token_validated
app.bootstrap.failed

mcp.tool.invoked
mcp.tool.parameters_validated
mcp.tool.parameters_invalid
mcp.tool.completed
mcp.tool.failed

coolify.request.started
coolify.request.completed
coolify.request.failed
coolify.request.retry
coolify.request.rate_limit.hit

operation.confirmation.requested
operation.confirmed
operation.cancelled_by_user

read_only.blocked_operation
```

**Redacción Automática** (SENSITIVE_FIELDS):

```typescript
// En sanitize.ts se define qué campos redactar
const SENSITIVE_FIELDS = [
  'password', 'token', 'api_key', 'authorization',
  'cookie', 'secret', 'private_key', 'credential'
];

// Automáticamente:
logger.info('event', { password: 'secret123' });
// Output en logs: { password: '[REDACTED]' }
```

**Log Levels & Expectations**:

| Level | Contenido | Cuándo |
|-------|-----------|--------|
| `trace` | Detalles extremados (raramente usado) | Never in production |
| `debug` | Info diagnóstica detallada | Development + troubleshooting |
| `info` | Eventos normales (default) | Operaciones exitosas, cambios |
| `warn` | Situaciones anómalas | Reintentos, deprecations |
| `error` | Fallos reales | Exceptions, API errors |
| `fatal` | Irrecuperables | Bootstrap failed, unhandled exception |

**Archivos de Log** (desarrollo local):

```
.logs/app.log          # Human-readable (truncado en cada restart)
.logs/app.jsonl        # JSON Lines estructurado (1 evento = 1 línea JSON válida)
```

**Por qué**: 
- Structured logging + eventos estables = auditoría automática
- Redacción automática = no secrets en logs por accidente
- Pino = performance (async I/O, structured)
- RequestId correlation = debugging complejo simplificado

**Scope**:
- Logger centralizado en `$lib/logging/logger.server`
- 50+ eventos estables documentados
- Redacción obligatoria de secrets
- ESLint enforcement: no console.log/error/warn en application code

---

## 3. Architecture Overview

```
src/
├── lib/
│   ├── logging/
│   │   ├── types.ts          # Logger contract (trace, debug, info, warn, error, fatal)
│   │   ├── events.ts         # Stable event names (50+)
│   │   ├── sanitize.ts       # Automatic redaction (SENSITIVE_FIELDS)
│   │   └── levels.ts         # Log level definitions
│   │
│   ├── mcp/
│   │   ├── tools.ts          # Tool definitions & registry (107 tools)
│   │   ├── schema.ts         # Zod schemas for all tool parameters
│   │   └── responses.ts      # Zod schemas for responses
│   │
│   ├── coolify/
│   │   ├── client.ts         # API client (with retry + logging)
│   │   ├── endpoints.ts      # API endpoint constants
│   │   └── types.ts          # Coolify data structures
│   │
│   └── config.ts             # Centralized config export
│
├── server/
│   ├── config.ts             # Bootstrap function + validation
│   │
│   ├── logging/
│   │   ├── logger.server.ts  # Pino initialization + wrapper
│   │   ├── formatters.ts     # Human + JSON formatting
│   │   ├── file-transports.ts # Write to .logs/
│   │   └── bootstrap.ts      # Logger startup
│   │
│   ├── mcp/
│   │   ├── handler.ts        # Tool request handler (validation → execution)
│   │   └── invoker.ts        # Tool execution (confirmation + retry)
│   │
│   └── bootstrap.ts          # Server startup sequence
│
└── tools/
    ├── applications/         # 19 tools
    ├── deployments/          # 5 tools
    ├── databases/            # 21 tools
    ├── servers/              # 8 tools
    ├── projects/             # 9 tools
    ├── services/             # 13 tools
    ├── resources/            # 1 tool
    ├── private-keys/         # 5 tools
    ├── github-apps/          # 7 tools
    ├── cloud-tokens/         # 6 tools
    ├── hetzner/              # 5 tools
    └── teams/                # 4 tools
```

**Request Flow**:

```
1. MCP Client sends: tool.invoke({ name, params })
   ↓
2. handler.ts: Validate params with Zod schema
   ↓
3a. If INVALID → Log error, respond 400
3b. If READ_ONLY + mutation → Log blocked, respond 403
3c. If requires confirmation → Log request, wait for user approval
   ↓
4. invoker.ts: Execute tool
   - Prepare Coolify API call
   - Log: coolify.request.started
   - Call API with retry logic
   - Log: coolify.request.completed or coolify.request.failed
   ↓
5. Validate response with Zod
   ↓
6. Log: mcp.tool.completed
   ↓
7. Respond to MCP client
```

---

## 4. Coding Standards & Patterns

### 4.1 TypeScript Configuration

```typescript
// tsconfig.json strict mode (non-negotiable)
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**Regla**: Cero `any` types. Si necesitas una unión, úsala explícitamente.

### 4.2 Zod Validation Pattern

```typescript
// Tools/index.ts
export const MyTool = {
  description: 'Clear description of what this tool does',
  inputSchema: MyToolSchema, // Zod object
  async handler(params: z.infer<typeof MyToolSchema>, context) {
    // Parámetros ya validados por Zod
    logger.info('mcp.tool.started', { tool: 'my_tool', requestId: context.requestId });
    
    try {
      const result = await doSomething(params);
      logger.info('mcp.tool.completed', {
        tool: 'my_tool',
        requestId: context.requestId,
        durationMs: Date.now() - context.startTime
      });
      return result;
    } catch (error) {
      logger.error('mcp.tool.failed', {
        tool: 'my_tool',
        requestId: context.requestId,
        error: error.message
      });
      throw error;
    }
  }
};
```

### 4.3 Coolify API Calls

```typescript
// coolify/client.ts
async function apiCall(endpoint: string, options = {}) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  logger.info('coolify.request.started', {
    endpoint,
    method: options.method || 'GET',
    requestId
  });
  
  try {
    const response = await fetch(`${COOLIFY_API_URL}${endpoint}`, {
      headers: { 'X-API-Token': config.COOLIFY_TOKEN },
      ...options
    });
    
    if (!response.ok) {
      logger.warn('coolify.request.failed', {
        endpoint,
        statusCode: response.status,
        requestId,
        durationMs: Date.now() - startTime
      });
      throw new APIError(response.status, response.statusText);
    }
    
    const data = await response.json();
    logger.info('coolify.request.completed', {
      endpoint,
      statusCode: response.status,
      requestId,
      durationMs: Date.now() - startTime
    });
    
    return data;
  } catch (error) {
    logger.error('coolify.request.failed', {
      endpoint,
      requestId,
      error: error.message,
      durationMs: Date.now() - startTime
    });
    throw error;
  }
}
```

### 4.4 Retry Pattern

```typescript
async function invokeWithRetry(fn, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      
      const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
      logger.warn('coolify.request.retry', {
        attempt: attempt + 1,
        maxRetries,
        delayMs: delay,
        reason: error.message
      });
      
      await new Promise(r => setTimeout(r, delay));
    }
  }
}
```

---

## 5. Safety Guardrails & Prohibitions

### 5.1 Validation Guardrails

| ✓ DO | ❌ DON'T |
|-----|---------|
| `const params = MySchema.parse(input);` | `const params = input as MyType;` |
| `z.infer<typeof MySchema>` | `type MyType = { any };` |
| Validate external API responses | Trust API responses without validation |
| Validate user input parameters | Pass user input directly to functions |
| Use `z.enum()` for known sets | Use `z.string()` and `if (x === ...)` |

### 5.2 Configuration Guardrails

| ✓ DO | ❌ DON'T |
|-----|---------|
| `const token = config.COOLIFY_TOKEN;` | `const token = process.env.COOLIFY_TOKEN;` |
| Bootstrap on server startup | Load config in random functions |
| Fail-fast if config invalid | Log warning and continue |
| Validate all env vars with Zod | Assume env vars exist |
| Use `.default()` for optional vars | Assume optional vars are undefined |

### 5.3 Logging Guardrails

| ✓ DO | ❌ DON'T |
|-----|---------|
| `logger.info('domain.category.event', {...})` | `console.log('msg')` |
| Use stable event names | Free-form message strings |
| Include `requestId` in context | Log without correlation |
| Log duration for operations | Assume operations are fast |
| Log errors with error message + code | Log only error message |
| Redaction happens automatically | Copy secrets to logs manually |

### 5.4 READ_ONLY Mode Enforcement

```typescript
// handler.ts
if (config.READ_ONLY && tool.mutates) {
  logger.warn('read_only.blocked_operation', {
    tool: toolName,
    requestId
  });
  throw new Error('This operation is blocked in READ_ONLY mode');
}
```

**Tools that mutate** (require READ_ONLY check):
- Create, Update, Delete operations
- Restart, Reboot, Power operations
- Configuration changes
- Deployments, backups, migrations

**Tools that don't mutate** (safe in READ_ONLY):
- Get, List, Describe operations
- Status checks
- View logs, metrics, configs

---

## 6. Testing & Coverage Minimums

Targets by category (not uniform — security-critical areas have higher thresholds):

| Category | Minimum | Rationale |
|----------|---------|-----------|
| **Zod Validation** | 90% | Core contract; input/output types |
| **Logging Events** | 80% | Auditoría observability |
| **Config Bootstrap** | 85% | Fail-fast is critical |
| **Error Handling** | 80% | Resilencia |
| **Secret Sanitization** | 95% | Security (zero tolerance for leaks) |
| **Tool Handlers** | 70% | Depend on external Coolify API |

**Testing Strategy**:

```typescript
// Vitest pattern
import { describe, it, expect, beforeEach } from 'vitest';
import { MyTool, MyToolSchema } from './my-tool';

describe('MyTool', () => {
  it('should validate parameters correctly', () => {
    expect(() => MyToolSchema.parse({ invalid: 'params' })).toThrow();
    expect(MyToolSchema.parse({ valid: 'params' })).toBeDefined();
  });
  
  it('should log events with requestId and duration', async () => {
    // Mock logger, invoke tool, verify events logged
  });
  
  it('should handle Coolify API errors gracefully', async () => {
    // Mock API failure, verify retry + logging + error response
  });
  
  it('should redact secrets in logs', () => {
    // Verify SENSITIVE_FIELDS are redacted in output
  });
});
```

---

## 7. Code Review Checklist

Before merge, a reviewer MUST verify:

### Security & Validation
- [ ] All inputs validated with Zod (no `any` or loose types)
- [ ] External API responses validated with Zod
- [ ] No direct `process.env.*` access (all via config)
- [ ] SENSITIVE_FIELDS includes all new secret types
- [ ] No secrets logged (redaction verified)

### Logging & Observability
- [ ] Events use stable names (`domain.category.event`)
- [ ] `requestId` included in log context
- [ ] `durationMs` included for operations
- [ ] Log level appropriate (info/warn/error, not debug for normal flow)
- [ ] No `console.log/error/warn` (ESLint should catch)

### READ_ONLY Safety
- [ ] Mutating tools have READ_ONLY check
- [ ] Non-mutating tools skip READ_ONLY check
- [ ] READ_ONLY tests verify blocking behavior

### Error Handling
- [ ] Coolify API errors caught and logged
- [ ] Retry logic with exponential backoff for transient errors
- [ ] HTTP status codes mapped to appropriate responses
- [ ] User-facing error messages are clear (not raw exceptions)

### Code Quality
- [ ] TypeScript strict mode (no `any`)
- [ ] Tests cover happy path + error cases
- [ ] Coverage meets minimum for category
- [ ] No unused variables (TypeScript strict)
- [ ] Comments only for non-obvious behavior

---

## 8. Key Design Decisions

### Why Zod (not another validator)?

- **Type Inference**: `z.infer<T>` gives you TypeScript types automatically from validation schemas
- **Composability**: Schemas combine naturally (objects, arrays, discriminated unions)
- **Error Details**: Validation errors include field path, expected type, actual value — useful for debugging
- **Runtime + Types**: Closes the gap between validation and TypeScript types

### Why Pino (not Winston/Bunyan)?

- **Performance**: Async I/O, structured by default
- **Stream-based**: Separates formatting from logging (one logger, many outputs)
- **Low Overhead**: ~0.5ms per log call (important for high-traffic systems)
- **Ecosystem**: Wide adoption, many integrations

### Why Stable Event Names?

- **Queryable**: `grep "mcp.tool.completed" .logs/app.jsonl` returns exact events
- **Parseable**: Tools/dashboards can aggregate by event name
- **Documentation**: Each event name maps to a contract in `logging-events.md`
- **Alerting**: Can monitor specific events (e.g., `coolify.request.failed` rate)

### Why READ_ONLY Mode?

- **Auditing**: Run tools in read-only to see what they'd do before allowing mutations
- **Testing**: Test tool logic without side effects
- **Safety**: Gradual rollout (test in READ_ONLY, promote to full access)
- **Learning**: Developers can explore API without fear

### Why Fail-Fast on Bootstrap?

- **Early Detection**: Config problems caught immediately in development
- **Clear Error Messages**: Bootstrap logs exactly what's wrong
- **No Silent Failures**: Better than getting 403 errors 10 requests in
- **Operational Safety**: Production servers won't start with bad config

---

## 9. Scope & Scale

### Tool Categories (13)

```
1. Default (4)          — Health checks, connectivity
2. Teams (4)            — List, get teams
3. Projects (9)         — Create, update, delete projects
4. Applications (19)    — Start, stop, deploy, rebuild, logs, etc.
5. Deployments (5)      — Create, list, cancel, rollback
6. Databases (21)       — Backup, restore, migrate, etc.
7. Services (13)        — Redis, PostgreSQL, MySQL, etc.
8. Servers (8)          — Create, delete, connect, reboot
9. Resources (1)        — List available resources
10. Private Keys (5)    — Import, export, delete keys
11. GitHub Apps (7)     — Install, configure, delete apps
12. Cloud Tokens (6)    — Create, list, rotate tokens
13. Hetzner (5)         — Provision, manage Hetzner infrastructure
```

### Total Tools: 107

### Read vs. Write Operations

Prioritized by implementation order:
1. **Read operations** (highest priority — less risky)
2. **Write operations** (lower priority — require confirmation)

### Validation Coverage

- Each of 107 tools has a Zod schema for parameters
- Each response has a Zod schema for parsing
- External API responses validated before processing

---

## 10. Related Documentation

- **`constitution.md`** — Full vision, principles, non-negotiable frameworks (800+ lines)
- **`spec.md`** — Technical architecture, MCP flow, detailed behavior, logging architecture (600+ lines)
- **`specifications.md`** — Complete catalog of 107 tools with endpoints, parameters, examples (1600+ lines)
- **`logging-events.md`** — 50+ stable event definitions with context examples (500+ lines)
- **`CLAUDE.md`** — Diagnostics guide for AI agents (400+ lines)
- **`constitution.md` (SpecKit memory)** — Compact SpecKit reference guide

---

## How to Use This Specification

**For Development**: Reference sections 4 (Coding Standards) and 7 (Code Review Checklist) during implementation.

**For Code Review**: Section 7 is your checklist — verify each item before approving.

**For Debugging**: Section 3 (Architecture) shows where code lives. Section 4 shows patterns. `.logs/app.log` shows what happened.

**For Adding New Tools**: Create Zod schema (section 4.2), implement handler (section 4.2), add logging (section 4.3), test (section 6), review (section 7).

**For SpecKit Integration**: This document captures all non-negotiable decisions in one place. It's meant to guide development consistently across team members and time.

---

**Last Updated**: 2026-05-11  
**Author**: Design Phase — Claude Code  
**For**: Use with `/speckit-specify` command on SpecKit framework
