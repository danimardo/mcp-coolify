# Análisis Profundo de Implementación MCP Coolify

**Fecha**: 2026-05-12  
**Estado**: Revisión Completada - Se encontraron 20+ problemas  
**Próximo paso**: Correcciones implementadas

---

## Resumen Ejecutivo

La implementación tiene **sólidos cimientos arquitectónicos** (logging, validación Zod, registry de tools) pero presenta **discrepancias críticas** respecto a las especificaciones en:

1. **Configuración** — Variables de entorno mal nombradas, sin validación de token en bootstrap
2. **Logging** — No escribiendo a archivos `.logs/`, timezone handling incorrecto
3. **Eventos de Logging** — Niveles de severidad incorrectos (debug en lugar de info)
4. **HTTP Client** — Implementación incompleta, falta manejo de Retry-After
5. **Herramientas** — Implementadas solo como stubs (boilerplate vacío)

---

## Problemas Detectados por Categoría

### 1. CONFIGURACIÓN (Criticidad: ALTA)

#### P1.1: Variable de Entorno Incorrecta
- **Especificación**: `COOLIFY_BASE_URL` formato `https://<domain>/api/v1`
- **Implementación**: `COOLIFY_URL` sin especificar estructura `/api/v1`
- **Archivo**: `src/lib/config.ts:10`
- **Impacto**: El URL puede no incluir `/api/v1`, causando errores silenciosos en API calls

#### P1.2: Falta Validación de Token en Bootstrap
- **Especificación** (FR-019): "System MUST validate Coolify API token at bootstrap (make GET /version request); if fails, exit with clear error"
- **Implementación**: No hay validación real. Solo logea sin hacer request a `/version`
- **Archivo**: `src/server/index.ts:112-113`
- **Evidencia**: `logger.debug("app.bootstrap.token_validated", ...)` sin hacer HTTP call real
- **Impacto**: Servidor puede iniciar con token inválido, fallos en runtime

#### P1.3: Falta Variable `VALIDATE_TOKEN_ON_STARTUP`
- **Especificación**: Variable de entorno documentada en constitution.md
- **Implementación**: No existe en schema de configuración
- **Archivo**: `src/lib/config.ts`
- **Impacto**: No se puede deshabilitar validación de token (aunque especificación lo permite)

#### P1.4: Sin Variable `COOLIFY_BASE_URL` en config
- **Especificación**: Usa `COOLIFY_BASE_URL` (constitution.md, spec.md)
- **Implementación**: Usa `COOLIFY_URL` inconsistentemente
- **Impacto**: Inconsistencia con documentación normativa

---

### 2. LOGGING (Criticidad: ALTA)

#### P2.1: No Escribe a Archivos `.logs/app.log` y `.logs/app.jsonl`
- **Especificación** (FR-012, FR-013): Logs deben escribirse a `.logs/app.log` (humano) y `.logs/app.jsonl` (JSON Lines)
- **Implementación**: Solo usa pino con `pino-pretty` a stdout, sin file transports
- **Archivo**: `src/lib/logging/logger.server.ts:26-39`
- **Impacto**: 
  - No hay logs persistentes en desarrollo
  - Imposible auditar operaciones después
  - No coincide con CLAUDE.md instrucciones de diagnóstico

#### P2.2: Timezone Handling Incorrecto
- **Especificación**: Usar `date-fns` con timezone para Madrid (Europe/Madrid)
- **Implementación**: Función manual `formatLocalTime()` que no respeta timezone
- **Archivo**: `src/lib/logging/logger.server.ts:181-192`
- **Evidencia**: 
  ```typescript
  function formatLocalTime(date: Date): string {
    // For now, use a simple format; could use date-fns with timezone support
    const day = pad(date.getDate()); // Ignora timezone!
    ...
  }
  ```
- **Impacto**: Timestamps locales incorrectos en logs

#### P2.3: Eventos Completados Usan Nivel `debug` en lugar de `info`
- **Especificación**: Eventos operacionales exitosos → `info` level
- **Implementación**: `mcp.tool.completed` usa `.debug()`
- **Archivo**: `src/lib/tools/base-tool.ts:152`
- **Impacto**: Con `LOG_LEVEL=info`, operaciones exitosas no se muestran

#### P2.4: Evento `mcp.tool.completed` Debería Ser `info`, No `debug`
- **Especificación** (CLAUDE.md): "eventos operacionales normales (default en desarrollo)" → `info`
- **Implementación**: Usa `debug`
- **Archivo**: `src/lib/tools/base-tool.ts:152`

#### P2.5: Evento `app.bootstrap.token_validated` es `debug` sin hacer validación real
- **Especificación** (FR-019): Requiere HTTP call a `/version`
- **Implementación**: Solo logea sin hacer request
- **Archivo**: `src/server/index.ts:112-114`

---

### 3. HTTP CLIENT (Criticidad: MEDIA)

#### P3.1: Implementación Incompleta en `http-client.ts`
- **Archivo**: Cortado en medio del método `request()`
- **Línea 80+**: Incompleto
- **Impacto**: No se puede compilar/ejecutar completamente

#### P3.2: Falta Manejo de `Retry-After` Header
- **Especificación** (FR-008): "System MUST respect Retry-After header when present in 429 responses"
- **Implementación**: No implementado
- **Impacto**: Rate limiting no respetado correctamente

#### P3.3: Falta Manejo de Error 401 Específico
- **Especificación** (error handling): 401 → `coolify.auth.failed`, sin retry
- **Implementación**: No hay distinción de 401 vs otros 4xx
- **Impacto**: Token expirado no se detecta correctamente

---

### 4. HERRAMIENTAS (Criticidad: MEDIA)

#### P4.1: Herramientas Solo Contienen Stubs
- **Especificación**: ~107 herramientas completas en 13 categorías
- **Implementación**: Archivo `src/tools/index.ts` solo registra herramientas sin lógica real
- **Evidencia**: 
  ```typescript
  // Archivo: src/tools/index.ts
  export { defaultTools } from "./default";
  // ... etc
  ```
  Pero handlers son vacíos (boilerplate)

#### P4.2: Herramientas No Tienen Schemas de Parámetros
- **Especificación**: Cada tool requiere Zod schema
- **Implementación**: Definiciones sin schemas reales
- **Archivo**: `src/tools/applications/schemas.ts` probablemente vacío o incompleto

#### P4.3: Falta Implementación de Handlers Reales
- **Especificación** (User Story 1): Invocar `list_applications` → debe retornar lista real desde API
- **Implementación**: Handlers son stubs
- **Impacto**: No funciona ninguna herramienta realmente

---

### 5. TIPOS Y CONTRATO MCP (Criticidad: MEDIA)

#### P5.1: `ToolResponse` Tiene Estructura Incorrecta
- **Especificación**: Respuestas deben ser `{ result: {...}, _meta: { requestId, executedAt, durationMs } }` O estructura simples
- **Implementación**: Estructura wrapper no estándar MCP
- **Archivo**: `src/lib/tools/base-tool.ts:159-167`
- **Evidencia**:
  ```typescript
  return {
    success: true,
    data: validatedResponse,
    meta: { requestId, duration, ... }
  } satisfies ToolResponse;
  ```
  Esta estructura NO es compatible con MCP spec

#### P5.2: MCP Server No Registra Tools Correctamente
- **Especificación**: Debe registrar `inputSchema` como OpenAPI/JSON Schema
- **Implementación**: Pasa `def.parameters.schema` directamente
- **Archivo**: `src/server/index.ts:139`
- **Impacto**: MCP clients no validan parámetros correctamente

---

### 6. CONFIRMACIÓN FLOW (Criticidad: BAJA)

#### P6.1: Confirmación No Implementada en MCP Server
- **Especificación** (FR-015): Operaciones críticas requieren confirmación via MCP callback
- **Implementación**: Flow existe en `src/lib/confirmation/flow.ts` pero no integrado en MCP server
- **Archivo**: `src/server/index.ts`
- **Impacto**: No se pueden confirmar operaciones destructivas

---

### 7. ERROR HANDLING (Criticidad: MEDIA)

#### P7.1: Error Codes No Normalizados con Specification
- **Especificación**: Define error codes específicos (`APPLICATION_NOT_FOUND`, `VALIDATION_FAILED`, etc.)
- **Implementación**: Estructura genérica sin mapping
- **Archivo**: `src/lib/errors/error-types.ts`

#### P7.2: Falta Definición de Errores por Categoría de Herramienta
- **Especificación**: Cada tool tiene errores esperados documentados
- **Implementación**: Sin errores específicos por tool

---

### 8. VALIDACIÓN (Criticidad: BAJA)

#### P8.1: Schemas de Coolify API Responses Incompletos
- **Especificación** (FR-004): Todas las respuestas validadas con Zod estricto
- **Implementación**: `src/lib/schemas/coolify-responses.ts` probablemente con stubs
- **Impacto**: No se validan respuestas reales de API

---

### 9. SEGURIDAD (Criticidad: ALTA)

#### P9.1: Token No Validado en Bootstrap
- **Especificación** (FR-019): Token must be validated at startup
- **Implementación**: Solo logea sin validación real
- **Impacto**: Servidor inicia con credentials inválidas

#### P9.2: Sensitive Fields List Potencialmente Incompleto
- **Especificación** (constitution.md): 14 campos SENSITIVE_FIELDS mínimo
- **Implementación**: Tiene 52 campos, pero podría falta "session", "csrf", "client_secret"
- **Archivo**: `src/lib/logging/sanitize.ts:6-52`
- **Evidencia**: Revisar si la lista de spec se cumple exactamente

---

### 10. TESTING (Criticidad: BAJA-MEDIA)

#### P10.1: Tests Pueden Estar Incompletos
- Confirmar que todos los tests pasen
- Verificar cobertura de casos críticos (bootstrap failure, token validation, etc.)

---

## Prioridad de Correcciones

| Prioridad | Categoría | Problema | Esfuerzo |
|-----------|-----------|----------|----------|
| 🔴 CRÍTICO | Config | Variable `COOLIFY_BASE_URL` + validación token | 30min |
| 🔴 CRÍTICO | Logging | Escribir a archivos `.logs/` | 45min |
| 🔴 CRÍTICO | Logging | Timezone handling con date-fns | 30min |
| 🔴 CRÍTICO | HTTP Client | Completar implementación + Retry-After | 40min |
| 🟠 ALTO | Herramientas | Stub handlers necesitan implementación | ~8h (MVP) |
| 🟠 ALTO | MCP Server | Validación de schema en registro de tools | 20min |
| 🟡 MEDIO | Confirmación | Integración en MCP server | 1h |
| 🟡 MEDIO | Error Handling | Normalizar códigos de error | 45min |

---

## Recomendaciones

### Fase Inmediata (Esta Sesión)

1. ✅ Corregir `COOLIFY_BASE_URL` y schema de config
2. ✅ Implementar validación de token en bootstrap
3. ✅ Configurar file transports en logger (Pino)
4. ✅ Usar date-fns para timezone
5. ✅ Cambiar niveles de evento a `info` para operaciones
6. ✅ Completar http-client.ts
7. ✅ Agregar Retry-After header handling
8. ✅ Corregir MCP server registration de schemas

### Fase Posterior

- Implementar handlers reales para herramientas (MVP: ~45 tools)
- Integrar confirmation flow en MCP server
- Añadir error codes específicos por categoría

---

## Notas para la Implementación

- El modelo anterior generó mucho boilerplate correcto pero no conectó las piezas
- La arquitectura es SÓLIDA — logging, registry, error handling están bien diseñados
- Necesitan **integración completa** y **validación de detalles**
- No hay seguridad comprometida, pero hay lacunas operacionales
