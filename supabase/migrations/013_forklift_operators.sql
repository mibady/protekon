CREATE TABLE IF NOT EXISTS forklift_operators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  zone_id UUID REFERENCES wholesale_zones(id) ON DELETE SET NULL,
  operator_name TEXT NOT NULL,
  cert_date DATE NOT NULL,
  cert_expiry DATE NOT NULL,
  forklift_type TEXT NOT NULL DEFAULT 'Class I',
  evaluation_status TEXT NOT NULL DEFAULT 'current' CHECK (evaluation_status IN ('current', 'expiring', 'expired', 'suspended')),
  evaluator TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_forklift_ops_client ON forklift_operators(client_id);
CREATE INDEX IF NOT EXISTS idx_forklift_ops_expiry ON forklift_operators(cert_expiry);

ALTER TABLE forklift_operators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients read own operators" ON forklift_operators FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Clients manage own operators" ON forklift_operators FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Clients update own operators" ON forklift_operators FOR UPDATE USING (auth.uid() = client_id) WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Clients delete own operators" ON forklift_operators FOR DELETE USING (auth.uid() = client_id);
