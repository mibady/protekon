-- Exported from Supabase migration 20260415000106
-- Original name: patch_subs_view_license_fallback
-- Patch: composite_risk should check license_status as fallback when cslb_primary_status is null

CREATE OR REPLACE VIEW v_construction_subs_dashboard AS
SELECT
  s.id, s.client_id, s.company_name, s.license_number,
  COALESCE(s.cslb_primary_status, s.license_status) AS cslb_primary_status,
  s.cslb_risk_score,
  CASE
    WHEN COALESCE(s.cslb_primary_status, s.license_status) IN ('Active', 'valid') THEN 'green'
    WHEN COALESCE(s.cslb_primary_status, s.license_status) IN ('Inactive', 'expiring') THEN 'yellow'
    WHEN COALESCE(s.cslb_primary_status, s.license_status) IN ('Suspended', 'Revoked', 'suspended', 'revoked') THEN 'red'
    WHEN COALESCE(s.cslb_primary_status, s.license_status) IN ('Expired', 'expired') THEN 'red'
    ELSE 'gray'
  END AS cslb_status_color,
  s.cslb_license_expires,
  s.cslb_wc_expires,
  s.cslb_last_synced,
  CASE
    WHEN s.cslb_license_expires IS NOT NULL AND s.cslb_license_expires < current_date THEN 'expired'
    WHEN s.cslb_license_expires IS NOT NULL AND s.cslb_license_expires < current_date + interval '60 days' THEN 'expiring_soon'
    ELSE 'ok'
  END AS cslb_license_alert,
  s.insurance_status, s.insurance_expiry,
  s.coi_status, s.coi_gl_expires, s.coi_wc_expires, s.coi_last_uploaded,
  CASE
    WHEN s.coi_status = 'none' THEN 'red'
    WHEN s.insurance_expiry IS NOT NULL AND s.insurance_expiry < current_date THEN 'red'
    WHEN s.insurance_expiry IS NOT NULL AND s.insurance_expiry < current_date + interval '30 days' THEN 'yellow'
    WHEN s.coi_status = 'active' THEN 'green'
    ELSE 'gray'
  END AS coi_status_color,
  CASE
    WHEN COALESCE(s.cslb_primary_status, s.license_status) IN ('Suspended', 'Revoked', 'Expired', 'suspended', 'revoked', 'expired') THEN 'critical'
    WHEN s.coi_status = 'expired' OR (s.insurance_expiry IS NOT NULL AND s.insurance_expiry < current_date) THEN 'critical'
    WHEN COALESCE(s.cslb_primary_status, s.license_status) IN ('Inactive', 'expiring') THEN 'high'
    WHEN s.insurance_expiry IS NOT NULL AND s.insurance_expiry < current_date + interval '30 days' THEN 'high'
    WHEN s.cslb_license_expires IS NOT NULL AND s.cslb_license_expires < current_date + interval '60 days' THEN 'medium'
    WHEN s.coi_status = 'none' THEN 'medium'
    ELSE 'low'
  END AS composite_risk,
  latest_coi.carrier_name AS latest_coi_carrier,
  latest_coi.policy_number AS latest_coi_policy,
  latest_coi.expiration_date AS latest_coi_expires,
  latest_coi.additional_insured AS latest_coi_additional_insured,
  s.created_at, s.verified_at
FROM construction_subs s
LEFT JOIN LATERAL (
  SELECT carrier_name, policy_number, expiration_date, additional_insured
  FROM construction_coi WHERE sub_id = s.id AND is_active = true
  ORDER BY expiration_date DESC NULLS LAST LIMIT 1
) latest_coi ON true;

CREATE OR REPLACE VIEW v_subs_needing_action AS
SELECT * FROM v_construction_subs_dashboard
WHERE composite_risk IN ('critical', 'high')
ORDER BY
  CASE composite_risk WHEN 'critical' THEN 0 WHEN 'high' THEN 1 END,
  COALESCE(insurance_expiry, cslb_license_expires, '2099-12-31'::date);
