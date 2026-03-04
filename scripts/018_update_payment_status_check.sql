-- Update payments status check constraint to include 'confirmed' and 'rejected'

ALTER TABLE public.payments
DROP CONSTRAINT IF EXISTS payments_status_check;

ALTER TABLE public.payments
ADD CONSTRAINT payments_status_check
CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled', 'confirmed', 'rejected'));
