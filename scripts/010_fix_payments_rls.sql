-- Corregir políticas RLS de payments para permitir inserción

-- Eliminar política existente
DROP POLICY IF EXISTS "Admins and editors can manage payments" ON payments;

-- Crear políticas separadas para cada operación
CREATE POLICY "Authenticated users can insert payments" ON payments
  FOR INSERT TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update payments" ON payments
  FOR UPDATE TO authenticated 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete payments" ON payments
  FOR DELETE TO authenticated 
  USING (true);
