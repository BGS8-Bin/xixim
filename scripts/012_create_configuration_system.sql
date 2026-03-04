-- =====================================================
-- SISTEMA DE CONFIGURACIÓN AUTÓNOMO
-- Migración 012: Tablas de configuración del sistema
-- =====================================================

-- =====================================================
-- 1. TABLA: cluster_config
-- Almacena la configuración general del clúster
-- =====================================================
CREATE TABLE IF NOT EXISTS public.cluster_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Información general
  cluster_name TEXT NOT NULL,
  cluster_full_name TEXT,
  description TEXT,
  tagline TEXT,
  
  -- Branding
  logo_url TEXT,
  logo_icon_url TEXT,
  favicon_url TEXT,
  
  -- Paleta de colores
  primary_color TEXT DEFAULT '#3b82f6',
  secondary_color TEXT DEFAULT '#64748b',
  accent_color TEXT DEFAULT '#10b981',
  success_color TEXT DEFAULT '#22c55e',
  warning_color TEXT DEFAULT '#f59e0b',
  error_color TEXT DEFAULT '#ef4444',
  
  -- Información de contacto
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'México',
  postal_code TEXT,
  
  -- Web y redes sociales
  website_url TEXT,
  social_media JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Solo debe haber un registro de configuración
  CONSTRAINT single_config_row CHECK (id = id)
);

-- =====================================================
-- 2. TABLA: system_settings
-- Key-value store flexible para configuraciones
-- =====================================================
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  category TEXT DEFAULT 'general',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_category CHECK (category IN ('general', 'theme', 'email', 'notifications', 'features'))
);

-- =====================================================
-- 3. TABLA: email_templates
-- Plantillas de correo personalizables
-- =====================================================
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  template_type TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_template_type CHECK (
    template_type IN (
      'admission_received',
      'admission_approved',
      'admission_rejected',
      'payment_reminder',
      'event_invitation',
      'event_reminder',
      'welcome_email',
      'membership_renewal',
      'general_communication'
    )
  )
);

-- =====================================================
-- HABILITAR ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.cluster_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS: cluster_config
-- =====================================================

-- Todos los usuarios autenticados pueden leer la configuración
CREATE POLICY "Anyone can view cluster config"
  ON public.cluster_config
  FOR SELECT
  TO authenticated
  USING (true);

-- Solo admins pueden modificar la configuración
CREATE POLICY "Only admins can update cluster config"
  ON public.cluster_config
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can insert cluster config"
  ON public.cluster_config
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- POLÍTICAS RLS: system_settings
-- =====================================================

CREATE POLICY "Anyone can view system settings"
  ON public.system_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify system settings"
  ON public.system_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- POLÍTICAS RLS: email_templates
-- =====================================================

CREATE POLICY "Anyone can view email templates"
  ON public.email_templates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and editors can manage email templates"
  ON public.email_templates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON public.system_settings(key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON public.system_settings(category);
CREATE INDEX IF NOT EXISTS idx_email_templates_type ON public.email_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON public.email_templates(is_active);

-- =====================================================
-- DATOS INICIALES: cluster_config
-- =====================================================
INSERT INTO public.cluster_config (
  cluster_name,
  cluster_full_name,
  description,
  tagline,
  primary_color,
  secondary_color,
  accent_color,
  contact_email,
  contact_phone,
  city,
  state,
  country,
  social_media
) VALUES (
  'XIXIM Tech Cluster',
  'XIXIM Technology Cluster',
  'Clúster de tecnología e innovación en Durango',
  'Innovación que transforma',
  '#3b82f6',
  '#64748b',
  '#10b981',
  'contacto@xixim.tech',
  '+52 618 123 4567',
  'Durango',
  'Durango',
  'México',
  '{"facebook": "", "twitter": "", "linkedin": "", "instagram": ""}'::jsonb
) ON CONFLICT DO NOTHING;

-- =====================================================
-- DATOS INICIALES: email_templates
-- =====================================================
INSERT INTO public.email_templates (name, subject, body, template_type, variables) VALUES
(
  'Solicitud de Admisión Recibida',
  'Tu solicitud ha sido recibida - {{cluster_name}}',
  '<h2>¡Gracias por tu interés!</h2>
  <p>Hola {{applicant_name}},</p>
  <p>Hemos recibido tu solicitud de admisión a <strong>{{cluster_name}}</strong>.</p>
  <p>El Consejo Directivo revisará tu solicitud y te notificaremos el resultado en los próximos días.</p>
  <p>Si tienes alguna duda, contáctanos en {{contact_email}}</p>
  <p>Saludos,<br>Equipo {{cluster_name}}</p>',
  'admission_received',
  '["cluster_name", "applicant_name", "contact_email"]'::jsonb
),
(
  'Solicitud Aprobada',
  '¡Felicidades! Tu solicitud ha sido aprobada - {{cluster_name}}',
  '<h2>¡Bienvenido a {{cluster_name}}!</h2>
  <p>Hola {{applicant_name}},</p>
  <p>Nos complace informarte que tu solicitud de admisión ha sido <strong>aprobada</strong> por el Consejo Directivo.</p>
  <p><strong>Próximos pasos:</strong></p>
  <ul>
    <li>Registrar el pago de membresía</li>
    <li>Completar tu perfil empresarial</li>
    <li>Firmar la carta compromiso</li>
  </ul>
  <p>Ingresa a la plataforma para continuar: {{platform_url}}</p>
  <p>¡Bienvenido a la familia!<br>Equipo {{cluster_name}}</p>',
  'admission_approved',
  '["cluster_name", "applicant_name", "platform_url", "contact_email"]'::jsonb
),
(
  'Solicitud Rechazada',
  'Actualización sobre tu solicitud - {{cluster_name}}',
  '<h2>Actualización de tu solicitud</h2>
  <p>Hola {{applicant_name}},</p>
  <p>Lamentamos informarte que después de revisar tu solicitud, el Consejo Directivo ha decidido no aprobarla en este momento.</p>
  <p><strong>Motivo:</strong> {{rejection_reason}}</p>
  <p>Agradecemos tu interés y te invitamos a volver a aplicar en el futuro.</p>
  <p>Si tienes dudas, contáctanos en {{contact_email}}</p>
  <p>Saludos,<br>Equipo {{cluster_name}}</p>',
  'admission_rejected',
  '["cluster_name", "applicant_name", "rejection_reason", "contact_email"]'::jsonb
),
(
  'Bienvenida al Clúster',
  '¡Bienvenido a {{cluster_name}}!',
  '<h2>¡Bienvenido oficialmente a {{cluster_name}}!</h2>
  <p>Hola {{member_name}},</p>
  <p>Es un placer darte la bienvenida como nuevo miembro de nuestra comunidad.</p>
  <p><strong>Recursos disponibles:</strong></p>
  <ul>
    <li>Acceso completo a la plataforma</li>
    <li>Directorio empresarial</li>
    <li>Eventos y capacitaciones</li>
    <li>Networking con otros miembros</li>
  </ul>
  <p>Explora la plataforma: {{platform_url}}</p>
  <p>¡Éxitos!<br>Equipo {{cluster_name}}</p>',
  'welcome_email',
  '["cluster_name", "member_name", "platform_url"]'::jsonb
);

-- =====================================================
-- FUNCIÓN: Actualizar timestamp automáticamente
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_cluster_config_updated_at
  BEFORE UPDATE ON public.cluster_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
