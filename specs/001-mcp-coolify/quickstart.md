# Phase 1: Quickstart Guide

**Status**: Phase 1 Design (produced by `/speckit-plan`)  
**Purpose**: First-time setup and validation  
**Branch**: `001-mcp-coolify` | **Date**: 2026-05-12

---

## Prerequisites

- **Node.js**: 18.x or higher (recommend 20.x LTS)
  ```bash
  node --version  # Should be >= v18.0.0
  ```

- **npm**: 9.0 or higher
  ```bash
  npm --version
  ```

- **Coolify Instance**: v4.x with API enabled and token generated
  - You need: `COOLIFY_BASE_URL` and `COOLIFY_TOKEN`
  - Generate token in Coolify panel → Settings → API

- **Git**: For version control (already in place)

---

## Installation

### 1. Clone Repository

```bash
cd /path/to/coolify-mcp
git checkout 001-mcp-coolify
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- `@modelcontextprotocol/sdk@^1.0.0` — MCP protocol
- `zod@^3.22.0` — Runtime validation
- `pino@^8.16.0` — Structured logging
- `axios@^1.6.0` — HTTP client
- `dotenv@^16.3.0` — Environment management
- `date-fns@^2.30.0` — Date/timezone handling

### 3. Create `.env` File

Copy `.env.example` and fill in your Coolify details:

```bash
cp .env.example .env
```

**Edit `.env`**:

```bash
# Required
COOLIFY_BASE_URL=https://your-coolify-instance.com/api/v1
COOLIFY_TOKEN=2|your_token_here_from_coolify_panel

# Optional (defaults shown)
COOLIFY_REQUEST_TIMEOUT=30000                 # ms
COOLIFY_MAX_RETRIES=3
READ_ONLY=false                               # Set true to disable mutations
LOG_LEVEL=info                                # Options: trace|debug|info|warn|error|fatal
LOG_DIR=.logs
LOG_TO_FILES=true
LOG_TIMEZONE=Europe/Madrid
VALIDATE_TOKEN_ON_STARTUP=true
NODE_ENV=development
```

**Important**: `.env` is in `.gitignore` (never commit)

### 4. Verify Configuration

```bash
npm run validate:config
```

This script:
- ✅ Validates all environment variables exist
- ✅ Checks Coolify token format
- ✅ Tests connectivity to Coolify API
- ✅ Confirms COOLIFY_BASE_URL is reachable

**Expected output** (success):
```
✓ COOLIFY_TOKEN format: Valid (starts with '2|')
✓ COOLIFY_BASE_URL reachable: https://your-coolify.com/api/v1
✓ API version: 4.3.2
✓ Configuration valid. Ready to start server.
```

---

## Running the Server

### Development Mode

```bash
npm run dev
```

This starts the MCP server on stdio with:
- TypeScript compilation
- File watcher (auto-restart on changes)
- Detailed logging to `.logs/app.log`

**Expected startup sequence**:

```
[14:30:10] app.bootstrap.started
[14:30:10] app.bootstrap.config_loaded { environment: 'development', readOnly: false }
[14:30:10] coolify.request.started { endpoint: '/version' }
[14:30:11] coolify.request.completed { status: 200, durationMs: 145 }
[14:30:11] app.bootstrap.token_validated { version: '4.3.2' }
[14:30:11] app.bootstrap.completed { tools_registered: 45 }
```

### Production Mode

```bash
npm run build
npm run start
```

This:
- Compiles TypeScript to `dist/`
- Starts pre-compiled server
- Uses `LOG_TO_FILES=false` by default (pipe logs to external system)

---

## First Test: Connect and List Applications

### Via Claude Code CLI

```bash
# Start server in background
npm run dev &

# In another terminal, test MCP connection
npx @modelcontextprotocol/inspector stdio -- npm start
```

The Inspector shows all registered tools. Look for:
- ✅ `list_applications`
- ✅ `get_version`
- ✅ `list_projects`

### Via Direct HTTP Test

```bash
# Test Coolify connectivity
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-coolify.com/api/v1/applications

# Should return JSON list of applications
```

### Verify Logging

While server is running:

```bash
# In another terminal
tail -f .logs/app.log
```

You should see:
```
14:32:10  [INFO]  app.bootstrap.completed: Server ready, 45 tools registered
14:32:11  [INFO]  mcp.tool.invoked: { tool: 'list_applications', requestId: '550e8400-...' }
14:32:12  [INFO]  coolify.request.started: { endpoint: '/applications', requestId: '550e8400-...' }
14:32:13  [INFO]  coolify.request.completed: { status: 200, durationMs: 234, requestId: '550e8400-...' }
14:32:13  [INFO]  mcp.tool.completed: { tool: 'list_applications', durationMs: 265, requestId: '550e8400-...' }
```

---

## Test Scenarios (MVP Phase 1)

### Scenario 1: Read-Only Tools (No Side Effects)

```
Tool: list_applications
Parameters: {}
Expected: List of applications in JSON
Duration: < 5s typically
Logs: mcp.tool.invoked → coolify.request.* → mcp.tool.completed
```

**Test Command**:
```bash
npm run test:tool list_applications
```

### Scenario 2: Confirm Safety (READ_ONLY Mode)

```bash
READ_ONLY=true npm run dev
```

Then invoke a mutating tool:
```
Tool: restart_application
Parameters: { uuid: "app-123" }
Expected: Error 403 with read_only.blocked_operation log
Logs: mcp.tool.invoked → read_only.blocked_operation → mcp.tool.failed
```

This validates safety guard works.

### Scenario 3: Parameter Validation

```
Tool: list_applications
Parameters: { limit: "invalid" }  # Should be integer
Expected: Error 400 VALIDATION_FAILED
Logs: mcp.tool.parameters_invalid event logged
```

Zod rejects invalid parameters before API call.

### Scenario 4: Secret Redaction in Logs

Run any tool while monitoring logs:

```bash
# Terminal 1
npm run dev

# Terminal 2
tail -f .logs/app.jsonl | jq .
```

Look for logs and verify:
- ✅ No `COOLIFY_TOKEN` value visible
- ✅ `[REDACTED]` appears instead
- ✅ requestId correlates events

Example from `.logs/app.jsonl`:
```json
{"timestamp":"2026-05-12T12:32:10.000Z","eventName":"mcp.tool.invoked","context":{"tool":"list_applications","readOnly":false},"requestId":"550e8400-..."}
{"timestamp":"2026-05-12T12:32:11.000Z","eventName":"coolify.request.started","context":{"endpoint":"/applications","headers":{"authorization":"[REDACTED]"}},"requestId":"550e8400-..."}
```

---

## Development Workflow

### Running Tests

```bash
# All tests
npm test

# Specific test file
npm test -- src/lib/logging/sanitize.test.ts

# With coverage
npm test -- --coverage
```

Expected coverage minimums:
- Validation (Zod): ≥ 90%
- Logging: ≥ 85%
- Config bootstrap: ≥ 90%
- Error handling: ≥ 85%

### Linting & Type Checking

```bash
# ESLint (code quality)
npm run lint

# TypeScript strict mode
npm run type-check

# Both together
npm run check
```

Expected: Zero errors/warnings

### Building & Distribution

```bash
# Compile TypeScript
npm run build

# Produces dist/ with compiled JavaScript
ls dist/

# Test compiled version
NODE_ENV=production npm start
```

---

## Troubleshooting

### Server Won't Start

**Error**: `app.bootstrap.failed: Invalid configuration`

**Solutions**:
1. Check `.env` exists and has all required variables
   ```bash
   cat .env | grep COOLIFY_
   ```

2. Verify COOLIFY_TOKEN format (starts with `2|`)
   ```bash
   echo $COOLIFY_TOKEN
   ```

3. Check Coolify is reachable
   ```bash
   curl -I https://your-coolify.com/api/v1/version
   ```

4. View detailed error in logs
   ```bash
   cat .logs/app.log | grep "bootstrap.failed" -A5
   ```

### Token Validation Fails

**Error**: `coolify.auth.failed: 401 Unauthorized`

**Solutions**:
1. Verify token is correct in Coolify panel
2. Check token hasn't expired (regenerate if needed)
3. Verify COOLIFY_BASE_URL doesn't have trailing slash
4. Test manually:
   ```bash
   curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     $COOLIFY_BASE_URL/version
   ```

### Logs Not Being Written

**Error**: `.logs/` directory empty or missing

**Solutions**:
1. Create `.logs/` directory
   ```bash
   mkdir -p .logs
   ```

2. Check LOG_TO_FILES is true
   ```bash
   grep LOG_TO_FILES .env
   ```

3. Verify disk space available
   ```bash
   df -h
   ```

4. Check file permissions
   ```bash
   ls -la .logs/
   chmod 755 .logs
   ```

### Tools Don't Appear in Inspector

**Error**: MCP Inspector shows 0 tools

**Solutions**:
1. Check server started successfully (no `bootstrap.failed`)
2. Verify `npm install` completed
3. Check MCP SDK version
   ```bash
   npm list @modelcontextprotocol/sdk
   ```

4. Restart inspector connection

---

## Performance Baseline (MVP Phase 1)

| Tool | P50 Latency | P95 Latency | Notes |
|------|----------|----------|-------|
| `get_version` | 100ms | 250ms | Just Coolify API call |
| `list_applications` | 300ms | 800ms | Depends on number of apps |
| `get_project` | 150ms | 400ms | Single resource fetch |
| `list_projects` | 250ms | 700ms | Pagination handled |

**SLA Targets**:
- ✅ P95 < 5s (all MVP tools)
- ✅ P99 < 10s (all MVP tools)
- ✅ 99.5% availability (operational target)

---

## Environment Variables Reference

### Required

```
COOLIFY_BASE_URL        # Coolify API base URL
COOLIFY_TOKEN           # Bearer token from Coolify
```

### Optional (with Defaults)

```
COOLIFY_REQUEST_TIMEOUT=30000   # Request timeout in ms
COOLIFY_MAX_RETRIES=3           # Max retry attempts
READ_ONLY=false                 # Block mutations if true
LOG_LEVEL=info                  # Log verbosity
LOG_DIR=.logs                   # Log directory
LOG_TO_FILES=true               # Write to .logs/
LOG_TIMEZONE=Europe/Madrid      # Human-readable timestamps
VALIDATE_TOKEN_ON_STARTUP=true  # Fail if token invalid
NODE_ENV=development            # Runtime environment
```

---

## Next Steps

1. **Verify Setup**: Run all test scenarios above
2. **Read Architecture**: Review `spec.md` and `constitution.md`
3. **Explore Tools**: Browse `contracts/tool-definitions.md`
4. **Implement Tools**: Follow `/speckit-tasks` for detailed tasks
5. **Add Tests**: Follow coverage minimums in `constitution.md`

---

## Support & Debugging

For issues, check:
1. **Logs first**: `.logs/app.log` has human-readable diagnostics
2. **Spec**: `spec.md` has detailed architecture
3. **Constitution**: `constitution.md` has non-negotiable frameworks
4. **Tests**: `src/**/*.test.ts` show usage examples

To increase logging verbosity:
```bash
LOG_LEVEL=debug npm run dev
```

---

**Status**: ✅ Ready for Phase 2 (Task Generation)  
**Next Command**: `/speckit-tasks` to generate implementation tasks
