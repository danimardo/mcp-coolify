# Estándares Mandatorios para Agentes de IA — MCP Coolify

**Versión**: 1.0.0  
**Última actualización**: 2026-05-11  
**Aplicable a**: Claude Code, Codex, Gemini y otros agentes que colaboren en este proyecto

---

## Preámbulo

Este documento establece **reglas no-negociables** que TODOS los agentes de IA deben seguir cuando trabajan en MCP Coolify. Estas reglas aseguran gobernanza, calidad, seguridad y trazabilidad.

**No es una sugerencia. Es un contrato.**

---

## I. Comunicación y Documentos Obligatorios

### 1.1 Idioma

- ✅ **TODOS los outputs**: Español
- ✅ **TODOS los comentarios de código**: Español
- ✅ **TODOS los commits**: Español (mensajes de commit)
- ✅ **TODAS las instrucciones**: Español

**Excepciones permitidas**:
- Identificadores técnicos (nombres de variables, funciones, rutas) permanecen en inglés
- Mensajes de error del sistema/librerías (no modificables)
- URLs y referencias externas

### 1.2 Documentos Normativos — Lectura Obligatoria

Antes de tocar CUALQUIER código, familia con:

1. **`spec.md`** — Especificación técnica (sección 7: Logging es crítica)
2. **`.specify/memory/constitution.md`** — Principios, frameworks, ADRs
3. **`logging-events.md`** — Catálogo de eventos estables
4. **`specs/001-mcp-coolify/spec.md`** — Criterios de aceptación de features
5. **`CLAUDE.md`** — Troubleshooting y gobernanza
6. **`AGENTS.md`** (este archivo) — Reglas para agentes

**Si necesitas hacer algo que no está en estos documentos:**
→ Pregunta primero. No implementes en el vacío.

### 1.3 Claridad y Ambigüedad

**Si detectas ambigüedad:**
- ❌ **NO adivines** cómo debería funcionar
- ✅ **Pregunta explícitamente** — lista exactamente qué es ambiguo
- ✅ **Espera aclaración** antes de implementar

**Ejemplo**:
```
❌ MALO: "Implementaré la característica X tal como creo que debería ser"
✅ BUENO: "La sección 3.2 dice 'validar parámetros'. ¿Significa:
  A) Validación con Zod antes de API call?
  B) Validación solo si es requerido?
  C) Validación con estructura X?
  ¿Cuál es correcta?"
```

---

## II. Validación contra Especificaciones (Crítico)

### 2.1 Alineación Obligatoria

Todo cambio DEBE estar alineado con:
- ✅ `spec.md` (comportamiento técnico esperado)
- ✅ `constitution.md` (principios y marcos no-negociables)
- ✅ `logging-events.md` (eventos de log que se deben emitir)
- ✅ Criterios de aceptación en la feature spec

### 2.2 Discrepancias — Comunicar, No Ignorar

Si el código existente **contradice la documentación**:

1. 🚨 **DETENTE** — No continúes asumiendo
2. 📢 **COMUNICA** — Explica claramente la discrepancia:
   - Qué dice la documentación
   - Qué hace el código
   - Por qué crees que hay discrepancia
3. ⏸️ **ESPERA** — Autorización antes de cambiar
4. 📝 **DOCUMENTA** — Una vez resuelto, actualiza spec/documentación

**Ejemplo**:
```
He encontrado una discrepancia:
- spec.md sección 4.3 dice: "Si READ_ONLY=true, blocar POST/PATCH/DELETE"
- El código en src/middleware/read-only.ts NO bloquea PATCH
- ¿Es un bug o la spec es incorrecta?

Propongo: Actualizar código para bloquear PATCH, o actualizar spec si es intencional.
```

### 2.3 Cambios No Especificados

Si la tarea **no está cubierta** en los documentos normativos:

1. 📝 **Propón el cambio** como design doc o diff de ejemplo
2. ⏸️ **NO implementes** hasta tener confirmación explícita
3. 📄 **Una vez aprobado**, actualiza la documentación relevante

---

## III. Disciplina de Documentación Obligatoria

### 3.1 Cambios Observables → Documentación

**REGLA SIMPLE**: Si un cambio altera el comportamiento observable, DEBE estar en `spec.md`.

**Qué debes documentar**:
- ✅ Correcciones de bugs que cambian comportamiento
- ✅ Ajustes de lógica o reglas de negocio
- ✅ Nuevos eventos de logging
- ✅ Nuevas métricas o campos en respuestas
- ✅ Nuevas variables de entorno
- ✅ Cambios en arquitectura (si afecta comportamiento)

**Qué PUEDES omitir**:
- ❌ Renombrar una variable local (invisible externamente)
- ❌ Reformatear código (no cambia output)
- ❌ Optimizaciones internas puras (mismo comportamiento, más rápido)

**Validación**: Si tienes que justificar "por qué puedo omitir", entonces probable que debas documentarlo.

### 3.2 Ubicación de Documentación

```
Cambio de... → Documentar en...
─────────────────────────────────────────────────────
Comportamiento API/Tool → spec.md sección 8 (Especificación de Tools)
Arquitectura/Decisión   → constitution.md sección "ADRs"
Evento de logging       → logging-events.md + spec.md sección 7
Variables de entorno    → spec.md sección 3 (Configuración)
Feature completa        → specs/001-mcp-coolify/spec.md (feature spec)
```

### 3.3 Formato de Documentación

Cuando documentes cambios, sigue el estilo existente:

```markdown
# Cambio X

**Descripción**: Qué cambió y por qué
**Impacto**: Qué usuarios/sistemas se ven afectados
**Antes**: Comportamiento anterior (si es aplicable)
**Después**: Comportamiento nuevo

## Ejemplo
```

---

## IV. Logging Estructurado (Obligatorio)

### 4.1 Logger Compartido

**REGLA**: Usa SIEMPRE el logger compartido, NUNCA `console.*` en código de aplicación.

```typescript
// ✅ CORRECTO
import { logger } from '$lib/logging/logger.server';

logger.info('mcp.tool.completed', {
  tool: 'restart_application',
  requestId: 'req-abc123def456',
  durationMs: 2543,
  result: 'success'
});

// ❌ PROHIBIDO
console.log('Tool completado');  // ESLint lo rechaza
console.error('Error');           // ESLint lo rechaza
```

**Enforcement**: ESLint rechaza `console.*` en código de aplicación (excepto en logging/).

### 4.2 Eventos Estables Obligatorios

Todos los eventos DEBEN usar nombres estables en formato `domain.category.event`:

```
PERMITIDO:
✅ mcp.tool.invoked
✅ mcp.tool.completed
✅ coolify.request.started
✅ validation.failed

PROHIBIDO:
❌ tool started
❌ request complete
❌ api call done
```

**Referencia**: Ver `logging-events.md` para el catálogo completo (50+ eventos).

### 4.3 RequestId Obligatorio

Todo evento relacionado con una solicitud DEBE incluir `requestId`:

```typescript
const requestId = generateRequestId();  // UUID o similar

logger.info('mcp.tool.invoked', {
  tool: 'restart_application',
  requestId: requestId  // ← OBLIGATORIO
});

logger.debug('coolify.request.started', {
  endpoint: '/applications/app-123/restart',
  requestId: requestId  // ← OBLIGATORIO
});

logger.info('mcp.tool.completed', {
  tool: 'restart_application',
  requestId: requestId,  // ← OBLIGATORIO
  durationMs: 2543
});
```

**Por qué**: Permite correlacionar logs de una solicitud individual a través de múltiples eventos.

### 4.4 Redacción de Secretos

**REGLA**: Tokens, passwords, API keys, cookies se redactan automáticamente. Pero:

- ✅ El sistema redacta automáticamente campos conocidos (`token`, `password`, `api_key`, etc.)
- ❌ NUNCA copies datos sensibles de logs a explicaciones
- ❌ NUNCA muestres "lo que viste en el log" si contenía secretos
- ❌ NUNCA creas logs con secretos "accidentalmente visibles"

**Si encuentras un secret en logs:**
1. Reporta como bug de seguridad inmediatamente
2. Proporciona logs sin el secret

### 4.5 Inspeccionar Logs Antes de Adivinar

**REGLA CRÍTICA**: Si algo falla o se comporta raro, LEE LOS LOGS primero.

```bash
# 1. Ver logs en tiempo real
tail -f .logs/app.log

# 2. Si necesitas más detalle
LOG_LEVEL=debug npm start

# 3. Buscar por nombre de evento
grep "mcp.tool.failed" .logs/app.log

# 4. Buscar por requestId
grep "req-abc123" .logs/app.log

# 5. Si aún no entiendes, PREGUNTA proporcionando logs (sin secrets)
```

**NUNCA**: "Creo que el problema es X" sin revisar logs primero.

---

## V. Refactors, Optimizaciones y "Arreglos"

### 5.1 Prohibiciones Explícitas

- ❌ **Refactorizar** "porque se vería mejor" sin estar especificado
- ❌ **Optimizar** "porque sería más rápido" si cambia comportamiento observable
- ❌ **Reorganizar** archivos/estructura sin justificación documentada
- ❌ **"Limpiar código"** si altera comportamiento de alguna forma
- ❌ **"Mejorar"** cosas que no están en la tarea

### 5.2 Permitido

- ✅ Refactoring puro (extraer función, renombrar variable LOCAL)
- ✅ Optimizaciones que NO cambien output observables
- ✅ Reorganización de archivos si SOLO es mover código sin cambios
- ✅ Cambios de formatting si NO altera semántica

### 5.3 Cuando en Duda → Pregunta

**Antes de hacer CUALQUIER cambio que no esté explícitamente solicitado:**

→ Pregunta si está alineado con la especificación

---

## VI. Type Safety y Validación (Obligatorio)

### 6.1 Zod para Todos los Inputs

**REGLA**: Cada parámetro de tool, cada respuesta externa, cada variable de entorno DEBE validarse con Zod.

```typescript
// ✅ CORRECTO
const CreateServerSchema = z.object({
  name: z.string().min(3),
  ip: z.string().ip(),
  port: z.number().int().min(1).max(65535)
});

type CreateServerParams = z.infer<typeof CreateServerSchema>;

const params = CreateServerSchema.parse(input);
// Si invalido → Zod lanza error automáticamente

// ❌ PROHIBIDO
type CreateServerParams = {
  name: string;
  ip: string;
  port: number;
};

const params = input as CreateServerParams; // Sin validación
```

### 6.2 TypeScript Strict Mode

- ✅ `noImplicitAny: true`
- ✅ `strict: true`
- ✅ ESLint rechaza `any` types

**Si te encuentras usando `any`:**
1. Detente
2. Pregunta por qué el typing es difícil
3. Refactoriza para un tipo explícito

---

## VII. Operaciones Críticas y Confirmación

### 7.1 Operaciones que Requieren Confirmación

**REGLA**: Ciertas operaciones son tan destructivas que DEBEN requerir confirmación explícita.

**Categoría 1 — Deletions (irreversibles)**:
- delete_project, delete_application, delete_environment
- delete_database, delete_service, delete_server
- delete_private_key, delete_github_app, delete_cloud_token

**Categoría 2 — Cambios destructivos**:
- cancel_deployment, stop_application, stop_database, stop_service

**Categoría 3 — Creaciones en producción**:
- trigger_deployment (especialmente en main/production)
- create_hetzner_server (implicación financiera)

**Categoría 4 — Secretos**:
- create_private_key, create_cloud_token, create_github_app

**Si implementas un tool nuevo y no sabes si requiere confirmación:**
→ Pregunta. Es mejor ser conservador.

---

## VIII. Criterios de Aceptancia y Trazabilidad

### 8.1 Referencia a Criterios

Cada cambio debe poder trazarse a un criterio de aceptación:

```
Tarea: Implementar get_application_logs

Referencia a spec:
- spec.md sección 8.1 define el tool
- Criterio de aceptación: "Respuesta incluye requestId, durationMs, logs"
- Evento logging: logging-events.md define "mcp.tool.completed"

Validación:
□ Tool retorna requestId en response
□ Evento "mcp.tool.completed" se emite con durationMs
□ Logs son structurados sin secretos
□ Documentación de spec.md actualizada
```

### 8.2 Ambigüedad = Pregunta

Si un criterio de aceptación es ambiguo o contradictorio:

**NO ADIVINES.**

Pregunta explícitamente:
- Qué significa exactamente
- Casos límite esperados
- Formato esperado de salida

---

## IX. Testing y Validación

### 9.1 Mínimo Requerido

Por cada cambio de comportamiento:
- ✅ Tests unitarios (validación, logging)
- ✅ Tests de integración (si afecta API)
- ✅ Validación manual en desarrollo

### 9.2 Checklist Antes de "Completar"

```
□ ¿Spec relevante está leído y entendido?
□ ¿Código cumple criterios de aceptación?
□ ¿Eventos de logging se emiten como esperado?
□ ¿RequestId + durationMs + nivel correcto?
□ ¿Secretos están redactados en logs?
□ ¿spec.md actualizado si comportamiento cambió?
□ ¿ESLint + TypeScript pasan?
□ ¿Tests pasan?
□ ¿Validado localmente en desarrollo?
□ ¿Documentación (si es aplicable) actualizada?
```

---

## X. Comunicación de Limitaciones

### 10.1 Si No Puedes Hacer Algo

**NO ocultes limitaciones o problemas.**

Comunica claramente:
1. **Qué quisiste hacer**
2. **Qué impidió que lo hagas**
3. **Qué se necesitaría para hacerlo**
4. **Alternativas (si las hay)**

```
MALO:
"El feature está listo"
(en realidad, hay un bug que no entiendes)

BUENO:
"El feature está implementado, pero encontré un problema:
- [Descripción del problema]
- Causa: [Lo que pasó]
- Para resolverlo: [Qué se necesita]
- Por ahora: [Workaround o si no hay, cuáles son las implicaciones]"
```

---

## XI. Síntesis: Las 5 Reglas de Oro

Si solo recuerdas 5 cosas:

1. 📖 **Documenta primero** — Spec es la verdad. Código debe alinearse.
2. 🛑 **Pregunta antes** — Ambigüedad = pregunta, no adivinanza.
3. 📝 **Logging obligatorio** — Todo evento estable, todo con requestId, redacta secretos.
4. 🔍 **Inspecciona logs** — Problema = primero leer `.logs/app.log`, no adivinar.
5. ✅ **Valida todo** — Zod para inputs, TypeScript strict, testing mínimo.

---

## XII. Recursos Rápidos

### Archivos Clave

| Archivo | Para qué |
|---------|----------|
| `spec.md` | Qué comportamiento es esperado |
| `constitution.md` | Principios y marcos que NO se negocian |
| `logging-events.md` | Qué eventos debes emitir |
| `CLAUDE.md` | Troubleshooting y gobernanza |
| `AGENTS.md` (este) | Reglas para todos los agentes |
| `.logs/app.log` | Leer cuando algo falla |

### Comandos Útiles

```bash
# Ver logs en tiempo real
tail -f .logs/app.log

# Ver logs estructurados
tail -f .logs/app.jsonl | jq '.'

# Más detalle
LOG_LEVEL=debug npm start

# Buscar por evento
grep "mcp.tool.failed" .logs/app.log

# Buscar por requestId
grep "req-abc123" .logs/app.log

# Validar tipos + ESLint
npm run type-check && npm run lint
```

### Cuándo Preguntar

Pregunta SIEMPRE si:
- 🤔 No está 100% claro qué hacer
- 📖 La spec está incompleta o ambigua
- 🐛 Encontraste contradicción entre spec y código
- 🔄 Necesitas refactorizar o hacer "mejoras"
- ⚠️ No sabes si algo requiere confirmación
- 🧪 No sabes qué testing es suficiente

---

## XIII. Sincronización Obligatoria con Documentación Pública

### 13.1 Cambios Sustanciales Requieren Actualización de README.md

**Cualquier cambio que afecte sustancialmente al MCP debe documentarse TAMBIÉN en `README.md`.**

Los cambios sustanciales incluyen:

**A) Cambios en Funcionalidad o Comportamiento del MCP:**
- ✅ Nuevas tools o categorías de tools
- ✅ Cambios en el comportamiento de tools existentes
- ✅ Cambios en operaciones (creación, eliminación, actualización)
- ✅ Nuevas características de seguridad o validación
- ✅ Cambios en eventos de logging o auditoría

**B) Cambios en Configuración del MCP:**
- ✅ Nuevas variables de entorno (agregar a sección `.env`)
- ✅ Cambios en cómo se configura el MCP
- ✅ Cambios en parámetros de compilación o ejecución
- ✅ Cambios en requisitos de Node.js, npm, u otras dependencias

**C) Cambios en Instalación del MCP:**
- ✅ Nuevos pasos en el proceso de instalación
- ✅ Cambios en estructura de directorios relevantes
- ✅ Cambios en dependencias principales
- ✅ Cambios en cómo configurar en Claude Code (`.mcp.json`)

### 13.2 Regla de Sincronización

```
Documentos Internos (Especificación):
├─ spec.md
├─ logging-events.md
├─ CLAUDE.md
└─ AGENTS.md

Documentación Pública (Para usuarios finales):
└─ README.md  ← DEBE estar sincronizado con cambios sustanciales
```

**Si cambias:**
1. 📝 **Spec internos** (spec.md, CLAUDE.md) — documenta el cambio técnico
2. 📚 **README.md** — documenta el cambio en términos que entienda un usuario

**Si NO actualizas README.md cuando el cambio es sustancial:**
- ❌ Los usuarios verán instrucciones desactualizadas
- ❌ La instalación/configuración fallará para nuevos usuarios
- ❌ Se crearán issues por documentación desincronizada

### 13.3 Ejemplos

**Ejemplo 1: Agregar nueva variable de entorno**
```
CAMBIO: Agregar LOG_TIMEZONE a .env
ACCIÓN: 
  ✅ Actualizar spec.md (qué es, rango de valores)
  ✅ Actualizar CLAUDE.md (cómo usarlo)
  ✅ Actualizar README.md sección "Configuración (.env)"
    └─ Agregar descripción y ejemplo de LOG_TIMEZONE
```

**Ejemplo 2: Agregar nuevo requisito de Node.js**
```
CAMBIO: Cambiar requisito mínimo de Node 18 a Node 20
ACCIÓN:
  ✅ Actualizar spec.md (sección requisitos)
  ✅ Actualizar README.md sección "Requisitos Previos"
    └─ Node.js: 20.x o superior (era 18.x)
```

**Ejemplo 3: Cambiar cómo configurar en Claude Code**
```
CAMBIO: Cambiar estructura de ~/.claude/mcp.json
ACCIÓN:
  ✅ Actualizar spec.md
  ✅ Actualizar README.md sección "Conectar a Claude Code"
    └─ Mostrar estructura nueva de mcp.json
```

---

**Última actualización**: 2026-05-11  
**Versión**: 1.0.0  
**Aplicable a**: Todos los agentes de IA

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
<!-- SPECKIT END -->
