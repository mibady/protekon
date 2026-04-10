-- 012: Enhance compliance_score_leads for SB 553 posture fields + two-phase submit
ALTER TABLE compliance_score_leads
  ADD COLUMN IF NOT EXISTS posture_has_wvpp boolean,
  ADD COLUMN IF NOT EXISTS posture_wvpp_site_specific boolean,
  ADD COLUMN IF NOT EXISTS posture_has_incident_log boolean,
  ADD COLUMN IF NOT EXISTS posture_pii_stripped boolean,
  ADD COLUMN IF NOT EXISTS posture_training_current boolean,
  ADD COLUMN IF NOT EXISTS posture_audit_ready boolean,
  ADD COLUMN IF NOT EXISTS pdf_downloaded boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pdf_downloaded_at timestamptz,
  ADD COLUMN IF NOT EXISTS referrer_url text;
