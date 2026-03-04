-- Add missing columns to admission_requests to match frontend form

ALTER TABLE public.admission_requests
ADD COLUMN IF NOT EXISTS brochure_url TEXT,
ADD COLUMN IF NOT EXISTS fiscal_document_url TEXT,
ADD COLUMN IF NOT EXISTS guarantor_1_name TEXT,
ADD COLUMN IF NOT EXISTS guarantor_1_company TEXT,
ADD COLUMN IF NOT EXISTS guarantor_2_name TEXT,
ADD COLUMN IF NOT EXISTS guarantor_2_company TEXT,
ADD COLUMN IF NOT EXISTS previous_chambers_participation TEXT,
ADD COLUMN IF NOT EXISTS is_startup BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS innovation_project_description TEXT,
ADD COLUMN IF NOT EXISTS entity_type TEXT,
ADD COLUMN IF NOT EXISTS is_sat_registered BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS years_in_operation INTEGER;
