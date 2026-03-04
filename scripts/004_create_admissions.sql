-- Adding the update_updated_at_column function first
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tabla de solicitudes de admisión
CREATE TABLE IF NOT EXISTS admission_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Datos de la empresa solicitante
  company_name TEXT NOT NULL,
  trade_name TEXT,
  rfc TEXT,
  sector TEXT NOT NULL,
  industry TEXT,
  website TEXT,
  
  -- Datos de contacto principal
  contact_name TEXT NOT NULL,
  contact_position TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  
  -- Información de la empresa
  employee_count TEXT,
  annual_revenue TEXT,
  founding_year INTEGER,
  address TEXT,
  city TEXT DEFAULT 'Durango',
  state TEXT DEFAULT 'Durango',
  
  -- Motivación y documentos
  motivation TEXT NOT NULL,
  services_interest TEXT[],
  how_did_you_hear TEXT,
  
  -- Estado del proceso
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'more_info_needed')),
  reviewed_by UUID REFERENCES profiles(id),
  review_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  
  -- Metadatos
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de documentos adjuntos a solicitudes
CREATE TABLE IF NOT EXISTS admission_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_request_id UUID NOT NULL REFERENCES admission_requests(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de comentarios/historial de la solicitud
CREATE TABLE IF NOT EXISTS admission_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_request_id UUID NOT NULL REFERENCES admission_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  comment TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE admission_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE admission_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE admission_comments ENABLE ROW LEVEL SECURITY;

-- Políticas para admission_requests
CREATE POLICY "Anyone can create admission requests" ON admission_requests
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can view admission requests" ON admission_requests
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and editors can update admission requests" ON admission_requests
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

-- Políticas para documentos
CREATE POLICY "Anyone can upload documents" ON admission_documents
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can view documents" ON admission_documents
  FOR SELECT TO authenticated USING (true);

-- Políticas para comentarios
CREATE POLICY "Authenticated users can create comments" ON admission_comments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view comments" ON admission_comments
  FOR SELECT TO authenticated USING (true);

-- Índices
CREATE INDEX IF NOT EXISTS idx_admission_requests_status ON admission_requests(status);
CREATE INDEX IF NOT EXISTS idx_admission_requests_created ON admission_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admission_documents_request ON admission_documents(admission_request_id);
CREATE INDEX IF NOT EXISTS idx_admission_comments_request ON admission_comments(admission_request_id);

-- Trigger para updated_at
CREATE TRIGGER update_admission_requests_updated_at
  BEFORE UPDATE ON admission_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
