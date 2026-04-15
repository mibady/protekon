-- Phase 3 / P3-3: jurisdiction-aware document template overrides
-- Replaces base template sections + swaps legal references when client.state != 'CA'.
-- Applied to live Supabase via MCP on 2026-04-15.

CREATE TABLE IF NOT EXISTS public.template_jurisdiction_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id text NOT NULL,
  jurisdiction text NOT NULL CHECK (jurisdiction IN ('ca','federal','ct','md','mn','nj','wa','tx','va','mi','or')),
  sections_override jsonb,
  legal_ref_swap jsonb DEFAULT '{}'::jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(template_id, jurisdiction)
);

CREATE INDEX IF NOT EXISTS idx_tjo_template ON public.template_jurisdiction_overrides(template_id);
CREATE INDEX IF NOT EXISTS idx_tjo_jurisdiction ON public.template_jurisdiction_overrides(jurisdiction);

ALTER TABLE public.template_jurisdiction_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tjo_read_all_authenticated"
  ON public.template_jurisdiction_overrides
  FOR SELECT TO authenticated USING (true);

CREATE TRIGGER set_tjo_updated_at
  BEFORE UPDATE ON public.template_jurisdiction_overrides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed federal-OSHA legal-ref swaps for the 8 platform-wide templates.
INSERT INTO public.template_jurisdiction_overrides (template_id, jurisdiction, legal_ref_swap, notes) VALUES
  ('wvpp', 'federal', '{"Cal/OSHA":"OSHA","Labor Code 6401.9":"OSHA General Duty Clause Section 5(a)(1)","Labor Code §6401.9":"OSHA General Duty Clause §5(a)(1)","Cal/OSHA Title 8":"29 CFR 1910","SB 553":"OSHA General Duty Clause"}'::jsonb, 'Federal employers: SB 553 specifics drop, General Duty Clause governs WVP'),
  ('iipp', 'federal', '{"8 CCR §3203":"29 CFR 1910 (no federal IIPP equivalent — recommended best practice)","Cal/OSHA":"OSHA"}'::jsonb, 'Federal: no IIPP mandate; document is voluntary best practice'),
  ('eap', 'federal', '{"Cal/OSHA":"OSHA","8 CCR §3220":"29 CFR 1910.38"}'::jsonb, NULL),
  ('hazcom', 'federal', '{"Cal/OSHA":"OSHA","8 CCR §5194":"29 CFR 1910.1200"}'::jsonb, NULL),
  ('osha-300-log', 'federal', '{"Cal/OSHA":"OSHA"}'::jsonb, 'Standard 29 CFR 1904 applies — no Cal-specific changes'),
  ('heat-illness-prevention', 'federal', '{"8 CCR §3395":"OSHA General Duty Clause Section 5(a)(1) — no federal heat standard","Cal/OSHA":"OSHA"}'::jsonb, 'Federal employers: no specific heat standard; General Duty Clause + state plans may apply'),
  ('incident-investigation', 'federal', '{"Cal/OSHA":"OSHA","Labor Code §6409.1":"29 CFR 1904.39 (8 hour fatality / hospitalization reporting)"}'::jsonb, NULL),
  ('training-records', 'federal', '{"Cal/OSHA":"OSHA"}'::jsonb, NULL);
