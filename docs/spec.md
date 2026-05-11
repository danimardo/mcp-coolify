# Especificación Técnica: MCP Coolify

**Versión:** 1.0.0  
**Fecha:** 2026-05-11  
**Estado:** Draft para aprobación  
**Autores:** Equipo de Desarrollo

---

## 1. Visión General

**MCP Coolify** es un servidor Model Context Protocol (MCP) que expone la API REST de Coolify como un conjunto de herramientas programables para agentes de inteligencia artificial. Permite a los agentes consultar el estado de la infraestructura, examinar logs, administrar despliegues y ejecutar operaciones sobre Coolify de forma segura y auditable.

### 1.1 Objetivo Principal

Proporcionar a los agentes de IA acceso seguro, auditable y controlado a todas las capacidades de Coolify a través del protocolo MCP, eliminando la necesidad de exponer tokens API directamente en aplicaciones de terceros.

### 1.2 Beneficios Clave

- **Centralización de credenciales**: Un único token API almacenado seguramente en `.env`
- **Modo solo lectura**: Protección contra cambios accidentales en producción
- **Auditoría completa**: Cada operación queda registrada con contexto completo
- **Confirmación de operaciones críticas**: Prevención de cambios destructivos accidentales
- **Resiliencia automática**: Reintentos, backoff exponencial, manejo de rate limits
- **Compatibilidad universal**: Funciona con cualquier cliente MCP, no solo Claude Code

---

## 2. Arquitectura

### 2.1 Componentes

```
┌─────────────────────────┐
│   Agente de IA (MCP)    │
│  (Claude Code, etc)     │
└────────────┬────────────┘
             │
             │ Protocolo MCP
             │
┌────────────▼────────────┐
│   Servidor MCP Coolify  │
│  (Node.js)              │
│  ┌──────────────────┐   │
│  │ MCP Handler      │   │
│  │ Tool Registry    │   │
│  │ Auth Middleware  │   │
│  │ Logging Layer    │   │
│  └──────────────────┘   │
└────────────┬────────────┘
             │
             │ HTTP/REST (Bearer Token)
             │
┌────────────▼────────────┐
│   Coolify API v4        │
│  (https://.../api/v1)   │
└─────────────────────────┘
```

### 2.2 Dependencias

**Runtime:**
- Node.js 18+ 
- npm/pnpm

**Paquetes principales:**
- `@modelcontextprotocol/sdk`: SDK oficial de MCP
- `axios` o `node-fetch`: Cliente HTTP
- `dotenv`: Gestión de variables de entorno
- `winston` o `pino`: Logging estructurado
- TypeScript (desarrollo)

### 2.3 Estructura de Directorios

```
coolify-mcp/
├── src/
│   ├── index.ts              # Punto de entrada del servidor MCP
│   ├── config.ts             # Configuración desde .env
│   ├── coolify-client.ts     # Cliente HTTP para Coolify API
│   ├── tools/                # Implementación de cada tool
│   │   ├── default.ts
│   │   ├── teams.ts
│   │   ├── projects.ts
│   │   ├── applications.ts
│   │   ├── deployments.ts
│   │   ├── databases.ts
│   │   ├── services.ts
│   │   ├── servers.ts
│   │   ├── resources.ts
│   │   ├── private-keys.ts
│   │   ├── github-apps.ts
│   │   ├── cloud-tokens.ts
│   │   └── hetzner.ts
│   ├── middleware/           # Middleware de MCP
│   │   ├── auth.ts           # Validación de permisos
│   │   ├── read-only.ts      # Enforcer de READ_ONLY
│   │   └── confirmation.ts   # Confirmación de ops críticas
│   ├── logging/              # Sistema de logging
│   │   └── logger.ts
│   ├── types.ts              # Tipos TypeScript
│   └── utils.ts              # Utilidades
├── .env.example              # Plantilla de configuración
├── package.json
├── tsconfig.json
├── constitution.md           # Documento fundacional
├── specifications.md         # Especificaciones de tools
├── spec.md                   # Este documento
└── README.md
```

---

## 3. Configuración

### 3.1 Variables de Entorno

El servidor MCP requiere las siguientes variables en un archivo `.env`:

```bash
# Endpoint de Coolify
COOLIFY_BASE_URL=https://coolify.example.com/api/v1

# Token de autenticación Bearer
COOLIFY_TOKEN=token_api_aqui_nunca_lo_expongas

# Modo solo lectura (true/false, default: false)
READ_ONLY=false

# Nivel de logging (debug, info, warn, error, default: info)
LOG_LEVEL=info

# Puerto donde corre el servidor MCP (default: 3000)
# Nota: MCP usa stdio, no HTTP, pero útil para health checks
PORT=3000

# Timeout en ms para requests a Coolify (default: 30000)
COOLIFY_REQUEST_TIMEOUT=30000

# Máximo número de reintentos para fallos transitorios (default: 3)
COOLIFY_MAX_RETRIES=3

# Validar permiso de token al iniciar (default: true)
VALIDATE_TOKEN_ON_STARTUP=true

# Directorio para logs (default: ./logs)
LOG_DIR=./logs
```

### 3.2 Validación de Configuración

Al iniciar, el servidor debe:

1. ✓ Leer y validar `.env`
2. ✓ Verificar que `COOLIFY_BASE_URL` es una URL válida
3. ✓ Verificar que `COOLIFY_TOKEN` no está vacío
4. ✓ Si `VALIDATE_TOKEN_ON_STARTUP=true`:
   - Hacer un `GET /version` a Coolify
   - Si falla, reportar error y no iniciar el servidor
5. ✓ Crear directorio de logs si no existe

**Ejemplo de validación exitosa:**
```
[2024-05-11 10:00:00] INFO: MCP Coolify iniciando...
[2024-05-11 10:00:00] INFO: Configuración cargada desde .env
[2024-05-11 10:00:00] INFO: Validando token contra Coolify...
[2024-05-11 10:00:01] INFO: Token válido. Coolify v4.0.0 disponible
[2024-05-11 10:00:01] INFO: Modo READ_ONLY: false
[2024-05-11 10:00:01] INFO: MCP Coolify listo, escuchando en stdio
```

---

## 4. Comportamiento del Servidor

### 4.1 Ciclo de Vida

1. **Inicio**: Leer configuración, validar conectividad
2. **Operación**: Escuchar tools solicitadas vía MCP, procesarlas
3. **Cierre**: Cerrar logs, limpiar recursos

### 4.2 Manejo de Solicitudes de Tool

Cuando el agente invoca un tool:

```
┌─────────────────────────────────────────┐
│ 1. Agente solicita tool X               │
│    (parámetros: {...})                  │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ 2. MCP Handler recibe solicitud         │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ 3. Validar parámetros contra schema     │
│    ✗ Si invalido → error 400            │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ 4. Validar permisos (READ_ONLY, etc)    │
│    ✗ Si bloqueado → error 403           │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ 5. ¿Es operación crítica/destructiva?   │
│    ✓ Si → requerir confirmación         │
│    ✗ Si → proceder                      │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ 6. Ejecutar contra Coolify API          │
│    - Log de inicio                      │
│    - Reintentos automáticos             │
│    - Respeto a rate limits              │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ 7. Procesar respuesta                   │
│    - Validar status HTTP                │
│    - Extraer datos relevantes           │
│    - Log de resultado                   │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ 8. Retornar al agente                   │
│    (resultado o error)                  │
└─────────────────────────────────────────┘
```

### 4.3 Modo READ_ONLY

Cuando `READ_ONLY=true`:

- ✓ Permitir: GET, HEAD, validaciones, consultas
- ✗ Bloquear: POST, PATCH, DELETE, start/stop/restart, despliegues
- Respuesta: Error 403 con mensaje claro

**Ejemplo:**
```json
{
  "error": "FORBIDDEN",
  "message": "Operación bloqueada en modo READ_ONLY",
  "tool": "create_application_public",
  "hint": "Desactiva READ_ONLY en .env si necesitas permisos de escritura"
}
```

### 4.4 Operaciones Críticas que Requieren Confirmación

Las siguientes operaciones DEBEN requerir confirmación explícita del agente:

**Operaciones DELETE (irreversibles):**
- `delete_project`
- `delete_application`
- `delete_environment`
- `delete_database`
- `delete_service`
- `delete_server`
- `delete_private_key`
- `delete_github_app`
- `delete_cloud_token`

**Cambios destructivos:**
- `cancel_deployment`
- `stop_application`, `stop_database`, `stop_service`

**Creaciones en producción:**
- `trigger_deployment` (especialmente en producción)
- `create_hetzner_server` (costo financiero)

**Gestión de secretos:**
- `create_private_key`
- `create_cloud_token`
- `create_application_environment_variable` (si es secreto)

**Formato de confirmación:**

El servidor debe enviar al agente:

```json
{
  "confirmationRequired": true,
  "operation": "delete_application",
  "message": "¿Estás seguro de que deseas eliminar la aplicación 'api-backend' de PRODUCCIÓN? Esta acción es irreversible.",
  "details": {
    "application_uuid": "app-123",
    "application_name": "api-backend",
    "environment": "production",
    "has_active_deployment": true
  }
}
```

El agente DEBE responder explícitamente:
```json
{
  "confirmed": true,
  "confirmationToken": "..."
}
```

---

## 5. Seguridad

### 5.1 Autenticación

- El token de Coolify está en `.env`, nunca se expone
- MCP no añade autenticación adicional (el token de Coolify es la autenticación)
- El servidor valida el token al iniciar

### 5.2 Autorización

- El servidor respeta los permisos del token Coolify
- Si el token no tiene permiso para una operación, Coolify rechazará
- El servidor advertirá si detecta permisos insuficientes

### 5.3 Modo READ_ONLY

- Cuando `READ_ONLY=true`, todas las operaciones de modificación se bloquean
- No hay bypass parcial (es todo o nada)
- El servidor rechaza inmediatamente sin intentar contactar Coolify

### 5.4 Logging Seguro

**Qué DEBE registrarse:**
- Método, endpoint, parámetros (sin valores sensibles)
- Timestamp, durabilidad, código HTTP
- UUID de recursos afectados
- Errores y stack traces (para debugging)

**Qué NO DEBE registrarse NUNCA:**
- Token Bearer de Coolify
- Valores completos de variables de entorno
- Contraseñas o API keys
- Contenido de claves privadas SSH
- Datos sensibles de usuarios

**Ejemplo de log seguro:**
```json
{
  "timestamp": "2024-05-11T10:30:45.123Z",
  "operation": "create_application_public",
  "method": "POST",
  "endpoint": "/applications/public",
  "params": {
    "name": "new-app",
    "project_uuid": "proj-123",
    "server_uuid": "srv-456",
    "git_repository": "https://github.com/..."
  },
  "status": 201,
  "duration_ms": 3450,
  "deployment_uuid": "deploy-789"
}
```

---

## 6. Gestión de Errores

### 6.1 Códigos de Error HTTP Mapeados

| Código | Significado | Acción MCP |
|--------|-------------|-----------|
| `2xx` | Éxito | Procesar y retornar resultado |
| `400` | Petición malformada | Log, retornar error al agente |
| `401` | Autenticación fallida | Log de advertencia, retornar error |
| `403` | Prohibido (permisos) | Advertir en logs, retornar error |
| `404` | No encontrado | Retornar error específico |
| `422` | Validación fallida | Log detallado de errores de campo |
| `429` | Rate limited | Reintentar con backoff |
| `500+` | Error servidor | Reintentar, si persiste retornar error |

### 6.2 Reintentos Automáticos

**Configuración:**
- Máximo reintentos: `COOLIFY_MAX_RETRIES` (default: 3)
- Fallos retryables: 429, 500, 502, 503, 504
- Fallos no-retryables: 400, 401, 403, 404, 422

**Estrategia de Backoff:**
```
Intento 1: Inmediato
Intento 2: 2 segundos (2^1)
Intento 3: 4 segundos (2^2)
Intento 4: 8 segundos (2^3)
+ Jitter aleatorio (0-1s)
```

**Ejemplo en logs:**
```
[10:30:45] INFO: Iniciando POST /applications
[10:30:46] WARN: Intento 1 falló: 503 Service Unavailable
[10:30:46] INFO: Reintentando en 2s (intento 2/3)
[10:30:48] WARN: Intento 2 falló: 503 Service Unavailable
[10:30:48] INFO: Reintentando en 4s (intento 3/3)
[10:30:52] INFO: Intento 3 exitoso: 201 Created
```

### 6.3 Respuesta de Error Estándar

El servidor DEBE retornar errores en este formato:

```json
{
  "error": "ERROR_CODE",
  "message": "Descripción legible del error",
  "details": {
    "http_status": 404,
    "coolify_endpoint": "/applications/invalid-uuid",
    "request_id": "req-abc123"
  },
  "hint": "Sugerencia de cómo resolverlo"
}
```

**Ejemplo:**
```json
{
  "error": "APPLICATION_NOT_FOUND",
  "message": "La aplicación con UUID 'app-invalid' no existe",
  "details": {
    "http_status": 404,
    "coolify_endpoint": "/applications/app-invalid",
    "team_uuid": "team-123"
  },
  "hint": "Verifica el UUID con list_applications"
}
```

---

## 7. Logging and Observability Architecture

> **Principio fundamental:** El logging debe ser un contrato operacional observable explícito. Habilitar un nivel de verbosidad debe producir un aumento real y verificable en información diagnóstica, sin comprometer la seguridad ni generar ruido innecesario.

### 7.1 Decisiones Técnicas Fijas

El MCP Coolify **debe usar** la siguiente arquitectura de logging:

- **Servidor**: Pino para logging estructurado
- **Contrato compartido**: Interfaz TypeScript única para toda la aplicación
- **Prohibición de console**: No se permite `console.*` directo en código de aplicación
- **Sanitización centralizada**: Función única `sanitizeForLog()` para redacción automática
- **Métodos del logger**: `trace`, `debug`, `info`, `warn`, `error`, `fatal`

El método `fatal` DEBE existir en el contrato compartido. En el servidor mapea a Pino fatal logging.

### 7.2 Estructura de Carpetas Requerida

```
src/
├── lib/
│   └── logging/
│       ├── types.ts              # Tipos compartidos y contrato logger
│       ├── events.ts             # Nombres de eventos estables
│       ├── sanitize.ts           # Redacción automática de secretos
│       └── levels.ts             # Definiciones de niveles
│
└── server/
    └── logging/
        ├── logger.server.ts      # Implementación con Pino
        ├── formatters.ts         # Formateo humano y JSON Lines
        ├── file-transports.ts    # Transporte a .logs/
        └── bootstrap.ts          # Inicialización del logger
```

### 7.3 Contrato Compartido del Logger

```typescript
// src/lib/logging/types.ts

export interface LoggerContract {
  trace(eventName: string, context?: Record<string, any>, message?: string): void;
  debug(eventName: string, context?: Record<string, any>, message?: string): void;
  info(eventName: string, context?: Record<string, any>, message?: string): void;
  warn(eventName: string, context?: Record<string, any>, message?: string): void;
  error(eventName: string, context?: Record<string, any>, message?: string): void;
  fatal(eventName: string, context?: Record<string, any>, message?: string): void;
}

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  timestamp: string;                 // ISO 8601 UTC
  localTime: string;                 // 18/04/2026 14:32:10 Madrid
  timezone: string;                  // "Europe/Madrid"
  level: LogLevel;
  eventName: string;
  message?: string;
  context?: Record<string, any>;
  requestId?: string;
  duration?: number;
}
```

**Patrón de uso recomendado:**

```typescript
logger.info('operation.completed', {
  operation: 'restart_application',
  requestId: 'req-123',
  durationMs: 2500,
  result: 'success',
  applicationUuid: 'app-456'
});
```

**Evitar:**

```typescript
logger.info('Algo completado');
logger.debug('Info de debug');
logger.error('Error'); // Sin contexto
```

### 7.4 Convención de Nombres de Eventos Estables

Los nombres de eventos DEBEN usar notación dot-separated:

**Bootstrap:**
- `app.bootstrap.started`
- `app.bootstrap.config_loaded`
- `app.bootstrap.token_validated`
- `app.bootstrap.logger_initialized`
- `app.bootstrap.completed`
- `app.bootstrap.failed`

**MCP Tools:**
- `mcp.tool.invoked` — Tool solicitado por agente
- `mcp.tool.parameters_validated` — Parámetros validados
- `mcp.tool.access_denied` — Bloqueado por READ_ONLY o permisos
- `mcp.tool.confirmation_required` — Operación crítica requiere confirmación
- `mcp.tool.confirmed` — Confirmación recibida
- `mcp.tool.started` — Ejecución iniciada
- `mcp.tool.completed` — Completado exitosamente
- `mcp.tool.failed` — Falló

**Coolify API Calls:**
- `coolify.request.started` — Request a Coolify iniciado
- `coolify.request.completed` — Response recibida
- `coolify.request.failed` — Falló
- `coolify.request.retry` — Reintentando
- `coolify.rate_limit.hit` — Rate limit alcanzado
- `coolify.auth.failed` — Token inválido/expirado

**Validation & Authorization:**
- `validation.failed` — Parámetros inválidos
- `auth.failed` — Autenticación falló
- `authorization.failed` — Permiso insuficiente
- `read_only.blocked_operation` — Operación bloqueada por READ_ONLY

**Confirmations:**
- `operation.confirmation.requested` — Esperando confirmación
- `operation.confirmation.timeout` — Timeout de confirmación
- `operation.confirmed` — Confirmado
- `operation.cancelled_by_user` — Usuario canceló

**Shutdown:**
- `app.shutdown.started`
- `app.shutdown.completed`
- `app.shutdown.failed`

**Fatal:**
- `fatal.bootstrap_failed`
- `fatal.unhandled_exception`
- `fatal.token_invalid`

### 7.5 Niveles de Log y Significado Observable

| Nivel | Significado | Observable | Frecuencia Prod |
|-------|-------------|-----------|-----------------|
| `trace` | Diagnóstico extremadamente detallado | Decisiones internas, estado intermedio, interacciones | Nunca |
| `debug` | Traces útiles para flujos principales | Entrada/salida de operaciones, puntos de decisión | Nunca (salvo troubleshooting) |
| `info` | Eventos operacionales importantes | Bootstrap, herramientas invocadas, operaciones completadas | Frecuente |
| `warn` | Situaciones anómalas no-fatales | Reintentos, permisos insuficientes, cambios destructivos | Ocasional |
| `error` | Fallos operacionales reales | Errores de Coolify, excepciones no-controladas | Raro |
| `fatal` | Errores irrecuperables | Bootstrap fallido, excepciones no-capturadas | Nunca (si ocurre, proceso termina) |

**Validación observable obligatoria:**

- ✓ Con `trace`: Más detalles que `debug`
- ✓ Con `debug`: Logs útiles adicionales en flujos principales
- ✓ Con `info`: `debug` y `trace` no aparecen
- ✓ Con `warn`: `info`, `debug`, `trace` no aparecen
- ✓ Con `error`: Solo `error` y `fatal`
- ✓ Con `fatal`: Solo eventos irrecuperables

### 7.6 Configuración de Variables de Entorno

```bash
# Log level servidor (trace|debug|info|warn|error|fatal, default: info)
LOG_LEVEL=info

# Directorio para logs de desarrollo (default: .logs)
LOG_DIR=.logs

# Habilitar archivos de desarrollo .logs/app.log y .logs/app.jsonl (default: true en dev, false en prod)
LOG_TO_FILES=true

# Timezone para timestamps humanables (default: Europe/Madrid)
LOG_TIMEZONE=Europe/Madrid
```

**Defaults por ambiente:**

```
Desarrollo:
  LOG_LEVEL=debug
  LOG_TO_FILES=true
  
Producción:
  LOG_LEVEL=info
  LOG_TO_FILES=false
  
Testing:
  LOG_LEVEL=error
  LOG_TO_FILES=false
```

### 7.7 Sanitización y Redacción Automática

**Campos que se redactan automáticamente:**

```typescript
const SENSITIVE_KEYS = [
  'password', 'passwd', 'pwd',
  'secret',
  'token', 'access_token', 'refresh_token', 'id_token',
  'api_key', 'apikey',
  'authorization',
  'cookie', 'set-cookie',
  'session', 'sessionid',
  'csrf',
  'client_secret',
  'private_key',
  'coolify_token',
  'coolify_base_url'  // Puede ser sensible si contiene credenciales
];

// Redacción con valor consistente
const REDACTED = '[REDACTED]';
```

**Función `sanitizeForLog()`:**

```typescript
// src/lib/logging/sanitize.ts

export function sanitizeForLog(value: unknown): unknown {
  // Maneja: objetos planos, objetos anidados, arrays, errores
  // Busca todas las claves sensibles y las reemplaza con [REDACTED]
  // No modifica el original
}

// Ejemplo:
logger.debug('coolify.request.started', 
  sanitizeForLog({
    endpoint: '/applications',
    token: 'secret-token-123',
    userId: 'user-456'
  })
);

// Log real: { endpoint: '/applications', token: '[REDACTED]', userId: 'user-456' }
```

**Garantía de seguridad:**

- ✓ Campos en objetos planos redactados
- ✓ Campos en objetos anidados redactados
- ✓ Campos en arrays redactados
- ✓ Errores serializados y redactados
- ✓ Incluso en logs `trace` y `debug`

### 7.8 Formato de Timestamps

**Desarrollo (humano):**
```
18/04/2026 14:32:10
```

**Máquina (JSON):**
```json
{
  "timestamp": "2026-04-18T12:32:10.000Z",
  "localTime": "18/04/2026 14:32:10",
  "timezone": "Europe/Madrid"
}
```

**Librería recomendada**: `date-fns` con `zonedTimeToUtc` y formatting

### 7.9 Archivos de Desarrollo

En desarrollo local (`LOG_TO_FILES=true`):

```
.logs/
├── app.log           # Humano-legible, truncado al iniciar
└── app.jsonl         # JSON Lines, truncado al iniciar
```

**`.logs/app.log` (humanable):**
```
18/04/2026 14:32:10  [INFO]  app.bootstrap.started: Iniciando MCP Coolify
18/04/2026 14:32:10  [DEBUG] app.bootstrap.config_loaded: { environment: 'development', readOnly: false }
18/04/2026 14:32:11  [INFO]  app.bootstrap.token_validated: Token válido, Coolify v4.0.0
18/04/2026 14:32:11  [INFO]  app.bootstrap.completed: MCP Coolify listo
18/04/2026 14:35:30  [INFO]  mcp.tool.invoked: { tool: 'get_version', requestId: 'req-abc123' }
18/04/2026 14:35:30  [DEBUG] mcp.tool.parameters_validated: Parámetros OK
18/04/2026 14:35:30  [DEBUG] coolify.request.started: { endpoint: '/version', method: 'GET' }
18/04/2026 14:35:31  [INFO]  coolify.request.completed: { status: 200, durationMs: 543 }
18/04/2026 14:35:31  [INFO]  mcp.tool.completed: { tool: 'get_version', durationMs: 601 }
```

**`.logs/app.jsonl` (JSON Lines):**
```json
{"timestamp":"2026-04-18T12:32:10.000Z","localTime":"18/04/2026 14:32:10","timezone":"Europe/Madrid","level":"info","eventName":"app.bootstrap.started","message":"Iniciando MCP Coolify"}
{"timestamp":"2026-04-18T12:32:10.123Z","localTime":"18/04/2026 14:32:10","timezone":"Europe/Madrid","level":"debug","eventName":"app.bootstrap.config_loaded","context":{"environment":"development","readOnly":false,"logLevel":"debug"}}
{"timestamp":"2026-04-18T12:32:11.456Z","localTime":"18/04/2026 14:32:11","timezone":"Europe/Madrid","level":"info","eventName":"app.bootstrap.token_validated","context":{"coolifyVersion":"4.0.0","team":"default"}}
{"timestamp":"2026-04-18T12:32:11.789Z","localTime":"18/04/2026 14:32:11","timezone":"Europe/Madrid","level":"info","eventName":"app.bootstrap.completed","context":{"uptime":"1123ms"}}
{"timestamp":"2026-04-18T12:35:30.123Z","localTime":"18/04/2026 14:35:30","timezone":"Europe/Madrid","level":"info","eventName":"mcp.tool.invoked","context":{"tool":"get_version","requestId":"req-abc123"}}
{"timestamp":"2026-04-18T12:35:30.234Z","localTime":"18/04/2026 14:35:30","timezone":"Europe/Madrid","level":"debug","eventName":"mcp.tool.parameters_validated","context":{"tool":"get_version","paramCount":0}}
{"timestamp":"2026-04-18T12:35:30.345Z","localTime":"18/04/2026 14:35:30","timezone":"Europe/Madrid","level":"debug","eventName":"coolify.request.started","context":{"endpoint":"/version","method":"GET","requestId":"req-abc123"}}
{"timestamp":"2026-04-18T12:35:31.012Z","localTime":"18/04/2026 14:35:31","timezone":"Europe/Madrid","level":"info","eventName":"coolify.request.completed","context":{"status":200,"durationMs":667,"requestId":"req-abc123"}}
{"timestamp":"2026-04-18T12:35:31.089Z","localTime":"18/04/2026 14:35:31","timezone":"Europe/Madrid","level":"info","eventName":"mcp.tool.completed","context":{"tool":"get_version","durationMs":966,"requestId":"req-abc123","result":"success"}}
```

**Gestión de archivos:**

- Truncar/sobrescribir al iniciar el servidor
- No rotar (desarrollo es efímero)
- Añadir a `.gitignore`

### 7.10 Request IDs y Correlación

Cada solicitud de herramienta debe tener un ID único:

```typescript
// Al recibir tool invocation
const requestId = generateRequestId(); // uuid v4 o similar
context.requestId = requestId;

// Incluir en todos los logs relacionados
logger.info('mcp.tool.invoked', {
  tool: 'restart_application',
  requestId: requestId
});

logger.debug('coolify.request.started', {
  endpoint: '/applications/app-123/restart',
  requestId: requestId
});

// Al completar
logger.info('mcp.tool.completed', {
  tool: 'restart_application',
  requestId: requestId,
  durationMs: 2500
});
```

### 7.11 Instrumentación Mínima Requerida

#### 7.11.1 Bootstrap

Logs obligatorios al iniciar:

```typescript
logger.info('app.bootstrap.started', {
  version: '1.0.0',
  nodeVersion: process.version,
  environment: process.env.NODE_ENV
});

logger.debug('app.bootstrap.config_loaded', sanitizeForLog({
  coolifyBaseUrl: process.env.COOLIFY_BASE_URL,
  logLevel: process.env.LOG_LEVEL,
  readOnly: process.env.READ_ONLY === 'true',
  requestTimeout: process.env.COOLIFY_REQUEST_TIMEOUT
}));

// Validar token
try {
  await validateToken();
  logger.info('app.bootstrap.token_validated', {
    coolifyVersion: version
  });
} catch (error) {
  logger.fatal('app.bootstrap.token_validation_failed', 
    sanitizeForLog({
      error: error.message
    })
  );
  process.exit(1);
}

logger.info('app.bootstrap.completed', {
  uptime: Date.now() - startTime
});
```

#### 7.11.2 Invocación de Herramientas

```typescript
logger.info('mcp.tool.invoked', {
  tool: toolName,
  requestId: requestId
});

logger.debug('mcp.tool.parameters_validated', {
  tool: toolName,
  parameterCount: Object.keys(params).length,
  requestId: requestId
});

if (requiresConfirmation) {
  logger.info('mcp.tool.confirmation_required', {
    tool: toolName,
    requestId: requestId,
    operation: 'delete_application'
  });
}

try {
  // Ejecutar tool...
  logger.info('mcp.tool.completed', {
    tool: toolName,
    requestId: requestId,
    durationMs: elapsed,
    result: 'success'
  });
} catch (error) {
  logger.error('mcp.tool.failed', sanitizeForLog({
    tool: toolName,
    requestId: requestId,
    durationMs: elapsed,
    error: error.message,
    errorCode: error.code
  }));
}
```

#### 7.11.3 Llamadas a Coolify API

```typescript
logger.debug('coolify.request.started', {
  endpoint: path,
  method: method,
  requestId: requestId
});

try {
  const response = await coolifyClient.request(method, path, data);
  
  logger.debug('coolify.request.completed', {
    endpoint: path,
    status: response.status,
    durationMs: elapsed,
    requestId: requestId
  });
  
  return response;
} catch (error) {
  if (error.status === 429) {
    logger.warn('coolify.rate_limit.hit', {
      endpoint: path,
      retryAfter: error.headers['retry-after'],
      requestId: requestId
    });
  } else {
    logger.error('coolify.request.failed', sanitizeForLog({
      endpoint: path,
      status: error.status,
      durationMs: elapsed,
      error: error.message,
      requestId: requestId
    }));
  }
  throw error;
}
```

#### 7.11.4 Validación y Autorización

```typescript
if (!isValidParam(uuid)) {
  logger.debug('validation.failed', {
    field: 'uuid',
    reason: 'invalid_format',
    tool: toolName,
    requestId: requestId
  });
  throw new ValidationError('Invalid UUID');
}

if (isReadOnly && isDestructiveOperation(tool)) {
  logger.warn('read_only.blocked_operation', {
    tool: toolName,
    operation: 'delete',
    requestId: requestId
  });
  throw new ForbiddenError('Operation blocked in READ_ONLY mode');
}
```

#### 7.11.5 Confirmaciones

```typescript
logger.info('operation.confirmation.requested', {
  operation: 'delete_application',
  resourceId: 'app-123',
  requestId: requestId
});

// Esperar confirmación...

if (confirmed) {
  logger.info('operation.confirmed', {
    operation: 'delete_application',
    requestId: requestId
  });
} else {
  logger.warn('operation.cancelled_by_user', {
    operation: 'delete_application',
    requestId: requestId,
    timeoutMs: 5000
  });
}
```

### 7.12 Prohibición de console.*

**NO permitir en código de aplicación:**

```typescript
// ❌ PROHIBIDO
console.log('algo');
console.error('error');
console.debug('debug');
```

**Permitido SOLO en:**

```typescript
// ✓ OK
src/lib/logging/logger.server.ts
src/lib/logging/formatters.ts
scripts/**
test utilities (con justificación)
```

**Enforcement:**

ESLint rule:
```javascript
// .eslintrc.js
{
  rules: {
    'no-console': ['error', {
      allow: []  // Ningún console permitido
    }]
  },
  overrides: [
    {
      files: ['src/lib/logging/**', 'scripts/**'],
      rules: {
        'no-console': 'off'
      }
    }
  ]
}
```

### 7.13 Criterios de Aceptancia Operacionales

1. ✓ Con `LOG_LEVEL=debug`, bootstrap emite al menos un evento debug con configuración no-sensible
2. ✓ Con `LOG_LEVEL=debug`, al menos una herramienta principal emite logs debug en inicio/ejecución/finalización
3. ✓ Con `LOG_LEVEL=info`, no aparecen mensajes `debug` ni `trace`
4. ✓ Con `LOG_LEVEL=error`, no aparecen `debug`, `info`, `warn`
5. ✓ Con `LOG_LEVEL=trace`, hay más detalles que con `debug`
6. ✓ En desarrollo, `.logs/app.log` se crea y contiene logs humanables
7. ✓ En desarrollo, `.logs/app.jsonl` se crea y contiene JSON Lines
8. ✓ Ambos archivos se truncan al iniciar
9. ✓ `.logs/` está en `.gitignore`
10. ✓ Timestamps humanables: `18/04/2026 14:32:10`
11. ✓ Timestamps JSON incluyen `time`, `localTime`, `timezone`
12. ✓ Passwords, tokens, keys se redactan automáticamente
13. ✓ ESLint rechaza `console.*` en código de aplicación
14. ✓ Logs de request incluyen o propagan `requestId`
15. ✓ Comportamiento validado en desarrollo y en build/runtime

### 7.14 Anti-patterns a Evitar

- ❌ `LOG_LEVEL=debug` existe pero no hay logs debug reales
- ❌ Todo se loguea como `info`
- ❌ Solo bootstrap está instrumentado
- ❌ Logs vagos sin contexto ("Falló", "Error")
- ❌ Logs verbosos sin estructura
- ❌ Logs `debug` exponen secretos
- ❌ Timestamps no-legibles en desarrollo
- ❌ `console.*` directo en código
- ❌ Desarrollo validado pero build no
- ❌ Request sin correlación ID

---

---

## 8. Especificación de Tools

### 8.1 Estructura de Definición de Tool

Cada tool en el MCP debe definirse como:

```typescript
{
  name: "get_application_logs",
  description: "Obtiene los logs recientes de una aplicación. Útil para diagnosticar errores.",
  inputSchema: {
    type: "object",
    properties: {
      uuid: {
        type: "string",
        description: "UUID de la aplicación"
      },
      lines: {
        type: "integer",
        description: "Número de líneas (default: 100)",
        default: 100
      }
    },
    required: ["uuid"]
  },
  category: "Applications",
  readOnlyCompatible: true,
  requiresConfirmation: false,
  criticalOperation: false
}
```

### 8.2 Categorías de Tools

Ver documento `specifications.md` para la lista completa de ~107 tools organizados por:

1. **Default** (4 tools): Versión, health, enable/disable API
2. **Teams** (4 tools): Información de equipos
3. **Projects** (9 tools): Gestión de proyectos
4. **Applications** (19 tools): Aplicaciones
5. **Deployments** (5 tools): Despliegues
6. **Databases** (21 tools): Bases de datos y backups
7. **Services** (13 tools): Servicios one-click
8. **Servers** (8 tools): Servidores
9. **Resources** (1 tool): Recursos globales
10. **Private Keys** (5 tools): Claves SSH
11. **GitHub Apps** (7 tools): Integraciones GitHub
12. **Cloud Tokens** (6 tools): Tokens de proveedores cloud
13. **Hetzner** (5 tools): Específico de Hetzner

### 8.3 Prioridad de Implementación

**Fase 1 (MVP):**
- Default (all)
- Teams (all)
- Projects (list, get, create)
- Applications (list, get, logs, start/stop/restart)
- Deployments (list, get, trigger, cancel)
- Servers (list, get, validate, resources)

**Fase 2:**
- Databases (lectura)
- Services (lectura)
- GitHub Apps (lectura)

**Fase 3 (Completo):**
- Resto de tools

---

## 9. Esquemas de Datos

### 9.1 Tipos Comunes

```typescript
// UUID v4
type UUID = string; // Validar formato

// Timestamp ISO 8601
type Timestamp = string; // "2024-05-11T10:30:45.123Z"

// URL
type URL = string; // Validar con new URL()

// EnvVar
interface EnvironmentVariable {
  uuid: UUID;
  key: string;
  value: string;
  is_build_time: boolean;
  is_preview: boolean;
  created_at: Timestamp;
}

// Application
interface Application {
  uuid: UUID;
  name: string;
  project_uuid: UUID;
  environment_name: string;
  fqdn: URL;
  git_repository: URL;
  git_branch: string;
  status: "running" | "stopped" | "deploying" | "error";
  created_at: Timestamp;
  updated_at: Timestamp;
}

// Deployment
interface Deployment {
  uuid: UUID;
  application_uuid: UUID;
  status: "queued" | "in-progress" | "completed" | "failed" | "cancelled";
  commit_sha: string;
  branch: string;
  pull_request_id?: number;
  created_at: Timestamp;
  finished_at?: Timestamp;
}

// Database
interface Database {
  uuid: UUID;
  name: string;
  type: "postgresql" | "mysql" | "mariadb" | "mongodb" | "redis" | "dragonfly" | "keydb" | "clickhouse";
  status: "running" | "stopped" | "initializing" | "error";
  created_at: Timestamp;
  updated_at: Timestamp;
}

// Server
interface Server {
  uuid: UUID;
  name: string;
  ip: string;
  port: number;
  status: "connected" | "disconnected" | "validating";
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

---

## 10. Ejemplos de Uso

### 10.1 Consultar Logs de una Aplicación

```
Agente → MCP: 
  Tool: get_application_logs
  Parámetros: {
    "uuid": "app-123",
    "lines": 50
  }

MCP → Coolify:
  GET /applications/app-123/logs?lines=50
  Authorization: Bearer TOKEN

Coolify → MCP:
  HTTP 200
  {
    "logs": [
      "[2024-05-11 10:30:15] INFO: Server started",
      "[2024-05-11 10:30:16] INFO: Database connected",
      ...
    ]
  }

MCP → Agente:
  {
    "logs": [
      "[2024-05-11 10:30:15] INFO: Server started",
      "[2024-05-11 10:30:16] INFO: Database connected",
      ...
    ]
  }

Log local:
  [10:35:00] INFO: get_application_logs completado (app-123, 50 líneas, 234ms)
```

### 10.2 Reiniciar una Aplicación

```
Agente → MCP:
  Tool: restart_application
  Parámetros: {
    "uuid": "app-123"
  }

MCP (interno):
  1. Validar parámetros ✓
  2. Verificar permisos (READ_ONLY=false) ✓
  3. Detectar operación crítica → Requerir confirmación

MCP → Agente:
  {
    "confirmationRequired": true,
    "message": "¿Reiniciar aplicación 'api-backend' en PRODUCCIÓN?",
    "details": {...}
  }

Agente → MCP:
  {
    "confirmed": true,
    "confirmationToken": "..."
  }

MCP (interno):
  4. Ejecutar contra Coolify

MCP → Coolify:
  GET /applications/app-123/restart
  Authorization: Bearer TOKEN

Coolify → MCP:
  HTTP 200
  {"message": "Application restarted successfully"}

MCP → Agente:
  {
    "status": "success",
    "message": "Aplicación reiniciada correctamente"
  }

Log local:
  [10:40:00] INFO: restart_application iniciado (app-123)
  [10:40:00] INFO: Requerida confirmación (operación crítica)
  [10:40:05] INFO: Confirmación recibida
  [10:40:07] INFO: restart_application completado (200 OK, 2000ms)
```

### 10.3 Modo READ_ONLY Bloqueando Escritura

```
READ_ONLY=true

Agente → MCP:
  Tool: create_application_public
  Parámetros: {
    "project_uuid": "proj-123",
    ...
  }

MCP (interno):
  1. Validar parámetros ✓
  2. Verificar permisos (READ_ONLY=true) ✗

MCP → Agente:
  {
    "error": "FORBIDDEN",
    "message": "Operación bloqueada en modo READ_ONLY",
    "tool": "create_application_public",
    "hint": "Desactiva READ_ONLY en .env si necesitas permisos de escritura"
  }

Log local:
  [10:45:00] WARN: create_application_public bloqueado por READ_ONLY
```

---

## 11. Testing

### 11.1 Estrategia de Testing

**Unit Tests:**
- Cada tool tiene tests individuales
- Mock de Coolify API
- Validación de parámetros

**Integration Tests:**
- Tests contra Coolify API (staging)
- Validación de flujos completos
- Manejo de errores

**Load Testing:**
- Validar comportamiento bajo carga
- Rate limiting
- Reintentos

### 11.2 Casos de Test Críticos

1. Token inválido → Error 401
2. Recurso no existe → Error 404
3. Permisos insuficientes → Error 403
4. READ_ONLY bloqueando escritura → Error 403
5. Confirmación requerida → Flow correcto
6. Reintentos automáticos → Funciona correctamente
7. Logging completo → Registra todo sin secretos

---

## 12. Deployment

### 12.1 Requerimientos

- Node.js 18+
- npm/pnpm para instalar dependencias
- Acceso a Internet para contactar Coolify
- Archivo `.env` configurado

### 12.2 Instalación

```bash
# Clonar/descargar proyecto
cd coolify-mcp

# Instalar dependencias
npm install

# Copiar plantilla de .env
cp .env.example .env

# Editar .env con credenciales reales
# COOLIFY_BASE_URL=...
# COOLIFY_TOKEN=...

# Iniciar servidor
npm start
```

### 12.3 Conexión con Claude Code

```bash
# En Claude Code CLI, configurar el MCP
claude config add mcp coolify-mcp

# O directamente en configuración MCP
# {
#   "mcpServers": {
#     "coolify": {
#       "command": "node",
#       "args": ["/ruta/a/coolify-mcp/dist/index.js"]
#     }
#   }
# }
```

---

## 13. Monitoreo y Mantenimiento

### 13.1 Health Checks

El servidor debe responder a `/health` (si implementa HTTP):

```json
{
  "status": "ok",
  "uptime_ms": 3600000,
  "tools_registered": 107,
  "coolify_status": "connected",
  "read_only_mode": false
}
```

### 13.2 Métricas

Recolectar y monitorear:
- Uptime del servidor
- Número de tools ejecutados (por categoría)
- Latencia P50/P95/P99 por tool
- Tasa de errores por tool
- Tasa de reintentos
- Rate limits golpeados

### 13.3 Alertas

Alertar si:
- Servidor no arranca (validación de .env fallida)
- Token inválido/expirado
- Coolify API no disponible
- Tasa de errores > 5% en última hora
- Logs creciendo excesivamente

---

## 14. Versioning y Changelog

### 14.1 Versionado Semántico

- MAJOR: Cambios incompatibles (cambio en protocolo MCP, tools removidos)
- MINOR: Nuevas funcionalidades (nuevos tools, features)
- PATCH: Bugfixes, mejoras internas

### 14.2 Changelog

Mantener `CHANGELOG.md` con:
```
## [1.0.0] - 2024-05-11

### Added
- Tools para Coolify API v4
- Modo READ_ONLY
- Confirmación de operaciones críticas
- Logging completo y auditoría

### Changed
- N/A (primer release)

### Fixed
- N/A (primer release)
```

---

## 15. Documento de Decisiones Arquitectónicas (ADRs)

### ADR-001: Por qué Modo READ_ONLY en lugar de Permisos Granulares

**Contexto**: ¿Debería el MCP permitir permisos granulares (read-only por tool) o un modo global?

**Decisión**: Modo READ_ONLY global.

**Razones**:
- Simplicidad: Fácil de entender y configurar
- Seguridad: Protección completa en modo auditoría
- Mantenibilidad: Menos complejidad en el código

**Consecuencias**: Si necesita lectura parcial, debe usar dos servidores MCP con tokens diferentes.

---

### ADR-002: Por qué Confirmación de Operaciones Críticas

**Contexto**: ¿Requieren confirmación explícita las operaciones peligrosas?

**Decisión**: Sí.

**Razones**:
- Prevención de cambios accidentales
- El agente puede ser "impaciente" sin supervisión
- Reversibilidad en la mayoría de casos

**Consecuencias**: Algunas automatizaciones requieren interacción. Es un trade-off aceptable.

---

## 16. Roadmap Futuro

**Corto plazo (v1.1):**
- [ ] Webhook listeners (notificaciones desde Coolify)
- [ ] Caché de datos no-sensibles
- [ ] CLI para testing local

**Medio plazo (v1.5):**
- [ ] Permisos granulares (READ_ONLY por categoría)
- [ ] Exportación de logs a servicios externos
- [ ] Historial en SQLite local

**Largo plazo (v2.0):**
- [ ] Soporte para múltiples instancias de Coolify
- [ ] Transformaciones de datos personalizadas
- [ ] Dashboard de monitoreo

---

## 17. Apéndices

### A. Glosario

- **MCP**: Model Context Protocol - protocolo para comunicación entre agentes de IA y sistemas
- **Tool**: Herramienta expuesta por el MCP que el agente puede invocar
- **Token Bearer**: Credencial para autenticación HTTP
- **READ_ONLY**: Modo que bloquea todas las operaciones de modificación
- **Backoff**: Espera progresiva entre reintentos
- **Rate Limit**: Límite de requests en un período de tiempo

### B. Referencias

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Coolify API Reference](https://coolify.io/docs/api-reference)
- [Anthropic SDK](https://github.com/anthropics/anthropic-sdk-python)

### C. Contactos

**Preguntas sobre este spec:**
- Revisar `constitution.md` para visión
- Revisar `specifications.md` para detalles de tools
- Crear issue en GitHub para propuestas

---

**Fin del documento especificación técnica v1.0.0**
