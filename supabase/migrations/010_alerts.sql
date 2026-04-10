CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('regulatory','certification','incident','compliance','system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('critical','high','medium','low','info')),
  read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_alerts_client ON alerts(client_id);
CREATE INDEX idx_alerts_unread ON alerts(client_id) WHERE NOT read;

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients read own alerts" ON alerts FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Clients update own alerts" ON alerts FOR UPDATE USING (auth.uid() = client_id) WITH CHECK (auth.uid() = client_id);
CREATE POLICY "System inserts alerts" ON alerts FOR INSERT WITH CHECK (true);
