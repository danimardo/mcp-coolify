# 🏛️ Gobernanza de Agentes de IA — MCP Coolify

**Versión**: 1.0.0  
**Última actualización**: 2026-05-11  
**Estado**: ✅ Implementado (Opción C)

---

## Resumen Ejecutivo

MCP Coolify implementa una **arquitectura de gobernanza explícita y multi-nivel** para colaboración de agentes de IA. Esta documentación define roles, responsabilidades, flujos de trabajo, estándares y escalada.

### Los 4 Pilares de la Gobernanza

1. **📖 Especificación es la Verdad**
   - Código DEBE cumplir spec.md
   - Cambios observables → documentación obligatoria
   - Ambigüedad → pregunta primero, no adivines

2. **🔐 Logging Estructurado Obligatorio**
   - Eventos estables (domain.category.event)
   - RequestId en todos los eventos
   - Redacción automática de secretos

3. **✅ Validación Defensiva**
   - Zod para TODOS los inputs
   - TypeScript strict mode
   - Tests mínimos obligatorios

4. **🛑 Confirmación para Operaciones Críticas**
   - Deletions, cambios destructivos, secretos
   - Sin confirmación explícita → no ejecutar

---

## 📚 Documentación de Gobernanza

### Nivel 1: Fundamentos (Lea Primero)

| Documento | Propósito | Audiencia |
|-----------|-----------|-----------|
| **[AGENTS.md](./AGENTS.md)** | Estándares **MANDATORIOS** para TODOS los agentes | 🤖 Todos los agentes |
| **[constitution.md](./.specify/memory/constitution.md)** | Principios, ADRs, frameworks no-negociables | 👥 Arquitectos, líderes |

### Nivel 2: Instrucciones Específicas por Agente

| Documento | Para Quién | Qué Cubre |
|-----------|-----------|----------|
| **[CLAUDE.md](./CLAUDE.md)** | Claude Code | Implementación, logging, troubleshooting, gobernanza |
| **[CODEX.md](./CODEX.md)** | Codex | Investigación, rescues, deep-dive analysis |
| **[GEMINI.md](./GEMINI.md)** | Gemini *(futuro)* | Validación, análisis, documentación |

### Nivel 3: Operacional (Cómo Trabajan Juntos)

| Documento | Propósito | Audiencia |
|-----------|-----------|-----------|
| **[docs/agent-practices.md](./docs/agent-practices.md)** | Guía operacional: flujos, coordinación, checklists | 👥 Equipos supervisando agentes |
| **[spec.md](./spec.md)** | Especificación técnica completa | 🏗️ Arquitectura |
| **[logging-events.md](./logging-events.md)** | Catálogo de 50+ eventos estables | 💻 Implementadores |

---

## 🚀 Quick Start por Rol

### Soy Desarrollador Implementando una Feature

1. Lee: **[AGENTS.md](./AGENTS.md)** (Sección I-V)
2. Lee: **[spec.md](./spec.md)** (sección de tu feature)
3. Lee: **[CLAUDE.md](./CLAUDE.md)** (Gobernanza)
4. Implementa validando contra spec.md
5. Usa **[AGENTS.md checklist](./AGENTS.md#checklist-de-finalización-de-tareas)** antes de completar

**Tiempo**: 5 min lectura + implementación

---

### Soy Codex Investigando un Problema

1. Lee: **[CODEX.md](./CODEX.md)** (Protocolos)
2. Lee: **[AGENTS.md](./AGENTS.md)** (Estándares obligatorios)
3. Sigue: **[CODEX.md Protocol](./CODEX.md#22-fases-de-investigación)** (5 fases)
4. Usa: **[CODEX.md Checklist](./CODEX.md#xi-quick-reference-checklist-de-codex-rescue)**
5. Reporta: Con evidencia clara (logs, código)

**Tiempo**: 30 min diagnóstico + investigación

---

### Soy Supervisor de Equipo

1. Entiende: **[docs/agent-practices.md](./docs/agent-practices.md)** (Flujos completos)
2. Valida: Que agentes siguen **[AGENTS.md](./AGENTS.md)**
3. Escala: Usa **[docs/agent-practices.md#escalada](./docs/agent-practices.md#escalada)** para bloqueadores
4. Audita: Con **[docs/agent-practices.md#checklists-operacionales](./docs/agent-practices.md#checklists-operacionales)**

**Tiempo**: Lectura 30 min, monitoreo continuo

---

### Soy Gemini (Futuro)

1. Lee: **[GEMINI.md](./GEMINI.md)** (Instrucciones específicas)
2. Lee: **[AGENTS.md](./AGENTS.md)** (Estándares obligatorios)
3. Haz: Validación/análisis según **[GEMINI.md Flujo](./GEMINI.md#31-flujo-de-trabajo-típico-de-gemini)**
4. Escala: Cuando necesites ejecución o decisión

**Tiempo**: 15 min - 1 hora (depende tarea)

---

## 🔗 Jerarquía de Autoridad

```
constitution.md (Principios: INMUTABLE)
    ↓
spec.md (Especificación: Código debe cumplir)
    ↓
logging-events.md (Eventos: Qué emitir)
    ↓
AGENTS.md (Estándares: MANDATORIO para TODOS)
    ↓
CLAUDE.md, CODEX.md, GEMINI.md (Específicos por agente)
    ↓
docs/agent-practices.md (Operacional: Cómo colaboran)
```

**Regla**: Si hay conflicto, escalas hacia ARRIBA. Constitution.md siempre gana.

---

## 📋 Las 5 Reglas de Oro

Memoriza estas 5 — cubren el 80% de la gobernanza:

1. 📖 **Documenta primero** — Spec es la verdad. Código debe alinearse.
2. 🛑 **Pregunta antes** — Ambigüedad = pregunta, no adivinanza.
3. 📝 **Logging obligatorio** — Todo evento estable, todo con requestId, redacta secretos.
4. 🔍 **Inspecciona logs** — Problema = primero leer `.logs/app.log`, no adivinar.
5. ✅ **Valida todo** — Zod para inputs, TypeScript strict, testing mínimo.

---

## ⚡ Flujos Principales

### Implementación Estándar (Claude Code)
```
Leer spec → Implementar validando spec → Logging estructurado → 
Tests → Documentación → Checklist → ✅ Completo
```
**Tiempo**: 1-4 horas

### Investigación/Rescue (Codex)
```
Reproducir → Analizar logs → Validar vs. spec → Causa raíz → 
Proponer fix → Implementar → Validar → Reportar
```
**Tiempo**: 30 min diagnóstico + 1-3 horas rescue

### Validación Cruzada (Gemini)
```
Leer contexto → Validar alineación → Identificar gaps → 
Reportar → Proporcionar recomendaciones → Escalar si necesario
```
**Tiempo**: 15 min - 1 hora

---

## 🛠️ Herramientas & Comandos

### Ver Logs (cuando algo falla)
```bash
# En tiempo real (humano-legible)
tail -f .logs/app.log

# Estructurado (JSON)
tail -f .logs/app.jsonl | jq '.'

# Más detalles
LOG_LEVEL=debug npm start

# Buscar por evento o requestId
grep "mcp.tool.failed" .logs/app.log
grep "req-abc123" .logs/app.jsonl
```

### Validar Cambios
```bash
# Type checking
npm run type-check

# Linting (incluye prohibición console.*)
npm run lint

# Tests
npm run test

# Todo junto
npm run type-check && npm run lint && npm run test
```

---

## 📞 Cuándo Usar Cada Agente

| Necesito... | Invoca... | Por Qué |
|-------------|-----------|--------|
| Implementar feature documentada | **Claude Code** | Especialista en escritura de código |
| Investigar problema desconocido | **Codex** | Especialista en diagnóstico |
| Validar alineación a spec | **Gemini** *(futuro)* | Especialista en validación cruzada |
| Claridad sobre requerimiento | **Usuario/Líder** | Decisión arquitectónica |
| Problema no se resuelve | **Escalada** | Ver docs/agent-practices.md |

---

## ✅ Checklist de Implementación (Opción C)

- [x] **AGENTS.md** creado (estándares mandatorios)
- [x] **CLAUDE.md** ampliado con gobernanza
- [x] **CODEX.md** creado (protocolos de rescue)
- [x] **GEMINI.md** creado (plantilla para futuro)
- [x] **constitution.md** actualizado (sección "Agent Governance Principles")
- [x] **docs/agent-practices.md** creado (guía operacional)
- [x] **GOVERNANCE_SUMMARY.md** creado (resumen técnico)
- [x] **GOVERNANCE.md** creado (este archivo — índice)

---

## 🔄 Validar Que Todo Funciona

### Para Líder de Proyecto

Verificar que los agentes entienden y cumplen gobernanza:

```
□ Agentes leen AGENTS.md antes de comenzar
□ Los cambios cumplen criterios de aceptación
□ Logging incluye eventos estables + requestId
□ Secretos están redactados en logs
□ spec.md se actualiza cuando comportamiento cambia
□ Ambigüedad se escala, no se asume
```

### Para Desarrollador

Antes de marcar tarea como completada:

```
□ ¿Spec relevante está leído?
□ ¿Código cumple criterios?
□ ¿Logging es estructurado?
□ ¿Secretos están redactados?
□ ¿spec.md actualizado (si aplica)?
□ ¿Tests pasan?
□ ¿ESLint + TypeScript pasan?
```

---

## 🚨 Problemas Comunes

| Problema | Solución |
|----------|----------|
| Agente dice "No está claro" | Aclarar spec.md PRIMERO, no continuar sin claridad |
| Código contradice spec | Investigar qué es verdad (código o spec), documentar |
| Test falla | ¿Cambio es correcto pero test desactualizado? Actualizar test. ¿Cambio es incorrecto? Revertir |
| Secreto visible en logs | 🚨 CRÍTICO — Reportar como security issue |
| Agente atascado | Invocar Codex para investigación/rescue |

---

## 📖 Referencias Rápidas

### Leer Primero
- **AGENTS.md** — Estándares que DEBES conocer (15 min)
- **spec.md** sección 7 (Logging) — Crítico (15 min)
- **docs/agent-practices.md** — Flujos de trabajo (20 min)

### Referencia Durante Trabajo
- **AGENTS.md** checklist (antes de completar)
- **.logs/app.log** (cuando algo falla)
- **spec.md** (para validar comportamiento)

### Escalada
- **docs/agent-practices.md#escalada** (cómo escalar)
- **constitution.md** (si hay conflicto de principios)

---

## 💬 Comunicación

**Todas las comunicaciones en Español**, incluyendo:
- Explicaciones de cambios
- Comentarios en código
- Mensajes de commit
- Reportes de bugs

**Excepciones**: Identificadores técnicos (nombres de variables, URLs)

---

## 🎯 Objetivo Final

Una **arquitectura de gobernanza clara, observable y auditable** que asegura:

✅ **Calidad**: Código cumple especificación  
✅ **Trazabilidad**: Todo cambio tiene contexto y justificación  
✅ **Observabilidad**: Logging estructurado permite diagnosticar problemas  
✅ **Seguridad**: Secretos redactados, confirmación para operaciones críticas  
✅ **Alineación**: Agentes colaboran bajo reglas comunes  

---

## 📞 Preguntas Frecuentes

**P: ¿Necesito leer todo esto?**  
R: No. Lee AGENTS.md (mandatorio) + la sección de tu rol en este archivo.

**P: ¿Qué pasa si encuentro contradicción?**  
R: No adivines. Reporta inmediatamente (ver docs/agent-practices.md#escalada).

**P: ¿Cuándo se actualiza la gobernanza?**  
R: Cambios a constitution.md, AGENTS.md o spec.md requieren revisión — ver proceso en constitution.md.

**P: ¿Gemini ya está disponible?**  
R: No (en backlog). GEMINI.md es plantilla. Claude Code + Codex activos ahora.

---

**Última actualización**: 2026-05-11  
**Versión**: 1.0.0  
**Implementación**: ✅ Opción C Completada

---

## 🏁 Siguientes Pasos

1. **Revisar** esta documentación como equipo
2. **Ajustar** si hay cambios a tu visión
3. **Comunicar** a agentes: Leer AGENTS.md antes de trabajar
4. **Validar** primeros cambios usando checklists en docs/agent-practices.md
5. **Iterar** — La gobernanza evoluciona con el proyecto

¿Preguntas o ajustes necesarios?
