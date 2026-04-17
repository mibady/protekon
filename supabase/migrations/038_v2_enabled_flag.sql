-- Migration 038: v2 feature flag per client
-- Applied to production (yfkledwhwsembikpjynu) on 2026-04-16.
--
-- Enables parallel /v2/* routes without breaking existing /dashboard/* users.
-- Default false; internal users get flipped to true manually.
-- The /v2/layout.tsx checks this column. Drop this migration when cutover
-- (NGE-459) completes and v2 is the only path.

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS v2_enabled BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN clients.v2_enabled IS
  'Feature flag for /v2/* route access. Added 2026-04-16 for frontend redesign v2 (NGE-409). Remove when cutover (NGE-459) ships.';

-- Index for middleware lookup perf (one row per session)
CREATE INDEX IF NOT EXISTS idx_clients_v2_enabled
  ON clients (id)
  WHERE v2_enabled = true;
