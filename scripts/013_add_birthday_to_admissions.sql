-- Add contact_birthday column to admission_requests table
ALTER TABLE public.admission_requests 
ADD COLUMN IF NOT EXISTS contact_birthday DATE;

-- Update RLS policies (if necessary, though current ones likely cover the new column implicitly)
