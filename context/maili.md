📋 RESUMEN EJECUTIVO

  Objetivo: Implementar funcionalidad de envío masivo de avisos por correo electrónico a todas las
  empresas afiliadas al cluster.

  Estado actual:
  - ✅ Ya tienes SendGrid configurado
  - ✅ Ya tienes el módulo de avisos (announcements)
  - ✅ Ya tienes el módulo de empresas con emails
  - ✅ Ya tienes NotificationService básico
  - ❌ NO existe funcionalidad de envío masivo
  - ❌ NO existe segmentación de audiencia
  - ❌ NO existe seguimiento de entregas

  ---
  🎯 SUGERENCIAS Y MEJORES PRÁCTICAS

  1. Segmentación de Audiencia

  Permitir filtrar empresas por:
  - ✅ Estado de membresía (active, pending, inactive, suspended)
  - ✅ Tipo de membresía (básica, premium, enterprise)
  - ✅ Sector (software, hardware, telecomunicaciones, etc.)
  - ✅ Tamaño (micro, pequeña, mediana, grande)
  - ✅ Ciudad/Estado
  - ✅ Selección manual individual

  2. Canales de Envío

  - Email principal: Siempre enviar al email de la empresa
  - Contactos adicionales: Opcionalmente enviar a todos los contactos de la empresa
  - WhatsApp: Opcional, solo si el anuncio es urgente

  3. Plantillas de Email

  Crear plantillas SendGrid profesionales:
  - Template para avisos generales
  - Template para eventos
  - Template para oportunidades
  - Template para convocatorias
  - Template para noticias urgentes

  4. Rate Limiting y Seguridad

  - Límite de 500 emails por minuto (límite de SendGrid para planes básicos)
  - Procesar envíos en lotes (batches) de 50-100
  - Solo usuarios con rol admin o editor pueden enviar masivamente
  - Confirmación obligatoria antes de enviar
  - Registro de auditoría de todos los envíos

  5. Seguimiento y Analytics

  - Guardar registro de cada envío
  - Estado: pending, sending, sent, failed
  - Tracking de emails abiertos (SendGrid lo soporta)
  - Tracking de clicks en enlaces
  - Dashboard con estadísticas

  6. Preview y Testing

  - Vista previa del email antes de enviar
  - Opción "Enviar prueba" a tu propio email
  - Mostrar contador de destinatarios antes de enviar

  7. Programación de Envíos

  - Opción de envío inmediato
  - Opción de programar para fecha/hora específica
  - Usar cron jobs o scheduled tasks

  ---
  🏗️ ARQUITECTURA PROPUESTA

  Base de Datos

  announcements (existente)
    ↓
  announcement_campaigns (nueva)
    ├─ announcement_id
    ├─ sent_to_count
    ├─ filters_applied
    ├─ status
    ├─ scheduled_at
    └─ sent_at
    ↓
  announcement_recipients (nueva)
    ├─ campaign_id
    ├─ company_id
    ├─ email
    ├─ status (pending, sent, failed, opened, clicked)
    ├─ sendgrid_message_id
    └─ sent_at

  API Routes

  POST   /api/announcements/[id]/send
  POST   /api/announcements/[id]/schedule
  POST   /api/announcements/[id]/test
  GET    /api/announcements/[id]/campaign-status
  GET    /api/companies/filters (para obtener empresas filtradas)

  Servicios

  NotificationService (extender)
    ├─ sendBulkEmails()
    ├─ sendBulkWhatsApp()
    └─ processEmailBatch()

  CampaignService (nuevo)
    ├─ createCampaign()
    ├─ getRecipients()
    ├─ scheduleCampaign()
    └─ trackCampaign()

  ---
  📦 COMPONENTES UI

  1. Botón "Enviar a Empresas" en /dashboard/comunicacion/[id]

  - Solo visible si el aviso está publicado
  - Solo para admins/editores
  - Abre modal de configuración

  2. Modal de Configuración de Envío

  - Paso 1: Seleccionar audiencia (filtros)
  - Paso 2: Vista previa y confirmación
  - Paso 3: Opciones (inmediato/programado)

  3. Dashboard de Campañas

  - Lista de envíos realizados
  - Estadísticas en tiempo real
  - Filtros por fecha, estado, tipo

  ---
  🚀 PLAN DE IMPLEMENTACIÓN PASO A PASO

  Te sugiero implementarlo en 3 fases:

  FASE 1: Fundamentos (Lo básico funcional)

  1. Crear tablas de base de datos
  2. Crear tipos TypeScript
  3. Extender NotificationService
  4. API route básico de envío
  5. Botón y modal simple de envío

  FASE 2: Filtros y Segmentación (Más control)

  6. Filtros de audiencia
  7. Preview de destinatarios
  8. Envío de prueba
  9. Confirmación con contador

  FASE 3: Analytics y Avanzado (Profesional)

  10. Dashboard de campañas
  11. Tracking de aperturas y clicks
  12. Programación de envíos
  13. Plantillas personalizadas

  ---
  ⚠️ CONSIDERACIONES IMPORTANTES

  SendGrid

  - Plan gratuito: 100 emails/día
  - Plan Essentials: $19.95/mes - 50,000 emails/mes
  - Plan Pro: $89.95/mes - 100,000 emails/mes
  - Verifica tu plan actual y límites

  Compliance (Cumplimiento)

  - ✅ Incluir botón de "Cancelar suscripción" (opcional, depende del país)
  - ✅ Política de privacidad
  - ✅ Solo enviar a empresas activas por defecto
  - ✅ Respetar preferencias de notificación (futura mejora)

  Performance

  - Para 100+ empresas: Usar procesamiento en background
  - Para 1000+ empresas: Considerar queue system (Bull/BullMQ)

  ---
  🎨 MOCKUP DE INTERFAZ

  ┌─────────────────────────────────────────┐
  │  Aviso: "Nueva Oportunidad de Negocio" │
  ├─────────────────────────────────────────┤
  │  [Editar] [Archivar] [📧 Enviar a Empresas] │
  └─────────────────────────────────────────┘

  Modal:
  ┌────────────────────────────────────────────┐
  │  Enviar Aviso a Empresas                   │
  ├────────────────────────────────────────────┤
  │  1️⃣ Seleccionar Audiencia                  │
  │                                            │
  │  ☑ Todas las empresas (127)               │
  │  ☐ Filtrar por criterios                  │
  │                                            │
  │  [Filtros si se activa:]                  │
  │  Estado: [Active ▼]                       │
  │  Membresía: [Todas ▼]                     │
  │  Sector: [Todos ▼]                        │
  │                                            │
  │  📊 Destinatarios: 127 empresas            │
  │                                            │
  │  2️⃣ Opciones de Envío                      │
  │  ○ Enviar ahora                           │
  │  ○ Programar para: [__ fecha/hora __]     │
  │                                            │
  │  ☑ Incluir contactos adicionales          │
  │  ☐ Enviar también por WhatsApp (urgente)  │
  │                                            │
  │  [Enviar Prueba] [Cancelar] [📧 Enviar]   │
  └────────────────────────────────────────────┘