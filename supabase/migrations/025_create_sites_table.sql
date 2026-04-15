-- Exported from Supabase migration 20260414223819
-- Original name: create_sites_table

-- ============================================================
-- Multi-Site Consolidated Dashboard — Session A: Data Model
-- Audit gap #4: Multi-Site plan ($1,297/mo) needs per-site scoping
-- ============================================================

CREATE TABLE IF NOT EXISTS sites (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name            text NOT NULL,
  address         text,
  city            text,
  state           text,
  zip             text,
  employee_count  int,
  is_primary      boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sites_primary
  ON sites(client_id) WHERE is_primary;

CREATE INDEX IF NOT EXISTS idx_sites_client_id
  ON sites(client_id);

ALTER TABLE sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sites_select_own" ON sites
  FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "sites_insert_own" ON sites
  FOR INSERT WITH CHECK (client_id = auth.uid());
CREATE POLICY "sites_update_own" ON sites
  FOR UPDATE USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());
CREATE POLICY "sites_delete_own" ON sites
  FOR DELETE USING (client_id = auth.uid());

CREATE TRIGGER set_sites_updated_at
  BEFORE UPDATE ON sites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
