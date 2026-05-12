# MCP Tool Definitions Contract

**Status**: Phase 1 Design Artifact  
**Scope**: ~107 tools across 13 categories  
**Format**: Tool schemas, parameter definitions, error contracts  
**Branch**: `001-mcp-coolify` | **Date**: 2026-05-12

---

## Overview

This document defines the **contract** between MCP clients (Claude Code, etc.) and the MCP Coolify server. Each tool is defined with:

1. **Identity**: name, description, category
2. **Input Schema**: Zod schema for parameter validation
3. **Output Schema**: Zod schema for response validation
4. **Metadata**: mutation status, confirmation requirement, Coolify endpoint

---

## MCP Tool Definition Format

### Base Schema (All Tools)

```typescript
// This is the TypeScript representation; actual tools are registered in src/tools/*/index.ts

interface ToolRegistration {
  // MCP Protocol Fields (required)
  name: string;                         // Tool identifier (snake_case)
  description: string;                  // Description for agents
  inputSchema: z.ZodSchema;             // Parameter validation
  
  // Extended Fields (application-specific)
  category: ToolCategory;               // One of 13 categories
  coolifyEndpoint: string;              // Coolify API endpoint
  httpMethod: "GET" | "POST" | "PATCH" | "DELETE";
  
  // Execution Properties
  handler: (params: any, ctx: ToolContext) => Promise<any>;
  outputSchema?: z.ZodSchema;           // Response validation
  isMutating: boolean;                  // POST/PATCH/DELETE/start/stop/restart
  requiresConfirmation: boolean;        // Requires explicit user approval
  timeoutMs?: number;                   // Override 30s default
}
```

---

## Category 1: Default (4 Tools)

### Tool: `get_version`

**Purpose**: Get Coolify server version

**Input Schema**:
```typescript
const GetVersionSchema = z.object({});  // No parameters
```

**Output Schema**:
```typescript
const VersionResponseSchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+/),  // e.g., "4.3.2"
  build: z.string().optional(),
  timestamp: z.string().datetime(),
});
```

**Metadata**:
- Endpoint: `GET /version`
- Mutating: ❌ No
- Requires Confirmation: ❌ No
- Timeout: 5s

**Examples**:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": { "name": "get_version", "arguments": {} }
}
```

**Response**:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "type": "text",
    "text": "{\"version\": \"4.3.2\", \"build\": \"abc123\", \"timestamp\": \"2026-05-12T14:30:00Z\"}"
  }
}
```

---

### Tool: `get_health`

**Purpose**: Health check (token validation)

**Input Schema**:
```typescript
const GetHealthSchema = z.object({});  // No parameters
```

**Output Schema**:
```typescript
const HealthResponseSchema = z.object({
  status: z.enum(["healthy", "degraded", "unhealthy"]),
  timestamp: z.string().datetime(),
  message: z.string().optional(),
});
```

**Metadata**:
- Endpoint: `GET /health` (or version if health endpoint unavailable)
- Mutating: ❌ No
- Requires Confirmation: ❌ No
- Timeout: 10s

---

### Tool: `enable_api`

**Purpose**: Enable Coolify API access

**Input Schema**:
```typescript
const EnableApiSchema = z.object({});  // No parameters
```

**Output Schema**:
```typescript
const ApiStateSchema = z.object({
  api_enabled: z.boolean(),
  timestamp: z.string().datetime(),
});
```

**Metadata**:
- Endpoint: `POST /settings` (or update endpoint)
- Mutating: ✅ Yes
- Requires Confirmation: ❌ No
- Timeout: 10s

---

### Tool: `disable_api`

**Purpose**: Disable Coolify API access

**Input Schema**:
```typescript
const DisableApiSchema = z.object({});  // No parameters
```

**Output Schema**:
```typescript
const ApiStateSchema = z.object({
  api_enabled: z.boolean(),
  timestamp: z.string().datetime(),
});
```

**Metadata**:
- Endpoint: `POST /settings`
- Mutating: ✅ Yes
- Requires Confirmation: ❌ No (disabling API is reversible)
- Timeout: 10s

---

## Category 2: Teams (4 Tools)

### Tool: `get_current_team`

**Purpose**: Get current team information

**Input Schema**:
```typescript
const GetCurrentTeamSchema = z.object({});
```

**Output Schema**:
```typescript
const TeamSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  created_at: z.string().datetime(),
});
```

**Metadata**:
- Endpoint: `GET /teams/current`
- Mutating: ❌ No
- Requires Confirmation: ❌ No
- Timeout: 5s

---

### Tool: `list_all_teams`

**Purpose**: List all teams accessible to token holder

**Input Schema**:
```typescript
const ListTeamsSchema = z.object({});
```

**Output Schema**:
```typescript
const TeamsListSchema = z.object({
  teams: z.array(TeamSchema),
  total: z.number().int().min(0),
});
```

**Metadata**:
- Endpoint: `GET /teams`
- Mutating: ❌ No
- Requires Confirmation: ❌ No
- Timeout: 10s

---

### Tool: `get_team_by_id`

**Purpose**: Get team details by UUID

**Input Schema**:
```typescript
const GetTeamSchema = z.object({
  uuid: z.string().uuid().describe("Team UUID"),
});
```

**Output Schema**:
```typescript
const TeamDetailSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  created_at: z.string().datetime(),
  members_count: z.number().int(),
});
```

**Metadata**:
- Endpoint: `GET /teams/{uuid}`
- Mutating: ❌ No
- Requires Confirmation: ❌ No
- Timeout: 5s

**Error Codes**:
- `TEAM_NOT_FOUND` (404) — Team UUID does not exist

---

### Tool: `get_current_team_members`

**Purpose**: List members of current team

**Input Schema**:
```typescript
const GetTeamMembersSchema = z.object({});
```

**Output Schema**:
```typescript
const TeamMembersSchema = z.object({
  members: z.array(z.object({
    uuid: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    role: z.enum(["owner", "admin", "member"]),
  })),
  total: z.number().int().min(0),
});
```

**Metadata**:
- Endpoint: `GET /teams/current/members`
- Mutating: ❌ No
- Requires Confirmation: ❌ No
- Timeout: 10s

---

## Category 3: Projects (9 Tools) — Partial

### Tool: `list_projects`

**Purpose**: List projects in current team

**Input Schema**:
```typescript
const ListProjectsSchema = z.object({
  team_uuid: z.string().uuid().optional().describe("Team UUID; defaults to current"),
  limit: z.number().int().min(1).max(100).default(50),
  skip: z.number().int().min(0).default(0),
});
```

**Output Schema**:
```typescript
const ProjectSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

const ProjectsListSchema = z.object({
  projects: z.array(ProjectSchema),
  total: z.number().int(),
});
```

**Metadata**:
- Endpoint: `GET /projects`
- Mutating: ❌ No
- Requires Confirmation: ❌ No
- Timeout: 10s

---

### Tool: `get_project`

**Purpose**: Get project details by UUID

**Input Schema**:
```typescript
const GetProjectSchema = z.object({
  uuid: z.string().uuid().describe("Project UUID"),
});
```

**Output Schema**:
```typescript
const ProjectDetailSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  environments_count: z.number().int(),
});
```

**Metadata**:
- Endpoint: `GET /projects/{uuid}`
- Mutating: ❌ No
- Requires Confirmation: ❌ No
- Timeout: 5s

**Error Codes**:
- `PROJECT_NOT_FOUND` (404) — Project UUID does not exist

---

### Tool: `create_project`

**Purpose**: Create new project

**Input Schema**:
```typescript
const CreateProjectSchema = z.object({
  name: z.string().min(1).max(255).describe("Project name"),
  description: z.string().max(1000).optional(),
});
```

**Output Schema**:
```typescript
const ProjectDetailSchema;  // (same as get_project)
```

**Metadata**:
- Endpoint: `POST /projects`
- Mutating: ✅ Yes
- Requires Confirmation: ❌ No
- Timeout: 15s

---

## Category 4: Applications (19 Tools) — Partial

### Tool: `list_applications`

**Purpose**: List applications in project/team

**Input Schema**:
```typescript
const ListApplicationsSchema = z.object({
  project_uuid: z.string().uuid().optional().describe("Filter by project"),
  environment_name: z.string().optional().describe("Filter by environment"),
  limit: z.number().int().min(1).max(100).default(50),
  skip: z.number().int().min(0).default(0),
});
```

**Output Schema**:
```typescript
const ApplicationSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  git_repository: z.string().optional(),
  docker_image: z.string().optional(),
  status: z.enum(["running", "stopped", "error"]),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

const ApplicationsListSchema = z.object({
  applications: z.array(ApplicationSchema),
  total: z.number().int(),
});
```

**Metadata**:
- Endpoint: `GET /applications`
- Mutating: ❌ No
- Requires Confirmation: ❌ No
- Timeout: 15s

---

### Tool: `restart_application`

**Purpose**: Restart an application

**Input Schema**:
```typescript
const RestartApplicationSchema = z.object({
  uuid: z.string().uuid().describe("Application UUID"),
  force: z.boolean().default(false).describe("Force restart without graceful shutdown"),
});
```

**Output Schema**:
```typescript
const ApplicationActionSchema = z.object({
  uuid: z.string().uuid(),
  action: z.literal("restart"),
  status: z.enum(["scheduled", "in_progress", "completed", "failed"]),
  started_at: z.string().datetime(),
  message: z.string().optional(),
});
```

**Metadata**:
- Endpoint: `POST /applications/{uuid}/restart`
- Mutating: ✅ Yes
- Requires Confirmation: ✅ Yes (critical: stops active application)
- Timeout: 30s

**Error Codes**:
- `APPLICATION_NOT_FOUND` (404) — Application UUID does not exist
- `APPLICATION_ALREADY_RESTARTING` (409) — Application restart already in progress

---

## Error Response Contract

All tools return errors in this standardized format:

```typescript
interface ErrorResponse {
  error: string;                         // e.g., "APPLICATION_NOT_FOUND"
  message: string;                       // Spanish explanation
  details?: Record<string, unknown>;     // Tool-specific context
  hint?: string;                         // How to resolve
}
```

**Examples**:

```json
{
  "error": "VALIDATION_FAILED",
  "message": "El parámetro 'uuid' debe ser válido UUID",
  "details": { "field": "uuid", "received": "invalid-uuid" },
  "hint": "Usa list_applications para obtener UUIDs válidos"
}
```

```json
{
  "error": "APPLICATION_NOT_FOUND",
  "message": "La aplicación 'app-123' no existe",
  "details": { "uuid": "app-123", "http_status": 404 },
  "hint": "Usa list_applications para obtener aplicaciones disponibles"
}
```

```json
{
  "error": "CONFIRMATION_REQUIRED",
  "confirmationRequired": true,
  "operation": "restart_application",
  "severity": "critical",
  "message": "¿Reiniciar aplicación 'api-backend' en PRODUCCIÓN? Se interrumpirán todos los requests activos.",
  "details": {
    "application_uuid": "app-123",
    "application_name": "api-backend",
    "environment": "production",
    "active_requests": 24
  }
}
```

---

## Confirmation Flow Contract

For tools with `requiresConfirmation: true`:

### Step 1: Agent calls tool with parameters
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "restart_application",
    "arguments": { "uuid": "app-123" }
  }
}
```

### Step 2: Server returns confirmation request
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "type": "text",
    "text": "{\"confirmationRequired\": true, \"operation\": \"restart_application\", \"confirmationToken\": \"550e8400-e29b-41d4-a716-446655440000\", \"message\": \"...\", \"details\": {...}}"
  }
}
```

### Step 3: Agent confirms operation (new tool call)
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "restart_application_confirmed",
    "arguments": {
      "uuid": "app-123",
      "confirmed": true,
      "confirmationToken": "550e8400-e29b-41d4-a716-446655440000"
    }
  }
}
```

### Step 4: Server executes and responds
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "type": "text",
    "text": "{\"uuid\": \"app-123\", \"action\": \"restart\", \"status\": \"scheduled\", \"started_at\": \"2026-05-12T14:30:00Z\"}"
  }
}
```

**Confirmation Token Validity**:
- Expires after 5 minutes by default
- Single-use (validates on execution, invalidated afterward)
- Linked to specific tool invocation (requestId)

---

## Summary: 13 Tool Categories

| Category | Count | MVP Phase 1 | Phase 2 | Phase 3 |
|----------|-------|----------|---------|---------|
| Default | 4 | ✅ 4/4 | - | - |
| Teams | 4 | ✅ 4/4 | - | - |
| Projects | 9 | ✅ 3/9 (list, get, create) | 3/9 (update, delete, env) | 3/9 (remaining) |
| Applications | 19 | ✅ 6/19 (list, get, logs, start/stop/restart) | 8/19 (create, update, env vars) | 5/19 (remaining) |
| Deployments | 5 | ✅ 4/5 (list, get, trigger, cancel) | - | 1/5 (remaining) |
| Databases | 21 | - | ✅ 7/21 (list, get, backups read) | 14/21 (write ops) |
| Services | 13 | - | ✅ 7/13 (list, get, backups) | 6/13 (write ops) |
| Servers | 8 | ✅ 4/8 (list, get, validate, resources) | - | 4/8 (write ops) |
| Resources | 1 | ✅ 1/1 | - | - |
| Private Keys | 5 | - | ✅ 2/5 (list, get) | 3/5 (write ops) |
| GitHub Apps | 7 | - | ✅ 3/7 (list, get, repos) | 4/7 (write ops) |
| Cloud Tokens | 6 | - | ✅ 2/6 (list, get) | 4/6 (write ops) |
| Hetzner | 5 | - | - | ✅ 5/5 |
| **TOTAL** | **107** | **✅ 45/107** | **~65/107** | **~107/107** |

---

## Implementation Notes

1. **Each tool category** lives in `src/tools/{category}/index.ts`
2. **Each tool's schema** is validated with Zod before execution
3. **Response validation** ensures Coolify API contract is maintained
4. **Error codes** are standardized across all tools
5. **Confirmation flow** is transparent to MCP protocol (tool registration includes metadata)
6. **All parameters** support `describe()` for MCP documentation
7. **All tools** include requestId in context for correlation

---

**Next**: Implement tools in Phase 2 based on this contract. Full tool list (107) in separate `tool-catalog.md`.
