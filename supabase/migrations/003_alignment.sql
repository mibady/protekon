-- ============================================================
-- Migration 003: Schema Alignment
-- Adds columns and RLS policies referenced by server actions
-- but missing from migrations 001/002
-- ============================================================

-- --------------------------------------------------------
-- 1. documents: add status, notes, priority
-- --------------------------------------------------------
ALTER TABLE documents ADD COLUMN IF NOT EXISTS status text DEFAULT 'requested';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS priority text DEFAULT 'standard';

CREATE POLICY "documents_insert_own" ON documents
  FOR INSERT WITH CHECK (client_id = auth.uid());

-- --------------------------------------------------------
-- 2. incidents: add metadata jsonb
-- --------------------------------------------------------
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';

-- --------------------------------------------------------
-- 3. clients: add notification_preferences jsonb
-- --------------------------------------------------------
ALTER TABLE clients ADD COLUMN IF NOT EXISTS notification_preferences jsonb;

-- Auto-update updated_at on clients
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS clients_updated_at ON clients;
CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- --------------------------------------------------------
-- 4. regulatory_updates: add columns for reports/regulations
-- --------------------------------------------------------
ALTER TABLE regulatory_updates ADD COLUMN IF NOT EXISTS published_date date;
ALTER TABLE regulatory_updates ADD COLUMN IF NOT EXISTS code text;
ALTER TABLE regulatory_updates ADD COLUMN IF NOT EXISTS regulation_code text;
ALTER TABLE regulatory_updates ADD COLUMN IF NOT EXISTS issuing_body text;
ALTER TABLE regulatory_updates ADD COLUMN IF NOT EXISTS type text;
ALTER TABLE regulatory_updates ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE regulatory_updates ADD COLUMN IF NOT EXISTS impact_text text;
ALTER TABLE regulatory_updates ADD COLUMN IF NOT EXISTS compliance_deadline date;
ALTER TABLE regulatory_updates ADD COLUMN IF NOT EXISTS acknowledged_by uuid[] DEFAULT '{}';

-- Allow updates to regulatory_updates (for acknowledgeRegulation)
CREATE POLICY "regulatory_updates_update_authenticated" ON regulatory_updates
  FOR UPDATE USING (true) WITH CHECK (true);

-- --------------------------------------------------------
-- 5. Missing RLS policies for write operations
-- --------------------------------------------------------

-- training_records: update + delete
CREATE POLICY "training_update_own" ON training_records
  FOR UPDATE USING (client_id = auth.uid());

CREATE POLICY "training_delete_own" ON training_records
  FOR DELETE USING (client_id = auth.uid());

-- poster_compliance: insert
CREATE POLICY "poster_compliance_insert_own" ON poster_compliance
  FOR INSERT WITH CHECK (client_id = auth.uid());

-- construction_subs: insert
CREATE POLICY "construction_subs_insert_own" ON construction_subs
  FOR INSERT WITH CHECK (client_id = auth.uid());

-- property_portfolio: insert
CREATE POLICY "property_portfolio_insert_own" ON property_portfolio
  FOR INSERT WITH CHECK (client_id = auth.uid());

-- baa_agreements: update
CREATE POLICY "baa_agreements_update_own" ON baa_agreements
  FOR UPDATE USING (client_id = auth.uid());

-- phi_assets: update
CREATE POLICY "phi_assets_update_own" ON phi_assets
  FOR UPDATE USING (client_id = auth.uid());
