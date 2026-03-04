-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_request_id UUID REFERENCES public.admission_requests(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'MXN',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
  payment_method TEXT,
  provider_payment_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policies
-- Admins and editors can manage payments (create pending payments, etc.)
CREATE POLICY "Admins and editors can manage payments"
  ON public.payments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- Allow read access to the user who owns the admission request (if users are linked)
-- Currently admission requests are not directly linked to auth.users owner, but let's leave it for now.
-- Ideally we'd link by email or have a user_id on admission_requests.

-- For now, let's ensure the admin can insert.
-- The admission-actions.tsx runs as the current authenticated user (admin).
