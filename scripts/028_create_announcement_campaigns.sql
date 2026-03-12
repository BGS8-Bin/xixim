-- Tabla de campañas de envío masivo de avisos
CREATE TABLE IF NOT EXISTS announcement_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relación con el anuncio
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,

  -- Detalles de la campaña
  name TEXT NOT NULL, -- Nombre descriptivo de la campaña
  description TEXT,

  -- Segmentación/Filtros aplicados
  filters JSONB DEFAULT '{}', -- Guarda los filtros aplicados: {membership_status: ['active'], sector: ['software'], etc}
  send_to_all_companies BOOLEAN DEFAULT false,
  send_to_contacts BOOLEAN DEFAULT false, -- Si es true, envía también a los contactos de cada empresa

  -- Estadísticas
  total_recipients INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  emails_failed INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_clicked INTEGER DEFAULT 0,
  whatsapp_sent INTEGER DEFAULT 0,
  whatsapp_failed INTEGER DEFAULT 0,

  -- Estado de la campaña
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled')),

  -- Programación
  scheduled_at TIMESTAMPTZ, -- Si es null, se envía inmediatamente
  started_at TIMESTAMPTZ, -- Cuando empezó el envío
  completed_at TIMESTAMPTZ, -- Cuando terminó el envío

  -- Canales
  send_via_email BOOLEAN DEFAULT true,
  send_via_whatsapp BOOLEAN DEFAULT false,

  -- Configuración de SendGrid
  sendgrid_template_id TEXT, -- ID de la plantilla de SendGrid a usar

  -- Metadatos
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de destinatarios de campaña (tracking individual)
CREATE TABLE IF NOT EXISTS announcement_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relación con la campaña
  campaign_id UUID NOT NULL REFERENCES announcement_campaigns(id) ON DELETE CASCADE,

  -- Destinatario
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES company_contacts(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  recipient_phone TEXT, -- Para WhatsApp

  -- Estado del envío
  email_status TEXT DEFAULT 'pending' CHECK (email_status IN ('pending', 'sent', 'failed', 'bounced', 'opened', 'clicked')),
  whatsapp_status TEXT DEFAULT 'pending' CHECK (whatsapp_status IN ('pending', 'sent', 'failed', 'delivered', 'read')),

  -- IDs de tracking de servicios externos
  sendgrid_message_id TEXT,
  twilio_message_sid TEXT,

  -- Timestamps de eventos
  email_sent_at TIMESTAMPTZ,
  email_opened_at TIMESTAMPTZ,
  email_clicked_at TIMESTAMPTZ,
  whatsapp_sent_at TIMESTAMPTZ,

  -- Detalles de error si falló
  error_message TEXT,

  -- Metadatos
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de eventos de tracking (webhooks de SendGrid/Twilio)
CREATE TABLE IF NOT EXISTS announcement_tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relación con el destinatario
  recipient_id UUID NOT NULL REFERENCES announcement_recipients(id) ON DELETE CASCADE,

  -- Tipo de evento
  event_type TEXT NOT NULL, -- 'delivered', 'opened', 'clicked', 'bounced', 'spam', etc
  event_source TEXT NOT NULL CHECK (event_source IN ('sendgrid', 'twilio', 'manual')),

  -- Datos del evento
  event_data JSONB, -- Datos completos del webhook
  user_agent TEXT,
  ip_address TEXT,
  url_clicked TEXT, -- Si es un click, qué URL se clickeó

  -- Timestamp
  event_timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE announcement_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_tracking_events ENABLE ROW LEVEL SECURITY;

-- Función utilitaria para crear políticas de forma segura
CREATE OR REPLACE FUNCTION create_policy_if_not_exists(
    policy_name text,
    table_name text,
    cmd text,
    role_name text,
    qual text,
    with_check text
)
RETURNS void AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE policyname = policy_name
        AND tablename = table_name
    ) THEN
        IF with_check IS NOT NULL AND qual IS NOT NULL THEN
            EXECUTE format('CREATE POLICY %I ON %I FOR %s TO %s USING (%s) WITH CHECK (%s)',
                policy_name, table_name, cmd, role_name, qual, with_check);
        ELSIF with_check IS NOT NULL THEN
            EXECUTE format('CREATE POLICY %I ON %I FOR %s TO %s WITH CHECK (%s)',
                policy_name, table_name, cmd, role_name, with_check);
        ELSIF qual IS NOT NULL THEN
            EXECUTE format('CREATE POLICY %I ON %I FOR %s TO %s USING (%s)',
                policy_name, table_name, cmd, role_name, qual);
        ELSE
            EXECUTE format('CREATE POLICY %I ON %I FOR %s TO %s',
                policy_name, table_name, cmd, role_name);
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Políticas para announcement_campaigns
SELECT create_policy_if_not_exists(
  'Admins and editors can view campaigns', 'announcement_campaigns', 'SELECT', 'authenticated', 
  'EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN (''admin'', ''editor''))', NULL
);

SELECT create_policy_if_not_exists(
  'Admins and editors can create campaigns', 'announcement_campaigns', 'INSERT', 'authenticated', 
  NULL, 'EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN (''admin'', ''editor''))'
);

SELECT create_policy_if_not_exists(
  'Admins and editors can update campaigns', 'announcement_campaigns', 'UPDATE', 'authenticated', 
  'EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN (''admin'', ''editor''))', NULL
);

SELECT create_policy_if_not_exists(
  'Admins can delete campaigns', 'announcement_campaigns', 'DELETE', 'authenticated', 
  'EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = ''admin'')', NULL
);

-- Políticas para announcement_recipients
SELECT create_policy_if_not_exists(
  'Admins and editors can view recipients', 'announcement_recipients', 'SELECT', 'authenticated', 
  'EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN (''admin'', ''editor''))', NULL
);

SELECT create_policy_if_not_exists(
  'System can manage recipients', 'announcement_recipients', 'ALL', 'authenticated', 
  'EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN (''admin'', ''editor''))', NULL
);

-- Políticas para announcement_tracking_events
SELECT create_policy_if_not_exists(
  'Admins and editors can view tracking events', 'announcement_tracking_events', 'SELECT', 'authenticated', 
  'EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN (''admin'', ''editor''))', NULL
);

SELECT create_policy_if_not_exists(
  'System can insert tracking events', 'announcement_tracking_events', 'INSERT', 'authenticated', 
  NULL, 'true'
);

-- Limpiar función utilitaria
DROP FUNCTION IF EXISTS create_policy_if_not_exists(text, text, text, text, text, text);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_campaigns_announcement ON announcement_campaigns(announcement_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON announcement_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_scheduled ON announcement_campaigns(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON announcement_campaigns(created_by);

CREATE INDEX IF NOT EXISTS idx_recipients_campaign ON announcement_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_recipients_company ON announcement_recipients(company_id);
CREATE INDEX IF NOT EXISTS idx_recipients_email_status ON announcement_recipients(email_status);
CREATE INDEX IF NOT EXISTS idx_recipients_sendgrid_id ON announcement_recipients(sendgrid_message_id);

CREATE INDEX IF NOT EXISTS idx_tracking_recipient ON announcement_tracking_events(recipient_id);
CREATE INDEX IF NOT EXISTS idx_tracking_event_type ON announcement_tracking_events(event_type);
CREATE INDEX IF NOT EXISTS idx_tracking_timestamp ON announcement_tracking_events(event_timestamp DESC);

-- Triggers para updated_at
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON announcement_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipients_updated_at
  BEFORE UPDATE ON announcement_recipients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar estadísticas de la campaña automáticamente
CREATE OR REPLACE FUNCTION update_campaign_statistics()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar contadores cuando cambia el estado de un recipient
  UPDATE announcement_campaigns
  SET
    emails_sent = (
      SELECT COUNT(*) FROM announcement_recipients
      WHERE campaign_id = NEW.campaign_id AND email_status NOT IN ('pending', 'failed')
    ),
    emails_failed = (
      SELECT COUNT(*) FROM announcement_recipients
      WHERE campaign_id = NEW.campaign_id AND email_status = 'failed'
    ),
    emails_opened = (
      SELECT COUNT(*) FROM announcement_recipients
      WHERE campaign_id = NEW.campaign_id AND email_status IN ('opened', 'clicked')
    ),
    emails_clicked = (
      SELECT COUNT(*) FROM announcement_recipients
      WHERE campaign_id = NEW.campaign_id AND email_status = 'clicked'
    ),
    whatsapp_sent = (
      SELECT COUNT(*) FROM announcement_recipients
      WHERE campaign_id = NEW.campaign_id AND whatsapp_status NOT IN ('pending', 'failed')
    ),
    whatsapp_failed = (
      SELECT COUNT(*) FROM announcement_recipients
      WHERE campaign_id = NEW.campaign_id AND whatsapp_status = 'failed'
    ),
    updated_at = NOW()
  WHERE id = NEW.campaign_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar estadísticas cuando cambia un recipient
CREATE TRIGGER update_campaign_stats_on_recipient_change
  AFTER INSERT OR UPDATE ON announcement_recipients
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_statistics();

-- Comentarios en las tablas
COMMENT ON TABLE announcement_campaigns IS 'Campañas de envío masivo de avisos a empresas';
COMMENT ON TABLE announcement_recipients IS 'Destinatarios individuales de cada campaña con tracking';
COMMENT ON TABLE announcement_tracking_events IS 'Eventos de tracking de emails y WhatsApp (webhooks)';

COMMENT ON COLUMN announcement_campaigns.filters IS 'Filtros aplicados en formato JSON: {membership_status: ["active"], sector: ["software"], etc}';
COMMENT ON COLUMN announcement_campaigns.send_to_contacts IS 'Si es true, envía a todos los contactos de cada empresa, no solo al email principal';
COMMENT ON COLUMN announcement_recipients.email_status IS 'Estado del email: pending, sent, failed, bounced, opened, clicked';
COMMENT ON COLUMN announcement_recipients.whatsapp_status IS 'Estado del WhatsApp: pending, sent, failed, delivered, read';
