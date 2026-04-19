-- 050_integrations.sql
-- Third-party OAuth integrations per client.
-- Tokens are encrypted at rest with INTEGRATIONS_ENCRYPTION_KEY (AES-256-GCM).
-- Service-role only — never readable by authenticated users.

CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  provider text NOT NULL,
  status text NOT NULL DEFAULT 'disconnected'
    CHECK (status IN ('connected','disconnected','error')),
  account_label text,
  scopes text[] DEFAULT '{}',
  encrypted_access_token bytea,
  encrypted_refresh_token bytea,
  connected_at timestamptz,
  last_sync_at timestamptz,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, provider)
);

CREATE INDEX IF NOT EXISTS integrations_client_status_idx
  ON integrations(client_id, status);

ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Deny-all to authenticated. Service role bypasses RLS automatically.
-- The /api/integrations/[provider]/authorize and /callback routes use
-- createAdminClient() for all reads/writes.
CREATE POLICY integrations_deny_all ON integrations
  FOR ALL TO authenticated
  USING (false) WITH CHECK (false);
