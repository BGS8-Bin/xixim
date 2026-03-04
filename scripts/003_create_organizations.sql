-- Crear tabla de organismos (entidades que conforman el clúster)
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('gobierno', 'academia', 'industria', 'organizacion_civil')),
  logo_url TEXT,
  website TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT DEFAULT 'Durango',
  state TEXT DEFAULT 'Durango',
  country TEXT DEFAULT 'México',
  founded_year INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear tabla de empresas afiliadas
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  legal_name TEXT,
  rfc TEXT,
  description TEXT,
  sector TEXT NOT NULL CHECK (sector IN ('software', 'hardware', 'telecomunicaciones', 'consultoria', 'manufactura', 'servicios', 'educacion', 'investigacion', 'otro')),
  size TEXT CHECK (size IN ('micro', 'pequena', 'mediana', 'grande')),
  logo_url TEXT,
  website TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT DEFAULT 'Durango',
  state TEXT DEFAULT 'Durango',
  country TEXT DEFAULT 'México',
  employee_count INTEGER,
  founded_year INTEGER,
  membership_status TEXT DEFAULT 'pending' CHECK (membership_status IN ('pending', 'active', 'inactive', 'suspended')),
  membership_type TEXT CHECK (membership_type IN ('basica', 'premium', 'enterprise')),
  membership_start_date DATE,
  membership_end_date DATE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear tabla de contactos de empresas
CREATE TABLE IF NOT EXISTS public.company_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  position TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_contacts ENABLE ROW LEVEL SECURITY;

-- Políticas para organizations (lectura para todos los autenticados)
CREATE POLICY "Users can view organizations"
  ON public.organizations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and editors can insert organizations"
  ON public.organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admins and editors can update organizations"
  ON public.organizations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Only admins can delete organizations"
  ON public.organizations
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Políticas para companies
CREATE POLICY "Users can view companies"
  ON public.companies
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and editors can insert companies"
  ON public.companies
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admins and editors can update companies"
  ON public.companies
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Only admins can delete companies"
  ON public.companies
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Políticas para company_contacts
CREATE POLICY "Users can view company contacts"
  ON public.company_contacts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and editors can manage company contacts"
  ON public.company_contacts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_companies_sector ON public.companies(sector);
CREATE INDEX IF NOT EXISTS idx_companies_membership_status ON public.companies(membership_status);
CREATE INDEX IF NOT EXISTS idx_companies_organization ON public.companies(organization_id);
CREATE INDEX IF NOT EXISTS idx_company_contacts_company ON public.company_contacts(company_id);
