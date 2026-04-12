ALTER TABLE clients ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES partner_profiles(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_clients_partner ON clients(partner_id) WHERE partner_id IS NOT NULL;
