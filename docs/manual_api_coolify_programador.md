
# Manual profesional de uso de la API de Coolify

> Documento orientado a programadores para integrar aplicaciones externas, scripts de automatización, paneles internos o pruebas de disponibilidad con la API de Coolify.

Fecha de preparación: 11/05/2026  
Ámbito: Coolify v4 API Reference pública (`/docs/api-reference`)  
Base recomendada: contrastar siempre los campos exactos contra la documentación/OpenAPI de la versión instalada de Coolify.

---

## 1. Qué permite hacer la API de Coolify

La API de Coolify permite administrar de forma programática gran parte de lo que normalmente se hace desde el panel web:

- Consultar la versión y el estado de salud de Coolify.
- Listar, crear, actualizar y eliminar proyectos.
- Gestionar entornos de proyecto.
- Listar recursos.
- Gestionar aplicaciones.
- Crear aplicaciones desde repositorios públicos, repositorios privados, GitHub App, Deploy Key, Dockerfile, Docker Image o Docker Compose.
- Gestionar variables de entorno de aplicaciones y servicios.
- Arrancar, parar y reiniciar aplicaciones, bases de datos y servicios.
- Consultar logs de aplicaciones.
- Lanzar despliegues.
- Consultar y cancelar despliegues.
- Gestionar bases de datos.
- Crear bases de datos PostgreSQL, MariaDB, MySQL, MongoDB, Redis, DragonFly, KeyDB y ClickHouse.
- Gestionar backups y ejecuciones de backup.
- Gestionar servicios one-click.
- Gestionar servidores conectados a Coolify.
- Validar servidores.
- Consultar dominios y recursos por servidor.
- Gestionar claves privadas SSH.
- Gestionar GitHub Apps.
- Cargar repositorios y ramas desde GitHub Apps.
- Gestionar tokens cloud, por ejemplo Hetzner.
- Consultar datos auxiliares de Hetzner: localizaciones, tipos de servidor, imágenes y claves SSH.
- Consultar equipos y miembros.

---

## 2. URL base de la API

Según la documentación oficial, el acceso base se realiza sobre:

```text
http://<ip>:8000/api
```

La mayoría de endpoints están prefijados con:

```text
/api/v1
```

Por tanto, la URL base habitual será:

```text
http://<ip>:8000/api/v1
```

Ejemplo:

```bash
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
  http://<ip>:8000/api/v1/version
```

Si Coolify está detrás de un dominio o reverse proxy con HTTPS, la base será algo similar a:

```text
https://coolify.midominio.com/api/v1
```

Recomendación para el programador:

```env
COOLIFY_BASE_URL=https://coolify.midominio.com/api/v1
COOLIFY_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 3. Autenticación

La API usa token Bearer en la cabecera HTTP `Authorization`.

Formato:

```http
Authorization: Bearer <TOKEN>
```

Ejemplo:

```bash
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
  "$COOLIFY_BASE_URL/version"
```

### 3.1. Cómo generar el token

Desde la interfaz de Coolify:

1. Entrar en `Keys & Tokens`.
2. Ir a `API tokens`.
3. Crear un nuevo token.
4. Copiarlo inmediatamente, porque normalmente se muestra una sola vez.

### 3.2. Alcance del token

El token está ligado al equipo desde el que se crea. Eso significa que solo podrá ver o modificar recursos pertenecientes a ese equipo.

Esto es importante si Coolify se usa con varios equipos o clientes.

### 3.3. Permisos habituales

La documentación describe permisos como:

| Permiso | Uso |
|---|---|
| `read-only` | Solo lectura. No permite crear, modificar ni eliminar recursos. Tampoco muestra datos sensibles. |
| `read:sensitive` | Solo lectura, pero permite ver información sensible que normalmente estaría censurada. |
| `view:sensitive` | Permite que contraseñas, API keys y otros datos sensibles no aparezcan redactados en las respuestas. |
| `*` | Acceso completo a recursos y datos sensibles. |

Recomendación profesional:

- Para monitorización: usar `read-only`.
- Para inventario interno: usar `read-only`, o `read:sensitive` solo si de verdad se necesitan secretos.
- Para automatización de despliegues: usar permisos de escritura, idealmente limitados al equipo/proyecto correcto.
- Para scripts CI/CD: guardar el token en el gestor de secretos de la plataforma, nunca en el repositorio.
- Para pruebas destructivas: usar un token distinto y un entorno de staging.

---

## 4. Cabeceras recomendadas

Para peticiones `GET`:

```http
Authorization: Bearer <TOKEN>
Accept: application/json
```

Para `POST`, `PATCH` o `DELETE` con cuerpo JSON:

```http
Authorization: Bearer <TOKEN>
Accept: application/json
Content-Type: application/json
```

Ejemplo:

```bash
curl -X PATCH "$COOLIFY_BASE_URL/projects/$PROJECT_UUID" \
  -H "Authorization: Bearer $COOLIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "Nuevo nombre",
    "description": "Descripción actualizada"
  }'
```

---

## 5. Códigos HTTP que debe manejar el programador

La API devuelve códigos HTTP estándar. El programador debe tratarlos de forma explícita.

| Código | Significado probable | Acción recomendada |
|---:|---|---|
| `200` | Operación correcta. | Procesar respuesta. |
| `201` | Recurso creado o actualizado correctamente. | Guardar `uuid` devuelto. |
| `400` | Petición incorrecta. | Revisar formato, parámetros o endpoint. |
| `401` | Token ausente, inválido o sin autorización. | Revisar `Authorization: Bearer`. |
| `404` | Recurso no encontrado. | Revisar UUID, equipo o permisos. |
| `422` | Error de validación. | Mostrar errores de campos al operador/desarrollador. |

Recomendación: guardar en logs el método, endpoint, código de estado, `request_id` si existiera, y cuerpo de error sin exponer secretos.

---

## 6. Estructura conceptual de Coolify

Antes de usar la API conviene entender estas entidades:

```text
Team
└── Project
    └── Environment
        ├── Application
        ├── Database
        └── Service

Server
├── Resources
├── Domains
└── Destinations / Docker networks / proxy
```

### Conceptos clave

- **Team**: ámbito de permisos. El token pertenece a un equipo.
- **Project**: agrupación lógica.
- **Environment**: entorno dentro de un proyecto, por ejemplo `production`, `staging`, `development`.
- **Application**: aplicación desplegable, normalmente desde Git, Dockerfile, imagen Docker o Compose.
- **Database**: base de datos gestionada por Coolify.
- **Service**: servicio one-click o stack predefinido.
- **Server**: servidor físico, VPS o máquina conectada por SSH a Coolify.
- **UUID**: identificador principal para operar contra recursos.

---

## 7. Endpoints Default

### 7.1. Versión

```http
GET /version
```

Sirve para comprobar la versión de Coolify.

Ejemplo:

```bash
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
  "$COOLIFY_BASE_URL/version"
```

Uso recomendado:

- Verificar conectividad.
- Registrar versión para soporte.
- Comprobar compatibilidad antes de ejecutar automatizaciones.

### 7.2. Healthcheck

```http
GET /health
```

Sirve para comprobar si la API está viva.

Ejemplo:

```bash
curl "$COOLIFY_BASE_URL/../health"
```

Nota: la documentación indica excepciones de prefijo para `/health` y `/feedback`. Por eso conviene probar si en tu instalación responde bajo `/api/health`, `/api/v1/health` o la ruta publicada por tu reverse proxy.

### 7.3. Enable API

```http
GET /enable-api
```

Activa la API.

### 7.4. Disable API

```http
GET /disable-api
```

Desactiva la API.

Recomendación: proteger estos endpoints especialmente. No deberían estar disponibles para automatizaciones genéricas salvo necesidad clara.

---

## 8. Projects

Los proyectos son la agrupación principal donde se organizan entornos, aplicaciones, bases de datos y servicios.

### Endpoints

```http
GET    /projects
POST   /projects
GET    /projects/{uuid}
PATCH  /projects/{uuid}
DELETE /projects/{uuid}
GET    /projects/{uuid}/{environment_name_or_uuid}
GET    /projects/{uuid}/environments
POST   /projects/{uuid}/environments
DELETE /projects/{uuid}/environments/{environment_name_or_uuid}
```

### Operaciones típicas

#### Listar proyectos

```bash
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
  "$COOLIFY_BASE_URL/projects"
```

#### Crear proyecto

```bash
curl -X POST "$COOLIFY_BASE_URL/projects" \
  -H "Authorization: Bearer $COOLIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Landing Mundial 2026",
    "description": "Proyecto de landing de votación"
  }'
```

#### Actualizar proyecto

```bash
curl -X PATCH "$COOLIFY_BASE_URL/projects/$PROJECT_UUID" \
  -H "Authorization: Bearer $COOLIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Landing Mundial 2026",
    "description": "Descripción actualizada"
  }'
```

#### Obtener entorno por nombre o UUID

```bash
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
  "$COOLIFY_BASE_URL/projects/$PROJECT_UUID/production"
```

---

## 9. Applications

Las aplicaciones representan software desplegado por Coolify. Pueden crearse de varias formas.

### Endpoints principales

```http
GET    /applications
POST   /applications/public
POST   /applications/private-github-app
POST   /applications/private-deploy-key
POST   /applications/dockerfile
POST   /applications/dockerimage
POST   /applications/dockercompose
GET    /applications/{uuid}
PATCH  /applications/{uuid}
DELETE /applications/{uuid}

GET    /applications/{uuid}/logs

GET    /applications/{uuid}/envs
POST   /applications/{uuid}/envs
PATCH  /applications/{uuid}/envs
PATCH  /applications/{uuid}/envs/bulk
DELETE /applications/{uuid}/envs/{env_uuid}

GET    /applications/{uuid}/start
GET    /applications/{uuid}/stop
GET    /applications/{uuid}/restart
```

> Los nombres exactos de algunos endpoints pueden variar ligeramente según versión. Validar contra la API Reference/OpenAPI de la instalación.

### 9.1. Listar aplicaciones

```bash
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
  "$COOLIFY_BASE_URL/applications"
```

Puede admitir filtro por etiqueta:

```bash
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
  "$COOLIFY_BASE_URL/applications?tag=produccion"
```

### 9.2. Obtener una aplicación

```bash
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
  "$COOLIFY_BASE_URL/applications/$APPLICATION_UUID"
```

Campos habituales de interés:

- `uuid`
- `name`
- `fqdn`
- `git_repository`
- `git_branch`
- `build_pack`
- `ports_exposes`
- `ports_mappings`
- `install_command`
- `build_command`
- `start_command`
- `base_directory`
- `publish_directory`
- `health_check_*`
- `created_at`
- `updated_at`

### 9.3. Crear aplicación desde repositorio público

```http
POST /applications/public
```

Ejemplo orientativo:

```bash
curl -X POST "$COOLIFY_BASE_URL/applications/public" \
  -H "Authorization: Bearer $COOLIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project_uuid": "PROJECT_UUID",
    "server_uuid": "SERVER_UUID",
    "environment_name": "production",
    "git_repository": "https://github.com/usuario/repositorio",
    "git_branch": "main",
    "build_pack": "nixpacks",
    "name": "mi-app",
    "domains": "https://mi-app.midominio.com",
    "is_auto_deploy_enabled": true,
    "is_force_https_enabled": true,
    "install_command": "pnpm install",
    "build_command": "pnpm build",
    "start_command": "pnpm start",
    "ports_exposes": "3000"
  }'
```

### 9.4. Crear aplicación Docker Compose

```http
POST /applications/dockercompose
```

Útil cuando el recurso se define con un `docker-compose.yml`.

Recomendaciones:

- Guardar el compose en el repositorio si se quiere trazabilidad.
- Usar variables de entorno gestionadas por Coolify para secretos.
- No incluir contraseñas en el compose.
- Definir healthchecks si la imagen lo permite.
- Evitar publicar puertos innecesarios al exterior.

### 9.5. Crear aplicación desde Docker Image

```http
POST /applications/dockerimage
```

Útil para desplegar una imagen ya construida, por ejemplo:

```text
registry.example.com/mi-app:1.2.3
```

Uso recomendado:

- CI construye la imagen.
- CI la sube al registry.
- CI llama a Coolify para actualizar/desplegar.

### 9.6. Actualizar aplicación

```http
PATCH /applications/{uuid}
```

Ejemplo:

```bash
curl -X PATCH "$COOLIFY_BASE_URL/applications/$APPLICATION_UUID" \
  -H "Authorization: Bearer $COOLIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "domains": "https://nuevo-dominio.midominio.com",
    "is_force_https_enabled": true,
    "ports_exposes": "3000"
  }'
```

Importante: en respuestas de lectura puede aparecer `fqdn`, pero en escritura la documentación usa normalmente `domains` para dominios/URLs de la aplicación. No conviene hacer un `GET` y reenviar el JSON entero tal cual por `PATCH`; es mejor construir un payload mínimo con solo los campos permitidos.

### 9.7. Logs de aplicación

```http
GET /applications/{uuid}/logs
```

Ejemplo:

```bash
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
  "$COOLIFY_BASE_URL/applications/$APPLICATION_UUID/logs"
```

Uso recomendado:

- Diagnóstico tras despliegue.
- Monitorización básica.
- Integración con panel interno de soporte.

### 9.8. Variables de entorno de aplicación

Operaciones:

```http
GET    /applications/{uuid}/envs
POST   /applications/{uuid}/envs
PATCH  /applications/{uuid}/envs
PATCH  /applications/{uuid}/envs/bulk
DELETE /applications/{uuid}/envs/{env_uuid}
```

Ejemplo conceptual para crear variable:

```bash
curl -X POST "$COOLIFY_BASE_URL/applications/$APPLICATION_UUID/envs" \
  -H "Authorization: Bearer $COOLIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "NODE_ENV",
    "value": "production",
    "is_build_time": false,
    "is_preview": false
  }'
```

Buenas prácticas:

- No escribir secretos en logs.
- Evitar guardar `.env` en repositorios.
- Después de cambiar variables críticas, lanzar redeploy/restart según corresponda.
- Diferenciar variables de build y runtime.
- Usar bulk update para sincronizaciones masivas.

### 9.9. Start / Stop / Restart

```http
GET /applications/{uuid}/start
GET /applications/{uuid}/stop
GET /applications/{uuid}/restart
```

Ejemplo:

```bash
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
  "$COOLIFY_BASE_URL/applications/$APPLICATION_UUID/restart"
```

Nota: aunque semánticamente estas operaciones modifican estado, en la API aparecen como `GET`. El programador debe tratarlas como operaciones con efecto lateral, no como consultas cacheables.

---

## 10. Deployments

Permite consultar, lanzar y cancelar despliegues.

### Endpoints

```http
GET  /deployments
GET  /deployments/{uuid}
POST /deployments/{uuid}/cancel
GET  /deploy
GET  /applications/{uuid}/deployments
```

El endpoint de despliegue puede trabajar por tag o UUID según la documentación.

### Casos de uso

- Lanzar despliegue desde CI/CD.
- Consultar estado de despliegue.
- Mostrar histórico de despliegues por aplicación.
- Cancelar un despliegue atascado.

### Ejemplo conceptual de despliegue

```bash
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
  "$COOLIFY_BASE_URL/deploy?uuid=$APPLICATION_UUID"
```

Recomendación:

- Tras llamar a deploy, consultar deployments hasta ver estado final.
- Implementar timeout.
- Registrar logs.
- No lanzar despliegues concurrentes sobre el mismo recurso salvo que Coolify lo soporte explícitamente en tu versión.

---

## 11. Databases

Permite gestionar bases de datos y backups.

### Endpoints principales

```http
GET    /databases
GET    /databases/{uuid}
PATCH  /databases/{uuid}
DELETE /databases/{uuid}

POST   /databases/postgresql
POST   /databases/clickhouse
POST   /databases/dragonfly
POST   /databases/redis
POST   /databases/keydb
POST   /databases/mariadb
POST   /databases/mysql
POST   /databases/mongodb

GET    /databases/{uuid}/start
GET    /databases/{uuid}/stop
GET    /databases/{uuid}/restart

GET    /databases/{uuid}/backups
POST   /databases/{uuid}/backups
PATCH  /databases/{uuid}/backups
DELETE /databases/backups/{uuid}
GET    /databases/backup-executions
DELETE /databases/backup-executions/{uuid}
```

### Casos de uso

- Crear una base de datos asociada a un proyecto/entorno.
- Inventariar bases existentes.
- Parar/reiniciar bases de datos.
- Crear configuración de backup.
- Consultar ejecuciones de backup.
- Limpiar ejecuciones antiguas.

### Ejemplo conceptual: crear MariaDB

```bash
curl -X POST "$COOLIFY_BASE_URL/databases/mariadb" \
  -H "Authorization: Bearer $COOLIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project_uuid": "PROJECT_UUID",
    "server_uuid": "SERVER_UUID",
    "environment_name": "production",
    "name": "mariadb-produccion",
    "description": "Base de datos principal"
  }'
```

Los campos exactos dependen del tipo de base de datos y de la versión de Coolify. Validar siempre el schema del endpoint concreto.

### Recomendaciones para bases de datos

- No automatizar `DELETE` sin doble confirmación.
- Antes de actualizar/parar una base de datos, comprobar si hay backups recientes.
- Mantener credenciales fuera del código.
- No mostrar respuestas sensibles en interfaces accesibles a usuarios no administradores.
- Distinguir entre backups configurados y ejecuciones de backup.

---

## 12. Services

Los servicios son plantillas o stacks predefinidos, por ejemplo WordPress, Gitea, Plausible, etc.

### Endpoints

```http
GET    /services
POST   /services
GET    /services/{uuid}
PATCH  /services/{uuid}
DELETE /services/{uuid}

GET    /services/{uuid}/envs
POST   /services/{uuid}/envs
PATCH  /services/{uuid}/envs
PATCH  /services/{uuid}/envs/bulk
DELETE /services/{uuid}/envs/{env_uuid}

GET    /services/{uuid}/start
GET    /services/{uuid}/stop
GET    /services/{uuid}/restart
```

### Crear servicio

```bash
curl -X POST "$COOLIFY_BASE_URL/services" \
  -H "Authorization: Bearer $COOLIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "server_uuid": "SERVER_UUID",
    "project_uuid": "PROJECT_UUID",
    "environment_name": "production",
    "type": "wordpress-with-mysql",
    "name": "wordpress-cliente"
  }'
```

### Recomendaciones

- Confirmar los `type` soportados por la versión instalada.
- En servicios con varias partes internas, revisar cómo se exponen dominios/URLs.
- Probar creación de servicio en staging antes de automatizar producción.
- Verificar que el endpoint acepta exactamente los campos documentados en tu versión.

---

## 13. Servers

Los servidores son las máquinas donde Coolify despliega recursos.

### Endpoints

```http
GET    /servers
POST   /servers
GET    /servers/{uuid}
PATCH  /servers/{uuid}
DELETE /servers/{uuid}

GET    /servers/{uuid}/resources
GET    /servers/{uuid}/domains
GET    /servers/{uuid}/validate
```

### Listar servidores

```bash
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
  "$COOLIFY_BASE_URL/servers"
```

### Obtener recursos por servidor

```bash
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
  "$COOLIFY_BASE_URL/servers/$SERVER_UUID/resources"
```

### Validar servidor

```bash
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
  "$COOLIFY_BASE_URL/servers/$SERVER_UUID/validate"
```

### Recomendaciones

- Usar validación tras alta o cambios de SSH.
- Revisar dominios por servidor antes de automatizar DNS o certificados.
- No eliminar servidores desde scripts salvo procedimientos muy controlados.
- En inventario, relacionar servidor → recursos → dominios → estado.

---

## 14. Resources

### Endpoint

```http
GET /resources
```

Sirve para listar recursos visibles para el token/equipo.

Ejemplo:

```bash
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
  "$COOLIFY_BASE_URL/resources"
```

Uso recomendado:

- Inventario global.
- Panel interno de recursos.
- Validación antes de despliegues.
- Búsqueda de UUIDs.

---

## 15. Private Keys

Permite gestionar claves privadas SSH usadas por Coolify.

### Endpoints

```http
GET    /private-keys
POST   /private-keys
PATCH  /private-keys/{uuid}
GET    /private-keys/{uuid}
DELETE /private-keys/{uuid}
```

### Recomendaciones de seguridad

- Tratar estas operaciones como altamente sensibles.
- No registrar claves privadas en logs.
- No devolver claves privadas a frontends salvo necesidad absoluta y con control de permisos.
- Rotar claves si han estado expuestas.
- Usar `read-only` para inventario normal.

---

## 16. GitHub Apps

Permite gestionar integraciones con GitHub App y cargar repositorios/ramas.

### Endpoints

```http
GET    /github-apps
POST   /github-apps
GET    /github-apps/{uuid}/repositories
GET    /github-apps/{uuid}/repositories/{repository}/branches
PATCH  /github-apps/{uuid}
DELETE /github-apps/{uuid}
```

### Casos de uso

- Listar GitHub Apps configuradas.
- Cargar repositorios disponibles.
- Cargar ramas para crear aplicaciones privadas.
- Crear o actualizar integraciones.

### Recomendaciones

- Cachear repositorios y ramas si se usan en una UI.
- Refrescar bajo demanda.
- Controlar errores de permisos de GitHub.
- No exponer tokens o claves privadas de GitHub App.

---

## 17. Cloud Tokens

Permite gestionar tokens de proveedores cloud, por ejemplo Hetzner.

### Endpoints

```http
GET    /cloud-tokens
POST   /cloud-tokens
GET    /cloud-tokens/{uuid}
PATCH  /cloud-tokens/{uuid}
DELETE /cloud-tokens/{uuid}
POST   /cloud-tokens/{uuid}/validate
```

### Crear token cloud

Ejemplo orientativo:

```bash
curl -X POST "$COOLIFY_BASE_URL/cloud-tokens" \
  -H "Authorization: Bearer $COOLIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "hetzner",
    "token": "TOKEN_DEL_PROVEEDOR",
    "name": "Hetzner Producción"
  }'
```

### Recomendaciones

- Tratar los cloud tokens como secretos críticos.
- Validar el token tras crearlo.
- No usar tokens personales si se puede usar un token de proyecto/proveedor limitado.
- Separar tokens de staging y producción.

---

## 18. Hetzner

Endpoints auxiliares para trabajar con Hetzner desde Coolify.

### Endpoints

```http
GET  /hetzner/locations
GET  /hetzner/server-types
GET  /hetzner/images
GET  /hetzner/ssh-keys
POST /hetzner/servers
```

### Casos de uso

- Consultar localizaciones disponibles.
- Consultar tipos de servidor.
- Consultar imágenes.
- Consultar claves SSH.
- Crear servidor Hetzner.

### Recomendaciones

- Antes de crear servidores, mostrar resumen al operador: ubicación, imagen, tipo, coste estimado si lo tienes de otra fuente, nombre y clave SSH.
- Registrar UUID o ID devuelto.
- Validar servidor en Coolify después de crearlo.
- No automatizar creación masiva sin límites de seguridad.

---

## 19. Teams

Permite consultar equipos y miembros.

### Endpoints

```http
GET /teams
GET /teams/{id}
GET /teams/{id}/members
GET /teams/current
GET /teams/current/members
```

### Usos

- Saber contra qué equipo está trabajando el token.
- Mostrar miembros.
- Diagnosticar por qué un token no ve determinados recursos.
- Validar aislamiento entre equipos.

---

## 20. Flujo recomendado para crear y desplegar una aplicación

Flujo profesional típico:

1. Verificar API:

```bash
curl -H "Authorization: Bearer $COOLIFY_TOKEN" "$COOLIFY_BASE_URL/version"
```

2. Obtener equipo actual:

```bash
curl -H "Authorization: Bearer $COOLIFY_TOKEN" "$COOLIFY_BASE_URL/teams/current"
```

3. Listar servidores:

```bash
curl -H "Authorization: Bearer $COOLIFY_TOKEN" "$COOLIFY_BASE_URL/servers"
```

4. Listar proyectos:

```bash
curl -H "Authorization: Bearer $COOLIFY_TOKEN" "$COOLIFY_BASE_URL/projects"
```

5. Obtener o crear entorno:

```bash
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
  "$COOLIFY_BASE_URL/projects/$PROJECT_UUID/production"
```

6. Crear aplicación:

```bash
curl -X POST "$COOLIFY_BASE_URL/applications/public" \
  -H "Authorization: Bearer $COOLIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project_uuid": "PROJECT_UUID",
    "server_uuid": "SERVER_UUID",
    "environment_name": "production",
    "git_repository": "https://github.com/usuario/repositorio",
    "git_branch": "main",
    "build_pack": "nixpacks",
    "name": "mi-app",
    "domains": "https://mi-app.midominio.com",
    "is_force_https_enabled": true
  }'
```

7. Crear variables de entorno.

8. Lanzar despliegue.

9. Consultar deployments.

10. Consultar logs.

11. Validar dominio/healthcheck externo.

---

## 21. Ejemplo de cliente TypeScript

Ejemplo sencillo usando `fetch`.

```ts
type CoolifyClientOptions = {
  baseUrl: string;
  token: string;
};

export class CoolifyClient {
  private baseUrl: string;
  private token: string;

  constructor(options: CoolifyClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.token = options.token;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${this.token}`);
    headers.set("Accept", "application/json");

    if (options.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    const contentType = response.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");

    const payload = isJson
      ? await response.json().catch(() => null)
      : await response.text().catch(() => "");

    if (!response.ok) {
      throw new Error(
        `Coolify API error ${response.status} ${response.statusText}: ` +
        `${typeof payload === "string" ? payload : JSON.stringify(payload)}`
      );
    }

    return payload as T;
  }

  getVersion(): Promise<string> {
    return this.request<string>("/version");
  }

  listProjects(): Promise<unknown[]> {
    return this.request<unknown[]>("/projects");
  }

  getApplication(uuid: string): Promise<unknown> {
    return this.request<unknown>(`/applications/${encodeURIComponent(uuid)}`);
  }

  restartApplication(uuid: string): Promise<unknown> {
    return this.request<unknown>(
      `/applications/${encodeURIComponent(uuid)}/restart`
    );
  }

  updateProject(
    uuid: string,
    data: { name?: string; description?: string }
  ): Promise<unknown> {
    return this.request<unknown>(`/projects/${encodeURIComponent(uuid)}`, {
      method: "PATCH",
      body: JSON.stringify(data)
    });
  }
}
```

Uso:

```ts
const coolify = new CoolifyClient({
  baseUrl: process.env.COOLIFY_BASE_URL!,
  token: process.env.COOLIFY_TOKEN!
});

const version = await coolify.getVersion();
console.log(version);
```

---

## 22. Ejemplo de script Bash para disponibilidad

```bash
#!/usr/bin/env bash
set -euo pipefail

: "${COOLIFY_BASE_URL:?Falta COOLIFY_BASE_URL}"
: "${COOLIFY_TOKEN:?Falta COOLIFY_TOKEN}"

status_code="$(
  curl -sS -o /tmp/coolify_version.out -w "%{http_code}" \
    -H "Authorization: Bearer $COOLIFY_TOKEN" \
    "$COOLIFY_BASE_URL/version"
)"

if [[ "$status_code" == "200" ]]; then
  echo "OK - Coolify API disponible. Versión: $(cat /tmp/coolify_version.out)"
  exit 0
fi

echo "CRITICAL - Coolify API respondió HTTP $status_code"
cat /tmp/coolify_version.out
exit 2
```

---

## 23. Recomendaciones de seguridad

### 23.1. No exponer la API públicamente sin control

Si Coolify está detrás de un dominio público:

- Usar HTTPS.
- Restringir acceso por IP si es posible.
- Proteger con firewall.
- Considerar VPN para administración.
- No publicar tokens en frontend.
- No hacer llamadas directas desde navegador con el token real.

### 23.2. Backend intermedio

Para una aplicación interna, lo recomendable es:

```text
Frontend interno
    ↓
Backend propio
    ↓
Coolify API
```

El token de Coolify debe estar solo en el backend.

### 23.3. Auditoría

Registrar:

- Usuario interno que solicitó la acción.
- Acción ejecutada.
- Recurso afectado.
- UUID.
- Fecha/hora.
- Resultado HTTP.
- Resumen del error si falla.

No registrar:

- Tokens.
- Passwords.
- Claves privadas.
- Variables de entorno sensibles.

---

## 24. Buenas prácticas de integración

### 24.1. Usar UUIDs, no nombres

Los nombres pueden cambiar. Guardar siempre UUIDs.

### 24.2. Hacer payloads mínimos

No hacer:

```text
GET recurso → modificar campo → PATCH con todo el objeto recibido
```

Mejor:

```text
PATCH solo con los campos permitidos y necesarios
```

Esto evita errores de validación.

### 24.3. Gestionar 422 cuidadosamente

Los errores `422` suelen indicar que el endpoint no acepta un campo o que falta un dato requerido.

El programador debe mostrar algo como:

```text
Coolify rechazó la petición por validación.
Campo: domains
Motivo: formato inválido o campo no permitido.
```

### 24.4. No cachear operaciones con efecto lateral

Aunque algunos endpoints de start/stop/restart/deploy usen `GET`, deben tratarse como acciones mutantes.

No deben cachearse ni precargarse automáticamente.

### 24.5. Controlar concurrencia

Evitar:

- Dos despliegues simultáneos sobre la misma app.
- Reiniciar durante deploy.
- Cambiar variables mientras hay un despliegue activo.

### 24.6. Separar entornos

Usar entornos diferenciados:

- `production`
- `staging`
- `development`

Y tokens distintos si la organización lo requiere.

---

## 25. Inventario recomendado para una herramienta interna

Si se va a construir una herramienta propia encima de Coolify, conviene almacenar en una base de datos local:

| Entidad | Campos mínimos |
|---|---|
| Team | id, name |
| Project | uuid, name |
| Environment | uuid/name, project_uuid |
| Server | uuid, name, ip, status |
| Application | uuid, name, fqdn/domains, project_uuid, environment |
| Database | uuid, name, type, project_uuid, environment |
| Service | uuid, name, type, project_uuid, environment |
| Deployment | uuid, application_uuid, status, created_at |
| Audit log | user, action, resource_uuid, status, timestamp |

No duplicar secretos salvo necesidad extrema.

---

## 26. Casos de uso útiles para tu programador

### 26.1. Panel de disponibilidad

- `GET /version`
- `GET /health`
- `GET /servers`
- `GET /resources`
- `GET /applications`
- `GET /databases`
- `GET /services`

### 26.2. Botón de redeploy

- Validar usuario interno.
- Buscar app por UUID.
- Lanzar deploy.
- Consultar deployment.
- Mostrar logs.

### 26.3. Reinicio controlado

- Verificar app/servicio/base.
- Confirmar si es producción.
- Llamar a restart.
- Consultar estado/logs.
- Registrar auditoría.

### 26.4. Alta de aplicación desde formulario

- Seleccionar proyecto.
- Seleccionar entorno.
- Seleccionar servidor.
- Indicar repo/rama/build pack/domino.
- Crear app.
- Crear envs.
- Desplegar.
- Mostrar resultado.

### 26.5. Inventario nocturno

- Listar recursos.
- Listar aplicaciones.
- Listar bases de datos.
- Listar servicios.
- Listar dominios por servidor.
- Guardar snapshot.
- Alertar si hay cambios inesperados.

---

## 27. Checklist para entregar al programador

Antes de programar:

- [ ] Confirmar URL final de Coolify.
- [ ] Confirmar si se accede por IP, dominio o reverse proxy.
- [ ] Confirmar si la API está habilitada.
- [ ] Crear token API.
- [ ] Definir permisos mínimos del token.
- [ ] Confirmar equipo al que pertenece el token.
- [ ] Probar `GET /version`.
- [ ] Probar `GET /teams/current`.
- [ ] Probar `GET /projects`.
- [ ] Probar `GET /servers`.
- [ ] Crear entorno de staging para pruebas.
- [ ] No probar `DELETE` en producción.
- [ ] Definir logging sin secretos.
- [ ] Definir timeout y reintentos.
- [ ] Definir tratamiento de errores `401`, `404`, `422`.
- [ ] Definir auditoría.
- [ ] Documentar qué endpoints exactos se usarán en la aplicación propia.

---

## 28. Colección mínima de pruebas con curl

```bash
export COOLIFY_BASE_URL="https://coolify.midominio.com/api/v1"
export COOLIFY_TOKEN="pegar_token_aqui"
```

### Versión

```bash
curl -i -H "Authorization: Bearer $COOLIFY_TOKEN" \
  "$COOLIFY_BASE_URL/version"
```

### Equipo autenticado

```bash
curl -i -H "Authorization: Bearer $COOLIFY_TOKEN" \
  "$COOLIFY_BASE_URL/teams/current"
```

### Proyectos

```bash
curl -i -H "Authorization: Bearer $COOLIFY_TOKEN" \
  "$COOLIFY_BASE_URL/projects"
```

### Servidores

```bash
curl -i -H "Authorization: Bearer $COOLIFY_TOKEN" \
  "$COOLIFY_BASE_URL/servers"
```

### Recursos

```bash
curl -i -H "Authorization: Bearer $COOLIFY_TOKEN" \
  "$COOLIFY_BASE_URL/resources"
```

### Aplicaciones

```bash
curl -i -H "Authorization: Bearer $COOLIFY_TOKEN" \
  "$COOLIFY_BASE_URL/applications"
```

### Bases de datos

```bash
curl -i -H "Authorization: Bearer $COOLIFY_TOKEN" \
  "$COOLIFY_BASE_URL/databases"
```

### Servicios

```bash
curl -i -H "Authorization: Bearer $COOLIFY_TOKEN" \
  "$COOLIFY_BASE_URL/services"
```

---

## 29. Advertencias importantes

1. La API de Coolify evoluciona con bastante rapidez. Conviene revisar la API Reference de la versión instalada.
2. Algunos endpoints usan `GET` para acciones que cambian estado, como start/stop/restart. Tratarlos como operaciones mutantes.
3. No todos los datos sensibles se devuelven si el token no tiene permisos adecuados.
4. Un token pertenece a un equipo; si no aparecen recursos, puede ser por ámbito de equipo o permisos.
5. Evitar reenviar objetos completos obtenidos por `GET` hacia `PATCH`.
6. Probar automatizaciones primero en staging.
7. Guardar el token como secreto.
8. No llamar la API directamente desde el navegador con un token administrativo.

---

## 30. Resumen ejecutivo para el programador

Para trabajar profesionalmente con la API de Coolify:

- Usar `COOLIFY_BASE_URL=https://.../api/v1`.
- Autenticar siempre con `Authorization: Bearer <token>`.
- Crear tokens desde `Keys & Tokens / API tokens`.
- Usar permisos mínimos.
- Recordar que el token solo ve recursos de su equipo.
- Usar UUIDs para todas las operaciones.
- Manejar correctamente `401`, `404` y `422`.
- No loguear secretos.
- Hacer payloads mínimos.
- Separar staging y producción.
- Tratar start/stop/restart/deploy como operaciones peligrosas.
- Consultar siempre la API Reference de la versión instalada antes de usar campos concretos de creación/actualización.
