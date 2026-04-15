-- Exported from Supabase migration 20260414234601
-- Original name: add_record_retention_tracking

-- =============================================================
-- GAP 1: Record Retention Tracking
-- Add retention deadline columns to documents table
-- =============================================================

ALTER TABLE documents
ADD COLUMN IF NOT EXISTS template_key text REFERENCES document_templates(template_key),
ADD COLUMN IF NOT EXISTS retention_expires_at date,
ADD COLUMN IF NOT EXISTS retention_status text DEFAULT 'active' CHECK (retention_status IN ('active', 'expiring_soon', 'expired', 'archived')),
ADD COLUMN IF NOT EXISTS last_reviewed_at timestamptz,
ADD COLUMN IF NOT EXISTS next_review_due date;

CREATE INDEX IF NOT EXISTS idx_documents_retention_expires
ON documents(retention_expires_at) WHERE retention_status != 'archived';

CREATE INDEX IF NOT EXISTS idx_documents_next_review
ON documents(next_review_due) WHERE next_review_due IS NOT NULL;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'document_templates_template_key_unique'
  ) THEN
    ALTER TABLE document_templates ADD CONSTRAINT document_templates_template_key_unique UNIQUE (template_key);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION fn_set_document_retention()
RETURNS trigger AS $$
DECLARE
  tmpl record;
BEGIN
  IF NEW.template_key IS NOT NULL AND NEW.retention_expires_at IS NULL THEN
    SELECT retention_years, review_frequency INTO tmpl
    FROM document_templates WHERE template_key = NEW.template_key;

    IF tmpl IS NOT NULL THEN
      IF tmpl.retention_years IS NOT NULL THEN
        NEW.retention_expires_at := (COALESCE(NEW.created_at, now())::date + (tmpl.retention_years || ' years')::interval)::date;
      END IF;

      IF NEW.next_review_due IS NULL THEN
        CASE tmpl.review_frequency
          WHEN 'annual' THEN
            NEW.next_review_due := (COALESCE(NEW.created_at, now())::date + interval '1 year')::date;
          WHEN 'quarterly' THEN
            NEW.next_review_due := (COALESCE(NEW.created_at, now())::date + interval '3 months')::date;
          WHEN 'every_3_years' THEN
            NEW.next_review_due := (COALESCE(NEW.created_at, now())::date + interval '3 years')::date;
          WHEN 'on_change' THEN
            NEW.next_review_due := NULL;
          WHEN 'per_incident' THEN
            NEW.next_review_due := NULL;
          WHEN 'per_project' THEN
            NEW.next_review_due := NULL;
          ELSE
            NEW.next_review_due := (COALESCE(NEW.created_at, now())::date + interval '1 year')::date;
        END CASE;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_document_retention ON documents;
CREATE TRIGGER trg_set_document_retention
  BEFORE INSERT OR UPDATE OF template_key ON documents
  FOR EACH ROW EXECUTE FUNCTION fn_set_document_retention();

CREATE OR REPLACE FUNCTION fn_update_retention_statuses()
RETURNS jsonb AS $$
DECLARE
  expired_count int;
  expiring_count int;
BEGIN
  UPDATE documents
  SET retention_status = 'expired'
  WHERE retention_expires_at < current_date
    AND retention_status NOT IN ('expired', 'archived');
  GET DIAGNOSTICS expired_count = ROW_COUNT;

  UPDATE documents
  SET retention_status = 'expiring_soon'
  WHERE retention_expires_at BETWEEN current_date AND (current_date + interval '90 days')
    AND retention_status = 'active';
  GET DIAGNOSTICS expiring_count = ROW_COUNT;

  RETURN jsonb_build_object(
    'expired', expired_count,
    'expiring_soon', expiring_count,
    'run_at', now()
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE VIEW v_retention_alerts AS
SELECT
  d.id AS document_id,
  d.client_id,
  d.type AS document_type,
  d.filename,
  d.template_key,
  dt.display_name AS template_name,
  dt.retention_years,
  dt.review_frequency,
  d.created_at,
  d.retention_expires_at,
  d.retention_status,
  d.next_review_due,
  d.last_reviewed_at,
  CASE
    WHEN d.retention_expires_at < current_date THEN 'retention_expired'
    WHEN d.retention_expires_at < current_date + interval '90 days' THEN 'retention_expiring'
    WHEN d.next_review_due IS NOT NULL AND d.next_review_due < current_date THEN 'review_overdue'
    WHEN d.next_review_due IS NOT NULL AND d.next_review_due < current_date + interval '30 days' THEN 'review_upcoming'
    ELSE 'ok'
  END AS alert_type,
  CASE
    WHEN d.retention_expires_at IS NOT NULL THEN d.retention_expires_at - current_date
    ELSE NULL
  END AS days_until_retention_expiry,
  CASE
    WHEN d.next_review_due IS NOT NULL THEN d.next_review_due - current_date
    ELSE NULL
  END AS days_until_review
FROM documents d
LEFT JOIN document_templates dt ON d.template_key = dt.template_key
WHERE d.status != 'archived'
ORDER BY
  CASE
    WHEN d.retention_expires_at < current_date THEN 0
    WHEN d.next_review_due < current_date THEN 1
    WHEN d.retention_expires_at < current_date + interval '90 days' THEN 2
    WHEN d.next_review_due < current_date + interval '30 days' THEN 3
    ELSE 4
  END,
  COALESCE(d.retention_expires_at, d.next_review_due, '2099-12-31'::date);
