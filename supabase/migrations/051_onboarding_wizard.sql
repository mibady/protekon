-- ============================================================
-- Migration 051: Onboarding Wizard
-- Adds client-level onboarding state columns + a new `workers` table.
--
-- Scope (Phase 1A):
--   * Extend `clients` with operating_states, worker_count_range,
--     onboarding_status, last_onboarding_step_completed, vertical_metadata,
--     onboarded_at. (`vertical`, `plan`, `status`, `stripe_customer_id`,
--     `compliance_score`, `risk_level`, `v2_enabled` already exist.)
--   * Create `workers` table for field employees who may not have login
--     accounts. Distinct from `user_roles` (migration 047), which maps
--     auth users to clients with RBAC.
--
-- Not touched (live in other migrations):
--   * sites            → migration 025
--   * integrations     → migration 050
--   * user_roles       → migration 047
--   * construction_subs / sub_onboarding_tokens → pre-existing
--
-- Safe to re-run: uses ADD COLUMN IF NOT EXISTS / CREATE TABLE IF NOT EXISTS
-- and CREATE POLICY guarded by CREATE OR REPLACE-style drops at the bottom
-- of each policy group.
-- ============================================================

-- ------------------------------------------------------------
-- clients: onboarding state columns
-- ------------------------------------------------------------
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS operating_states text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS worker_count_range text
    CHECK (worker_count_range IN ('1-10','11-50','51-200','200+')),
  ADD COLUMN IF NOT EXISTS onboarding_status text NOT NULL DEFAULT 'not_started'
    CHECK (onboarding_status IN ('not_started','in_progress','completed','abandoned')),
  ADD COLUMN IF NOT EXISTS last_onboarding_step_completed smallint NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vertical_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS onboarded_at timestamptz;

-- ------------------------------------------------------------
-- workers: individual field employees (non-login)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workers (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  site_id       uuid REFERENCES sites(id) ON DELETE SET NULL,
  name          text NOT NULL,
  role          text,
  hire_date     date,
  phone         text,
  email         text,
  auth_user_id  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS workers_client_id_idx    ON workers(client_id);
CREATE INDEX IF NOT EXISTS workers_site_id_idx      ON workers(site_id);
CREATE INDEX IF NOT EXISTS workers_auth_user_id_idx ON workers(auth_user_id);

ALTER TABLE workers ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- workers RLS — mirrors sites pattern from migration 025
-- (client_id = auth.uid() because legacy clients preserve
--  single-user-per-client where user_id = clients.id)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS workers_select_own ON workers;
DROP POLICY IF EXISTS workers_insert_own ON workers;
DROP POLICY IF EXISTS workers_update_own ON workers;
DROP POLICY IF EXISTS workers_delete_own ON workers;

CREATE POLICY workers_select_own ON workers
  FOR SELECT TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY workers_insert_own ON workers
  FOR INSERT TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY workers_update_own ON workers
  FOR UPDATE TO authenticated
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

CREATE POLICY workers_delete_own ON workers
  FOR DELETE TO authenticated
  USING (client_id = auth.uid());

-- ------------------------------------------------------------
-- updated_at trigger — reuse update_updated_at() from migration 025
-- ------------------------------------------------------------
DROP TRIGGER IF EXISTS set_workers_updated_at ON workers;
CREATE TRIGGER set_workers_updated_at
  BEFORE UPDATE ON workers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- DOWN MIGRATION (for reference; not auto-executed)
-- ============================================================
-- DROP TRIGGER IF EXISTS set_workers_updated_at ON workers;
-- DROP POLICY IF EXISTS workers_select_own ON workers;
-- DROP POLICY IF EXISTS workers_insert_own ON workers;
-- DROP POLICY IF EXISTS workers_update_own ON workers;
-- DROP POLICY IF EXISTS workers_delete_own ON workers;
-- DROP INDEX IF EXISTS workers_auth_user_id_idx;
-- DROP INDEX IF EXISTS workers_site_id_idx;
-- DROP INDEX IF EXISTS workers_client_id_idx;
-- DROP TABLE IF EXISTS workers;
--
-- ALTER TABLE clients
--   DROP COLUMN IF EXISTS onboarded_at,
--   DROP COLUMN IF EXISTS vertical_metadata,
--   DROP COLUMN IF EXISTS last_onboarding_step_completed,
--   DROP COLUMN IF EXISTS onboarding_status,
--   DROP COLUMN IF EXISTS worker_count_range,
--   DROP COLUMN IF EXISTS operating_states;
