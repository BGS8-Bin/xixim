-- Create storage bucket for admission documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('admission-documents', 'admission-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for admission-documents bucket
-- Allow public uploads (anyone can submit admission documents)
CREATE POLICY "Public can upload admission documents"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'admission-documents');

-- Allow public to read admission documents
CREATE POLICY "Public can read admission documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'admission-documents');

-- Allow authenticated users to delete their own uploads (optional)
CREATE POLICY "Authenticated users can delete admission documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'admission-documents');

-- Allow admins to manage all documents
CREATE POLICY "Admins can manage all admission documents"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'admission-documents' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
