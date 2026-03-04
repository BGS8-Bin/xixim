-- Add top_products and purchase_requirements columns
ALTER TABLE public.admission_requests
ADD COLUMN IF NOT EXISTS top_products TEXT,
ADD COLUMN IF NOT EXISTS purchase_requirements TEXT;

ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS top_products TEXT,
ADD COLUMN IF NOT EXISTS purchase_requirements TEXT;
