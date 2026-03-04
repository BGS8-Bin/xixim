-- ================================================
-- Script: 016_create_access_control_system.sql
-- Descripción: Sistema completo de control de accesos y gestión de usuarios
-- Fecha: Febrero 2026
-- Versión: 1.0
-- ================================================

-- ========================================
-- 1. TABLA: role_permissions
-- Plantilla de permisos por defecto para cada rol
-- ========================================

CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  module TEXT NOT NULL,
  can_create BOOLEAN DEFAULT false,
  can_read BOOLEAN DEFAULT true,
  can_update BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  can_export BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(role, module),
  CHECK (role IN ('super_admin', 'admin', 'editor', 'viewer', 'coordinador_cce')),
  CHECK (module IN ('organizaciones', 'empresas', 'admisiones', 'eventos', 'comunicacion', 'reportes', 'usuarios', 'configuracion', 'documentos', 'pagos'))
);

-- Índices para optimizar queries
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role);
CREATE INDEX IF NOT EXISTS idx_role_permissions_module ON role_permissions(module);

-- RLS: Solo super_admin puede modificar permisos de roles
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage role permissions"
  ON role_permissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "All authenticated users can view role permissions"
  ON role_permissions FOR SELECT
  USING (auth.role() = 'authenticated');

-- ========================================
-- 2. INSERTAR PERMISOS POR DEFECTO
-- ========================================

-- SUPER ADMIN: Acceso total a todo
INSERT INTO role_permissions (role, module, can_create, can_read, can_update, can_delete, can_export, description) VALUES
('super_admin', 'organizaciones', true, true, true, true, true, 'Control total de organismos'),
('super_admin', 'empresas', true, true, true, true, true, 'Control total de empresas'),
('super_admin', 'admisiones', true, true, true, true, true, 'Control total de admisiones'),
('super_admin', 'eventos', true, true, true, true, true, 'Control total de eventos'),
('super_admin', 'comunicacion', true, true, true, true, true, 'Control total de comunicación'),
('super_admin', 'reportes', true, true, true, true, true, 'Control total de reportes'),
('super_admin', 'usuarios', true, true, true, true, true, 'Control total de usuarios'),
('super_admin', 'configuracion', true, true, true, true, true, 'Control total de configuración'),
('super_admin', 'documentos', true, true, true, true, true, 'Control total de documentos'),
('super_admin', 'pagos', true, true, true, true, true, 'Control total de pagos')
ON CONFLICT (role, module) DO NOTHING;

-- ADMIN: Control completo de su organismo
INSERT INTO role_permissions (role, module, can_create, can_read, can_update, can_delete, can_export, description) VALUES
('admin', 'organizaciones', false, true, true, false, true, 'Solo puede editar su organismo'),
('admin', 'empresas', true, true, true, true, true, 'Control total de empresas de su organismo'),
('admin', 'admisiones', true, true, true, true, true, 'Gestión completa de admisiones'),
('admin', 'eventos', true, true, true, true, true, 'Gestión completa de eventos'),
('admin', 'comunicacion', true, true, true, true, true, 'Gestión completa de comunicación'),
('admin', 'reportes', false, true, false, false, true, 'Ver y exportar reportes'),
('admin', 'usuarios', true, true, true, false, false, 'Gestión de usuarios de su organismo'),
('admin', 'configuracion', false, true, true, false, false, 'Configuración limitada de su organismo'),
('admin', 'documentos', true, true, true, true, true, 'Gestión completa de documentos'),
('admin', 'pagos', true, true, true, false, true, 'Gestión de pagos de su organismo')
ON CONFLICT (role, module) DO NOTHING;

-- EDITOR: Puede crear y editar contenido
INSERT INTO role_permissions (role, module, can_create, can_read, can_update, can_delete, can_export, description) VALUES
('editor', 'organizaciones', false, true, false, false, false, 'Solo lectura de organismos'),
('editor', 'empresas', true, true, true, false, true, 'Crear y editar empresas'),
('editor', 'admisiones', false, true, true, false, false, 'Editar admisiones existentes'),
('editor', 'eventos', true, true, true, false, true, 'Gestión de eventos'),
('editor', 'comunicacion', true, true, true, false, false, 'Crear comunicados'),
('editor', 'reportes', false, true, false, false, true, 'Ver y exportar reportes'),
('editor', 'usuarios', false, true, false, false, false, 'Solo lectura de usuarios'),
('editor', 'configuracion', false, true, false, false, false, 'Solo lectura de configuración'),
('editor', 'documentos', true, true, true, false, false, 'Gestión de documentos'),
('editor', 'pagos', false, true, false, false, false, 'Solo lectura de pagos')
ON CONFLICT (role, module) DO NOTHING;

-- VIEWER: Solo lectura
INSERT INTO role_permissions (role, module, can_create, can_read, can_update, can_delete, can_export, description) VALUES
('viewer', 'organizaciones', false, true, false, false, false, 'Solo lectura'),
('viewer', 'empresas', false, true, false, false, false, 'Solo lectura'),
('viewer', 'admisiones', false, true, false, false, false, 'Solo lectura'),
('viewer', 'eventos', false, true, false, false, false, 'Solo lectura'),
('viewer', 'comunicacion', false, true, false, false, false, 'Solo lectura'),
('viewer', 'reportes', false, true, false, false, true, 'Ver y exportar reportes'),
('viewer', 'usuarios', false, false, false, false, false, 'Sin acceso'),
('viewer', 'configuracion', false, false, false, false, false, 'Sin acceso'),
('viewer', 'documentos', false, true, false, false, false, 'Solo lectura'),
('viewer', 'pagos', false, true, false, false, false, 'Solo lectura')
ON CONFLICT (role, module) DO NOTHING;

-- COORDINADOR CCE: Vista consolidada multi-organismo
INSERT INTO role_permissions (role, module, can_create, can_read, can_update, can_delete, can_export, description) VALUES
('coordinador_cce', 'organizaciones', false, true, false, false, true, 'Ver todos los organismos'),
('coordinador_cce', 'empresas', false, true, false, false, true, 'Ver todas las empresas'),
('coordinador_cce', 'admisiones', false, true, false, false, true, 'Ver todas las admisiones'),
('coordinador_cce', 'eventos', false, true, false, false, true, 'Ver todos los eventos'),
('coordinador_cce', 'comunicacion', false, true, false, false, true, 'Ver todas las comunicaciones'),
('coordinador_cce', 'reportes', false, true, false, false, true, 'Ver reportes consolidados'),
('coordinador_cce', 'usuarios', false, true, false, false, false, 'Ver usuarios'),
('coordinador_cce', 'configuracion', false, true, false, false, false, 'Ver configuración'),
('coordinador_cce', 'documentos', false, true, false, false, true, 'Ver documentos'),
('coordinador_cce', 'pagos', false, true, false, false, true, 'Ver pagos')
ON CONFLICT (role, module) DO NOTHING;

-- ========================================
-- 3. TABLA: user_permissions
-- Permisos granulares personalizados por usuario
-- ========================================

CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module TEXT NOT NULL,
  can_create BOOLEAN DEFAULT false,
  can_read BOOLEAN DEFAULT true,
  can_update BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  can_export BOOLEAN DEFAULT false,
  scope TEXT DEFAULT 'own_org', -- 'own_org', 'all_orgs', 'specific'
  specific_org_ids UUID[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),

  UNIQUE(user_id, module),
  CHECK (scope IN ('own_org', 'all_orgs', 'specific')),
  CHECK (module IN ('organizaciones', 'empresas', 'admisiones', 'eventos', 'comunicacion', 'reportes', 'usuarios', 'configuracion', 'documentos', 'pagos'))
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_module ON user_permissions(module);
CREATE INDEX IF NOT EXISTS idx_user_permissions_scope ON user_permissions(scope);

-- RLS
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage all user permissions"
  ON user_permissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Admins can view permissions of users in their org"
  ON user_permissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p1
      JOIN profiles p2 ON p2.id = user_permissions.user_id
      WHERE p1.id = auth.uid()
      AND p1.role = 'admin'
      AND p1.organization_id = p2.organization_id
    )
  );

CREATE POLICY "Users can view their own permissions"
  ON user_permissions FOR SELECT
  USING (user_id = auth.uid());

-- ========================================
-- 4. TABLA: user_invitations
-- Sistema de invitaciones de usuarios
-- ========================================

CREATE TABLE IF NOT EXISTS user_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  custom_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CHECK (role IN ('super_admin', 'admin', 'editor', 'viewer', 'coordinador_cce')),
  CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled'))
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_invitations_token ON user_invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON user_invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON user_invitations(status);
CREATE INDEX IF NOT EXISTS idx_invitations_org ON user_invitations(organization_id);

-- RLS
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage all invitations"
  ON user_invitations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Admins can manage invitations for their org"
  ON user_invitations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.organization_id = user_invitations.organization_id
    )
  );

-- ========================================
-- 5. TABLA: login_config
-- Configuración visual y de seguridad del login
-- ========================================

CREATE TABLE IF NOT EXISTS login_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) UNIQUE,

  -- Branding visual
  logo_url TEXT,
  background_image_url TEXT,
  background_color TEXT DEFAULT '#f3f4f6',
  primary_color TEXT DEFAULT '#3b82f6',
  secondary_color TEXT DEFAULT '#64748b',

  -- Textos personalizables
  welcome_message TEXT DEFAULT 'Bienvenido al Sistema CRM',
  subtitle TEXT,
  login_button_text TEXT DEFAULT 'Iniciar Sesión',
  footer_text TEXT,

  -- Configuración de seguridad
  enable_2fa BOOLEAN DEFAULT false,
  require_2fa BOOLEAN DEFAULT false,
  password_min_length INTEGER DEFAULT 8,
  password_require_uppercase BOOLEAN DEFAULT true,
  password_require_lowercase BOOLEAN DEFAULT true,
  password_require_numbers BOOLEAN DEFAULT true,
  password_require_symbols BOOLEAN DEFAULT false,
  max_login_attempts INTEGER DEFAULT 5,
  lockout_duration_minutes INTEGER DEFAULT 30,
  session_timeout_minutes INTEGER DEFAULT 480, -- 8 horas por defecto

  -- Métodos de autenticación adicionales
  enable_google_login BOOLEAN DEFAULT false,
  enable_microsoft_login BOOLEAN DEFAULT false,
  google_client_id TEXT,
  microsoft_client_id TEXT,

  -- Metadatos
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id),

  CHECK (password_min_length >= 6 AND password_min_length <= 128),
  CHECK (max_login_attempts > 0),
  CHECK (lockout_duration_minutes > 0),
  CHECK (session_timeout_minutes > 0)
);

-- Índice
CREATE INDEX IF NOT EXISTS idx_login_config_org ON login_config(organization_id);

-- RLS
ALTER TABLE login_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view login config"
  ON login_config FOR SELECT
  USING (true);

CREATE POLICY "Super admins can manage all login configs"
  ON login_config FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Admins can manage config for their org"
  ON login_config FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
      AND profiles.organization_id = login_config.organization_id
    )
  );

-- Insertar configuración por defecto global
INSERT INTO login_config (
  organization_id,
  welcome_message,
  subtitle,
  background_color,
  primary_color
) VALUES (
  NULL,
  'Bienvenido al CRM para Clústeres Empresariales',
  'Sistema de gestión integral para organismos empresariales',
  '#f3f4f6',
  '#3b82f6'
) ON CONFLICT (organization_id) DO NOTHING;

-- ========================================
-- 6. TABLA: login_attempts
-- Registro de intentos de login para seguridad
-- ========================================

CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  failure_reason TEXT,
  location_info JSONB, -- País, ciudad, etc. (opcional)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para queries rápidas
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_user ON login_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_login_attempts_created_at ON login_attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_login_attempts_success ON login_attempts(success);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address);

-- RLS
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view all login attempts"
  ON login_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Admins can view login attempts of users in their org"
  ON login_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p1
      JOIN profiles p2 ON p2.id = login_attempts.user_id
      WHERE p1.id = auth.uid()
      AND p1.role = 'admin'
      AND p1.organization_id = p2.organization_id
    )
  );

CREATE POLICY "Users can view their own login attempts"
  ON login_attempts FOR SELECT
  USING (user_id = auth.uid() OR email = (SELECT email FROM profiles WHERE id = auth.uid()));

-- ========================================
-- 7. TABLA: user_2fa
-- Almacenamiento de secretos para 2FA
-- ========================================

CREATE TABLE IF NOT EXISTS user_2fa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  secret TEXT NOT NULL,
  backup_codes TEXT[], -- Códigos de respaldo
  enabled BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice
CREATE INDEX IF NOT EXISTS idx_user_2fa_user ON user_2fa(user_id);

-- RLS
ALTER TABLE user_2fa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own 2FA"
  ON user_2fa FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all 2FA configs"
  ON user_2fa FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- ========================================
-- 8. FUNCIONES AUXILIARES
-- ========================================

-- Función para verificar si un usuario tiene permiso
CREATE OR REPLACE FUNCTION check_user_permission(
  p_user_id UUID,
  p_module TEXT,
  p_action TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_role TEXT;
  v_has_permission BOOLEAN;
  v_custom_permission BOOLEAN;
BEGIN
  -- Obtener rol del usuario
  SELECT role INTO v_role FROM profiles WHERE id = p_user_id;

  IF v_role IS NULL THEN
    RETURN false;
  END IF;

  -- super_admin siempre tiene todos los permisos
  IF v_role = 'super_admin' THEN
    RETURN true;
  END IF;

  -- Verificar si hay permiso personalizado
  SELECT CASE
    WHEN p_action = 'create' THEN can_create
    WHEN p_action = 'read' THEN can_read
    WHEN p_action = 'update' THEN can_update
    WHEN p_action = 'delete' THEN can_delete
    WHEN p_action = 'export' THEN can_export
    ELSE false
  END INTO v_custom_permission
  FROM user_permissions
  WHERE user_id = p_user_id AND module = p_module;

  -- Si hay permiso personalizado, usarlo
  IF FOUND THEN
    RETURN v_custom_permission;
  END IF;

  -- Si no, usar permisos del rol
  SELECT CASE
    WHEN p_action = 'create' THEN can_create
    WHEN p_action = 'read' THEN can_read
    WHEN p_action = 'update' THEN can_update
    WHEN p_action = 'delete' THEN can_delete
    WHEN p_action = 'export' THEN can_export
    ELSE false
  END INTO v_has_permission
  FROM role_permissions
  WHERE role = v_role AND module = p_module;

  RETURN COALESCE(v_has_permission, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar bloqueo de cuenta por intentos fallidos
CREATE OR REPLACE FUNCTION check_login_lockout(
  p_email TEXT,
  p_max_attempts INTEGER DEFAULT 5,
  p_lockout_minutes INTEGER DEFAULT 30
)
RETURNS BOOLEAN AS $$
DECLARE
  failed_attempts INTEGER;
BEGIN
  SELECT COUNT(*) INTO failed_attempts
  FROM login_attempts
  WHERE email = p_email
    AND success = false
    AND created_at > NOW() - (p_lockout_minutes || ' minutes')::INTERVAL;

  RETURN failed_attempts >= p_max_attempts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para expirar invitaciones
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS void AS $$
BEGIN
  UPDATE user_invitations
  SET status = 'expired'
  WHERE status = 'pending'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Función para limpiar intentos de login antiguos (más de 30 días)
CREATE OR REPLACE FUNCTION cleanup_old_login_attempts()
RETURNS void AS $$
BEGIN
  DELETE FROM login_attempts
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 9. TRIGGERS
-- ========================================

-- Trigger para actualizar updated_at en role_permissions
CREATE OR REPLACE FUNCTION update_role_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_role_permissions_updated_at
  BEFORE UPDATE ON role_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_role_permissions_updated_at();

-- Trigger para actualizar updated_at en user_permissions
CREATE OR REPLACE FUNCTION update_user_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_permissions_updated_at
  BEFORE UPDATE ON user_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_permissions_updated_at();

-- Trigger para actualizar updated_at en login_config
CREATE OR REPLACE FUNCTION update_login_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_login_config_updated_at
  BEFORE UPDATE ON login_config
  FOR EACH ROW
  EXECUTE FUNCTION update_login_config_updated_at();

-- ========================================
-- 10. COMENTARIOS EN TABLAS
-- ========================================

COMMENT ON TABLE role_permissions IS 'Plantilla de permisos por defecto para cada rol del sistema';
COMMENT ON TABLE user_permissions IS 'Permisos personalizados por usuario que sobreescriben los permisos del rol';
COMMENT ON TABLE user_invitations IS 'Sistema de invitaciones para nuevos usuarios';
COMMENT ON TABLE login_config IS 'Configuración visual y de seguridad de la página de login';
COMMENT ON TABLE login_attempts IS 'Registro de intentos de login para seguridad y auditoría';
COMMENT ON TABLE user_2fa IS 'Configuración de autenticación de dos factores por usuario';

COMMENT ON FUNCTION check_user_permission IS 'Verifica si un usuario tiene un permiso específico en un módulo';
COMMENT ON FUNCTION check_login_lockout IS 'Verifica si una cuenta está bloqueada por intentos fallidos';
COMMENT ON FUNCTION expire_old_invitations IS 'Marca invitaciones vencidas como expiradas';
COMMENT ON FUNCTION cleanup_old_login_attempts IS 'Elimina intentos de login antiguos (>30 días)';

-- ========================================
-- SCRIPT COMPLETADO
-- ========================================

-- Para ejecutar este script en Supabase:
-- 1. Ir a SQL Editor en Supabase Dashboard
-- 2. Copiar y pegar este script
-- 3. Ejecutar
-- 4. Verificar que todas las tablas se crearon correctamente

-- Nota: Este script es idempotente (puede ejecutarse múltiples veces sin problemas)
