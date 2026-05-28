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
- [Ejemplos por herramienta](#-qué-puedes-pedirle-a-claude--ejemplos-por-herramienta)
- [Integrar en tu flujo de trabajo](#-integrar-el-mcp-en-tu-flujo-de-trabajo-de-desarrollo)
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

> **Identificadores de recursos**: las herramientas aceptan los IDs nativos de Coolify, que **no** son UUID clásicos sino cadenas cortas alfanuméricas (p. ej. `dw8ccwkso888ggwgwgww0wc4`). También se aceptan UUID estándar y, para equipos (`get_team_by_id`), IDs numéricos cortos (p. ej. `1`). Pásalos tal cual los devuelve Coolify — los que ves en `list_applications`, `list_deployments` o en la URL del panel.

---

## Qué puedes pedirle a Claude — ejemplos por herramienta

No necesitas recordar los nombres técnicos de las herramientas. Claude elige la correcta según lo que le pidas en lenguaje natural. Estos son ejemplos concretos para cada una de las 92 herramientas disponibles.

### Información general y diagnóstico

| Herramienta | Ejemplo de petición |
|---|---|
| `get_status` | "¿Cuál es el estado general de Coolify?" |
| `get_info` | "¿Qué versión de Coolify tengo instalada?" |
| `get_config` | "Muéstrame la configuración actual de Coolify" |
| `validate_token` | "¿Mi token de API de Coolify es válido?" |
| `test_connection` | "Prueba la conexión con Coolify" |

### Equipos

| Herramienta | Ejemplo de petición |
|---|---|
| `get_current_team` | "¿A qué equipo pertenezco en Coolify?" |
| `list_all_teams` | "¿Cuántos equipos hay en Coolify? Muéstramelos todos" |
| `get_team_by_id` | "Muéstrame los detalles del equipo con ID 3" |
| `get_current_team_members` | "¿Quién forma parte de mi equipo?" |

### Proyectos

| Herramienta | Ejemplo de petición |
|---|---|
| `list_projects` | "¿Qué proyectos tengo en Coolify?" |
| `get_project` | "Muéstrame los detalles del proyecto 'backend'" |
| `create_project` | "Crea un nuevo proyecto llamado 'frontend'" |
| `update_project` | "Cambia la descripción del proyecto 'backend' a 'API de producción'" |
| `delete_project` | "Elimina el proyecto 'pruebas-temporales'" |
| `list_project_environments` | "¿Qué entornos tiene el proyecto 'backend'?" |

### Entornos

| Herramienta | Ejemplo de petición |
|---|---|
| `list_environments` | "Lista todos los entornos disponibles" |
| `get_environment` | "Muéstrame el entorno 'production' del proyecto 'backend'" |
| `create_environment` | "Crea un entorno llamado 'staging' en el proyecto 'backend'" |
| `delete_environment` | "Elimina el entorno 'staging' del proyecto 'backend'" |

### Aplicaciones

| Herramienta | Ejemplo de petición |
|---|---|
| `list_applications` | "¿Qué aplicaciones tengo desplegadas?" |
| `get_application` | "Muéstrame los detalles de la aplicación 'mi-api'" |
| `get_application_logs` | "Muéstrame los últimos 200 logs de la aplicación 'mi-api'" |
| `start_application` | "Arranca la aplicación 'mi-api'" |
| `stop_application` | "Para la aplicación 'mi-api'" |
| `restart_application` | "Reinicia la aplicación 'mi-api'" |

### Deployments

| Herramienta | Ejemplo de petición |
|---|---|
| `list_deployments` | "¿Cuáles son los últimos deployments de la aplicación 'mi-api'?" |
| `get_deployment` | "Muéstrame el detalle del deployment abc-123" |
| `trigger_deployment` | "Lanza un nuevo deployment de la aplicación 'mi-api'" |
| `cancel_deployment` | "Cancela el deployment en curso de 'mi-api'" |

> `trigger_deployment` despliega la **rama configurada en la aplicación** dentro de Coolify (la API `/deploy` no admite una rama o commit arbitrarios). Acepta `application_uuid` y, opcionalmente, `force: true` para reconstruir sin usar la caché de Docker.

### Bases de datos

| Herramienta | Ejemplo de petición |
|---|---|
| `list_databases` | "¿Qué bases de datos tengo en Coolify?" |
| `get_database` | "Muéstrame los detalles de la base de datos 'mi-postgres'" |
| `create_database_postgres` | "Crea una base de datos PostgreSQL llamada 'analytics' en el proyecto 'backend'" |
| `create_database_mysql` | "Crea una base de datos MySQL llamada 'tienda'" |
| `create_database_mariadb` | "Crea una base de datos MariaDB para el proyecto 'blog'" |
| `create_database_mongodb` | "Crea una base de datos MongoDB llamada 'eventos'" |
| `create_database_redis` | "Crea un Redis llamado 'cache-api' en el proyecto 'backend'" |
| `create_database_dragonfly` | "Crea una base de datos Dragonfly para caché" |
| `create_database_keydb` | "Crea una base de datos KeyDB llamada 'sesiones'" |
| `create_database_clickhouse` | "Crea una base de datos ClickHouse para analytics en tiempo real" |
| `update_database` | "Cambia el nombre de la base de datos 'mi-postgres' a 'postgres-prod'" |
| `delete_database` | "Elimina la base de datos 'pruebas-db'" |
| `start_database` | "Arranca la base de datos 'mi-postgres'" |
| `stop_database` | "Para la base de datos 'mi-postgres'" |
| `restart_database` | "Reinicia la base de datos 'mi-postgres'" |
| `list_database_backups` | "¿Qué backups tiene configurados la base de datos 'mi-postgres'?" |
| `create_database_backup` | "Crea un backup de la base de datos 'mi-postgres'" |
| `update_database_backup` | "Cambia el horario del backup de 'mi-postgres' a las 3 de la madrugada" |
| `delete_database_backup` | "Elimina la configuración de backup de 'mi-postgres'" |
| `list_backup_executions` | "¿Cuándo se ejecutó el último backup de 'mi-postgres'?" |
| `delete_backup_execution` | "Elimina el registro de la ejecución de backup abc-123" |

### Servicios

| Herramienta | Ejemplo de petición |
|---|---|
| `list_services` | "¿Qué servicios tengo en Coolify?" |
| `get_service` | "Muéstrame los detalles del servicio 'minio'" |
| `create_service` | "Crea un nuevo servicio Plausible Analytics en el proyecto 'analytics'" |
| `update_service` | "Cambia la descripción del servicio 'minio' a 'Almacenamiento de objetos'" |
| `delete_service` | "Elimina el servicio 'minio-pruebas'" |
| `start_service` | "Arranca el servicio 'minio'" |
| `stop_service` | "Para el servicio 'minio'" |
| `restart_service` | "Reinicia el servicio 'minio'" |
| `update_service_env` | "Cambia las variables de entorno del servicio 'minio': pon MINIO_ROOT_USER=admin" |

### Servidores

| Herramienta | Ejemplo de petición |
|---|---|
| `list_servers` | "¿Qué servidores tengo en Coolify?" |
| `get_server` | "Muéstrame los detalles del servidor 'produccion-1'" |
| `create_server` | "Añade un nuevo servidor con IP 192.168.1.10 y usuario root" |
| `update_server` | "Cambia el nombre del servidor 'produccion-1' a 'prod-eu-1'" |
| `delete_server` | "Elimina el servidor 'staging-server'" |
| `validate_server` | "¿El servidor 'produccion-1' es accesible desde Coolify?" |
| `get_server_resources` | "¿Cuánta CPU y memoria está usando el servidor 'produccion-1'?" |
| `get_server_domains` | "¿Qué dominios tiene configurados el servidor 'produccion-1'?" |

### Recursos del servidor

| Herramienta | Ejemplo de petición |
|---|---|
| `get_resources` | "Muéstrame todos los recursos (apps, bases de datos, servicios) del servidor 'produccion-1'" |

### Claves privadas SSH

| Herramienta | Ejemplo de petición |
|---|---|
| `list_private_keys` | "¿Qué claves SSH tengo guardadas en Coolify?" |
| `get_private_key` | "Muéstrame los detalles de la clave SSH 'deploy-key'" |
| `create_private_key` | "Añade una nueva clave SSH llamada 'servidor-hetzner'" |
| `update_private_key` | "Renombra la clave SSH 'deploy-key' a 'github-deploy'" |
| `delete_private_key` | "Elimina la clave SSH 'clave-antigua'" |

### GitHub Apps

| Herramienta | Ejemplo de petición |
|---|---|
| `list_github_apps` | "¿Qué integraciones con GitHub tengo configuradas en Coolify?" |
| `create_github_app` | "Crea una nueva integración con GitHub para mi organización 'mi-org'" |
| `update_github_app` | "Actualiza la configuración de la GitHub App 'mi-org'" |
| `delete_github_app` | "Elimina la integración con GitHub 'mi-org-antigua'" |
| `list_repositories` | "¿A qué repositorios de GitHub tengo acceso desde Coolify?" |
| `list_branches` | "¿Qué ramas tiene el repositorio 'mi-org/mi-api'?" |

### Tokens de proveedor cloud

| Herramienta | Ejemplo de petición |
|---|---|
| `list_cloud_tokens` | "¿Qué tokens de proveedor cloud tengo guardados en Coolify?" |
| `get_cloud_token` | "Muéstrame los detalles del token 'hetzner-prod'" |
| `create_cloud_token` | "Guarda un nuevo token de Hetzner Cloud llamado 'hetzner-prod'" |
| `update_cloud_token` | "Actualiza el nombre del token de Hetzner Cloud 'hetzner-prod' a 'hetzner-eu'" |
| `delete_cloud_token` | "Elimina el token de cloud 'hetzner-antiguo'" |
| `validate_cloud_token` | "¿El token de Hetzner Cloud 'hetzner-prod' sigue siendo válido?" |

### Hetzner Cloud

| Herramienta | Ejemplo de petición |
|---|---|
| `list_hetzner_locations` | "¿En qué regiones puedo crear servidores en Hetzner?" |
| `list_server_types` | "¿Qué tipos de servidor ofrece Hetzner y cuánto cuestan?" |
| `list_hetzner_images` | "¿Qué imágenes de sistema operativo hay disponibles en Hetzner?" |
| `list_ssh_keys` | "¿Qué claves SSH tengo registradas en mi cuenta de Hetzner?" |
| `create_hetzner_server` | "Crea un servidor CX21 en Fráncfort con Ubuntu 22.04 usando la clave 'hetzner-prod'" |

### Confirmación de operaciones críticas

| Herramienta | Cuándo aparece |
|---|---|
| `confirm_operation` | Se invoca automáticamente cuando Claude necesita que confirmes una operación irreversible (eliminar servidor, borrar base de datos, lanzar deployment en producción, etc.). Claude te mostrará el aviso y esperará tu OK antes de proceder. |

---

## Integrar el MCP en tu flujo de trabajo de desarrollo

Este MCP es especialmente útil cuando tienes una aplicación en Coolify que se redespliega automáticamente con cada push a GitHub. Claude puede actuar como puente entre tu código local y el despliegue remoto — consultando logs, comprobando el estado del deploy, o detectando errores en producción mientras programas.

Esta sección explica **cómo configurarlo** para que Claude lo haga de forma proactiva, sin que tengas que pedírselo cada vez.

---

### 1. Qué poner en el CLAUDE.md de tu proyecto

Crea o edita el archivo `CLAUDE.md` en la raíz de tu proyecto (el que estás desarrollando, no el del MCP) y añade un bloque como este:

```markdown
## Despliegue remoto en Coolify

Este proyecto está desplegado en Coolify. Siempre que el usuario mencione
producción, el servidor remoto, errores en producción, el estado del deploy,
o cualquier cosa relacionada con el entorno remoto, usa el MCP de Coolify
para consultar la información real antes de responder.

### Datos del despliegue
- **Aplicación**: nombre-de-tu-app
- **UUID**: xxxxxxxxxxxxxxxxxxxxxxxx
- **Entorno**: production
- **Proyecto Coolify**: nombre-del-proyecto
- **Rama de producción**: main

### Cuándo usar el MCP de Coolify de forma proactiva

- El usuario menciona un error o bug en producción
  → Consulta los logs con `get_application_logs` antes de responder
- El usuario hace un push o merge a main
  → Comprueba el estado del deployment con `list_deployments`
- El usuario pregunta si algo "está funcionando" o "está caído"
  → Consulta `get_application` para ver el estado real
- El usuario menciona "el servidor" o "el despliegue"
  → Usa `get_server_resources` o `get_deployment` para dar datos reales
- Hay un error nuevo en el código que podría haberse manifestado en producción
  → Revisa los logs recientes con `get_application_logs`

### Lo que NO necesita confirmación del usuario
Puedes consultar Coolify en silencio (sin preguntar) cuando sea para
leer información: logs, estado, deployments, recursos. Solo pregunta
antes de ejecutar acciones: reiniciar, detener, lanzar deploy.
```

Ajusta el UUID, el nombre de la aplicación y la rama de producción con los valores reales de tu despliegue.

---

### 2. Cómo hablarle a Claude en el prompt del día a día

Una vez configurado el `CLAUDE.md`, Claude entiende el contexto. Aquí tienes frases típicas del flujo de trabajo real y lo que Claude hará con ellas:

#### Durante el desarrollo

| Lo que escribes | Lo que hace Claude |
|---|---|
| *"Acabo de hacer push, ¿ha arrancado bien?"* | Consulta `list_deployments` para ver si el deploy se completó sin errores |
| *"¿El último deploy ha ido bien?"* | Busca el deployment más reciente y revisa su estado |
| *"¿Hay algún error en producción ahora mismo?"* | Lee los logs con `get_application_logs` y te resume los errores |
| *"¿Por qué falla en producción si en local funciona?"* | Cruza el código local con los logs remotos para detectar la diferencia |
| *"¿Qué está haciendo la app ahora mismo?"* | Consulta estado de la aplicación y los logs más recientes |

#### Cuando hay un incidente

| Lo que escribes | Lo que hace Claude |
|---|---|
| *"La app está caída, ¿qué ha pasado?"* | Consulta estado, logs y último deployment para diagnosticar |
| *"Los usuarios dicen que hay errores 500"* | Revisa los logs buscando errores HTTP 500 y su stack trace |
| *"¿Cuándo empezaron los errores?"* | Navega por los logs para localizar el momento exacto |
| *"¿El servidor está bien de recursos?"* | Consulta `get_server_resources` para ver CPU y memoria |
| *"Necesito reiniciar la app urgente"* | Ejecuta `restart_application` (pedirá confirmación antes) |

#### Tras un cambio importante

| Lo que escribes | Lo que hace Claude |
|---|---|
| *"He cambiado la conexión a la base de datos, ¿funciona en prod?"* | Lee los logs tras el deploy buscando errores de conexión |
| *"¿El deploy de la rama 'fix/auth' está activo ya?"* | Comprueba qué deployment está corriendo actualmente |
| *"Compara cómo estaba ayer con cómo está ahora"* | Revisa el historial de deployments y los logs de cada uno |
| *"¿Cuánto tarda en desplegarse esta app?"* | Consulta los deployments recientes y mide los tiempos |

---

### 3. Ejemplo de sesión de trabajo real

Así se ve una conversación típica con el MCP integrado:

```
Tú:     Acabo de hacer merge de la PR #42 a main. ¿Ha arrancado bien?

Claude: Voy a comprobarlo en Coolify...
        El deployment se disparó hace 3 minutos. Estado: completado ✓
        La aplicación está corriendo. Últimas líneas de log:
          [INFO] Server listening on port 3000
          [INFO] Database connection established
        Todo parece correcto.

Tú:     Perfecto. Oye, hay usuarios que dicen que el login falla.

Claude: Revisando los logs en busca de errores de autenticación...
        Encontré esto en los últimos 10 minutos:
          [ERROR] JWT verification failed: invalid signature (x23 veces)
        Parece que el secreto JWT en producción no coincide con el del
        código desplegado. ¿Cambiaste JWT_SECRET recientemente?

Tú:     Sí, lo cambié en .env pero no en Coolify.

Claude: Ahí está el problema. Para solucionarlo necesitas actualizar
        la variable de entorno en Coolify. ¿Quieres que lo haga yo?
        (Necesitaré que confirmes antes de modificar nada en producción.)
```

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

El error que devuelve el MCP incluye el código real (`FORBIDDEN`, `NOT_FOUND`, etc.), el mensaje de Coolify y su cuerpo de respuesta en `details` — ya no se colapsa todo en `UNKNOWN_ERROR`. Un `FORBIDDEN` (403) suele indicar que el token de API no tiene permisos de escritura; recuerda que el token se lee al arrancar, así que **reinicia el MCP tras cambiarlo**.

Luego busca el `requestId` de la operación que falló y filtra por él:

```powershell
# PowerShell
Select-String "req-abc123" .logs\app.log

# bash
grep "req-abc123" .logs/app.log
```

### Una herramienta rechaza el ID ("Invalid Coolify resource ID" o validación de parámetros)

Las herramientas aceptan los IDs nativos de Coolify (cadenas cortas alfanuméricas como `dw8ccwkso888ggwgwgww0wc4`), UUID estándar y, para equipos, IDs numéricos cortos. Si una herramienta rechaza un ID:

- Comprueba que copiaste el identificador completo y sin espacios, tal cual lo devuelve Coolify (`list_applications`, `list_deployments`, o la URL del panel).
- El evento `mcp.tool.parameters_invalid` en los logs indica qué campo falló y por qué.

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
