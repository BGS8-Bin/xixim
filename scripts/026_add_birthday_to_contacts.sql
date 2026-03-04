-- Add birthday column to company_contacts
ALTER TABLE public.company_contacts
ADD COLUMN IF NOT EXISTS birthday DATE;
