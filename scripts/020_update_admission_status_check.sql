-- Drop the existing check constraint
ALTER TABLE public.admission_requests
DROP CONSTRAINT IF EXISTS admission_requests_status_check;

-- Add the new check constraint with all required statuses
ALTER TABLE public.admission_requests
ADD CONSTRAINT admission_requests_status_check 
CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'more_info_needed', 'payment_pending', 'documents_pending', 'completed'));
