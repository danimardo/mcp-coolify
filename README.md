# MCP Coolify Server

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MCP](https://img.shields.io/badge/MCP-1.0-purple.svg)](https://modelcontextprotocol.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Servidor [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) que expone la **API de Coolify v4** como ~107 herramientas para agentes de IA como Claude Code.

Con este MCP puedes hablarle a Claude en lenguaje natural y pedirle que gestione tu infraestructura Coolify: listar aplicaciones, consultar logs, lanzar deployments, reiniciar servicios, gestionar bases de datos... todo sin salir del chat.

---

## Contenido

- [¿Qué necesito?](#-qué-necesito)
- [Instalación](#-instalación)
  - [Windows](#windows)
  - [Linux / macOS](#linux--macos)
- [Configurar el archivo .env](#-configurar-el-archivo-env)
- [Integrar con Claude Code](#-integrar-con-claude-code)
  - [Windows](#windows-1)
  - [Linux / macOS](#linux--macos-1)
  - [Cómo usarlo](#cómo-usarlo)
- [Herramientas disponibles](#-herramientas-disponibles-107)
- [Seguridad y confirmaciones](#-seguridad-y-confirmaciones)
- [Modo READ_ONLY](#-modo-read_only)
- [Logging y diagnóstico](#-logging-y-diagnóstico)
- [Desarrollo](#-desarrollo)
- [Resolución de problemas](#-resolución-de-problemas)

---

## ¿Qué necesito?

- **Node.js 18+** — [descargar](https://nodejs.org/en/download)
- **npm 9+** — incluido con Node.js
- **Claude Code** — CLI o app de escritorio
- **Una instancia de Coolify** con acceso a la API
- **Token de API de Coolify** — obtener en tu panel Coolify → Settings → API Tokens

---

## Instalación

### Windows

Abre **PowerShell** (o Windows Terminal) y ejecuta:

```powershell
# Clonar el repositorio
git clone https://github.com/tu-usuario/mcp-coolify.git
cd mcp-coolify

# Instalar dependencias
npm install

# Copiar la plantilla de configuración
copy .env.example .env

# Compilar (genera la carpeta dist/)
npm run build
```

Edita el archivo `.env` con tu editor favorito (VS Code, Bloc de notas, etc.):

```powershell
# Con VS Code:
code .env

# Con Bloc de notas:
notepad .env
```

### Linux / macOS

```bash
git clone https://github.com/tu-usuario/mcp-coolify.git
cd mcp-coolify

npm install

cp .env.example .env
nano .env   # o el editor que prefieras

npm run build
```

---

## Configurar el archivo .env

Abre el `.env` que acabas de crear y rellena al menos los dos campos obligatorios:

```bash
# OBLIGATORIOS
COOLIFY_BASE_URL=https://coolify.midominio.com/api/v1
COOLIFY_TOKEN=tr_xxxxxxxxxxxxxxxxxxxx
```

El resto son opcionales y ya tienen valores por defecto razonables:

| Variable | Default | Descripción |
|---|---|---|
| `NODE_ENV` | `development` | Entorno de ejecución |
| `LOG_LEVEL` | `info` | Verbosidad: `trace`, `debug`, `info`, `warn`, `error`, `fatal` |
| `LOG_DIR` | `.logs` | Carpeta donde se escriben los logs |
| `LOG_TO_FILES` | `true` | Escribe logs a disco (`.logs/app.log` y `.logs/app.jsonl`) |
| `LOG_TIMEZONE` | `Europe/Madrid` | Timezone para timestamps legibles |
| `READ_ONLY` | `false` | `true` bloquea toda operación de escritura |
| `COOLIFY_REQUEST_TIMEOUT` | `30000` | Timeout por request (ms) |
| `COOLIFY_MAX_RETRIES` | `3` | Reintentos ante errores transitorios |
| `VALIDATE_TOKEN_ON_STARTUP` | `true` | Valida el token antes de arrancar |

> **Cómo obtener el token de Coolify**: entra en tu panel Coolify, ve a **Settings → API Tokens**, crea uno nuevo y cópialo. Siempre empieza por `tr_`.

---

## Integrar con Claude Code

El MCP se conecta a Claude Code mediante **stdio**: Claude Code lanza el proceso del servidor y se comunica con él por entrada/salida estándar. No necesitas levantar ningún servidor manualmente.

La configuración se guarda en un archivo JSON. Puedes configurarlo a nivel global (para todos tus proyectos) o a nivel de proyecto.

### Windows

El archivo de configuración global está en:
```
C:\Users\<tu-usuario>\.claude\mcp.json
```

Si no existe, créalo. El contenido debe ser:

```json
{
  "mcpServers": {
    "coolify": {
      "command": "node",
      "args": ["C:\\Users\\<tu-usuario>\\proyectos\\mcp-coolify\\dist\\server\\index.js"],
      "env": {
        "COOLIFY_BASE_URL": "https://coolify.midominio.com/api/v1",
        "COOLIFY_TOKEN": "tr_xxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

> **Importante en Windows**: usa doble barra invertida (`\\`) en las rutas dentro del JSON.

Para saber la ruta exacta del proyecto, ejecuta en PowerShell desde la carpeta del repositorio:
```powershell
(Get-Item .).FullName
# Ejemplo: C:\Users\daniel\proyectos\mcp-coolify
```

Luego añade `\\dist\\server\\index.js` al final.

#### Alternativa: configuración por proyecto

Crea un archivo `.mcp.json` en la raíz de tu proyecto de trabajo (no del repositorio de este MCP). Claude Code lo detectará automáticamente:

```json
{
  "mcpServers": {
    "coolify": {
      "command": "node",
      "args": ["C:\\Users\\<tu-usuario>\\proyectos\\mcp-coolify\\dist\\server\\index.js"],
      "env": {
        "COOLIFY_BASE_URL": "https://coolify.midominio.com/api/v1",
        "COOLIFY_TOKEN": "tr_xxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

### Linux / macOS

El archivo de configuración global está en:
```
~/.claude/mcp.json
```

```json
{
  "mcpServers": {
    "coolify": {
      "command": "node",
      "args": ["/home/usuario/proyectos/mcp-coolify/dist/server/index.js"],
      "env": {
        "COOLIFY_BASE_URL": "https://coolify.midominio.com/api/v1",
        "COOLIFY_TOKEN": "tr_xxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

Para obtener la ruta del proyecto:
```bash
cd mcp-coolify && pwd
# Ejemplo: /home/usuario/proyectos/mcp-coolify
```

### Cómo usarlo

Una vez configurado, **reinicia Claude Code** (o recarga la configuración MCP). Las herramientas del servidor Coolify estarán disponibles automáticamente.

No hace falta ninguna sintaxis especial. Habla con Claude de forma natural:

```
¿Qué aplicaciones tengo en Coolify?

Reinicia la aplicación "mi-blog" en Coolify.

Muéstrame los últimos logs de la aplicación con UUID abc-123.

¿Cuántos proyectos tengo? ¿Cuál es el estado de los servidores?

Lanza un nuevo deployment de la aplicación "api-produccion".
```

Claude detectará automáticamente qué herramientas necesita y las invocará. Para operaciones destructivas (borrar, detener, etc.) el MCP pedirá confirmación explícita antes de ejecutar.

#### Verificar que el MCP está funcionando

En Claude Code, puedes pedirle directamente:
```
Usa la herramienta validate_token de coolify para verificar que la conexión está funcionando.
```

O simplemente:
```
¿Está la conexión a Coolify funcionando?
```

---

## Herramientas disponibles (~107)

El servidor expone herramientas organizadas en 13 categorías:

| Categoría | Herramientas | Ejemplos |
|---|---|---|
| **Default** | 4 | `get_info`, `get_health`, `validate_token`, `test_connection` |
| **Teams** | 4 | `get_current_team`, `list_all_teams`, `get_team_by_id`, `get_current_team_members` |
| **Projects** | 5 | `list_projects`, `get_project`, `create_project`, `update_project`, `delete_project` |
| **Environments** | 4 | `list_environments`, `get_environment`, `create_environment`, `delete_environment` |
| **Applications** | 11 | `list_applications`, `get_application`, `get_application_logs`, `start_application`, `stop_application`, `restart_application`, `trigger_deployment`… |
| **Deployments** | 3 | `list_deployments`, `get_deployment`, `cancel_deployment` |
| **Databases** | 15 | `list_databases`, `get_database`, `create_database_postgres`, `create_database_mysql`, `create_database_redis`… |
| **Services** | 6 | `list_services`, `get_service`, `create_service`, `start_service`, `stop_service`, `restart_service` |
| **Servers** | 8 | `list_servers`, `get_server`, `create_server`, `validate_server`, `get_server_resources`, `get_server_domains`… |
| **Private Keys** | 4 | `list_private_keys`, `get_private_key`, `create_private_key`, `delete_private_key` |
| **GitHub Apps** | 4 | `list_github_apps`, `create_github_app`, `update_github_app`, `delete_github_app` |
| **Cloud Tokens** | 6 | `list_cloud_tokens`, `get_cloud_token`, `create_cloud_token`, `validate_cloud_token`… |
| **Hetzner** | 3 | `list_hetzner_locations`, `list_hetzner_images`, `list_server_types` |

Ver [especificación completa](specs/001-mcp-coolify/spec.md) para parámetros y comportamiento de cada herramienta.

---

## Seguridad y confirmaciones

Determinadas operaciones son destructivas o tienen coste económico. El MCP las bloquea por defecto y exige una confirmación explícita en dos pasos antes de ejecutarlas.

### Operaciones que requieren confirmación

**Eliminaciones irreversibles:**
- `delete_project`, `delete_application`, `delete_environment`
- `delete_database`, `delete_service`, `delete_server`
- `delete_private_key`, `delete_github_app`, `delete_cloud_token`
- `delete_database_backup`, `delete_backup_execution`

**Acciones de parada:**
- `cancel_deployment`, `stop_application`, `stop_database`, `stop_service`

**Producción / coste:**
- `trigger_deployment` (en ramas main/production)
- `create_hetzner_server`

**Gestión de secretos:**
- `create_private_key`, `create_cloud_token`, `create_github_app`

### Flujo de confirmación

```
1. Pides a Claude que ejecute una operación crítica
   ↓
2. El MCP responde con un token de confirmación:
   {
     "requiresConfirmation": true,
     "operationId": "op-550e8400-...",
     "confirmationToken": "a1b2c3d4-...",
     "reason": "Esta operación eliminará la aplicación permanentemente"
   }
   ↓
3. Claude te muestra el token y espera tu OK
   ↓
4. Tú confirmas ("sí, adelante" o similar)
   ↓
5. Claude invoca confirm_operation con el token
   ↓
6. La operación se ejecuta
```

Los tokens de confirmación expiran a los **5 minutos**. Si no confirmas a tiempo, el proceso empieza de nuevo.

---

## Modo READ_ONLY

Para explorar tu infraestructura sin riesgo de modificar nada, activa el modo de solo lectura:

```bash
# En .env:
READ_ONLY=true

# O al lanzar:
READ_ONLY=true npm run dev
```

En este modo:
- Todas las consultas GET funcionan con normalidad
- Las operaciones de escritura (POST, PATCH, DELETE) devuelven error 403
- Cada intento bloqueado queda registrado como evento `read_only.blocked_operation`

---

## Logging y diagnóstico

En desarrollo, el servidor escribe logs en dos formatos en la carpeta `.logs/`:

**`.logs/app.log`** — legible para humanos:
```
12/05/2026 10:40:50  [INFO]  mcp.tool.completed
  requestId: "550e8400-e29b-41d4-a716-446655440000"
  tool: "list_applications"
  durationMs: 543
```

**`.logs/app.jsonl`** — JSON Lines, una línea por evento (útil para grep/jq):
```json
{"timestamp":"2026-05-12T10:40:50.000Z","level":"info","eventName":"mcp.tool.completed","context":{"tool":"list_applications","durationMs":543}}
```

Ambos archivos se truncan en cada reinicio y están en `.gitignore`.

### Ver logs en tiempo real

```powershell
# PowerShell (Windows)
Get-Content .logs\app.log -Wait

# bash (Linux / macOS / Git Bash en Windows)
tail -f .logs/app.log
```

### Aumentar verbosidad para depurar

```bash
LOG_LEVEL=debug npm run dev
```

### Eventos clave

| Evento | Cuándo |
|---|---|
| `app.bootstrap.started` | El servidor arranca |
| `app.bootstrap.token_validated` | Token de Coolify verificado |
| `app.bootstrap.failed` | El servidor no pudo arrancar |
| `mcp.tool.invoked` | Claude solicita una herramienta |
| `mcp.tool.completed` | Herramienta ejecutada con éxito |
| `mcp.tool.failed` | La herramienta devolvió error |
| `coolify.request.retry` | Reintentando (error 429 o 5xx) |
| `coolify.request.failed` | El request a Coolify falló |
| `read_only.blocked_operation` | Operación bloqueada en modo READ_ONLY |
| `operation.confirmation.requested` | Esperando confirmación del usuario |
| `operation.confirmed` | Operación confirmada y ejecutada |

Los tokens, passwords y API keys se redactan automáticamente como `[REDACTED]` en todos los logs.

---

## Desarrollo

### Comandos útiles

```bash
# Servidor en modo desarrollo (recarga automática de código)
npm run dev

# Compilar TypeScript a dist/
npm run build

# Tests (116 tests)
npm test
npm run test:coverage

# Linting y verificación de tipos
npm run lint
npm run type-check

# Todo junto (igual que el pre-commit hook)
npm run precommit
```

### Estructura del proyecto

```
src/
├── lib/
│   ├── confirmation/     # Flujo de confirmación de operaciones críticas
│   ├── coolify/          # Cliente HTTP para Coolify API (retry, timeout)
│   ├── logging/          # Sistema de logging (tipos, sanitización)
│   ├── safety/           # Guardia READ_ONLY
│   ├── schemas/          # Schemas Zod compartidos
│   └── config.ts         # Configuración centralizada
│
├── server/
│   ├── index.ts          # Entry point del servidor MCP
│   └── logging/          # Inicialización del logger (Pino)
│
└── tools/                # ~107 herramientas en 13 carpetas
    ├── default/
    ├── applications/
    ├── databases/
    └── ...

.logs/                    # Logs de desarrollo (gitignored)
specs/001-mcp-coolify/    # Especificación técnica completa
```

---

## Resolución de problemas

### El servidor no arranca

```powershell
# 1. Comprueba que el .env tiene los datos correctos
Get-Content .env

# 2. Verifica que el build existe
Get-ChildItem dist\server\index.js

# 3. Si no existe, compila:
npm run build

# 4. Mira los logs
Get-Content .logs\app.log
```

Errores frecuentes:

| Error en logs | Causa | Solución |
|---|---|---|
| `app.bootstrap.failed` + token | Token inválido o caducado | Genera un nuevo token en Coolify |
| `app.bootstrap.failed` + URL | URL incorrecta | Verifica que termina en `/api/v1` |
| `ENOENT dist/server/index.js` | No has compilado | Ejecuta `npm run build` |
| `Cannot find module` | Dependencias no instaladas | Ejecuta `npm install` |

### Claude Code no detecta el MCP

1. Verifica que el archivo de configuración está en la ruta correcta:
   - Windows: `C:\Users\<usuario>\.claude\mcp.json`
   - Linux/Mac: `~/.claude/mcp.json`

2. Comprueba que el JSON es válido (sin comas sobrantes, comillas correctas).

3. Asegúrate de que la ruta en `args` usa doble barra invertida en Windows (`\\`).

4. Reinicia Claude Code después de modificar la configuración.

5. Prueba el servidor manualmente para ver si arranca:
   ```powershell
   node C:\ruta\al\mcp-coolify\dist\server\index.js
   ```
   Si arranca sin errores y luego se queda esperando, es correcto (espera input de stdio).

### Las herramientas fallan silenciosamente

```bash
# Activa debug para ver los detalles de cada request
LOG_LEVEL=debug npm run dev
```

Luego busca el `requestId` de la operación que falló y filtra por él:

```powershell
# PowerShell
Select-String "req-abc123" .logs\app.log

# bash
grep "req-abc123" .logs/app.log
```

---

## Documentación adicional

- [Especificación técnica](specs/001-mcp-coolify/spec.md) — Arquitectura, protocolo MCP, esquemas
- [Eventos de logging](logging-events.md) — Catálogo completo de 50+ eventos
- [API Coolify v4](docs/manual_api_coolify_programador.md) — Referencia de endpoints
- [Plan de implementación](specs/001-mcp-coolify/plan.md) — Decisiones de arquitectura

---

## Contribuir

1. Haz fork del repositorio
2. Crea una rama: `git checkout -b feature/mi-mejora`
3. Haz tus cambios
4. Asegúrate de que todo pasa: `npm run precommit`
5. Haz commit y abre un Pull Request

**Requisitos para que se acepte un PR:**
- Todos los tests pasan (`npm test`)
- Sin errores de linting (`npm run lint`)
- Sin errores de tipos (`npm run type-check`)
- Tests nuevos para funcionalidad nueva
- Documentación actualizada si el comportamiento observable cambia

---

## Licencia

MIT — ver [LICENSE](LICENSE) para detalles.

---

*v1.0.0-rc.1 — Última actualización: 2026-05-12*
