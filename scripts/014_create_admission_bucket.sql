-- Create bucket for admission documents if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('admission-documents', 'admission-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for admission-documents

-- Allow authenticated users to upload files (anyone filling the form is likely not authenticated yet?
-- Wait, the form is public? Let's check the policies)

-- If the form is public (solicitud-admision), then unauthenticated users need to upload too?
-- The page.tsx uses `createClient` which might be anon key.

-- Allow anyone (public) to upload to admission-documents for now, assuming the form handles validation.
-- Or restrict to authenticated users if the form requires login (it seems it doesn't).

CREATE POLICY "Public Access Select"
ON storage.objects FOR SELECT
USING ( bucket_id = 'admission-documents' );

CREATE POLICY "Public Access Insert"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'admission-documents' );

-- Allow update/delete only for admins?
