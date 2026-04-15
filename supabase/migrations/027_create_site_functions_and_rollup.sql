-- Exported from Supabase migration 20260414223952
-- Original name: create_site_functions_and_rollup

CREATE OR REPLACE FUNCTION backfill_primary_sites()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_count integer := 0;
  v_client record;
BEGIN
  FOR v_client IN
    SELECT c.id, c.business_name, c.address, c.city, c.state, c.zip, c.employee_count
    FROM clients c
    WHERE c.plan = 'multi-site'
      AND NOT EXISTS (
        SELECT 1 FROM sites s WHERE s.client_id = c.id AND s.is_primary = true
      )
  LOOP
    INSERT INTO sites (client_id, name, address, city, state, zip, employee_count, is_primary)
    VALUES (
      v_client.id,
      COALESCE(v_client.business_name, 'Main Location') || ' — Primary',
      v_client.address, v_client.city, v_client.state, v_client.zip,
      v_client.employee_count, true
    );
    v_count := v_count + 1;
  END LOOP;
  RETURN jsonb_build_object('primary_sites_created', v_count);
END;
$$;

CREATE OR REPLACE FUNCTION provision_primary_site(p_client_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_site_id uuid;
  v_client record;
BEGIN
  SELECT id INTO v_site_id
  FROM sites WHERE client_id = p_client_id AND is_primary = true;
  IF v_site_id IS NOT NULL THEN RETURN v_site_id; END IF;

  SELECT business_name, address, city, state, zip, employee_count
  INTO v_client FROM clients WHERE id = p_client_id;

  INSERT INTO sites (client_id, name, address, city, state, zip, employee_count, is_primary)
  VALUES (
    p_client_id,
    COALESCE(v_client.business_name, 'Main Location') || ' — Primary',
    v_client.address, v_client.city, v_client.state, v_client.zip,
    v_client.employee_count, true
  ) RETURNING id INTO v_site_id;
  RETURN v_site_id;
END;
$$;

CREATE OR REPLACE VIEW site_rollup AS
SELECT
  s.id as site_id,
  s.client_id,
  s.name as site_name,
  s.city,
  s.state,
  s.employee_count,
  s.is_primary,
  COALESCE(inc.total_incidents, 0) as total_incidents,
  COALESCE(inc.severe_incidents, 0) as severe_incidents,
  COALESCE(inc.incidents_30d, 0) as incidents_30d,
  COALESCE(doc.total_docs, 0) as total_documents,
  COALESCE(doc.docs_completed, 0) as docs_completed,
  COALESCE(tr.total_training, 0) as total_training,
  COALESCE(tr.training_complete, 0) as training_complete,
  COALESCE(tr.training_overdue, 0) as training_overdue,
  CASE WHEN COALESCE(tr.total_training, 0) > 0
    THEN round(100.0 * tr.training_complete / tr.total_training, 1)
    ELSE 0
  END as training_pct,
  COALESCE(elr.pending_requests, 0) as pending_log_requests,
  COALESCE(a.unread_alerts, 0) as unread_alerts
FROM sites s
LEFT JOIN LATERAL (
  SELECT
    count(*) as total_incidents,
    count(*) FILTER (WHERE i.severity IN ('severe', 'critical', 'high')) as severe_incidents,
    count(*) FILTER (WHERE i.created_at > now() - interval '30 days') as incidents_30d
  FROM incidents i WHERE i.site_id = s.id
) inc ON true
LEFT JOIN LATERAL (
  SELECT
    count(*) as total_docs,
    count(*) FILTER (WHERE d.status = 'completed') as docs_completed
  FROM documents d WHERE d.site_id = s.id
) doc ON true
LEFT JOIN LATERAL (
  SELECT
    count(*) as total_training,
    count(*) FILTER (WHERE t.status = 'completed') as training_complete,
    count(*) FILTER (WHERE t.status != 'completed' AND t.due_date < now()::date) as training_overdue
  FROM training_records t WHERE t.site_id = s.id
) tr ON true
LEFT JOIN LATERAL (
  SELECT count(*) as pending_requests
  FROM employee_log_requests e WHERE e.site_id = s.id AND e.status = 'pending'
) elr ON true
LEFT JOIN LATERAL (
  SELECT count(*) as unread_alerts
  FROM alerts al WHERE al.site_id = s.id AND al.read = false
) a ON true;

CREATE OR REPLACE FUNCTION get_site_rollup(p_client_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'client_id', p_client_id,
    'site_count', count(*),
    'total_employees', sum(employee_count),
    'totals', jsonb_build_object(
      'incidents', sum(total_incidents),
      'severe_incidents', sum(severe_incidents),
      'incidents_30d', sum(incidents_30d),
      'documents', sum(total_documents),
      'docs_completed', sum(docs_completed),
      'training', sum(total_training),
      'training_complete', sum(training_complete),
      'training_overdue', sum(training_overdue),
      'training_pct', CASE WHEN sum(total_training) > 0
        THEN round(100.0 * sum(training_complete) / sum(total_training), 1) ELSE 0 END,
      'pending_log_requests', sum(pending_log_requests),
      'unread_alerts', sum(unread_alerts)
    ),
    'sites', COALESCE(jsonb_agg(
      jsonb_build_object(
        'site_id', site_id,
        'name', site_name,
        'city', city,
        'state', state,
        'employee_count', employee_count,
        'is_primary', is_primary,
        'incidents', total_incidents,
        'severe_incidents', severe_incidents,
        'incidents_30d', incidents_30d,
        'documents', total_documents,
        'docs_completed', docs_completed,
        'training_pct', training_pct,
        'training_overdue', training_overdue,
        'pending_log_requests', pending_log_requests,
        'unread_alerts', unread_alerts
      ) ORDER BY is_primary DESC, site_name
    ), '[]'::jsonb)
  ) INTO v_result
  FROM site_rollup
  WHERE client_id = p_client_id;

  RETURN COALESCE(v_result, jsonb_build_object(
    'client_id', p_client_id, 'site_count', 0,
    'totals', '{}'::jsonb, 'sites', '[]'::jsonb
  ));
END;
$$;

GRANT EXECUTE ON FUNCTION get_site_rollup(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION provision_primary_site(uuid) TO authenticated;
