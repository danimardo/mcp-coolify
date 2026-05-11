# Implementation Plan - MCP Coolify Phase 1 (MVP)

**Version**: 1.0.0  
**Date**: 2026-05-11  
**Status**: Ready for Implementation  
**Target Duration**: 8 weeks (estimated)

---

## Overview

This plan breaks down the MVP implementation (45 tools) into discrete, traceable tasks. Implementation follows a layered approach:

1. **Foundation Layer** (Week 1-2): Core infrastructure, configuration, logging
2. **Framework Layer** (Week 2-3): Tool abstraction, validation, error handling  
3. **Category Implementation** (Week 3-7): 6 tool categories with full CRUD coverage
4. **Testing & QA** (Week 7-8): Integration testing, performance validation
5. **Documentation** (Week 8): API docs, deployment guides

---

## Phase 1 Tool Breakdown (45 Tools Total)

### Category 1: Default (5 tools)
- `get_status` — Server health check
- `get_info` — Server info and version
- `get_config` — Current server configuration  
- `validate_token` — Validate API token connectivity
- `test_connection` — Full connectivity test

### Category 2: Teams (7 tools)
- `list_teams` — List all teams
- `get_team` — Get team details by ID
- `create_team` — Create new team
- `update_team` — Update team configuration
- `delete_team` — Delete team
- `list_team_members` — List team members
- `add_team_member` — Add member to team

### Category 3: Projects (8 tools)
- `list_projects` — List all projects
- `get_project` — Get project details
- `create_project` — Create new project
- `update_project` — Update project configuration
- `delete_project` — Delete project
- `list_project_environments` — List project environments
- `get_project_environment` — Get environment details
- `list_project_resources` — List resources in project

### Category 4: Applications (10 tools)
- `list_applications` — List all applications
- `get_application` — Get application details
- `create_application` — Create new application
- `update_application` — Update application configuration
- `delete_application` — Delete application
- `list_application_deployments` — List application deployments
- `get_application_logs` — Get application logs
- `restart_application` — Restart application (⚠️ requires confirmation)
- `stop_application` — Stop application (⚠️ requires confirmation)
- `start_application` — Start application (⚠️ requires confirmation)

### Category 5: Deployments (9 tools)
- `list_deployments` — List all deployments
- `get_deployment` — Get deployment details
- `create_deployment` — Create new deployment (⚠️ requires confirmation)
- `update_deployment` — Update deployment configuration
- `delete_deployment` — Delete deployment (⚠️ requires confirmation)
- `get_deployment_logs` — Get deployment logs
- `rollback_deployment` — Rollback to previous deployment (⚠️ requires confirmation)
- `trigger_deployment` — Trigger deployment (⚠️ requires confirmation)
- `list_deployment_history` — List deployment history

### Category 6: Servers (6 tools)
- `list_servers` — List all servers
- `get_server` — Get server details
- `validate_server` — Validate server connectivity (⚠️ long-running operation)
- `install_docker` — Install Docker on server (⚠️ requires confirmation, long-running)
- `cleanup_server` — Cleanup server storage (⚠️ requires confirmation)
- `get_server_metrics` — Get server resource metrics

---

## Implementation Tasks

### Phase 1.0: Foundation & Infrastructure

#### Task 1.0.1: Project Setup & Dependencies
- [ ] Initialize package.json with MCP SDK v1.x
- [ ] Install core dependencies (Zod, Pino, Axios)
- [ ] Configure TypeScript compiler (tsconfig.json)
- [ ] Setup ESLint with Coolify-specific rules
- [ ] Create `.env.example` with required variables
- [ ] Verify Node.js 18+ compatibility

**Acceptance Criteria**:
- npm install succeeds without warnings
- TypeScript compilation succeeds (tsc --noEmit)
- ESLint passes on empty src directory

---

#### Task 1.0.2: Logging Infrastructure
- [ ] Create `src/lib/logging/logger.server.ts` with Pino configuration
- [ ] Implement log file transport to `.logs/app.log` (human-readable)
- [ ] Implement JSONL transport to `.logs/app.jsonl` (structured)
- [ ] Implement automatic secret redaction (tokens, passwords, keys)
- [ ] Create `src/lib/logging/events.ts` with stable event names
- [ ] Create `src/lib/logging/types.ts` with Logger interface

**Acceptance Criteria**:
- Logger writes to both .logs/app.log and .logs/app.jsonl
- Secrets are automatically redacted in all outputs
- All event names follow domain.category.event pattern
- Logger can be imported and used without side effects

---

#### Task 1.0.3: Configuration & Environment
- [ ] Create `src/lib/config.ts` with Zod schema for all env variables
- [ ] Validate required env vars on startup (COOLIFY_TOKEN, COOLIFY_URL, NODE_ENV, LOG_LEVEL)
- [ ] Support LOG_LEVEL override (trace, debug, info, warn, error, fatal)
- [ ] Support READ_ONLY mode toggle
- [ ] Create configuration bootstrap logging

**Acceptance Criteria**:
- Missing required env vars trigger FATAL log and process.exit(1)
- LOG_LEVEL=debug enables detailed logs
- Configuration is validated at startup
- Invalid configuration causes clear error messages

---

#### Task 1.0.4: HTTP Client Setup
- [ ] Create `src/lib/http-client.ts` with Axios instance
- [ ] Configure Bearer token authentication header
- [ ] Implement exponential backoff retry logic (1s, 2s, 4s, then fail)
- [ ] Implement retry-on logic for 429, 500, 502, 503, 504
- [ ] Set 30-second request timeout
- [ ] Log all HTTP requests with coolify.request.* events
- [ ] Implement request ID correlation (UUID v4)

**Acceptance Criteria**:
- HTTP calls include Authorization: Bearer <token> header
- Transient errors (429, 5xx) are retried with exponential backoff
- All retries are logged with coolify.request.retry event
- Non-retryable errors (4xx except 429) fail immediately

---

#### Task 1.0.5: MCP Server Bootstrap
- [ ] Create `src/server/mcp-server.ts` MCP v1.0 server instance
- [ ] Initialize transport (stdio by default)
- [ ] Setup request ID generation for all tool invocations
- [ ] Implement mcp.tool.invoked event logging
- [ ] Implement tool result logging (mcp.tool.completed / mcp.tool.failed)
- [ ] Create server lifecycle logging (app.bootstrap.started, app.bootstrap.completed)

**Acceptance Criteria**:
- MCP server starts without errors
- `mcp.tool.invoked` is logged for every tool call
- `mcp.tool.completed` includes requestId and durationMs
- Server logs are readable from .logs/app.log

---

### Phase 1.1: Validation & Error Handling

#### Task 1.1.1: Zod Schemas for Tool Parameters
- [ ] Create `src/lib/schemas/common.ts` with shared schemas (UUID, URL, etc.)
- [ ] Implement Zod validation with clear error messages
- [ ] Create `z.parseAsync()` wrapper with error formatting
- [ ] Implement ValidationError type matching MCP spec
- [ ] Test all schemas with valid and invalid inputs

**Acceptance Criteria**:
- All schemas use z.infer<> for TypeScript type inference
- Invalid inputs produce clear, actionable error messages
- Error response includes error code, message, and hint
- All validation failures are logged with mcp.tool.parameters_invalid

---

#### Task 1.1.2: Error Response Standardization
- [ ] Create `src/lib/errors/response-formatter.ts`
- [ ] Implement error response format: { error, message, details?, hint? }
- [ ] Create specific error types: ValidationError, NotFoundError, RateLimitError, ReadOnlyError, ConfirmationRequiredError
- [ ] Implement error-to-response mapping for all Coolify API error codes
- [ ] Add automatic error context inclusion (requestId, timestamp)

**Acceptance Criteria**:
- All errors follow standardized response format
- Error codes are consistent across all tools
- Hints are actionable for users/agents
- 401/403 errors include token validation advice

---

#### Task 1.1.3: Confirmation Flow Implementation
- [ ] Create `src/lib/confirmation/flow.ts` for MCP confirmation protocol
- [ ] Implement 4-step confirmation: invoke → request → respond with token → execute
- [ ] Create confirmation context (operation, required?, parameters)
- [ ] Implement confirmation token validation
- [ ] Log all confirmation events (operation.confirmation.requested, operation.confirmed, operation.cancelled)

**Acceptance Criteria**:
- Confirmation flow follows MCP spec exactly
- Confirmation tokens are unique and expire after 5 minutes
- Cancellation is logged and prevents execution
- All 19 critical operations require confirmation

---

#### Task 1.1.4: READ_ONLY Mode Safety Guardrail
- [ ] Create `src/lib/safety/readonly-guard.ts`
- [ ] Identify all destructive tools (19 operations)
- [ ] Block destructive operations when READ_ONLY=true
- [ ] Return clear error: "Operation blocked: Server in READ_ONLY mode"
- [ ] Log all blocked operations with read_only.blocked_operation event
- [ ] Allow all read-only tools regardless of mode

**Acceptance Criteria**:
- All mutations (POST, PATCH, DELETE, start, stop, restart) are blocked in READ_ONLY mode
- Error message is clear and actionable
- Read-only tools (list_*, get_*) work normally in READ_ONLY mode
- Logging includes operation name and reason (READ_ONLY)

---

### Phase 1.2: Tool Framework & Abstraction

#### Task 1.2.1: Base Tool Definition Structure
- [ ] Create `src/lib/tools/types.ts` with ToolDefinition interface
- [ ] Define tool metadata: name, description, category, parameters, response
- [ ] Create tool context type: ToolContext { requestId, logger, httpClient, config }
- [ ] Implement ToolRegistry for tool registration
- [ ] Create tool factory function for consistent tool creation

**Acceptance Criteria**:
- All 45 MVP tools can be defined using the framework
- Tool definitions are type-safe with Zod schema infer
- ToolRegistry can list and lookup tools by name/category
- Tool factory handles logging and error wrapping

---

#### Task 1.2.2: Base Tool Implementation Mixin
- [ ] Create `src/lib/tools/base-tool.ts` with common tool logic
- [ ] Implement parameter validation wrapper
- [ ] Implement response validation wrapper (strict Zod parsing)
- [ ] Implement duration logging (durationMs)
- [ ] Implement error wrapping and logging
- [ ] Create confirmation flow integration for critical operations

**Acceptance Criteria**:
- All tools benefit from unified error handling
- Tool execution logs include durationMs
- Response validation fails with clear errors if Coolify response is malformed
- Confirmation flow is automatically applied to critical tools

---

#### Task 1.2.3: HTTP Response Validation Schemas
- [ ] Create `src/lib/schemas/coolify-responses.ts` with Zod schemas for all Coolify response types
- [ ] Implement strict validation (reject unknown properties)
- [ ] Create type-safe response interfaces using z.infer<>
- [ ] Document expected response shape for each API endpoint
- [ ] Add fallback handling for edge cases (null/undefined/empty arrays)

**Acceptance Criteria**:
- All Coolify API responses are validated against schemas
- Malformed responses produce clear validation errors
- Type inference from schemas is complete and accurate
- Response validation logs include both success and failure events

---

### Phase 1.3: Default Category Implementation

#### Task 1.3.1: Implement get_status Tool
- [ ] Call Coolify `/api/v1/health` or equivalent endpoint
- [ ] Parse server status (up, down, degraded)
- [ ] Return: { status, uptime, version }
- [ ] Add to Default category
- [ ] No confirmation required, no READ_ONLY impact
- [ ] Test with mock Coolify responses

**Acceptance Criteria**:
- Tool returns actual server status
- Response matches ToolResponse interface
- Tool is logged with mcp.tool.completed
- Duration is under 1 second

---

#### Task 1.3.2: Implement get_info Tool
- [ ] Call Coolify to fetch server info
- [ ] Return: { version, environment, features[] }
- [ ] Add to Default category
- [ ] No confirmation required, no READ_ONLY impact
- [ ] Mock test with realistic data

**Acceptance Criteria**:
- Tool provides accurate version and environment info
- Features list reflects actual Coolify capabilities
- Response is cached (optional optimization)

---

#### Task 1.3.3: Implement get_config Tool
- [ ] Call Coolify to fetch server configuration
- [ ] Return sanitized config (exclude sensitive values)
- [ ] Add to Default category
- [ ] No confirmation required, no READ_ONLY impact
- [ ] Document which config fields are sensitive (redacted)

**Acceptance Criteria**:
- Tool returns current configuration
- Sensitive fields are redacted in logs (not response)
- Configuration is validated against expected schema

---

#### Task 1.3.4: Implement validate_token Tool
- [ ] Call Coolify with supplied token
- [ ] Return: { valid: boolean, scopes[], expiresAt? }
- [ ] Validate Bearer token format
- [ ] Add to Default category
- [ ] No confirmation required, no READ_ONLY impact

**Acceptance Criteria**:
- Tool correctly validates token format and connectivity
- Token is not logged (automatically redacted)
- Clear error if token is invalid/expired

---

#### Task 1.3.5: Implement test_connection Tool
- [ ] Combine get_status + validate_token
- [ ] Return comprehensive connectivity check: { status, token_valid, endpoint_reachable, latency_ms }
- [ ] Add to Default category
- [ ] No confirmation required, no READ_ONLY impact
- [ ] Useful for diagnostic purposes

**Acceptance Criteria**:
- Tool provides complete connectivity picture
- Latency measurement is accurate (within 50ms)
- All components are tested independently

---

### Phase 1.4: Teams Category Implementation (7 tools)

#### Task 1.4.1: Implement list_teams
- [ ] Call `GET /api/v1/teams`
- [ ] Return: { teams: [{ id, name, description }] }
- [ ] No parameters required
- [ ] No confirmation, no READ_ONLY impact
- [ ] Pagination: handle limit/offset

**Acceptance Criteria**:
- Returns all teams accessible to API token
- Response is paginated if > 50 teams
- No sensitive team data is exposed

---

#### Task 1.4.2: Implement get_team
- [ ] Call `GET /api/v1/teams/{teamId}`
- [ ] Parameter: teamId (UUID)
- [ ] Return: { id, name, description, createdAt, createdBy }
- [ ] No confirmation, no READ_ONLY impact
- [ ] Return 404 if team doesn't exist

**Acceptance Criteria**:
- Returns full team details
- Non-existent team returns clear 404 error
- Team ID parameter is validated as UUID

---

#### Task 1.4.3: Implement create_team
- [ ] Call `POST /api/v1/teams` with { name, description? }
- [ ] Parameters: name (string, 1-255 chars), description (optional)
- [ ] Return: { id, name, description, createdAt }
- [ ] **Requires confirmation** (critical operation)
- [ ] **READ_ONLY blocks** this operation
- [ ] Validate name uniqueness and format

**Acceptance Criteria**:
- Confirmation flow is triggered before creation
- Team is created with provided name/description
- Response includes new team ID
- Operation is logged with operation.confirmed event

---

#### Task 1.4.4: Implement update_team
- [ ] Call `PATCH /api/v1/teams/{teamId}` with updates
- [ ] Parameters: teamId (UUID), name? (string), description?
- [ ] Return updated team object
- [ ] **Requires confirmation** (critical operation)
- [ ] **READ_ONLY blocks** this operation

**Acceptance Criteria**:
- Only provided fields are updated
- Team ID is validated as UUID
- Confirmation is required before update

---

#### Task 1.4.5: Implement delete_team
- [ ] Call `DELETE /api/v1/teams/{teamId}`
- [ ] Parameter: teamId (UUID)
- [ ] **Requires confirmation** (critical operation - irreversible)
- [ ] **READ_ONLY blocks** this operation
- [ ] Check for team dependencies (projects, etc.)

**Acceptance Criteria**:
- Confirmation flow is enforced
- Team is deleted and returns success response
- Proper error if team has active projects

---

#### Task 1.4.6: Implement list_team_members
- [ ] Call `GET /api/v1/teams/{teamId}/members`
- [ ] Parameter: teamId (UUID)
- [ ] Return: { members: [{ id, name, email, role }] }
- [ ] No confirmation, no READ_ONLY impact

**Acceptance Criteria**:
- Returns all team members with roles
- Non-existent team returns 404
- Team ID is validated as UUID

---

#### Task 1.4.7: Implement add_team_member
- [ ] Call `POST /api/v1/teams/{teamId}/members`
- [ ] Parameters: teamId (UUID), userId (UUID), role (string)
- [ ] Return added member details
- [ ] **Requires confirmation** (critical operation)
- [ ] **READ_ONLY blocks** this operation
- [ ] Validate user exists and is not already member

**Acceptance Criteria**:
- Confirmation is required before adding member
- Non-existent user returns clear error
- Member cannot be added twice

---

### Phase 1.5: Projects Category Implementation (8 tools)

#### Task 1.5.1: Implement list_projects
- [ ] Call `GET /api/v1/projects`
- [ ] Parameters: teamId? (optional filter)
- [ ] Return: { projects: [{ id, name, description, teamId }] }
- [ ] Pagination support
- [ ] No confirmation, no READ_ONLY impact

**Acceptance Criteria**:
- Returns all projects (optionally filtered by team)
- Response includes project metadata
- Pagination handles > 50 projects

---

#### Task 1.5.2: Implement get_project
- [ ] Call `GET /api/v1/projects/{projectId}`
- [ ] Parameter: projectId (UUID)
- [ ] Return full project details with statistics
- [ ] No confirmation, no READ_ONLY impact

**Acceptance Criteria**:
- Returns complete project metadata
- Non-existent project returns 404
- Statistics are included (app count, deployment count)

---

#### Task 1.5.3-1.5.8: Remaining Projects Tools
[Similar detailed specifications for:
- create_project (confirmation required, READ_ONLY blocks)
- update_project (confirmation required, READ_ONLY blocks)
- delete_project (confirmation required, READ_ONLY blocks)
- list_project_environments
- get_project_environment
- list_project_resources]

---

### Phase 1.6: Applications Category Implementation (10 tools)

#### Task 1.6.1-1.6.10: Application Tools
[Similar structure to Teams/Projects:
- list_applications
- get_application
- create_application (confirmation, READ_ONLY)
- update_application (confirmation, READ_ONLY)
- delete_application (confirmation, READ_ONLY)
- list_application_deployments
- get_application_logs
- restart_application (confirmation, READ_ONLY, long-running)
- stop_application (confirmation, READ_ONLY)
- start_application (confirmation, READ_ONLY)]

---

### Phase 1.7: Deployments Category Implementation (9 tools)

#### Task 1.7.1-1.7.9: Deployment Tools
[Similar structure:
- list_deployments
- get_deployment
- create_deployment (confirmation, READ_ONLY)
- update_deployment (confirmation, READ_ONLY)
- delete_deployment (confirmation, READ_ONLY)
- get_deployment_logs
- rollback_deployment (confirmation, READ_ONLY, dangerous)
- trigger_deployment (confirmation, READ_ONLY)
- list_deployment_history]

---

### Phase 1.8: Servers Category Implementation (6 tools)

#### Task 1.8.1-1.8.6: Server Tools
[Similar structure:
- list_servers
- get_server
- validate_server (long-running operation, might require progress tracking)
- install_docker (confirmation, READ_ONLY, very long-running)
- cleanup_server (confirmation, READ_ONLY)
- get_server_metrics]

---

### Phase 1.9: Integration Testing & QA

#### Task 1.9.1: Unit Tests for Core Infrastructure
- [ ] Test logger functionality (file write, redaction, levels)
- [ ] Test configuration validation
- [ ] Test HTTP client with mock responses
- [ ] Test Zod schemas with valid/invalid inputs
- [ ] Test error formatting and response structure
- [ ] Target: 85%+ coverage on core libs

**Acceptance Criteria**:
- All core library tests pass
- Coverage report shows > 85% coverage
- No failing tests

---

#### Task 1.9.2: Integration Tests for Each Tool Category
- [ ] Create mock Coolify API server for testing
- [ ] Test each of 45 tools with realistic responses
- [ ] Test error scenarios (404, 500, timeout, etc.)
- [ ] Test confirmation flow (request → token → execute)
- [ ] Test READ_ONLY mode blocking
- [ ] Target: 75%+ overall coverage

**Acceptance Criteria**:
- All 45 tools have passing integration tests
- Error scenarios are covered
- Confirmation flow is tested end-to-end

---

#### Task 1.9.3: End-to-End Testing with Real Coolify
- [ ] Setup test environment or use staging Coolify instance
- [ ] Run full tool suite against real API
- [ ] Verify response formats match schema
- [ ] Test performance (no tool should exceed 30s timeout)
- [ ] Test auth with real token
- [ ] Document any API discrepancies

**Acceptance Criteria**:
- All tools execute successfully against real API
- Response formats are correct
- No tools timeout
- Performance is acceptable (< 5s for most tools)

---

#### Task 1.9.4: Performance & Load Testing
- [ ] Profile tool execution time
- [ ] Verify exponential backoff doesn't cause excessive delays
- [ ] Test concurrent tool invocations
- [ ] Measure memory usage over time
- [ ] Document performance baseline

**Acceptance Criteria**:
- 95% of tools complete in < 2 seconds
- Concurrent invocations don't cause memory leaks
- Performance is acceptable for agent use

---

### Phase 1.10: Documentation & Deployment

#### Task 1.10.1: API Documentation
- [ ] Generate OpenAPI/JSON schema for all 45 tools
- [ ] Document all tool parameters, responses, error codes
- [ ] Create agent-friendly documentation
- [ ] Document confirmation flow and READ_ONLY mode
- [ ] Include example invocations for each tool

**Acceptance Criteria**:
- All 45 tools are documented
- Documentation includes parameter types and constraints
- Examples are executable and correct

---

#### Task 1.10.2: Deployment & Operations Guide
- [ ] Create installation guide (npm install, .env setup)
- [ ] Document environment variables and their purpose
- [ ] Create troubleshooting guide based on common logs
- [ ] Document monitoring and logging interpretation
- [ ] Create runbook for common issues

**Acceptance Criteria**:
- Guide is clear and step-by-step
- All env variables are documented
- Troubleshooting section covers common issues

---

#### Task 1.10.3: Code Review & Quality Gates
- [ ] ESLint passes with zero warnings
- [ ] TypeScript strict mode passes
- [ ] Test coverage ≥ 80%
- [ ] Code review checklist from constitution.md is satisfied
- [ ] No console.log, no hardcoded credentials

**Acceptance Criteria**:
- All quality gates pass
- No outstanding code review comments
- All checklist items are satisfied

---

#### Task 1.10.4: Release Preparation
- [ ] Update package version to 1.0.0-rc.1
- [ ] Update CHANGELOG.md with MVP features
- [ ] Tag release in git (v1.0.0-rc.1)
- [ ] Create release notes for Phase 1
- [ ] Document breaking changes (none expected for MVP)

**Acceptance Criteria**:
- Version is updated
- Release tag is created
- Release notes are complete

---

## Timeline & Resource Allocation

| Phase | Task Range | Duration | Dependencies |
|-------|-----------|----------|--------------|
| 1.0 Foundation | 1.0.1 - 1.0.5 | 2 weeks | None |
| 1.1 Validation | 1.1.1 - 1.1.4 | 1 week | Phase 1.0 complete |
| 1.2 Framework | 1.2.1 - 1.2.3 | 1 week | Phase 1.0, 1.1 complete |
| 1.3 Default | 1.3.1 - 1.3.5 | 3 days | Phase 1.2 complete |
| 1.4-1.8 Categories | 1.4.1 - 1.8.6 | 3 weeks | Phase 1.3 complete |
| 1.9 Testing | 1.9.1 - 1.9.4 | 1.5 weeks | All categories complete |
| 1.10 Documentation | 1.10.1 - 1.10.4 | 1 week | Phase 1.9 complete |
| **Total** | | **8-9 weeks** | |

---

## Success Criteria

✅ **Functional**: All 45 MVP tools are implemented and working  
✅ **Reliable**: 95%+ test coverage, all integration tests pass  
✅ **Safe**: READ_ONLY mode blocks mutations, confirmation flow works for 19 critical ops  
✅ **Observable**: All operations logged with stable event names, structured JSON logs  
✅ **Maintainable**: Code follows constitution.md guidelines, TypeScript strict mode, ESLint clean  
✅ **Documented**: Complete API docs, deployment guide, runbook, release notes  

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Coolify API undocumented behavior | Medium | High | Early E2E testing with real Coolify |
| Performance bottleneck (timeouts) | Low | High | Profile tools early, implement caching |
| Token expiration during long operations | Low | Medium | Implement token refresh in HTTP client |
| Confirmation flow complexity | Medium | Medium | Extensive testing of flow, clear error messages |
| Breaking changes in Coolify API | Low | High | Monitor Coolify releases, version pin dependencies |

---

## Next Steps

1. **Kick off Phase 1.0**: Begin with Task 1.0.1 (Project Setup)
2. **Weekly syncs**: Track progress against 45-tool MVP
3. **Early E2E testing**: Don't wait until end to test against real Coolify
4. **Agent feedback**: Get early feedback on tool UX from agents
5. **Phase 2 planning**: Start Phase 2 (65 tools) once Phase 1.0 is stable
