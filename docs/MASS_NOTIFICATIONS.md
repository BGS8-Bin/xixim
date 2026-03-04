# Módulo de Envío Masivo de Avisos

Sistema completo para enviar avisos/anuncios de forma masiva a todas las empresas afiliadas al cluster XIXIM, con segmentación de audiencia, múltiples canales de envío y tracking detallado.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Arquitectura](#arquitectura)
- [Configuración Inicial](#configuración-inicial)
- [Uso del Sistema](#uso-del-sistema)
- [Estructura de Base de Datos](#estructura-de-base-de-datos)
- [API Reference](#api-reference)
- [Componentes](#componentes)
- [Límites y Restricciones](#límites-y-restricciones)
- [Troubleshooting](#troubleshooting)

---

## ✨ Características

### 🎯 Segmentación de Audiencia
- **Envío a todas las empresas:** Selección rápida de todas las empresas registradas
- **Filtros avanzados:**
  - Estado de membresía (activo, pendiente, inactivo, suspendido)
  - Tipo de membresía (básica, premium, enterprise)
  - Sector empresarial (software, hardware, telecomunicaciones, etc.)
  - Tamaño de empresa (micro, pequeña, mediana, grande)
  - Ubicación (ciudad, estado)
- **Contactos adicionales:** Opción de enviar también a todos los contactos registrados de cada empresa

### 📧 Canales de Envío
- **Email (SendGrid):**
  - Envío en lotes con rate limiting
  - Plantillas HTML profesionales
  - Tracking de aperturas y clicks
  - Soporte para templates personalizados de SendGrid
- **WhatsApp (Twilio):**
  - Envío opcional para avisos urgentes
  - Mensajes de texto optimizados
  - Tracking de entrega y lectura

### 📊 Analytics y Tracking
- **Estadísticas en tiempo real:**
  - Total de destinatarios
  - Emails enviados/fallidos
  - Tasa de apertura
  - Clicks en enlaces
  - WhatsApp enviados/fallidos
- **Historial completo:**
  - Todas las campañas por anuncio
  - Detalles de cada envío
  - Timeline de eventos

### ⏰ Programación
- **Envío inmediato:** Ejecución instantánea de la campaña
- **Envío programado:** Configurar fecha y hora de envío futuro

### 🛡️ Seguridad y Permisos
- Solo usuarios con rol `admin` o `editor` pueden enviar campañas
- Validación de anuncios publicados
- Confirmación antes de envío masivo
- Row Level Security (RLS) en Supabase

---

## 🏗️ Arquitectura

### Stack Tecnológico
```
Frontend:
  - Next.js 16 (App Router)
  - React 19
  - TypeScript
  - Tailwind CSS
  - Shadcn/UI

Backend:
  - Supabase (PostgreSQL)
  - SendGrid API
  - Twilio API

Servicios:
  - NotificationService: Envío de emails y WhatsApp
  - CampaignService: Gestión de campañas
```

### Flujo de Datos
```
Usuario → Modal → API Route → CampaignService → NotificationService → SendGrid/Twilio
                        ↓
                  Supabase (tracking)
                        ↓
                  Dashboard (stats)
```

### Estructura de Archivos
```
crm-for-business-clusters/
├── scripts/
│   └── 028_create_announcement_campaigns.sql  # Schema de DB
├── lib/types/
│   └── database.ts                            # TypeScript types
├── features/
│   ├── notifications/services/
│   │   └── notification.service.ts            # Envío de emails/WhatsApp
│   └── campaigns/services/
│       └── campaign.service.ts                # Lógica de campañas
├── app/api/
│   ├── announcements/[id]/
│   │   ├── send/route.ts                      # Crear y enviar campaña
│   │   ├── test/route.ts                      # Enviar email de prueba
│   │   └── campaign-status/route.ts           # Estado de campañas
│   └── companies/filters/route.ts             # Filtros disponibles
├── components/campaigns/
│   ├── audience-selector.tsx                  # Selector de audiencia
│   ├── send-campaign-dialog.tsx               # Modal de envío
│   └── campaigns-dashboard.tsx                # Dashboard de stats
└── app/dashboard/comunicacion/[id]/
    ├── page.tsx                               # Página de detalle
    └── send-campaign-button.tsx               # Botón de envío
```

---

## 🚀 Configuración Inicial

### 1. Ejecutar Migraciones de Base de Datos

Ejecuta el script SQL en tu base de datos Supabase:

```bash
# Desde la consola SQL de Supabase
scripts/028_create_announcement_campaigns.sql
```

Este script crea las siguientes tablas:
- `announcement_campaigns`: Campañas de envío
- `announcement_recipients`: Destinatarios individuales
- `announcement_tracking_events`: Eventos de tracking

### 2. Configurar Variables de Entorno

En tu archivo `.env.local`:

```env
# SendGrid (requerido para email)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@xixim.com
SENDGRID_FROM_NAME=XIXIM Cluster

# Twilio (opcional para WhatsApp)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

### 3. Verificar Permisos

Asegúrate de que tu usuario tenga rol `admin` o `editor` en la tabla `profiles`:

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'tu-email@ejemplo.com';
```

### 4. Verificar SendGrid Templates (Opcional)

Si quieres usar templates personalizados de SendGrid, configura:

```env
SENDGRID_TEMPLATE_ANNOUNCEMENT=d-xxxxxxxxxxxxx
```

---

## 📖 Uso del Sistema

### Paso 1: Crear un Anuncio

1. Ve a **Dashboard → Comunicación**
2. Click en **"Nuevo Anuncio"**
3. Completa el formulario:
   - Título
   - Contenido (editor rich text)
   - Tipo (general, evento, oportunidad, etc.)
   - Prioridad (baja, normal, alta, urgente)
4. **Importante:** Marca el estado como **"Publicado"**
5. Guarda el anuncio

### Paso 2: Acceder al Detalle del Anuncio

Desde la lista de anuncios:
- Click en el menú de acciones (⋮)
- Selecciona **"Ver Detalle"**

O click directo en **"Enviar a Empresas"** (solo para anuncios publicados)

### Paso 3: Configurar el Envío Masivo

El modal de envío tiene 3 pasos:

#### **Paso 1: Seleccionar Audiencia**

**Opción A: Todas las Empresas**
- Marca "Enviar a todas las empresas afiliadas"
- Se enviará a todas las empresas sin filtros

**Opción B: Audiencia Filtrada**
- Desmarca "Todas las empresas"
- Selecciona uno o más filtros:
  ```
  ✓ Estado de Membresía:
    □ Activo (127 empresas)
    □ Pendiente (15 empresas)

  ✓ Tipo de Membresía:
    □ Básica (45 empresas)
    □ Premium (82 empresas)

  ✓ Sector:
    □ Software (34 empresas)
    □ Hardware (12 empresas)
    □ Telecomunicaciones (28 empresas)
  ```

**Contactos Adicionales:**
- Marca "Incluir contactos adicionales" para enviar también a:
  - Contactos secundarios de cada empresa
  - Responsables de área
  - Todo el equipo registrado

#### **Paso 2: Opciones de Envío**

**Nombre de Campaña:**
```
Campaña: [Título del Anuncio]
```
Puedes personalizar el nombre para identificar el envío.

**Canales de Envío:**
- ✅ **Email:** Recomendado, siempre activado por defecto
- ⬜ **WhatsApp:** Solo para avisos urgentes (opcional)

**Programación:**
- **Envío inmediato:** Dejar vacío el campo de fecha
- **Envío programado:** Seleccionar fecha y hora futura
  ```
  📅 2024-04-15  ⏰ 09:00 AM
  ```

#### **Paso 3: Confirmar**

Revisa el resumen:
```
Nombre: Campaña: Nueva Oportunidad de Negocio
Audiencia: Todas las empresas
Canales: Email, WhatsApp
Programación: Envío inmediato
Destinatarios: 127 empresas
```

Click en **"Enviar Ahora"** o **"Programar Envío"**

### Paso 4: Enviar Email de Prueba (Opcional)

Antes de enviar masivamente:
1. En el Paso 1, click en **"Enviar Prueba"**
2. Se enviará un email de prueba a tu correo
3. Revisa formato, contenido y links
4. Continúa con el envío masivo

### Paso 5: Monitorear el Envío

El sistema procesa en background:
- **Lotes de 50 emails** con 1 segundo de delay
- **Lotes de 20 WhatsApp** con 2 segundos de delay

**Dashboard en tiempo real:**
```
Total Campañas: 1
Emails Enviados: 127/127
Tasa de Apertura: 45%
WhatsApp Enviados: 89/127
```

**Tabla de progreso:**
| Nombre | Estado | Progreso | Tasa Apertura |
|--------|--------|----------|---------------|
| Campaña: Nueva Oportunidad | Enviando | 87% | - |

---

## 🗄️ Estructura de Base de Datos

### Tabla: `announcement_campaigns`

```sql
id                    UUID PRIMARY KEY
announcement_id       UUID (FK → announcements)
name                  TEXT
description           TEXT
filters               JSONB -- {membership_status: ['active'], sector: ['software']}
send_to_all_companies BOOLEAN
send_to_contacts      BOOLEAN
total_recipients      INTEGER
emails_sent           INTEGER
emails_failed         INTEGER
emails_opened         INTEGER
emails_clicked        INTEGER
whatsapp_sent         INTEGER
whatsapp_failed       INTEGER
status                TEXT -- draft, scheduled, sending, sent, failed, cancelled
scheduled_at          TIMESTAMPTZ
started_at            TIMESTAMPTZ
completed_at          TIMESTAMPTZ
send_via_email        BOOLEAN
send_via_whatsapp     BOOLEAN
sendgrid_template_id  TEXT
created_by            UUID (FK → profiles)
created_at            TIMESTAMPTZ
updated_at            TIMESTAMPTZ
```

### Tabla: `announcement_recipients`

```sql
id                    UUID PRIMARY KEY
campaign_id           UUID (FK → announcement_campaigns)
company_id            UUID (FK → companies)
contact_id            UUID (FK → company_contacts)
recipient_email       TEXT
recipient_name        TEXT
recipient_phone       TEXT
email_status          TEXT -- pending, sent, failed, bounced, opened, clicked
whatsapp_status       TEXT -- pending, sent, failed, delivered, read
sendgrid_message_id   TEXT
twilio_message_sid    TEXT
email_sent_at         TIMESTAMPTZ
email_opened_at       TIMESTAMPTZ
email_clicked_at      TIMESTAMPTZ
whatsapp_sent_at      TIMESTAMPTZ
error_message         TEXT
created_at            TIMESTAMPTZ
updated_at            TIMESTAMPTZ
```

### Tabla: `announcement_tracking_events`

```sql
id               UUID PRIMARY KEY
recipient_id     UUID (FK → announcement_recipients)
event_type       TEXT -- delivered, opened, clicked, bounced, spam
event_source     TEXT -- sendgrid, twilio, manual
event_data       JSONB
user_agent       TEXT
ip_address       TEXT
url_clicked      TEXT
event_timestamp  TIMESTAMPTZ
created_at       TIMESTAMPTZ
```

---

## 🔌 API Reference

### POST `/api/announcements/[id]/send`

Crea y ejecuta una campaña de envío masivo.

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "name": "Campaña: Nuevo Producto",
  "description": "Lanzamiento de nuevo producto",
  "filters": {
    "membership_status": ["active"],
    "sector": ["software", "hardware"]
  },
  "sendToAllCompanies": false,
  "sendToContacts": true,
  "sendViaEmail": true,
  "sendViaWhatsapp": false,
  "sendgridTemplateId": "d-xxxxx", // opcional
  "scheduledAt": "2024-04-15T09:00:00Z", // opcional
  "executeImmediately": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Campaña iniciada exitosamente",
  "campaign": {
    "id": "uuid",
    "name": "Campaña: Nuevo Producto",
    "totalRecipients": 45,
    "status": "sending"
  }
}
```

### POST `/api/announcements/[id]/test`

Envía un email de prueba.

**Body:**
```json
{
  "testEmail": "tu-email@ejemplo.com" // opcional, usa el email del usuario actual
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email de prueba enviado exitosamente a tu-email@ejemplo.com",
  "messageId": "sendgrid-message-id"
}
```

### GET `/api/announcements/[id]/campaign-status`

Obtiene el estado de todas las campañas de un anuncio.

**Response:**
```json
{
  "success": true,
  "campaigns": [
    {
      "id": "uuid",
      "name": "Campaña: Nuevo Producto",
      "status": "sent",
      "total_recipients": 45,
      "emails_sent": 45,
      "emails_failed": 0,
      "emails_opened": 23,
      "emails_clicked": 12,
      "created_at": "2024-04-01T10:00:00Z",
      "started_at": "2024-04-01T10:01:00Z",
      "completed_at": "2024-04-01T10:15:00Z",
      "creator": {
        "first_name": "Juan",
        "last_name": "Pérez",
        "email": "juan@xixim.com"
      }
    }
  ]
}
```

### GET `/api/companies/filters`

Obtiene valores únicos para filtros de empresas.

**Response:**
```json
{
  "success": true,
  "filters": {
    "membership_status": [
      { "value": "active", "label": "Activo", "count": 127 },
      { "value": "pending", "label": "Pendiente", "count": 15 }
    ],
    "membership_type": [
      { "value": "basica", "label": "Básica", "count": 45 },
      { "value": "premium", "label": "Premium", "count": 82 }
    ],
    "sector": [
      { "value": "software", "label": "Software", "count": 34 },
      { "value": "hardware", "label": "Hardware", "count": 12 }
    ]
  },
  "totalCompanies": 127
}
```

---

## 🧩 Componentes

### `<AudienceSelector />`

Componente client-side para seleccionar filtros de audiencia.

**Props:**
```typescript
interface AudienceSelectorProps {
  filters: CampaignFilters
  sendToAllCompanies: boolean
  onFiltersChange: (filters: CampaignFilters) => void
  onSendToAllChange: (sendToAll: boolean) => void
  totalCompaniesCount?: number
}
```

### `<SendCampaignDialog />`

Modal completo de 3 pasos para configurar y enviar campaña.

**Props:**
```typescript
interface SendCampaignDialogProps {
  announcementId: string
  announcementTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}
```

### `<CampaignsDashboard />`

Dashboard con estadísticas y tabla de campañas.

**Props:**
```typescript
interface CampaignsDashboardProps {
  announcementId: string
}
```

---

## ⚠️ Límites y Restricciones

### SendGrid
| Plan | Emails/Día | Emails/Mes | Precio |
|------|-----------|------------|--------|
| Free | 100 | 3,000 | $0 |
| Essentials | 1,666 | 50,000 | $19.95/mes |
| Pro | 3,333 | 100,000 | $89.95/mes |

**Rate Limits del Sistema:**
- Lotes de 50 emails
- 1 segundo de delay entre lotes
- ~3,000 emails por hora máximo

### Twilio
- ~1,000 mensajes por hora (sandbox)
- ~10,000 mensajes por hora (producción)
- Costo: ~$0.005 USD por mensaje

**Rate Limits del Sistema:**
- Lotes de 20 WhatsApp
- 2 segundos de delay entre lotes
- ~600 mensajes por hora

### Restricciones del Sistema
- Solo usuarios `admin` o `editor`
- Anuncios deben estar en estado `published`
- Máximo 500 destinatarios por lote en base de datos

---

## 🔧 Troubleshooting

### Error: "SendGrid API Key no configurada"

**Solución:**
1. Verifica `.env.local`:
   ```env
   SENDGRID_API_KEY=SG.xxxxx
   ```
2. Reinicia el servidor de desarrollo
3. El sistema usará modo mock si no hay API key

### Error: "No se encontraron empresas"

**Posibles causas:**
- Filtros demasiado restrictivos
- No hay empresas que cumplan los criterios

**Solución:**
1. Revisa los filtros seleccionados
2. Usa "Enviar a todas las empresas"
3. Verifica que hay empresas en la base de datos:
   ```sql
   SELECT COUNT(*) FROM companies;
   ```

### Emails no se envían

**Diagnóstico:**
1. Revisa logs del servidor:
   ```
   📧 Iniciando envío masivo de 50 emails en lotes de 50
   📦 Procesando lote 1/1 (50 emails)
   ✅ Enviados: 50, ❌ Fallidos: 0
   ```

2. Verifica estado en la tabla:
   ```sql
   SELECT email_status, COUNT(*)
   FROM announcement_recipients
   WHERE campaign_id = 'uuid'
   GROUP BY email_status;
   ```

3. Revisa SendGrid Dashboard para errores

### Tasa de apertura al 0%

**Causa:**
- Tracking de SendGrid no está habilitado
- Emails marcados como spam

**Solución:**
1. Habilita tracking en SendGrid:
   - Settings → Tracking
   - ✅ Open Tracking
   - ✅ Click Tracking
2. Verifica dominio autenticado
3. Revisa DKIM/SPF records

---

## 📚 Referencias

- [SendGrid API Docs](https://docs.sendgrid.com/api-reference)
- [Twilio WhatsApp API](https://www.twilio.com/docs/whatsapp)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js App Router](https://nextjs.org/docs/app)

---

## 📝 Changelog

### v1.0.0 (2024-02-26)
- ✨ Implementación completa del módulo de envío masivo
- 📊 Dashboard de analytics y tracking
- 🎯 Segmentación avanzada de audiencia
- 📧 Integración con SendGrid
- 📱 Integración con Twilio WhatsApp
- ⏰ Programación de envíos
- 🧪 Modo de prueba

---

## 👥 Soporte

Para reportar bugs o solicitar nuevas funcionalidades, contacta al equipo de desarrollo de XIXIM.
