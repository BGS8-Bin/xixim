-- Ensure is_active column exists and set default to true
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing records where is_active is null
UPDATE public.organizations
SET is_active = true
WHERE is_active IS NULL;

-- Make sure the column has the default constraint for future inserts
ALTER TABLE public.organizations
ALTER COLUMN is_active SET DEFAULT true;
