# Implementation Plan: MCP Coolify Server

**Branch**: `001-mcp-coolify` | **Date**: 2026-05-12 | **Spec**: `specs/001-mcp-coolify/spec.md`  
**Input**: Feature specification from `/specs/001-mcp-coolify/spec.md` + Constitution from `.specify/memory/constitution.md`

**Status**: Phase 0 (Research) + Phase 1 (Design) Planning

## Summary

**MCP Coolify** es un servidor Model Context Protocol que expone ~107 herramientas para que agentes de IA gestionen infraestructura Coolify de forma auditable y segura. La implementación es incremental: MVP (~45 herramientas) → Fase 2 (~65) → Fase 3 (~107).

**Enfoque técnico**:
- Arquitectura de logging obligatorio con eventos estables (`domain.category.event`)
- Validación Zod en todos los inputs + respuestas de Coolify API
- Configuración centralizada con fail-fast en bootstrap
- Modo READ_ONLY bloqueando mutaciones
- Confirmación explícita para 19 operaciones críticas
- Redacción automática de secretos en logs

## Technical Context

**Language/Version**: TypeScript 5.0+ | Node.js 18.x LTS (recomendado 20.x)  
**Primary Dependencies**: 
- `@modelcontextprotocol/sdk` ^1.0.0 (MCP protocol)
- `zod` ^3.22.0 (validación runtime + type inference)
- `pino` ^8.16.0 (logging estructurado)
- `axios` ^1.6.0 (HTTP client con retry/timeout hooks)
- `dotenv` ^16.3.0 (env vars)
- `date-fns` ^2.30.0 (timezone handling)

**Storage**: N/A (solo interactúa con Coolify API v4)  
**Testing**: Vitest 0.34+ | Supertest 6.3+ para integration tests  
**Target Platform**: Node.js 18+, ejecutable vía stdio/HTTP  
**Project Type**: MCP server (CLI/API integration)  
**Performance Goals**: P95 latency < 5s, P99 < 10s, 99.5% availability  
**Constraints**: Timeout API 30s (configurable), max retries 3 (configurable), strings max 65535 chars  
**Scale/Scope**: ~107 tools en 13 categorías, ~2500+ líneas de especificación

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Non-Negotiable Pillars Validation** (from `.specify/memory/constitution.md`):

| Pilar | Verificación | Estado |
|-------|-------------|--------|
| **1. Zod validation para TODO** | Spec.md FR-003, FR-004: validación Zod obligatoria inputs + Coolify API responses | ✅ PASS |
| **2. Config centralizada (bootstrap)** | Spec.md FR-017, FR-019: centralized config, fail-fast bootstrap | ✅ PASS |
| **3. Logging estructurado + eventos estables** | Spec.md FR-010, FR-012, FR-013: structured logs, stable event names, requestId correlation | ✅ PASS |
| **4. Redacción automática de secretos** | Spec.md FR-011: automatic redaction of SENSITIVE_FIELDS | ✅ PASS |
| **5. Fail-fast en bootstrap** | Spec.md FR-016, FR-019: invalid config exits within 100ms, token validation | ✅ PASS |

**Non-Negotiable Architecture Decisions (ADRs)**:
- ✅ ADR-001 (Zod): Confirmado en spec + constitution
- ✅ ADR-002 (Config centralizada): `src/server/config.ts` como única fuente
- ✅ ADR-003 (Pino logging): Eventos estables, Pino obligatorio
- ✅ ADR-004 (READ_ONLY global): Bloquea POST/PATCH/DELETE, no granular
- ✅ ADR-005 (Confirmación crítica): 19 operaciones requieren confirmación explícita
- ✅ ADR-006 (Fases): MVP (~45) → Fase 2 (~65) → Fase 3 (~107)

**Gate Status**: ✅ **PASS** — Especificación alineada con constitución. Proceder a Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/001-mcp-coolify/
├── plan.md              # This file (Phase 0-1 planning output)
├── spec.md              # Feature specification (input)
├── research.md          # Phase 0 output (unknowns resolution)
├── data-model.md        # Phase 1 output (entities, relationships)
├── quickstart.md        # Phase 1 output (setup, first run)
├── contracts/           # Phase 1 output (tool definitions, MCP contract)
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (MCP Coolify Server)

```text
src/
├── lib/                         # Core libraries
│   ├── logging/                 # Logging infrastructure
│   │   ├── types.ts            # Logger contract + types
│   │   ├── events.ts           # Stable event names (50+)
│   │   ├── sanitize.ts         # Secret redaction
│   │   └── levels.ts           # Log levels definition
│   │
│   ├── mcp/                     # MCP protocol + tool registry
│   │   ├── registry.ts         # Centralized tool registry
│   │   ├── types.ts            # Tool definition types
│   │   └── invoker.ts          # Tool invocation handler
│   │
│   ├── coolify/                 # Coolify API client
│   │   ├── client.ts           # HTTP client (axios + retry/timeout)
│   │   ├── errors.ts           # API error handling
│   │   └── types.ts            # Coolify API types
│   │
│   └── config.ts               # Centralized config re-export
│
├── server/                      # Server initialization
│   ├── config.ts               # Bootstrap + env validation (Zod)
│   ├── logging/
│   │   ├── logger.server.ts    # Pino logger setup
│   │   ├── formatters.ts       # Log formatting (human/JSON)
│   │   ├── file-transports.ts  # .logs/ file output
│   │   └── bootstrap.ts        # Logger initialization
│   ├── mcp/
│   │   ├── handler.ts          # Request handler
│   │   └── server.ts           # MCP server setup
│   └── bootstrap.ts            # Main initialization sequence
│
├── tools/                       # 13 tool categories (~107 total)
│   ├── default/                # Default tools (4): version, health, enable_api, disable_api
│   │   └── index.ts
│   ├── teams/                  # Teams (4): current, list, get, members
│   │   └── index.ts
│   ├── projects/               # Projects (9): list, get, create, update, delete, environments
│   │   ├── index.ts
│   │   └── handlers.ts
│   ├── applications/           # Applications (19): list, get, logs, create, update, delete, etc.
│   │   ├── index.ts
│   │   └── handlers.ts
│   ├── deployments/            # Deployments (5): list, get, trigger, cancel, etc.
│   │   └── index.ts
│   ├── databases/              # Databases (21): list, get, create, backups, etc.
│   │   ├── index.ts
│   │   └── handlers.ts
│   ├── services/               # Services (13): list, get, create, env vars, etc.
│   │   ├── index.ts
│   │   └── handlers.ts
│   ├── servers/                # Servers (8): list, get, create, validate, etc.
│   │   └── index.ts
│   ├── resources/              # Resources (1): unified view
│   │   └── index.ts
│   ├── private-keys/           # Private Keys (5)
│   │   └── index.ts
│   ├── github-apps/            # GitHub Apps (7)
│   │   └── index.ts
│   ├── cloud-tokens/           # Cloud Tokens (6)
│   │   └── index.ts
│   └── hetzner/                # Hetzner (5)
│       └── index.ts
│
└── main.ts                      # Entry point

tests/                           # Test structure mirrors src/
├── unit/
│   ├── logging/
│   ├── config/
│   ├── coolify/
│   └── tools/
├── integration/
│   ├── bootstrap.test.ts
│   ├── tools/
│   └── logging.test.ts
└── mocks/
    └── coolify-api.ts          # Mock Coolify API responses

.logs/                          # Generated at runtime (dev only, .gitignored)
├── app.log                     # Human-readable logs
└── app.jsonl                   # JSON Lines structured logs

Configuration:
├── .env.example                # Template with all env vars
├── .env                        # Local override (.gitignored)
├── tsconfig.json               # TypeScript strict mode
├── .eslintrc.js               # ESLint rules (no console, no any)
└── package.json                # Dependencies + scripts
```

**Structure Decision**: Single monolithic Node.js/TypeScript project with clear separation:
- **lib/** = Reusable libraries (logging, config, API client)
- **server/** = Server bootstrap + MCP protocol handler
- **tools/** = 13 categories of ~107 tools (grouped by domain)
- **tests/** = Mirrors src/ structure for unit + integration tests
- **docs** = Architecture + specifications in repo root

---

## Phase 0 & Phase 1: Completion Summary

### ✅ Phase 0: Research (COMPLETE)

**Artifacts Generated**:
- ✅ `research.md` (508 líneas) — All clarifications resolved, technology validated

**Status**: All unknowns clarified (Q&A from spec.md session 2026-05-12)

### ✅ Phase 1: Design (COMPLETE)

**Artifacts Generated**:
1. ✅ `data-model.md` (500+ líneas) — 7 core entities, relationships, validation rules, state transitions
2. ✅ `contracts/tool-definitions.md` (600+ líneas) — MCP protocol contract, tool schemas, error formats, confirmation flow
3. ✅ `quickstart.md` (400+ líneas) — Setup guide, test scenarios, troubleshooting
4. ✅ `plan.md` (this file) — Architecture planning, complexity tracking

**Agent Context Updated**:
- ✅ CLAUDE.md updated with plan reference and artifact links
- ✅ Agent context points to all design documents

**Design Documents Summary**:

| Document | Lines | Purpose |
|----------|-------|---------|
| research.md | 508 | Phase 0: Resolved unknowns, technology validation |
| data-model.md | 500+ | Phase 1: Entities, relationships, validation, state flows |
| tool-definitions.md | 600+ | Phase 1: MCP contract, tool schemas, error handling |
| quickstart.md | 400+ | Phase 1: Setup, testing, troubleshooting |

**Total Phase 0-1 Output**: ~2000+ líneas de documentación de diseño

---

## Next Phase: Phase 2 (Task Generation)

**Command to Execute Next**: `/speckit-tasks`

This will:
1. ✅ Generate `tasks.md` with actionable implementation tasks
2. ✅ Order tasks by dependencies
3. ✅ Assign effort estimates and complexity ratings
4. ✅ Link each task to acceptance criteria from spec.md

**Expected Scope**: ~45 tasks for MVP Phase 1 implementation

---

## Design Validation Checklist

**Constitution Check**: ✅ PASS (all non-negotiables satisfied)

**Specification Alignment**: ✅ PASS (design matches spec.md)

**Architecture Decisions**: ✅ Documented (all ADRs justified)

**Error Handling**: ✅ Standardized (all error codes defined)

**Confirmation Flow**: ✅ Specified (19 critical operations documented)

**Logging Strategy**: ✅ Complete (event names, requestId correlation, secrets redaction)

**Tool Categories**: ✅ All 13 defined (counts verified: 107 total, 45 MVP)

---

## Key Design Decisions Locked

Based on constitution.md + spec.md:

1. ✅ **Zod Validation**: All inputs + Coolify API responses validated
2. ✅ **Centralized Config**: Bootstrap fail-fast pattern in src/server/config.ts
3. ✅ **Pino Logging**: Structured events, automatic redaction, requestId correlation
4. ✅ **Stable Event Names**: domain.category.event format (50+ events)
5. ✅ **READ_ONLY Mode**: Global flag blocks POST/PATCH/DELETE/start/stop/restart
6. ✅ **Confirmation Flow**: 19 critical operations require explicit approval
7. ✅ **Exponential Backoff**: Retries with 1s, 2s, 4s delays for transient errors
8. ✅ **Bearer Token Auth**: Coolify API standard
9. ✅ **TypeScript Strict Mode**: No `any` types, no unused variables
10. ✅ **Performance SLA**: P95 < 5s, P99 < 10s, 99.5% availability

All design decisions are **non-negotiable per constitution.md**.

## Complexity Tracking

> Justified architectural complexities (non-negotiable per constitution)

| Complejidad | Por Qué es Necesaria | Alternativa Rechazada Porque |
|-------------|-------------------|-----|
| **Logging multi-capa** (Pino + file transports + redacción) | Auditoría obligatoria + seguridad (no loguear secrets) + observabilidad (requestId correlation) | `console.log` no garantiza redacción automática, no correlaciona requests, no produce JSON estructurado |
| **Tool registry centralizado** (107 tools, 13 categorías) | Spec requiere validación Zod para CADA tool, confirmación para 19 operaciones críticas | Implementar tools directamente sin registry = duplicación de lógica de validación/confirmación/logging |
| **Confirmación stateful** (request → approval → execute) | Spec FR-015: operaciones críticas requieren confirmación explícita (MCP client callback) | Sin confirmación = alto riesgo de cambios accidentales en producción |
| **Retry con exponential backoff** (1s, 2s, 4s) | Spec FR-006: resilencia para fallos transitorios (429, 5xx), respeta Retry-After | Reintentos lineales más lentos, no respeta standard Retry-After |
| **Redacción a nivel logger** (SENSITIVE_FIELDS) | Spec FR-011: 95% coverage mínimo, zero tolerance para secretos en logs | Redactar manualmente en handlers = error-prone, fácil olvidar un campo |
| **Validación Zod en 3 puntos** (params, respuesta API, config env) | Spec FR-003, FR-004, FR-016: DRY (una fuente de verdad), type inference, runtime safety | Solo TypeScript types = sin validación runtime, errores silenciosos en producción |

**Conclusión**: Toda complejidad está justificada por requisitos no-negociables (constitution.md + spec.md). No se pueden simplificar sin comprometer seguridad/auditoría/resilencia.
