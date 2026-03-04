# 📋 Documento de Requisitos de Producto (PRD)
# Sistema CRM para Clústeres y Cámaras Empresariales — XIXIM

---

**Versión:** 1.3  
**Fecha:** Febrero 2026  
**Estado del Proyecto:** En Desarrollo (~55% Completado)  
**Equipo:** XIXIM Tech Cluster  
**Stack:** Next.js 16 · React 19 · TypeScript · Supabase · Tailwind CSS 4 · Shadcn/ui

---

## 1. Resumen Ejecutivo

Este documento define los requisitos completos del **CRM para Clústeres y Cámaras Empresariales**, una plataforma digital de gestión institucional diseñada para centralizar, ordenar y aprovechar la información de organismos empresariales y sus empresas afiliadas.

### 1.1 Problema que Resuelve

Los clústeres, cámaras empresariales y organismos coordinadores operan con información dispersa en hojas de cálculo, correos y sistemas no integrados. Esto genera:

- Pérdida de datos críticos sobre empresas afiliadas
- Procesos de admisión lentos y no estandarizados
- Comunicación institucional ineficiente
- Nula trazabilidad de actividades y decisiones
- Dificultad para generar reportes y tomar decisiones basadas en datos

### 1.2 Solución Propuesta

Una plataforma web SaaS tipo CRM, moderna y configurable, que permite a cualquier organismo empresarial:

- Gestionar su padrón de empresas afiliadas
- Administrar procesos de admisión de nuevos socios
- Comunicarse efectivamente con sus miembros
- Generar reportes e indicadores en tiempo real
- Coordinar eventos, comisiones y mesa directiva

### 1.3 Usuarios Objetivo

| Rol | Descripción | Acceso |
|-----|-------------|--------|
| **Super Admin** | Administrador global del sistema | Total |
| **Admin de Organismo** | Administrador de un clúster o cámara específica | Organismo propio |
| **Editor** | Capturista / operativo del organismo | Edición limitada |
| **Viewer** | Consulta de información del organismo | Solo lectura |
| **Coordinador CCE** | Vista consolidada de múltiples organismos | Vista global |

---

## 2. Arquitectura del Sistema

### 2.1 Jerarquía

```
Organismo Concentrador (CCE / Vista Global)
  └── Organismo A (Clúster / Cámara)
        └── Empresas Afiliadas
  └── Organismo B
        └── Empresas Afiliadas
```

### 2.2 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Estilos | Tailwind CSS 4, Shadcn/ui, Radix UI |
| Backend / Auth | Supabase (PostgreSQL + Auth + Storage + RLS) |
| Notificaciones | SendGrid (Email) + Twilio (WhatsApp) vía n8n |
| Automatización | n8n (workflows de notificaciones) |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Deploy | Vercel |

---

## 3. Módulos del Sistema

---

### Módulo 1: Gestión de Organismos

**Descripción:** Administración completa de la información institucional de cada organismo (cámara, clúster o asociación).

#### 3.1.1 Requisitos Funcionales

| ID | Requisito | Prioridad | Estado |
|----|-----------|-----------|--------|
| ORG-001 | Listado de organismos con filtros y búsqueda | Alta | ✅ Implementado |
| ORG-002 | Crear nuevo organismo con formulario validado | Alta | ✅ Implementado |
| ORG-003 | Editar información del organismo | Alta | ⚠️ Parcial |
| ORG-004 | Vista de detalle del organismo (con tabs) | Alta | ❌ Pendiente |
| ORG-005 | Gestión de mesa directiva (presidentes, cargos, períodos) | Media | ❌ Pendiente |
| ORG-006 | Gestión de comisiones de trabajo | Media | ❌ Pendiente |
| ORG-007 | Carga y gestión de documentos legales del organismo | Media | ❌ Pendiente |
| ORG-008 | Registro de fechas importantes y aniversarios | Media | ❌ Pendiente |
| ORG-009 | Expediente digital completo por organismo | Media | ❌ Pendiente |
| ORG-010 | Historial de actividades y cambios del organismo | Baja | ❌ Pendiente |

#### 3.1.2 Datos del Organismo

- Nombre oficial y nombre corto
- Logo (versión completa e ícono)
- Sector empresarial
- Datos de contacto (email, teléfono, dirección)
- Sitio web y redes sociales
- Representante legal / Presidente
- RFC y datos fiscales
- Fecha de fundación

#### 3.1.3 Rutas

| Ruta | Descripción | Estado |
|------|-------------|--------|
| `/dashboard/organismos` | Listado | ✅ |
| `/dashboard/organismos/nuevo` | Crear | ✅ |
| `/dashboard/organismos/[id]` | Detalle | ❌ |
| `/dashboard/organismos/[id]/editar` | Editar | ⚠️ |

---

### Módulo 2: Gestión de Empresas Afiliadas

**Descripción:** Registro y administración del padrón de empresas miembro de cada organismo.

#### 3.2.1 Requisitos Funcionales

| ID | Requisito | Prioridad | Estado |
|----|-----------|-----------|--------|
| EMP-001 | Listado de empresas con búsqueda y filtros avanzados | Alta | ✅ Implementado |
| EMP-002 | Crear nueva empresa con formulario completo | Alta | ✅ Implementado |
| EMP-003 | Editar información de empresa | Alta | ⚠️ Parcial |
| EMP-004 | Vista de detalle de empresa con tabs | Alta | ❌ Pendiente |
| EMP-005 | Gestión de contactos y representantes de la empresa | Alta | ⚠️ Parcial |
| EMP-006 | Registro de productos y servicios ofrecidos | Alta | ❌ Pendiente |
| EMP-007 | Registro de productos y servicios requeridos | Alta | ❌ Pendiente |
| EMP-008 | Sistema de matching oferta-demanda entre empresas | Media | ❌ Pendiente |
| EMP-009 | Registro de problemáticas de crecimiento | Media | ❌ Pendiente |
| EMP-010 | Registro de necesidades de capacitación | Media | ❌ Pendiente |
| EMP-011 | Historial de actividades por empresa | Baja | ❌ Pendiente |
| EMP-012 | Filtro por mes de vencimiento de membresía | Alta | ✅ Implementado |
| EMP-013 | Conversión a mayúsculas de datos al guardar | Alta | ✅ Implementado |

#### 3.2.2 Datos de la Empresa

- Razón social (en mayúsculas)
- RFC y datos fiscales
- Sector y actividad económica (SCIAN)
- Número de empleados
- Dirección (campos separados: calle, número, colonia, ciudad, estado, CP)
- Email y teléfono de contacto
- Representante legal principal
- Productos / servicios ofrecidos
- Productos / servicios requeridos
- Problemáticas de crecimiento
- Necesidades de capacitación
- Estado de membresía y fecha de vencimiento

#### 3.2.3 Rutas

| Ruta | Descripción | Estado |
|------|-------------|--------|
| `/dashboard/empresas` | Listado | ✅ |
| `/dashboard/empresas/nueva` | Crear | ✅ |
| `/dashboard/empresas/[id]` | Detalle | ❌ |
| `/dashboard/empresas/[id]/editar` | Editar | ⚠️ |
| `/dashboard/matching` | Matching oferta-demanda | ❌ |

---

### Módulo 3: Proceso de Admisión de Nuevos Socios

**Descripción:** Flujo completo de 5 etapas, desde la solicitud pública hasta la integración del nuevo socio.

#### 3.3.1 Etapa 1 — Solicitud Inicial (Formulario Público)

| ID | Requisito | Prioridad | Estado |
|----|-----------|-----------|--------|
| ADM-001 | Formulario público de solicitud accesible sin login | Crítica | ✅ Implementado |
| ADM-002 | Sección: Datos generales del solicitante | Crítica | ✅ Implementado |
| ADM-003 | Sección: Perfil y trayectoria empresarial | Alta | ✅ Implementado |
| ADM-004 | Sección: Motivación y compromiso | Alta | ✅ Implementado |
| ADM-005 | Sección: Aval de socios activos (mínimo 2) | Alta | ✅ Implementado |
| ADM-006 | Carga de documentos (CSF, brochure empresarial) | Alta | ✅ Implementado |
| ADM-007 | Separación de campos de dirección (calle, número, colonia, ciudad, estado, CP) | Alta | ✅ Implementado |
| ADM-008 | Checkbox para autocompletar datos de contacto desde el titular | Media | ✅ Implementado |
| ADM-009 | Conversión automática a mayúsculas al guardar | Alta | ✅ Implementado |

#### 3.3.2 Etapa 2 — Validación Automática de Requisitos

| ID | Requisito | Prioridad | Estado |
|----|-----------|-----------|--------|
| ADM-010 | Validar tipo de persona (física con actividad / moral constituida) | Alta | ⚠️ Parcial |
| ADM-011 | Validar registro activo ante autoridades fiscales | Alta | ⚠️ Parcial |
| ADM-012 | Validar pertenencia a cadena productiva del sector | Alta | ⚠️ Parcial |
| ADM-013 | Validar mínimo 2 años de operación (con excepción para startups) | Alta | ⚠️ Parcial |
| ADM-014 | Validar aval de al menos 2 socios activos | Alta | ⚠️ Parcial |

#### 3.3.3 Etapa 3 — Revisión por Consejo Directivo

| ID | Requisito | Prioridad | Estado |
|----|-----------|-----------|--------|
| ADM-015 | Panel de revisión de solicitudes pendientes | Alta | ✅ Implementado |
| ADM-016 | Sistema de aprobación con comentarios | Alta | ✅ Implementado |
| ADM-017 | Sistema de rechazo con comentarios justificados | Alta | ✅ Implementado |
| ADM-018 | Notificación automática por email al cambio de estado | Crítica | ❌ Pendiente |
| ADM-019 | Notificación automática por WhatsApp al cambio de estado | Alta | ❌ Pendiente |

#### 3.3.4 Etapa 4 — Proceso Post-Aprobación

| ID | Requisito | Prioridad | Estado |
|----|-----------|-----------|--------|
| ADM-020 | Email de notificación de aceptación al solicitante | Crítica | ❌ Pendiente |
| ADM-021 | Registro de pago de cuota ordinaria (membresía anual) | Alta | ✅ Implementado |
| ADM-022 | Generación automática de expediente digital del nuevo socio | Alta | ⚠️ Parcial |
| ADM-023 | Registro de Carta Compromiso (aceptación de estatutos) | Media | ❌ Pendiente |
| ADM-024 | Captura de información comercial para catálogo | Alta | ⚠️ Parcial |
| ADM-025 | Firma digital de aviso de privacidad | Media | ❌ Pendiente |
| ADM-026 | Emisión de kit de bienvenida virtual | Media | ✅ Implementado |

#### 3.3.5 Etapa 5 — Seguimiento

| ID | Requisito | Prioridad | Estado |
|----|-----------|-----------|--------|
| ADM-027 | Dashboard de seguimiento del estado de cada solicitud | Media | ⚠️ Parcial |
| ADM-028 | Recordatorios automáticos para documentación pendiente | Media | ❌ Pendiente |
| ADM-029 | Notas internas del clúster por solicitud | Media | ✅ Implementado |

#### 3.3.6 Rutas

| Ruta | Descripción | Estado |
|------|-------------|--------|
| `/solicitud-admision` | Formulario público | ✅ |
| `/dashboard/admision` | Panel de revisión | ✅ |
| `/dashboard/pagos` | Registro de pagos | ✅ |
| `/dashboard/bienvenida` | Kit de bienvenida | ✅ |

---

### Módulo 4: Sistema de Notificaciones Automatizadas

**Descripción:** Comunicación automática multicanal (email + WhatsApp) en cada etapa del proceso, integrada con SendGrid y Twilio vía n8n.

#### 3.4.1 Flujos de Notificación

| ID | Evento Disparador | Email | WhatsApp | Estado |
|----|-------------------|-------|----------|--------|
| NOT-001 | Nueva solicitud de admisión recibida | ✅ Req. | ✅ Req. | ❌ Pendiente |
| NOT-002 | Solicitud aprobada por Consejo | ✅ Req. | ✅ Req. | ❌ Pendiente |
| NOT-003 | Solicitud rechazada con motivo | ✅ Req. | ✅ Req. | ❌ Pendiente |
| NOT-004 | Pago de membresía confirmado | ✅ Req. | ✅ Req. | ❌ Pendiente |
| NOT-005 | Recordatorio de pago próximo a vencer | ✅ Req. | ✅ Req. | ❌ Pendiente |
| NOT-006 | Invitación a evento | ✅ Req. | Opcional | ❌ Pendiente |
| NOT-007 | Recordatorio de evento (24-48 hrs antes) | ✅ Req. | Opcional | ❌ Pendiente |
| NOT-008 | Envío de comunicado institucional | ✅ Req. | Opcional | ❌ Pendiente |

#### 3.4.2 Contenido de Mensajes

**NOT-001 — Nueva Solicitud:**
> "Agradecemos mucho tu registro en [Nombre del Clúster]. Hemos recibido tu solicitud de admisión y nuestro equipo estará trabajando en ella. Te notificaremos en breve sobre el resultado. ¡Gracias por tu interés!"

**NOT-002 — Solicitud Aprobada:**
> "¡Felicidades! Tu solicitud de ingreso a [Nombre del Clúster] ha sido APROBADA. Para completar tu proceso de afiliación, te pedimos realizar el pago de tu membresía anual. Nuestro equipo se pondrá en contacto contigo con los detalles."

**NOT-004 — Pago Confirmado:**
> "¡Bienvenido oficialmente a [Nombre del Clúster]! Hemos confirmado tu pago de membresía. Ya formas parte de nuestra comunidad empresarial. Disfruta de todos los servicios y beneficios que tenemos para ti."

#### 3.4.3 Integración Técnica (n8n + SendGrid + Twilio)

| Componente | Descripción |
|-----------|-------------|
| **n8n** | Orquestador de workflows de notificación |
| **SendGrid** | Proveedor de envío de emails transaccionales |
| **Twilio** | API de WhatsApp Business |
| **Webhooks** | El CRM dispara webhooks que activan workflows de n8n |
| **Plantillas** | Almacenadas en BD, configurables desde UI |

#### 3.4.4 Requisitos de Plantillas de Email

| ID | Requisito | Prioridad | Estado |
|----|-----------|-----------|--------|
| TPL-001 | Editor visual de plantillas de email en el sistema | Alta | ❌ Pendiente |
| TPL-002 | Variables dinámicas en plantillas (nombre, email, etc.) | Alta | ❌ Pendiente |
| TPL-003 | Preview de email con datos de prueba | Alta | ❌ Pendiente |
| TPL-004 | Envío de email de prueba | Alta | ❌ Pendiente |
| TPL-005 | Plantillas personalizables con logo e identidad del clúster | Alta | ❌ Pendiente |
| TPL-006 | Historial de emails enviados con estado de entrega | Media | ❌ Pendiente |

---

### Módulo 5: Comunicación Institucional y Campañas

**Descripción:** Sistema de mensajería masiva para enviar comunicados, campañas e invitaciones a los miembros del clúster vía email y WhatsApp.

#### 3.5.1 Requisitos Funcionales

| ID | Requisito | Prioridad | Estado |
|----|-----------|-----------|--------|
| COM-001 | Listado de comunicados enviados con historial | Alta | ✅ Implementado |
| COM-002 | Crear nuevo comunicado con editor de contenido | Alta | ✅ Implementado |
| COM-003 | Envío real de comunicados por email | Crítica | ❌ Pendiente |
| COM-004 | Envío de comunicados por WhatsApp | Alta | ❌ Pendiente |
| COM-005 | Segmentación de audiencia (por organismo, sector, perfil) | Alta | ⚠️ Parcial |
| COM-006 | Historial de comunicaciones enviadas con métricas | Media | ⚠️ Parcial |
| COM-007 | Plantillas predefinidas de comunicados | Media | ❌ Pendiente |
| COM-008 | Tracking de apertura de emails (opcional) | Baja | ⚠️ Parcial |
| COM-009 | Campañas masivas desde el módulo de mensajería | Alta | ❌ Pendiente |

#### 3.5.2 Integración con n8n para Campañas

El módulo de mensajería utilizará el MCP Server de n8n ya configurado para:

1. Crear workflows de envío masivo de emails vía SendGrid
2. Crear workflows de envío masivo de WhatsApp vía Twilio
3. Segmentar destinatarios según criterios de filtro
4. Programar envíos en fecha/hora específica
5. Reportar métricas de entrega y apertura

#### 3.5.3 Rutas

| Ruta | Descripción | Estado |
|------|-------------|--------|
| `/dashboard/comunicacion` | Listado de comunicados | ✅ |
| `/dashboard/comunicacion/nuevo` | Crear comunicado | ✅ |
| `/dashboard/emails` | Panel de emails enviados | ❌ |

---

### Módulo 6: Directorio Empresarial y Networking

**Descripción:** Directorio filtrable de empresas afiliadas con exportación a PDF e integración web.

#### 3.6.1 Requisitos Funcionales

| ID | Requisito | Prioridad | Estado |
|----|-----------|-----------|--------|
| DIR-001 | Directorio interno filtrable por organismo | Alta | ⚠️ Parcial |
| DIR-002 | Directorio consolidado de todos los organismos | Alta | ⚠️ Parcial |
| DIR-003 | Filtros por sector, producto, servicio | Alta | ⚠️ Parcial |
| DIR-004 | Exportación del directorio a PDF con branding | Alta | ❌ Pendiente |
| DIR-005 | Búsqueda avanzada de empresas | Media | ⚠️ Parcial |
| DIR-006 | API pública para integración en sitio web institucional | Baja | ❌ Pendiente |
| DIR-007 | Directorio público accesible sin login | Media | ⚠️ Parcial |

#### 3.6.2 Rutas

| Ruta | Descripción | Estado |
|------|-------------|--------|
| `/directorio` | Directorio público | ⚠️ |
| `/dashboard/directorio` | Directorio interno | ⚠️ |

---

### Módulo 7: Calendario y Eventos

**Descripción:** Gestión de eventos del organismo con invitaciones, confirmaciones y recordatorios.

#### 3.7.1 Requisitos Funcionales

| ID | Requisito | Prioridad | Estado |
|----|-----------|-----------|--------|
| EVT-001 | Registrar nuevo evento | Alta | ✅ Implementado |
| EVT-002 | Listado de eventos | Alta | ✅ Implementado |
| EVT-003 | Página pública de eventos | Alta | ✅ Implementado |
| EVT-004 | Vista de calendario mensual/semanal real | Alta | ⚠️ Parcial |
| EVT-005 | Sistema de invitaciones a empresas | Alta | ❌ Pendiente |
| EVT-006 | Confirmaciones de asistencia (RSVP) | Alta | ⚠️ Parcial |
| EVT-007 | Recordatorios automáticos 24-48 hrs antes | Media | ❌ Pendiente |
| EVT-008 | Vista de detalle de evento con lista de asistentes | Media | ❌ Pendiente |
| EVT-009 | Exportar lista de asistentes confirmados | Media | ❌ Pendiente |
| EVT-010 | QR code de registro para asistencia | Baja | ❌ Pendiente |

#### 3.7.2 Rutas

| Ruta | Descripción | Estado |
|------|-------------|--------|
| `/eventos` | Página pública | ✅ |
| `/dashboard/calendario` | Vista de calendario | ⚠️ |
| `/dashboard/calendario/nuevo` | Crear evento | ✅ |
| `/dashboard/eventos/[id]` | Detalle del evento | ❌ |
| `/dashboard/eventos/[id]/editar` | Editar evento | ❌ |

---

### Módulo 8: Reportes y Análisis

**Descripción:** Dashboards visuales e indicadores empresariales con capacidad de exportación.

#### 3.8.1 Requisitos Funcionales

| ID | Requisito | Prioridad | Estado |
|----|-----------|-----------|--------|
| REP-001 | Dashboard principal con KPIs del organismo | Alta | ✅ Implementado |
| REP-002 | Reportes estadísticos (empresas, sectores, admisiones) | Alta | ✅ Implementado |
| REP-003 | Indicadores empresariales con gráficos | Alta | ✅ Implementado |
| REP-004 | Dashboards visuales interactivos | Alta | ✅ Implementado |
| REP-005 | Exportación de reportes a Excel/CSV | Alta | ❌ Pendiente |
| REP-006 | Exportación de reportes a PDF ejecutivo | Alta | ❌ Pendiente |
| REP-007 | Filtros por período (mes, trimestre, año) | Media | ⚠️ Parcial |
| REP-008 | Datos por organismo, sector y tamaño de empresa | Media | ✅ Implementado |

---

### Módulo 9: Gestión de Usuarios y Seguridad

**Descripción:** Sistema de autenticación, roles, permisos y auditoría.

#### 3.9.1 Requisitos Funcionales

| ID | Requisito | Prioridad | Estado |
|----|-----------|-----------|--------|
| USR-001 | Autenticación segura con Supabase Auth | Crítica | ✅ Implementado |
| USR-002 | Login con email y contraseña | Crítica | ✅ Implementado |
| USR-003 | Roles: super_admin, admin, editor, viewer | Crítica | ✅ Implementado |
| USR-004 | Row Level Security (RLS) por organismo | Crítica | ✅ Implementado |
| USR-005 | Página de administración de usuarios | Alta | ❌ Pendiente |
| USR-006 | Invitar nuevos usuarios al sistema | Alta | ❌ Pendiente |
| USR-007 | Modificar rol de usuario | Alta | ❌ Pendiente |
| USR-008 | Desactivar/reactivar cuentas | Alta | ❌ Pendiente |
| USR-009 | Log de actividad por usuario | Media | ❌ Pendiente |
| USR-010 | Sistema de auditoría completo (tabla audit_log) | Media | ❌ Pendiente |
| USR-011 | Historial de acciones críticas | Media | ❌ Pendiente |
| USR-012 | Gestión de sesiones activas | Alta | ✅ Implementado |
| USR-013 | Encriptación de datos sensibles | Alta | ⚠️ Parcial |
| USR-014 | Rate limiting en endpoints críticos | Alta | ❌ Pendiente |

#### 3.9.2 Rutas

| Ruta | Descripción | Estado |
|------|-------------|--------|
| `/auth/login` | Inicio de sesión | ✅ |
| `/dashboard/usuarios` | Gestión de usuarios | ❌ |
| `/dashboard/auditoria` | Log de auditoría | ❌ |

---

### Módulo 10: Configuración del Sistema (CRÍTICO)

**Descripción:** Panel de configuración que hace el sistema completamente autónomo y personalizable sin tocar código.

#### 3.10.1 Requisitos Funcionales

| ID | Requisito | Prioridad | Estado |
|----|-----------|-----------|--------|
| CFG-001 | Página de configuración general del sistema | **CRÍTICA** | ❌ Pendiente |
| CFG-002 | Configurar nombre, logo y datos del clúster | **CRÍTICA** | ❌ Pendiente |
| CFG-003 | Editor de colores con color pickers y preview en tiempo real | **CRÍTICA** | ❌ Pendiente |
| CFG-004 | Upload de logos (principal, icono, favicon) | **CRÍTICA** | ❌ Pendiente |
| CFG-005 | Configuración de datos de contacto institucional | Alta | ❌ Pendiente |
| CFG-006 | Editor de plantillas de email desde UI | Alta | ❌ Pendiente |
| CFG-007 | Parámetros de admisión configurables | Alta | ❌ Pendiente |
| CFG-008 | Presets de temas (claro / oscuro / alto contraste) | Media | ❌ Pendiente |
| CFG-009 | Exportar/importar configuración de tema | Baja | ❌ Pendiente |
| CFG-010 | Reset a valores por defecto | Media | ❌ Pendiente |

#### 3.10.2 Datos Configurables

```typescript
// Configuración del Clúster
{
  cluster_name: string           // Nombre corto del clúster
  cluster_full_name: string      // Nombre oficial completo
  logo_url: string               // Logo principal
  logo_icon_url: string          // Ícono para sidebar colapsado
  favicon_url: string            // Favicon del sitio
  primary_color: string          // Color primario (#hex)
  secondary_color: string        // Color secundario
  accent_color: string           // Color de acento
  contact_email: string          // Email de contacto
  contact_phone: string          // Teléfono
  address: string                // Dirección física
  website_url: string            // Sitio web institucional
  social_media: {
    facebook?: string
    twitter?: string
    linkedin?: string
    instagram?: string
  }
}
```

#### 3.10.3 Tablas de BD Requeridas (Nueva Migración)

```sql
-- Configuración global del clúster
CREATE TABLE cluster_config (...);

-- Plantillas de email personalizables
CREATE TABLE email_templates (...);

-- Log de auditoría del sistema
CREATE TABLE audit_log (...);
```

#### 3.10.4 Rutas

| Ruta | Descripción | Estado |
|------|-------------|--------|
| `/dashboard/configuracion` | Configuración general | ❌ |
| `/dashboard/configuracion/branding` | Logos y colores | ❌ |
| `/dashboard/configuracion/emails` | Plantillas de email | ❌ |

---

### Módulo 11: Almacenamiento y Documentos

**Descripción:** Gestión centralizada de archivos: PDFs, imágenes, documentos legales y expedientes digitales.

#### 3.11.1 Requisitos Funcionales

| ID | Requisito | Prioridad | Estado |
|----|-----------|-----------|--------|
| DOC-001 | Storage con Supabase Storage (buckets configurados) | Alta | ✅ Implementado |
| DOC-002 | Carga de documentos en proceso de admisión | Alta | ⚠️ Parcial |
| DOC-003 | Página de gestión de documentos del organismo | Alta | ✅ Implementado |
| DOC-004 | Visualización de archivos desde la plataforma | Media | ⚠️ Parcial |
| DOC-005 | Generación de PDFs de reportes y catálogos | Alta | ❌ Pendiente |
| DOC-006 | Exportación de directorios a PDF con branding | Alta | ❌ Pendiente |

---

### Módulo 12: Pagos y Membresías

**Descripción:** Registro y seguimiento de pagos de membresía de los socios.

#### 3.12.1 Requisitos Funcionales

| ID | Requisito | Prioridad | Estado |
|----|-----------|-----------|--------|
| PAY-001 | Registro manual de pagos | Alta | ✅ Implementado |
| PAY-002 | Tracking del estado de membresía | Alta | ✅ Implementado |
| PAY-003 | Historial de pagos por empresa | Alta | ✅ Implementado |
| PAY-004 | Filtro de miembros por mes de vencimiento | Alta | ✅ Implementado |
| PAY-005 | Recordatorios automáticos de pago próximo a vencer | Alta | ❌ Pendiente |
| PAY-006 | Integración con pasarela de pago (v2) | Baja | ❌ Pendiente |

---

## 4. Requisitos No Funcionales

### 4.1 Interfaz de Usuario

| Categoría | Requisito |
|-----------|-----------|
| **Diseño** | Moderno, minimalista, profesional y limpio |
| **Tema** | Colores corporativos configurables (primario, secundario, acento) |
| **Tipografía** | Clara y legible – Inter o equivalente |
| **Iconografía** | Lucide React – consistente en todo el sistema |
| **Responsive** | Funcional en desktop (1440px), tablet (768px) y móvil (375px) |
| **Animaciones** | Transiciones suaves y elegantes |
| **Cards** | Sombras sutiles, bordes redondeados |
| **Botones** | Estados visuales claros (hover, active, disabled, loading) |
| **Feedback** | Toast notifications, loading skeletons, estados de error útiles |
| **Accesibilidad** | WCAG AA – labels ARIA, navegación por teclado, contraste validado |
| **Identidad** | Logo del clúster en header, login, PDFs, emails y footer |

### 4.2 Experiencia de Usuario

- Proceso de admisión guiado paso a paso
- Formularios con validación en tiempo real (Zod + React Hook Form)
- Búsquedas rápidas con filtros persistentes
- Exportación de información en formatos comunes (PDF, Excel, CSV)
- Feedback visual inmediato en todas las acciones
- Breadcrumbs en navegación
- Búsqueda global (Cmd+K / Ctrl+K)

### 4.3 Performance

| Métrica | Target |
|---------|--------|
| Tiempo de carga inicial | < 3 segundos |
| LCP (Largest Contentful Paint) | < 2.5s |
| Consultas de base de datos | < 500ms |
| Lazy loading | Implementado en rutas y componentes pesados |
| Optimización de imágenes | WebP format, responsive images |

### 4.4 Seguridad

| Aspecto | Requisito |
|---------|-----------|
| **Auth** | Supabase Auth con JWT |
| **RLS** | Row Level Security en todas las tablas de Supabase |
| **Roles** | super_admin, admin, editor, viewer |
| **API Keys** | En variables de entorno, nunca en código |
| **Datos sensibles** | Encriptados en BD |
| **Auditoría** | Registro de acciones críticas (create, update, delete) |
| **Rate limiting** | En endpoints de autenticación y APIs críticas |
| **Privacidad** | Cumplimiento con LFPDPPP (México) |
| **Backup** | Backup automático diario de Supabase |

---

## 5. Modelo de Datos — Tablas Principales

### Existentes en Producción ✅

| Tabla | Descripción |
|-------|-------------|
| `profiles` | Usuarios y roles del sistema |
| `organizations` | Organismos (clústeres, cámaras) |
| `companies` | Empresas afiliadas |
| `contacts` | Contactos de las empresas |
| `admissions` | Solicitudes de admisión |
| `payments` | Pagos y membresías |
| `events` | Eventos del organismo |
| `event_attendees` | Confirmaciones de asistencia |
| `communications` | Comunicados institucionales |
| `documents` | Documentos y archivos |
| `welcome_kits` | Kits de bienvenida |

### Pendientes de Crear ❌

| Tabla | Descripción | Prioridad |
|-------|-------------|-----------|
| `cluster_config` | Configuración del clúster (logo, colores, datos) | **CRÍTICA** |
| `email_templates` | Plantillas de email configurables | **CRÍTICA** |
| `audit_log` | Log de auditoría de acciones | Alta |
| `company_products_services` | Productos/servicios de empresas | Alta |
| `work_commissions` | Comisiones de trabajo | Media |
| `commission_members` | Miembros de comisiones | Media |
| `board_members` | Mesa directiva y cargos | Media |
| `email_log` | Historial de emails enviados | Alta |

---

## 6. Roadmap de Implementación

### Fase 1 — Sistema Autónomo y Configurable ⚡ CRÍTICA
**Duración estimada:** 1-2 semanas

- [ ] Crear migraciones SQL: `cluster_config`, `email_templates`
- [ ] Implementar hook `useClusterConfig`
- [ ] Página `/dashboard/configuracion` con tabs
- [ ] Componente `DynamicLogo` que lee configuración
- [ ] Componente `DynamicThemeProvider` (CSS variables dinámicas)
- [ ] Sistema de upload de logos a Supabase Storage
- [ ] Editor de colores con color pickers
- [ ] Migrar valores hardcodeados a configuración de BD

### Fase 2 — Funcionalidades Core Pendientes 🔥 ALTA
**Duración estimada:** 2-3 semanas

- [ ] Sistema de notificaciones automáticas (email + WhatsApp vía n8n)
- [ ] Editor de plantillas de email
- [ ] Páginas de detalle: organismo, empresa, evento
- [ ] Páginas de edición completas: organismo, empresa
- [ ] Gestión de productos y servicios empresariales
- [ ] Sistema de matching oferta-demanda
- [ ] Exportación a PDF y Excel
- [ ] Vista de calendario mensual/semanal (react-big-calendar)
- [ ] Sistema de invitaciones y RSVP para eventos

### Fase 3 — Gestión Avanzada 📊 MEDIA-ALTA
**Duración estimada:** 2 semanas

- [ ] Comisiones de trabajo y gestión de miembros
- [ ] Mesa directiva con períodos y cargos
- [ ] Gestión avanzada de usuarios (invitar, cambiar rol, desactivar)
- [ ] Log de auditoría con tabla `audit_log`
- [ ] Página de auditoría con filtros avanzados

### Fase 4 — UX y Exportación 🎨 MEDIA
**Duración estimada:** 1-2 semanas

- [ ] Exportación de directorios a PDF con branding
- [ ] Exportación de reportes a Excel y PDF ejecutivo
- [ ] Búsqueda global (Cmd+K) con resultados agrupados
- [ ] Breadcrumbs en todas las páginas

### Fase 5 — Pulido y Optimización ✨ MEDIA-BAJA
**Duración estimada:** 1-2 semanas

- [ ] Mobile responsiveness completo
- [ ] Accesibilidad WCAG AA
- [ ] Loading skeletons y estados de error informativos
- [ ] Performance optimization (lazy loading, code splitting, caché)
- [ ] Modo oscuro (opcional)
- [ ] Documentación de usuario y administrador

---

## 7. Métricas de Completitud por Módulo

| Módulo | % Completado | Críticos Pendientes |
|--------|--------------|---------------------|
| Gestión de Organismos | **40%** | Detalle, edición, comisiones, mesa directiva |
| Gestión de Empresas | **55%** | Detalle, edición, productos/servicios |
| Proceso de Admisión | **70%** | Emails automáticos, validaciones completas |
| Notificaciones | **0%** | Todo el módulo está pendiente |
| Comunicacion Institucional | **50%** | Envío real, WhatsApp, campañas masivas |
| Directorio y Networking | **50%** | Exportación PDF, API pública |
| Calendario y Eventos | **60%** | Vista calendario, invitaciones, RSVP completo |
| Reportes y Análisis | **80%** | Exportación de datos |
| Gestión de Usuarios | **50%** | Administración de usuarios, auditoría |
| **Configuración del Sistema** | **0%** | **TODO — CRÍTICO** |
| Documentos y Storage | **65%** | Generación de PDFs |
| Pagos y Membresías | **75%** | Recordatorios automáticos |

**TOTAL GENERAL: ~55% Completado**  
**Tiempo estimado para v1.0 lista para producción: 7-11 semanas**

---

## 8. Checklist Pre-Producción

### 🔐 Seguridad
- [ ] Todas las tablas con RLS configurado y probado
- [ ] Permisos validados para cada rol (admin, editor, viewer)
- [ ] API keys en variables de entorno (nunca en código)
- [ ] Datos sensibles encriptados
- [ ] Rate limiting en autenticación
- [ ] Política de privacidad implementada (LFPDPPP)
- [ ] Backup automático configurado en Supabase

### ⚙️ Configuración
- [ ] Sistema de configuración completo y funcional
- [ ] Logo y branding completamente personalizable
- [ ] Colores del sistema configurables desde UI
- [ ] Datos de contacto configurables
- [ ] Plantillas de email configurables y funcionando

### ✅ Funcionalidades
- [ ] CRUD completo para organismos
- [ ] CRUD completo para empresas
- [ ] Proceso de admisión end-to-end funcional
- [ ] Notificaciones automáticas email + WhatsApp
- [ ] Calendario con vista mensual
- [ ] Sistema de comunicados con envío real
- [ ] Exportación de datos a PDF y Excel
- [ ] Gestión completa de usuarios

### 🎨 UI/UX
- [ ] Responsive en desktop, tablet y móvil
- [ ] Accesibilidad WCAG AA
- [ ] Loading states en todas las acciones asíncronas
- [ ] Error handling claro y útil
- [ ] Confirmaciones para acciones destructivas
- [ ] Performance < 3 segundos de carga

### 📝 Documentación
- [ ] Manual de usuario
- [ ] Manual de administrador
- [ ] Guía de configuración inicial
- [ ] Documentación de API (si aplica)

---

## 9. Decisiones de Diseño y Arquitectura

| Decisión | Justificación |
|----------|---------------|
| **Next.js App Router** | SSR, mejoras de SEO, performance mejorado vs Pages Router |
| **Supabase** | Auth + BD + Storage en un solo proveedor, RLS nativo, escalable |
| **n8n para notificaciones** | Flexibilidad de workflows sin código, ya configurado y disponible |
| **SendGrid** | Entregabilidad alta para emails transaccionales y campañas |
| **Twilio** | API de WhatsApp Business confiable y con SDK robusto |
| **Shadcn/ui + Radix** | Componentes accesibles y altamente personalizables |
| **Tailwind CSS 4** | Utility-first CSS, tokens configurables, purge automático |
| **Zod + React Hook Form** | Validación de formularios robusta y con buen DX |

---

## 10. Glosario

| Término | Definición |
|---------|-----------|
| **Organismo** | Clúster, cámara empresarial o asociación registrada en el sistema |
| **Empresa Afiliada** | Empresa que es miembro de un organismo |
| **Membresía** | Cuota anual que paga una empresa para ser parte del organismo |
| **Admisión** | Proceso formal de ingreso de una nueva empresa como socio |
| **Consejo Directivo** | Órgano de gobierno del organismo encargado de aprobar admisiones |
| **Mesa Directiva** | Conjunto de cargos de liderazgo del organismo (presidente, VP, etc.) |
| **Comisión** | Grupo de trabajo formado por empresas miembro con un objetivo específico |
| **CSF** | Constancia de Situación Fiscal (documento SAT México) |
| **Kit de Bienvenida** | Paquete digital de materiales enviado al nuevo socio al ser aceptado |
| **Matching** | Sistema de conexión entre empresas con oferta y demanda complementaria |
| **RLS** | Row Level Security – seguridad a nivel de fila en Supabase/PostgreSQL |
| **n8n** | Plataforma de automatización de workflows (self-hosted) |

---

**Última actualización:** Febrero 2026  
**Próxima revisión:** Marzo 2026  
**Responsable:** XIXIM Tech Cluster — Equipo de Desarrollo  
