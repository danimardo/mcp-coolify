# Resumen de Gobernanza de Agentes — MCP Coolify

**Creado**: 2026-05-11  
**Versión**: 1.0.0  
**Propósito**: Visión general de la arquitectura de gobernanza implementada

---

## Archivos Creados / Modificados

### ✅ CLAUDE.md (Ampliado)
- **Estado anterior**: Contenía guía de logging y troubleshooting
- **Cambios**: Agregada nueva sección "Gobernanza, Estándares y Prácticas de Código"
- **Nuevas secciones**:
  - Documentos Normativos Obligatorios (referencias a spec, constitution, logging-events)
  - Reglas de Oro: Confirmación Obligatoria (pedir claridad ANTES de implementar)
  - Disciplina de Cambios (validación, cambios no especificados, documentación)
  - Herramientas Modernas (Context7, logging, inspección de logs)
  - Refactors No Autorizados
  - Cumplimiento y Validación

**Propósito**: Instrucciones específicas para Claude Code sobre gobernanza y estándares

---

### ✅ AGENTS.md (Nuevo)
- **Contenido**: 11 secciones de estándares mandatorios para TODOS los agentes
- **Audiencia**: Claude Code, Codex, Gemini y cualquier agente futuro
- **Secciones clave**:
  1. Comunicación y Documentos Obligatorios (idioma, documentos normativos, claridad)
  2. Validación contra Especificaciones (alineación obligatoria, discrepancias)
  3. Disciplina de Documentación Obligatoria (cambios observables documentados)
  4. Logging Estructurado (logger compartido, eventos estables, requestId, redacción)
  5. Refactors, Optimizaciones y "Arreglos" (prohibiciones)
  6. Type Safety y Validación (Zod obligatorio)
  7. Operaciones Críticas y Confirmación (categorías de operaciones)
  8. Criterios de Aceptancia y Trazabilidad
  9. Testing y Validación
  10. Comunicación de Limitaciones
  11. Las 5 Reglas de Oro (síntesis)

**Propósito**: Contrato obligatorio que TODOS los agentes deben seguir

---

### ✅ CODEX.md (Nuevo)
- **Contenido**: Instrucciones específicas para investigaciones y rescues
- **Audiencia**: Codex Agent (para investigación, debugging, diagnóstico)
- **Secciones clave**:
  1. Cuándo Invocar a Codex (situaciones ideales)
  2. Protocolo de Investigación (cómo briefear, fases de investigación)
  3. Análisis de Logs Profundo (patrones, correlación, redacción)
  4. Validación contra Especificación (checklist de alineación)
  5. Análisis de Impacto (validar cambios, edge cases)
  6. Rescues: Protocolos Especiales
  7. Deep-Dive Analysis Tasks (arquitectura, performance)
  8. Communication & Escalation
  9. Herramientas & Comandos
  10. Límites y Cuándo Pedir Ayuda
  11. Checklist de Rescue

**Propósito**: Maximizar capacidades de Codex para análisis técnico profundo

---

### ✅ GEMINI.md (Nuevo)
- **Contenido**: Instrucciones para Gemini (plantilla para integración futura)
- **Audiencia**: Gemini Agent (cuando se integre)
- **Secciones clave**:
  1. Posicionamiento en Equipo (cuándo usar Gemini, cuándo no)
  2. Estándares Obligatorios (debe seguir AGENTS.md)
  3. Flujo de Trabajo Típico (análisis, validación, documentación)
  4. Coordinación con Otros Agentes
  5. Tareas Específicas (auditoría, patrones, documentación, métricas)
  6. Limitaciones (no puede ejecutar, implementar, decidir por propios)
  7. Ejemplos de Trabajo (validación de PR, análisis de logs, documentación)
  8. Coordinación Asincrónica
  9. Escalada y Limitaciones
  10. Integración Futura

**Propósito**: Instrucciones claras para cuando Gemini se integre

---

## Jerarquía de Autoridad

```
AUTORIDAD MÁXIMA:
┌─────────────────────────────────────┐
│ constitution.md (Principios)        │
│ - Visionario, inflexible            │
│ - Principles, ADRs, non-negotiables │
└────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ spec.md (Especificación Técnica)    │
│ - Define comportamiento esperado    │
│ - Requiere cumplimiento             │
└────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ logging-events.md (Eventos Estables)│
│ - Cuáles eventos emitir y cuándo   │
└────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ AGENTS.md (Estándares Mandatorios)  │
│ - Lo que TODOS los agentes hacen    │
│ - Obligatorio para cualquier cambio │
└────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ CLAUDE.md, CODEX.md, GEMINI.md      │
│ - Instrucciones específicas de cada │
│   agente, respetando AGENTS.md      │
└────────────────────────────────────┘
```

---

## Flujos de Trabajo Implementados

### Flujo 1: Implementación Estándar (Claude Code)
```
1. Lee spec relevante + constitution.md + AGENTS.md + CLAUDE.md
2. Si no está claro → PREGUNTA PRIMERO
3. Implementa validando contra spec
4. Emite logging con eventos estables + requestId
5. Actualiza documentación
6. Valida que código cumple todos los estándares
7. Completado
```

### Flujo 2: Investigación/Rescue (Codex)
```
1. Recibe brief con contexto del problema
2. Reproduce y analiza logs
3. Valida contra spec.md + constitution.md
4. Identifica causa raíz
5. Propone fix mínimo
6. Implementa y valida
7. Reporta con evidencia clara
```

### Flujo 3: Validación Cruzada (Gemini, futuro)
```
1. Recibe propuesta de cambio o análisis
2. Valida alineación a spec.md
3. Identifica gaps/riesgos
4. Reporta hallazgos
5. Proporciona documentación/ejemplos (sin ejecutar)
6. Escala si necesario
```

---

## Estándares Clave Implementados

### ✅ Documentación Obligatoria
- **Regla**: Cambio observable = documentación en spec.md
- **Excepciones**: Solo cambios puramente internos (renombrar variable local, reformatear)
- **Validación**: Trazabilidad clara a criterios de aceptación

### ✅ Logging Estructurado
- **Regla**: Logger compartido, eventos estables (domain.category.event), requestId obligatorio
- **Eventos**: 50+ definidos en logging-events.md
- **Redacción**: Automática para tokens, passwords, keys
- **Inspección**: Siempre revisar .logs/app.log antes de adivinar

### ✅ Validación Defensiva
- **Regla**: Zod para TODOS los inputs
- **TypeScript**: Strict mode, sin `any`
- **Configuración**: Centralizada via bootstrap(), fail-fast

### ✅ Confirmación para Operaciones Críticas
- **4 categorías**: Deletions, cambios destructivos, creaciones en producción, secretos
- **Formato**: Mensaje claro con detalles de lo que se va a hacer

### ✅ Alineación a Especificación
- **Regla**: Código DEBE cumplir spec.md
- **Discrepancias**: Comunicar inmediatamente, no ignorar
- **Validación**: Antes de completar tarea

### ✅ Comunicación en Español
- **Obligatorio**: Todos los outputs, comentarios, commits
- **Excepciones**: Identificadores técnicos, URLs, mensajes de sistema

---

## Propuesta: Documentar en Especificaciones

### Opción A: Agregar sección a `constitution.md`
```
+ Nueva sección: "Agent Governance Principles"
  ├─ Referencias a AGENTS.md, CODEX.md, GEMINI.md
  ├─ Resumen de las 5 Reglas de Oro
  ├─ Flujos de trabajo esperados
  └─ Checklist de compliance
```

**Ventaja**: Constitution.md es el punto central de principios  
**Desventaja**: Hace constitution.md aún más largo  

---

### Opción B: Crear nuevo fichero `docs/agent-practices.md`
```
Nuevo fichero: docs/agent-practices.md
  ├─ Descripción de operacional de gobernanza
  ├─ Jerarquía de autoridad
  ├─ Flujos de trabajo
  ├─ Checklists
  └─ Referencias a AGENTS.md, CODEX.md, GEMINI.md
```

**Ventaja**: Documentación centralizada de prácticas  
**Desventaja**: Más un fichero para mantener  

---

### Opción C: Ambas (Recomendado)
```
1. Agregar sección a constitution.md ("Agent Governance Principles")
   - Referencias, resumen de principios
   - Enlace a AGENTS.md como documento maestro

2. Crear docs/agent-practices.md ("Agent Practices & Workflows")
   - Guía operacional detallada
   - Flujos, checklists, ejemplos
   - Referencia para agentes en ejecución

3. AGENTS.md sigue siendo el documento de referencia definitivo
   - Reglas detalladas
   - Estándares específicos
   - Checklists completos
```

**Ventaja**: Claridad máxima + facilidad de referencia  
**Mejor para**: Proyecto maduro con múltiples agentes

---

## Recomendación Final

Creo que la **Opción C es la mejor** porque:

1. **constitution.md** es fundacional pero ya es largo (600+ líneas)
   → Agregar sección "Agent Governance Principles" que apunta a AGENTS.md

2. **AGENTS.md** se convierte en el "documento maestro" de estándares
   → 11 secciones detalladas, checklists, ejemplos
   → Es lo que todos los agentes leen primero

3. **docs/agent-practices.md** (nuevo) proporciona contexto operacional
   → Flujos de trabajo, coordinación, ejemplos, guía visual
   → Para teams/managers que supervisan múltiples agentes

4. **CLAUDE.md, CODEX.md, GEMINI.md** son específicos por agente
   → Instrucciones personalizadas respetando AGENTS.md
   → Referencia rápida de qué hace cada agente

---

## Próximos Pasos Sugeridos

### Inmediato
- [ ] Revisar que AGENTS.md capture todos los estándares que necesitas
- [ ] Ajustar si hay discrepancias con tu visión
- [ ] Decidir si implementar Opción A, B o C

### Si implementas Opción C:
- [ ] Crear sección en constitution.md apuntando a AGENTS.md
- [ ] Crear docs/agent-practices.md (plantilla disponible arriba)
- [ ] Actualizar README.md con referencias a nuevos ficheros

### Verificación Continua
- [ ] Primeros cambios: asegúrate de que agentes siguen AGENTS.md
- [ ] Cuando Codex se use: validar que sigue CODEX.md
- [ ] Cuando Gemini se integre: configurar según GEMINI.md

---

## Resumen Ejecutivo

He creado una **arquitectura de gobernanza completa** para agentes de IA:

1. **AGENTS.md** — Estándares obligatorios para TODOS (11 secciones, 500+ líneas)
2. **CLAUDE.md** — Ampliado con gobernanza y estándares
3. **CODEX.md** — Protocolo de investigación y rescues (11 secciones)
4. **GEMINI.md** — Plantilla para integración futura

**Jerarquía clara**: constitution.md → spec.md → logging-events.md → AGENTS.md → (CLAUDE.md, CODEX.md, GEMINI.md)

**Propuesta**: Documentar en especificaciones via Opción C (sección en constitution.md + docs/agent-practices.md)

---

**Última actualización**: 2026-05-11  
**Versión**: 1.0.0
