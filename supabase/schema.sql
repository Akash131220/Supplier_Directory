-- Create the suppliers table
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_code TEXT NOT NULL UNIQUE,
  supplier_name TEXT NOT NULL,
  email_primary TEXT,
  email_secondary TEXT,
  email_escalation TEXT,
  contact_person TEXT,
  contact_number TEXT,
  country_of_origin TEXT,
  shipping_location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Create Public SELECT policy
CREATE POLICY "Allow public read access" ON public.suppliers
  FOR SELECT USING (true);

-- Create Authenticated INSERT/UPDATE/DELETE policies (Admins)
CREATE POLICY "Allow authenticated insert access" ON public.suppliers
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update access" ON public.suppliers
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete access" ON public.suppliers
  FOR DELETE TO authenticated USING (true);

-- Add indexes for optimized searching
CREATE INDEX IF NOT EXISTS idx_suppliers_code ON public.suppliers (supplier_code);
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON public.suppliers (supplier_name);
