-- Add missing columns to payments
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS confirmed_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create companies table
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  legal_name TEXT,
  rfc TEXT,
  sector TEXT,
  description TEXT,
  website TEXT,
  email TEXT,
  phone TEXT,
  employee_count INTEGER,
  founded_year INTEGER,
  address TEXT,
  city TEXT,
  state TEXT,
  membership_status TEXT DEFAULT 'active',
  membership_start_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create company_contacts table
CREATE TABLE IF NOT EXISTS public.company_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  position TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_contacts ENABLE ROW LEVEL SECURITY;

-- Policies for companies
CREATE POLICY "Admins and editors can manage companies"
  ON public.companies
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Authenticated users can view companies"
  ON public.companies
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for company_contacts
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
  
CREATE POLICY "Authenticated users can view company contacts"
  ON public.company_contacts
  FOR SELECT
  TO authenticated
  USING (true);
