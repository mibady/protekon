-- Exported from Supabase migration 20260414224006
-- Original name: create_unassigned_view_and_site_helpers

CREATE OR REPLACE VIEW site_unassigned AS
SELECT
  c.id as client_id,
  c.business_name,
  c.plan,
  (SELECT count(*) FROM incidents i WHERE i.client_id = c.id AND i.site_id IS NULL) as incidents_unassigned,
  (SELECT count(*) FROM documents d WHERE d.client_id = c.id AND d.site_id IS NULL) as docs_unassigned,
  (SELECT count(*) FROM training_records t WHERE t.client_id = c.id AND t.site_id IS NULL) as training_unassigned,
  (SELECT count(*) FROM alerts a WHERE a.client_id = c.id AND a.site_id IS NULL) as alerts_unassigned,
  (SELECT count(*) FROM sites s WHERE s.client_id = c.id) as site_count
FROM clients c;

CREATE OR REPLACE FUNCTION assign_records_to_site(
  p_client_id uuid,
  p_site_id uuid
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_inc int; v_doc int; v_tr int; v_al int;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM sites WHERE id = p_site_id AND client_id = p_client_id) THEN
    RAISE EXCEPTION 'Site does not belong to this client';
  END IF;

  UPDATE incidents SET site_id = p_site_id
  WHERE client_id = p_client_id AND site_id IS NULL;
  GET DIAGNOSTICS v_inc = ROW_COUNT;

  UPDATE documents SET site_id = p_site_id
  WHERE client_id = p_client_id AND site_id IS NULL;
  GET DIAGNOSTICS v_doc = ROW_COUNT;

  UPDATE training_records SET site_id = p_site_id
  WHERE client_id = p_client_id AND site_id IS NULL;
  GET DIAGNOSTICS v_tr = ROW_COUNT;

  UPDATE alerts SET site_id = p_site_id
  WHERE client_id = p_client_id AND site_id IS NULL;
  GET DIAGNOSTICS v_al = ROW_COUNT;

  RETURN jsonb_build_object(
    'incidents_assigned', v_inc,
    'documents_assigned', v_doc,
    'training_assigned', v_tr,
    'alerts_assigned', v_al
  );
END;
$$;

GRANT EXECUTE ON FUNCTION assign_records_to_site(uuid, uuid) TO authenticated;
