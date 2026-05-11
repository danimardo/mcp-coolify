# MCP Coolify - Stable Logging Events Reference

Este documento define todos los nombres de eventos estables que el MCP Coolify DEBE emitir durante su operación. Los eventos están organizados por categoría y deben usarse de forma consistente en toda la aplicación.

---

## 1. Bootstrap Events

Eventos emitidos durante la inicialización del servidor.

### `app.bootstrap.started`
- **Nivel**: `info`
- **Cuándo**: Al iniciar el proceso
- **Contexto recomendado**: `version`, `nodeVersion`, `environment`, `pid`
- **Ejemplo**:
```json
{
  "version": "1.0.0",
  "nodeVersion": "v18.16.0",
  "environment": "development",
  "pid": 12345
}
```

### `app.bootstrap.config_loaded`
- **Nivel**: `debug`
- **Cuándo**: Después de leer y parsear `.env`
- **Contexto recomendado**: `logLevel`, `readOnly`, `requestTimeout` (NO incluir URLs o tokens)
- **Ejemplo**:
```json
{
  "logLevel": "debug",
  "readOnly": false,
  "requestTimeout": 30000,
  "logToFiles": true,
  "environment": "development"
}
```

### `app.bootstrap.token_validated`
- **Nivel**: `info`
- **Cuándo**: Token de Coolify validado exitosamente
- **Contexto recomendado**: `coolifyVersion`, `team`
- **Ejemplo**:
```json
{
  "coolifyVersion": "4.0.0",
  "team": "default-team"
}
```

### `app.bootstrap.logger_initialized`
- **Nivel**: `debug`
- **Cuándo**: Logger configurado y listo
- **Contexto recomendado**: `logLevel`, `format`, `toFiles`
- **Ejemplo**:
```json
{
  "logLevel": "debug",
  "format": "structured",
  "toFiles": true,
  "fileLocation": ".logs"
}
```

### `app.bootstrap.completed`
- **Nivel**: `info`
- **Cuándo**: Bootstrap completado exitosamente
- **Contexto recomendado**: `uptime` (ms), `toolsRegistered`
- **Ejemplo**:
```json
{
  "uptime": 1523,
  "toolsRegistered": 107,
  "readyMessage": "MCP Coolify ready, listening on stdio"
}
```

### `app.bootstrap.failed`
- **Nivel**: `fatal`
- **Cuándo**: Error irrecuperable durante bootstrap
- **Contexto recomendado**: `error`, `errorCode`, `stage`
- **Ejemplo**:
```json
{
  "error": "Token validation failed",
  "errorCode": "INVALID_TOKEN",
  "stage": "token_validation",
  "details": "401 Unauthorized"
}
```

---

## 2. MCP Tool Invocation Events

Eventos durante la invocación de herramientas por el agente.

### `mcp.tool.invoked`
- **Nivel**: `info`
- **Cuándo**: Agente solicita una herramienta
- **Contexto recomendado**: `tool`, `requestId`, `category`
- **Ejemplo**:
```json
{
  "tool": "restart_application",
  "requestId": "req-abc123def456",
  "category": "Applications",
  "parameterCount": 1
}
```

### `mcp.tool.parameters_validated`
- **Nivel**: `debug`
- **Cuándo**: Parámetros de entrada validados exitosamente
- **Contexto recomendado**: `tool`, `requestId`, `paramCount`
- **Ejemplo**:
```json
{
  "tool": "get_application_logs",
  "requestId": "req-abc123def456",
  "paramCount": 2,
  "parameters": ["uuid", "lines"]
}
```

### `mcp.tool.parameters_invalid`
- **Nivel**: `debug`
- **Cuándo**: Parámetros fallaron validación
- **Contexto recomendado**: `tool`, `requestId`, `errors`
- **Ejemplo**:
```json
{
  "tool": "restart_application",
  "requestId": "req-abc123def456",
  "errors": {
    "uuid": "Invalid format: must be UUID v4"
  }
}
```

### `mcp.tool.access_denied`
- **Nivel**: `warn`
- **Cuándo**: Tool bloqueado por permisos (READ_ONLY, etc.)
- **Contexto recomendado**: `tool`, `requestId`, `reason`
- **Ejemplo**:
```json
{
  "tool": "delete_application",
  "requestId": "req-abc123def456",
  "reason": "READ_ONLY mode enabled",
  "mode": "READ_ONLY"
}
```

### `mcp.tool.confirmation_required`
- **Nivel**: `info`
- **Cuándo**: Operación crítica requiere confirmación
- **Contexto recomendado**: `tool`, `requestId`, `operation`, `severity`
- **Ejemplo**:
```json
{
  "tool": "delete_application",
  "requestId": "req-abc123def456",
  "operation": "delete",
  "severity": "critical",
  "resourceId": "app-123",
  "resourceName": "api-backend",
  "environment": "production"
}
```

### `mcp.tool.confirmed`
- **Nivel**: `info`
- **Cuándo**: Confirmación recibida y validada
- **Contexto recomendado**: `tool`, `requestId`, `confirmedAt`
- **Ejemplo**:
```json
{
  "tool": "delete_application",
  "requestId": "req-abc123def456",
  "confirmed": true
}
```

### `mcp.tool.confirmation_timeout`
- **Nivel**: `warn`
- **Cuándo**: Timeout esperando confirmación
- **Contexto recomendado**: `tool`, `requestId`, `waitedMs`
- **Ejemplo**:
```json
{
  "tool": "delete_application",
  "requestId": "req-abc123def456",
  "waitedMs": 30000,
  "timeoutSeconds": 30
}
```

### `mcp.tool.started`
- **Nivel**: `debug`
- **Cuándo**: Ejecución de la herramienta iniciada
- **Contexto recomendado**: `tool`, `requestId`
- **Ejemplo**:
```json
{
  "tool": "get_version",
  "requestId": "req-abc123def456",
  "executionStarted": true
}
```

### `mcp.tool.completed`
- **Nivel**: `info`
- **Cuándo**: Herramienta completada exitosamente
- **Contexto recomendado**: `tool`, `requestId`, `durationMs`, `result`
- **Ejemplo**:
```json
{
  "tool": "restart_application",
  "requestId": "req-abc123def456",
  "durationMs": 2543,
  "result": "success",
  "resourceId": "app-123"
}
```

### `mcp.tool.failed`
- **Nivel**: `error`
- **Cuándo**: Herramienta falló
- **Contexto recomendado**: `tool`, `requestId`, `durationMs`, `error`, `errorCode`
- **Ejemplo**:
```json
{
  "tool": "get_application_by_uuid",
  "requestId": "req-abc123def456",
  "durationMs": 523,
  "error": "Application not found",
  "errorCode": "APPLICATION_NOT_FOUND",
  "resourceId": "app-invalid"
}
```

---

## 3. Coolify API Integration Events

Eventos relacionados con llamadas a la API de Coolify.

### `coolify.request.started`
- **Nivel**: `debug`
- **Cuándo**: Request a Coolify API iniciado
- **Contexto recomendado**: `method`, `endpoint`, `requestId`
- **Ejemplo**:
```json
{
  "method": "GET",
  "endpoint": "/applications/app-123",
  "requestId": "req-abc123def456",
  "attempt": 1
}
```

### `coolify.request.completed`
- **Nivel**: `debug`
- **Cuándo**: Response de Coolify recibida exitosamente
- **Contexto recomendado**: `method`, `endpoint`, `status`, `durationMs`, `requestId`
- **Ejemplo**:
```json
{
  "method": "GET",
  "endpoint": "/applications/app-123",
  "status": 200,
  "durationMs": 234,
  "requestId": "req-abc123def456",
  "dataSize": 1247
}
```

### `coolify.request.failed`
- **Nivel**: `error`
- **Cuándo**: Request a Coolify falló
- **Contexto recomendado**: `method`, `endpoint`, `status`, `durationMs`, `error`, `requestId`
- **Ejemplo**:
```json
{
  "method": "PATCH",
  "endpoint": "/projects/proj-123",
  "status": 422,
  "durationMs": 456,
  "error": "Validation failed",
  "requestId": "req-abc123def456",
  "details": "Invalid project name"
}
```

### `coolify.request.retry`
- **Nivel**: `warn`
- **Cuándo**: Reintentando request fallido
- **Contexto recomendado**: `method`, `endpoint`, `attempt`, `nextRetryMs`, `requestId`
- **Ejemplo**:
```json
{
  "method": "POST",
  "endpoint": "/deployments/deploy",
  "attempt": 2,
  "maxAttempts": 3,
  "nextRetryMs": 4000,
  "reason": "Service temporarily unavailable",
  "requestId": "req-abc123def456"
}
```

### `coolify.rate_limit.hit`
- **Nivel**: `warn`
- **Cuándo**: Rate limit alcanzado
- **Contexto recomendado**: `endpoint`, `retryAfter`, `requestId`
- **Ejemplo**:
```json
{
  "endpoint": "/applications",
  "status": 429,
  "retryAfterSeconds": 60,
  "requestId": "req-abc123def456"
}
```

### `coolify.auth.failed`
- **Nivel**: `error`
- **Cuándo**: Error de autenticación con Coolify
- **Contexto recomendado**: `endpoint`, `status`, `reason`, `requestId`
- **Ejemplo**:
```json
{
  "endpoint": "/version",
  "status": 401,
  "reason": "Invalid or expired token",
  "requestId": "req-abc123def456"
}
```

### `coolify.dependency.timeout`
- **Nivel**: `error`
- **Cuándo**: Timeout esperando respuesta de Coolify
- **Contexto recomendado**: `endpoint`, `timeoutMs`, `requestId`
- **Ejemplo**:
```json
{
  "endpoint": "/applications",
  "timeoutMs": 30000,
  "requestId": "req-abc123def456"
}
```

---

## 4. Validation & Authorization Events

Eventos de validación, autenticación y autorización.

### `validation.failed`
- **Nivel**: `debug` o `info`
- **Cuándo**: Validación de parámetros falla
- **Contexto recomendado**: `field`, `reason`, `tool`, `requestId`
- **Ejemplo**:
```json
{
  "field": "uuid",
  "reason": "invalid_format",
  "expectedFormat": "UUID v4",
  "tool": "get_application_by_uuid",
  "requestId": "req-abc123def456"
}
```

### `auth.failed`
- **Nivel**: `warn`
- **Cuándo**: Autenticación falla
- **Contexto recomendado**: `reason`, `requestId`
- **Ejemplo**:
```json
{
  "reason": "Token expired or invalid",
  "requestId": "req-abc123def456"
}
```

### `authorization.failed`
- **Nivel**: `warn`
- **Cuándo**: Autorización falla (permisos insuficientes)
- **Contexto recomendado**: `operation`, `reason`, `requiredPermission`, `requestId`
- **Ejemplo**:
```json
{
  "operation": "delete_database",
  "reason": "Insufficient permissions",
  "requiredPermission": "write:databases",
  "requestId": "req-abc123def456"
}
```

---

## 5. Operation Confirmation Events

Eventos relacionados con confirmaciones de operaciones críticas.

### `operation.confirmation.requested`
- **Nivel**: `info`
- **Cuándo**: Confirmación es requerida antes de proceder
- **Contexto recomendado**: `operation`, `resourceId`, `resourceName`, `severity`, `requestId`
- **Ejemplo**:
```json
{
  "operation": "delete_application",
  "resourceId": "app-123",
  "resourceName": "api-backend",
  "severity": "critical",
  "environment": "production",
  "requestId": "req-abc123def456",
  "timeoutSeconds": 30
}
```

### `operation.confirmed`
- **Nivel**: `info`
- **Cuándo**: Usuario confirma la operación
- **Contexto recomendado**: `operation`, `resourceId`, `requestId`, `confirmedAt`
- **Ejemplo**:
```json
{
  "operation": "delete_application",
  "resourceId": "app-123",
  "requestId": "req-abc123def456",
  "waitedSeconds": 5
}
```

### `operation.cancelled_by_user`
- **Nivel**: `info`
- **Cuándo**: Usuario cancela la operación
- **Contexto recomendado**: `operation`, `resourceId`, `requestId`, `reason`
- **Ejemplo**:
```json
{
  "operation": "restart_application",
  "resourceId": "app-123",
  "requestId": "req-abc123def456",
  "reason": "User declined confirmation"
}
```

### `operation.confirmation_timeout`
- **Nivel**: `warn`
- **Cuándo**: Timeout esperando confirmación
- **Contexto recomendado**: `operation`, `resourceId`, `waitedMs`, `requestId`
- **Ejemplo**:
```json
{
  "operation": "delete_project",
  "resourceId": "proj-123",
  "waitedMs": 30000,
  "timeoutMs": 30000,
  "requestId": "req-abc123def456"
}
```

---

## 6. READ_ONLY Mode Events

Eventos específicos del modo solo-lectura.

### `read_only.mode_enabled`
- **Nivel**: `info`
- **Cuándo**: Bootstrap detecta READ_ONLY=true
- **Contexto recomendado**: Ninguno especial
- **Ejemplo**:
```json
{
  "message": "Running in READ_ONLY mode"
}
```

### `read_only.blocked_operation`
- **Nivel**: `warn`
- **Cuándo**: Operación bloqueada por READ_ONLY
- **Contexto recomendado**: `tool`, `operation`, `requestId`
- **Ejemplo**:
```json
{
  "tool": "create_application_public",
  "operation": "create",
  "requestId": "req-abc123def456",
  "message": "Write operation blocked in READ_ONLY mode"
}
```

---

## 7. Shutdown Events

Eventos durante apagado del servidor.

### `app.shutdown.started`
- **Nivel**: `info`
- **Cuándo**: Apagado graceful iniciado
- **Contexto recomendado**: `reason` (SIGTERM, SIGINT, error, etc.)
- **Ejemplo**:
```json
{
  "reason": "SIGTERM received"
}
```

### `app.shutdown.cleanup`
- **Nivel**: `debug`
- **Cuándo**: Limpieza de recursos
- **Contexto recomendado**: `resource`, `status`
- **Ejemplo**:
```json
{
  "resource": "logger",
  "status": "closed",
  "durationMs": 123
}
```

### `app.shutdown.completed`
- **Nivel**: `info`
- **Cuándo**: Apagado completado
- **Contexto recomendado**: `durationMs`, `code`
- **Ejemplo**:
```json
{
  "durationMs": 456,
  "exitCode": 0,
  "message": "Shutdown complete"
}
```

### `app.shutdown.failed`
- **Nivel**: `error`
- **Cuándo**: Error durante apagado
- **Contexto recomendado**: `error`, `errorCode`, `resource`
- **Ejemplo**:
```json
{
  "error": "Failed to close database connection",
  "errorCode": "SHUTDOWN_ERROR",
  "resource": "coolify_connection",
  "durationMs": 5000
}
```

---

## 8. Fatal Error Events

Eventos de errores irrecuperables.

### `fatal.bootstrap_failed`
- **Nivel**: `fatal`
- **Cuándo**: Bootstrap falla irrecuperablemente
- **Contexto recomendado**: `error`, `errorCode`, `stage`
- **Ejemplo**:
```json
{
  "error": "Configuration loading failed",
  "errorCode": "CONFIG_ERROR",
  "stage": "env_validation",
  "details": "COOLIFY_BASE_URL not set"
}
```

### `fatal.unhandled_exception`
- **Nivel**: `fatal`
- **Cuándo**: Excepción no-capturada
- **Contexto recomendado**: `error`, `stack`, `type`
- **Ejemplo**:
```json
{
  "error": "TypeError: Cannot read property 'uuid' of undefined",
  "errorType": "TypeError",
  "code": "ERR_UNDEFINED_PROPERTY"
}
```

### `fatal.token_invalid`
- **Nivel**: `fatal`
- **Cuándo**: Token de Coolify inválido o expirado
- **Contexto recomendado**: `reason`, `details`
- **Ejemplo**:
```json
{
  "reason": "Token validation failed",
  "details": "401 Unauthorized from Coolify",
  "action": "Check COOLIFY_TOKEN in .env"
}
```

---

## 9. Performance & Diagnostic Events

Eventos de rendimiento y diagnóstico.

### `performance.slow_operation`
- **Nivel**: `warn`
- **Cuándo**: Operación excede threshold (ej: 5s)
- **Contexto recomendado**: `tool`, `durationMs`, `threshold`, `requestId`
- **Ejemplo**:
```json
{
  "tool": "trigger_deployment",
  "durationMs": 8500,
  "thresholdMs": 5000,
  "requestId": "req-abc123def456"
}
```

### `performance.memory_usage`
- **Nivel**: `debug`
- **Cuándo**: Periódico (ej: cada 1 minuto) en debug mode
- **Contexto recomendado**: `heapUsedMb`, `heapTotalMb`, `externalMb`
- **Ejemplo**:
```json
{
  "heapUsedMb": 45.2,
  "heapTotalMb": 128.0,
  "externalMb": 2.1,
  "percent": 35.3
}
```

### `diagnostic.tool_registry`
- **Nivel**: `debug`
- **Cuándo**: Bootstrap logea el registro de tools
- **Contexto recomendado**: `toolCount`, `categories`
- **Ejemplo**:
```json
{
  "toolCount": 107,
  "categories": {
    "Applications": 19,
    "Deployments": 5,
    "Databases": 21,
    "Servers": 8
  }
}
```

---

## Niveles de Log por Evento

| Evento | debug | info | warn | error | fatal |
|--------|-------|------|------|-------|-------|
| Bootstrap started | - | ✓ | - | - | - |
| Config loaded | ✓ | - | - | - | - |
| Token validated | - | ✓ | - | - | - |
| Tool invoked | - | ✓ | - | - | - |
| Parameters validated | ✓ | - | - | - | - |
| Access denied | - | - | ✓ | - | - |
| Request started | ✓ | - | - | - | - |
| Request completed | ✓ | - | - | - | - |
| Request failed | - | - | - | ✓ | - |
| Rate limit hit | - | - | ✓ | - | - |
| Tool completed | - | ✓ | - | - | - |
| Tool failed | - | - | - | ✓ | - |
| Shutdown started | - | ✓ | - | - | - |
| Bootstrap failed | - | - | - | - | ✓ |
| Unhandled exception | - | - | - | - | ✓ |
| Token invalid | - | - | - | - | ✓ |

---

## Plantilla para Nuevos Eventos

Cuando agregues nuevos eventos, sigue este formato:

### `domain.category.event_name`
- **Nivel**: `trace|debug|info|warn|error|fatal`
- **Cuándo**: Descripción clara del momento
- **Contexto recomendado**: Campos sugeridos
- **Ejemplo**:
```json
{
  "field1": "value1",
  "field2": "value2"
}
```

---

## Validación

Para validar que los eventos estables se usan correctamente:

```typescript
// Validar en type-checking
type StableEventName = 
  | 'app.bootstrap.started'
  | 'app.bootstrap.config_loaded'
  | 'app.bootstrap.token_validated'
  // ... etc

function logWithValidation(eventName: StableEventName, context?: Record<string, any>) {
  // TypeScript garantiza que solo eventos válidos se usan
}
```

---

**Última actualización**: 2026-05-11  
**Versión**: 1.0.0
