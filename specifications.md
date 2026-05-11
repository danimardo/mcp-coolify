# Especificaciones de Tools - MCP Coolify

Este documento detalla todos los tools (operaciones) que el MCP Coolify expone, organizados por categoría. Cada tool corresponde a uno o más endpoints de la API de Coolify.

**Formato:**
- **Descripción**: Qué hace el tool
- **Endpoint**: Endpoint de Coolify API que usa
- **Parámetros**: Entrada requerida/opcional
- **Respuesta**: Estructura esperada
- **Errores**: Códigos HTTP y significados
- **READ_ONLY**: ✓ Permitido / ✗ Bloqueado
- **Ejemplo**: Caso de uso

---

## 1. CATEGORÍA: Default (Utilidades)

### 1.1 get_version
**Descripción:** Obtiene la versión de Coolify instalada.

**Endpoint:** `GET /version`

**Parámetros:** Ninguno

**Respuesta esperada:**
```json
{
  "version": "4.0.0"
}
```

**Errores posibles:**
- `401 Unauthorized`: Token ausente o inválido
- `400 Bad Request`: Petición malformada

**READ_ONLY:** ✓ Permitido

**Ejemplo:**
```
Tool: get_version
Respuesta: Coolify v4.0.0 está disponible
```

---

### 1.2 get_health
**Descripción:** Verifica si la API de Coolify está viva y respondiendo.

**Endpoint:** `GET /health`

**Parámetros:** Ninguno

**Respuesta esperada:**
```json
{
  "status": "ok"
}
```

**Errores posibles:**
- `500 Internal Server Error`: Coolify no está disponible
- `503 Service Unavailable`: Coolify está en mantenimiento

**READ_ONLY:** ✓ Permitido

**Ejemplo:**
```
Tool: get_health
Respuesta: {"status": "ok"} → API está disponible
```

---

### 1.3 enable_api
**Descripción:** Habilita la API de Coolify (requiere permisos administrativos).

**Endpoint:** `GET /enable-api`

**Parámetros:** Ninguno

**Respuesta esperada:**
```json
{
  "message": "API enabled"
}
```

**Errores posibles:**
- `401 Unauthorized`: Token sin permisos
- `400 Bad Request`: API ya está habilitada

**READ_ONLY:** ✗ Bloqueado

**Ejemplo:**
```
Tool: enable_api
Requiere confirmación: Sí
```

---

### 1.4 disable_api
**Descripción:** Deshabilita la API de Coolify (requiere permisos administrativos).

**Endpoint:** `GET /disable-api`

**Parámetros:** Ninguno

**Respuesta esperada:**
```json
{
  "message": "API disabled"
}
```

**Errores posibles:**
- `401 Unauthorized`: Token sin permisos
- `400 Bad Request`: API ya está deshabilitada

**READ_ONLY:** ✗ Bloqueado

**Ejemplo:**
```
Tool: disable_api
Requiere confirmación: Sí (operación crítica)
```

---

## 2. CATEGORÍA: Teams (Equipos)

### 2.1 get_current_team
**Descripción:** Obtiene el equipo al que pertenece el token API autenticado.

**Endpoint:** `GET /teams/current`

**Parámetros:** Ninguno

**Respuesta esperada:**
```json
{
  "id": "team-uuid",
  "name": "Mi Equipo",
  "description": "Equipo principal"
}
```

**Errores posibles:**
- `401 Unauthorized`: Token inválido
- `404 Not Found`: Equipo no encontrado

**READ_ONLY:** ✓ Permitido

**Ejemplo:**
```
Tool: get_current_team
Respuesta: El token pertenece al equipo "Mi Equipo"
```

---

### 2.2 get_current_team_members
**Descripción:** Lista todos los miembros del equipo autenticado.

**Endpoint:** `GET /teams/current/members`

**Parámetros:** Ninguno

**Respuesta esperada:**
```json
[
  {
    "id": "member-uuid",
    "name": "Juan",
    "email": "juan@example.com",
    "role": "admin"
  }
]
```

**Errores posibles:**
- `401 Unauthorized`: Token inválido

**READ_ONLY:** ✓ Permitido

**Ejemplo:**
```
Tool: get_current_team_members
Respuesta: 3 miembros en el equipo
```

---

### 2.3 get_team_by_id
**Descripción:** Obtiene detalles de un equipo específico por ID.

**Endpoint:** `GET /teams/{id}`

**Parámetros:**
- `id` (string, requerido): UUID del equipo

**Respuesta esperada:**
```json
{
  "id": "team-uuid",
  "name": "Mi Equipo",
  "description": "Descripción del equipo"
}
```

**Errores posibles:**
- `401 Unauthorized`: Token sin acceso
- `404 Not Found`: Equipo no existe

**READ_ONLY:** ✓ Permitido

**Ejemplo:**
```
Tool: get_team_by_id
Parámetros: id="abc-123"
Respuesta: Detalles del equipo
```

---

### 2.4 list_all_teams
**Descripción:** Lista todos los equipos visibles para el token.

**Endpoint:** `GET /teams`

**Parámetros:** Ninguno

**Respuesta esperada:**
```json
[
  {
    "id": "team-uuid-1",
    "name": "Equipo A"
  },
  {
    "id": "team-uuid-2",
    "name": "Equipo B"
  }
]
```

**Errores posibles:**
- `401 Unauthorized`: Token inválido

**READ_ONLY:** ✓ Permitido

**Ejemplo:**
```
Tool: list_all_teams
Respuesta: 2 equipos encontrados
```

---

## 3. CATEGORÍA: Projects (Proyectos)

### 3.1 list_projects
**Descripción:** Lista todos los proyectos del equipo.

**Endpoint:** `GET /projects`

**Parámetros:** Ninguno

**Respuesta esperada:**
```json
[
  {
    "uuid": "project-uuid-1",
    "name": "Landing Web",
    "description": "Sitio público",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

**Errores posibles:**
- `401 Unauthorized`: Token inválido
- `404 Not Found`: No hay proyectos

**READ_ONLY:** ✓ Permitido

**Ejemplo:**
```
Tool: list_projects
Respuesta: 5 proyectos encontrados
```

---

### 3.2 get_project_by_uuid
**Descripción:** Obtiene detalles de un proyecto específico.

**Endpoint:** `GET /projects/{uuid}`

**Parámetros:**
- `uuid` (string, requerido): UUID del proyecto

**Respuesta esperada:**
```json
{
  "uuid": "project-uuid",
  "name": "Landing Web",
  "description": "Sitio público",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-05-10T15:45:00Z"
}
```

**Errores posibles:**
- `401 Unauthorized`: Sin acceso
- `404 Not Found`: Proyecto no existe

**READ_ONLY:** ✓ Permitido

**Ejemplo:**
```
Tool: get_project_by_uuid
Parámetros: uuid="abc-123"
Respuesta: Detalles completos del proyecto
```

---

### 3.3 create_project
**Descripción:** Crea un nuevo proyecto.

**Endpoint:** `POST /projects`

**Parámetros:**
- `name` (string, requerido): Nombre del proyecto
- `description` (string, opcional): Descripción

**Respuesta esperada:**
```json
{
  "uuid": "project-uuid-nuevo",
  "name": "Nuevo Proyecto",
  "description": "Descripción",
  "created_at": "2024-05-11T10:00:00Z"
}
```

**Errores posibles:**
- `401 Unauthorized`: Sin permisos
- `422 Unprocessable Entity`: Nombre duplicado o formato inválido

**READ_ONLY:** ✗ Bloqueado

**Ejemplo:**
```
Tool: create_project
Parámetros: name="Proyecto API"
Requiere confirmación: Sí
Respuesta: Proyecto creado con UUID abc-123
```

---

### 3.4 update_project
**Descripción:** Actualiza nombre/descripción de un proyecto.

**Endpoint:** `PATCH /projects/{uuid}`

**Parámetros:**
- `uuid` (string, requerido): UUID del proyecto
- `name` (string, opcional): Nuevo nombre
- `description` (string, opcional): Nueva descripción

**Respuesta esperada:**
```json
{
  "uuid": "project-uuid",
  "name": "Nombre actualizado",
  "updated_at": "2024-05-11T11:00:00Z"
}
```

**Errores posibles:**
- `401 Unauthorized`: Sin permisos
- `404 Not Found`: Proyecto no existe
- `422 Unprocessable Entity`: Datos inválidos

**READ_ONLY:** ✗ Bloqueado

**Ejemplo:**
```
Tool: update_project
Parámetros: uuid="abc-123", name="Nombre nuevo"
Requiere confirmación: Sí
```

---

### 3.5 delete_project
**Descripción:** Elimina un proyecto (operación destructiva).

**Endpoint:** `DELETE /projects/{uuid}`

**Parámetros:**
- `uuid` (string, requerido): UUID del proyecto

**Respuesta esperada:**
```json
{
  "message": "Project deleted successfully"
}
```

**Errores posibles:**
- `401 Unauthorized`: Sin permisos
- `404 Not Found`: Proyecto no existe
- `409 Conflict`: Proyecto tiene recursos dependientes

**READ_ONLY:** ✗ Bloqueado

**Ejemplo:**
```
Tool: delete_project
Parámetros: uuid="abc-123"
Requiere confirmación: Sí (CRÍTICO - operación irreversible)
```

---

### 3.6 list_project_environments
**Descripción:** Lista los entornos de un proyecto.

**Endpoint:** `GET /projects/{uuid}/environments`

**Parámetros:**
- `uuid` (string, requerido): UUID del proyecto

**Respuesta esperada:**
```json
[
  {
    "name": "production",
    "uuid": "env-uuid-1"
  },
  {
    "name": "staging",
    "uuid": "env-uuid-2"
  }
]
```

**Errores posibles:**
- `401 Unauthorized`: Sin acceso
- `404 Not Found`: Proyecto no existe

**READ_ONLY:** ✓ Permitido

**Ejemplo:**
```
Tool: list_project_environments
Parámetros: uuid="abc-123"
Respuesta: 2 entornos encontrados
```

---

### 3.7 get_environment_by_name_or_uuid
**Descripción:** Obtiene un entorno específico por nombre o UUID.

**Endpoint:** `GET /projects/{uuid}/{environment_name_or_uuid}`

**Parámetros:**
- `uuid` (string, requerido): UUID del proyecto
- `environment_name_or_uuid` (string, requerido): Nombre o UUID del entorno

**Respuesta esperada:**
```json
{
  "name": "production",
  "uuid": "env-uuid",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Errores posibles:**
- `401 Unauthorized`: Sin acceso
- `404 Not Found`: Proyecto o entorno no existe

**READ_ONLY:** ✓ Permitido

**Ejemplo:**
```
Tool: get_environment_by_name_or_uuid
Parámetros: uuid="abc-123", environment_name_or_uuid="production"
Respuesta: Detalles del entorno
```

---

### 3.8 create_environment
**Descripción:** Crea un nuevo entorno en un proyecto.

**Endpoint:** `POST /projects/{uuid}/environments`

**Parámetros:**
- `uuid` (string, requerido): UUID del proyecto
- `name` (string, requerido): Nombre del entorno (ej: staging, development)

**Respuesta esperada:**
```json
{
  "name": "development",
  "uuid": "env-uuid-nuevo",
  "created_at": "2024-05-11T10:00:00Z"
}
```

**Errores posibles:**
- `401 Unauthorized`: Sin permisos
- `404 Not Found`: Proyecto no existe
- `422 Unprocessable Entity`: Nombre duplicado

**READ_ONLY:** ✗ Bloqueado

**Ejemplo:**
```
Tool: create_environment
Parámetros: uuid="abc-123", name="testing"
Requiere confirmación: Sí
```

---

### 3.9 delete_environment
**Descripción:** Elimina un entorno de un proyecto.

**Endpoint:** `DELETE /projects/{uuid}/environments/{environment_name_or_uuid}`

**Parámetros:**
- `uuid` (string, requerido): UUID del proyecto
- `environment_name_or_uuid` (string, requerido): Nombre o UUID del entorno

**Respuesta esperada:**
```json
{
  "message": "Environment deleted successfully"
}
```

**Errores posibles:**
- `401 Unauthorized`: Sin permisos
- `404 Not Found`: Proyecto/entorno no existe
- `409 Conflict`: Entorno tiene recursos dependientes

**READ_ONLY:** ✗ Bloqueado

**Ejemplo:**
```
Tool: delete_environment
Parámetros: uuid="abc-123", environment_name_or_uuid="development"
Requiere confirmación: Sí (CRÍTICO)
```

---

## 4. CATEGORÍA: Applications (Aplicaciones)

### 4.1 list_applications
**Descripción:** Lista todas las aplicaciones del equipo.

**Endpoint:** `GET /applications`

**Parámetros:**
- `tag` (string, opcional): Filtrar por etiqueta

**Respuesta esperada:**
```json
[
  {
    "uuid": "app-uuid-1",
    "name": "api-backend",
    "fqdn": "api.example.com",
    "git_repository": "https://github.com/user/repo",
    "git_branch": "main",
    "status": "running",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

**Errores posibles:**
- `401 Unauthorized`: Token inválido

**READ_ONLY:** ✓ Permitido

**Ejemplo:**
```
Tool: list_applications
Parámetros: tag="production"
Respuesta: 3 aplicaciones encontradas con tag "production"
```

---

### 4.2 get_application_by_uuid
**Descripción:** Obtiene detalles completos de una aplicación.

**Endpoint:** `GET /applications/{uuid}`

**Parámetros:**
- `uuid` (string, requerido): UUID de la aplicación

**Respuesta esperada:**
```json
{
  "uuid": "app-uuid",
  "name": "api-backend",
  "fqdn": "api.example.com",
  "git_repository": "https://github.com/user/repo",
  "git_branch": "main",
  "build_pack": "nixpacks",
  "ports_exposes": "3000",
  "install_command": "npm install",
  "build_command": "npm run build",
  "start_command": "npm start",
  "health_check_enabled": true,
  "health_check_path": "/health",
  "status": "running",
  "updated_at": "2024-05-10T15:45:00Z"
}
```

**Errores posibles:**
- `401 Unauthorized`: Sin acceso
- `404 Not Found`: Aplicación no existe

**READ_ONLY:** ✓ Permitido

**Ejemplo:**
```
Tool: get_application_by_uuid
Parámetros: uuid="app-123"
Respuesta: Configuración completa de la aplicación
```

---

### 4.3 get_application_logs
**Descripción:** Obtiene los logs recientes de una aplicación.

**Endpoint:** `GET /applications/{uuid}/logs`

**Parámetros:**
- `uuid` (string, requerido): UUID de la aplicación
- `lines` (integer, opcional): Número de líneas (default: 100)
- `follow` (boolean, opcional): Seguimiento en tiempo real (si soporta)

**Respuesta esperada:**
```json
{
  "logs": [
    "[2024-05-11 10:30:15] INFO: Server started on port 3000",
    "[2024-05-11 10:30:16] INFO: Database connected",
    "[2024-05-11 10:30:20] WARN: Memory usage at 75%"
  ]
}
```

**Errores posibles:**
- `401 Unauthorized`: Sin acceso
- `404 Not Found`: Aplicación no existe

**READ_ONLY:** ✓ Permitido

**Ejemplo:**
```
Tool: get_application_logs
Parámetros: uuid="app-123", lines=50
Respuesta: Últimas 50 líneas de logs
```

---

### 4.4 create_application_public
**Descripción:** Crea una aplicación desde un repositorio Git público.

**Endpoint:** `POST /applications/public`

**Parámetros:**
- `project_uuid` (string, requerido): UUID del proyecto
- `server_uuid` (string, requerido): UUID del servidor
- `environment_name` (string, requerido): Nombre del entorno
- `git_repository` (string, requerido): URL del repositorio Git
- `git_branch` (string, requerido): Rama principal (ej: main)
- `build_pack` (string, requerido): Build pack (nixpacks, docker, etc)
- `name` (string, requerido): Nombre de la aplicación
- `domains` (string, requerido): Dominio/URLs (ej: https://app.example.com)
- `is_auto_deploy_enabled` (boolean, opcional): Auto-despliegue en cambios
- `is_force_https_enabled` (boolean, opcional): Forzar HTTPS
- `install_command` (string, opcional): Comando de instalación
- `build_command` (string, opcional): Comando de build
- `start_command` (string, opcional): Comando de inicio
- `ports_exposes` (string, requerido): Puerto expuesto (ej: 3000)

**Respuesta esperada:**
```json
{
  "uuid": "app-uuid-nuevo",
  "name": "app-name",
  "status": "deploying"
}
```

**Errores posibles:**
- `401 Unauthorized`: Sin permisos
- `422 Unprocessable Entity`: Datos inválidos
- `400 Bad Request`: Servidor/proyecto no existe

**READ_ONLY:** ✗ Bloqueado

**Ejemplo:**
```
Tool: create_application_public
Parámetros: project_uuid="proj-123", server_uuid="srv-456", ...
Requiere confirmación: Sí
Respuesta: Aplicación creada, despliegue iniciado
```

---

### 4.5 create_application_dockerfile
**Descripción:** Crea una aplicación desde un Dockerfile.

**Endpoint:** `POST /applications/dockerfile`

**Parámetros:**
- `project_uuid` (string, requerido)
- `server_uuid` (string, requerido)
- `environment_name` (string, requerido)
- `name` (string, requerido)
- `domains` (string, requerido)
- `dockerfile_content` (string, requerido): Contenido del Dockerfile
- `ports_exposes` (string, requerido)
- (otros parámetros opcionales)

**Respuesta esperada:**
```json
{
  "uuid": "app-uuid-nuevo",
  "name": "app-name",
  "status": "deploying"
}
```

**Errores posibles:**
- `401 Unauthorized`: Sin permisos
- `422 Unprocessable Entity`: Dockerfile inválido

**READ_ONLY:** ✗ Bloqueado

**Ejemplo:**
```
Tool: create_application_dockerfile
Parámetros: project_uuid="...", dockerfile_content="FROM node:18\n..."
Requiere confirmación: Sí
```

---

### 4.6 create_application_dockercompose
**Descripción:** Crea una aplicación desde un docker-compose.yml.

**Endpoint:** `POST /applications/dockercompose`

**Parámetros:**
- `project_uuid` (string, requerido)
- `server_uuid` (string, requerido)
- `environment_name` (string, requerido)
- `name` (string, requerido)
- `domains` (string, requerido)
- `docker_compose_content` (string, requerido): YAML del compose
- (otros parámetros opcionales)

**Respuesta esperada:**
```json
{
  "uuid": "app-uuid-nuevo",
  "name": "app-name",
  "status": "deploying"
}
```

**Errores posibles:**
- `401 Unauthorized`: Sin permisos
- `422 Unprocessable Entity`: Compose inválido

**READ_ONLY:** ✗ Bloqueado

---

### 4.7 create_application_dockerimage
**Descripción:** Crea una aplicación desde una imagen Docker pre-construida.

**Endpoint:** `POST /applications/dockerimage`

**Parámetros:**
- `project_uuid` (string, requerido)
- `server_uuid` (string, requerido)
- `environment_name` (string, requerido)
- `name` (string, requerido)
- `domains` (string, requerido)
- `docker_image` (string, requerido): Imagen (ej: registry.io/app:1.0)
- `ports_exposes` (string, requerido)
- (otros parámetros opcionales)

**Respuesta esperada:**
```json
{
  "uuid": "app-uuid-nuevo",
  "name": "app-name",
  "status": "deploying"
}
```

**Errores posibles:**
- `401 Unauthorized`: Sin permisos
- `422 Unprocessable Entity`: Imagen inválida

**READ_ONLY:** ✗ Bloqueado

---

### 4.8 create_application_private_github_app
**Descripción:** Crea una aplicación desde repositorio privado usando GitHub App.

**Endpoint:** `POST /applications/private-github-app`

**Parámetros:**
- `project_uuid` (string, requerido)
- `server_uuid` (string, requerido)
- `environment_name` (string, requerido)
- `github_app_uuid` (string, requerido): UUID de GitHub App configurada
- `git_repository` (string, requerido): URL del repositorio
- `git_branch` (string, requerido): Rama
- `name` (string, requerido)
- `domains` (string, requerido)
- (otros parámetros opcionales)

**Respuesta esperada:**
```json
{
  "uuid": "app-uuid-nuevo",
  "name": "app-name",
  "status": "deploying"
}
```

**Errores posibles:**
- `401 Unauthorized`: Sin permisos
- `404 Not Found`: GitHub App no existe
- `422 Unprocessable Entity`: Datos inválidos

**READ_ONLY:** ✗ Bloqueado

---

### 4.9 create_application_private_deploy_key
**Descripción:** Crea una aplicación desde repositorio privado usando Deploy Key SSH.

**Endpoint:** `POST /applications/private-deploy-key`

**Parámetros:**
- `project_uuid` (string, requerido)
- `server_uuid` (string, requerido)
- `environment_name` (string, requerido)
- `private_key_uuid` (string, requerido): UUID de la clave privada
- `git_repository` (string, requerido): URL del repositorio
- `git_branch` (string, requerido): Rama
- `name` (string, requerido)
- `domains` (string, requerido)
- (otros parámetros opcionales)

**Respuesta esperada:**
```json
{
  "uuid": "app-uuid-nuevo",
  "name": "app-name",
  "status": "deploying"
}
```

**Errores posibles:**
- `401 Unauthorized`: Sin permisos
- `404 Not Found`: Clave privada no existe

**READ_ONLY:** ✗ Bloqueado

---

### 4.10 update_application
**Descripción:** Actualiza configuración de una aplicación.

**Endpoint:** `PATCH /applications/{uuid}`

**Parámetros:**
- `uuid` (string, requerido): UUID de la aplicación
- `domains` (string, opcional): Nuevos dominios
- `is_force_https_enabled` (boolean, opcional)
- `ports_exposes` (string, opcional): Nuevos puertos
- `install_command` (string, opcional)
- `build_command` (string, opcional)
- `start_command` (string, opcional)
- (otros campos opcionales según versión)

**Respuesta esperada:**
```json
{
  "uuid": "app-uuid",
  "message": "Application updated successfully"
}
```

**Errores posibles:**
- `401 Unauthorized`: Sin permisos
- `404 Not Found`: Aplicación no existe
- `422 Unprocessable Entity`: Datos inválidos

**READ_ONLY:** ✗ Bloqueado

**Ejemplo:**
```
Tool: update_application
Parámetros: uuid="app-123", domains="https://new.example.com"
Requiere confirmación: Sí
```

---

### 4.11 delete_application
**Descripción:** Elimina una aplicación (operación destructiva).

**Endpoint:** `DELETE /applications/{uuid}`

**Parámetros:**
- `uuid` (string, requerido): UUID de la aplicación

**Respuesta esperada:**
```json
{
  "message": "Application deleted successfully"
}
```

**Errores posibles:**
- `401 Unauthorized`: Sin permisos
- `404 Not Found`: Aplicación no existe

**READ_ONLY:** ✗ Bloqueado

**Ejemplo:**
```
Tool: delete_application
Parámetros: uuid="app-123"
Requiere confirmación: Sí (CRÍTICO - irreversible)
```

---

### 4.12 start_application
**Descripción:** Inicia una aplicación parada.

**Endpoint:** `GET /applications/{uuid}/start`

**Parámetros:**
- `uuid` (string, requerido): UUID de la aplicación

**Respuesta esperada:**
```json
{
  "message": "Application started successfully"
}
```

**Errores posibles:**
- `401 Unauthorized`: Sin permisos
- `404 Not Found`: Aplicación no existe
- `400 Bad Request`: Aplicación ya está en ejecución

**READ_ONLY:** ✗ Bloqueado

**Ejemplo:**
```
Tool: start_application
Parámetros: uuid="app-123"
Requiere confirmación: Sí
```

---

### 4.13 stop_application
**Descripción:** Detiene una aplicación en ejecución.

**Endpoint:** `GET /applications/{uuid}/stop`

**Parámetros:**
- `uuid` (string, requerido): UUID de la aplicación

**Respuesta esperada:**
```json
{
  "message": "Application stopped successfully"
}
```

**Errores posibles:**
- `401 Unauthorized`: Sin permisos
- `404 Not Found`: Aplicación no existe
- `400 Bad Request`: Aplicación ya está parada

**READ_ONLY:** ✗ Bloqueado

**Ejemplo:**
```
Tool: stop_application
Parámetros: uuid="app-123"
Requiere confirmación: Sí
```

---

### 4.14 restart_application
**Descripción:** Reinicia una aplicación.

**Endpoint:** `GET /applications/{uuid}/restart`

**Parámetros:**
- `uuid` (string, requerido): UUID de la aplicación

**Respuesta esperada:**
```json
{
  "message": "Application restarted successfully"
}
```

**Errores posibles:**
- `401 Unauthorized`: Sin permisos
- `404 Not Found`: Aplicación no existe

**READ_ONLY:** ✗ Bloqueado

**Ejemplo:**
```
Tool: restart_application
Parámetros: uuid="app-123"
Requiere confirmación: Sí
```

---

### 4.15 list_application_environment_variables
**Descripción:** Lista todas las variables de entorno de una aplicación.

**Endpoint:** `GET /applications/{uuid}/envs`

**Parámetros:**
- `uuid` (string, requerido): UUID de la aplicación

**Respuesta esperada:**
```json
[
  {
    "uuid": "env-var-uuid-1",
    "key": "NODE_ENV",
    "value": "production",
    "is_build_time": false,
    "is_preview": false,
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

**Errores posibles:**
- `401 Unauthorized`: Sin acceso
- `404 Not Found`: Aplicación no existe

**READ_ONLY:** ✓ Permitido

**Ejemplo:**
```
Tool: list_application_environment_variables
Parámetros: uuid="app-123"
Respuesta: 8 variables de entorno encontradas
```

---

### 4.16 create_application_environment_variable
**Descripción:** Crea una nueva variable de entorno en una aplicación.

**Endpoint:** `POST /applications/{uuid}/envs`

**Parámetros:**
- `uuid` (string, requerido): UUID de la aplicación
- `key` (string, requerido): Nombre de la variable
- `value` (string, requerido): Valor
- `is_build_time` (boolean, opcional): Disponible en build
- `is_preview` (boolean, opcional): Disponible en preview

**Respuesta esperada:**
```json
{
  "uuid": "env-var-uuid-nuevo",
  "key": "API_KEY",
  "value": "secret-value"
}
```

**Errores posibles:**
- `401 Unauthorized`: Sin permisos
- `404 Not Found`: Aplicación no existe
- `422 Unprocessable Entity`: Clave duplicada o inválida

**READ_ONLY:** ✗ Bloqueado

**Ejemplo:**
```
Tool: create_application_environment_variable
Parámetros: uuid="app-123", key="SECRET_KEY", value="xxx"
Requiere confirmación: Sí
```

---

### 4.17 update_application_environment_variable
**Descripción:** Actualiza una variable de entorno.

**Endpoint:** `PATCH /applications/{uuid}/envs`

**Parámetros:**
- `uuid` (string, requerido): UUID de la aplicación
- `key` (string, requerido): Nombre de la variable
- `value` (string, requerido): Nuevo valor
- `is_build_time` (boolean, opcional)
- `is_preview` (boolean, opcional)

**Respuesta esperada:**
```json
{
  "uuid": "env-var-uuid",
  "key": "API_KEY",
  "value": "new-value"
}
```

**Errores posibles:**
- `401 Unauthorized`: Sin permisos
- `404 Not Found`: Aplicación o variable no existe
- `422 Unprocessable Entity`: Datos inválidos

**READ_ONLY:** ✗ Bloqueado

---

### 4.18 bulk_update_application_environment_variables
**Descripción:** Actualiza múltiples variables de entorno en un batch.

**Endpoint:** `PATCH /applications/{uuid}/envs/bulk`

**Parámetros:**
- `uuid` (string, requerido): UUID de la aplicación
- `variables` (array, requerido): Array de {key, value, ...}

**Respuesta esperada:**
```json
{
  "message": "Variables updated successfully",
  "count": 3
}
```

**Errores posibles:**
- `401 Unauthorized`: Sin permisos
- `404 Not Found`: Aplicación no existe
- `422 Unprocessable Entity`: Variables inválidas

**READ_ONLY:** ✗ Bloqueado

---

### 4.19 delete_application_environment_variable
**Descripción:** Elimina una variable de entorno.

**Endpoint:** `DELETE /applications/{uuid}/envs/{env_uuid}`

**Parámetros:**
- `uuid` (string, requerido): UUID de la aplicación
- `env_uuid` (string, requerido): UUID de la variable

**Respuesta esperada:**
```json
{
  "message": "Environment variable deleted successfully"
}
```

**Errores posibles:**
- `401 Unauthorized`: Sin permisos
- `404 Not Found`: Aplicación o variable no existe

**READ_ONLY:** ✗ Bloqueado

---

## 5. CATEGORÍA: Deployments (Despliegues)

### 5.1 list_deployments
**Descripción:** Lista todos los despliegues recientes.

**Endpoint:** `GET /deployments`

**Parámetros:**
- `limit` (integer, opcional): Número máximo de despliegues (default: 50)
- `offset` (integer, opcional): Paginación

**Respuesta esperada:**
```json
[
  {
    "uuid": "deploy-uuid-1",
    "application_uuid": "app-uuid-1",
    "status": "completed",
    "commit_sha": "abc1234",
    "branch": "main",
    "created_at": "2024-05-11T10:00:00Z",
    "finished_at": "2024-05-11T10:05:00Z"
  }
]
```

**Errores posibles:**
- `401 Unauthorized`: Token inválido

**READ_ONLY:** ✓ Permitido

**Ejemplo:**
```
Tool: list_deployments
Parámetros: limit=20
Respuesta: 20 despliegues recientes
```

---

### 5.2 get_deployment_by_uuid
**Descripción:** Obtiene detalles de un despliegue específico.

**Endpoint:** `GET /deployments/{uuid}`

**Parámetros:**
- `uuid` (string, requerido): UUID del despliegue

**Respuesta esperada:**
```json
{
  "uuid": "deploy-uuid",
  "application_uuid": "app-uuid",
  "status": "completed",
  "commit_sha": "abc1234",
  "branch": "main",
  "pull_request_id": 42,
  "created_at": "2024-05-11T10:00:00Z",
  "finished_at": "2024-05-11T10:05:00Z",
  "logs": "..."
}
```

**Errores posibles:**
- `401 Unauthorized`: Sin acceso
- `404 Not Found`: Despliegue no existe

**READ_ONLY:** ✓ Permitido

**Ejemplo:**
```
Tool: get_deployment_by_uuid
Parámetros: uuid="deploy-123"
Respuesta: Estado y logs del despliegue
```

---

### 5.3 list_application_deployments
**Descripción:** Lista despliegues de una aplicación específica.

**Endpoint:** `GET /applications/{uuid}/deployments`

**Parámetros:**
- `uuid` (string, requerido): UUID de la aplicación
- `limit` (integer, opcional): Número máximo

**Respuesta esperada:**
```json
[
  {
    "uuid": "deploy-uuid-1",
    "status": "completed",
    "created_at": "2024-05-11T10:00:00Z"
  }
]
```

**Errores posibles:**
- `401 Unauthorized`: Sin acceso
- `404 Not Found`: Aplicación no existe

**READ_ONLY:** ✓ Permitido

**Ejemplo:**
```
Tool: list_application_deployments
Parámetros: uuid="app-123"
Respuesta: Histórico de despliegues de la aplicación
```

---

### 5.4 trigger_deployment
**Descripción:** Lanza un despliegue de una aplicación.

**Endpoint:** `GET /deploy?uuid={uuid}`

**Parámetros:**
- `uuid` (string, requerido): UUID de la aplicación

**Respuesta esperada:**
```json
{
  "uuid": "deploy-uuid-nuevo",
  "status": "queued",
  "message": "Deployment queued successfully"
}
```

**Errores posibles:**
- `401 Unauthorized`: Sin permisos
- `404 Not Found`: Aplicación no existe
- `400 Bad Request`: Despliegue ya en curso

**READ_ONLY:** ✗ Bloqueado

**Ejemplo:**
```
Tool: trigger_deployment
Parámetros: uuid="app-123"
Requiere confirmación: Sí (especialmente en producción)
Respuesta: Despliegue iniciado, UUID = deploy-123
```

---

### 5.5 cancel_deployment
**Descripción:** Cancela un despliegue en curso.

**Endpoint:** `POST /deployments/{uuid}/cancel`

**Parámetros:**
- `uuid` (string, requerido): UUID del despliegue

**Respuesta esperada:**
```json
{
  "message": "Deployment cancelled successfully"
}
```

**Errores posibles:**
- `401 Unauthorized`: Sin permisos
- `404 Not Found`: Despliegue no existe
- `400 Bad Request`: Despliegue ya completado

**READ_ONLY:** ✗ Bloqueado

**Ejemplo:**
```
Tool: cancel_deployment
Parámetros: uuid="deploy-123"
Requiere confirmación: Sí
```

---

## 6. CATEGORÍA: Databases (Bases de Datos)

### 6.1 list_databases
**Descripción:** Lista todas las bases de datos.

**Endpoint:** `GET /databases`

**Parámetros:** Ninguno

**Respuesta esperada:**
```json
[
  {
    "uuid": "db-uuid-1",
    "name": "postgres-prod",
    "type": "postgresql",
    "status": "running",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

**Errores posibles:**
- `401 Unauthorized`: Token inválido

**READ_ONLY:** ✓ Permitido

**Ejemplo:**
```
Tool: list_databases
Respuesta: 5 bases de datos encontradas
```

---

### 6.2 get_database_by_uuid
**Descripción:** Obtiene detalles de una base de datos.

**Endpoint:** `GET /databases/{uuid}`

**Parámetros:**
- `uuid` (string, requerido): UUID de la base de datos

**Respuesta esperada:**
```json
{
  "uuid": "db-uuid",
  "name": "postgres-prod",
  "type": "postgresql",
  "status": "running",
  "version": "14.2",
  "port": 5432,
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Errores posibles:**
- `401 Unauthorized`: Sin acceso
- `404 Not Found`: Base de datos no existe

**READ_ONLY:** ✓ Permitido

---

### 6.3 create_database_postgresql
**Descripción:** Crea una nueva base de datos PostgreSQL.

**Endpoint:** `POST /databases/postgresql`

**Parámetros:**
- `project_uuid` (string, requerido)
- `server_uuid` (string, requerido)
- `environment_name` (string, requerido)
- `name` (string, requerido): Nombre de la BD
- `description` (string, opcional)

**Respuesta esperada:**
```json
{
  "uuid": "db-uuid-nuevo",
  "name": "postgres-new",
  "status": "initializing"
}
```

**Errores posibles:**
- `401 Unauthorized`: Sin permisos
- `422 Unprocessable Entity`: Nombre duplicado

**READ_ONLY:** ✗ Bloqueado

---

### 6.4 create_database_mysql
**Descripción:** Crea una nueva base de datos MySQL.

**Endpoint:** `POST /databases/mysql`

**Parámetros:** Similar a PostgreSQL

**Respuesta esperada:** Similar

**Errores posibles:** Similar

**READ_ONLY:** ✗ Bloqueado

---

### 6.5 create_database_mariadb
**Descripción:** Crea una nueva base de datos MariaDB.

**Endpoint:** `POST /databases/mariadb`

**Parámetros:** Similar

**READ_ONLY:** ✗ Bloqueado

---

### 6.6 create_database_mongodb
**Descripción:** Crea una nueva base de datos MongoDB.

**Endpoint:** `POST /databases/mongodb`

**Parámetros:** Similar

**READ_ONLY:** ✗ Bloqueado

---

### 6.7 create_database_redis
**Descripción:** Crea una nueva instancia Redis.

**Endpoint:** `POST /databases/redis`

**Parámetros:** Similar

**READ_ONLY:** ✗ Bloqueado

---

### 6.8 create_database_dragonfly
**Descripción:** Crea una nueva instancia DragonFly.

**Endpoint:** `POST /databases/dragonfly`

**Parámetros:** Similar

**READ_ONLY:** ✗ Bloqueado

---

### 6.9 create_database_keydb
**Descripción:** Crea una nueva instancia KeyDB.

**Endpoint:** `POST /databases/keydb`

**Parámetros:** Similar

**READ_ONLY:** ✗ Bloqueado

---

### 6.10 create_database_clickhouse
**Descripción:** Crea una nueva instancia ClickHouse.

**Endpoint:** `POST /databases/clickhouse`

**Parámetros:** Similar

**READ_ONLY:** ✗ Bloqueado

---

### 6.11 update_database
**Descripción:** Actualiza configuración de una base de datos.

**Endpoint:** `PATCH /databases/{uuid}`

**Parámetros:**
- `uuid` (string, requerido)
- `name` (string, opcional)
- `description` (string, opcional)

**READ_ONLY:** ✗ Bloqueado

---

### 6.12 delete_database
**Descripción:** Elimina una base de datos (operación destructiva).

**Endpoint:** `DELETE /databases/{uuid}`

**Parámetros:**
- `uuid` (string, requerido)

**READ_ONLY:** ✗ Bloqueado

**Nota:** Requiere confirmación crítica

---

### 6.13 start_database
**Descripción:** Inicia una base de datos parada.

**Endpoint:** `GET /databases/{uuid}/start`

**Parámetros:**
- `uuid` (string, requerido)

**READ_ONLY:** ✗ Bloqueado

---

### 6.14 stop_database
**Descripción:** Detiene una base de datos.

**Endpoint:** `GET /databases/{uuid}/stop`

**Parámetros:**
- `uuid` (string, requerido)

**READ_ONLY:** ✗ Bloqueado

---

### 6.15 restart_database
**Descripción:** Reinicia una base de datos.

**Endpoint:** `GET /databases/{uuid}/restart`

**Parámetros:**
- `uuid` (string, requerido)

**READ_ONLY:** ✗ Bloqueado

---

### 6.16 list_database_backups
**Descripción:** Lista backups configurados de una base de datos.

**Endpoint:** `GET /databases/{uuid}/backups`

**Parámetros:**
- `uuid` (string, requerido): UUID de la BD

**Respuesta esperada:**
```json
[
  {
    "uuid": "backup-uuid-1",
    "name": "daily-backup",
    "frequency": "daily",
    "retention_days": 30
  }
]
```

**READ_ONLY:** ✓ Permitido

---

### 6.17 create_database_backup
**Descripción:** Crea una configuración de backup automático.

**Endpoint:** `POST /databases/{uuid}/backups`

**Parámetros:**
- `uuid` (string, requerido)
- `frequency` (string, requerido): daily, weekly, monthly
- `retention_days` (integer, requerido): Días a retener

**READ_ONLY:** ✗ Bloqueado

---

### 6.18 update_database_backup
**Descripción:** Actualiza configuración de backup.

**Endpoint:** `PATCH /databases/{uuid}/backups`

**Parámetros:**
- `uuid` (string, requerido)
- `frequency` (string, opcional)
- `retention_days` (integer, opcional)

**READ_ONLY:** ✗ Bloqueado

---

### 6.19 delete_database_backup
**Descripción:** Elimina una configuración de backup.

**Endpoint:** `DELETE /databases/backups/{uuid}`

**Parámetros:**
- `uuid` (string, requerido): UUID del backup

**READ_ONLY:** ✗ Bloqueado

---

### 6.20 list_backup_executions
**Descripción:** Lista ejecuciones de backups (histórico).

**Endpoint:** `GET /databases/backup-executions`

**Parámetros:**
- `limit` (integer, opcional)

**Respuesta esperada:**
```json
[
  {
    "uuid": "exec-uuid-1",
    "backup_uuid": "backup-uuid-1",
    "status": "success",
    "created_at": "2024-05-11T02:00:00Z",
    "size_bytes": 1024000
  }
]
```

**READ_ONLY:** ✓ Permitido

---

### 6.21 delete_backup_execution
**Descripción:** Elimina una ejecución de backup (histórico).

**Endpoint:** `DELETE /databases/backup-executions/{uuid}`

**Parámetros:**
- `uuid` (string, requerido)

**READ_ONLY:** ✗ Bloqueado

---

## 7. CATEGORÍA: Services (Servicios One-Click)

### 7.1 list_services
**Descripción:** Lista todos los servicios one-click.

**Endpoint:** `GET /services`

**Parámetros:** Ninguno

**Respuesta esperada:**
```json
[
  {
    "uuid": "service-uuid-1",
    "name": "wordpress-prod",
    "type": "wordpress-with-mysql",
    "status": "running"
  }
]
```

**READ_ONLY:** ✓ Permitido

---

### 7.2 get_service_by_uuid
**Descripción:** Obtiene detalles de un servicio.

**Endpoint:** `GET /services/{uuid}`

**Parámetros:**
- `uuid` (string, requerido)

**READ_ONLY:** ✓ Permitido

---

### 7.3 create_service
**Descripción:** Crea un nuevo servicio one-click.

**Endpoint:** `POST /services`

**Parámetros:**
- `server_uuid` (string, requerido)
- `project_uuid` (string, requerido)
- `environment_name` (string, requerido)
- `type` (string, requerido): wordpress-with-mysql, gitea, plausible, etc
- `name` (string, requerido)

**READ_ONLY:** ✗ Bloqueado

---

### 7.4 update_service
**Descripción:** Actualiza configuración de un servicio.

**Endpoint:** `PATCH /services/{uuid}`

**Parámetros:**
- `uuid` (string, requerido)
- `name` (string, opcional)

**READ_ONLY:** ✗ Bloqueado

---

### 7.5 delete_service
**Descripción:** Elimina un servicio.

**Endpoint:** `DELETE /services/{uuid}`

**Parámetros:**
- `uuid` (string, requerido)

**READ_ONLY:** ✗ Bloqueado

---

### 7.6 start_service
**Descripción:** Inicia un servicio.

**Endpoint:** `GET /services/{uuid}/start`

**Parámetros:**
- `uuid` (string, requerido)

**READ_ONLY:** ✗ Bloqueado

---

### 7.7 stop_service
**Descripción:** Detiene un servicio.

**Endpoint:** `GET /services/{uuid}/stop`

**Parámetros:**
- `uuid` (string, requerido)

**READ_ONLY:** ✗ Bloqueado

---

### 7.8 restart_service
**Descripción:** Reinicia un servicio.

**Endpoint:** `GET /services/{uuid}/restart`

**Parámetros:**
- `uuid` (string, requerido)

**READ_ONLY:** ✗ Bloqueado

---

### 7.9 list_service_environment_variables
**Descripción:** Lista variables de entorno de un servicio.

**Endpoint:** `GET /services/{uuid}/envs`

**Parámetros:**
- `uuid` (string, requerido)

**READ_ONLY:** ✓ Permitido

---

### 7.10 create_service_environment_variable
**Descripción:** Crea variable de entorno en un servicio.

**Endpoint:** `POST /services/{uuid}/envs`

**Parámetros:**
- `uuid` (string, requerido)
- `key` (string, requerido)
- `value` (string, requerido)

**READ_ONLY:** ✗ Bloqueado

---

### 7.11 update_service_environment_variable
**Descripción:** Actualiza variable de entorno.

**Endpoint:** `PATCH /services/{uuid}/envs`

**Parámetros:** Similar a create

**READ_ONLY:** ✗ Bloqueado

---

### 7.12 bulk_update_service_environment_variables
**Descripción:** Actualiza múltiples variables en batch.

**Endpoint:** `PATCH /services/{uuid}/envs/bulk`

**Parámetros:**
- `uuid` (string, requerido)
- `variables` (array, requerido)

**READ_ONLY:** ✗ Bloqueado

---

### 7.13 delete_service_environment_variable
**Descripción:** Elimina una variable de entorno.

**Endpoint:** `DELETE /services/{uuid}/envs/{env_uuid}`

**Parámetros:**
- `uuid` (string, requerido)
- `env_uuid` (string, requerido)

**READ_ONLY:** ✗ Bloqueado

---

## 8. CATEGORÍA: Servers (Servidores)

### 8.1 list_servers
**Descripción:** Lista todos los servidores conectados.

**Endpoint:** `GET /servers`

**Parámetros:** Ninguno

**Respuesta esperada:**
```json
[
  {
    "uuid": "server-uuid-1",
    "name": "prod-server-1",
    "ip": "192.168.1.10",
    "status": "connected",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

**READ_ONLY:** ✓ Permitido

---

### 8.2 get_server_by_uuid
**Descripción:** Obtiene detalles de un servidor.

**Endpoint:** `GET /servers/{uuid}`

**Parámetros:**
- `uuid` (string, requerido)

**Respuesta esperada:**
```json
{
  "uuid": "server-uuid",
  "name": "prod-server-1",
  "ip": "192.168.1.10",
  "status": "connected",
  "os": "Ubuntu 22.04",
  "docker_version": "24.0.0"
}
```

**READ_ONLY:** ✓ Permitido

---

### 8.3 create_server
**Descripción:** Crea/registra un nuevo servidor.

**Endpoint:** `POST /servers`

**Parámetros:**
- `name` (string, requerido)
- `ip` (string, requerido): IP o hostname
- `port` (integer, opcional): Puerto SSH (default: 22)
- `user` (string, opcional): Usuario SSH (default: root)

**READ_ONLY:** ✗ Bloqueado

---

### 8.4 update_server
**Descripción:** Actualiza información de un servidor.

**Endpoint:** `PATCH /servers/{uuid}`

**Parámetros:**
- `uuid` (string, requerido)
- `name` (string, opcional)
- `ip` (string, opcional)

**READ_ONLY:** ✗ Bloqueado

---

### 8.5 delete_server
**Descripción:** Elimina un servidor de Coolify.

**Endpoint:** `DELETE /servers/{uuid}`

**Parámetros:**
- `uuid` (string, requerido)

**READ_ONLY:** ✗ Bloqueado

---

### 8.6 validate_server
**Descripción:** Valida conectividad con un servidor.

**Endpoint:** `GET /servers/{uuid}/validate`

**Parámetros:**
- `uuid` (string, requerido)

**Respuesta esperada:**
```json
{
  "status": "ok",
  "message": "Server is reachable and configured correctly"
}
```

**READ_ONLY:** ✓ Permitido

---

### 8.7 get_server_resources
**Descripción:** Obtiene información de recursos (CPU, RAM, disco) de un servidor.

**Endpoint:** `GET /servers/{uuid}/resources`

**Parámetros:**
- `uuid` (string, requerido)

**Respuesta esperada:**
```json
{
  "cpu_usage_percent": 45.2,
  "memory_usage_percent": 62.8,
  "disk_usage_percent": 75.3,
  "disk_free_gb": 250,
  "uptime_hours": 1240
}
```

**READ_ONLY:** ✓ Permitido

---

### 8.8 get_server_domains
**Descripción:** Lista todos los dominios asignados a un servidor.

**Endpoint:** `GET /servers/{uuid}/domains`

**Parámetros:**
- `uuid` (string, requerido)

**Respuesta esperada:**
```json
[
  {
    "domain": "app.example.com",
    "application_uuid": "app-uuid-1",
    "certificate_status": "valid"
  }
]
```

**READ_ONLY:** ✓ Permitido

---

## 9. CATEGORÍA: Resources (Recursos Globales)

### 9.1 list_resources
**Descripción:** Lista todos los recursos (aplicaciones, BDs, servicios) del equipo.

**Endpoint:** `GET /resources`

**Parámetros:** Ninguno

**Respuesta esperada:**
```json
{
  "applications": [...],
  "databases": [...],
  "services": [...]
}
```

**READ_ONLY:** ✓ Permitido

---

## 10. CATEGORÍA: Private Keys (Claves SSH Privadas)

### 10.1 list_private_keys
**Descripción:** Lista claves SSH privadas configuradas.

**Endpoint:** `GET /private-keys`

**Parámetros:** Ninguno

**Respuesta esperada:**
```json
[
  {
    "uuid": "key-uuid-1",
    "name": "deploy-key-github",
    "fingerprint": "SHA256:...",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

**READ_ONLY:** ✓ Permitido

**Nota:** No devuelve la clave privada en sí

---

### 10.2 get_private_key_by_uuid
**Descripción:** Obtiene metadatos de una clave privada.

**Endpoint:** `GET /private-keys/{uuid}`

**Parámetros:**
- `uuid` (string, requerido)

**READ_ONLY:** ✓ Permitido

**Nota:** No devuelve la clave privada completa

---

### 10.3 create_private_key
**Descripción:** Crea/importa una nueva clave SSH privada.

**Endpoint:** `POST /private-keys`

**Parámetros:**
- `name` (string, requerido)
- `private_key` (string, requerido): Contenido de la clave

**Respuesta esperada:**
```json
{
  "uuid": "key-uuid-nuevo",
  "name": "deploy-key-new",
  "fingerprint": "SHA256:..."
}
```

**READ_ONLY:** ✗ Bloqueado

**Nota:** Requiere confirmación - operación sensible

---

### 10.4 update_private_key
**Descripción:** Actualiza nombre/descripción de una clave.

**Endpoint:** `PATCH /private-keys/{uuid}`

**Parámetros:**
- `uuid` (string, requerido)
- `name` (string, opcional)

**READ_ONLY:** ✗ Bloqueado

---

### 10.5 delete_private_key
**Descripción:** Elimina una clave privada.

**Endpoint:** `DELETE /private-keys/{uuid}`

**Parámetros:**
- `uuid` (string, requerido)

**READ_ONLY:** ✗ Bloqueado

---

## 11. CATEGORÍA: GitHub Apps (Integraciones GitHub)

### 11.1 list_github_apps
**Descripción:** Lista GitHub Apps configuradas.

**Endpoint:** `GET /github-apps`

**Parámetros:** Ninguno

**Respuesta esperada:**
```json
[
  {
    "uuid": "github-app-uuid-1",
    "name": "My GitHub App",
    "app_id": "123456"
  }
]
```

**READ_ONLY:** ✓ Permitido

---

### 11.2 get_github_app_by_uuid
**Descripción:** Obtiene detalles de una GitHub App.

**Endpoint:** `GET /github-apps/{uuid}`

**Parámetros:**
- `uuid` (string, requerido)

**READ_ONLY:** ✓ Permitido

---

### 11.3 create_github_app
**Descripción:** Configura una nueva GitHub App.

**Endpoint:** `POST /github-apps`

**Parámetros:**
- `name` (string, requerido)
- `app_id` (string, requerido)
- `webhook_secret` (string, requerido)
- `private_key` (string, requerido)

**READ_ONLY:** ✗ Bloqueado

---

### 11.4 update_github_app
**Descripción:** Actualiza configuración de GitHub App.

**Endpoint:** `PATCH /github-apps/{uuid}`

**Parámetros:**
- `uuid` (string, requerido)
- `name` (string, opcional)

**READ_ONLY:** ✗ Bloqueado

---

### 11.5 delete_github_app
**Descripción:** Elimina una GitHub App.

**Endpoint:** `DELETE /github-apps/{uuid}`

**Parámetros:**
- `uuid` (string, requerido)

**READ_ONLY:** ✗ Bloqueado

---

### 11.6 list_github_app_repositories
**Descripción:** Lista repositorios accesibles desde una GitHub App.

**Endpoint:** `GET /github-apps/{uuid}/repositories`

**Parámetros:**
- `uuid` (string, requerido): UUID de la GitHub App

**Respuesta esperada:**
```json
[
  {
    "full_name": "usuario/repo",
    "url": "https://github.com/usuario/repo"
  }
]
```

**READ_ONLY:** ✓ Permitido

---

### 11.7 list_github_app_repository_branches
**Descripción:** Lista ramas de un repositorio accesible desde GitHub App.

**Endpoint:** `GET /github-apps/{uuid}/repositories/{repository}/branches`

**Parámetros:**
- `uuid` (string, requerido)
- `repository` (string, requerido): Nombre del repo (usuario/repo)

**Respuesta esperada:**
```json
[
  {
    "name": "main",
    "commit_sha": "abc123...",
    "protected": true
  }
]
```

**READ_ONLY:** ✓ Permitido

---

## 12. CATEGORÍA: Cloud Tokens (Tokens de Proveedores Cloud)

### 12.1 list_cloud_tokens
**Descripción:** Lista tokens cloud configurados (Hetzner, etc).

**Endpoint:** `GET /cloud-tokens`

**Parámetros:** Ninguno

**Respuesta esperada:**
```json
[
  {
    "uuid": "token-uuid-1",
    "provider": "hetzner",
    "name": "Hetzner Prod",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

**READ_ONLY:** ✓ Permitido

**Nota:** No devuelve el token en sí

---

### 12.2 get_cloud_token_by_uuid
**Descripción:** Obtiene detalles de un token cloud.

**Endpoint:** `GET /cloud-tokens/{uuid}`

**Parámetros:**
- `uuid` (string, requerido)

**READ_ONLY:** ✓ Permitido

---

### 12.3 create_cloud_token
**Descripción:** Añade un nuevo token cloud.

**Endpoint:** `POST /cloud-tokens`

**Parámetros:**
- `provider` (string, requerido): hetzner, digitalocean, etc
- `name` (string, requerido)
- `token` (string, requerido): Token del proveedor

**READ_ONLY:** ✗ Bloqueado

**Nota:** Requiere confirmación - operación sensible

---

### 12.4 update_cloud_token
**Descripción:** Actualiza un token cloud.

**Endpoint:** `PATCH /cloud-tokens/{uuid}`

**Parámetros:**
- `uuid` (string, requerido)
- `name` (string, opcional)
- `token` (string, opcional)

**READ_ONLY:** ✗ Bloqueado

---

### 12.5 delete_cloud_token
**Descripción:** Elimina un token cloud.

**Endpoint:** `DELETE /cloud-tokens/{uuid}`

**Parámetros:**
- `uuid` (string, requerido)

**READ_ONLY:** ✗ Bloqueado

---

### 12.6 validate_cloud_token
**Descripción:** Valida que un token cloud sea válido.

**Endpoint:** `POST /cloud-tokens/{uuid}/validate`

**Parámetros:**
- `uuid` (string, requerido)

**Respuesta esperada:**
```json
{
  "valid": true,
  "message": "Token is valid"
}
```

**READ_ONLY:** ✓ Permitido

---

## 13. CATEGORÍA: Hetzner (Específico de Hetzner)

### 13.1 list_hetzner_locations
**Descripción:** Lista localizaciones de servidores disponibles en Hetzner.

**Endpoint:** `GET /hetzner/locations`

**Parámetros:** Ninguno

**Respuesta esperada:**
```json
[
  {
    "id": 1,
    "name": "Falkenstein DC Park 1",
    "code": "fsn1",
    "country": "DE"
  }
]
```

**READ_ONLY:** ✓ Permitido

---

### 13.2 list_hetzner_server_types
**Descripción:** Lista tipos de servidor disponibles en Hetzner.

**Endpoint:** `GET /hetzner/server-types`

**Parámetros:** Ninguno

**Respuesta esperada:**
```json
[
  {
    "id": 1,
    "name": "cx11",
    "cpu": 1,
    "memory_gb": 1,
    "disk_gb": 25,
    "price_per_month": 4.9
  }
]
```

**READ_ONLY:** ✓ Permitido

---

### 13.3 list_hetzner_images
**Descripción:** Lista imágenes de SO disponibles en Hetzner.

**Endpoint:** `GET /hetzner/images`

**Parámetros:** Ninguno

**Respuesta esperada:**
```json
[
  {
    "id": 1,
    "name": "ubuntu-22.04",
    "type": "system",
    "status": "available"
  }
]
```

**READ_ONLY:** ✓ Permitido

---

### 13.4 list_hetzner_ssh_keys
**Descripción:** Lista claves SSH configuradas en Hetzner.

**Endpoint:** `GET /hetzner/ssh-keys`

**Parámetros:** Ninguno

**Respuesta esperada:**
```json
[
  {
    "id": 123,
    "name": "my-key",
    "public_key": "ssh-rsa AAAA..."
  }
]
```

**READ_ONLY:** ✓ Permitido

---

### 13.5 create_hetzner_server
**Descripción:** Crea un nuevo servidor en Hetzner.

**Endpoint:** `POST /hetzner/servers`

**Parámetros:**
- `cloud_token_uuid` (string, requerido): Token Hetzner
- `name` (string, requerido): Nombre del servidor
- `location_id` (integer, requerido): ID de localización
- `server_type_id` (integer, requerido): ID de tipo
- `image_id` (integer, requerido): ID de imagen
- `ssh_key_ids` (array, requerido): IDs de claves SSH

**Respuesta esperada:**
```json
{
  "server_id": 12345,
  "name": "new-server",
  "public_ip": "192.0.2.1",
  "status": "initializing"
}
```

**READ_ONLY:** ✗ Bloqueado

**Nota:** Requiere confirmación crítica - costo financiero

---

## Resumen de Cambios por Modo READ_ONLY

### Permitidos (✓) en READ_ONLY
- Todos los `GET` / listados
- Validaciones (validate_server, validate_cloud_token)
- Consultas de logs, estado, configuración

### Bloqueados (✗) en READ_ONLY
- Todas operaciones POST (crear)
- Todas operaciones PATCH (actualizar)
- Todas operaciones DELETE (eliminar)
- Todas operaciones start/stop/restart
- Todos los despliegues

---

## Tabla Rápida de Tools por Categoría

| Categoría | Tools | READ_ONLY Priority |
|---|---|---|
| Default | 4 | Alta |
| Teams | 4 | Alta |
| Projects | 9 | Alta |
| Applications | 19 | Alta (lectura) / Baja (escritura) |
| Deployments | 5 | Alta (lectura) / Baja (ejecución) |
| Databases | 21 | Alta (lectura) / Baja (gestión) |
| Services | 13 | Media |
| Servers | 8 | Alta |
| Resources | 1 | Alta |
| Private Keys | 5 | Media (sensible) |
| GitHub Apps | 7 | Media |
| Cloud Tokens | 6 | Media (sensible) |
| Hetzner | 5 | Media |
| **TOTAL** | **~107 tools** | - |
