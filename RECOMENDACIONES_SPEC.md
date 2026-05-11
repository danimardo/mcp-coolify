# Recomendaciones Técnicas para Mejorar Spec MCP Coolify

**Documento de trabajo**: Basado en clarificaciones del usuario + análisis de documentación existente.

---

## 1. ✅ CONFIRMADO: Autenticación Bearer Token

**Decisión**: `Authorization: Bearer <TOKEN>`

**Evidencia**: 
- Curl funcional: `Authorization: Bearer <COOLIFY_TOKEN_REDACTED>`
- Format en Coolify v4 es Bearer Token estándar

**Implementación**:
```typescript
const headers = {
  'Authorization': `Bearer ${COOLIFY_TOKEN}`,
  'Accept': 'application/json'
};
```

---

## 2. ✅ CONFIRMADO: Axios como HTTP Client

**Decisión**: Usar `axios` (no Fetch API nativa)

**Razones**:
- Mejor manejo de timeouts
- Automatic retry hooks (integrable con lógica exponencial backoff)
- Content-Type auto-negotiation
- Mejor error handling (distinguir entre network errors vs HTTP errors)

**Versión recomendada**: 1.6+ (en package.json)

**Alternativa futura**: Si comprobamos que Axios es overkill, migramos a Fetch + helper utilities.

---

## 3. 💡 SUGERENCIA: HTTP Status Codes Retryables

**Decisión Recomendada**:

### Retryables (exponential backoff: 1s, 2s, 4s)
- `429` — Rate Limited (IMPORTANTE: respetar Retry-After header)
- `500` — Internal Server Error
- `502` — Bad Gateway
- `503` — Service Unavailable
- `504` — Gateway Timeout

**Lógica**: Estos son transitorios; la segunda/tercera tentativa puede suceder.

### NO Retryables (fail inmediatamente)
- `400` — Bad Request (error en nuestros parámetros)
- `401` — Unauthorized (token inválido/expirado)
- `403` — Forbidden (sin permisos)
- `404` — Not Found (recurso no existe)
- `422` — Unprocessable Entity (validación de Coolify falló)

**Lógica**: No tiene sentido reintentar; el error es de aplicación o datos.

### Implementación
```typescript
const RETRYABLE_STATUS_CODES = [429, 500, 502, 503, 504];
const NON_RETRYABLE_STATUS_CODES = [400, 401, 403, 404, 422];

async function invokeWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (NON_RETRYABLE_STATUS_CODES.includes(error.status)) {
        throw error; // No reintentar
      }
      if (!RETRYABLE_STATUS_CODES.includes(error.status)) {
        throw error; // Desconocido, no reintentar
      }
      if (i === maxRetries - 1) {
        throw error; // Max reintentos agotados
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, i) * 1000;
      logger.warn('coolify.request.retry', {
        attempt: i + 1,
        status: error.status,
        delayMs: delay
      });
      await new Promise(r => setTimeout(r, delay));
    }
  }
}
```

---

## 4. 💡 SUGERENCIA: Operaciones Críticas que Requieren Confirmación

**Decisión Recomendada**: SÍ, incluir lista de operaciones críticas.

**Basado en**: Lo que definimos en `constitution.md`

### Categoría 1: Deletions (CRÍTICAS - Irreversibles)
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

### Categoría 2: Cambios Destructivos (ADVERTENCIA)
- `cancel_deployment`
- `stop_application`
- `stop_database`
- `stop_service`

### Categoría 3: Creaciones en Producción (COSTO/RIESGO)
- `trigger_deployment` (especialmente en producción)
- `create_hetzner_server` (implicación financiera)

### Categoría 4: Gestión de Secretos (SENSIBLE)
- `create_private_key`
- `create_cloud_token`
- `create_github_app`
- `create_application_environment_variable` (si es secreto)

**Total**: ~19 operaciones requieren confirmación

**Flujo Propuesto**:
```typescript
if (isCriticalOperation(toolName)) {
  // 1. Agente solicita → MCP responde con confirmationRequired: true
  return {
    confirmationRequired: true,
    operation: toolName,
    severity: 'critical|warning|sensitive',
    message: 'descripción del riesgo',
    details: { ... }
  };
  
  // 2. Agente responde explícitamente:
  // { confirmed: true, confirmationToken: '...' }
  
  // 3. Si confirmado → ejecutar; si no → rechazar
}
```

---

## 5. 💡 SUGERENCIA: Fases de Implementación (MVP → Fase 3)

**Decisión Recomendada**: Especificar las 3 fases en el spec.

### MVP — Fase 1 (Lanzamiento v1.0.0)
**Alcance**: ~45 tools, lectura + operaciones básicas

**Categorías completas** (implementar 100%):
- Default (4/4): version, health, enable_api, disable_api
- Teams (4/4): current_team, members, team_by_id, list_all_teams

**Categorías parciales** (implementar subset):
- Projects (3/9): list, get, create
- Applications (6/19): list, get, logs, start/stop/restart
- Deployments (4/5): list, get, trigger, cancel
- Servers (4/8): list, get, validate, resources

**Hito**: Servidor MCP funcional, auditable, READ_ONLY operacional.

---

### Fase 2 (v1.1 - v1.5)
**Alcance**: ~65 tools, expansión a datos intermedios

**Agregar**:
- Projects (rest: update, delete, environments)
- Applications (rest: create variants, update, env vars)
- Deployments (rest)
- Databases (lectura: list, get, backups)
- Services (lectura: list, get, variables)
- GitHub Apps (lectura: list, get, repos, branches)
- Private Keys (lectura)
- Cloud Tokens (lectura)

**Hito**: Capacidades amplias lectura/escritura, testing completo.

---

### Fase 3 (v2.0+)
**Alcance**: ~107 tools, funcionalidad completa

**Agregar**:
- Databases (escritura: create, update, delete, backups)
- Services (escritura: create, update, delete, env vars)
- Private Keys (escritura)
- GitHub Apps (escritura)
- Cloud Tokens (escritura)
- Hetzner (all 5 tools)

**Hito**: Funcionalidad completa, permisos granulares opcionales.

---

## 6. 💡 SUGERENCIA: Categorías de Tools (13 Enumeradas)

**Decisión Recomendada**: Enumerar en spec para claridad.

```
1.  Default        (4 tools)  — Versión, health, enable/disable API
2.  Teams          (4 tools)  — Info de equipos
3.  Projects       (9 tools)  — Gestión de proyectos
4.  Applications   (19 tools) — Gestión de apps (+ variables entorno)
5.  Deployments    (5 tools)  — Despliegues
6.  Databases      (21 tools) — BDs + backups (PostgreSQL, MySQL, MongoDB, Redis, etc)
7.  Services       (13 tools) — Servicios one-click (WordPress, Gitea, etc)
8.  Servers        (8 tools)  — Servidores conectados
9.  Resources      (1 tool)   — Recursos globales
10. Private Keys   (5 tools)  — Claves SSH
11. GitHub Apps    (7 tools)  — Integraciones GitHub
12. Cloud Tokens   (6 tools)  — Tokens Hetzner, etc
13. Hetzner        (5 tools)  — Ubicaciones, server types, images, SSH keys, crear servidor
```

**Total**: 107 tools

---

## 7. 💡 SUGERENCIA: Coolify API Version

**Decisión Recomendada**: Especificar explícitamente "v4"

**En Assumptions**:
```
API Integration:
- Coolify API v4 (mínimo)
- Endpoint base: /api/v1
- Autenticación: Bearer Token (formato: 2|<random>)
- Respuestas: JSON
```

---

## 8. ✅ CONFIRMADO: Endpoint Base

**Decisión**: `/api/v1`

**Configuración**:
```bash
COOLIFY_BASE_URL=https://<coolify-domain>/api/v1
```

---

## 9. 💡 SUGERENCIA: Request ID Generation

**Decisión Recomendada**: UUID v4 + incluir en respuesta

### Generación
```typescript
import { randomUUID } from 'crypto';

const requestId = randomUUID(); // e.g., "550e8400-e29b-41d4-a716-446655440000"
```

**Ventajas**:
- Universalmente único
- No predecible
- Fácil de correlacionar en logs
- Estándar de la industria

### Incluir en Respuesta
```json
{
  "result": { ... },
  "_meta": {
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "executedAt": "2026-05-11T14:32:10.123Z",
    "durationMs": 250
  }
}
```

---

## 10. ✅ CONFIRMADO: Timestamps

**Decisión**: 
- **Human-readable**: `18/04/2026 14:32:10` (Madrid timezone)
- **JSON ISO**: `2026-04-18T12:32:10.000Z` + localTime + timezone

**Implementación**:
```typescript
import { formatInTimeZone } from 'date-fns-tz';

const now = new Date();
const localTime = formatInTimeZone(now, 'Europe/Madrid', 'dd/MM/yyyy HH:mm:ss');
// Output: "18/04/2026 14:32:10"

const isoTime = now.toISOString();
// Output: "2026-04-18T12:32:10.000Z"
```

---

## 11. ✅ CONFIRMADO: Timeout Configuration

**Decisión**:
- **Default**: 30 segundos
- **Configurable**: Vía `COOLIFY_REQUEST_TIMEOUT` en .env

```typescript
const timeout = parseInt(process.env.COOLIFY_REQUEST_TIMEOUT || '30000');
// Default: 30000ms = 30 segundos
```

---

## 12. 💡 SUGERENCIA: Rate Limiting Handling

**Decisión Recomendada**:

### 1. Respetar `Retry-After` Header
```typescript
if (error.status === 429) {
  const retryAfter = error.headers['retry-after'];
  const delayMs = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt) * 1000;
  
  logger.warn('coolify.rate_limit.hit', {
    endpoint: path,
    retryAfter: delayMs,
    requestId
  });
  
  await new Promise(r => setTimeout(r, delayMs));
}
```

### 2. Logging Específico
- Event: `coolify.rate_limit.hit` cuando se golpea 429
- Incluir: endpoint, retryAfter, attempt

### 3. NO implementar Circuit Breaker (aún)
- Podría agregarse en Fase 2 si es necesario
- Por ahora: confiamos en retry logic

---

## 13. 💡 SUGERENCIA: Response Validation (Strict)

**Decisión Recomendada**: **Strict parsing**

**Razones**:
- Si Coolify devuelve formato inesperado → mejor fallar rápido
- Los cambios en API de Coolify deberían invalidar schemas
- TypeScript + Zod garantizan corrección

**Implementación**:
```typescript
const ApplicationSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  status: z.enum(['running', 'stopped', 'deploying', 'error']),
  // ... más campos
}).strict(); // Rechaza campos extra

// Si Coolify devuelve campo inesperado → error de validación
const app = ApplicationSchema.parse(coolifyResponse);
```

**Manejo de campos opcionales**:
```typescript
const ApplicationSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(), // Puede estar ausente
  metadata: z.record(z.unknown()).optional(),
}).strict();
```

---

## 14. 💡 SUGERENCIA: Error Response Format

**Decisión Recomendada**: Formato estándar

```typescript
interface ErrorResponse {
  error: string;              // Code: "APPLICATION_NOT_FOUND"
  message: string;            // Description: "App xyz no existe"
  details?: Record<string, any>; // Extra context
  hint?: string;              // How to fix: "Verifícalo con list_applications"
}
```

**Ejemplos**:

### Error Validación
```json
{
  "error": "VALIDATION_FAILED",
  "message": "Parámetros inválidos",
  "details": {
    "field": "uuid",
    "reason": "not_a_valid_uuid",
    "received": "invalid-uuid"
  }
}
```

### Error Coolify API
```json
{
  "error": "APPLICATION_NOT_FOUND",
  "message": "La aplicación 'app-123' no existe",
  "details": {
    "http_status": 404,
    "coolify_endpoint": "/applications/app-123",
    "requestId": "550e8400-e29b-41d4-a716-446655440000"
  },
  "hint": "Usa list_applications para obtener UUIDs válidos"
}
```

### Error READ_ONLY
```json
{
  "error": "FORBIDDEN",
  "message": "Operación bloqueada en modo READ_ONLY",
  "details": {
    "tool": "create_application_public",
    "operation": "POST"
  },
  "hint": "Desactiva READ_ONLY=false en .env para permitir escrituras"
}
```

---

## 15. 💡 SUGERENCIA: Confirmation Flow

**Decisión Recomendada**: Especificar contrato MCP

### Step 1: Agente solicita operación crítica
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "delete_application",
    "arguments": {
      "uuid": "app-123"
    }
  }
}
```

### Step 2: MCP responde pidiendo confirmación
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "type": "text",
    "text": "{\"confirmationRequired\": true, \"operation\": \"delete_application\", \"severity\": \"critical\", \"message\": \"¿Eliminar aplicación 'api-backend' de PRODUCCIÓN? Acción irreversible.\", \"details\": {\"application_uuid\": \"app-123\", \"application_name\": \"api-backend\"}}"
  }
}
```

### Step 3: Agente responde con confirmación
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "delete_application_confirmed",
    "arguments": {
      "uuid": "app-123",
      "confirmed": true,
      "confirmationToken": "550e8400-e29b-41d4-a716-446655440000"
    }
  }
}
```

### Step 4: MCP ejecuta y responde
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "type": "text",
    "text": "Aplicación eliminada correctamente"
  }
}
```

---

## 16. 💡 SUGERENCIA: Versionado de Dependencias

**Decisión Recomendada**: Especificar en spec + package.json

| Paquete | Versión | Razón |
|---------|---------|-------|
| `@modelcontextprotocol/sdk` | ^1.0.0 | MCP protocol oficial |
| `typescript` | ^5.0.0 | TypeScript 5.0+ para mejor perf |
| `zod` | ^3.22.0 | Validación + type inference |
| `pino` | ^8.16.0 | Logging estructurado performante |
| `axios` | ^1.6.0 | HTTP client con retry hooks |
| `dotenv` | ^16.3.0 | Gestión .env |
| `date-fns` | ^2.30.0 | Manejo fechas/timezones |

**DevDependencies**:
| Paquete | Versión |
|---------|---------|
| `@types/node` | ^20.0.0 |
| `@typescript-eslint/eslint-plugin` | ^6.0.0 |
| `eslint` | ^8.0.0 |
| `vitest` | ^0.34.0 |
| `supertest` | ^6.3.0 |

---

## 17. ✅ CONFIRMADO: Database/Storage

**Decisión**: Solo logs (no BD persistente)

**Implementación**:
- `.logs/app.log` (humano-legible)
- `.logs/app.jsonl` (JSON Lines)
- Truncado en cada startup (desarrollo)
- Rotación manual en producción

**NO hay**:
- SQLite
- PostgreSQL
- In-memory cache persistente
- Historial de operaciones almacenado

---

## 18. 💡 SUGERENCIA: Security Considerations

**Decisión Recomendada**: Agregar sección en spec

### Bootstrap Token Validation
```typescript
// En src/server/bootstrap.ts
try {
  const response = await axios.get(`${COOLIFY_BASE_URL}/version`, {
    headers: { Authorization: `Bearer ${COOLIFY_TOKEN}` },
    timeout: 5000
  });
  
  logger.info('app.bootstrap.token_validated', {
    coolifyVersion: response.data.version
  });
} catch (error) {
  logger.fatal('app.bootstrap.token_validation_failed', {
    reason: error.message
  });
  process.exit(1);
}
```

### Token Expiration Handling
```typescript
// En API client
if (error.status === 401) {
  logger.error('coolify.auth.failed', {
    reason: 'token_invalid_or_expired',
    requestId
  });
  // No reintentar — token está muerto
  throw error;
}
```

### Secret Redaction
```typescript
const SENSITIVE_FIELDS = [
  'password', 'passwd', 'pwd',
  'secret', 'token', 'api_key', 'authorization',
  'cookie', 'session', 'csrf', 'client_secret',
  'private_key', 'coolify_token'
];

function sanitizeForLog(obj: unknown): unknown {
  // Recursivamente redacta campos sensibles
  // Implementar con deep traversal
}
```

---

## 📊 RESUMEN DE DECISIONES

| # | Aspecto | Decisión |
|---|---------|----------|
| 1 | Autenticación | `Authorization: Bearer <TOKEN>` |
| 2 | HTTP Client | `axios` 1.6+ |
| 3 | Status Retryables | 429, 5xx (backoff exp) |
| 4 | Ops Críticas | 19 operaciones (con confirmación) |
| 5 | Visión | 107 tools (3 fases) |
| 6 | Categorías | 13 enumeradas |
| 7 | API Version | Coolify v4 (mínimo) |
| 8 | Endpoint | `/api/v1` |
| 9 | Request ID | UUID v4 + en respuesta |
| 10 | Timestamps | Human: 18/04/2026; ISO: 2026-04-18T12:32:10Z |
| 11 | Timeout | 30s default, configurable |
| 12 | Rate Limit | Respetar Retry-After header |
| 13 | Response Val. | Strict parsing (rechaza malformado) |
| 14 | Error Format | Estándar: error + message + hint |
| 15 | Confirmation | Contrato MCP explícito |
| 16 | Versioning | Tabla dependencias en spec |
| 17 | Storage | Solo logs, no BD |
| 18 | Security | Token validation + sanitization |

---

**Siguiente paso**: ¿Estás de acuerdo con estas recomendaciones? Si sí, procederé a mejorar el spec.md con todos estos detalles incorporados.
