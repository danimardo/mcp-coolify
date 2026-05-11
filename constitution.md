# Constitution - MCP Coolify

## Propósito

**MCP Coolify** es un servidor Model Context Protocol que expone la API de Coolify como un conjunto de herramientas programables para agentes de inteligencia artificial. Su propósito es **democratizar el acceso a la infraestructura de Coolify desde agentes de IA**, permitiendo automatización inteligente, consultas complejas, diagnóstico y decisiones asistidas sin necesidad de escribir código específico.

---

## Visión

Un sistema donde:
- **Agentes de IA** pueden interactuar con Coolify de forma segura y controlada
- **Equipos de DevOps** pueden delegar tareas de inspección, diagnostico y operación controlada a agentes
- **Desarrolladores** pueden construir herramientas internas que consuman Coolify a través de MCP
- **Automatización** es posible sin exponer credenciales en aplicaciones de terceros
- **Seguridad** y **control** están garantizados mediante modos de solo lectura, validación de permisos y auditoría completa

---

## Audiencia Target

### Primarios
1. **DevOps / SRE**: Personas que gestiona infraestructura y despliegues en Coolify
2. **Desarrolladores Backend**: Quieren automatizar o inspeccionar su infraestructura desde herramientas de IA
3. **Administradores de Sistemas**: Necesitan auditoría, diagnostico y trazabilidad
4. **Equipos de Soporte Técnico**: Quieren consultar logs, estado de despliegues y recursos sin acceso directo al UI de Coolify

### Secundarios
- Agentes de IA especializados en DevOps/SRE
- Herramientas internas que necesitan comunicarse con Coolify
- Scripts de automatización que quieren usar MCP como capa intermedia

---

## Problemas que Resuelve

1. **Acceso programático seguro**: En lugar de exponer el token API en múltiples aplicaciones, se centraliza en el MCP con modo solo-lectura opcional
2. **Auditoría y logging**: Cada operación queda registrada con contexto completo (quién, qué, cuándo, resultado)
3. **Inspección inteligente**: Los agentes pueden consultar logs, estado de despliegues, variables, backups y recursos sin interfaz gráfica
4. **Prevención de cambios accidentales**: Modo `READ_ONLY` permite consultar sin riesgo de modificaciones
5. **Confirmación de operaciones peligrosas**: Operaciones que afecten a producción requieren confirmación explícita
6. **Resiliencia**: Manejo automático de reintentos, rate limiting y backoff exponencial

---

## Principios de Diseño

### 1. **Seguridad en capas**
- Token API centralizado en `.env`, nunca en aplicaciones cliente
- Modo solo-lectura para proteger contra cambios accidentales
- Validación de permisos antes de ejecutar operaciones
- Confirmación obligatoria para operaciones destructivas

### 2. **Transparencia y trazabilidad**
- Logging completo de cada llamada: endpoint, parámetros, respuesta, errores
- Contexto suficiente para debugging sin exponer secretos
- Auditoría de quién hizo qué y cuándo

### 3. **Exposición equitativa**
- Toda la API de Coolify debe ser accesible (no filtros selectivos)
- Prioridad en lectura: inspección, consultas, diagnóstico
- Secundaria: escritura y operaciones que modifican estado
- Sin excepciones arbitrarias

### 4. **Resiliencia**
- Manejo explícito de fallos transitorios
- Reintentos automáticos con backoff exponencial
- Respeto a rate limits
- Timeouts configurables

### 5. **Usabilidad para agentes**
- Descripción clara de cada tool
- Esquemas de parámetros bien definidos
- Ejemplos de uso
- Manejo de errores predecible

---

## Casos de Uso Principales

### 1. **Panel de diagnóstico inteligente**
Un agente consulta el estado completo de la infraestructura:
- Versión y health de Coolify
- Todos los servidores y sus recursos
- Todas las aplicaciones y su estado
- Logs de aplicaciones problemáticas
- Despliegues recientes y su estado

### 2. **Soporte técnico asistido**
Un agente ayuda a resolver tickets de soporte:
- "¿Por qué falló el despliegue de X?" → Consulta logs, estado, variables
- "¿Cuándo fue el último despliegue exitoso?" → Busca en histórico de despliegues
- "¿Cuáles son las variables de entorno de X?" → Inspecciona configuración

### 3. **Automatización de tareas rutinarias**
Un agente ejecuta tareas operacionales (con confirmación):
- Reiniciar una aplicación después de cambiar variables
- Ejecutar un despliegue bajo demanda
- Crear backups de bases de datos

### 4. **Auditoría nocturna**
Un agente genera reportes automáticos:
- Inventario de recursos
- Cambios recientes
- Alertas de configuración anómala
- Espacios de almacenamiento bajo en servidores

### 5. **Búsqueda y correlación**
Un agente correlaciona información de múltiples fuentes:
- "¿Qué aplicaciones fallaron entre las 10:00 y 10:30?" → Busca en logs y despliegues
- "¿Qué aplicaciones usan esta base de datos?" → Inspecciona relaciones
- "¿Cuál es el servidor más cargado?" → Consulta recursos de todos los servidores

---

## Valores Fundamentales

| Valor | Significado | Cómo se implementa |
|---|---|---|
| **Seguridad** | Proteger credenciales y datos sensibles | Token en `.env`, modo READ_ONLY, validación de permisos |
| **Confiabilidad** | El MCP funciona cuando se necesita | Reintentos, backoff exponencial, logging detallado |
| **Transparencia** | Saber qué está pasando en todo momento | Logs completos, auditoría, errores claros |
| **Flexibilidad** | Adaptarse a diferentes tipos de uso | Expone toda la API, soporta múltiples clientes MCP |
| **Simplicidad** | Fácil de usar para agentes de IA | Schemas claros, documentación exhaustiva |

---

## Alcance

### Incluido ✓
- Acceso a **todos** los endpoints de Coolify API
- Autenticación y autorización centralizada
- Logging y auditoría completa
- Modo solo-lectura
- Confirmación de operaciones peligrosas
- Reintentos y backoff exponencial
- Validación de permisos
- Error handling robusto

### Excluido ✗
- UI gráfica (el MCP es una API)
- Persistencia de datos en BD propia (solo funciona contra Coolify)
- Transformación/filtrado de datos sensibles (devuelve lo que Coolify devuelve)
- Implementación de política de permisos propia (usa la de Coolify)

---

## Restricciones y Limitaciones

1. **Token = Team**: Un token API de Coolify pertenece a un equipo. El MCP solo verá recursos de ese equipo.
2. **Rate limits de Coolify**: El MCP respeta los rate limits de la API de Coolify.
3. **Compatibilidad de versiones**: Requiere al menos Coolify v4 (versión con API Reference pública).
4. **Dependencias de red**: Depende de conectividad con Coolify. Si Coolify no está disponible, el MCP no puede funcionar.

---

## Éxito

El MCP Coolify será exitoso cuando:

1. ✓ Un agente de IA puede consultar logs de una aplicación con una sola llamada
2. ✓ Un agente puede obtener el estado completo de la infraestructura
3. ✓ Las operaciones peligrosas requieren confirmación explícita
4. ✓ Cada operación queda registrada para auditoría
5. ✓ El modo READ_ONLY previene cambios accidentales
6. ✓ Los reintentos automáticos hacen que el MCP sea resiliente
7. ✓ Un equipo de DevOps puede usar el MCP sin escribir código personalizado

---

## Decisiones Arquitectónicas

### Configuración en `.env`
- ✓ Ventaja: Credenciales seguras, fácil de gestionar
- ✓ Ventaja: Un mismo MCP para múltiples entornos
- ✓ Ventaja: No requiere interfaz de configuración

### Logging exhaustivo
- ✓ Ventaja: Debugging y auditoría completa
- ✓ Ventaja: Cumplimiento de requisitos de compliance
- ✗ Desventaja: Mayor uso de almacenamiento

### Confirmación de operaciones peligrosas
- ✓ Ventaja: Previene cambios accidentales
- ✓ Ventaja: Seguridad adicional
- ✗ Desventaja: Requiere interacción, no es completamente automatizado

### Modo READ_ONLY global
- ✓ Ventaja: Simple de implementar y entender
- ✓ Ventaja: Protección contra cambios en modo auditoría
- ✗ Desventaja: Toda o nada (no por endpoint)

---

## Próximas Iteraciones (Futura)

Funcionalidades a considerar después de v1:

- [ ] Webhooks desde Coolify hacia el MCP (para notificaciones)
- [ ] Caché de datos no-sensibles para reducir latencia
- [ ] Permisos granulares (READ_ONLY por categoría, no global)
- [ ] Exportación de logs a servicios como Datadog, New Relic
- [ ] Historial de operaciones en BD SQLite local
- [ ] CLI adicional para testear el MCP sin agentes IA

---

## Métricas de Éxito Técnico

El MCP debe cumplir:

- **Disponibilidad**: 99% uptime (reintentos automáticos)
- **Latencia P95**: < 2s para operaciones de lectura
- **Logging**: 100% de operaciones registradas
- **Auditoría**: 0 operaciones sin trazabilidad
- **Seguridad**: 0 credenciales en logs
- **Resiliencia**: Recuperación automática de fallos transitorios

---

## Cambios a esta Constitution

Esta constitution es el documento fundacional. Cambios importantes (que afecten principios o audiencia) deben ser aprobados explícitamente.

Cambios menores (casos de uso adicionales, mejoras operacionales) pueden ser incorporados sin cambiar el documento, pero deben registrarse en el `CHANGELOG.md`.
