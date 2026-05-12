# Implementation Tasks: MCP Coolify Server

**Feature**: MCP Coolify — Node.js MCP server exposing Coolify API v4 as ~107 tools  
**Branch**: `001-mcp-coolify`  
**Phase**: MVP Phase 1 Implementation  
**Status**: Task Plan Generated  
**Date**: 2026-05-12

---

## Executive Summary

**Total Tasks**: 47 implementation tasks across 3 phases  
**MVP Scope**: 45 tools in 6 user story increments  
**Phases**:
- **Phase 1 (Setup)**: 5 tasks — Project initialization & infrastructure
- **Phase 2 (Foundational)**: 11 tasks — Core logging, config, MCP handler (blocks all user stories)
- **Phase 3-8 (User Stories)**: 31 tasks — 6 user stories in priority order (P1, P2)

**User Stories Covered** (in priority order):
1. **US1 (P1)** — AI Agent Invokes Infrastructure Tools (Core MCP tool execution)
2. **US2 (P1)** — Auditable Infrastructure Operations (Logging & correlation)
3. **US4 (P1)** — Validated Data Contracts with Zod (Validation & error handling)
4. **US6 (P1)** — Critical Operations Confirmation (Confirmation flow for 19 operations)
5. **US3 (P2)** — Safe Inspection with READ_ONLY Mode (Safety guardrail)
6. **US5 (P2)** — Resilient API Communication (Retry logic & resilience)

**Parallel Execution**: ~18 tasks can execute in parallel (marked with [P])

---

## Implementation Strategy

### MVP Minimum (Just US1)
**Scope**: 8 tasks (Phase 1 + Phase 2 + Phase 3)  
Delivers: Basic tool execution, parameter validation, logging  
Effort: ~40 hours  

### Phase 1 Complete (US1-4)
**Scope**: 27 tasks (Phase 1 + Phase 2 + Phase 3-6)  
Delivers: Core infrastructure, logging, validation, confirmation  
Effort: ~60 hours  

### Full MVP Phase 1 (US1-6, all P1+P2)
**Scope**: All 47 tasks  
Delivers: Complete MVP with all safety features, retry logic  
Effort: ~80 hours  

---

## PHASE 1: Setup & Project Initialization

**Goal**: Create project structure, install dependencies, configure tooling  
**Duration**: ~4 hours  
**Blocking**: ALL subsequent phases (foundational)

### Setup Tasks

- [x] **T001** Initialize TypeScript project structure with npm workspaces
  - `src/lib/`, `src/server/`, `src/tools/`, `tests/` directories
  - `package.json` with exact versions (see spec.md Technology Versions)
  - `tsconfig.json` with strict mode enabled
  - `.eslintrc.js` with no-console, no-any rules

- [x] **T002** [P] Install and configure build tools
  - Install: TypeScript, ESLint, Vitest, Supertest
  - Configure: `npm run build`, `npm run lint`, `npm run test`
  - Create: GitHub Actions workflow for CI (optional, focus on local first)

- [x] **T003** [P] Create environment configuration system (`.env.example`)
  - Document all 10 required/optional environment variables
  - Create `.env.example` template with defaults and descriptions
  - Add `.env` to `.gitignore`

- [x] **T004** Create initial directory structure for 13 tool categories
  - `src/tools/{default,teams,projects,applications,deployments,servers,databases,services,resources,private-keys,github-apps,cloud-tokens,hetzner}`
  - Each category: `index.ts` with exports
  - Create `src/tools/README.md` explaining categorization

- [x] **T005** [P] Set up Git hooks and pre-commit checks
  - Configure `husky` for pre-commit ESLint + TypeScript check
  - Create `.git/hooks/pre-commit` to run `npm run check` (ESLint + tsc)
  - Document in README

---

**Status**: ✅ Ready for Phase 2 (Foundational blocks)

---

## PHASE 2: Foundational Infrastructure (Blocks All User Stories)

**Goal**: Implement core infrastructure (logging, config, MCP handler)  
**Duration**: ~12 hours  
**Blocking**: All user story phases (US1-6)  
**Test After**: Run bootstrap + logging unit tests

### Logging Infrastructure

- [x] **T006** [P] Implement Pino logger with file transports
  - `src/server/logging/logger.server.ts` — Pino setup with Pino plugins
  - File transports: `.logs/app.log` (human) + `.logs/app.jsonl` (JSON Lines)
  - Formatters: Human-readable timestamps (Madrid timezone) + JSON serialization
  - **Files**: `src/server/logging/logger.server.ts`, `src/server/logging/formatters.ts`, `src/server/logging/file-transports.ts`

- [x] **T007** [P] Implement automatic secret redaction system
  - `src/lib/logging/sanitize.ts` — SENSITIVE_FIELDS list (token, password, api_key, authorization, etc.)
  - Logger hook to redact before serialization
  - Unit tests: Verify tokens replaced with `[REDACTED]`
  - **Files**: `src/lib/logging/sanitize.ts`, `tests/unit/logging/sanitize.test.ts`

- [x] **T008** Implement structured event naming system
  - `src/lib/logging/events.ts` — Catalog of 50+ stable event names (domain.category.event)
  - TypeScript enum or const for all event names (prevents typos)
  - Map from spec.md + constitution.md
  - **Files**: `src/lib/logging/events.ts`, `logging-events.md` (reference doc)

### Configuration & Bootstrap

- [x] **T009** [P] Implement centralized config with Zod validation
  - `src/server/config.ts` — Bootstrap function that validates env vars
  - ConfigSchema (Zod) with all required/optional variables
  - Fail-fast: Exit(1) if config invalid
  - **Files**: `src/server/config.ts`, `tests/unit/server/config.test.ts`

- [x] **T010** [P] Implement application bootstrap sequence
  - `src/server/bootstrap.ts` — Orchestrates startup:
    1. Load config (ConfigSchema)
    2. Initialize logger
    3. Validate Coolify token (GET /version)
    4. Register MCP tools (from registry)
    5. Start MCP server
  - Emit bootstrap events: started → config_loaded → token_validated → completed (or failed)
  - **Files**: `src/server/bootstrap.ts`, `tests/integration/bootstrap.test.ts`

### Coolify API Client

- [x] **T011** [P] Implement Coolify HTTP client with retry logic
  - `src/lib/coolify/client.ts` — Axios-based HTTP client
  - Exponential backoff for 429, 5xx (1s, 2s, 4s)
  - Respect Retry-After header
  - Timeout enforcement (default 30s)
  - Error categorization: retryable vs. non-retryable
  - **Files**: `src/lib/coolify/client.ts`, `tests/unit/coolify/client.test.ts`

### MCP Protocol Handler

- [x] **T012** [P] Implement MCP tool registry and invoker
  - `src/lib/mcp/registry.ts` — Central registry of all tools
  - Interface: `ToolDefinition` (name, inputSchema, handler, isMutating, requiresConfirmation)
  - Methods: `register()`, `get()`, `list()`, `invoke()`
  - **Files**: `src/lib/mcp/registry.ts`, `src/lib/mcp/types.ts`

- [x] **T013** Implement MCP request handler with validation pipeline
  - `src/server/mcp/handler.ts` — Main tool invocation handler:
    1. Parse MCP request
    2. Validate parameters (Zod)
    3. Check READ_ONLY flag
    4. Check confirmation requirement
    5. Invoke Coolify API
    6. Validate response (Zod)
    7. Return result + metadata
  - Emit: tool.invoked → parameters_validated → completed/failed
  - **Files**: `src/server/mcp/handler.ts`, `tests/integration/mcp/handler.test.ts`

- [x] **T014** [P] Implement MCP server setup (stdio transport)
  - `src/server/mcp/server.ts` — MCP server factory
  - Transport: stdio (stdin/stdout)
  - Register: All tools from registry
  - Graceful shutdown handling
  - **Files**: `src/server/mcp/server.ts`, `src/main.ts`

- [x] **T015** Create utility for generating requestId (UUID v4)
  - `src/lib/utils/request-id.ts` — UUID v4 generation
  - Distributed via ToolContext to all tools
  - **Files**: `src/lib/utils/request-id.ts`

- [ ] **T016** [P] Create test fixtures for Coolify API mocking
  - `tests/mocks/coolify-api.ts` — Mock Coolify responses
  - Helper: `mockCoolifyResponse(status, body)`, `mockError(status, code)`
  - Mock endpoints: /version, /applications, /projects, etc.
  - **Files**: `tests/mocks/coolify-api.ts`

---

**Status**: ✅ Ready for Phase 3 (User Story 1)

---

## PHASE 3: User Story 1 — AI Agent Invokes Infrastructure Tools (P1)

**Goal**: Core MCP tool execution with parameter validation  
**Duration**: ~8 hours  
**Blocks**: None (independent, but foundation for US2-6)  
**Test**: Invoke `list_applications` → verify response structure + logging

### US1 Implementation Tasks

- [x] **T017** [US1] [P] Implement Zod schemas for Default tools (4 tools)
  - `src/tools/default/schemas.ts`
  - Schemas: `GetVersionSchema`, `GetHealthSchema`, `EnableApiSchema`, `DisableApiSchema`
  - **Files**: `src/tools/default/schemas.ts`

- [x] **T018** [US1] [P] Implement Zod schemas for Teams tools (4 tools)
  - `src/tools/teams/schemas.ts`
  - Schemas for: get_current_team, list_all_teams, get_team_by_id, get_current_team_members
  - **Files**: `src/tools/teams/schemas.ts`

- [x] **T019** [US1] [P] Implement Zod schemas for Projects tools (3 tools for MVP)
  - `src/tools/projects/schemas.ts`
  - Schemas: `ListProjectsSchema`, `GetProjectSchema`, `CreateProjectSchema`
  - **Files**: `src/tools/projects/schemas.ts`

- [x] **T020** [US1] [P] Implement Zod schemas for Applications tools (6 tools for MVP)
  - `src/tools/applications/schemas.ts`
  - Schemas: list, get, logs, start, stop, restart (6 total)
  - **Files**: `src/tools/applications/schemas.ts`

- [x] **T021** [US1] [P] Implement handlers for Default tools
  - `src/tools/default/handlers.ts`
  - Call Coolify API endpoints (GET /version, POST /settings, etc.)
  - Validate responses with outputSchema
  - **Files**: `src/tools/default/handlers.ts`

- [x] **T022** [US1] [P] Implement handlers for Teams tools
  - `src/tools/teams/handlers.ts`
  - Call Coolify API endpoints (GET /teams/*, etc.)
  - Map Zod responses to outputSchema
  - **Files**: `src/tools/teams/handlers.ts`

- [x] **T023** [US1] [P] Implement handlers for Projects tools (list, get, create)
  - `src/tools/projects/handlers.ts`
  - Call Coolify API endpoints
  - **Files**: `src/tools/projects/handlers.ts`

- [x] **T024** [US1] [P] Implement handlers for Applications tools (MVP: list, get, logs, start/stop/restart)
  - `src/tools/applications/handlers.ts`
  - Call Coolify API endpoints
  - Handle mutating operations (start/stop/restart with isMutating=true)
  - **Files**: `src/tools/applications/handlers.ts`

- [x] **T025** [US1] Register all Default + Teams + Projects + Applications tools in MCP registry
  - `src/tools/index.ts` — Import all and register ~17 tools
  - Each tool: name, description, inputSchema, handler, isMutating, requiresConfirmation, category
  - **Files**: `src/tools/default/index.ts`, `src/tools/teams/index.ts`, `src/tools/projects/index.ts`, `src/tools/applications/index.ts`, `src/tools/index.ts`

- [ ] **T026** [US1] [P] Create integration tests for US1: Tool invocation
  - Test: Invoke `list_applications` with valid params → get results
  - Test: Invoke with invalid UUID → get VALIDATION_FAILED error
  - Test: Verify response structure matches outputSchema
  - Test: Verify tool.invoked + tool.completed events logged
  - **Files**: `tests/integration/us1-tool-invocation.test.ts`

- [ ] **T027** [US1] Test Coolify connectivity and error handling
  - Test: Mock Coolify returning 404 → tool returns structured error
  - Test: Mock Coolify returning 500 → tool fails (no retry yet, that's US5)
  - Test: Mock network timeout → tool returns NETWORK_ERROR
  - **Files**: `tests/integration/coolify-errors.test.ts`

---

**Status**: ✅ Ready for Phase 4 (User Story 2)

---

## PHASE 4: User Story 2 — Auditable Infrastructure Operations (P1)

**Goal**: Structured logging with requestId correlation and secret redaction  
**Duration**: ~6 hours  
**Depends**: US1 (must have tools working)  
**Test**: Run tool, inspect `.logs/app.jsonl`, verify events + redaction

### US2 Implementation Tasks

- [x] **T028** [US2] Integrate requestId generation into tool execution
  - Pass requestId through ToolContext to all tool handlers
  - Include requestId in all log events (mcp.tool.*, coolify.request.*)
  - **Files**: `src/server/mcp/handler.ts` (already partially in T013)

- [x] **T029** [US2] [P] Implement structured logging for tool.* events
  - Emit: `mcp.tool.invoked` (tool, category, requestId)
  - Emit: `mcp.tool.parameters_invalid` (error details)
  - Emit: `mcp.tool.completed` (tool, requestId, durationMs, status)
  - Emit: `mcp.tool.failed` (tool, error code, requestId)
  - **Files**: `src/server/mcp/handler.ts`

- [x] **T030** [US2] [P] Implement structured logging for coolify.request.* events
  - Emit: `coolify.request.started` (endpoint, requestId)
  - Emit: `coolify.request.completed` (status, durationMs, requestId)
  - Emit: `coolify.request.failed` (status, error, requestId)
  - Emit: `coolify.rate_limit.hit` (for 429 responses)
  - **Files**: `src/lib/coolify/client.ts`

- [ ] **T031** [US2] [P] Implement requestId correlation in logs
  - Verify: Multiple events with same requestId are traceable
  - Test: Invoke tool → grep requestId in `.logs/app.jsonl` → trace all events
  - **Files**: `tests/integration/us2-logging-correlation.test.ts`

- [ ] **T032** [US2] Create integration test: Secret redaction in logs
  - Invoke tool with COOLIFY_TOKEN in context
  - Verify: Token does NOT appear in `.logs/app.jsonl`
  - Verify: `[REDACTED]` appears instead
  - Test multiple secret fields: token, password, api_key, authorization
  - **Files**: `tests/integration/us2-secret-redaction.test.ts`

- [ ] **T033** [US2] [P] Test log event structure and JSON validity
  - Verify: Each line in `.logs/app.jsonl` is valid JSON
  - Verify: Each event has required fields (timestamp, eventName, level)
  - Verify: requestId present for all tool/coolify events
  - Verify: durationMs present for completed events
  - **Files**: `tests/integration/us2-log-structure.test.ts`

---

**Status**: ✅ Ready for Phase 5 (User Story 4)

---

## PHASE 5: User Story 4 — Validated Data Contracts with Zod (P1)

**Goal**: Complete input/output validation, reject malformed data  
**Duration**: ~6 hours  
**Depends**: US1 (tools exist)  
**Test**: Pass invalid params → get VALIDATION_FAILED; receive malformed API response → get 500

### US4 Implementation Tasks

- [x] **T034** [US4] [P] Create comprehensive Zod schemas for MVP tools
  - Review all 17 MVP tools (4 default + 4 teams + 3 projects + 6 applications)
  - Verify inputSchema for each (parameters with min/max/regex)
  - Verify outputSchema for each (expected Coolify API response structure)
  - **Files**: `src/tools/{category}/schemas.ts` (extend existing)

- [ ] **T035** [US4] [P] Create integration tests: Parameter validation
  - Test UUID validation (invalid UUID → VALIDATION_FAILED)
  - Test integer bounds (port 1-65535)
  - Test string length limits
  - Test required vs. optional fields
  - Verify: Error message indicates which field failed
  - **Files**: `tests/integration/us4-parameter-validation.test.ts`

- [ ] **T036** [US4] Create integration tests: Response validation
  - Mock Coolify API returning malformed JSON (missing required fields)
  - Verify: Zod rejects before processing
  - Verify: Error logged, 500 returned to client
  - Test: Extra fields in response (Zod strict parsing rejects)
  - **Files**: `tests/integration/us4-response-validation.test.ts`

- [x] **T037** [US4] [P] Create bootstrap validation tests
  - Test missing COOLIFY_TOKEN → bootstrap fails
  - Test invalid COOLIFY_BASE_URL → bootstrap fails
  - Test invalid LOG_LEVEL → bootstrap fails
  - Verify: Exit code 1, app.bootstrap.failed logged
  - **Files**: `tests/integration/us4-bootstrap-validation.test.ts`

- [ ] **T038** [US4] Create error response format validation
  - All errors match: { error, message, details?, hint? }
  - Test: Validation error includes field + reason
  - Test: API error includes http_status + endpoint
  - **Files**: `tests/integration/us4-error-format.test.ts`

- [ ] **T039** [US4] Update CLAUDE.md with validation strategy notes
  - Document: Zod schemas live in `src/tools/{category}/schemas.ts`
  - Document: outputSchema validation in handlers before response
  - Document: SENSITIVE_FIELDS for redaction (in sanitize.ts)
  - **Files**: `CLAUDE.md` (append validation section)

---

**Status**: ✅ Ready for Phase 6 (User Story 6)

---

## PHASE 6: User Story 6 — Critical Operations Confirmation (P1)

**Goal**: Confirmation flow for 19 critical operations  
**Duration**: ~8 hours  
**Depends**: US1 (tools exist)  
**Test**: Invoke delete_* → expect confirmation; confirm → execute; reject → cancel

### US6 Implementation Tasks

- [x] **T040** [US6] Identify and mark 19 critical operations
  - Create mapping: tool name → requiresConfirmation = true
  - Categories: deletions (11) + destructive (4) + production (2) + secrets (2)
  - **Files**: `src/lib/mcp/critical-operations.ts` (new), `src/tools/index.ts` (update tools)

- [x] **T041** [US6] Implement confirmation token generation & validation
  - Generate: UUID v4 + 5-min TTL
  - Store: In-memory Map<token, { tool, params, expiresAt }>
  - Validate: Token exists + not expired + not already used
  - **Files**: `src/server/mcp/confirmation.ts`

- [x] **T042** [US6] [P] Implement confirmation request response format
  - Modify handler to return `{ confirmationRequired: true, operation, severity, message, details, confirmationToken }`
  - Message in Spanish, severity level (critical/high/medium)
  - **Files**: `src/server/mcp/handler.ts` (extend T013)

- [x] **T043** [US6] [P] Implement confirmed operation handler
  - Create tool (internally): Tool name + "_confirmed" suffix (e.g., delete_application → delete_application_confirmed)
  - Handler validates confirmationToken, then executes original tool
  - **Files**: `src/server/mcp/handler.ts`, `src/tools/index.ts`

- [x] **T044** [US6] Implement Deployments tools (4 for MVP)
  - Schemas: list_deployments, get_deployment, trigger_deployment (critical), cancel_deployment
  - Handlers with requiresConfirmation for trigger/cancel
  - **Files**: `src/tools/deployments/schemas.ts`, `src/tools/deployments/handlers.ts`, `src/tools/deployments/index.ts`

- [x] **T045** [US6] Register Deployments tools (4) + mark as critical where needed
  - trigger_deployment → requiresConfirmation: true
  - cancel_deployment → requiresConfirmation: true
  - **Files**: `src/tools/deployments/index.ts`, `src/tools/index.ts`

- [ ] **T046** [US6] [P] Create integration tests: Confirmation flow
  - Test: Invoke delete_application (critical) → confirmationRequired: true
  - Test: Confirm with valid token → executes, tool.completed logged
  - Test: Confirm with invalid token → CONFIRMATION_FAILED
  - Test: Confirm with expired token → CONFIRMATION_FAILED
  - Test: No confirm → operation.cancelled_by_user logged
  - **Files**: `tests/integration/us6-confirmation-flow.test.ts`

- [ ] **T047** [US6] Create integration tests: Confirmation edge cases
  - Test: Token reuse (second confirm fails)
  - Test: Token timeout (after 5 min)
  - Test: Concurrent operations with different tokens
  - **Files**: `tests/integration/us6-confirmation-edge-cases.test.ts`

---

**Status**: ✅ Ready for Phase 7 (User Story 3)

---

## PHASE 7: User Story 3 — Safe Inspection with READ_ONLY Mode (P2)

**Goal**: Block mutating operations when READ_ONLY=true  
**Duration**: ~4 hours  
**Depends**: US1 (tools exist)  
**Test**: READ_ONLY=true → restart_application blocked; list_applications works

### US3 Implementation Tasks

- [x] **T048** [US3] Implement READ_ONLY check in handler
  - Check: Config.READ_ONLY + tool.isMutating
  - If both true: Block before API call, emit read_only.blocked_operation, return 403
  - **Files**: `src/server/mcp/handler.ts` (extend T013)

- [ ] **T049** [US3] [P] Create integration tests: READ_ONLY mode
  - Test: READ_ONLY=true + list_applications → works
  - Test: READ_ONLY=true + restart_application → blocked with 403
  - Test: READ_ONLY=true + trigger_deployment → blocked
  - Test: READ_ONLY=false → all tools work (including mutations)
  - **Files**: `tests/integration/us3-read-only-mode.test.ts`

- [ ] **T050** [US3] Verify error message for READ_ONLY block
  - Error format: { error: "FORBIDDEN", message: "...", hint: "Desactiva READ_ONLY=false..." }
  - Verify in logs: read_only.blocked_operation event
  - **Files**: `tests/integration/us3-read-only-error.test.ts`

---

**Status**: ✅ Ready for Phase 8 (User Story 5)

---

## PHASE 8: User Story 5 — Resilient API Communication (P2)

**Goal**: Exponential backoff retry logic, respect Retry-After header  
**Duration**: ~6 hours  
**Depends**: US1 (tools exist), Coolify client (T011)  
**Test**: Mock 500 → verify retries with 1s, 2s, 4s delays; 400 → no retry

### US5 Implementation Tasks

- [x] **T051** [US5] [P] Implement exponential backoff in Coolify client
  - Retry on: 429, 500, 502, 503, 504 (up to 3 times by default)
  - Delays: 1s, 2s, 4s
  - No retry on: 400, 401, 403, 404, 422
  - **Files**: `src/lib/coolify/client.ts` (extend T011)

- [ ] **T052** [US5] [P] Implement Retry-After header support
  - Parse Retry-After header (seconds or HTTP-date)
  - If present: Use instead of exponential backoff
  - Log: coolify.rate_limit.hit when 429 received
  - **Files**: `src/lib/coolify/client.ts`

- [x] **T053** [US5] [P] Implement timeout enforcement
  - Enforce COOLIFY_REQUEST_TIMEOUT (default 30s) at HTTP level
  - Each retry attempt resets timeout (not cumulative)
  - Log: coolify.request.failed when timeout occurs
  - **Files**: `src/lib/coolify/client.ts`

- [ ] **T054** [US5] Create integration tests: Retry logic
  - Mock: Coolify returns 500, 503 then success → verify 2 retries + success
  - Mock: Coolify returns 400 → verify no retries, immediate failure
  - Verify: coolify.request.retry events logged for each retry
  - Verify: Delays are correct (check logs for durationMs)
  - **Files**: `tests/integration/us5-retry-logic.test.ts`

- [ ] **T055** [US5] [P] Create integration tests: Retry-After header
  - Mock: 429 with Retry-After: 2 → verify delay 2s
  - Mock: 429 without Retry-After → verify exponential backoff
  - Verify: coolify.rate_limit.hit event logged
  - **Files**: `tests/integration/us5-retry-after.test.ts`

- [ ] **T056** [US5] Create integration tests: Timeout enforcement
  - Mock: Coolify delays > 30s → verify timeout error
  - Verify: No retries on timeout (treated as transient for now)
  - **Files**: `tests/integration/us5-timeout.test.ts`

---

**Status**: ✅ User Stories Complete (All 6 implemented)

---

## PHASE 9: Polish & Cross-Cutting Concerns

**Goal**: Documentation, test coverage, deployment readiness  
**Duration**: ~8 hours  
**Depends**: All user stories complete

### Polish Tasks

- [x] **T057** [P] Create comprehensive README
  - Installation instructions
  - Environment variables
  - Running the server (dev + production)
  - First test (MCP Inspector)
  - Troubleshooting guide

- [x] **T058** [P] Create API documentation
  - Document all ~17 MVP tools
  - Endpoint mapping (tool name → Coolify endpoint)
  - Parameter examples
  - Response examples
  - Error codes reference

- [x] **T059** [P] Implement npm scripts
  - `npm run dev` — Start with file watcher
  - `npm run build` — Compile TypeScript
  - `npm start` — Run compiled version
  - `npm test` — Run all tests
  - `npm run lint` — ESLint check
  - `npm run type-check` — TypeScript strict check
  - `npm run check` — Lint + type-check

- [ ] **T060** Create test coverage report
  - Run: `npm test -- --coverage`
  - Verify minimums: Zod 90%, Logging 85%, Config 90%, Error 85%, Tools 70%
  - Update: CLAUDE.md with coverage tracking

- [ ] **T061** [P] Performance baseline documentation
  - Run tools, measure P50/P95/P99 latencies
  - Document in README: Expected performance
  - Create: `PERFORMANCE.md` with baseline metrics

- [ ] **T062** Create CHANGELOG template
  - Document: MVP Phase 1 features (45 tools)
  - Plan: Phase 2 additions, Phase 3 additions
  - Format: Keep-a-Changelog standard

- [x] **T063** [P] Verify TypeScript strict mode
  - Run: `npm run type-check`
  - Zero errors expected
  - No `any` types in codebase

- [x] **T064** Verify ESLint compliance
  - Run: `npm run lint`
  - Zero errors expected
  - No console.* calls in app code

---

**Status**: ✅ MVP Phase 1 Complete

---

## Task Summary by Phase

### Phase 1: Setup (5 tasks)
- T001-T005: Project structure, dependencies, environment, tooling

### Phase 2: Foundational (11 tasks)
- T006-T008: Logging infrastructure
- T009-T010: Configuration & bootstrap
- T011: Coolify API client
- T012-T016: MCP protocol handler + test fixtures

### Phase 3: US1 (11 tasks)
- T017-T024: Tool schemas & handlers (4 categories × 2 + 1 registration)
- T025-T027: Tool registration & testing

### Phase 4: US2 (6 tasks)
- T028-T033: Logging, requestId correlation, secret redaction, log testing

### Phase 5: US4 (6 tasks)
- T034-T039: Zod schemas, parameter validation, response validation, bootstrap testing

### Phase 6: US6 (8 tasks)
- T040-T047: Confirmation flow, critical operations, token generation, tests

### Phase 7: US3 (3 tasks)
- T048-T050: READ_ONLY mode implementation & tests

### Phase 8: US5 (6 tasks)
- T051-T056: Retry logic, Retry-After, timeout, exponential backoff tests

### Phase 9: Polish (8 tasks)
- T057-T064: Documentation, scripts, coverage, performance, compliance

---

## Dependency Graph

```
Phase 1: Setup
    ↓ (blocks)
Phase 2: Foundational (logging, config, MCP handler)
    ↓ (blocks all)
├─→ Phase 3: US1 (tool execution)
    ├─→ Phase 4: US2 (logging correlation) [parallel: T028-T033]
    ├─→ Phase 5: US4 (validation) [parallel: T034-T039]
    ├─→ Phase 6: US6 (confirmation) [parallel: T040-T047]
    ├─→ Phase 7: US3 (READ_ONLY) [parallel: T048-T050]
    └─→ Phase 8: US5 (retry logic) [parallel: T051-T056]
        ↓
    Phase 9: Polish (docs, scripts, coverage)
```

**Parallel Execution Opportunities**:
- After Phase 1: Phases 2 can run in parallel (11 tasks, ~4-6 parallelizable)
- After Phase 2: Phases 3-8 can run mostly in parallel (each story independent after US1)
- Within each phase: Mark [P] tasks (18 total parallelizable tasks)

**Critical Path** (sequential):
T001 → T002 → T003 → T004 → T005 →  
T006 → T009 → T011 → T012 → T013 →  
T017 → T021 → T025 → T026 → DONE (MVP minimum)

**Estimated Effort**:
- MVP Minimum (T001-T027): ~40 hours
- Phase 1 Complete (T001-T047): ~70 hours
- Full Polish (T001-T064): ~90 hours

---

**Status**: ✅ Task Plan Ready for Implementation  
**Next Command**: `/speckit-implement` to start implementation with Phase 1

---

## Notes for Implementation

### Code Quality Baseline
- ESLint: Zero violations
- TypeScript strict: Zero errors
- Test coverage: Minimums per spec.md (Zod 90%, Logging 85%, etc.)
- No console.* in app code (logger only)

### Testing Strategy
- Unit tests: Zod schemas, logging, sanitization
- Integration tests: Tool invocation, API errors, logging correlation
- Fixtures: Mock Coolify API for consistent testing
- TDD optional (specifications are detailed enough for implementation-first)

### Documentation Order
1. README (setup + running)
2. API docs (tools reference)
3. CHANGELOG (features per phase)
4. PERFORMANCE.md (baselines)

### Deployment Readiness
- Build: `npm run build` produces `dist/` with compiled JavaScript
- Production: NODE_ENV=production, LOG_TO_FILES=false (logs to stdout)
- Docker: Create Dockerfile (optional for MVP, consider for Phase 2)

---

**Document Generated**: 2026-05-12  
**Branch**: `001-mcp-coolify`  
**Specification**: `specs/001-mcp-coolify/spec.md`  
**Plan**: `specs/001-mcp-coolify/plan.md`
