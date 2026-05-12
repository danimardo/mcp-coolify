# Phase 0: Research & Clarifications

**Status**: ✅ COMPLETE — All clarifications answered in spec.md session 2026-05-12

**Branch**: `001-mcp-coolify` | **Date**: 2026-05-12

---

## Resolved Clarifications

### Q1: Performance SLA Targets?
**Decision**: P95 < 5s latency, P99 < 10s, 99.5% availability

**Rationale**: Aligned with typical Coolify API response times (infrastructure management operations are I/O bound, not compute bound)

**Implications**:
- Tool execution must complete within 10s P99
- Retry logic with exponential backoff fits within SLA
- Timeout default 30s is sufficient buffer

---

### Q2: Concurrent Request Handling Strategy?
**Decision**: Unlimited concurrent requests via Node.js event loop with internal queuing if needed

**Rationale**: Node.js event loop naturally handles concurrency; no need for explicit connection pooling or request queuing at MVP

**Implications**:
- Each tool invocation is async/await, non-blocking
- Coolify API rate limiting (429) handled via retry + Retry-After header
- Memory footprint scales with concurrent requests (typical: <100MB for moderate load)
- No queue implementation needed for MVP; revisit if bottleneck observed

---

### Q3: Coolify API Versioning Strategy?
**Decision**: Support Coolify v4.x minor versions; breaking changes on v5+ require documented migration path

**Rationale**: Coolify v4 is stable LTS; v4.x backward compatibility expected

**Implications**:
- Zod schemas validate ALL Coolify API responses strictly (reject unexpected fields)
- CHANGELOG documents v5+ migration path when released
- Token validation at bootstrap confirms API availability
- No version detection needed; assume v4.x

---

## Technology Stack Validation

### MCP SDK
- **Status**: ✅ `@modelcontextprotocol/sdk` v1.0+ is final spec
- **Validation**: Official SDK, supports stdio/HTTP transports
- **No clarification needed**

### Zod
- **Status**: ✅ v3.22+ provides `z.infer<>` type inference
- **Validation**: DRY (schema → types), runtime validation, error messages
- **No alternatives evaluated** (non-negotiable per constitution)

### Pino
- **Status**: ✅ v8.16+ supports structured logging, async I/O, transports
- **Validation**: High-performance, production-ready, file transport support
- **No alternatives evaluated** (non-negotiable per constitution)

### Axios
- **Status**: ✅ v1.6+ supports timeout hooks, retry interceptors, request/response transforms
- **Validation**: Handles exponential backoff via interceptors, Retry-After header parsing
- **Alternatives considered**: Node.js fetch API (v18+) lacks timeout/retry out-of-box; Axios maturity favored

### Date-fns
- **Status**: ✅ v2.30+ supports timezone formatting (`Europe/Madrid`)
- **Validation**: Needed for human-readable log timestamps with timezone
- **No clarification needed**

---

## Architecture Decisions Requiring No Research

All ADRs from constitution.md are **locked** (non-negotiable):

1. **Zod Validation** → Confirmed suitable for inputs + API responses
2. **Config Centralization** → Fail-fast bootstrap approach = standard practice
3. **Pino Logging** → Structured logging industry standard
4. **Stable Event Names** → Enables audit automation, no ambiguity
5. **Secret Redaction** → Automatic at logger level, zero trust
6. **READ_ONLY Mode** → Simple global flag, prevents accidents
7. **Confirmation Flow** → MCP protocol supports callbacks, no issue
8. **Exponential Backoff** → RFC 7231 standard for retries
9. **Bearer Token Auth** → Coolify API standard (OAuth 2.0 compatible)
10. **Confirmation Requirement** → 19 critical operations documented

---

## Critical Dependencies Validated

| Dependency | Why Critical | Status |
|----------|-----------|--------|
| **Coolify API v4** | All tool implementations call Coolify endpoints | ✅ API available, documented, v4.x stable |
| **Node.js 18+** | Runtime requirement, async/await, crypto.randomUUID | ✅ LTS, widely available |
| **TypeScript 5.0** | Strict mode enforcement, type inference | ✅ Latest stable, widely used |
| **Zod 3.22** | Runtime validation + DRY types | ✅ Mature, production-ready |
| **Pino 8.16** | Structured logging, file transports | ✅ Production-ready, high-performance |

---

## No Blocking Unknowns

✅ **All major questions answered** in spec.md clarifications (session 2026-05-12)

✅ **Architecture patterns validated** against constitution.md non-negotiables

✅ **Technology stack confirmed** (no alternatives needed)

✅ **Ready to proceed** to Phase 1 (Design)

---

## Next Phase: Phase 1 Design

Phase 1 will produce:
1. **data-model.md** — Entity definitions, relationships, state transitions
2. **contracts/tool-definitions.md** — ~107 tool schemas, parameters, error codes
3. **contracts/mcp-protocol.md** — Request/response formats, confirmation flow
4. **quickstart.md** — Setup, environment variables, first test run

**Estimated artifacts**: 4 documents, ~2000-3000 lines combined
