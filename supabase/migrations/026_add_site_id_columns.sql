-- Exported from Supabase migration 20260414223853
-- Original name: add_site_id_columns

-- ============================================================
-- Add nullable site_id FK to all data-bearing tables
-- Nullable preserves back-compat for single-site clients
-- ============================================================

ALTER TABLE incidents
  ADD COLUMN IF NOT EXISTS site_id uuid REFERENCES sites(id);
CREATE INDEX IF NOT EXISTS idx_incidents_site_id
  ON incidents(site_id) WHERE site_id IS NOT NULL;

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS site_id uuid REFERENCES sites(id);
CREATE INDEX IF NOT EXISTS idx_documents_site_id
  ON documents(site_id) WHERE site_id IS NOT NULL;

ALTER TABLE training_records
  ADD COLUMN IF NOT EXISTS site_id uuid REFERENCES sites(id);
CREATE INDEX IF NOT EXISTS idx_training_records_site_id
  ON training_records(site_id) WHERE site_id IS NOT NULL;

ALTER TABLE alerts
  ADD COLUMN IF NOT EXISTS site_id uuid REFERENCES sites(id);
CREATE INDEX IF NOT EXISTS idx_alerts_site_id
  ON alerts(site_id) WHERE site_id IS NOT NULL;

ALTER TABLE employee_log_requests
  ADD COLUMN IF NOT EXISTS site_id uuid REFERENCES sites(id);
CREATE INDEX IF NOT EXISTS idx_elr_site_id
  ON employee_log_requests(site_id) WHERE site_id IS NOT NULL;
