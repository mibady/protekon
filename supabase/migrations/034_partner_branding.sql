-- Phase 3 / P3-4: white-label partner branding
-- Per-partner overrides applied at sample/email/document render time.
-- Applied to live Supabase via MCP on 2026-04-15.

CREATE TABLE IF NOT EXISTS public.partner_branding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL UNIQUE REFERENCES public.partner_profiles(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  logo_blob_path text,
  primary_color text NOT NULL DEFAULT '#C41230' CHECK (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  accent_color text NOT NULL DEFAULT '#D4AF52' CHECK (accent_color ~ '^#[0-9A-Fa-f]{6}$'),
  email_from_name text,
  custom_domain_host text UNIQUE,
  contact_email text NOT NULL,
  hide_protekon_attribution boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partner_branding_partner ON public.partner_branding(partner_id);

ALTER TABLE public.partner_branding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "branding_select_own"
  ON public.partner_branding
  FOR SELECT TO authenticated
  USING (partner_id IN (SELECT id FROM public.partner_profiles WHERE user_id = auth.uid()));

CREATE POLICY "branding_insert_own"
  ON public.partner_branding
  FOR INSERT TO authenticated
  WITH CHECK (partner_id IN (SELECT id FROM public.partner_profiles WHERE user_id = auth.uid()));

CREATE POLICY "branding_update_own"
  ON public.partner_branding
  FOR UPDATE TO authenticated
  USING (partner_id IN (SELECT id FROM public.partner_profiles WHERE user_id = auth.uid()))
  WITH CHECK (partner_id IN (SELECT id FROM public.partner_profiles WHERE user_id = auth.uid()));

CREATE TRIGGER set_partner_branding_updated_at
  BEFORE UPDATE ON public.partner_branding
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
