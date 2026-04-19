-- 045_incidents_extend.sql
-- Adds reported_at + retained_until to incidents table.
-- Enforces 5-year retention per 29 CFR 1904.33.
--
-- NOTE: 029_add_record_retention_tracking.sql adds retention columns to DOCUMENTS,
-- not incidents. This migration is additive and does not conflict.
-- NOTE: incident_date is `date` per 001_core_schema.sql — cast to timestamp
-- before adding the 5-year interval, then back to timestamptz.
-- NOTE: Does not alter the existing free-text `severity` column.
-- NOTE: RLS policies for incidents already exist in 001_core_schema.sql —
-- no RLS changes here.

ALTER TABLE incidents
  ADD COLUMN IF NOT EXISTS reported_at timestamptz,
  ADD COLUMN IF NOT EXISTS retained_until timestamptz;

-- Backfill retained_until = incident_date + 5y for existing rows
UPDATE incidents
SET retained_until = (incident_date::timestamp + interval '5 years')::timestamptz
WHERE retained_until IS NULL AND incident_date IS NOT NULL;

-- Trigger: auto-set retained_until on INSERT
CREATE OR REPLACE FUNCTION set_incident_retention()
RETURNS trigger AS $$
BEGIN
  IF NEW.retained_until IS NULL AND NEW.incident_date IS NOT NULL THEN
    NEW.retained_until := (NEW.incident_date::timestamp + interval '5 years')::timestamptz;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS incidents_set_retention ON incidents;
CREATE TRIGGER incidents_set_retention BEFORE INSERT ON incidents
  FOR EACH ROW EXECUTE FUNCTION set_incident_retention();

-- Retention guard: reject DELETE while retention window is active
CREATE OR REPLACE FUNCTION guard_incident_delete()
RETURNS trigger AS $$
BEGIN
  IF OLD.retained_until IS NOT NULL AND OLD.retained_until > now() THEN
    RAISE EXCEPTION 'Cannot delete incident %: retention window active until %',
      COALESCE(OLD.incident_id, OLD.id::text), OLD.retained_until
      USING ERRCODE = '23514';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS incidents_guard_delete ON incidents;
CREATE TRIGGER incidents_guard_delete BEFORE DELETE ON incidents
  FOR EACH ROW EXECUTE FUNCTION guard_incident_delete();

-- Index for banner query performance: open reportable incidents per client
CREATE INDEX IF NOT EXISTS incidents_open_reportable_idx
  ON incidents (client_id, reported_at, incident_date DESC)
  WHERE reported_at IS NULL;
