# Guía para Claude Code y Agentes de IA - MCP Coolify

Este documento proporciona contexto operacional para Claude Code y otros agentes de IA trabajando en este proyecto.

---

## Sistema de Logging y Diagnóstico

Este proyecto implementa una arquitectura de logging rigurosa basada en eventos estables y contexto estructurado. El logging **no es un detalle menor** — es un contrato operacional explícito.

### Durante Desarrollo Local

Cuando trabajas en desarrollo local, el servidor escribe logs en dos archivos:

**`.logs/app.log`** — Legible para humanos
```
18/04/2026 14:32:10  [INFO]  app.bootstrap.started: Iniciando MCP Coolify
18/04/2026 14:32:10  [DEBUG] app.bootstrap.config_loaded: { environment: 'development', readOnly: false }
18/04/2026 14:32:11  [INFO]  coolify.request.completed: { status: 200, durationMs: 543 }
```

**`.logs/app.jsonl`** — JSON Lines estructurado
```json
{"timestamp":"2026-04-18T12:32:10.000Z","localTime":"18/04/2026 14:32:10","level":"info","eventName":"app.bootstrap.started"}
{"timestamp":"2026-04-18T12:32:10.123Z","localTime":"18/04/2026 14:32:10","level":"debug","eventName":"app.bootstrap.config_loaded","context":{"environment":"development"}}
```

Ambos archivos se **truncan/sobrescriben en cada inicio** del servidor y son **ignorados por Git**.

### Cómo Diagnosticar Problemas

1. **Antes de adivinar**, inspecciona los archivos de logs:
   ```bash
   tail -f .logs/app.log        # Ver logs en tiempo real (humano)
   tail -f .logs/app.jsonl      # Ver logs estructurados
   ```

2. **Usa `.logs/app.log` para inspección rápida** — está diseñado para legibilidad humana

3. **Usa `.logs/app.jsonl` para análisis estructurado** — cada línea es un JSON válido

### Niveles de Log y Qué Esperan

El servidor tiene variable `LOG_LEVEL`:

| Nivel | Contenido esperado |
|-------|------------------|
| `trace` | Detalles extremadamente verbosos (raramente usado) |
| `debug` | Información de diagnóstico detallada para flujos principales |
| `info` | Eventos operacionales normales (default en desarrollo) |
| `warn` | Situaciones anómalas (reintentos, cambios críticos) |
| `error` | Fallos reales |
| `fatal` | Errores irrecuperables (bootstrap fallido, etc) |

**Cambiar nivel temporalmente:**
```bash
LOG_LEVEL=debug npm start   # Más verboso
LOG_LEVEL=info npm start    # Menos verboso
```

### Eventos Estables Importantes

El logging usa **nombres de eventos estables** (no mensajes libres). Algunos eventos clave:

```
app.bootstrap.started           — Servidor iniciando
app.bootstrap.token_validated   — Conectado a Coolify exitosamente
app.bootstrap.failed            — Bootstrap falló (investiga logs)

mcp.tool.invoked                — Agente solicita una herramienta
mcp.tool.completed              — Herramienta completada
mcp.tool.failed                 — Herramienta falló

coolify.request.started         — Request a Coolify iniciado
coolify.request.completed       — Respuesta recibida
coolify.request.failed          — Request falló

read_only.blocked_operation     — Operación bloqueada por READ_ONLY

operation.confirmation.requested — Confirmación requerida
operation.confirmed             — Usuario confirmó
```

Ver `logging-events.md` para lista completa y contexto de cada evento.

### Redacción de Secretos

Tokens, API keys, contraseñas y credenciales **se redactan automáticamente** en todos los logs:

```
{
  "coolify_token": "[REDACTED]",
  "api_key": "[REDACTED]",
  "password": "[REDACTED]"
}
```

**Importante**: Aunque el sistema redacta automáticamente, **nunca copes secrets o credentials de los logs a tus explicaciones o commits**, incluso si parecen redactados.

### Cuándo Inspeccionar Logs

Inspecciona los logs cuando:

- ❌ El servidor no arranca
- ❌ Las operaciones fallan sin mensaje claro
- ❌ Comportamiento anómalo o lento
- ❌ Necesitas entender qué hizo el servidor en un moment específico
- ❌ Debuggeando flujos complejos

**No hagas**: Adivinar qué pasó sin revisar los logs primero.

### Estructura del Contexto en Logs

Cada log estructurado incluye:

```typescript
{
  timestamp: "ISO 8601",           // 2026-04-18T12:32:10.000Z
  localTime: "18/04/2026 14:32:10", // Madrid timezone
  timezone: "Europe/Madrid",
  level: "info",                    // Nivel de log
  eventName: "mcp.tool.completed",  // Nombre estable
  message?: "Descripción opcionalmente humanable",
  context?: {                       // Contexto no-sensible
    tool: "restart_application",
    requestId: "req-abc123def456",
    durationMs: 2543,
    result: "success"
  }
}
```

Esto permite que tanto humanos como herramientas (como LLMs) analicen los logs.

---

## Arquitectura de Logging (Para Referencia)

Si necesitas modificar o extender el logging:

### Carpetas Clave

```
src/lib/logging/
  ├── types.ts         # Contrato del logger y tipos
  ├── events.ts        # Nombres de eventos estables
  ├── sanitize.ts      # Redacción automática
  └── levels.ts        # Definiciones de niveles

src/server/logging/
  ├── logger.server.ts     # Implementación con Pino
  ├── formatters.ts        # Conversión a humano/JSON
  ├── file-transports.ts   # Escritura a .logs/
  └── bootstrap.ts         # Inicialización
```

### Regla Principal: Usa el Logger Compartido

```typescript
// ✓ CORRECTO
import { logger } from '$lib/logging/logger.server';
logger.info('operation.completed', { operation: 'sync', durationMs: 150 });

// ❌ PROHIBIDO
console.log('Algo pasó');
console.error('Error');
```

ESLint previene `console.*` directo en código de aplicación.

### Agregar Nuevos Eventos

1. **Defínelos en `logging-events.md`:**
   ```
   ### `domain.category.new_event`
   - **Nivel**: `info`
   - **Cuándo**: Descripción clara
   - **Contexto**: Campos recomendados
   ```

2. **Úsalos en código:**
   ```typescript
   logger.info('domain.category.new_event', {
     field1: value1,
     field2: value2
   });
   ```

3. **Valida en tests** que el evento se emite correctamente.

---

## Variables de Entorno

```bash
# Nivel de logging (trace|debug|info|warn|error|fatal, default: info)
LOG_LEVEL=info

# Directorio de logs en desarrollo (default: .logs)
LOG_DIR=.logs

# Habilitar archivos de log (default: true en dev, false en prod)
LOG_TO_FILES=true

# Timezone para timestamps (default: Europe/Madrid)
LOG_TIMEZONE=Europe/Madrid
```

---

## Diagnosticando Problemas Comunes

### "El servidor no arranca"

```bash
# 1. Revisa los logs
tail -f .logs/app.log

# 2. Busca 'fatal' o 'failed'
grep -i "fatal\|failed" .logs/app.log

# 3. Común: Token inválido
grep -i "token" .logs/app.log
```

### "Un tool falla silenciosamente"

```bash
# 1. Aumenta el log level
LOG_LEVEL=debug npm start

# 2. Revisa el requestId de la invocación
grep "mcp.tool.invoked" .logs/app.log

# 3. Busca ese requestId
grep "req-abc123def456" .logs/app.log

# 4. Verifica el estado: invoked → parameters_validated → completed/failed
```

### "Quiero ver qué hace la API de Coolify"

```bash
# 1. Activa debug
LOG_LEVEL=debug npm start

# 2. Busca coolify.request
grep "coolify.request" .logs/app.log

# 3. Los requests comienzan en "coolify.request.started" 
#    y terminan en "coolify.request.completed" o "coolify.request.failed"
```

### "¿Qué tan lento fue la última operación?"

```bash
# 1. Los logs incluyen durationMs
grep "mcp.tool.completed" .logs/app.log | tail -1

# 2. O busca un tool específico
grep "restart_application" .logs/app.jsonl | jq .context.durationMs
```

---

## Validación Manual del Logging

Si modificas el sistema de logging, valida que:

```bash
# 1. Diferentes niveles generan diferentes logs
LOG_LEVEL=trace npm start   # Más logs que...
LOG_LEVEL=debug npm start   # Más que...
LOG_LEVEL=info npm start    # Etc.

# 2. Secrets se redactan
grep "REDACTED" .logs/app.log   # Debe tener redacciones
grep "token" .logs/app.log      # No debe mostrar tokens reales

# 3. Timestamps están correctos
grep "^\d\d/\d\d/\d\d\d\d" .logs/app.log    # Formato legible

# 4. JSON Lines es válido
jq '.' .logs/app.jsonl | head   # Debe ser JSON válido
```

---

## Archivos Relacionados

- **`spec.md`** — Especificación técnica completa (sección 7: Logging)
- **`logging-events.md`** — Catálogo completo de eventos estables
- **`specifications.md`** — Especificación de herramientas/tools
- **`constitution.md`** — Visión y principios del proyecto

---

## Preguntas Frecuentes

**P: ¿Por qué hay dos archivos de log?**  
R: `.logs/app.log` es humanable (lectura rápida), `.logs/app.jsonl` es estructurado (análisis programático).

**P: ¿Se pierden los logs al reiniciar?**  
R: Sí. En desarrollo se truncan cada vez que inicias el servidor (para no llenar el disco). En producción se envían a stdout o a un sistema de logging centralizado.

**P: ¿Cómo agrego logs a mi código?**  
R: Importa `logger` de `$lib/logging/logger.server` y úsalo con eventos estables:
```typescript
logger.info('domain.operation.completed', { durationMs: 100 });
```

**P: ¿Qué pasa si olvido el requestId?**  
R: ESLint/TypeScript pueden validarlo si defines el contrato correctamente. Para operaciones críticas, el requestId debe estar presente.

**P: ¿Puedo usar `console.log` para debugging rápido?**  
R: No. ESLint lo rechaza. Usa `logger.debug()` en su lugar. Es igual de rápido y queda un registro útil.

---

## Más Ayuda

Cuando diagnostiques problemas:

1. **Primero**: Revisa `.logs/app.log`
2. **Segundo**: Sube el log level a `debug`
3. **Tercero**: Busca por eventName o requestId específicos
4. **Finalmente**: Si necesitas ayuda, proporciona logs (sin secrets)

---

## Gobernanza, Estándares y Prácticas de Código

Este proyecto implementa una **arquitectura de gobernanza explícita** para todos los agentes de IA que colaboran en él. Estos estándares aseguran calidad, consistencia, trazabilidad y seguridad en el código.

### Documentos Normativos Obligatorios

Antes de implementar cualquier cambio, familia con estos documentos:

1. **`spec.md`** — Especificación técnica completa (arquitectura, protocolo MCP, logging)
2. **`.specify/memory/constitution.md`** — Principios de diseño, frameworks no-negociables, ADRs
3. **`logging-events.md`** — Catálogo completo de eventos estables (50+ eventos)
4. **`specs/001-mcp-coolify/spec.md`** — Especificación de features y criterios de aceptación
5. **`AGENTS.md`** — Estándares obligatorios para TODOS los agentes
6. **`CODEX.md`** — Instrucciones específicas para investigaciones y rescues (Codex)
7. **`GEMINI.md`** — Instrucciones para Gemini (si se integra)

### Reglas de Oro: Confirmación Obligatoria

**Antes de hacer CUALQUIER cambio o añadir una nueva característica:**

Si la intención de lo que se quiere hacer **no está 100% clara** o hay **huecos, dudas, ambigüedades**:

🛑 **PREGUNTA PRIMERO** — No implementes nada sin claridad.

### Disciplina de Cambios

#### 1. Validación contra Especificaciones

Todo cambio debe estar alineado con:
- ✅ `spec.md` (comportamiento técnico)
- ✅ `constitution.md` (principios y ADRs)
- ✅ `specs/001-mcp-coolify/spec.md` (criterios de aceptación)

Si detectas **discrepancias** entre código y documentación:
- **Opción A**: El código está mal → arreglarlo
- **Opción B**: La documentación está desactualizada → actualizarla
- **NUNCA**: Ignorar la discrepancia sin documentar

#### 2. Cambios no Especificados

Si una tarea **no está cubierta** por los documentos normativos:

1. 📝 Propone el cambio como **diff o nota de diseño**
2. ⏸️ **ESPERA confirmación explícita** antes de aplicar
3. 📄 Una vez aprobado, **actualiza la documentación**

#### 3. Documentación Obligatoria de Cambios

**Cualquier cambio en el código — sin excepción — debe reflejarse en las especificaciones.**

```
✅ Debes documentar:
  - Correcciones de bugs que cambian comportamiento
  - Ajustes de lógica
  - Nuevas métricas o eventos de logging
  - Cambios en reglas de negocio
  - Cambios en campos de datos
  - Nuevas variables de entorno
  
❌ Puedes omitir documentación SOLO si:
  - El cambio es puramente interno
  - NO altera ningún comportamiento observable
  - Ejemplos: renombrar variable local, reformatear código
  
REGLA: Documenta siempre, salvo que justifiques por qué es seguro omitirlo.
```

#### 4. Trazabilidad y Criterios de Aceptación

Siempre que hagas cambios:
- 🔗 **Referencia el/los criterio(s) de aceptación** del documento normativo
- ❓ Si un criterio es ambiguo → **pide aclaración** en lugar de asumir comportamiento
- 📋 Incluye esa referencia en el commit (si procede)

### Herramientas y Técnicas Modernas

#### Context7 para Documentación Técnica

Cuando necesites consultar documentación de librerías, frameworks o tecnologías:

```bash
✅ Usa: MCP Context7 para consultar documentación RECIENTE y OFICIAL
❌ Evita: Asumir sintaxis basada en tu conocimiento previo
```

**Por qué**: La sintaxis, APIs y mejores prácticas evolucionan. Context7 garantiza que usas versiones actuales.

#### Logging Estructurado

Uso obligatorio del logger compartido:

```typescript
// ✅ CORRECTO
import { logger } from '$lib/logging/logger.server';
logger.info('mcp.tool.completed', {
  tool: 'restart_application',
  requestId: 'req-abc123',
  durationMs: 2543
});

// ❌ PROHIBIDO
console.log('Tool completado');
console.error('Error');
```

**Regla**: Todos los eventos deben usar nombres estables (`domain.category.event`). Ver `logging-events.md`.

#### Inspección de Logs antes de Adivinar

Cuando algo falla o se comporta anómalo:

```bash
# 1. LEE LOS LOGS
tail -f .logs/app.log

# 2. Si el problema no es obvio, sube el nivel
LOG_LEVEL=debug npm start

# 3. Busca por eventName o requestId
grep "mcp.tool.failed" .logs/app.log
grep "req-abc123" .logs/app.log

# 4. Si necesitas ayuda, proporciona logs (sin secrets)
# NUNCA: Adivines qué pasó sin revisar logs primero
```

### Refactors y "Arreglos" No Autorizados

**Prohibido**:
- ❌ Refactorizar código "para mejorar" sin que esté especificado
- ❌ Hacer "optimizaciones" que cambien comportamiento observable
- ❌ Reorganizar archivos sin justificación documentada
- ❌ Cambiar "detalles de implementación" que afecten logs o comportamiento

**Permitido**:
- ✅ Refactoring puro (sin cambio de comportamiento)
- ✅ Renombramiento de variables/funciones locales
- ✅ Reorganización interna si no cambia API pública

**Cuando en duda**: Pregunta y espera confirmación explícita.

### Cumplimiento y Validación

Cada tarea completada debe validarse contra:

```
Checklist de Finalización:
□ ¿Están todas las especificaciones relevantes leídas?
□ ¿El código cumple los criterios de aceptación?
□ ¿Se emiten los eventos de logging esperados?
□ ¿Los logs contienen requestId y durationMs?
□ ¿Los secretos están redactados en logs?
□ ¿Se actualizó spec.md si el comportamiento observable cambió?
□ ¿Se validó la tarea en desarrollo?
□ ¿ESLint y TypeScript pasan sin errores?
□ ¿Si es bug fix, se agregó test?
```

### Comunicación Obligatoria

- 🇪🇸 **Idioma**: Español SIEMPRE en explicaciones, comentarios de código y output
- 📝 **Claridad**: Las instrucciones deben ser legibles para humanos, no máquinas
- 🔗 **Contexto**: Incluye siempre referencias a documentos o criterios relevantes
- ⚠️ **Limitaciones**: Si no puedes completar algo, explica por qué y qué se necesitaría

---

## Sincronización Obligatoria con Documentación Pública

### Cambios Sustanciales Requieren Actualización de README.md

**Cualquier cambio que afecte sustancialmente al MCP debe documentarse TAMBIÉN en `README.md`.**

Los cambios sustanciales incluyen:

**Cambios en Funcionalidad o Comportamiento:**
- ✅ Nuevas tools o categorías de tools
- ✅ Cambios en comportamiento de tools existentes
- ✅ Nuevas características de seguridad o validación
- ✅ Cambios en eventos de logging o auditoría

**Cambios en Configuración:**
- ✅ Nuevas variables de entorno
- ✅ Cambios en parámetros de compilación o ejecución
- ✅ Cambios en requisitos de Node.js, npm u otras dependencias

**Cambios en Instalación:**
- ✅ Nuevos pasos en instalación
- ✅ Cambios en cómo configurar en Claude Code (`.mcp.json`)

**Regla**: Si cambias especificación interna → también actualiza README.md para que usuarios vean los cambios.

---

**Última actualización**: 2026-05-11

<!-- SPECKIT START -->
**Implementation Plan Reference**: `specs/001-mcp-coolify/plan.md`

For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan:
- **plan.md** — Implementation plan, architecture decisions, complexity tracking
- **spec.md** — Complete technical specification (~700 lines)
- **research.md** — Phase 0 research and clarifications
- **data-model.md** — Phase 1 entities and relationships
- **contracts/tool-definitions.md** — MCP tool schema and contracts
- **quickstart.md** — Setup, environment variables, first-run tests

**Constitution**: `.specify/memory/constitution.md` — Non-negotiable principles, ADRs, frameworks

All design artifacts are in `specs/001-mcp-coolify/` directory.
<!-- SPECKIT END -->
