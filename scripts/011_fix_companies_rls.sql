-- Drop existing policies for companies
DROP POLICY IF EXISTS "Admins and editors can insert companies" ON public.companies;
DROP POLICY IF EXISTS "Admins and editors can update companies" ON public.companies;
DROP POLICY IF EXISTS "Only admins can delete companies" ON public.companies;

-- Create simplified policies that allow all authenticated users to manage companies
CREATE POLICY "Authenticated users can insert companies"
  ON public.companies
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update companies"
  ON public.companies
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete companies"
  ON public.companies
  FOR DELETE
  TO authenticated
  USING (true);

-- Also fix company_contacts policies
DROP POLICY IF EXISTS "Admins and editors can manage company contacts" ON public.company_contacts;

CREATE POLICY "Authenticated users can manage company contacts"
  ON public.company_contacts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
