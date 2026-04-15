-- Exported from Supabase migration 20260414235122
-- Original name: coi_upload_function_and_cslb_view

-- =============================================================
-- GAP 3: COI Upload Pipeline — DB function for processing
-- =============================================================

CREATE OR REPLACE FUNCTION fn_process_coi_upload(
  p_sub_id uuid,
  p_client_id uuid,
  p_storage_path text,
  p_extracted_data jsonb DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  coi_id uuid;
  sub_rec record;
  days_until_expiry int;
BEGIN
  SELECT * INTO sub_rec FROM construction_subs WHERE id = p_sub_id AND client_id = p_client_id;
  IF sub_rec IS NULL THEN
    RETURN jsonb_build_object('error', 'Subcontractor not found');
  END IF;

  INSERT INTO construction_coi (
    sub_id, client_id, storage_path, upload_source,
    carrier_name, policy_number, policy_type,
    coverage_limit, aggregate_limit,
    effective_date, expiration_date,
    insured_name, additional_insured, waiver_of_subrogation,
    extraction_status, extraction_confidence
  ) VALUES (
    p_sub_id, p_client_id, p_storage_path, 'client_upload',
    p_extracted_data->>'carrier_name',
    p_extracted_data->>'policy_number',
    p_extracted_data->>'policy_type',
    (p_extracted_data->>'coverage_limit')::numeric,
    (p_extracted_data->>'aggregate_limit')::numeric,
    (p_extracted_data->>'effective_date')::date,
    (p_extracted_data->>'expiration_date')::date,
    p_extracted_data->>'insured_name',
    (p_extracted_data->>'additional_insured')::boolean,
    (p_extracted_data->>'waiver_of_subrogation')::boolean,
    CASE WHEN p_extracted_data IS NOT NULL THEN 'extracted' ELSE 'pending' END,
    (p_extracted_data->>'confidence')::numeric
  )
  RETURNING id INTO coi_id;

  UPDATE construction_subs SET
    insurance_status = CASE
      WHEN (p_extracted_data->>'expiration_date')::date > current_date THEN 'valid'
      ELSE 'expired'
    END,
    insurance_expiry = (p_extracted_data->>'expiration_date')::date,
    coi_status = CASE
      WHEN (p_extracted_data->>'expiration_date')::date > current_date THEN 'active'
      ELSE 'expired'
    END,
    coi_last_uploaded = now(),
    coi_gl_expires = CASE
      WHEN p_extracted_data->>'policy_type' IN ('GL', 'CGL', 'General Liability')
      THEN (p_extracted_data->>'expiration_date')::date
      ELSE coi_gl_expires
    END,
    coi_wc_expires = CASE
      WHEN p_extracted_data->>'policy_type' IN ('WC', 'Workers Comp', 'Workers Compensation')
      THEN (p_extracted_data->>'expiration_date')::date
      ELSE coi_wc_expires
    END
  WHERE id = p_sub_id;

  IF p_extracted_data->>'expiration_date' IS NOT NULL THEN
    days_until_expiry := (p_extracted_data->>'expiration_date')::date - current_date;

    IF days_until_expiry <= 60 AND days_until_expiry > 0 THEN
      INSERT INTO alerts (client_id, type, title, message, severity, action_url, source_ref, metadata)
      VALUES (
        p_client_id, 'coi_expiring',
        'COI Expiring: ' || sub_rec.company_name,
        sub_rec.company_name || ' COI expires in ' || days_until_expiry || ' days. Request updated certificate.',
        CASE WHEN days_until_expiry <= 30 THEN 'critical' ELSE 'warning' END,
        '/dashboard/construction/subs/' || p_sub_id::text,
        'coi:' || coi_id::text,
        jsonb_build_object('sub_id', p_sub_id, 'coi_id', coi_id, 'expiration_date', p_extracted_data->>'expiration_date', 'days_until_expiry', days_until_expiry)
      );
    ELSIF days_until_expiry <= 0 THEN
      INSERT INTO alerts (client_id, type, title, message, severity, action_url, source_ref, metadata)
      VALUES (
        p_client_id, 'coi_expired',
        'COI EXPIRED: ' || sub_rec.company_name,
        sub_rec.company_name || ' COI has expired. Sub is operating without valid insurance. Immediate action required.',
        'critical',
        '/dashboard/construction/subs/' || p_sub_id::text,
        'coi:' || coi_id::text,
        jsonb_build_object('sub_id', p_sub_id, 'coi_id', coi_id, 'expiration_date', p_extracted_data->>'expiration_date')
      );
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'coi_id', coi_id,
    'sub_id', p_sub_id,
    'extraction_status', CASE WHEN p_extracted_data IS NOT NULL THEN 'extracted' ELSE 'pending' END,
    'days_until_expiry', days_until_expiry
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION fn_scan_coi_expirations()
RETURNS jsonb AS $$
DECLARE
  coi_rec record;
  alerts_created int := 0;
BEGIN
  FOR coi_rec IN
    SELECT c.id AS coi_id, c.sub_id, c.client_id, c.expiration_date,
           s.company_name,
           (c.expiration_date - current_date) AS days_until_expiry,
           CASE
             WHEN c.expiration_date - current_date <= 30 AND NOT c.alert_30d_sent THEN '30d'
             WHEN c.expiration_date - current_date <= 60 AND NOT c.alert_60d_sent THEN '60d'
             WHEN c.expiration_date < current_date AND NOT c.alert_expired_sent THEN 'expired'
           END AS alert_window
    FROM construction_coi c
    JOIN construction_subs s ON c.sub_id = s.id
    WHERE c.is_active = true
    AND c.expiration_date IS NOT NULL
    AND (
      (c.expiration_date - current_date <= 30 AND NOT c.alert_30d_sent)
      OR (c.expiration_date - current_date <= 60 AND NOT c.alert_60d_sent)
      OR (c.expiration_date < current_date AND NOT c.alert_expired_sent)
    )
  LOOP
    INSERT INTO alerts (client_id, type, title, message, severity, action_url, source_ref, metadata)
    VALUES (
      coi_rec.client_id,
      CASE WHEN coi_rec.alert_window = 'expired' THEN 'coi_expired' ELSE 'coi_expiring' END,
      CASE coi_rec.alert_window
        WHEN 'expired' THEN 'COI EXPIRED: ' || coi_rec.company_name
        WHEN '30d' THEN 'COI Expires in 30 Days: ' || coi_rec.company_name
        ELSE 'COI Expires in 60 Days: ' || coi_rec.company_name
      END,
      coi_rec.company_name || CASE coi_rec.alert_window
        WHEN 'expired' THEN ' COI has expired. Immediate action required.'
        WHEN '30d' THEN ' COI expires in ' || coi_rec.days_until_expiry || ' days.'
        ELSE ' COI expires in ' || coi_rec.days_until_expiry || ' days. Plan ahead.'
      END,
      CASE WHEN coi_rec.alert_window IN ('expired', '30d') THEN 'critical' ELSE 'warning' END,
      '/dashboard/construction/subs/' || coi_rec.sub_id::text,
      'coi_scan:' || coi_rec.coi_id::text,
      jsonb_build_object('coi_id', coi_rec.coi_id, 'sub_id', coi_rec.sub_id, 'expiration_date', coi_rec.expiration_date)
    );

    UPDATE construction_coi SET
      alert_30d_sent = CASE WHEN coi_rec.alert_window = '30d' THEN true ELSE alert_30d_sent END,
      alert_60d_sent = CASE WHEN coi_rec.alert_window = '60d' THEN true ELSE alert_60d_sent END,
      alert_expired_sent = CASE WHEN coi_rec.alert_window = 'expired' THEN true ELSE alert_expired_sent END
    WHERE id = coi_rec.coi_id;

    alerts_created := alerts_created + 1;
  END LOOP;

  RETURN jsonb_build_object('alerts_created', alerts_created, 'run_at', now());
END;
$$ LANGUAGE plpgsql;

-- =============================================================
-- GAP 4: CSLB Subcontractor View with risk columns
-- =============================================================

CREATE OR REPLACE VIEW v_construction_subs_dashboard AS
SELECT
  s.id,
  s.client_id,
  s.company_name,
  s.license_number,
  s.cslb_primary_status,
  s.cslb_risk_score,
  CASE
    WHEN s.cslb_primary_status = 'Active' THEN 'green'
    WHEN s.cslb_primary_status = 'Inactive' THEN 'yellow'
    WHEN s.cslb_primary_status IN ('Suspended', 'Revoked') THEN 'red'
    WHEN s.cslb_primary_status = 'Expired' THEN 'red'
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
  s.insurance_status,
  s.insurance_expiry,
  s.coi_status,
  s.coi_gl_expires,
  s.coi_wc_expires,
  s.coi_last_uploaded,
  CASE
    WHEN s.coi_status = 'none' THEN 'red'
    WHEN s.insurance_expiry IS NOT NULL AND s.insurance_expiry < current_date THEN 'red'
    WHEN s.insurance_expiry IS NOT NULL AND s.insurance_expiry < current_date + interval '30 days' THEN 'yellow'
    WHEN s.coi_status = 'active' THEN 'green'
    ELSE 'gray'
  END AS coi_status_color,
  CASE
    WHEN s.cslb_primary_status IN ('Suspended', 'Revoked', 'Expired') THEN 'critical'
    WHEN s.coi_status = 'expired' OR (s.insurance_expiry IS NOT NULL AND s.insurance_expiry < current_date) THEN 'critical'
    WHEN s.cslb_primary_status = 'Inactive' THEN 'high'
    WHEN s.insurance_expiry IS NOT NULL AND s.insurance_expiry < current_date + interval '30 days' THEN 'high'
    WHEN s.cslb_license_expires IS NOT NULL AND s.cslb_license_expires < current_date + interval '60 days' THEN 'medium'
    WHEN s.coi_status = 'none' THEN 'medium'
    ELSE 'low'
  END AS composite_risk,
  latest_coi.carrier_name AS latest_coi_carrier,
  latest_coi.policy_number AS latest_coi_policy,
  latest_coi.expiration_date AS latest_coi_expires,
  latest_coi.additional_insured AS latest_coi_additional_insured,
  s.created_at,
  s.verified_at
FROM construction_subs s
LEFT JOIN LATERAL (
  SELECT carrier_name, policy_number, expiration_date, additional_insured
  FROM construction_coi
  WHERE sub_id = s.id AND is_active = true
  ORDER BY expiration_date DESC NULLS LAST
  LIMIT 1
) latest_coi ON true;

CREATE OR REPLACE VIEW v_subs_needing_action AS
SELECT * FROM v_construction_subs_dashboard
WHERE composite_risk IN ('critical', 'high')
ORDER BY
  CASE composite_risk WHEN 'critical' THEN 0 WHEN 'high' THEN 1 END,
  COALESCE(insurance_expiry, cslb_license_expires, '2099-12-31'::date);
