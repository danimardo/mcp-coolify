# MCP Coolify Server

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MCP](https://img.shields.io/badge/MCP-1.0-purple.svg)](https://modelcontextprotocol.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Servidor [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) que expone la **API de Coolify v4** como **92 herramientas** para agentes de IA como Claude Code.

Con este MCP le hablas a Claude en lenguaje natural y él gestiona tu infraestructura Coolify por ti: listar aplicaciones, leer logs (incluidos los de contenedores de servicios y bases de datos vía SSH), lanzar deployments, reiniciar servicios, crear bases de datos, aprovisionar servidores… todo sin salir del chat y con confirmación explícita antes de cualquier acción destructiva.

---

## Contenido

- [¿Qué necesito?](#qué-necesito)
- [Instalación](#instalación)
  - [Windows](#windows)
  - [Linux / macOS](#linux--macos)
- [Configuración: el archivo `.env`](#configuración-el-archivo-env)
  - [Variables obligatorias](#variables-obligatorias)
  - [Variables opcionales](#variables-opcionales)
  - [Logs de contenedores vía SSH](#logs-de-contenedores-vía-ssh-configuración)
- [Integrar con Claude Code](#integrar-con-claude-code)
- [Herramientas disponibles](#herramientas-disponibles)
- [Guía: logs de contenedores vía SSH](#guía-logs-de-contenedores-vía-ssh)
- [Qué puedes pedirle a Claude — ejemplos por herramienta](#qué-puedes-pedirle-a-claude--ejemplos-por-herramienta)
- [Integrar el MCP en tu flujo de trabajo](#integrar-el-mcp-en-tu-flujo-de-trabajo-de-desarrollo)
- [Seguridad y confirmaciones](#seguridad-y-confirmaciones)
- [Modo READ_ONLY](#modo-read_only)
- [Logging y diagnóstico](#logging-y-diagnóstico)
- [Desarrollo](#desarrollo)
- [Resolución de problemas](#resolución-de-problemas)

---

## ¿Qué necesito?

| Requisito | Detalle |
|---|---|
| **Node.js 18+** | [Descargar](https://nodejs.org/en/download). `npm` viene incluido. |
| **Claude Code** | CLI o app de escritorio. Cualquier cliente MCP compatible con transporte *stdio* sirve. |
| **Una instancia de Coolify v4** | Con la API habilitada. |
| **Un token de API de Coolify** | Se genera en el panel: **Settings → API Tokens**. Empieza por `tr_` (o `1|`, `2|` en instancias antiguas). |
| *(Opcional)* **Acceso SSH al host Docker** | Solo si quieres usar `get_container_logs` para ver logs de servicios y bases de datos. Ver la [guía de SSH](#guía-logs-de-contenedores-vía-ssh). |

---

## Instalación

### Windows

Abre **PowerShell** (o Windows Terminal) y ejecuta:

```powershell
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/mcp-coolify.git
cd mcp-coolify

# 2. Instalar dependencias
npm install

# 3. Copiar la plantilla de configuración
copy .env.example .env

# 4. Compilar (genera la carpeta dist/)
npm run build
```

Edita `.env` con tu editor favorito:

```powershell
code .env      # VS Code
notepad .env   # Bloc de notas
```

### Linux / macOS

```bash
git clone https://github.com/tu-usuario/mcp-coolify.git
cd mcp-coolify

npm install
cp .env.example .env
nano .env          # o el editor que prefieras

npm run build
```

> **Compilar es obligatorio.** El cliente MCP arranca el servidor desde `dist/server/index.js`. Cada vez que actualices el código (`git pull`), ejecuta `npm run build` de nuevo y reinicia el cliente MCP.

---

## Configuración: el archivo `.env`

El servidor lee su configuración de variables de entorno. En desarrollo, `.env` (en la raíz del repositorio) es la forma más cómoda de definirlas; en producción normalmente se inyectan desde el bloque `env` de la configuración del cliente MCP (ver [Integrar con Claude Code](#integrar-con-claude-code)).

> `.env` está en `.gitignore`. **Nunca lo subas al repositorio**: contiene tu token.

### Variables obligatorias

```bash
COOLIFY_BASE_URL=https://coolify.midominio.com/api/v1   # debe terminar en /api/v1
COOLIFY_TOKEN=tr_xxxxxxxxxxxxxxxxxxxxxxxx
```

**Cómo obtener el token**: en tu panel de Coolify, **Settings → API Tokens → Create New Token**. Cópialo en el momento (no se vuelve a mostrar).

### Variables opcionales

Todas tienen un valor por defecto sensato:

| Variable | Default | Descripción |
|---|---|---|
| `NODE_ENV` | `development` | `development` \| `production` \| `test` |
| `LOG_LEVEL` | `info` | Verbosidad: `trace`, `debug`, `info`, `warn`, `error`, `fatal` |
| `LOG_DIR` | `.logs` | Carpeta de los archivos de log en desarrollo |
| `LOG_TO_FILES` | `true` | Escribe logs a disco (`.logs/app.log` y `.logs/app.jsonl`) |
| `LOG_TIMEZONE` | `Europe/Madrid` | Zona horaria para los timestamps legibles |
| `READ_ONLY` | `false` | `true` bloquea **toda** operación de escritura (ver [Modo READ_ONLY](#modo-read_only)) |
| `COOLIFY_REQUEST_TIMEOUT` | `30000` | Timeout por petición a la API de Coolify (ms) |
| `COOLIFY_MAX_RETRIES` | `3` | Reintentos ante errores transitorios (429, 5xx) |
| `VALIDATE_TOKEN_ON_STARTUP` | `true` | Valida el token contra `/version` al arrancar |

### Logs de contenedores vía SSH (configuración)

Estas variables activan y configuran la herramienta [`get_container_logs`](#guía-logs-de-contenedores-vía-ssh). Por defecto la funcionalidad está **desactivada**; si no la vas a usar, ignóralas.

| Variable | Default | Descripción |
|---|---|---|
| `SSH_ENABLED` | `false` | `true` activa `get_container_logs` |
| `SSH_HOST` | — | Host o IP del servidor Docker de Coolify. **Obligatoria si `SSH_ENABLED=true`** |
| `SSH_PORT` | `22` | Puerto SSH |
| `SSH_USER` | — | Usuario de login SSH. **Obligatoria si `SSH_ENABLED=true`** |
| `SSH_PRIVATE_KEY_PATH` | — | Ruta **absoluta** a la clave privada. **Obligatoria si `SSH_ENABLED=true`** |
| `SSH_STRICT_HOST_KEY_CHECKING` | `accept-new` | `yes` (estricto), `accept-new` (confía la primera vez), `no` (inseguro) |
| `SSH_KNOWN_HOSTS_PATH` | — | `known_hosts` alternativo (por defecto el del usuario) |
| `SSH_COMMAND_TIMEOUT_MS` | `20000` | Timeout por comando remoto (ms; rango 1000–120000) |

Si pones `SSH_ENABLED=true` pero falta alguna de las tres obligatorias, **el servidor no arranca** y te dice cuál falta.

---

## Integrar con Claude Code

El MCP se comunica con Claude Code por **stdio**: Claude Code lanza el proceso del servidor y habla con él por entrada/salida estándar. No tienes que levantar ningún servicio a mano.

La configuración vive en un archivo JSON. Puedes hacerlo **global** (todos tus proyectos) o **por proyecto**.

### Windows — configuración global

Archivo: `C:\Users\<tu-usuario>\.claude\mcp.json` (créalo si no existe).

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

> **En Windows, usa doble barra invertida (`\\`) en las rutas dentro del JSON.**

Para saber la ruta exacta del proyecto, ejecútalo desde la carpeta del repositorio:

```powershell
(Get-Item .).FullName
# → C:\Users\daniel\proyectos\mcp-coolify   (añádele  \dist\server\index.js)
```

### Linux / macOS — configuración global

Archivo: `~/.claude/mcp.json`

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

Ruta del proyecto: `cd mcp-coolify && pwd`.

### Configuración por proyecto

En lugar de la global, puedes crear un `.mcp.json` en la raíz del proyecto **en el que trabajas** (no en el de este MCP). Claude Code lo detecta automáticamente. El contenido es idéntico al de arriba.

### Añadir las variables de SSH

Si vas a usar `get_container_logs`, añade las variables `SSH_*` al bloque `env` **de este mismo JSON**, junto a `COOLIFY_*`:

```json
"env": {
  "COOLIFY_BASE_URL": "https://coolify.midominio.com/api/v1",
  "COOLIFY_TOKEN": "tr_xxxxxxxxxxxxxxxxxxxx",
  "SSH_ENABLED": "true",
  "SSH_HOST": "coolify.midominio.com",
  "SSH_USER": "deploy",
  "SSH_PRIVATE_KEY_PATH": "/home/usuario/.ssh/coolify_ed25519"
}
```

> El bloque `env` del cliente MCP y el archivo `.env` se combinan. `dotenv` **no** pisa una variable que ya exista en el entorno, así que puedes repartir la configuración entre ambos sitios sin conflictos.

### Cómo usarlo

Tras configurarlo, **reinicia Claude Code** (o recarga la configuración MCP). Las herramientas aparecen automáticamente. Háblale con normalidad:

```
¿Qué aplicaciones tengo en Coolify?

Reinicia la aplicación "mi-blog".

Muéstrame los últimos 200 logs de la aplicación "mi-api".

Enséñame los logs del contenedor de PostgreSQL del servicio "authentik".

Lanza un nuevo deployment de "api-produccion".
```

Claude elige la herramienta adecuada y la invoca. Para operaciones destructivas (borrar, detener, desplegar en producción…) pedirá tu confirmación explícita antes de ejecutar.

**Comprobar que funciona:** pídeselo directamente —

```
¿Está funcionando la conexión con Coolify?
```

---

## Herramientas disponibles

**92 herramientas** repartidas en 15 categorías funcionales (más la de confirmación). Consulta la [especificación técnica](specs/001-mcp-coolify/spec.md) para el contrato completo de cada una.

| Categoría | Nº | Herramientas |
|---|--:|---|
| **Default** | 5 | `get_status`, `get_info`, `get_config`, `validate_token`, `test_connection` |
| **Teams** | 4 | `get_current_team`, `list_all_teams`, `get_team_by_id`, `get_current_team_members` |
| **Projects** | 6 | `list_projects`, `get_project`, `create_project`, `update_project`, `delete_project`, `list_project_environments` |
| **Environments** | 4 | `list_environments`, `get_environment`, `create_environment`, `delete_environment` |
| **Applications** | 6 | `list_applications`, `get_application`, `get_application_logs`, `start_application`, `stop_application`, `restart_application` |
| **Deployments** | 4 | `list_deployments`, `get_deployment`, `trigger_deployment`, `cancel_deployment` |
| **Databases** | 21 | `list_databases`, `get_database`, `create_database_*` (postgres, mysql, mariadb, mongodb, redis, dragonfly, keydb, clickhouse), `update_database`, `delete_database`, `start`/`stop`/`restart_database`, backups (`list`, `create`, `update`, `delete`), ejecuciones de backup (`list`, `delete`) |
| **Services** | 9 | `list_services`, `get_service`, `create_service`, `update_service`, `delete_service`, `start`/`stop`/`restart_service`, `update_service_env` |
| **Servers** | 8 | `list_servers`, `get_server`, `create_server`, `update_server`, `delete_server`, `validate_server`, `get_server_resources`, `get_server_domains` |
| **Resources** | 1 | `get_resources` (vista unificada de apps + bases de datos + servicios) |
| **Containers** | 1 | `get_container_logs` — logs de runtime vía SSH; requiere `SSH_ENABLED=true` |
| **Private Keys** | 5 | `list_private_keys`, `get_private_key`, `create_private_key`, `update_private_key`, `delete_private_key` |
| **GitHub Apps** | 6 | `list_github_apps`, `create_github_app`, `update_github_app`, `delete_github_app`, `list_repositories`, `list_branches` |
| **Cloud Tokens** | 6 | `list_cloud_tokens`, `get_cloud_token`, `create_cloud_token`, `update_cloud_token`, `delete_cloud_token`, `validate_cloud_token` |
| **Hetzner** | 5 | `list_hetzner_locations`, `list_server_types`, `list_hetzner_images`, `list_ssh_keys`, `create_hetzner_server` |
| **Confirmación** | 1 | `confirm_operation` (se invoca en el flujo de confirmación; ver [Seguridad](#seguridad-y-confirmaciones)) |

> **Identificadores de recursos.** Coolify **no** usa UUID clásicos, sino cadenas cortas alfanuméricas (p. ej. `dw8ccwkso888ggwgwgww0wc4`). Todas las herramientas aceptan ese formato, además de UUID estándar y, para equipos, IDs numéricos cortos (`1`, `2`…). Pásalos tal cual los devuelve Coolify — los que ves en `list_applications`, `list_services` o en la URL del panel.

---

## Guía: logs de contenedores vía SSH

### El problema que resuelve

La API REST de Coolify v4 **solo** expone logs de runtime para **aplicaciones** (`get_application_logs` → `GET /applications/{uuid}/logs`) y logs de **build** (`get_deployment`). **No hay endpoint de logs para servicios ni para bases de datos.** Si un servicio como n8n, Authentik o Supabase se comporta mal, la API no te da forma de ver por qué.

`get_container_logs` cubre ese hueco: abre una conexión **SSH** contra el host Docker de Coolify y ejecuta `docker logs` sobre los contenedores del recurso. Con ello obtienes los logs de **cualquier** recurso —aplicación, servicio o base de datos— con control de nº de líneas, ventana temporal y timestamps.

### Modelo de seguridad

`get_container_logs` está diseñada para ser lo más acotada posible:

- **Solo lectura.** El comando remoto se limita a `docker ps`, `docker inspect` y `docker logs`. No modifica nada.
- **No la bloquea `READ_ONLY`.** Es de lectura por naturaleza; su interruptor propio es `SSH_ENABLED` (por defecto `false`, opt-in explícito).
- **Sin confirmación.** Al no ser destructiva, no entra en el flujo de `confirm_operation`.
- **Sin shell local.** El binario `ssh` se invoca con `execFile` y una lista de argumentos, nunca concatenando una cadena de shell → no hay inyección de comando en el lado local.
- **Entradas saneadas.** El UUID del recurso, el nombre de contenedor y el valor de `--since` se validan con esquemas estrictos, y **cada valor** que se interpola en el script `/bin/sh` remoto va entre comillas simples.
- **Credenciales solo por configuración.** El destino SSH sale **exclusivamente** de las variables `SSH_*`. No se deriva de la API de Coolify (que puede devolver una IP interna inservible como `host.docker.internal`). Modelo de **host único**.

### Cómo resuelve los contenedores de un recurso

Dado el UUID de un recurso Coolify, el script remoto localiza sus contenedores por **dos anclas independientes**:

1. La etiqueta `com.docker.compose.project`, que **es igual al UUID** del recurso (verificado para servicios y aplicaciones).
2. Una coincidencia por **nombre de contenedor**, que también incorpora el UUID.

Une ambos resultados, elimina duplicados y descarta los contenedores auxiliares `*-volume-backup`.

> No se usan las etiquetas `coolify.serviceId` / `coolify.applicationId` porque contienen el **id numérico interno** de Coolify (`"2"`, `"11"`…), no el UUID que devuelve la API.

### Puesta en marcha paso a paso

Supongamos que el MCP corre en tu máquina y Coolify está en `coolify.midominio.com`.

**1. Genera una clave SSH dedicada** (no reutilices una de uso general):

```bash
ssh-keygen -t ed25519 -f ~/.ssh/coolify_ed25519 -C "mcp-coolify container logs" -N ""
```

**2. Autoriza la clave pública en el host Docker**, para el usuario con el que vas a entrar (a menudo `root`, o un usuario con acceso al socket de Docker):

```bash
ssh-copy-id -i ~/.ssh/coolify_ed25519.pub deploy@coolify.midominio.com
# o, manualmente, añade el contenido de coolify_ed25519.pub a
#   ~/.ssh/authorized_keys  de ese usuario en el servidor
```

**3. Comprueba que el acceso no interactivo funciona y que el usuario puede usar Docker:**

```bash
ssh -i ~/.ssh/coolify_ed25519 -o BatchMode=yes deploy@coolify.midominio.com "docker ps --format '{{.Names}}' | head"
```

Si eso lista contenedores, ya está.

**4. Registra el host en `known_hosts`** (evita el prompt de "¿confías en esta huella?"):

```bash
ssh-keyscan -H coolify.midominio.com >> ~/.ssh/known_hosts
```

También puedes dejar `SSH_STRICT_HOST_KEY_CHECKING=accept-new`, que confía la primera vez y verifica a partir de entonces.

**5. Configura las variables** en `.env` o en el bloque `env` del cliente MCP:

```bash
SSH_ENABLED=true
SSH_HOST=coolify.midominio.com
SSH_PORT=22
SSH_USER=deploy
SSH_PRIVATE_KEY_PATH=/home/usuario/.ssh/coolify_ed25519
SSH_STRICT_HOST_KEY_CHECKING=accept-new
```

**6. Recompila y reinicia el cliente MCP** (`npm run build` + reiniciar Claude Code).

> **Requisito del lado del MCP:** que la máquina donde corre el servidor tenga el cliente **OpenSSH** (`ssh`) en el `PATH`. Windows 10+, Linux y macOS lo incluyen de serie.

### Parámetros de la herramienta

| Parámetro | Tipo | Por defecto | Descripción |
|---|---|---|---|
| `resource_type` | `"application"` \| `"service"` \| `"database"` | — | Tipo de recurso Coolify |
| `resource_uuid` | string | — | UUID del recurso (el de `list_services`, `list_applications`, …) |
| `container` | string | *(todos)* | Nombre exacto de un contenedor concreto. Útil en servicios multi-contenedor |
| `tail` | entero 1–10000 | `200` | Nº de líneas finales por contenedor |
| `since` | string | *(sin filtro)* | Ventana temporal: duración (`30s`, `15m`, `2h`, `1d`) o timestamp ISO 8601 |
| `timestamps` | booleano | `false` | Prefija cada línea con su timestamp RFC3339 |

**Respuesta:** el host consultado, la lista de contenedores resueltos y, por cada contenedor, su nombre, estado (`running`, `exited`…), el servicio compose al que pertenece, el nº de líneas y el texto de log (stdout + stderr combinados).

### Ejemplos en lenguaje natural

```
Enséñame los últimos logs del servicio n8n.

¿Qué está fallando en el contenedor postgresql del servicio authentik?
Dame las últimas 100 líneas.

Logs de la base de datos ClickHouse de los últimos 15 minutos, con timestamps.

Revisa los logs de todos los contenedores del servicio Supabase y dime si
hay errores.
```

### Resolución de problemas de SSH

| Síntoma | Causa probable | Solución |
|---|---|---|
| Error `SSH_DISABLED` | `SSH_ENABLED` no es `true`, o falta `SSH_HOST`/`SSH_USER`/`SSH_PRIVATE_KEY_PATH` | Revisa las variables y **reinicia el MCP** |
| El servidor no arranca y menciona `SSH_ENABLED` | Igual que arriba: activaste SSH pero falta una obligatoria | El mensaje dice cuál falta |
| `Could not execute 'ssh'` | No hay cliente OpenSSH en el `PATH` de la máquina del MCP | Instala OpenSSH client |
| `Permission denied (publickey)` | La clave pública no está en `authorized_keys` del host, o el `SSH_USER` no es el correcto | Repite el paso 2 |
| `Host key verification failed` | El host no está en `known_hosts` y el modo es `yes` | `ssh-keyscan` (paso 4) o usa `accept-new` |
| `No se encontraron contenedores para …` | UUID equivocado, o el recurso está parado y sin contenedores | Verifica el UUID con `list_services` / `list_databases`; arranca el recurso |
| Timeout | Host inaccesible o comando lento | Sube `SSH_COMMAND_TIMEOUT_MS`; comprueba conectividad |

Todos estos casos quedan registrados con los eventos `ssh.*` en `.logs/app.log`.

### Limitaciones

- **Un solo host.** El destino SSH es fijo (`SSH_HOST`). Si tienes varios servidores Docker en Coolify, esta versión solo consulta el configurado.
- **Sin *follow*.** Devuelve una instantánea de las últimas `tail` líneas; no hay streaming continuo (no encaja en el modelo petición/respuesta de MCP).
- **Bases de datos externas:** solo se cubren las que corren como contenedor en el host. Las bases de datos gestionadas fuera de Coolify no aplican.

---

## Qué puedes pedirle a Claude — ejemplos por herramienta

No necesitas recordar los nombres técnicos. Claude elige la herramienta según lo que le pidas. Aquí tienes una petición típica para cada una.

### Información general y diagnóstico

| Herramienta | Ejemplo de petición |
|---|---|
| `get_status` | "¿Cuál es el estado general de Coolify?" |
| `get_info` | "¿Qué versión de Coolify tengo instalada?" |
| `get_config` | "Muéstrame la configuración actual del MCP" |
| `validate_token` | "¿Mi token de API de Coolify es válido?" |
| `test_connection` | "Prueba la conexión con Coolify" |

### Equipos

| Herramienta | Ejemplo de petición |
|---|---|
| `get_current_team` | "¿A qué equipo pertenezco en Coolify?" |
| `list_all_teams` | "Muéstrame todos los equipos" |
| `get_team_by_id` | "Detalles del equipo con ID 3" |
| `get_current_team_members` | "¿Quién forma parte de mi equipo?" |

### Proyectos y entornos

| Herramienta | Ejemplo de petición |
|---|---|
| `list_projects` | "¿Qué proyectos tengo?" |
| `get_project` | "Detalles del proyecto 'backend'" |
| `create_project` | "Crea un proyecto llamado 'frontend'" |
| `update_project` | "Cambia la descripción del proyecto 'backend' a 'API de producción'" |
| `delete_project` | "Elimina el proyecto 'pruebas-temporales'" |
| `list_project_environments` | "¿Qué entornos tiene el proyecto 'backend'?" |
| `list_environments` | "Lista todos los entornos disponibles" |
| `get_environment` | "Muéstrame el entorno 'production' del proyecto 'backend'" |
| `create_environment` | "Crea un entorno 'staging' en el proyecto 'backend'" |
| `delete_environment` | "Elimina el entorno 'staging' del proyecto 'backend'" |

### Aplicaciones

| Herramienta | Ejemplo de petición |
|---|---|
| `list_applications` | "¿Qué aplicaciones tengo desplegadas?" |
| `get_application` | "Detalles de la aplicación 'mi-api'" |
| `get_application_logs` | "Últimos 200 logs de la aplicación 'mi-api'" |
| `start_application` | "Arranca la aplicación 'mi-api'" |
| `stop_application` | "Para la aplicación 'mi-api'" |
| `restart_application` | "Reinicia la aplicación 'mi-api'" |

### Deployments

| Herramienta | Ejemplo de petición |
|---|---|
| `list_deployments` | "¿Cuáles son los últimos deployments de 'mi-api'?" |
| `get_deployment` | "Detalle del deployment `dw8ccwkso888ggwgwgww0wc4`" |
| `trigger_deployment` | "Lanza un nuevo deployment de 'mi-api'" |
| `cancel_deployment` | "Cancela el deployment en curso de 'mi-api'" |

> `trigger_deployment` despliega la **rama configurada en la aplicación** dentro de Coolify (la API `/deploy` no admite rama ni commit arbitrarios). Acepta `application_uuid` y, opcionalmente, `force: true` para reconstruir sin caché de Docker.

### Bases de datos

| Herramienta | Ejemplo de petición |
|---|---|
| `list_databases` | "¿Qué bases de datos tengo?" |
| `get_database` | "Detalles de la base de datos 'mi-postgres'" |
| `create_database_postgres` | "Crea un PostgreSQL 'analytics' en el proyecto 'backend'" |
| `create_database_mysql` | "Crea un MySQL llamado 'tienda'" |
| `create_database_mariadb` | "Crea un MariaDB para el proyecto 'blog'" |
| `create_database_mongodb` | "Crea un MongoDB llamado 'eventos'" |
| `create_database_redis` | "Crea un Redis 'cache-api' en el proyecto 'backend'" |
| `create_database_dragonfly` | "Crea una base de datos Dragonfly para caché" |
| `create_database_keydb` | "Crea un KeyDB llamado 'sesiones'" |
| `create_database_clickhouse` | "Crea un ClickHouse para analytics en tiempo real" |
| `update_database` | "Renombra 'mi-postgres' a 'postgres-prod'" |
| `delete_database` | "Elimina la base de datos 'pruebas-db'" |
| `start_database` / `stop_database` / `restart_database` | "Reinicia la base de datos 'mi-postgres'" |
| `list_database_backups` | "¿Qué backups tiene 'mi-postgres'?" |
| `create_database_backup` | "Crea un backup de 'mi-postgres'" |
| `update_database_backup` | "Cambia el horario del backup de 'mi-postgres' a las 3:00" |
| `delete_database_backup` | "Elimina la configuración de backup de 'mi-postgres'" |
| `list_backup_executions` | "¿Cuándo se ejecutó el último backup de 'mi-postgres'?" |
| `delete_backup_execution` | "Elimina el registro de la ejecución de backup `abc123…`" |

### Servicios

| Herramienta | Ejemplo de petición |
|---|---|
| `list_services` | "¿Qué servicios tengo?" |
| `get_service` | "Detalles del servicio 'minio'" |
| `create_service` | "Crea un servicio Plausible Analytics en el proyecto 'analytics'" |
| `update_service` | "Cambia la descripción del servicio 'minio'" |
| `delete_service` | "Elimina el servicio 'minio-pruebas'" |
| `start_service` / `stop_service` / `restart_service` | "Reinicia el servicio 'minio'" |
| `update_service_env` | "En el servicio 'minio', pon `MINIO_ROOT_USER=admin`" |

> Para **ver los logs** de un servicio, usa [`get_container_logs`](#guía-logs-de-contenedores-vía-ssh): la API de Coolify no ofrece logs de servicios.

### Servidores y recursos

| Herramienta | Ejemplo de petición |
|---|---|
| `list_servers` | "¿Qué servidores tengo en Coolify?" |
| `get_server` | "Detalles del servidor 'produccion-1'" |
| `create_server` | "Añade un servidor con IP 203.0.113.10 y usuario root" |
| `update_server` | "Renombra el servidor 'produccion-1' a 'prod-eu-1'" |
| `delete_server` | "Elimina el servidor 'staging-server'" |
| `validate_server` | "¿El servidor 'produccion-1' es accesible desde Coolify?" |
| `get_server_resources` | "¿Cuánta CPU y memoria usa el servidor 'produccion-1'?" |
| `get_server_domains` | "¿Qué dominios tiene el servidor 'produccion-1'?" |
| `get_resources` | "Muéstrame todos los recursos del servidor 'produccion-1'" |

### Logs de contenedores (SSH)

Requiere `SSH_ENABLED=true`. Ver la [guía completa](#guía-logs-de-contenedores-vía-ssh).

| Herramienta | Ejemplo de petición |
|---|---|
| `get_container_logs` | "Enséñame los últimos logs del servicio n8n" |
| `get_container_logs` | "¿Qué peta en el contenedor postgresql del servicio authentik? Últimas 100 líneas" |
| `get_container_logs` | "Logs de la base de datos ClickHouse de los últimos 15 minutos con timestamps" |

### Claves privadas SSH (en Coolify)

| Herramienta | Ejemplo de petición |
|---|---|
| `list_private_keys` | "¿Qué claves SSH tengo guardadas en Coolify?" |
| `get_private_key` | "Detalles de la clave SSH 'deploy-key'" |
| `create_private_key` | "Añade una clave SSH llamada 'servidor-hetzner'" |
| `update_private_key` | "Renombra la clave SSH 'deploy-key' a 'github-deploy'" |
| `delete_private_key` | "Elimina la clave SSH 'clave-antigua'" |

### GitHub Apps

| Herramienta | Ejemplo de petición |
|---|---|
| `list_github_apps` | "¿Qué integraciones con GitHub tengo?" |
| `create_github_app` | "Crea una integración con GitHub para mi organización 'mi-org'" |
| `update_github_app` | "Actualiza la GitHub App 'mi-org'" |
| `delete_github_app` | "Elimina la integración 'mi-org-antigua'" |
| `list_repositories` | "¿A qué repos de GitHub tengo acceso desde Coolify?" |
| `list_branches` | "¿Qué ramas tiene el repositorio 'mi-org/mi-api'?" |

### Tokens de proveedor cloud

| Herramienta | Ejemplo de petición |
|---|---|
| `list_cloud_tokens` | "¿Qué tokens de proveedor cloud tengo guardados?" |
| `get_cloud_token` | "Detalles del token 'hetzner-prod'" |
| `create_cloud_token` | "Guarda un token de Hetzner Cloud llamado 'hetzner-prod'" |
| `update_cloud_token` | "Renombra el token 'hetzner-prod' a 'hetzner-eu'" |
| `delete_cloud_token` | "Elimina el token de cloud 'hetzner-antiguo'" |
| `validate_cloud_token` | "¿El token de Hetzner Cloud 'hetzner-prod' sigue siendo válido?" |

### Hetzner Cloud

| Herramienta | Ejemplo de petición |
|---|---|
| `list_hetzner_locations` | "¿En qué regiones puedo crear servidores en Hetzner?" |
| `list_server_types` | "¿Qué tipos de servidor ofrece Hetzner y a qué precio?" |
| `list_hetzner_images` | "¿Qué imágenes de SO hay disponibles en Hetzner?" |
| `list_ssh_keys` | "¿Qué claves SSH tengo en mi cuenta de Hetzner?" |
| `create_hetzner_server` | "Crea un CX21 en Fráncfort con Ubuntu 22.04 usando la clave 'hetzner-prod'" |

### Confirmación de operaciones críticas

| Herramienta | Cuándo aparece |
|---|---|
| `confirm_operation` | Automáticamente, cuando Claude necesita que confirmes una operación irreversible (borrar servidor, eliminar base de datos, desplegar en producción…). Claude te muestra el aviso y espera tu OK. |

---

## Integrar el MCP en tu flujo de trabajo de desarrollo

Este MCP brilla cuando tienes una aplicación en Coolify que se redespliega con cada push a GitHub. Claude se convierte en el puente entre tu código local y el despliegue remoto: consulta logs, comprueba el estado del deploy, detecta errores de producción mientras programas.

Esta sección explica **cómo dejarlo configurado** para que Claude lo haga de forma proactiva, sin pedírselo cada vez.

### 1. Qué poner en el `CLAUDE.md` de tu proyecto

Crea o edita el archivo `CLAUDE.md` en la raíz de tu proyecto (el que desarrollas, no el del MCP) y añade un bloque como este:

```markdown
## Despliegue remoto en Coolify

Este proyecto está desplegado en Coolify. Siempre que el usuario mencione
producción, el servidor remoto, errores en producción, el estado del deploy,
o cualquier cosa del entorno remoto, usa el MCP de Coolify para consultar
la información real antes de responder.

### Datos del despliegue
- **Aplicación**: nombre-de-tu-app
- **UUID**: xxxxxxxxxxxxxxxxxxxxxxxx
- **Entorno**: production
- **Proyecto Coolify**: nombre-del-proyecto
- **Rama de producción**: main

### Cuándo usar el MCP de Coolify de forma proactiva
- El usuario menciona un error o bug en producción
  → Consulta los logs con `get_application_logs` (o `get_container_logs`
    si es un servicio/base de datos) antes de responder.
- El usuario hace push o merge a main
  → Comprueba el estado del deployment con `list_deployments`.
- El usuario pregunta si algo "está funcionando" o "está caído"
  → Consulta `get_application` para ver el estado real.
- El usuario menciona "el servidor" o "el despliegue"
  → Usa `get_server_resources` o `get_deployment` para dar datos reales.

### Lo que NO necesita confirmación del usuario
Puedes consultar Coolify en silencio (sin preguntar) para LEER información:
logs, estado, deployments, recursos. Solo pregunta antes de EJECUTAR
acciones: reiniciar, detener, lanzar deploy.
```

Ajusta el UUID, el nombre de la aplicación y la rama con tus valores reales.

### 2. Cómo hablarle a Claude en el día a día

Con el `CLAUDE.md` en su sitio, Claude ya tiene el contexto. Frases típicas y lo que hace con ellas:

#### Durante el desarrollo

| Lo que escribes | Lo que hace Claude |
|---|---|
| *"Acabo de hacer push, ¿ha arrancado bien?"* | Consulta `list_deployments` para ver si el deploy se completó sin errores |
| *"¿El último deploy ha ido bien?"* | Busca el deployment más reciente y revisa su estado |
| *"¿Hay algún error en producción ahora mismo?"* | Lee los logs y te resume los errores |
| *"¿Por qué falla en producción si en local funciona?"* | Cruza el código local con los logs remotos para detectar la diferencia |

#### Cuando hay un incidente

| Lo que escribes | Lo que hace Claude |
|---|---|
| *"La app está caída, ¿qué ha pasado?"* | Consulta estado, logs y último deployment para diagnosticar |
| *"Los usuarios dicen que hay errores 500"* | Revisa los logs buscando errores HTTP 500 y su stack trace |
| *"¿Cuándo empezaron los errores?"* | Navega por los logs para localizar el momento exacto |
| *"El servicio de auth no responde"* | Usa `get_container_logs` sobre el servicio para ver qué contenedor falla |
| *"Necesito reiniciar la app urgente"* | Ejecuta `restart_application` (pedirá confirmación antes) |

#### Tras un cambio importante

| Lo que escribes | Lo que hace Claude |
|---|---|
| *"He cambiado la conexión a la base de datos, ¿funciona en prod?"* | Lee los logs tras el deploy buscando errores de conexión |
| *"¿El deploy de la rama 'fix/auth' está activo ya?"* | Comprueba qué deployment está corriendo |
| *"¿Cuánto tarda en desplegarse esta app?"* | Consulta los deployments recientes y mide los tiempos |

### 3. Ejemplo de sesión real

```
Tú:     Acabo de hacer merge de la PR #42 a main. ¿Ha arrancado bien?

Claude: Voy a comprobarlo en Coolify...
        El deployment se disparó hace 3 minutos. Estado: completado ✓
        La aplicación está corriendo. Últimas líneas de log:
          [INFO] Server listening on port 3000
          [INFO] Database connection established
        Todo correcto.

Tú:     Perfecto. Oye, hay usuarios que dicen que el login falla.

Claude: Revisando los logs en busca de errores de autenticación...
        En los últimos 10 minutos:
          [ERROR] JWT verification failed: invalid signature (x23)
        El secreto JWT en producción no coincide con el del código
        desplegado. ¿Cambiaste JWT_SECRET recientemente?

Tú:     Sí, lo cambié en .env pero no en Coolify.

Claude: Ahí está. Hay que actualizar la variable de entorno en Coolify.
        ¿Quiero que lo haga? (Necesitaré que confirmes antes de tocar
        nada en producción.)
```

---

## Seguridad y confirmaciones

Determinadas operaciones son destructivas o tienen coste económico. El MCP las bloquea por defecto y exige una **confirmación explícita en dos pasos** antes de ejecutarlas.

### Operaciones que requieren confirmación

**Eliminaciones irreversibles**
`delete_project`, `delete_application`, `delete_environment`, `delete_database`, `delete_service`, `delete_server`, `delete_private_key`, `delete_github_app`, `delete_cloud_token`, `delete_database_backup`, `delete_backup_execution`

**Acciones de parada**
`cancel_deployment`, `stop_application`, `stop_database`, `stop_service`

**Producción / coste**
`trigger_deployment` (en ramas main/production), `create_hetzner_server`

**Gestión de secretos**
`create_private_key`, `create_cloud_token`, `create_github_app`

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
3. Claude te muestra el motivo y espera tu OK
   ↓
4. Confirmas ("sí, adelante" o similar)
   ↓
5. Claude invoca confirm_operation con el token
   ↓
6. La operación se ejecuta
```

Los tokens de confirmación **expiran a los 5 minutos**. Si no confirmas a tiempo, el proceso vuelve a empezar.

---

## Modo READ_ONLY

Para explorar tu infraestructura sin riesgo de modificar nada:

```bash
# En .env:
READ_ONLY=true

# O al lanzar:
READ_ONLY=true npm run dev
```

En este modo:

- Todas las consultas de lectura (GET) funcionan con normalidad, **incluida `get_container_logs`** (que es de lectura).
- Las operaciones de escritura (POST, PATCH, DELETE) devuelven **error 403**.
- Cada intento bloqueado se registra como evento `read_only.blocked_operation`.

---

## Logging y diagnóstico

En desarrollo, el servidor escribe logs en dos formatos dentro de `.logs/`:

**`.logs/app.log`** — legible para humanos:

```
12/05/2026 10:40:50  [INFO]  mcp.tool.completed
  requestId: "550e8400-e29b-41d4-a716-446655440000"
  tool: "list_applications"
  durationMs: 543
```

**`.logs/app.jsonl`** — JSON Lines, una línea por evento (ideal para `grep`/`jq`):

```json
{"timestamp":"2026-05-12T10:40:50.000Z","level":"info","eventName":"mcp.tool.completed","context":{"tool":"list_applications","durationMs":543}}
```

Ambos archivos se **truncan en cada reinicio** y están en `.gitignore`.

### Ver logs en tiempo real

```powershell
# PowerShell (Windows)
Get-Content .logs\app.log -Wait
```
```bash
# bash (Linux / macOS / Git Bash)
tail -f .logs/app.log
```

### Aumentar la verbosidad

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
| `ssh.command.started` / `ssh.command.completed` | `get_container_logs`: comando remoto vía SSH |
| `ssh.command.failed` / `ssh.disabled` | `get_container_logs`: fallo remoto o SSH sin habilitar |
| `operation.confirmation.requested` | Esperando confirmación del usuario |
| `operation.confirmed` | Operación confirmada y ejecutada |

Los tokens, contraseñas y API keys se redactan automáticamente como `[REDACTED]` en todos los logs. El catálogo completo está en [`logging-events.md`](logging-events.md).

---

## Desarrollo

### Comandos útiles

```bash
npm run dev            # servidor en modo desarrollo (recarga en caliente)
npm run build          # compila TypeScript a dist/  (type-check + emit)
npm test               # ejecuta la suite (Vitest) — 146 tests
npm run test:coverage  # con informe de cobertura
npm run lint           # ESLint (0 warnings permitidos)
npm run type-check     # tsc --noEmit
npm run precommit      # lint + type-check + test  (lo que valida un PR)
```

### Estructura del proyecto

```
src/
├── lib/
│   ├── confirmation/     # Flujo de confirmación de operaciones críticas
│   ├── errors/           # Tipos de error y formateo de respuestas
│   ├── logging/          # Sistema de logging (tipos, sanitización, eventos estables)
│   ├── safety/           # Guardia READ_ONLY
│   ├── schemas/          # Schemas Zod compartidos
│   ├── ssh/              # Runner SSH que da soporte a get_container_logs
│   ├── tools/            # Base tool, registro y tipos
│   ├── http-client.ts    # Cliente HTTP para la API de Coolify (retry, timeout)
│   └── config.ts         # Configuración centralizada (validada con Zod)
│
├── server/
│   └── index.ts          # Entry point del servidor MCP (bootstrap)
│
└── tools/                # 15 categorías de herramientas, una carpeta cada una
    ├── default/  applications/  deployments/  databases/  services/
    ├── servers/  resources/  containers/  environments/  projects/  teams/
    └── private-keys/  github-apps/  cloud-tokens/  hetzner/  confirmation/

.logs/                    # Logs de desarrollo (gitignored)
specs/001-mcp-coolify/    # Especificación técnica completa
```

---

## Resolución de problemas

### El servidor no arranca

```powershell
Get-Content .env                       # 1. ¿están COOLIFY_BASE_URL y COOLIFY_TOKEN?
Get-ChildItem dist\server\index.js     # 2. ¿existe el build?
npm run build                          # 3. si no, compila
Get-Content .logs\app.log              # 4. mira los logs
```

| Mensaje en logs | Causa | Solución |
|---|---|---|
| `app.bootstrap.failed` + token | Token inválido o caducado | Genera uno nuevo en Coolify |
| `app.bootstrap.failed` + URL | URL incorrecta | Debe terminar en `/api/v1` |
| `SSH_ENABLED=true requires: …` | Activaste SSH sin las obligatorias | Define `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY_PATH` |
| `ENOENT dist/server/index.js` | No has compilado | `npm run build` |
| `Cannot find module` | Dependencias sin instalar | `npm install` |

### Claude Code no detecta el MCP

1. El archivo de configuración está en la ruta correcta (`~/.claude/mcp.json` en Linux/Mac; `C:\Users\<usuario>\.claude\mcp.json` en Windows).
2. El JSON es válido (sin comas de más).
3. En Windows, las rutas de `args` usan `\\`.
4. **Reinicia Claude Code** tras editar la configuración.
5. Prueba el servidor a mano: `node <ruta>/dist/server/index.js`. Si arranca y se queda esperando, es correcto (espera stdio).

### Una herramienta falla

```bash
LOG_LEVEL=debug npm run dev
```

El error del MCP incluye el código real (`FORBIDDEN`, `NOT_FOUND`, `SSH_COMMAND_FAILED`…), el mensaje de Coolify y su cuerpo de respuesta en `details` — ya no se colapsa todo en `UNKNOWN_ERROR`. Un `FORBIDDEN` (403) suele significar que el token de API no tiene permisos de escritura; el token se lee al arrancar, así que **reinicia el MCP tras cambiarlo**.

Para seguir una operación concreta, busca su `requestId` y filtra por él:

```powershell
Select-String "req-abc123" .logs\app.log   # PowerShell
```
```bash
grep "req-abc123" .logs/app.log            # bash
```

### Una herramienta rechaza el ID ("Invalid Coolify resource ID")

Las herramientas aceptan IDs nativos de Coolify (cadenas alfanuméricas cortas como `dw8ccwkso888ggwgwgww0wc4`), UUID estándar y, para equipos, IDs numéricos. Si te rechaza uno:

- Comprueba que lo copiaste completo y sin espacios, tal cual lo devuelve Coolify (`list_applications`, `list_services`, o la URL del panel).
- El evento `mcp.tool.parameters_invalid` en los logs dice qué campo falló y por qué.

### Problemas con `get_container_logs`

Ver la tabla dedicada en la [guía de SSH](#resolución-de-problemas-de-ssh).

---

## Documentación adicional

- [Especificación técnica](specs/001-mcp-coolify/spec.md) — arquitectura, protocolo MCP, esquemas
- [Catálogo de eventos de logging](logging-events.md) — todos los eventos estables
- [Guía de inicio rápido](specs/001-mcp-coolify/quickstart.md) — primera puesta en marcha y pruebas
- [Plan de implementación](specs/001-mcp-coolify/plan.md) — decisiones de arquitectura

---

## Contribuir

1. Haz fork del repositorio.
2. Crea una rama: `git checkout -b feature/mi-mejora`.
3. Haz tus cambios.
4. Verifica que todo pasa: `npm run precommit`.
5. Haz commit y abre un Pull Request.

**Para que se acepte un PR:**

- Todos los tests pasan (`npm test`).
- Sin errores de linting (`npm run lint`) ni de tipos (`npm run type-check`).
- Tests nuevos para funcionalidad nueva.
- Documentación actualizada si cambia el comportamiento observable (incluye este README y `specs/`).

---

## Licencia

MIT — ver [LICENSE](LICENSE).

---

*v1.0.0-rc.1*
