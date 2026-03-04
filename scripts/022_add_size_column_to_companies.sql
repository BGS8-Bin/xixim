-- Add size column to companies table
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS size TEXT CHECK (size IN ('micro', 'pequena', 'mediana', 'grande'));
