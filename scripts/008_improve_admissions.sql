-- Mejoras al sistema de admisión

-- Agregar nuevos campos a admission_requests
ALTER TABLE admission_requests
ADD COLUMN IF NOT EXISTS entity_type TEXT CHECK (entity_type IN ('persona_fisica', 'persona_moral')),
ADD COLUMN IF NOT EXISTS is_sat_registered BOOLEAN,
ADD COLUMN IF NOT EXISTS years_in_operation INTEGER,
ADD COLUMN IF NOT EXISTS is_startup BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS innovation_project_description TEXT,
ADD COLUMN IF NOT EXISTS guarantor_1_name TEXT,
ADD COLUMN IF NOT EXISTS guarantor_1_company TEXT,
ADD COLUMN IF NOT EXISTS guarantor_2_name TEXT,
ADD COLUMN IF NOT EXISTS guarantor_2_company TEXT,
ADD COLUMN IF NOT EXISTS previous_chambers_participation TEXT,
ADD COLUMN IF NOT EXISTS fiscal_document_url TEXT,
ADD COLUMN IF NOT EXISTS brochure_url TEXT;

-- Crear tabla de pagos
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_request_id UUID NOT NULL REFERENCES admission_requests(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'MXN',
  payment_method TEXT,
  payment_reference TEXT,
  payment_date TIMESTAMPTZ,
  proof_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  confirmed_by UUID REFERENCES profiles(id),
  confirmed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear tabla de documentación post-pago
CREATE TABLE IF NOT EXISTS member_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_request_id UUID NOT NULL REFERENCES admission_requests(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('carta_compromiso', 'info_comercial', 'estatutos', 'aviso_privacidad')),
  file_url TEXT,
  signed BOOLEAN DEFAULT false,
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear tabla de kit digital
CREATE TABLE IF NOT EXISTS welcome_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_request_id UUID NOT NULL REFERENCES admission_requests(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id),
  estatutos_accepted BOOLEAN DEFAULT false,
  privacy_accepted BOOLEAN DEFAULT false,
  accepted_at TIMESTAMPTZ,
  kit_sent BOOLEAN DEFAULT false,
  kit_sent_at TIMESTAMPTZ,
  directory_access_granted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE welcome_kits ENABLE ROW LEVEL SECURITY;

-- Políticas para payments
CREATE POLICY "Authenticated users can view payments" ON payments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and editors can manage payments" ON payments
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

-- Políticas para member_documents
CREATE POLICY "Authenticated users can view member documents" ON member_documents
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and editors can manage documents" ON member_documents
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

-- Políticas para welcome_kits
CREATE POLICY "Authenticated users can view welcome kits" ON welcome_kits
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and editors can manage welcome kits" ON welcome_kits
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

-- Índices
CREATE INDEX IF NOT EXISTS idx_payments_admission ON payments(admission_request_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_member_documents_admission ON member_documents(admission_request_id);
CREATE INDEX IF NOT EXISTS idx_welcome_kits_admission ON welcome_kits(admission_request_id);

-- Triggers para updated_at
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_member_documents_updated_at
  BEFORE UPDATE ON member_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_welcome_kits_updated_at
  BEFORE UPDATE ON welcome_kits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
