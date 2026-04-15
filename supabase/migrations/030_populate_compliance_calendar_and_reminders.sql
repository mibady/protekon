-- Exported from Supabase migration 20260414235026
-- Original name: populate_compliance_calendar_and_reminders

-- =============================================================
-- GAP 2: Compliance Calendar + Reminder Pipeline
-- =============================================================

CREATE TABLE IF NOT EXISTS client_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  calendar_entry_id uuid REFERENCES compliance_calendar(id),
  template_key text,
  reminder_type text NOT NULL CHECK (reminder_type IN (
    'annual_review', 'quarterly_review', 'training_due',
    'retention_expiry', 'regulatory_deadline', 'certification_expiry',
    'document_review', 'posting_window', 'coi_expiry', 'license_expiry'
  )),
  title text NOT NULL,
  description text,
  due_date date NOT NULL,
  reminder_dates jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'acknowledged', 'completed', 'snoozed', 'overdue')),
  alert_id uuid REFERENCES alerts(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  snoozed_until date
);

CREATE INDEX IF NOT EXISTS idx_client_reminders_due ON client_reminders(due_date, status) WHERE status IN ('pending', 'sent', 'overdue');
CREATE INDEX IF NOT EXISTS idx_client_reminders_client ON client_reminders(client_id, status);

-- =====================================================
-- Populate compliance_calendar — universal entries
-- =====================================================

INSERT INTO compliance_calendar (vertical_slug, state, title, description, entry_type, month_number, specific_date, recurrence, severity, source_data) VALUES
(NULL, 'CA', 'OSHA 300A Posting Begins', 'Post OSHA Form 300A Annual Summary in visible workplace location. Must remain posted through April 30.', 'regulatory_deadline', 2, '2026-02-01', 'annual', 'critical', '{"legal_ref":"29 CFR 1904.32","penalty_risk":"Automatic citation if inspector visits during posting window"}'),
(NULL, 'CA', 'OSHA 300A Posting Ends', 'Last day OSHA 300A must remain posted.', 'regulatory_deadline', 4, '2026-04-30', 'annual', 'warning', '{"legal_ref":"29 CFR 1904.32"}'),
(NULL, 'CA', 'OSHA ITA Electronic Submission Deadline', 'Employers with 20-249 employees in designated industries must electronically submit OSHA 300A data.', 'regulatory_deadline', 3, '2026-03-02', 'annual', 'critical', '{"legal_ref":"29 CFR 1904.41"}'),
(NULL, 'CA', 'SB 553 Annual WVPP Review', 'Annual review and update of Workplace Violence Prevention Plan.', 'annual_review', 7, NULL, 'annual', 'critical', '{"legal_ref":"Labor Code §6401.9","template_key":"wvpp"}'),
(NULL, 'CA', 'SB 553 Annual Retraining Due', 'Annual employee workplace violence prevention training. Document attendance with signatures.', 'training_due', 7, NULL, 'annual', 'critical', '{"legal_ref":"Labor Code §6401.9(e)","retention_years":5}'),
(NULL, 'CA', 'IIPP Annual Review', 'Annual review of Injury & Illness Prevention Program.', 'annual_review', 1, NULL, 'annual', 'critical', '{"legal_ref":"8 CCR §3203","template_key":"iipp"}'),
(NULL, 'CA', 'AB 1825/SB 1343 Harassment Training Check', 'Verify supervisors (2hr) and non-supervisory (1hr) harassment prevention training within 2-year cycle.', 'training_due', 1, NULL, 'annual', 'warning', '{"legal_ref":"AB 1825, SB 1343","new_hire_deadline":"6 months"}'),
(NULL, 'CA', 'OSHSB Permanent Workplace Violence Standard', 'Permanent standard expected December 2026. All WVPPs may need rewriting.', 'regulatory_deadline', 12, '2026-12-31', 'one_time', 'critical', '{"legal_ref":"OSHSB rulemaking","action":"Review and update all WVPPs"}'),
(NULL, 'CA', 'Heat Illness Prevention — Pre-Season Review', 'Review Heat Illness Prevention Plan before warm weather. Verify water, shade, rest provisions.', 'seasonal_prep', 4, NULL, 'annual', 'warning', '{"legal_ref":"T8 §3395","template_key":"heat_illness"}'),
(NULL, 'CA', 'Year-End Compliance Audit Prep', 'Compile year-end package: training records, incident logs, OSHA 300 data, document updates.', 'annual_review', 11, NULL, 'annual', 'info', '{"action":"Year-end audit package"}'),
(NULL, 'CA', 'Emergency Action Plan Annual Review', 'Review EAP: evacuation routes, assembly points, emergency contacts.', 'annual_review', 1, NULL, 'annual', 'warning', '{"legal_ref":"29 CFR 1910.38","template_key":"eap"}'),
(NULL, 'CA', 'HazCom SDS Binder Audit', 'Verify all Safety Data Sheets are current and accessible on all shifts.', 'annual_review', 1, NULL, 'annual', 'warning', '{"legal_ref":"29 CFR 1910.1200","template_key":"hazcom"}'),
(NULL, 'CA', 'SB 1162 Pay Scale Record Check', 'Verify salary ranges on job postings. Retain job title + wage history for 3 years.', 'regulatory_deadline', 1, NULL, 'annual', 'info', '{"legal_ref":"CA SB 1162"}');

-- CONSTRUCTION
INSERT INTO compliance_calendar (vertical_slug, state, title, description, entry_type, month_number, recurrence, severity, source_data) VALUES
('construction', 'CA', 'Fall Protection Plan Review', 'Review fall protection program and equipment inspection records.', 'annual_review', 3, 'annual', 'critical', '{"legal_ref":"29 CFR 1926.501","template_key":"fall_protection"}'),
('construction', 'CA', 'Silica Exposure Control Plan Review', 'Annual review of silica exposure control plan and air monitoring records.', 'annual_review', 1, 'annual', 'warning', '{"legal_ref":"29 CFR 1926.1153","template_key":"silica_exposure"}'),
('construction', 'CA', 'Sub COI Expiration Audit', 'Audit all active subcontractor COIs for expiration dates.', 'quarterly_review', NULL, 'quarterly', 'critical', '{"action":"Review construction_coi for approaching expirations"}'),
('construction', 'CA', 'CSLB License Status Verification', 'Verify CSLB license status for all active subcontractors.', 'quarterly_review', NULL, 'quarterly', 'critical', '{"action":"Run CSLB sync pipeline"}');

-- MANUFACTURING
INSERT INTO compliance_calendar (vertical_slug, state, title, description, entry_type, month_number, recurrence, severity, source_data) VALUES
('manufacturing', 'CA', 'LOTO Program Annual Inspection', 'Annual inspection of energy control procedures.', 'annual_review', 1, 'annual', 'critical', '{"legal_ref":"29 CFR 1910.147","template_key":"loto_procedure"}'),
('manufacturing', 'CA', 'Machine Guarding Assessment Review', 'Annual review of point-of-operation guards on all machinery.', 'annual_review', 1, 'annual', 'critical', '{"legal_ref":"Cal/OSHA T8 §4001-4005","template_key":"machine_guarding"}'),
('manufacturing', 'CA', 'Hearing Conservation Audiometric Testing', 'Annual audiometric testing for employees exposed above 85 dBA.', 'annual_review', 3, 'annual', 'warning', '{"legal_ref":"29 CFR 1910.95","template_key":"hearing_conservation"}'),
('manufacturing', 'CA', 'Confined Space Program Review', 'Annual review of permit-required confined space program.', 'annual_review', 1, 'annual', 'warning', '{"legal_ref":"29 CFR 1910.146","template_key":"confined_space"}'),
('manufacturing', 'CA', 'Pressure Vessel Certification Check', 'Verify all pressure vessel inspection certificates are current.', 'annual_review', 6, 'annual', 'warning', '{"legal_ref":"Cal/OSHA DOSH"}');

-- HEALTHCARE
INSERT INTO compliance_calendar (vertical_slug, state, title, description, entry_type, month_number, recurrence, severity, source_data) VALUES
('healthcare', 'CA', 'HIPAA Security Risk Analysis', 'Annual SRA: identify all ePHI locations, assess threats, document risk decisions.', 'annual_review', 1, 'annual', 'critical', '{"legal_ref":"45 CFR §164.308(a)(1)","template_key":"hipaa_sra"}'),
('healthcare', 'CA', 'BAA Tracker Audit', 'Review all Business Associate Agreements for currency and completeness.', 'annual_review', 1, 'annual', 'warning', '{"legal_ref":"45 CFR §164.308(b)","template_key":"baa_tracker"}'),
('healthcare', 'CA', 'Bloodborne Pathogen ECP Annual Update', 'Annual ECP review. Update for new sharps safety technology.', 'annual_review', 1, 'annual', 'critical', '{"legal_ref":"29 CFR 1910.1030","template_key":"bbp_exposure"}'),
('healthcare', 'CA', 'ATD Plan Annual Review', 'Annual Aerosol Transmissible Disease plan review.', 'annual_review', 1, 'annual', 'warning', '{"legal_ref":"Cal/OSHA T8 §5199","template_key":"atd_plan"}'),
('healthcare', 'CA', 'Flu Season Compliance Prep', 'Respiratory fit testing, ATD plan review, vaccination docs, PPE inventory.', 'seasonal_prep', 9, 'annual', 'warning', '{"action":"Pre-flu-season respiratory prep"}');

-- WAREHOUSE
INSERT INTO compliance_calendar (vertical_slug, state, title, description, entry_type, month_number, recurrence, severity, source_data) VALUES
('warehouse', 'CA', 'Forklift Operator Recertification Check', 'Verify all operators have current employer-specific evaluation (3-year cycle).', 'annual_review', 1, 'annual', 'critical', '{"legal_ref":"29 CFR 1910.178","template_key":"forklift_cert"}'),
('warehouse', 'CA', 'Racking Inspection Program Review', 'Inspect all racking for damage per RMI/ANSI MH16.1.', 'quarterly_review', NULL, 'quarterly', 'warning', '{"legal_ref":"General Duty Clause §5(a)(1)"}'),
('warehouse', 'CA', 'Peak Season Compliance Prep', 'Pre-peak: I-9, temp worker training, forklift certs, fatigue management.', 'seasonal_prep', 8, 'annual', 'warning', '{"action":"Q4 peak prep"}');

-- AGRICULTURE
INSERT INTO compliance_calendar (vertical_slug, state, title, description, entry_type, month_number, recurrence, severity, source_data) VALUES
('agriculture', 'CA', 'Heat Illness Plan — Agriculture Pre-Season', 'Full heat illness plan review: water, shade, buddy system, high-heat at 95°F.', 'seasonal_prep', 3, 'annual', 'critical', '{"legal_ref":"T8 §3395","template_key":"heat_illness"}'),
('agriculture', 'CA', 'Pesticide Safety Retraining', 'Annual pesticide safety training before application season.', 'training_due', 2, 'annual', 'critical', '{"legal_ref":"3 CCR §6724","template_key":"pesticide_safety"}'),
('agriculture', 'CA', 'Wildfire Smoke Protection Plan Review', 'Pre-fire-season: respirators, AQI monitoring, indoor refuge areas.', 'seasonal_prep', 5, 'annual', 'warning', '{"legal_ref":"T8 §5141.1","template_key":"wildfire_smoke"}'),
('agriculture', 'CA', 'Field Sanitation Setup Verification', '1 toilet/20 employees, handwashing within 1/4 mile, potable water.', 'seasonal_prep', 3, 'annual', 'warning', '{"legal_ref":"T8 §3457"}'),
('agriculture', 'CA', 'H-2A Worker Onboarding Compliance', 'Housing, transportation, meal documentation for seasonal H-2A workers.', 'seasonal_prep', 3, 'annual', 'warning', '{"legal_ref":"29 CFR 1910.142"}');

-- REAL ESTATE
INSERT INTO compliance_calendar (vertical_slug, state, title, description, entry_type, month_number, recurrence, severity, source_data) VALUES
('real_estate', 'CA', 'Rent Control Annual Increase Calculation', 'Calculate allowable increase per AB 1482 (5%+CPI, max 10%) and local ordinance.', 'regulatory_deadline', 10, 'annual', 'critical', '{"legal_ref":"AB 1482","template_key":"rent_control"}'),
('real_estate', 'CA', 'Lead-Based Paint Disclosure Audit', 'Verify pre-1978 units have current disclosure and EPA pamphlet on file.', 'annual_review', 1, 'annual', 'warning', '{"legal_ref":"42 USC §4852d"}'),
('real_estate', 'CA', 'Pool/Spa Compliance Inspection', 'Anti-entrapment drains, CPR signage, gate height, depth markers.', 'annual_review', 4, 'annual', 'warning', '{"legal_ref":"Virginia Graeme Baker Act"}');

-- AUTOMOTIVE
INSERT INTO compliance_calendar (vertical_slug, state, title, description, entry_type, month_number, recurrence, severity, source_data) VALUES
('automotive', 'CA', 'Spray Booth Airflow Testing', 'Annual spray booth airflow measurement and filter replacement documentation.', 'annual_review', 3, 'annual', 'critical', '{"legal_ref":"29 CFR 1910.94(c), T8 §5154","template_key":"spray_booth"}'),
('automotive', 'CA', 'Hydraulic Lift Inspection', 'Annual lift inspection per ALI/ANSI standard.', 'annual_review', 3, 'annual', 'warning', '{"legal_ref":"ALI ALOIM-2020"}'),
('automotive', 'CA', 'Used Oil Generator Compliance Check', 'Verify used oil storage labeling, container integrity, transporter docs.', 'annual_review', 1, 'annual', 'warning', '{"legal_ref":"CA H&S Code §25250"}');

-- RETAIL
INSERT INTO compliance_calendar (vertical_slug, state, title, description, entry_type, month_number, recurrence, severity, source_data) VALUES
('retail', 'CA', 'Multi-Location IIPP/WVPP Audit', 'Verify each location has site-specific IIPP and WVPP.', 'annual_review', 1, 'annual', 'critical', '{"legal_ref":"T8 §3203, SB 553"}'),
('retail', 'CA', 'Holiday Season Hiring Compliance Prep', 'I-9 within 3 days, work permits for minors, harassment training within 30 days.', 'seasonal_prep', 9, 'annual', 'warning', '{"action":"Q4 seasonal hiring prep"}');

-- TRANSPORTATION
INSERT INTO compliance_calendar (vertical_slug, state, title, description, entry_type, month_number, recurrence, severity, source_data) VALUES
('transportation', 'CA', 'Driver Qualification File Audit', 'Annual DQ file audit for every CDL driver.', 'annual_review', 1, 'annual', 'critical', '{"legal_ref":"49 CFR §391.51","template_key":"dq_file"}'),
('transportation', 'CA', 'DOT Annual Vehicle Inspection Cycle', 'Verify all CMVs have current annual DOT inspection.', 'annual_review', 1, 'annual', 'critical', '{"legal_ref":"49 CFR §396.17"}'),
('transportation', 'CA', 'Drug & Alcohol Random Testing Rate', 'Verify pool includes all CDL holders. Min rates: 50% drugs, 10% alcohol.', 'annual_review', 1, 'annual', 'critical', '{"legal_ref":"49 CFR Part 382"}'),
('transportation', 'CA', 'CARB Truck & Bus Regulation Check', 'Verify diesel vehicles meet CARB emissions standards. Update reporting.', 'annual_review', 1, 'annual', 'warning', '{"legal_ref":"CARB Truck and Bus Regulation"}'),
('transportation', 'CA', 'Winter Fleet Prep', 'Chain law, tire tread docs, cold weather procedures.', 'seasonal_prep', 11, 'annual', 'info', '{"action":"Winter fleet prep"}');

-- HOSPITALITY
INSERT INTO compliance_calendar (vertical_slug, state, title, description, entry_type, month_number, recurrence, severity, source_data) VALUES
('hospitality', 'CA', 'Bloodborne Pathogen ECP — Hospitality', 'Annual ECP review: sharps containers, Hep B vaccination records, post-exposure protocols.', 'annual_review', 1, 'annual', 'critical', '{"legal_ref":"29 CFR 1910.1030","template_key":"bbp_exposure"}'),
('hospitality', 'CA', 'Fire Safety System Testing', 'Quarterly alarm testing, monthly extinguisher inspection, annual maintenance, NFPA 25 sprinkler.', 'quarterly_review', NULL, 'quarterly', 'warning', '{"legal_ref":"NFPA 25"}'),
('hospitality', 'CA', 'Summer Tourism Compliance Prep', 'Pool inspection, heat illness for outdoor staff, seasonal hire training, evacuation updates.', 'seasonal_prep', 5, 'annual', 'warning', '{"action":"Summer tourism prep"}'),
('hospitality', 'CA', 'SB 1172 Food Allergy Manager Training', 'Verify manager on each shift has food allergy awareness training. Poster displayed.', 'annual_review', 1, 'annual', 'info', '{"legal_ref":"SB 1172"}');

-- =====================================================
-- Reminder generation + processing functions
-- =====================================================

CREATE OR REPLACE FUNCTION fn_generate_client_reminders(p_client_id uuid DEFAULT NULL)
RETURNS jsonb AS $$
DECLARE
  client_rec record;
  cal_rec record;
  reminder_count int := 0;
  target_year int := EXTRACT(YEAR FROM current_date)::int;
BEGIN
  FOR client_rec IN
    SELECT id, vertical, plan FROM clients
    WHERE status = 'active'
    AND (p_client_id IS NULL OR id = p_client_id)
  LOOP
    FOR cal_rec IN
      SELECT * FROM compliance_calendar
      WHERE (vertical_slug IS NULL OR vertical_slug = client_rec.vertical)
    LOOP
      IF NOT EXISTS (
        SELECT 1 FROM client_reminders
        WHERE client_id = client_rec.id
        AND calendar_entry_id = cal_rec.id
        AND EXTRACT(YEAR FROM due_date) = target_year
      ) THEN
        INSERT INTO client_reminders (
          client_id, calendar_entry_id, template_key,
          reminder_type, title, description, due_date,
          reminder_dates, metadata
        ) VALUES (
          client_rec.id, cal_rec.id,
          (cal_rec.source_data->>'template_key'),
          CASE cal_rec.entry_type
            WHEN 'annual_review' THEN 'annual_review'
            WHEN 'quarterly_review' THEN 'quarterly_review'
            WHEN 'training_due' THEN 'training_due'
            WHEN 'regulatory_deadline' THEN 'regulatory_deadline'
            ELSE 'document_review'
          END,
          cal_rec.title, cal_rec.description,
          CASE
            WHEN cal_rec.specific_date IS NOT NULL THEN cal_rec.specific_date
            WHEN cal_rec.month_number IS NOT NULL THEN make_date(target_year, cal_rec.month_number, 1)
            ELSE make_date(target_year, 1, 1)
          END,
          jsonb_build_array(
            jsonb_build_object('days_before', 30, 'channel', 'in_app', 'sent', false),
            jsonb_build_object('days_before', 14, 'channel', 'in_app', 'sent', false),
            jsonb_build_object('days_before', 7, 'channel', 'email', 'sent', false),
            jsonb_build_object('days_before', 0, 'channel', 'email', 'sent', false)
          ),
          jsonb_build_object(
            'severity', cal_rec.severity,
            'legal_ref', cal_rec.source_data->>'legal_ref',
            'vertical', client_rec.vertical,
            'recurrence', cal_rec.recurrence
          )
        );
        reminder_count := reminder_count + 1;
      END IF;
    END LOOP;
  END LOOP;
  RETURN jsonb_build_object('reminders_created', reminder_count, 'year', target_year, 'run_at', now());
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_process_due_reminders()
RETURNS jsonb AS $$
DECLARE
  rem record;
  alerts_created int := 0;
  overdue_marked int := 0;
BEGIN
  UPDATE client_reminders SET status = 'overdue'
  WHERE due_date < current_date AND status IN ('pending', 'sent');
  GET DIAGNOSTICS overdue_marked = ROW_COUNT;

  FOR rem IN
    SELECT cr.* FROM client_reminders cr
    JOIN clients c ON cr.client_id = c.id
    WHERE cr.status IN ('pending', 'sent')
    AND cr.due_date BETWEEN current_date AND current_date + interval '30 days'
    AND NOT EXISTS (
      SELECT 1 FROM alerts a WHERE a.source_ref = 'reminder:' || cr.id::text
      AND a.created_at > current_date - interval '7 days'
    )
  LOOP
    INSERT INTO alerts (client_id, type, title, message, severity, action_url, source_ref, metadata)
    VALUES (
      rem.client_id, 'compliance_reminder', rem.title, rem.description,
      COALESCE(rem.metadata->>'severity', 'info'), '/dashboard/calendar',
      'reminder:' || rem.id::text,
      jsonb_build_object('due_date', rem.due_date, 'reminder_type', rem.reminder_type, 'days_until_due', rem.due_date - current_date)
    );
    UPDATE client_reminders SET status = 'sent' WHERE id = rem.id;
    alerts_created := alerts_created + 1;
  END LOOP;

  RETURN jsonb_build_object('alerts_created', alerts_created, 'overdue_marked', overdue_marked, 'run_at', now());
END;
$$ LANGUAGE plpgsql;
