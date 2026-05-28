# Feature Specification: MCP Coolify Server

**Feature Branch**: `001-mcp-coolify`  
**Version**: 2.0.0  
**Created**: 2026-05-11  
**Updated**: 2026-05-11  
**Status**: Ready for Implementation  
**Project**: MCP Coolify — Node.js MCP server exposing Coolify API v4 as ~107 tools for AI agents

---

## Clarifications

### Session 2026-05-12

- Q: Performance SLA targets for tool execution? → A: P95 latency < 5s, P99 < 10s, 99.5% availability (aligned with Coolify API expectations)
- Q: Concurrent request handling strategy? → A: Unlimited concurrent requests via Node.js event loop with internal queuing if needed
- Q: Coolify API versioning strategy? → A: Support Coolify v4.x (minor versions), breaking changes on v5+, with documented migration path in CHANGELOG

---

## Executive Summary

**MCP Coolify** is a Model Context Protocol (MCP) server that provides AI agents (Claude Code CLI, etc.) with safe, auditable, and resilient access to Coolify infrastructure management through ~107 MCP tools across 13 categories.

**Vision**: Enable DevOps engineers to manage their entire Coolify infrastructure through conversational AI agents, with complete audit trails, safety guardrails (READ_ONLY mode), and structured error handling.

**Scope**: 
- **MVP (Fase 1)**: ~45 tools (Default, Teams, Projects basics, Applications basics, Deployments, Servers)
- **Fase 2**: ~65 tools (add Databases read, Services read, GitHub Apps read, Private Keys read)
- **Fase 3 (v2.0)**: ~107 tools (full write access, all categories complete)

**This feature spec covers the full vision (107 tools) but implementation is phased.**

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - AI Agent Invokes Infrastructure Tools (Priority: P1)

As an AI agent (Claude Code, etc.), I want to invoke MCP tools to manage Coolify infrastructure so that I can automate deployment and configuration tasks on behalf of DevOps engineers.

**Why this priority**: Core value proposition — enables agents to perform real infrastructure management with validated, auditable operations.

**Independent Test**: Can invoke a read-only tool (e.g., `list_applications`) with proper parameter validation and receive structured response; tool execution is logged with requestId, duration, and outcome.

**Acceptance Scenarios**:

1. **Given** an MCP client connected to MCP Coolify server, **When** invoking `list_applications` with valid parameters, **Then** parameters are validated against Zod schema, API call is logged with `coolify.request.started` event, response is validated, and `mcp.tool.completed` is logged with requestId and durationMs.

2. **Given** an agent invokes a tool with invalid parameters (e.g., invalid UUID), **When** validation fails, **Then** Zod validation error is logged with `mcp.tool.parameters_invalid` event, and error response is returned with error code, message, and hint.

3. **Given** a Coolify API call fails with transient error (500, 503), **When** retry logic triggers, **Then** exponential backoff is applied (1s, 2s, 4s), each attempt is logged with `coolify.request.retry` event, and eventual success/failure is logged.

---

### User Story 2 - Auditable Infrastructure Operations (Priority: P1)

As a DevOps engineer, I want every infrastructure operation to generate structured audit logs so that I can investigate what happened, when it happened, and who/what triggered it.

**Why this priority**: Security and compliance — structured logging with stable event names enables automated audit trails, alerts, and compliance validation.

**Independent Test**: Execute a tool operation, inspect `.logs/app.jsonl`, and verify each operation produces structured logs with requestId, eventName, durationMs, and context without exposing secrets.

**Acceptance Scenarios**:

1. **Given** a tool completes successfully, **When** logs are written, **Then** `mcp.tool.completed` event contains tool name, requestId, durationMs, and status without sensitive fields.

2. **Given** secrets in context (token, password, api_key), **When** logs are written, **Then** SENSITIVE_FIELDS are automatically redacted as `[REDACTED]` at logger level.

3. **Given** an operation spans multiple API calls, **When** logs are written, **Then** same requestId correlates all events (mcp.tool.invoked → coolify.request.started → coolify.request.completed → mcp.tool.completed) enabling full request tracing.

---

### User Story 3 - Safe Inspection with READ_ONLY Mode (Priority: P2)

As an operations engineer, I want to enable READ_ONLY mode so that I can test tools and validate behavior without executing mutations.

**Why this priority**: Safety guardrail — prevents accidental infrastructure changes during testing or validation; enables gradual rollout of new tools.

**Independent Test**: Set `READ_ONLY=true`, invoke a mutating tool (e.g., `restart_application`), and verify operation is blocked with `read_only.blocked_operation` event logged and error returned.

**Acceptance Scenarios**:

1. **Given** READ_ONLY mode enabled, **When** invoking a read-only tool (e.g., `list_applications`), **Then** tool executes normally and returns results.

2. **Given** READ_ONLY mode enabled, **When** invoking a mutating tool (e.g., `create_application`, `delete_project`), **Then** operation is blocked immediately (before API call), `read_only.blocked_operation` is logged, and error response includes hint to disable READ_ONLY.

---

### User Story 4 - Validated Data Contracts with Zod (Priority: P1)

As a developer, I want all tool parameters, API responses, and configuration to be validated with Zod so that I have guaranteed type safety at runtime.

**Why this priority**: Correctness and safety — Zod bridges runtime validation and TypeScript types, preventing silent failures and type errors.

**Independent Test**: Attempt to invoke a tool with parameters that fail validation, and verify type-safe parsing with detailed error messages indicating which field failed and why.

**Acceptance Scenarios**:

1. **Given** a tool requires integer port (1-65535), **When** invoked with port="invalid", **Then** Zod validation fails with clear error before reaching API layer, error is logged with `mcp.tool.parameters_invalid`.

2. **Given** Coolify API returns response, **When** response is parsed with strict Zod schema, **Then** malformed data is rejected before processing (e.g., missing uuid, wrong type for status).

3. **Given** environment variables loaded at bootstrap, **When** validation runs with ConfigSchema, **Then** missing COOLIFY_TOKEN or invalid COOLIFY_BASE_URL causes immediate bootstrap failure with clear error.

---

### User Story 5 - Resilient API Communication (Priority: P2)

As a system operator, I want automatic retry logic with exponential backoff for transient API failures so that temporary network issues don't interrupt operations.

**Why this priority**: Resilience — improves reliability for transient failures while maintaining visibility of retry attempts in logs.

**Independent Test**: Mock Coolify API to return transient error (500), verify tool retries with 1s, 2s, 4s delays, and succeeds on eventual success; verify non-transient errors (400, 404) fail immediately without retries.

**Acceptance Scenarios**:

1. **Given** Coolify API returns 500 error on first two attempts, **When** retry logic triggers, **Then** exponential backoff delays are applied (1s, 2s), each attempt is logged with `coolify.request.retry`, and request succeeds on third attempt.

2. **Given** Coolify API returns 400 (Bad Request), **When** request is made, **Then** operation fails immediately without retry, error is logged with `coolify.request.failed`, and clear error returned to client.

3. **Given** Coolify API returns 429 (Rate Limited) with Retry-After header, **When** request is made, **Then** retry delay respects Retry-After header (or defaults to exponential backoff), and `coolify.rate_limit.hit` is logged.

---

### User Story 6 - Critical Operations Confirmation (Priority: P1)

As a DevOps engineer, I want destructive operations to require explicit confirmation so that I prevent accidental deletions or production changes.

**Why this priority**: Safety — prevents catastrophic mistakes in production; enables safe automation.

**Independent Test**: Invoke a critical operation (e.g., `delete_application`), verify server responds with confirmationRequired flag and details, confirm operation through MCP client, and verify operation executes.

**Acceptance Scenarios**:

1. **Given** agent invokes `delete_application` (critical operation), **When** request is received, **Then** server responds with `confirmationRequired: true`, operation details, and severity flag (e.g., "critical").

2. **Given** agent responds with confirmed: true and confirmationToken, **When** token is validated, **Then** operation executes and result is returned.

3. **Given** agent does not confirm or confirmation times out, **When** timeout expires, **Then** operation is not executed and `operation.cancelled_by_user` is logged.

---

### Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Coolify API returns unexpected response format | Zod validation rejects before processing; error logged |
| RequestId collision (two simultaneous tools) | UUID v4 collision probability negligible (~1 in 10^36) |
| READ_ONLY enabled but user doesn't realize | Tool blocks operation, logs clearly, error includes hint |
| Very large tool parameter sets | Zod validates each field; string max 65535 chars, number max 2^53-1 |
| Token expires mid-operation | 401 response logged as `coolify.auth.failed`, operation fails, no retry |
| Malformed logs (sensitive data) | Impossible—sanitization happens at logger.* level before serialization |
| Network timeout during API call | Treated as transient (retried with backoff) |
| Bootstrap with missing COOLIFY_TOKEN | Process exits immediately with `app.bootstrap.failed` logged |

---

## Requirements *(mandatory)*

### Functional Requirements

**Core MCP Protocol**
- **FR-001**: System MUST implement Model Context Protocol (MCP) v1.0+ server accepting tool invocation requests via stdio/HTTP.
- **FR-002**: System MUST expose exactly 107 tools across 13 categories (see Tools Categories below).

**Tool Execution & Validation**
- **FR-003**: System MUST validate all tool parameters using Zod schemas before execution; validation failures return 400-equivalent errors with field-level details.
- **FR-004**: System MUST validate all Coolify API responses using Zod schemas (strict parsing: reject malformed data).
- **FR-005**: System MUST return structured error responses with error code, message, details, and hint (see Error Response Format below).

**Resilience & Retry**
- **FR-006**: System MUST implement exponential backoff retry logic for HTTP status codes 429, 500, 502, 503, 504 (delays: 1s, 2s, 4s; max retries: 3, configurable via COOLIFY_MAX_RETRIES).
- **FR-007**: System MUST NOT retry HTTP status codes 400, 401, 403, 404, 422 (fail immediately).
- **FR-008**: System MUST respect Retry-After header when present in 429 responses.
- **FR-009**: System MUST enforce configurable timeout (default 30s, configurable via COOLIFY_REQUEST_TIMEOUT) for all Coolify API calls.

**Logging & Audit**
- **FR-010**: System MUST generate structured audit logs with stable event names (e.g., `mcp.tool.completed`, `coolify.request.started`) and include requestId for correlation.
- **FR-011**: System MUST automatically redact sensitive fields in all logs (password, token, api_key, authorization, cookie, secret, private_key, session, csrf, client_secret, coolify_token) at logger level, replacing with `[REDACTED]`.
- **FR-012**: System MUST log all tool invocations with tool name, parameters (non-sensitive), execution duration, outcome, and errors to both human-readable (`.logs/app.log`) and JSON Lines (`.logs/app.jsonl`) formats in development.
- **FR-013**: System MUST support configurable log levels (trace, debug, info, warn, error, fatal) and output logs to `.logs/app.log` and `.logs/app.jsonl` in development (configurable via LOG_LEVEL, LOG_TO_FILES, LOG_DIR).

**Safety & Control**
- **FR-014**: System MUST support READ_ONLY mode that blocks all mutating operations (POST, PATCH, DELETE, start/stop/restart); blocked attempts are logged with `read_only.blocked_operation` event.
- **FR-015**: System MUST require explicit user confirmation for 19 critical operations (see Critical Operations below) before execution; confirmation is handled via MCP client callback.
- **FR-016**: System MUST validate all environment variables at bootstrap using Zod and fail fast with clear error if config is invalid (fail within 100ms, log `app.bootstrap.failed`).

**Configuration & Deployment**
- **FR-017**: System MUST implement centralized config through `src/server/config.ts`, preventing direct `process.env` access throughout application code (enforced via ESLint).
- **FR-018**: System MUST log bootstrap process with events: `app.bootstrap.started`, `app.bootstrap.config_loaded`, `app.bootstrap.token_validated`, `app.bootstrap.completed` or `app.bootstrap.failed`.
- **FR-019**: System MUST validate Coolify API token at bootstrap (make GET /version request); if fails, exit with clear error.

**Code Quality**
- **FR-020**: System MUST enforce TypeScript strict mode with no `any` types, no unused variables, no implicit returns, strict null checks.
- **FR-021**: System MUST prohibit `console.log/error/warn` in application code; ESLint enforces logger usage.
- **FR-022**: System MUST provide clear user-facing error messages (not raw exceptions) when operations fail; include actionable hint when possible.

---

### Tool Categories (13 Enumerated)

| # | Category | Count | Examples |
|----|----------|-------|----------|
| 1 | Default | 4 | get_version, get_health, enable_api, disable_api |
| 2 | Teams | 4 | get_current_team, list_all_teams, get_team_by_id, get_current_team_members |
| 3 | Projects | 9 | list_projects, get_project, create_project, update_project, delete_project, list_environments, create_environment, delete_environment, get_environment |
| 4 | Applications | 19 | list, get, logs, create (public/dockerfile/docker-compose/docker-image/github-app/deploy-key), update, delete, start, stop, restart, list_env_vars, create_env_var, update_env_var, bulk_update_env_vars, delete_env_var |
| 5 | Deployments | 5 | list_deployments, get_deployment, list_application_deployments, trigger_deployment, cancel_deployment |
| 6 | Databases | 21 | list, get, create (PostgreSQL/MySQL/MariaDB/MongoDB/Redis/DragonFly/KeyDB/ClickHouse), update, delete, start, stop, restart, list_backups, create_backup, update_backup, delete_backup, list_backup_executions, delete_backup_execution |
| 7 | Services | 13 | list, get, create, update, delete, start, stop, restart, list_env_vars, create_env_var, update_env_var, bulk_update_env_vars, delete_env_var |
| 8 | Servers | 8 | list, get, create, update, delete, validate, get_resources, get_domains |
| 9 | Resources | 1 | list_resources (unified view of all resources) |
| 10 | Private Keys | 5 | list, get, create, update, delete |
| 11 | GitHub Apps | 7 | list, get, create, update, delete, list_repositories, list_repository_branches |
| 12 | Cloud Tokens | 6 | list, get, create, update, delete, validate |
| 13 | Hetzner | 5 | list_locations, list_server_types, list_images, list_ssh_keys, create_server |

**Total**: 107 tools (MVP launches with ~45 tools from categories 1-5 and partial 6-8)

---

### Critical Operations (Require Confirmation)

| Category | Operations | Count |
|----------|-----------|-------|
| Deletions (Irreversible) | delete_project, delete_application, delete_environment, delete_database, delete_service, delete_server, delete_private_key, delete_github_app, delete_cloud_token, delete_database_backup, delete_backup_execution | 11 |
| Destructive Actions | cancel_deployment, stop_application, stop_database, stop_service | 4 |
| Production/Cost | trigger_deployment (in production), create_hetzner_server | 2 |
| Secrets (Sensitive) | create_private_key, create_cloud_token, create_github_app, create_application_environment_variable (with secret flag) | 4 |
| **TOTAL** | | **19+** |

**Confirmation Format**:
```json
{
  "confirmationRequired": true,
  "operation": "delete_application",
  "severity": "critical",
  "message": "¿Eliminar aplicación 'api-backend' de PRODUCCIÓN? Esta acción es irreversible.",
  "details": {
    "application_uuid": "app-123",
    "application_name": "api-backend",
    "environment": "production",
    "has_active_deployment": true
  }
}
```

---

### Key Entities & Data Structures

**Tool Definition**:
```typescript
interface ToolDefinition {
  name: string;                    // e.g., "list_applications"
  description: string;
  inputSchema: z.ZodSchema;        // Zod schema for validation
  handler: (params: unknown, context: ToolContext) => Promise<unknown>;
  isMutating: boolean;             // true → blocked in READ_ONLY
  requiresConfirmation: boolean;   // true → requires explicit approval
  category: string;
}
```

**ToolContext** (execution context):
```typescript
interface ToolContext {
  requestId: string;          // UUID v4, generated server-side
  startTime: number;          // Date.now() for duration calculation
  tool: string;               // Tool name
  userId?: string;            // Optional: who triggered this
}
```

**Error Response**:
```typescript
interface ErrorResponse {
  error: string;                         // e.g., "APPLICATION_NOT_FOUND"
  message: string;                       // e.g., "App xyz no existe"
  details?: Record<string, unknown>;     // Extra context
  hint?: string;                         // How to fix
}
```

**StructuredLog** (JSON Lines format):
```typescript
interface StructuredLog {
  timestamp: string;         // ISO 8601 UTC: "2026-04-18T12:32:10.000Z"
  localTime: string;         // Human-readable: "18/04/2026 14:32:10"
  timezone: string;          // "Europe/Madrid"
  level: LogLevel;           // trace|debug|info|warn|error|fatal
  eventName: string;         // e.g., "mcp.tool.completed"
  message?: string;          // Optional human-readable message
  context?: Record<string, unknown>; // Non-sensitive context
  requestId?: string;        // For correlation
}
```

**Configuration**:
```typescript
interface Config {
  COOLIFY_BASE_URL: string;          // e.g., "https://coolify.example.com/api/v1"
  COOLIFY_TOKEN: string;             // Bearer token
  COOLIFY_REQUEST_TIMEOUT: number;   // ms (default: 30000)
  COOLIFY_MAX_RETRIES: number;       // (default: 3)
  READ_ONLY: boolean;                // (default: false)
  LOG_LEVEL: LogLevel;               // (default: "info")
  LOG_TO_FILES: boolean;             // (default: true in dev, false in prod)
  LOG_DIR: string;                   // (default: ".logs")
  LOG_TIMEZONE: string;              // (default: "Europe/Madrid")
  VALIDATE_TOKEN_ON_STARTUP: boolean;// (default: true)
  NODE_ENV: "development" | "production" | "test";
}
```

---

## API Integration Details

### Coolify API v4 Contract

- **Base URL**: `https://<coolify-domain>/api/v1` (configured via COOLIFY_BASE_URL)
- **Version**: Coolify v4 (minimum requirement)
- **Authentication**: `Authorization: Bearer <TOKEN>` header (token format: `2|<random>`)
- **Responses**: JSON (binary data not expected)
- **Timeout**: 30s default, configurable via COOLIFY_REQUEST_TIMEOUT

### HTTP Status Code Handling

```typescript
const RETRYABLE_STATUS_CODES = [429, 500, 502, 503, 504];
const NON_RETRYABLE_STATUS_CODES = [400, 401, 403, 404, 422];

// On 429: Respect Retry-After header or use exponential backoff
// On 401: Token invalid/expired — log as coolify.auth.failed, no retry
// On other 5xx: Retry with backoff
// On 4xx (except 429): Fail immediately, no retry
```

### Resource Identifier Validation

Tool input parameters that reference a Coolify resource (`uuid`, `application_uuid`, `project_uuid`, `server_uuid`, etc.) are validated with `coolifyIdSchema`, which accepts **both** standard UUID v4 and Coolify's native short alphanumeric IDs (e.g. `dw8ccwkso888ggwgwgww0wc4`, 8–40 chars `[0-9a-z]`).

- `coolifyIdSchema` — used by applications, services, projects, databases, deployments, environments, private-keys, github-apps and cloud-tokens.
- `coolifyTeamIdSchema` — used by teams; additionally accepts short numeric IDs (e.g. `1`), because the Coolify teams API addresses teams by numeric `id`.
- Server-generated identifiers (`requestId`, `operationId`, `confirmationToken`) remain **strict UUID v4**, since they are produced by `crypto.randomUUID()`.

> Rationale: Coolify v4 does not use RFC UUIDs for most resources. Requiring strict UUID format rejected valid IDs (e.g. in `get_deployment`) before the request ever reached the API.

### Response Validation

All responses from Coolify API are validated with **strict Zod parsing**:
- ✅ Validates structure
- ✅ Rejects unexpected fields
- ✅ Rejects missing required fields
- ✅ Type checks all values
- ❌ Does NOT allow loose validation (backward compatibility handled by deprecation, not lenience)

---

## Error Response Format

### Standard Format
```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable description",
  "details": { "contextField": "contextValue" },
  "hint": "How to resolve or what to try next"
}
```

### Examples

**Parameter Validation Failed**:
```json
{
  "error": "VALIDATION_FAILED",
  "message": "Parámetro 'port' inválido",
  "details": {
    "field": "port",
    "reason": "not_a_number",
    "received": "invalid"
  },
  "hint": "El puerto debe ser un número entero entre 1 y 65535"
}
```

**Resource Not Found**:
```json
{
  "error": "APPLICATION_NOT_FOUND",
  "message": "La aplicación 'app-123' no existe",
  "details": {
    "http_status": 404,
    "coolify_endpoint": "/applications/app-123",
    "requestId": "550e8400-e29b-41d4-a716-446655440000"
  },
  "hint": "Usa list_applications para obtener UUIDs válidos"
}
```

**READ_ONLY Mode**:
```json
{
  "error": "FORBIDDEN",
  "message": "Operación bloqueada en modo READ_ONLY",
  "details": {
    "tool": "create_application_public",
    "operation_type": "POST"
  },
  "hint": "Desactiva READ_ONLY=false en .env para permitir mutaciones"
}
```

---

## Request ID & Tracing

**Generation**: UUID v4 (via Node.js crypto.randomUUID)
```typescript
import { randomUUID } from 'crypto';
const requestId = randomUUID(); // e.g., "550e8400-e29b-41d4-a716-446655440000"
```

**Inclusion in Response** (optional meta):
```json
{
  "result": { ... },
  "_meta": {
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "executedAt": "2026-05-11T14:32:10.123Z",
    "durationMs": 250
  }
}
```

**Correlation in Logs**: Same requestId appears in all related events:
- mcp.tool.invoked
- coolify.request.started
- coolify.request.completed (or .failed)
- mcp.tool.completed (or .failed)

---

## Confirmation Flow (MCP Contract)

### Step 1: Agent Invokes Critical Operation
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "delete_application",
    "arguments": { "uuid": "app-123" }
  }
}
```

### Step 2: Server Requests Confirmation
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "type": "text",
    "text": "{\"confirmationRequired\": true, \"operation\": \"delete_application\", \"severity\": \"critical\", \"message\": \"¿Eliminar aplicación 'api-backend'?\", \"details\": {...}}"
  }
}
```

### Step 3: Agent Confirms Operation
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "delete_application_confirmed",
    "arguments": {
      "uuid": "app-123",
      "confirmed": true,
      "confirmationToken": "550e8400-e29b-41d4-a716-446655440000"
    }
  }
}
```

### Step 4: Server Executes and Responds
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "type": "text",
    "text": "Aplicación eliminada correctamente"
  }
}
```

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

| SC | Criterion | Target | Validation |
|----|-----------|--------|-----------|
| SC-001 | All tool parameters validated with Zod | 100% (107/107) | Audit schema count in registry |
| SC-002 | All Coolify API responses validated | 100% per tool | Check response schemas in handlers |
| SC-003 | Structured logs with stable event names | 100% | Grep `.logs/app.jsonl` for eventName patterns |
| SC-004 | Sensitive fields redacted in logs | 100% | Grep logs for SENSITIVE_FIELDS—should find only `[REDACTED]` |
| SC-005 | Mutating tools blocked in READ_ONLY | 100% | Test READ_ONLY=true with each mutating tool |
| SC-006 | Bootstrap fails fast on invalid config | <100ms | Time bootstrap failure, verify exit code 1 |
| SC-007 | Tool retries with exponential backoff | 3 retries max | Mock 5xx, verify delays (1s, 2s, 4s) in logs |
| SC-008 | No direct process.env access | 0 violations | ESLint rule enforces config.ts usage |
| SC-009 | Log files truncate on restart | Always | Verify `.logs/` size resets on `npm start` |
| SC-010 | Test coverage meets minimums | Zod 90%, Logging 80%, Bootstrap 85%, Error 80%, Secrets 95%, Tools 70% | Vitest coverage report |
| SC-011 | TypeScript strict mode enforced | 100% | tsc --strict exits 0 |
| SC-012 | No console.* in app code | 0 violations | ESLint no-console rule (with exceptions) |
| SC-013 | Critical operations require confirmation | 19 operations | Manual test each confirmed operation |
| SC-014 | Request IDs correlate in logs | 100% | Grep by requestId across `.logs/app.jsonl` |
| SC-015 | Response validation rejects malformed data | 100% | Mock Coolify with missing/wrong fields, verify rejection |
| SC-016 | Performance SLA: P95 < 5s latency | All tools | Monitor response times in production |
| SC-017 | Performance SLA: P99 < 10s latency | All tools | Monitor 99th percentile response times |
| SC-018 | Availability target: 99.5% uptime | Monthly | Track server availability, alert on degradation |

---

## Success Criteria: HTTP Status Code Handling

| Status | Behavior | Retry | Log Event |
|--------|----------|-------|-----------|
| 200-299 | Success | — | coolify.request.completed |
| 400 | Bad Request (param error) | ❌ No | coolify.request.failed |
| 401 | Unauthorized (token expired) | ❌ No | coolify.auth.failed |
| 403 | Forbidden (permission) | ❌ No | coolify.request.failed |
| 404 | Not Found (resource) | ❌ No | coolify.request.failed |
| 422 | Unprocessable Entity (validation) | ❌ No | coolify.request.failed |
| 429 | Rate Limited | ✅ Yes (respect Retry-After) | coolify.rate_limit.hit |
| 500 | Internal Server Error | ✅ Yes (backoff) | coolify.request.retry |
| 502 | Bad Gateway | ✅ Yes (backoff) | coolify.request.retry |
| 503 | Service Unavailable | ✅ Yes (backoff) | coolify.request.retry |
| 504 | Gateway Timeout | ✅ Yes (backoff) | coolify.request.retry |
| Network Timeout | Treated as transient | ✅ Yes (backoff) | coolify.request.retry |

---

## Assumptions

### Target Users
- DevOps engineers, SREs, automation engineers working through AI agents (Claude Code CLI, etc.)
- Not direct end-user facing; assumes trusted operator environment
- Assumes operators understand MCP protocol and can confirm operations

### Scope Boundaries
- v1 (MVP) focuses on read operations + basic deployments (lower risk, easier testing)
- Write operations added in Phase 2 (medium risk) and Phase 3 (high risk)
- All 107 tools implemented incrementally across 3 phases
- Confirmation for destructive operations is handled by MCP client (server initiates, client responds)

### Technology Stack
| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| Runtime | Node.js | 18+ (recommend 20.x LTS) | LTS, native crypto, async/await |
| Language | TypeScript | 5.0+ | Strict mode, type safety |
| Validation | Zod | 3.22+ | Runtime + type inference DRY |
| HTTP Client | Axios | 1.6+ | Timeout/retry hooks, error distinction |
| Logging | Pino | 8.16+ | Structured, async, high-performance |
| Testing | Vitest | 0.34+ | TypeScript-first, fast |
| Config | dotenv | 16.3+ | .env file management |
| Dates | date-fns | 2.30+ | Timezone handling (Madrid) |

### Coolify API Integration
- **Coolify API v4** (minimum version required; supports v4.x minor updates)
- **Versioning Strategy**: Support Coolify v4.x; breaking changes on v5+ require documented migration path in CHANGELOG
- **Endpoint**: `https://<coolify-domain>/api/v1`
- **Auth**: Bearer Token (`Authorization: Bearer <token>`)
- **Responses**: JSON (no binary data expected)
- **Rate Limiting**: Handled by client-side retry + Retry-After header

### Security Assumptions
- COOLIFY_TOKEN stored in environment variables (never hardcoded or logged)
- SENSITIVE_FIELDS list in config covers all secret types; can be extended
- READ_ONLY flag accessible only to authorized operators
- MCP server runs in trusted environment; additional auth/authz delegated to MCP client
- No secrets transmitted in logs (automatic sanitization at logger level)
- Token validation at bootstrap (fail if invalid/unreachable)

### Operational Assumptions
- Logs are rotated externally or truncated manually in production (`.logs/` in dev only)
- Monitoring/alerting on log events handled by downstream systems (e.g., ELK, Datadog)
- Timezone for human-readable logs is `Europe/Madrid` (customizable via LOG_TIMEZONE)
- Production logs do not accumulate (external rotation assumed)
- Concurrent requests handled via Node.js event loop (unlimited concurrent, internal queuing if needed)
- Performance SLA target: P95 latency < 5s, P99 < 10s, 99.5% availability (aligned with Coolify API)

### Development Assumptions
- Local development uses `.logs/` directory (Git-ignored)
- Bootstrap validation failures expected during setup; easily fixed locally
- ESLint and TypeScript compiler run pre-commit (enforced by hooks or CI)
- Developers run `npm test` before submitting PR (coverage checks)

---

## Technology Versions (Pinned)

### Production Dependencies
| Package | Version | Why |
|---------|---------|-----|
| `@modelcontextprotocol/sdk` | `^1.0.0` | Official MCP protocol |
| `typescript` | `^5.0.0` | Latest stable, better performance |
| `zod` | `^3.22.0` | Validation + type inference |
| `pino` | `^8.16.0` | High-performance structured logging |
| `axios` | `^1.6.0` | HTTP client with timeout/retry hooks |
| `dotenv` | `^16.3.0` | Environment variable management |
| `date-fns` | `^2.30.0` | Date handling + timezone support |

### Development Dependencies
| Package | Version | Why |
|---------|---------|-----|
| `@types/node` | `^20.0.0` | Node.js type definitions |
| `@typescript-eslint/eslint-plugin` | `^6.0.0` | TypeScript linting |
| `eslint` | `^8.0.0` | Code quality enforcement |
| `vitest` | `^0.34.0` | Fast TypeScript testing |
| `supertest` | `^6.3.0` | HTTP assertion library |

---

## Non-Negotiable Design Decisions

These decisions are LOCKED and cannot be alternatives:

1. **Zod for all validation**: Runtime + TypeScript type inference via `z.infer<>`; no other validator acceptable (not Ajv, joi, class-validator).
2. **Centralized config via `src/server/config.ts`**: Fail-fast bootstrap, no scattered `process.env` access; enforced by ESLint rule.
3. **Pino for structured logging**: Performance, structured by default, async I/O; not Winston, bunyan, or console.
4. **Stable event names** (dot-separated: `domain.category.event`): Queryable, not free-form messages; enables audit automation.
5. **Automatic secret redaction**: SENSITIVE_FIELDS list enforced at logger level (before serialization); no manual redaction in code.
6. **READ_ONLY mode enforcement**: Global flag blocking all mutations (POST/PATCH/DELETE/start/stop); not granular by tool.
7. **TypeScript strict mode**: No `any`, no unused variables, strict null checks; enforced by tsc and ESLint.
8. **Exponential backoff for retries**: 1s, 2s, 4s delays; not linear or fixed; configurable max retries via env var.
9. **Bearer Token authentication**: `Authorization: Bearer <token>`; not custom headers or basic auth.
10. **Confirmation for critical operations**: 19 operations require explicit MCP callback; not implicit/automatic.

---

## Related Documentation

### Architectural & Governance
- **`constitution.md`** — Project principles, non-negotiable frameworks, ADRs, governance process (~1500 lines)
- **`.specify/memory/constitution.md`** — Constitution in SpecKit format

### Technical Details
- **`docs/spec.md`** — Complete technical architecture, MCP protocol flow, logging system design (~1500 lines)
- **`specifications.md`** — Detailed catalog of all 107 tools: endpoints, parameters, errors, examples (~2500 lines)
- **`logging-events.md`** — Definitions of 50+ stable events with context and use cases (~500 lines)
- **`CLAUDE.md`** — Diagnostics and troubleshooting guide for AI agents debugging issues (~400 lines)

### API Reference
- **`docs/manual_api_coolify_programador.md`** — Coolify API v4 manual for programmers
- **`docs/coolify_api_postman_openapi.yaml`** — OpenAPI schema for Coolify API

### Configuration
- **`.env.example`** — Template with all environment variables and defaults
- **`package.json`** — Exact versions of all dependencies
- **`.eslintrc.js`** — Linting rules (console prohibition, etc.)
- **`tsconfig.json`** — TypeScript strict mode configuration

---

## Implementation Phases

### Phase 1 (MVP) — v1.0.0
**Scope**: ~45 tools, bootstrap, read operations, basic deployments  
**Hito**: Server operational, auditable, READ_ONLY ready  
**Tools Included**:
- Default (4/4)
- Teams (4/4)
- Projects (3/9): list, get, create
- Applications (6/19): list, get, logs, start, stop, restart
- Deployments (4/5): list, get, trigger, cancel
- Servers (4/8): list, get, validate, resources

### Phase 2 (Expansion) — v1.1 to v1.5
**Scope**: ~65 tools, intermediate read/write, services, databases  
**Tools Added**:
- Projects (6/9 more): update, delete, environments
- Applications (13/19 more): create variants, update, env vars
- Deployments (1/5 more): remaining
- Databases (7/21): list, get, backups read
- Services (13/13): all (with env vars)
- GitHub Apps (7/7): all (read operations)
- Private Keys (2/5): list, get
- Cloud Tokens (2/6): list, get

### Phase 3 (Completion) — v2.0+
**Scope**: ~107 tools, full write access, all categories  
**Tools Added**:
- Databases (14/21 more): create, update, delete, backups write
- Private Keys (3/5 more): create, update, delete
- GitHub Apps (5/7 more): create, update, delete
- Cloud Tokens (4/6 more): create, update, delete
- Hetzner (5/5): all

---

**Last Updated**: 2026-05-12 (Clarifications Session)
**Status**: Ready for Implementation Planning  
**Next Phase**: `/speckit-plan` → `/speckit-implement`  
**Maintained By**: Development Team  
**Approval**: User (maintainer@example.com)
