# Guía de Prácticas Operacionales de Agentes — MCP Coolify

**Versión**: 1.0.0  
**Última actualización**: 2026-05-11  
**Audiencia**: Desarrolladores, líderes de equipo, cualquiera supervisando agentes de IA

---

## Introducción

MCP Coolify implementa una **arquitectura de gobernanza explícita** para agentes de IA. Este documento proporciona la guía operacional: cómo trabajan los agentes juntos, cuáles son los flujos, cuándo escalar, y cómo validar que todo está en alineación.

**Documento maestro de estándares**: Ver `AGENTS.md` para reglas detalladas.

---

## Tabla de Contenidos

1. [Jerarquía de Autoridad](#jerarquía-de-autoridad)
2. [Roles de Agentes](#roles-de-agentes)
3. [Flujos de Trabajo](#flujos-de-trabajo)
4. [Coordinación Multi-Agente](#coordinación-multi-agente)
5. [Escalada](#escalada)
6. [Checklists Operacionales](#checklists-operacionales)
7. [Troubleshooting](#troubleshooting)

---

## Jerarquía de Autoridad

```
NIVEL 0: PRINCIPIOS FUNDAMENTALES
┌────────────────────────────────────────┐
│ constitution.md                        │
│ - Visión y principios no-negociables   │
│ - ADRs (Architectural Decision Records)│
│ - Frameworks obligatorios              │
└────────────────────────────────────────┘

NIVEL 1: ESPECIFICACIÓN TÉCNICA
┌────────────────────────────────────────┐
│ spec.md + logging-events.md            │
│ - Comportamiento esperado              │
│ - Eventos que deben emitirse           │
│ - Configuración y variables            │
└────────────────────────────────────────┘

NIVEL 2: ESTÁNDARES DE AGENTES
┌────────────────────────────────────────┐
│ AGENTS.md                              │
│ - Reglas MANDATORIAS para TODOS       │
│ - Checklists de compliance             │
│ - Prohibiciones explícitas             │
└────────────────────────────────────────┘

NIVEL 3: INSTRUCCIONES ESPECÍFICAS
┌─────────────────────────────────────────────┐
│ CLAUDE.md | CODEX.md | GEMINI.md            │
│ - Qué hace cada agente                      │
│ - Cuándo invocar cada uno                   │
│ - Protocolos específicos (rescues, etc.)    │
└─────────────────────────────────────────────┘

NIVEL 4: OPERACIONAL
┌────────────────────────────────────────┐
│ agent-practices.md (este archivo)      │
│ - Flujos concretos de trabajo          │
│ - Cómo los agentes se comunican        │
│ - Checklists ejecutables               │
└────────────────────────────────────────┘
```

**Regla de oro**: Si hay conflicto, escalas hacia arriba. Constitution.md siempre gana.

---

## Roles de Agentes

### Claude Code (Implementador)

**Responsabilidad**: Implementar cambios especificados

**Cuándo usarlo**:
- ✅ Feature implementación (clara en spec.md)
- ✅ Bug fixes con causa raíz identificada
- ✅ Cambios documentados en especificación
- ✅ Tareas rutinarias dentro de scope especificado

**Cuándo NO usarlo**:
- ❌ Problema sin diagnóstico claro (usar Codex)
- ❌ Ambigüedad fundamental (pedir claridad primero)
- ❌ Refactors no especificados
- ❌ Investigación complejaó especulativa

**SLA esperado**:
- Implementación: 1-4 horas (depende scope)
- Validación: ✅ AGENTS.md checklist completo
- Output: Código + documentación actualizada

---

### Codex (Investigador/Rescatista)

**Responsabilidad**: Investigar, diagnosticar, rescatar cuando algo se queda atascado

**Cuándo usarlo**:
- ✅ Error sin mensaje claro (investigar raíz)
- ✅ Comportamiento anómalo (analyzelogically)
- ✅ Claude Code se quedó atascado (rescue)
- ✅ Validación de impact (análisis de cambios)
- ✅ Deep-dive arquitectura o seguridad

**Cuándo NO usarlo**:
- ❌ Implementación rutinaria (usar Claude Code)
- ❌ Cambios simples documentados
- ❌ Tareas administrativas

**SLA esperado**:
- Diagnóstico: 30 min - 2 horas
- Reporte: Con evidencia clara (logs, codigo, análisis)
- Rescue implementation: 1-3 horas si es autorizado
- Output: Reporte + fix implementado (si aplica)

---

### Gemini (Validador/Analizador)

**Responsabilidad**: Validar alineación, análisis cruzado, documentación (cuando integrado)

**Cuándo usarlo** (cuando esté disponible):
- ✅ Validar alineación a spec.md
- ✅ Análisis de logs para extractar patrones
- ✅ Generación de documentación
- ✅ Auditoría de compliance
- ✅ Generación de test cases

**Cuándo NO usarlo**:
- ❌ No ejecutar código (no tiene shell)
- ❌ No decidir por propios (todo requiere confirmación)
- ❌ No está disponible aún (en backlog)

**SLA esperado**:
- Validación: 15-45 min
- Análisis: 30 min - 1 hora
- Output: Reporte con hallazgos + recomendaciones

---

## Flujos de Trabajo

### Flujo 1: Implementación Estándar

```
INICIO
  │
  ├─ Usuario solicita feature/cambio
  │
  ├─ Claude Code lee:
  │   ├─ AGENTS.md (estándares obligatorios)
  │   ├─ spec.md (qué hacer)
  │   └─ constitution.md (principios)
  │
  ├─ ¿Está claro al 100%?
  │   ├─ SÍ → continuar
  │   └─ NO → PEDIR CLARIDAD (no adivines)
  │
  ├─ Implementar validando:
  │   ├─ Zod para validación
  │   ├─ Logging eventos estables + requestId
  │   ├─ TypeScript strict
  │   ├─ Eventos de log según logging-events.md
  │   └─ Criterios de aceptación
  │
  ├─ Tests + validación:
  │   ├─ npm run type-check ✅
  │   ├─ npm run lint ✅
  │   └─ Tests pasan ✅
  │
  ├─ Documentación:
  │   ├─ ¿Comportamiento observable cambió?
  │   │   ├─ SÍ → actualizar spec.md
  │   │   └─ NO → OK
  │   └─ Referencia a criterios de aceptación
  │
  ├─ Validación final (AGENTS.md sección VIII):
  │   ├─ ¿Spec relevante leída? ✅
  │   ├─ ¿Código cumple criterios? ✅
  │   ├─ ¿Logging correcto? ✅
  │   ├─ ¿Secretos redactados? ✅
  │   ├─ ¿spec.md actualizado? ✅
  │   └─ ¿Tests pasan? ✅
  │
  └─ COMPLETADO

TIEMPO TÍPICO: 1-4 horas (depende complejidad)
```

---

### Flujo 2: Investigación y Rescue (Codex)

```
INICIO
  │
  ├─ Claude Code encuentra problema O
  ├─ Usuario solicita investigación
  │
  ├─ Codex lee:
  │   ├─ CODEX.md (protocolos específicos)
  │   ├─ AGENTS.md (estándares)
  │   └─ spec.md + constitution.md
  │
  ├─ FASE 1: Reproducir
  │   ├─ ¿Puedo reproducir? ✅/❌
  │   └─ Pasos exactos documentados
  │
  ├─ FASE 2: Recopilación
  │   ├─ Analizar .logs/app.log
  │   ├─ Buscar por eventName/requestId
  │   └─ Identificar patrón exacto
  │
  ├─ FASE 3: Análisis Raíz
  │   ├─ Examinar código relacionado
  │   ├─ Comparar vs. especificación
  │   └─ Identificar CAUSA RAÍZ (no síntoma)
  │
  ├─ FASE 4: Propuesta
  │   ├─ Proponer fix MÍNIMO
  │   ├─ Validar vs. spec.md
  │   └─ Identificar riesgos
  │
  ├─ FASE 5: Validación
  │   ├─ Implementar fix (si autorizado)
  │   ├─ Verificar síntoma desaparece
  │   ├─ Verificar no hay regressions
  │   └─ Actualizar documentación
  │
  ├─ REPORTE (CODEX.md sección VIII):
  │   ├─ Resumen ejecutivo
  │   ├─ Problema detectado
  │   ├─ Causa raíz
  │   ├─ Solución implementada
  │   ├─ Validación realizada
  │   └─ Documentación actualizada
  │
  └─ COMPLETADO

TIEMPO TÍPICO: 30 min diagnóstico, 1-3 horas rescue si autorizado
```

---

### Flujo 3: Validación Cruzada (Gemini, futuro)

```
INICIO
  │
  ├─ Claude Code propone cambio O
  ├─ Codex reporta hallazgos O
  ├─ Usuario solicita auditoría
  │
  ├─ Gemini lee:
  │   ├─ GEMINI.md (instrucciones específicas)
  │   ├─ AGENTS.md (estándares)
  │   └─ Contexto del cambio/análisis
  │
  ├─ VALIDACIÓN RÁPIDA:
  │   ├─ ¿Cumple spec.md? ✅/❌
  │   ├─ ¿Sigue AGENTS.md? ✅/❌
  │   ├─ ¿Alineado a constitution.md? ✅/❌
  │   └─ ¿Hay gaps o riesgos?
  │
  ├─ ANÁLISIS (si aplica):
  │   ├─ Extrae patrones de código/logs
  │   ├─ Identifica inconsistencias
  │   ├─ Propone documentación/ejemplos
  │   └─ NO ejecuta código
  │
  ├─ REPORTE:
  │   ├─ ✅ Cumple / ❌ No cumple
  │   ├─ Hallazgos clave (con evidencia)
  │   ├─ Recomendaciones
  │   └─ Si hay bloqueador: ESCALA
  │
  └─ COMPLETADO

TIEMPO TÍPICO: 15 min - 1 hora (análisis asincrónico)
```

---

## Coordinación Multi-Agente

### Comunicación entre Agentes

#### Claude Code ↔ Codex

**Claude Code** necesita investigación:
```
"Encontré un problema con [X]:
- Error: [descripción]
- Pasos para reproducir: [...]
- ¿Puedes investigar?"

→ Codex investiga y reporta
→ Claude Code implementa fix basado en hallazgos
```

**Codex** completa rescue:
```
"Rescue completado para problema [X]:

CAUSA RAÍZ: [descripción]
SOLUCIÓN: [fix implementado]
VALIDACIÓN: [cómo validar]

Cambios en:
- src/file1.ts (línea X-Y)
- spec.md (sección Z actualizada)
"

→ Claude Code revisa/acepta
→ Si hay ajustes, lo maneja
```

#### Validación Cruzada (Gemini)

**Gemini** valida propuesta:
```
"He validado tu implementación de [X]:

✅ Cumple:
- spec.md sección Y
- constitution.md principio Z
- AGENTS.md logging estándar

⚠️ Encontré:
- [Gap o riesgo específico]
- [Recomendación]

¿Proceder con ajuste?"

→ Claude Code ajusta si es necesario
→ Continúa flujo
```

### Patrones de Comunicación

| Situación | Patrón | SLA |
|-----------|--------|-----|
| Claude Code: "No entiendo qué hacer" | Pedir claridad, NO adivinar | Inmediato |
| Claude Code: "Esto me tiene atascado" | Invocar Codex rescue | < 4 horas |
| Codex: "Encontré problema X" | Reportar con evidencia | < 8 horas |
| Gemini: "Validé tu cambio" | Reporte con recomendaciones | Asincrónico |
| Desacuerdo en spec: | Escalda a usuario/líder | Inmediato |

---

## Escalada

### Cuándo Escalar

**Escala a usuario/líder si**:
```
□ Contradicción fundamental en spec.md
□ Violación de principio de constitution.md
□ Riesgo de seguridad
□ Scope que se expande más allá de lo planeado
□ Múltiples approaches válidos sin consenso
□ Ambigüedad que no se puede resolver en equipo de agentes
```

### Cómo Escalar

```
ESTRUCTURA DE ESCALADA:

Asunto: [Breve descripción del bloqueo]

Contexto:
- ¿Qué se intentaba hacer?
- ¿Dónde se quedó atascado?

Problema:
- Descripción clara
- Evidencia (logs, código, spec)

Opciones consideradas:
- Opción A: [Pro/Con]
- Opción B: [Pro/Con]

Requiero:
- [ ] Aclaración de [X]
- [ ] Decisión sobre [Y]
- [ ] Validación de [Z]

Tiempo sensible: [SÍ/NO]
```

---

## Checklists Operacionales

### Checklist: Antes de Delegar a Claude Code

```
□ ¿Tarea está claramente especificada?
  └─ Referencia a spec.md
□ ¿Criterios de aceptación están definidos?
  └─ Observable, testeable
□ ¿Hay contexto suficiente?
  └─ Qué cambió, por qué, qué hay alrededor
□ ¿Hay ambigüedad?
  └─ SI → Aclarar primero. NO → Proceder

PROCEDER: ✅
```

---

### Checklist: Antes de Invocar Codex

```
□ ¿El problema es claro?
  └─ Síntoma descrito, pasos para reproducir
□ ¿He intentado reproducirlo?
  └─ "No sé qué pasó" es insuficiente
□ ¿He revisado .logs/app.log?
  └─ Qué dicen los logs
□ ¿He buscado en AGENTS.md/spec.md primero?
  └─ ¿Es un problema conocido/especificado?

PROCEDER: ✅
```

---

### Checklist: Después de Codex Rescue

```
□ ¿Entiendo la causa raíz?
  └─ Explicada claramente
□ ¿El fix es mínimo?
  └─ No refactoriza lo que no es necesario
□ ¿Puedo validar que funciona?
  └─ Logs muestran problema resuelto
□ ¿La documentación está actualizada?
  └─ spec.md refleja cambio si es observable
□ ¿Hay riesgos identificados?
  └─ Aceptados, mitigados, o documentados

ACEPTAR: ✅
```

---

### Checklist: Validación de Gemini (Futuro)

```
□ ¿Reporte es específico?
  └─ Evidencia clara, referencias a código/logs
□ ¿Hallazgos son accionables?
  └─ Puedo hacer algo con esta información
□ ¿Cumple criterios de aceptación?
  └─ Sí / No / Necesita ajuste
□ ¿Hay riesgos identificados?
  └─ Claramente listados

PROCEDER: ✅
```

---

### Checklist: Finalización de Tarea

Usar para CUALQUIER tarea (Claude Code, Codex, etc.):

```
ANTES DE MARCAR COMO "COMPLETADO":

Especificación:
□ ¿Spec relevante está leído?
□ ¿Código cumple criterios de aceptación?
□ ¿Cambio altera comportamiento observable?
  ├─ SÍ → ¿spec.md actualizado?
  └─ NO → OK

Logging:
□ ¿Se emiten eventos esperados?
□ ¿RequestId presente en todos?
□ ¿DurationMs incluido?
□ ¿Secretos redactados?

Validación:
□ ¿ESLint pasa?
□ ¿TypeScript pasa?
□ ¿Tests pasan?
□ ¿Validado en desarrollo?

Documentación:
□ ¿Cambios documentados?
□ ¿Referencias a criterios de aceptación?
□ ¿README actualizado (si aplica)?

MARCAR COMO COMPLETADO: ✅
```

---

## Troubleshooting

### Problema: Agente Dice "No Está Claro"

**Síntoma**: Agente solicita aclaración

**Qué hacer**:
1. Revisa spec.md — ¿es ambiguo?
2. Si ambigüedad existe, aclarar PRIMERO
3. Si no es claro pero debería serlo, actualizar spec.md
4. Agente re-intenta con spec clarificada

**Tiempo**: Parar y aclarar (no continuar sin claridad)

---

### Problema: Agente Se Queda Atascado

**Síntoma**: Claude Code no puede proceder, Codex con problema complejo

**Qué hacer**:
1. Si Claude Code → Invocar Codex para investigación
2. Si Codex → Escalada a usuario (problema fundamental)
3. Usar reporte de escalada (ver Escalada arriba)

**Tiempo**: < 4 horas para diagnóstico

---

### Problema: Discrepancia Spec vs. Código

**Síntoma**: Código hace X pero spec dice Y

**Qué hacer**:
1. Parar trabajo actual
2. Investigar: ¿código está mal o spec desactualizada?
3. Comunicar discrepancia claramente
4. Esperar aclaración antes de proceder

**Tiempo**: Inmediato, no asumir

---

### Problema: Test Falla Después de Cambio

**Síntoma**: npm run test falla

**Qué hacer**:
1. Revisa qué test falla (¿es esperado?)
2. ¿El cambio es correcto pero test desactualizado?
   - SÍ → Actualizar test
   - NO → Revertir cambio
3. Validar que cambio sigue spec.md

**Tiempo**: < 30 min resolución

---

### Problema: ¿Necesito Documentar Este Cambio?

**Regla Simple**:
```
¿El cambio altera comportamiento observable?
  ├─ SÍ → DOCUMENTAR en spec.md
  └─ NO → OK omitir (si es cambio puramente interno)

SÍ, cuando cambias:
  ✅ Parámetros de tool
  ✅ Respuestas de API
  ✅ Eventos de logging
  ✅ Comportamiento observable
  ✅ Reglas de negocio
  
NO, cuando cambias:
  ❌ Variable local (invisible externamente)
  ❌ Formatting/comentarios
  ❌ Nombres internos
```

---

## Referencia Rápida

| Necesito... | Documento | Sección |
|------------|-----------|---------|
| Estándares obligatorios | AGENTS.md | Todas |
| Implementar algo | CLAUDE.md | Gobernanza |
| Investigar problema | CODEX.md | Protocolo |
| Validar cambio | GEMINI.md | Flujo típico |
| Entender principios | constitution.md | Principles |
| Especificación | spec.md | Todas |
| Eventos logging | logging-events.md | Todas |
| Cómo trabajan agentes | agent-practices.md | Flujos |

---

## Conclusión

MCP Coolify opera bajo **gobernanza explícita** con:

✅ **Jerarquía clara** — constitution.md → AGENTS.md → instrucciones específicas  
✅ **Roles definidos** — Claude Code, Codex, Gemini con responsabilidades claras  
✅ **Flujos estandarizados** — Implementación, Rescue, Validación  
✅ **Checklists operacionales** — Qué validar en cada etapa  
✅ **Escalada clara** — Cuándo y cómo escalar bloqueadores  

**Objetivo**: Máxima calidad, trazabilidad y alineación a especificación.

---

**Última actualización**: 2026-05-11  
**Versión**: 1.0.0
