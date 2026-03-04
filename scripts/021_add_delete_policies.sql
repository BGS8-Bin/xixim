-- Add DELETE policy for admission_requests
CREATE POLICY "Admins and editors can delete admission requests" 
  ON public.admission_requests
  FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- Add DELETE policy for companies
CREATE POLICY "Admins and editors can delete companies" 
  ON public.companies
  FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- Add DELETE policy for company_contacts
CREATE POLICY "Admins and editors can delete company contacts" 
  ON public.company_contacts
  FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );
