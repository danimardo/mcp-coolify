# Phase 1: Data Model & Entities

**Status**: Phase 1 Design (produced by `/speckit-plan`)  
**Branch**: `001-mcp-coolify` | **Date**: 2026-05-12

---

## Core Entities & Relationships

### 1. Tool Definition

**Entity**: `ToolDefinition`  
**Purpose**: Describes a single MCP tool (of ~107)

```typescript
interface ToolDefinition {
  // Identity
  name: string;                           // e.g., "list_applications"
  displayName: string;                    // e.g., "List Applications"
  description: string;                    // Long description for AI agents
  category: ToolCategory;                 // "applications", "databases", etc.

  // Validation
  inputSchema: z.ZodSchema;               // Zod schema for parameter validation
  outputSchema: z.ZodSchema;              // Zod schema for response validation

  // Execution
  handler: (params: unknown, context: ToolContext) => Promise<unknown>;
  isMutating: boolean;                    // false → safe in READ_ONLY mode
  isReadOnly: boolean;                    // true → safe in READ_ONLY mode
  requiresConfirmation: boolean;          // true → requires user confirmation
  timeoutMs?: number;                     // Override default 30s timeout

  // Categorization
  coolifyEndpoint: string;                // e.g., "/applications"
  httpMethod: "GET" | "POST" | "PATCH" | "DELETE";
  version: string;                        // Tool version, independent of MCP

  // Metadata
  examples?: string[];                    // Example invocations for docs
  relatedTools?: string[];                // Links to similar/dependent tools
}
```

**Relationships**:
- Has-many: `ToolParameter` (defined via `inputSchema` Zod)
- Belongs-to: `ToolCategory` (one of 13)
- Has-one: `ToolContext` (runtime context per invocation)

**Validation Rules**:
- `name` must match regex `^[a-z0-9_]+$` (snake_case)
- `isMutating` = true if httpMethod in [POST, PATCH, DELETE, start/stop/restart]
- `requiresConfirmation` ⊂ {delete_*, cancel_*, trigger_deployment, create_*_in_production}
- `inputSchema` and `outputSchema` are valid Zod schemas

---

### 2. Tool Context

**Entity**: `ToolContext`  
**Purpose**: Runtime context for each tool invocation

```typescript
interface ToolContext {
  // Request identification
  requestId: string;                      // UUID v4, for correlation
  startTime: number;                      // Date.now() in milliseconds
  
  // Tool metadata
  tool: string;                           // Tool name (from ToolDefinition)
  category: string;                       // Tool category
  
  // User/Agent context
  userId?: string;                        // Optional: who/what triggered
  agent?: string;                         // Optional: agent name (e.g., "claude-code")
  
  // Configuration
  readOnly: boolean;                      // Effective READ_ONLY flag
  timeout: number;                        // Effective timeout in ms
  
  // State for confirmation flow
  confirmationRequired?: boolean;
  confirmationToken?: string;
  confirmed?: boolean;
}
```

**Lifecycle**:
1. Created when tool is invoked
2. Passed through parameter validation → API call → response validation
3. Used to generate all correlated log events
4. Destroyed after response sent

**Validation Rules**:
- `requestId` must be valid UUID v4
- `startTime` must be ≤ Date.now() (cannot be future)
- `tool` must match a registered tool name

---

### 3. Tool Category

**Entity**: `ToolCategory` (enum)  
**Purpose**: Logical grouping of ~107 tools

```typescript
enum ToolCategory {
  DEFAULT = "default",                    // 4 tools: version, health, enable/disable API
  TEAMS = "teams",                        // 4 tools: current, list, get, members
  PROJECTS = "projects",                  // 9 tools: CRUD + environments
  APPLICATIONS = "applications",          // 19 tools: CRUD + logs + env vars + start/stop/restart
  DEPLOYMENTS = "deployments",            // 5 tools: list, get, trigger, cancel, etc.
  DATABASES = "databases",                // 21 tools: CRUD + backups + restore
  SERVICES = "services",                  // 13 tools: CRUD + env vars + start/stop/restart
  SERVERS = "servers",                    // 8 tools: CRUD + validate + resources
  RESOURCES = "resources",                // 1 tool: unified list
  CONTAINERS = "containers",              // 1 tool: get_container_logs (SSH; gated by SSH_ENABLED)
  PRIVATE_KEYS = "private_keys",          // 5 tools: CRUD
  GITHUB_APPS = "github_apps",            // 7 tools: CRUD + repos + branches
  CLOUD_TOKENS = "cloud_tokens",          // 6 tools: CRUD + validate
  HETZNER = "hetzner",                    // 5 tools: list + create
}
```

**Distribution by Phase**:
- **MVP (Phase 1)**: DEFAULT, TEAMS, PROJECTS (partial), APPLICATIONS (partial), DEPLOYMENTS (partial), SERVERS (partial) = ~45 tools
- **Phase 2**: Add DATABASES (partial), SERVICES (partial), GITHUB_APPS (read), PRIVATE_KEYS (read), CLOUD_TOKENS (read) = ~65 tools
- **Phase 3**: Add remaining (full write access) = ~107 tools

---

### 4. Configuration

**Entity**: `Config`  
**Purpose**: Centralized application configuration

```typescript
interface Config {
  // Coolify API
  COOLIFY_BASE_URL: string;               // e.g., "https://coolify.example.com/api/v1"
  COOLIFY_TOKEN: string;                  // Bearer token (format: "2|...")
  COOLIFY_REQUEST_TIMEOUT: number;        // milliseconds (default: 30000)
  COOLIFY_MAX_RETRIES: number;            // (default: 3)
  VALIDATE_TOKEN_ON_STARTUP: boolean;     // (default: true)

  // Runtime behavior
  READ_ONLY: boolean;                     // (default: false)
  NODE_ENV: "development" | "production" | "test";

  // Logging
  LOG_LEVEL: "trace" | "debug" | "info" | "warn" | "error" | "fatal";  // (default: "info")
  LOG_DIR: string;                        // (default: ".logs")
  LOG_TO_FILES: boolean;                  // (default: true in dev, false in prod)
  LOG_TIMEZONE: string;                   // IANA timezone (default: "Europe/Madrid")
  SENSITIVE_FIELDS: string[];             // Fields to redact in logs

  // MCP Protocol
  MCP_TRANSPORT: "stdio" | "http";        // (default: "stdio")
  MCP_HTTP_PORT?: number;                 // If HTTP transport
}
```

**Validation**:
- All via Zod schema in `src/server/config.ts`
- Bootstrap fails immediately if invalid
- COOLIFY_TOKEN format validated
- LOG_TIMEZONE verified against IANA database

---

### 5. Tool Result

**Entity**: `ToolResult`  
**Purpose**: Response from tool execution

```typescript
interface ToolResult {
  // Success case
  result?: unknown;                       // Tool-specific output (validated via outputSchema)
  
  // Error case
  error?: {
    code: string;                         // e.g., "VALIDATION_FAILED", "APPLICATION_NOT_FOUND"
    message: string;                      // Human-readable message
    details?: Record<string, unknown>;    // Extra context
    hint?: string;                        // How to resolve
  };

  // Metadata
  _meta?: {
    requestId: string;                    // For correlation
    executedAt: string;                   // ISO 8601 timestamp
    durationMs: number;                   // Execution time
  };
}
```

**Error Codes** (standardized):
- `VALIDATION_FAILED` — Parameter validation failed
- `COOLIFY_API_ERROR` — Coolify API returned error
- `CONFIRMATION_REQUIRED` — Operation needs confirmation
- `CONFIRMATION_FAILED` — Confirmation token invalid
- `OPERATION_CANCELLED` — User cancelled after confirmation request
- `READ_ONLY_VIOLATION` — Mutating operation blocked by READ_ONLY
- `TIMEOUT` — Request exceeded timeout
- `NETWORK_ERROR` — HTTP request failed (after retries)
- Tool-specific: `APPLICATION_NOT_FOUND`, `SERVER_NOT_FOUND`, etc.

---

### 6. Confirmation Flow

**Entity**: `ConfirmationRequest`  
**Purpose**: Request user confirmation for critical operations

```typescript
interface ConfirmationRequest {
  // Identification
  confirmationRequired: true;
  operation: string;                      // Tool name
  severity: "critical" | "high" | "medium";

  // User-facing
  message: string;                        // Localized question (Spanish)
  details: Record<string, unknown>;       // Operation-specific details
  
  // Server-side tracking
  confirmationToken: string;              // UUID for validation
  expiresAt: number;                      // Timestamp when token expires (default: 5 min)
}
```

**Confirmation Response**:
```typescript
interface ConfirmationResponse {
  confirmed: boolean;
  confirmationToken: string;
  userDecision?: "approved" | "rejected" | "timeout";
}
```

**Critical Operations Requiring Confirmation** (19):
- **Deletions (11)**: delete_project, delete_application, delete_environment, delete_database, delete_service, delete_server, delete_private_key, delete_github_app, delete_cloud_token, delete_database_backup, delete_backup_execution
- **Destructive (4)**: cancel_deployment, stop_application, stop_database, stop_service
- **Production (2)**: trigger_deployment (in production), create_hetzner_server
- **Secrets (4)**: create_private_key, create_cloud_token, create_github_app, create_application_environment_variable (with secret flag)

---

### 7. Structured Log Event

**Entity**: `StructuredLogEvent`  
**Purpose**: Single log entry in `.logs/app.jsonl`

```typescript
interface StructuredLogEvent {
  // Timing
  timestamp: string;                      // ISO 8601 UTC: "2026-04-18T12:32:10.000Z"
  localTime: string;                      // Human-readable: "18/04/2026 14:32:10"
  timezone: string;                       // IANA: "Europe/Madrid"

  // Severity
  level: "trace" | "debug" | "info" | "warn" | "error" | "fatal";

  // Event identification
  eventName: string;                      // Stable name: "domain.category.event"
  
  // Content (non-sensitive)
  message?: string;                       // Optional human explanation
  context?: Record<string, unknown>;      // Structured context (secrets redacted)
  
  // Correlation
  requestId?: string;                     // For tracing across events
  
  // Redaction marker
  redactedFields?: string[];              // Fields that were redacted (for audit)
}
```

**Stable Event Names** (sample; full list in `logging-events.md`):
- `app.bootstrap.started` — Server starting
- `app.bootstrap.config_loaded` — Config validated
- `app.bootstrap.token_validated` — Coolify token works
- `app.bootstrap.completed` — Server ready
- `app.bootstrap.failed` — Fatal startup error
- `mcp.tool.invoked` — Tool called by agent
- `mcp.tool.parameters_invalid` — Zod validation failed
- `mcp.tool.parameters_validated` — Parameters OK
- `mcp.tool.completed` — Tool succeeded
- `mcp.tool.failed` — Tool failed
- `coolify.request.started` — HTTP request to Coolify
- `coolify.request.completed` — HTTP response received
- `coolify.request.retry` — Retrying due to transient error
- `coolify.request.failed` — HTTP failed (non-retryable)
- `coolify.auth.failed` — Token invalid (401)
- `coolify.rate_limit.hit` — Rate limited (429)
- `operation.confirmation.requested` — Asking user for confirmation
- `operation.confirmed` — User approved
- `operation.cancelled_by_user` — User rejected
- `read_only.blocked_operation` — Mutation blocked by READ_ONLY

---

## State Transitions

### Tool Execution Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. INVOKED: Agent calls MCP tool                                │
│    Event: mcp.tool.invoked                                      │
│    Context: tool, category, params                              │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. VALIDATION: Zod validates parameters                         │
│    Success: Event mcp.tool.parameters_validated                 │
│    Failure: Event mcp.tool.parameters_invalid → return 400      │
└────────┬────────────────────────────────────────────────────────┘
         │ (parameters valid)
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. READ_ONLY CHECK: Is tool mutating + READ_ONLY enabled?       │
│    Yes: Event read_only.blocked_operation → return 403          │
│    No: Continue                                                  │
└────────┬────────────────────────────────────────────────────────┘
         │ (either read-only or mutating allowed)
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. CONFIRMATION CHECK: Does tool require explicit confirmation? │
│    Yes: Event operation.confirmation.requested → wait for user  │
│    No: Continue                                                  │
└────────┬────────────────────────────────────────────────────────┘
         │ (either no confirmation or confirmed)
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. API CALL: Invoke Coolify API                                 │
│    Event: coolify.request.started                               │
│    Implements: retries (1s, 2s, 4s) for 429, 5xx                │
│    Event: coolify.request.completed / .failed                   │
│    If 401: coolify.auth.failed → return 401                     │
│    If 429: coolify.rate_limit.hit → respect Retry-After         │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. RESPONSE VALIDATION: Zod validates Coolify response          │
│    Success: Proceed to 7                                        │
│    Failure: return 500 (API contract broken)                    │
└────────┬────────────────────────────────────────────────────────┘
         │ (response valid)
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. RETURN: Build result, emit mcp.tool.completed, respond       │
│    Event: mcp.tool.completed (includes durationMs, requestId)   │
│    Response: ToolResult with result or error                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Validation Scopes

| Scope | What | Tool | Error Code |
|-------|------|------|-----------|
| **Input Parameters** | Agent-provided arguments | Zod schema from inputSchema | VALIDATION_FAILED |
| **Config Variables** | Environment at bootstrap | Zod ConfigSchema | (exit 1) |
| **Coolify API Response** | HTTP JSON from Coolify | Tool's outputSchema | (500 ISE) |
| **Confirmation Token** | User confirmation validity | String comparison + TTL | CONFIRMATION_FAILED |

---

## Non-Negotiable Constraints

1. **All tool parameters** must have Zod schema (inputSchema)
2. **All tool responses** must have Zod schema (outputSchema)
3. **All events** must use stable event names (domain.category.event)
4. **All events with context** must include requestId for correlation
5. **All secrets** must be automatically redacted (via SENSITIVE_FIELDS)
6. **All mutations** must be blocked in READ_ONLY mode
7. **All critical operations** must require explicit confirmation
8. **All timeouts** must be enforced at HTTP level (default 30s)
9. **All retryable errors** (429, 5xx) must use exponential backoff
10. **All non-retryable errors** (400, 401, 403, 404, 422) must fail immediately

---

## Next Steps

Phase 1 continues with:
- **contracts/tool-definitions.md** — Detailed spec for ~107 tools
- **contracts/mcp-protocol.md** — MCP request/response schemas
- **quickstart.md** — Setup, environment, first test run
