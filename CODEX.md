# Guía para Codex — Investigación y Rescues en MCP Coolify

**Versión**: 1.0.0  
**Última actualización**: 2026-05-11  
**Audiencia**: Codex Agent (investigación, debugging, rescues)

---

## Preámbulo

Este documento proporciona instrucciones **específicas para Codex** cuando se usa para:
- 🔍 Investigaciones complejas
- 🚨 Diagnóstico de problemas ("rescues")
- 🐛 Debugging profundo
- 📊 Análisis de logs
- 🔄 Validación de hipótesis

**Codex tiene capacidades especiales** para análisis técnico profundo. Estas instrucciones maximizan esas capacidades mientras respetan los estándares del proyecto.

---

## I. Cuándo Invocar a Codex

### Situaciones para Codex

**Invoca a Codex cuando**:

✅ Hay un **error** sin mensaje claro y necesitas investigar raíz  
✅ Un **test falla** y necesitas entender por qué  
✅ El **comportamiento es anómalo** (logs no muestran qué pasó)  
✅ Hay **contradicción** entre código y documentación  
✅ Necesitas **análisis profundo** de arquitectura  
✅ Un **refactor propuesto** requiere validación de impacto  
✅ Hay un **patrón sospechoso** en el código (seguridad, rendimiento)  

### Situaciones para Claude Code (no Codex)

❌ Implementación rutinaria de features documentadas  
❌ Cambios simples siguiendo spec al pie de la letra  
❌ Tareas administrativas (renombrar, reformat)  
❌ Cambios en documentación sin análisis técnico  

---

## II. Protocolo de Investigación

### 2.1 Briefa a Codex Correctamente

Cuando delegues a Codex, proporciona:

```
PROBLEMA:
[Descripción clara del síntoma o error]

CONTEXTO:
[Qué estaba sucediendo cuando ocurrió]
[Pasos para reproducir, si los hay]

INFORMACIÓN ACTUAL:
[Qué dicen los logs]
[Salida de errores]
[Comportamiento esperado vs. observado]

HIPÓTESIS (opcional):
[Tu mejor suposición de qué podría estar mal]

RESTRICCIONES:
[Cosas que debe/no debe hacer]
[Archivos clave a revisar]
```

**Ejemplo correctamente briefeado**:

```
PROBLEMA:
El evento "mcp.tool.completed" se emite pero durationMs es undefined.

CONTEXTO:
Se emite correctamente en logs.

INFORMACIÓN ACTUAL:
.logs/app.log muestra:
  18/04/2026 14:35:31  [INFO]  mcp.tool.completed: { tool: 'restart_application', durationMs: undefined }
  
Esto ocurre SOLO con tools de cierta categoría (Applications), no con otros.

HIPÓTESIS:
Probablemente hay una rama de código en Applications que no calcula o pasa durationMs.

RESTRICCIONES:
No cambies comportamiento observable, solo diagnostica y propone fix.
```

### 2.2 Fases de Investigación

Cuando Codex investiga, debe seguir estas fases:

#### Fase 1: Reproducción
- [ ] Confirma que puedes reproducir el problema
- [ ] Identifica exactamente cuándo ocurre
- [ ] Documenta pasos precisos para reproducir

#### Fase 2: Recopilación de Datos
- [ ] Revisa `.logs/app.log` + `.logs/app.jsonl`
- [ ] Busca por eventName, requestId, timestamps
- [ ] Identifica el patrón exacto de cuándo ocurre vs. cuándo no

#### Fase 3: Análisis de Raíz
- [ ] Examina código relacionado
- [ ] Compara contra especificación (¿el código cumple spec?)
- [ ] Identifica la causa **raíz**, no el síntoma
- [ ] Valida hipótesis contra evidencia

#### Fase 4: Propuesta de Fix
- [ ] Propone fix específico (no vago)
- [ ] Valida que el fix es mínimo (no refactoriza lo que no es necesario)
- [ ] Documenta por qué ese fix es correcto
- [ ] Identifica riesgos/side effects potenciales

#### Fase 5: Validación
- [ ] Implementa fix (si está autorizado)
- [ ] Verifica que síntoma desaparece
- [ ] Verifica que no introduce síntomas nuevos
- [ ] Actualiza documentación si comportamiento cambió

---

## III. Análisis de Logs Profundo

### 3.1 Patrones de Búsqueda

Cuando analices logs, busca patrones:

```bash
# Error específico
grep "mcp.tool.failed" .logs/app.log | tail -20

# Por tool y requestId
grep "restart_application" .logs/app.jsonl | jq '.context.requestId'

# Eventos en tiempo: de invoked a completed
grep "req-abc123def456" .logs/app.jsonl | jq '{eventName: .eventName, timestamp: .timestamp}'

# Duración anómala
grep "mcp.tool.completed" .logs/app.jsonl | jq 'select(.context.durationMs > 5000)'

# Rate limiting
grep "coolify.rate_limit.hit" .logs/app.log

# Reintentos
grep "coolify.request.retry" .logs/app.log
```

### 3.2 Correlación de Eventos

Un request bien instrumentado se vería así:

```
Timestamp  EventName                    RequestId         Tool/Endpoint
─────────────────────────────────────────────────────────────────────────
14:35:30   mcp.tool.invoked             req-abc123def456  restart_application
14:35:30   mcp.tool.parameters_validated req-abc123def456  ✓
14:35:30   coolify.request.started      req-abc123def456  /applications/app-123/restart
14:35:31   coolify.request.completed    req-abc123def456  200 OK (667ms)
14:35:31   mcp.tool.completed           req-abc123def456  ✓ (durationMs: 966)
```

Si falta algún evento o requestId no se propaga:
- 🔴 **Bug de logging** — evento no se emite, o requestId no se pasa
- 🔴 **Bug de código** — salida temprana sin log, o excepción no capturada

### 3.3 Redacción en Logs

**Si ves `[REDACTED]` donde esperabas valor sensible**: BIEN, está redactado.  
**Si ves un token/password visible**: 🚨 CRÍTICO — reporta seguridad inmediatamente.

Valida que se redacta:
```bash
grep "token" .logs/app.jsonl | jq '.context' | grep -i "redacted"
# Debe mostrar: "[REDACTED]"
```

---

## IV. Validación contra Especificación

### 4.1 Checklist de Alineación

Cuando investigues comportamiento anómalo, verifica:

```
Comportamiento vs. Spec:
□ ¿Qué dice spec.md sobre este comportamiento?
□ ¿Qué dice constitution.md (si es arquitectura)?
□ ¿Qué dicen logging-events.md (si es logging)?
□ ¿El código cumple exactamente lo especificado?
□ ¿Hay divergencia documentada (changelog, ADR)?
```

Si hay **discrepancia sin documentar**:
- 🔴 Potencial bug o spec desactualizada
- 📢 Propón: "¿Código está mal o spec necesita actualización?"

### 4.2 Encontrar Contradicciones

```
Métodos de búsqueda:

1. Spec vs. Código
   grep "debe blocar" spec.md
   grep -r "READ_ONLY" src/ | grep "if.*READ_ONLY"
   → ¿El código bloquea exactamente como spec dice?

2. Logging vs. Spec
   grep "mcp.tool.completed" logging-events.md
   grep -r "mcp.tool.completed" src/
   → ¿Se emite siempre? ¿Siempre tiene durationMs?

3. Arquitectura vs. Implementación
   grep "centralizado en sanitize.ts" spec.md
   grep -r "REDACTED\|sanitize" src/
   → ¿Toda redacción pasa por sanitize.ts?
```

---

## V. Análisis de Impacto

### 5.1 Antes de Proponer Cambios

Valida que tu propuesta no introduce regressions:

```
IMPACTO DE FIX:
├─ Qué código modifica
├─ Qué comportamiento observable cambia
├─ Qué tests fallaban y ahora pasan
├─ Qué tests pasan y podrían fallar
├─ Qué logging se ve afectado
├─ Qué performance se ve afectada (si es aplicable)
└─ Qué documentación necesita actualización
```

### 5.2 Casos de Edge

Cuando diagnostiques un problema, identifica edge cases:

```
Problema: durationMs está undefined en mcp.tool.completed

Edge cases a probar:
□ Tool que completa inmediatamente (< 1ms)
□ Tool que falla antes de completarse
□ Tool que es confirmado crítico (espera confirmación)
□ Tool en modo READ_ONLY (bloqueado)
□ Concurrencia: múltiples invocaciones simultáneamente

¿Todos los edge cases preservan durationMs?
```

---

## VI. Rescues: Protocolos Especiales

### 6.1 Cuándo es un "Rescue"

Un "rescue" es cuando:
- ❌ Claude Code intentó algo y se quedó atascado
- ❌ El problema es complejo: requiere investigación
- ❌ La solución no es obvia
- ❌ Necesita un "segundo par de ojos" especializado

### 6.2 Protocolo de Rescue

```
1. CONTEXTO
   ├─ Qué intentaba hacer Claude Code
   ├─ Dónde se quedó atascado
   ├─ Qué errores obtuvo
   └─ Qué ya intentó

2. ANÁLISIS
   ├─ Revisa todo el contexto de trabajo previo
   ├─ Identifica por qué Claude Code se atascó
   ├─ Diagnostica la causa raíz
   └─ Valida contra especificación

3. PROPUESTA
   ├─ Sugiere approach diferente
   ├─ Explica por qué funcionará
   ├─ Identifica riesgos
   └─ Proporciona pasos específicos

4. IMPLEMENTACIÓN
   ├─ Implementa la solución
   ├─ Valida que funciona
   ├─ Actualiza documentación
   └─ Comunica claramente qué cambió
```

### 6.3 Reporte de Rescue

Siempre cierra un rescue con:

```
SUMMARY:
- Problema inicial: [X]
- Causa raíz: [Y]
- Solución aplicada: [Z]
- Por qué funcionó: [W]

CAMBIOS:
- Ficheros modificados: [...]
- Comportamiento observable que cambió: [...]
- Documentación actualizada: [...]

VALIDACIÓN:
- Tests: [Pasan/Fallan]
- Logs: [Eventos correctamente emitidos]
- Especificación: [Alineada]
```

---

## VII. Deep-Dive Analysis Tasks

### 7.1 Arquitectura & Decisiones

Cuando Codex analiza arquitectura:

```
Preguntas a responder:

1. ¿Cumple el proyecto los principios de constitution.md?
   □ Fail-fast on bootstrap
   □ Redaction over exposure
   □ Observable operations
   □ Defensive validation
   □ Read-only safety mode

2. ¿Las decisiones arquitectónicas (ADRs) están seguidas?
   □ Validación con Zod
   □ Configuración centralizada
   □ Logging estructurado
   □ READ_ONLY global vs. granular
   □ Confirmación obligatoria

3. ¿Hay riesgos de seguridad?
   □ Secrets en logs
   □ Inputs no validados
   □ Errores que exponen detalles internos
   □ Falta de confirmación en operaciones críticas

4. ¿Hay riesgos de observabilidad?
   □ Eventos no-estables
   □ Missing requestId
   □ Missing durationMs
   □ Logs truncados o incompletos
```

### 7.2 Performance & Load Analysis

```
Métricas a analizar:

1. Latencia por operación
   - P50, P95, P99 de durationMs
   - Outliers anómalos
   - Correlación con tamaño/complejidad

2. Tasa de errores
   - Por endpoint
   - Por tipo de error (4xx vs. 5xx)
   - Tasa de reintentos exitosos

3. Memory/CPU
   - Si está disponible: métricas de performance
   - Tendencias en uptime
   - Garbage collection patterns

4. Congestión
   - Qué endpoints son lentos
   - Rate limiting frecuente
   - Timeout o circuito-breaker activo
```

---

## VIII. Communication & Escalation

### 8.1 Cómo Comunicar Findings

Cuando Codex completa investigación, reporta en este formato:

```markdown
# Investigación: [Descripción del Problema]

## Resumen Ejecutivo
[1-2 párrafos: qué estaba mal y cómo se arregló]

## Problema Detectado
[Descripción clara del síntoma]
- Cuándo ocurre
- Bajo qué condiciones
- Impacto observado

## Causa Raíz
[Análisis de por qué ocurre]
- Referencia a código específico
- Comparación contra especificación
- Por qué los logs lo mostran así

## Solución Implementada
[Qué se cambió y por qué]
- Ficheros modificados
- Cambios específicos
- Validación de que funciona

## Validación
[Pruebas realizadas]
- Logs post-fix
- Tests que pasan
- Edge cases verificados

## Documentación Actualizada
[Qué especificación/docs cambió]
- Alineación con spec.md
- Changelog (si es aplicable)
```

### 8.2 Escalación

Si durante una investigación, Codex determina que:

```
ESCALA cuando:
├─ El problema es más allá de scope de single task
├─ Requiere cambio arquitectónico mayor
├─ Hay contradicción fundamental en spec
├─ El fix tiene implicaciones de seguridad
└─ Hay incertidumbre sobre cómo proceder

COMUNICAR CLARAMENTE:
"Encontré que X. Propongo Y. Sin embargo:
[Incertidumbre/riesgo]
¿Debería proceder con [approach], o hay alternativa mejor?"
```

---

## IX. Herramientas & Comandos para Codex

### 9.1 Inspección Rápida

```bash
# Verificar alineación spec vs. código
grep "REGLA:" spec.md
grep -r "TODO\|FIXME\|HACK" src/

# Validar logging
grep "mcp.tool" logging-events.md | wc -l
grep -r "logger\." src/ | grep -v "test\|mock" | wc -l

# Seguridad
grep -ri "password\|token\|secret" .logs/ | grep -v "REDACTED"

# Arquitectura
find src/ -name "*.ts" | head -20 | xargs wc -l | tail -1

# Validación
npm run type-check 2>&1 | grep -i error | head -10
npm run lint 2>&1 | grep -i error | head -10
```

### 9.2 Análisis de Logs

```bash
# Frecuencia de eventos
grep -o '"eventName":"[^"]*"' .logs/app.jsonl | sort | uniq -c | sort -rn

# Errores más comunes
grep '"level":"error"' .logs/app.jsonl | jq '.eventName' | sort | uniq -c

# Performance: operaciones lentas
grep '"level":"info"' .logs/app.jsonl | jq 'select(.context.durationMs > 5000) | {tool: .context.tool, duration: .context.durationMs}'

# Reintentos
grep -c "coolify.request.retry" .logs/app.log

# Redacción
grep -c "REDACTED" .logs/app.jsonl
```

---

## X. Límites y Cuándo Pedir Ayuda

### 10.1 Límites de Codex

Codex no puede:
- ❌ Cambiar la visión del proyecto sin aprobación
- ❌ Violer los principios de constitution.md
- ❌ Ignorar que "spec es la verdad"
- ❌ Implementar sin validación si es ambiguo

### 10.2 Cuándo Escalar a Humanos

Pide ayuda si:
```
□ El problema es conceptual (no entiendes por qué se diseñó así)
□ Hay múltiples approaches válidos y no sabes cuál elegir
□ La solución requiere cambio arquitectónico mayor
□ Hay riesgo de seguridad y necesitas validación
□ Contradice un principio de constitution.md
□ Hay incertidumbre sobre consecuencias
```

---

## XI. Quick Reference: Checklist de Codex Rescue

```
ANTES DE EMPEZAR:
□ ¿He leído spec.md, constitution.md, logging-events.md?
□ ¿Entiendo el contexto de qué intentaba hacer Claude Code?
□ ¿Tengo acceso a todos los logs/evidencia?

DURANTE INVESTIGACIÓN:
□ ¿He reproducido el problema?
□ ¿He analizado logs antes de adivinar?
□ ¿He validado contra especificación?
□ ¿He identificado la causa raíz?
□ ¿He considerado edge cases?

PROPUESTA DE FIX:
□ ¿Es mínimo (no toca más de lo necesario)?
□ ¿Cumple especificación?
□ ¿Tiene validación clara de que funciona?
□ ¿Identifica riesgos/side effects?

IMPLEMENTACIÓN:
□ ¿Fix está hecho?
□ ¿Logs validan que el problema está resuelto?
□ ¿Documentación actualizada?
□ ¿Hay nuevas ambigüedades que surgieron?

CIERRE:
□ ¿Reporte claro entregado?
□ ¿Todos los artefactos (código, docs) están sincronizados?
□ ¿Próximos pasos claros si hay follow-up?
```

---

## IX. Sincronización Obligatoria con Documentación Pública

### Cambios Sustanciales Requieren Actualización de README.md

**Cuando investigues un problema o implementes una solución que cambie sustancialmente el MCP, actualiza TAMBIÉN `README.md`.**

Los cambios sustanciales incluyen:

**Cambios en Funcionalidad o Comportamiento:**
- ✅ Nuevas tools o categorías de tools
- ✅ Cambios en comportamiento de tools existentes
- ✅ Nuevas características de seguridad o validación

**Cambios en Configuración:**
- ✅ Nuevas variables de entorno
- ✅ Cambios en requisitos de Node.js, npm u otras dependencias

**Cambios en Instalación:**
- ✅ Nuevos pasos en instalación
- ✅ Cambios en cómo configurar en Claude Code (`.mcp.json`)

**Regla**: Si tu investigación/solución afecta cómo instalan o usan el MCP → actualiza README.md para que usuarios finales vean los cambios.

---

**Última actualización**: 2026-05-11  
**Versión**: 1.0.0  
**Para**: Codex Agent
