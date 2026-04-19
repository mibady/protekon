-- Migration 049: Subs Phase B — Sub Onboarding + Safety Programs + 1099-NEC
--
-- Net-new tables (4):
--   1. sub_onboarding_tokens      — public invite tokens for /sub/[token] portal (service-role only)
--   2. sub_onboarding_submissions — submitted W-9/MSA/company info awaiting client review
--   3. sub_safety_programs        — IIPP/HazCom/WVPP/Heat/Respirator/etc. per sub
--   4. vendor_payments            — 1099-NEC threshold tracking ($600/year)
--
-- RLS posture:
--   - tokens       → deny-all to authenticated (only service-role reads/writes via admin client)
--   - submissions  → SELECT + UPDATE client-scoped (INSERT via service-role from public portal)
--   - safety       → full CRUD client-scoped
--   - vendor_pay   → full CRUD client-scoped

-- ──────────────────────────────────────────────────────────────────────────────
-- 1. sub_onboarding_tokens (service-role access only)
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sub_onboarding_tokens (
  token text PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  sub_id uuid REFERENCES construction_subs(id) ON DELETE CASCADE,   -- nullable: may create new sub on submit
  sub_company_name text NOT NULL,
  contact_email text NOT NULL,
  contact_name text,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  invited_by uuid NOT NULL REFERENCES auth.users(id)
);
ALTER TABLE sub_onboarding_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY sub_onboarding_tokens_deny_all ON sub_onboarding_tokens
  FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- ──────────────────────────────────────────────────────────────────────────────
-- 2. sub_onboarding_submissions (client-scoped read/update)
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sub_onboarding_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL REFERENCES sub_onboarding_tokens(token) ON DELETE CASCADE,
  sub_id uuid REFERENCES construction_subs(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  legal_name text NOT NULL,
  ein text,                                 -- Tax ID from W-9
  address text,
  w9_pdf_url text,
  msa_signed_pdf_url text,
  msa_signed_at timestamptz,
  w9_uploaded_at timestamptz,
  notes text,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','approved','rejected')),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id),
  submitted_ip inet,
  submitted_user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE sub_onboarding_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY sub_onboarding_submissions_select_own ON sub_onboarding_submissions
  FOR SELECT TO authenticated USING (client_id = auth.uid());
CREATE POLICY sub_onboarding_submissions_update_own ON sub_onboarding_submissions
  FOR UPDATE TO authenticated USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid());

-- ──────────────────────────────────────────────────────────────────────────────
-- 3. sub_safety_programs (full client-scoped CRUD)
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sub_safety_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_id uuid NOT NULL REFERENCES construction_subs(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  program_type text NOT NULL CHECK (program_type IN ('iipp','hazcom','wvpp','heat','respirator','fall_protection','confined_space','lockout_tagout')),
  document_url text,
  effective_date date,
  last_reviewed_at timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','expired')),
  reviewer_notes text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (sub_id, program_type)
);
ALTER TABLE sub_safety_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY ssp_select_own ON sub_safety_programs FOR SELECT TO authenticated USING (client_id = auth.uid());
CREATE POLICY ssp_insert_own ON sub_safety_programs FOR INSERT TO authenticated WITH CHECK (client_id = auth.uid());
CREATE POLICY ssp_update_own ON sub_safety_programs FOR UPDATE TO authenticated USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid());
CREATE POLICY ssp_delete_own ON sub_safety_programs FOR DELETE TO authenticated USING (client_id = auth.uid());

-- ──────────────────────────────────────────────────────────────────────────────
-- 4. vendor_payments (1099-NEC threshold tracking)
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vendor_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_id uuid NOT NULL REFERENCES construction_subs(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  payment_date date NOT NULL,
  amount numeric(12,2) NOT NULL CHECK (amount >= 0),
  category text,                            -- "labor", "materials", "services", ...
  tax_year int NOT NULL,
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','csv','quickbooks','sage')),
  external_id text,                         -- idempotency key for CSV/API imports
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (sub_id, external_id) DEFERRABLE INITIALLY IMMEDIATE
);
CREATE INDEX IF NOT EXISTS vendor_payments_client_year_idx ON vendor_payments(client_id, tax_year);
CREATE INDEX IF NOT EXISTS vendor_payments_sub_year_idx ON vendor_payments(sub_id, tax_year);
ALTER TABLE vendor_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY vp_select_own ON vendor_payments FOR SELECT TO authenticated USING (client_id = auth.uid());
CREATE POLICY vp_insert_own ON vendor_payments FOR INSERT TO authenticated WITH CHECK (client_id = auth.uid());
CREATE POLICY vp_update_own ON vendor_payments FOR UPDATE TO authenticated USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid());
CREATE POLICY vp_delete_own ON vendor_payments FOR DELETE TO authenticated USING (client_id = auth.uid());
