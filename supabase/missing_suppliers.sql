CREATE TABLE IF NOT EXISTS public.missing_suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_code TEXT,
  supplier_name TEXT,
  search_query TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.missing_suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert on missing_suppliers" ON public.missing_suppliers
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow public select on missing_suppliers" ON public.missing_suppliers
  FOR SELECT TO public USING (true);

CREATE POLICY "Allow public update on missing_suppliers" ON public.missing_suppliers
  FOR UPDATE TO public USING (true) WITH CHECK (true);
