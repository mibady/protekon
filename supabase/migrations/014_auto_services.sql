CREATE TABLE IF NOT EXISTS auto_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  shop_type TEXT NOT NULL DEFAULT 'general' CHECK (shop_type IN ('general', 'body', 'transmission', 'tire', 'oil-change', 'dealership', 'fleet-service', 'other')),
  bay_count INTEGER DEFAULT 0,
  hazmat_handling BOOLEAN DEFAULT false,
  paint_booth BOOLEAN DEFAULT false,
  ase_certifications TEXT[] DEFAULT '{}',
  waste_disposal_method TEXT,
  last_epa_inspection DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auto_services_client ON auto_services(client_id);

ALTER TABLE auto_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients read own auto services" ON auto_services FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Clients manage own auto services" ON auto_services FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Clients update own auto services" ON auto_services FOR UPDATE USING (auth.uid() = client_id) WITH CHECK (auth.uid() = client_id);
