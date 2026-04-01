-- =============================================================================
-- Protekon — Demo Seed Data
-- =============================================================================
-- Client: Coastal Health Group (fictional HIPAA + SB 553 healthcare company)
-- Purpose: Realistic demo data for development, testing, and stakeholder demos
-- Usage:  Run via `supabase db reset` or paste into Supabase SQL Editor
-- Safety: Uses DELETE + INSERT pattern — idempotent, safe to re-run
-- Login:  admin@coastalhealthgroup.com / demo-password-2026
-- =============================================================================

BEGIN;

DO $$ BEGIN RAISE NOTICE 'Seeding Protekon demo data for Coastal Health Group...'; END $$;

-- ============================================================
-- AUTH USER — demo login (local dev only, works with supabase db reset)
-- ============================================================
DELETE FROM auth.identities WHERE user_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000001';

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data,
  aud, role, confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'admin@coastalhealthgroup.com',
  crypt('demo-password-2026', gen_salt('bf')),
  now(), '2025-11-15T09:00:00Z', now(),
  '{"business_name":"Coastal Health Group","vertical":"hipaa","plan":"managed"}'::jsonb,
  '{"provider":"email","providers":["email"]}'::jsonb,
  'authenticated', 'authenticated', ''
);

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id,
  last_sign_in_at, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '{"sub":"00000000-0000-0000-0000-000000000001","email":"admin@coastalhealthgroup.com"}'::jsonb,
  'email', '00000000-0000-0000-0000-000000000001',
  now(), '2025-11-15T09:00:00Z', now()
);

-- ============================================================
-- CLEANUP — reverse dependency order
-- ============================================================
DELETE FROM public.poster_compliance    WHERE client_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM public.phi_assets           WHERE client_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM public.baa_agreements       WHERE client_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM public.audit_log            WHERE client_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM public.scheduled_deliveries WHERE client_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM public.training_records     WHERE client_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM public.audits               WHERE client_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM public.documents            WHERE client_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM public.incidents            WHERE client_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM public.clients              WHERE id = '00000000-0000-0000-0000-000000000001';

DELETE FROM public.intake_submissions   WHERE email IN ('admin@coastalhealthgroup.com', 'ops@summiturgentcare.com');
DELETE FROM public.sample_report_leads  WHERE email IN ('maria.chen@bayviewmedical.com', 'jturner@pacificwellness.org', 'rpatil@sonomaclinic.com');
DELETE FROM public.regulatory_updates;
DELETE FROM public.municipal_ordinances WHERE jurisdiction IN ('California', 'City of Los Angeles', 'City of San Francisco');

-- ============================================================
-- 1. clients (1 row)
-- ============================================================
INSERT INTO public.clients (id, email, business_name, phone, vertical, plan, compliance_score, risk_level, status, notification_preferences, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@coastalhealthgroup.com',
  'Coastal Health Group',
  '(310) 555-0142',
  'hipaa',
  'managed',
  83,
  'medium',
  'active',
  '{"regulatory_updates":true,"document_reminders":true,"weekly_summaries":true,"incident_alerts":true,"marketing_emails":false}'::jsonb,
  '2025-11-15T09:00:00Z',
  '2026-03-28T14:30:00Z'
);

-- ============================================================
-- 2. incidents (5 rows) — with metadata jsonb
-- ============================================================
INSERT INTO public.incidents (client_id, incident_id, description, location, incident_date, severity, follow_up_id, metadata, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000001',
   'INC-2026-001',
   'Employee reported a verbal threat involving mention of a weapon from a patient family member in the waiting area. Staff de-escalated and contacted security. No physical contact occurred.',
   'Main Clinic — Waiting Area',
   '2026-01-12',
   'severe',
   'FU-2026-001',
   '{"type":"injury","time":"16:45","injuryOccurred":false,"medicalTreatment":false,"witnesses":"Front desk staff, security guard","actionsTaken":"Area secured, incident documented, security protocols reviewed"}'::jsonb,
   '2026-01-12T16:45:00Z'),

  ('00000000-0000-0000-0000-000000000001',
   'INC-2026-002',
   'Two individuals engaged in a loud verbal confrontation in the staff parking lot at shift change. One individual followed an employee toward the building entrance before being intercepted by security.',
   'Staff Parking Lot B',
   '2026-02-03',
   'serious',
   'FU-2026-002',
   '{"type":"near-miss","time":"19:20","injuryOccurred":false,"medicalTreatment":false,"witnesses":"Shift change staff","actionsTaken":"Security escort provided, parking lot camera reviewed"}'::jsonb,
   '2026-02-03T19:20:00Z'),

  ('00000000-0000-0000-0000-000000000001',
   'INC-2026-003',
   'Patient in exam room became agitated and threw a clipboard at the wall after a prolonged wait. No staff were in the immediate area. Patient was later calmed by attending physician.',
   'East Wing — Exam Room 4',
   '2026-02-18',
   'moderate',
   NULL,
   '{"type":"property","time":"11:10","injuryOccurred":false,"medicalTreatment":false,"witnesses":"None present","actionsTaken":"Patient de-escalated by physician"}'::jsonb,
   '2026-02-18T11:10:00Z'),

  ('00000000-0000-0000-0000-000000000001',
   'INC-2026-004',
   'Security camera captured an unidentified individual attempting to enter the records storage area via a side door after business hours. Door remained locked. Individual left after two attempts.',
   'Records Storage — Side Entrance',
   '2026-03-05',
   'moderate',
   'FU-2026-004',
   '{"type":"near-miss","time":"22:35","injuryOccurred":false,"medicalTreatment":false,"witnesses":"Security camera","actionsTaken":"Camera footage preserved, door lock verified, police notified"}'::jsonb,
   '2026-03-05T22:35:00Z'),

  ('00000000-0000-0000-0000-000000000001',
   'INC-2026-005',
   'Vending machine in break room was kicked and damaged by unknown person during lunch hour. No witnesses. Damage limited to cosmetic dent on the front panel.',
   'Staff Break Room',
   '2026-03-20',
   'minor',
   NULL,
   '{"type":"property","time":"13:15","injuryOccurred":false,"medicalTreatment":false,"witnesses":"None","actionsTaken":"Damage documented, break room camera under review"}'::jsonb,
   '2026-03-20T13:15:00Z');

-- ============================================================
-- 3. documents (8 rows) — with status, notes, priority
-- ============================================================
INSERT INTO public.documents (client_id, document_id, type, filename, storage_url, pages, status, notes, priority, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000001',
   'DOC-2026-001', 'wvpp',
   'Coastal_Health_Group_WVPP_2026.pdf',
   'https://storage.protekon.com/docs/00000001/wvpp-2026.pdf',
   34, 'current', NULL, 'standard',
   '2026-01-05T10:00:00Z'),

  ('00000000-0000-0000-0000-000000000001',
   'DOC-2026-002', 'gap-analysis',
   'Coastal_Health_Group_Gap_Analysis_Q1_2026.pdf',
   'https://storage.protekon.com/docs/00000001/gap-analysis-q1-2026.pdf',
   18, 'current', NULL, 'standard',
   '2026-01-10T14:00:00Z'),

  ('00000000-0000-0000-0000-000000000001',
   'DOC-2026-003', 'incident-response-protocol',
   'Coastal_Health_Group_Incident_Response_Protocol.pdf',
   'https://storage.protekon.com/docs/00000001/incident-response-protocol.pdf',
   12, 'current', NULL, 'standard',
   '2026-01-15T09:30:00Z'),

  ('00000000-0000-0000-0000-000000000001',
   'DOC-2026-004', 'training-curriculum',
   'Coastal_Health_Group_Training_Curriculum_2026.pdf',
   'https://storage.protekon.com/docs/00000001/training-curriculum-2026.pdf',
   22, 'current', NULL, 'standard',
   '2026-01-20T11:00:00Z'),

  ('00000000-0000-0000-0000-000000000001',
   'DOC-2026-005', 'audit-package',
   'Coastal_Health_Group_Audit_Package_Jan_2026.pdf',
   'https://storage.protekon.com/docs/00000001/audit-package-jan-2026.pdf',
   28, 'current', NULL, 'standard',
   '2026-02-01T08:00:00Z'),

  ('00000000-0000-0000-0000-000000000001',
   'DOC-2026-006', 'salary-range',
   'Coastal_Health_Group_Salary_Ranges_2026.pdf',
   'https://storage.protekon.com/docs/00000001/salary-ranges-2026.pdf',
   8, 'current', NULL, 'standard',
   '2026-02-10T15:00:00Z'),

  ('00000000-0000-0000-0000-000000000001',
   'DOC-2026-007', 'eeo-policy',
   'Coastal_Health_Group_EEO_Policy.pdf',
   'https://storage.protekon.com/docs/00000001/eeo-policy.pdf',
   6, 'current', 'Annual review scheduled for Q3', 'standard',
   '2026-02-15T10:30:00Z'),

  ('00000000-0000-0000-0000-000000000001',
   'DOC-2026-008', 'leave-policy',
   'Coastal_Health_Group_Leave_Policy_CA.pdf',
   NULL,
   10, 'requested', 'Updated to reflect AB 1041 changes', 'high',
   '2026-03-01T09:00:00Z');

-- ============================================================
-- 4. audits (3 rows) — improving trend
-- ============================================================
INSERT INTO public.audits (client_id, audit_id, month, score, status, checks, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000001',
   'AUD-2026-01', '2026-01', 78, 'completed',
   '[
     {"name": "WVPP current and distributed", "passed": true},
     {"name": "Incident log maintained (SB 553)", "passed": true},
     {"name": "Employee training up to date", "passed": false, "note": "3 employees overdue on SB 553 annual training"},
     {"name": "BAA agreements on file", "passed": false, "note": "Lab partner BAA missing"},
     {"name": "PHI access controls verified", "passed": true},
     {"name": "Security risk assessment current", "passed": false, "note": "Legacy server not assessed since 2025-Q2"},
     {"name": "Poster compliance verified", "passed": true},
     {"name": "Emergency action plan posted", "passed": true},
     {"name": "Termination procedures documented", "passed": true},
     {"name": "HIPAA breach notification plan current", "passed": false, "note": "Plan references outdated contact list"}
   ]'::jsonb,
   '2026-02-01T08:00:00Z'),

  ('00000000-0000-0000-0000-000000000001',
   'AUD-2026-02', '2026-02', 82, 'completed',
   '[
     {"name": "WVPP current and distributed", "passed": true},
     {"name": "Incident log maintained (SB 553)", "passed": true},
     {"name": "Employee training up to date", "passed": false, "note": "1 employee still overdue on SB 553 training"},
     {"name": "BAA agreements on file", "passed": false, "note": "Lab partner BAA still missing"},
     {"name": "PHI access controls verified", "passed": true},
     {"name": "Security risk assessment current", "passed": true},
     {"name": "Poster compliance verified", "passed": true},
     {"name": "Emergency action plan posted", "passed": true},
     {"name": "Termination procedures documented", "passed": true},
     {"name": "HIPAA breach notification plan current", "passed": true}
   ]'::jsonb,
   '2026-03-01T08:00:00Z'),

  ('00000000-0000-0000-0000-000000000001',
   'AUD-2026-03', '2026-03', 85, 'completed',
   '[
     {"name": "WVPP current and distributed", "passed": true},
     {"name": "Incident log maintained (SB 553)", "passed": true},
     {"name": "Employee training up to date", "passed": true},
     {"name": "BAA agreements on file", "passed": false, "note": "Lab partner BAA under review — expected signed by April 15"},
     {"name": "PHI access controls verified", "passed": true},
     {"name": "Security risk assessment current", "passed": true},
     {"name": "Poster compliance verified", "passed": true},
     {"name": "Emergency action plan posted", "passed": true},
     {"name": "Termination procedures documented", "passed": true},
     {"name": "HIPAA breach notification plan current", "passed": true}
   ]'::jsonb,
   '2026-03-28T08:00:00Z');

-- ============================================================
-- 5. training_records (10 rows)
-- ============================================================
INSERT INTO public.training_records (client_id, employee_name, training_type, due_date, completed_at, status)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Angela Torres',    'SB 553 Annual',       '2026-01-31', '2026-01-22T14:00:00Z', 'completed'),
  ('00000000-0000-0000-0000-000000000001', 'David Kim',        'SB 553 Annual',       '2026-01-31', '2026-01-28T10:30:00Z', 'completed'),
  ('00000000-0000-0000-0000-000000000001', 'Rachel Okonkwo',   'SB 553 Annual',       '2026-01-31', '2026-02-14T09:00:00Z', 'completed'),
  ('00000000-0000-0000-0000-000000000001', 'James Whitfield',  'HIPAA Privacy',       '2026-02-15', '2026-02-10T11:00:00Z', 'completed'),
  ('00000000-0000-0000-0000-000000000001', 'Maria Sandoval',   'HIPAA Privacy',       '2026-02-15', NULL,                   'overdue'),
  ('00000000-0000-0000-0000-000000000001', 'Angela Torres',    'EEO Awareness',       '2026-03-15', '2026-03-10T15:30:00Z', 'completed'),
  ('00000000-0000-0000-0000-000000000001', 'Kevin Pham',       'EEO Awareness',       '2026-03-15', NULL,                   'overdue'),
  ('00000000-0000-0000-0000-000000000001', 'David Kim',        'Supervisor Training', '2026-04-30', NULL,                   'pending'),
  ('00000000-0000-0000-0000-000000000001', 'Lisa Nguyen',      'SB 553 Annual',       '2026-04-30', NULL,                   'pending'),
  ('00000000-0000-0000-0000-000000000001', 'Rachel Okonkwo',   'HIPAA Privacy',       '2026-05-15', NULL,                   'pending');

-- ============================================================
-- 6. intake_submissions (2 rows)
-- ============================================================
INSERT INTO public.intake_submissions (email, business_name, vertical, answers, compliance_score, risk_level, status, created_at)
VALUES
  ('admin@coastalhealthgroup.com',
   'Coastal Health Group',
   'hipaa',
   '{
     "employee_count": "50-99",
     "locations": 3,
     "handles_phi": true,
     "has_wvpp": false,
     "has_baa_tracking": false,
     "previous_incidents": true,
     "industry": "Healthcare — Outpatient Clinics"
   }'::jsonb,
   42, 'high', 'completed', '2025-11-10T14:00:00Z'),

  ('ops@summiturgentcare.com',
   'Summit Urgent Care',
   'hipaa',
   '{
     "employee_count": "25-49",
     "locations": 1,
     "handles_phi": true,
     "has_wvpp": true,
     "has_baa_tracking": true,
     "previous_incidents": false,
     "industry": "Healthcare — Urgent Care"
   }'::jsonb,
   NULL, NULL, 'pending', '2026-03-25T11:30:00Z');

-- ============================================================
-- 7. sample_report_leads (3 rows)
-- ============================================================
INSERT INTO public.sample_report_leads (email, company_name, vertical, downloaded_at)
VALUES
  ('maria.chen@bayviewmedical.com',   'Bayview Medical Associates', 'hipaa',  '2026-02-20T09:15:00Z'),
  ('jturner@pacificwellness.org',     'Pacific Wellness Center',   'hipaa',  '2026-03-05T16:40:00Z'),
  ('rpatil@sonomaclinic.com',         'Sonoma Family Clinic',      'hipaa',  '2026-03-22T12:00:00Z');

-- ============================================================
-- 8. scheduled_deliveries (3 rows)
-- ============================================================
INSERT INTO public.scheduled_deliveries (client_id, delivery_type, frequency, next_delivery_date, last_delivered_at, status, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000001',
   'WVPP Update', 'monthly', '2026-04-01', '2026-03-01T08:00:00Z', 'scheduled', '2025-12-01T10:00:00Z'),

  ('00000000-0000-0000-0000-000000000001',
   'Audit Package', 'quarterly', '2026-04-01', '2026-01-01T08:00:00Z', 'scheduled', '2025-12-01T10:00:00Z'),

  ('00000000-0000-0000-0000-000000000001',
   'Training Curriculum', 'annually', '2027-01-15', '2026-01-20T11:00:00Z', 'scheduled', '2025-12-01T10:00:00Z');

-- ============================================================
-- 9. regulatory_updates (6 rows) — with new columns
-- ============================================================
INSERT INTO public.regulatory_updates (jurisdiction, category, title, summary, effective_date, source_url, severity, published_date, code, issuing_body, type, description, impact_text, compliance_deadline, acknowledged_by, created_at)
VALUES
  ('California', 'wage',
   'CA SB 525 — Healthcare Worker Minimum Wage Increase',
   'Minimum wage for healthcare workers at covered facilities increases to $25/hour. Applies to hospitals, clinics, and physician groups with 10,000+ full-time equivalent employees statewide.',
   '2026-06-01',
   'https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202320240SB525',
   'high',
   '2026-01-15', 'SB-525', 'California Legislature', 'amendment',
   'Healthcare minimum wage increase to $25/hour for covered facilities.',
   'Your payroll and compensation structures may require updates to comply with the new minimum wage floor.',
   '2026-06-01', '{}',
   '2026-01-15T08:00:00Z'),

  ('California', 'leave',
   'CA AB 1041 — Expanded Designated Person for CFRA/PSL',
   'Employees may now designate any individual as a "designated person" for purposes of California Family Rights Act leave and paid sick leave, expanding beyond traditional family definitions.',
   '2026-01-01',
   'https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202320240AB1041',
   'medium',
   '2026-01-05', 'AB-1041', 'California Legislature', 'amendment',
   'Expanded designated person definition for CFRA and paid sick leave.',
   'Your leave policies should be updated to reflect the expanded designated person definition.',
   '2026-03-01', '{}',
   '2026-01-05T08:00:00Z'),

  ('Federal', 'wage',
   'DOL Final Rule — Overtime Salary Threshold Update',
   'Department of Labor finalizes updated salary threshold for overtime exemption. Employees earning below the new threshold are automatically eligible for overtime pay under the FLSA.',
   '2026-07-01',
   'https://www.dol.gov/agencies/whd/overtime/rulemaking',
   'high',
   '2026-02-10', 'DOL-OT-2026', 'U.S. Department of Labor', 'amendment',
   'Updated FLSA overtime salary threshold.',
   'Your exempt employee classifications may need review against the new salary threshold.',
   '2026-07-01', '{}',
   '2026-02-10T08:00:00Z'),

  ('New York', 'leave',
   'NY Paid Prenatal Leave Expansion',
   'New York expands paid prenatal leave to include additional covered appointments and extends eligibility to part-time employees working 20+ hours per week.',
   '2026-04-01',
   'https://www.ny.gov/programs/new-york-paid-prenatal-leave',
   'medium',
   '2026-02-20', 'NY-PPL-2026', 'New York State', 'guidance',
   'Expanded paid prenatal leave eligibility.',
   NULL,
   NULL, '{}',
   '2026-02-20T08:00:00Z'),

  ('California', 'wage',
   'CA SB 553 — Workplace Violence Prevention Plan Enforcement Update',
   'Cal/OSHA publishes updated enforcement guidance for SB 553 WVPP requirements. Includes clarifications on training documentation, log retention periods, and multi-site employer obligations.',
   '2026-03-01',
   'https://www.dir.ca.gov/dosh/workplace-violence-prevention.html',
   'critical',
   '2026-03-01', 'SB-553-ENF', 'Cal/OSHA', 'amendment',
   'Updated enforcement guidance for SB 553 WVPP requirements.',
   'Your WVPP documentation, training records, and incident logs must comply with the updated enforcement guidance.',
   '2026-04-15', '{}',
   '2026-03-01T08:00:00Z'),

  ('Federal', 'leave',
   'FMLA Clarification — Remote Worker Eligibility',
   'Department of Labor issues interpretive guidance clarifying that remote workers are considered to work at their assigned office location for FMLA eligibility and the 50-employee-within-75-miles test.',
   '2026-05-01',
   'https://www.dol.gov/agencies/whd/fmla',
   'info',
   '2026-03-15', 'DOL-FMLA-2026', 'U.S. Department of Labor', 'guidance',
   'FMLA remote worker eligibility clarification.',
   NULL,
   NULL, '{}',
   '2026-03-15T08:00:00Z');

-- ============================================================
-- 10. municipal_ordinances (3 rows)
-- ============================================================
INSERT INTO public.municipal_ordinances (jurisdiction, title, summary, ordinance_number, effective_date, category, source_url, created_at)
VALUES
  ('City of Los Angeles',
   'LA Fair Work Week Ordinance',
   'Requires healthcare employers with 500+ employees to provide 14 days advance notice of work schedules and offer additional hours to existing part-time staff before hiring new employees.',
   'LA-ORD-2025-0847', '2026-04-01', 'scheduling',
   'https://clkrep.lacity.org/onlinedocs/2025/25-0847_ord.pdf',
   '2026-01-10T08:00:00Z'),

  ('City of San Francisco',
   'SF Health Care Security Ordinance Update',
   'Updated employer healthcare expenditure requirements for covered employers in San Francisco. Minimum spending per employee-hour worked increases for calendar year 2026.',
   'SF-ORD-2025-2241', '2026-01-01', 'healthcare-spending',
   'https://sfgov.org/olse/health-care-security-ordinance',
   '2025-12-15T08:00:00Z'),

  ('California',
   'CA Indoor Heat Illness Prevention Standard',
   'Cal/OSHA indoor heat illness prevention standard requires employers to implement cooling measures, provide water, and allow rest breaks when indoor temperatures exceed 82 degrees Fahrenheit in healthcare and other covered settings.',
   'CA-OSHA-2025-IH', '2026-05-01', 'workplace-safety',
   'https://www.dir.ca.gov/dosh/indoor-heat.html',
   '2026-02-01T08:00:00Z');

-- ============================================================
-- 11. audit_log (8 rows)
-- ============================================================
INSERT INTO public.audit_log (client_id, event_type, description, metadata, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000001',
   'document.generated',
   'WVPP document generated and delivered',
   '{"document_id": "DOC-2026-001", "type": "wvpp", "pages": 34}'::jsonb,
   '2026-01-05T10:00:00Z'),

  ('00000000-0000-0000-0000-000000000001',
   'incident.reported',
   'Critical incident reported — verbal threat in waiting area',
   '{"incident_id": "INC-2026-001", "severity": "severe", "location": "Main Clinic — Waiting Area"}'::jsonb,
   '2026-01-12T16:45:00Z'),

  ('00000000-0000-0000-0000-000000000001',
   'audit.completed',
   'January 2026 monthly compliance audit completed — score: 78',
   '{"audit_id": "AUD-2026-01", "score": 78, "checks_passed": 6, "checks_total": 10}'::jsonb,
   '2026-02-01T08:00:00Z'),

  ('00000000-0000-0000-0000-000000000001',
   'training.assigned',
   'HIPAA Privacy training assigned to 2 employees',
   '{"training_type": "HIPAA Privacy", "employee_count": 2, "due_date": "2026-02-15"}'::jsonb,
   '2026-02-01T09:00:00Z'),

  ('00000000-0000-0000-0000-000000000001',
   'baa.signed',
   'BAA signed with CloudVault Health for cloud storage services',
   '{"vendor": "CloudVault Health", "service": "Cloud Storage (HIPAA)", "expiration": "2027-02-28"}'::jsonb,
   '2026-02-15T14:00:00Z'),

  ('00000000-0000-0000-0000-000000000001',
   'audit.completed',
   'February 2026 monthly compliance audit completed — score: 82',
   '{"audit_id": "AUD-2026-02", "score": 82, "checks_passed": 8, "checks_total": 10}'::jsonb,
   '2026-03-01T08:00:00Z'),

  ('00000000-0000-0000-0000-000000000001',
   'score.recalculated',
   'Compliance score recalculated: 78 → 83 (training completions + BAA progress)',
   '{"previous_score": 78, "new_score": 83, "factors": ["training_completions", "baa_progress", "audit_improvements"]}'::jsonb,
   '2026-03-15T10:00:00Z'),

  ('00000000-0000-0000-0000-000000000001',
   'audit.completed',
   'March 2026 monthly compliance audit completed — score: 85',
   '{"audit_id": "AUD-2026-03", "score": 85, "checks_passed": 9, "checks_total": 10}'::jsonb,
   '2026-03-28T08:00:00Z');

-- ============================================================
-- 12. baa_agreements (5 rows)
-- ============================================================
INSERT INTO public.baa_agreements (client_id, vendor_name, service_type, phi_types, baa_status, signed_date, expiration_date, document_url, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000001',
   'MedChart EHR Systems', 'Electronic Health Records',
   ARRAY['medical-records', 'lab-results', 'prescriptions', 'demographics'],
   'active', '2025-06-01', '2027-06-01',
   'https://storage.protekon.com/baa/00000001/medchart-ehr-baa.pdf',
   '2025-06-01T10:00:00Z'),

  ('00000000-0000-0000-0000-000000000001',
   'CloudVault Health', 'Cloud Storage (HIPAA)',
   ARRAY['medical-records', 'billing-data', 'insurance-claims'],
   'active', '2026-02-15', '2027-02-28',
   'https://storage.protekon.com/baa/00000001/cloudvault-baa.pdf',
   '2026-02-15T14:00:00Z'),

  ('00000000-0000-0000-0000-000000000001',
   'Pacific Billing Solutions', 'Medical Billing & Coding',
   ARRAY['billing-data', 'insurance-claims', 'demographics'],
   'pending', NULL, NULL, NULL,
   '2026-03-01T09:00:00Z'),

  ('00000000-0000-0000-0000-000000000001',
   'LabConnect Diagnostics', 'Laboratory Testing Partner',
   ARRAY['lab-results', 'specimen-data', 'demographics'],
   'missing', NULL, NULL, NULL,
   '2026-01-10T08:00:00Z'),

  ('00000000-0000-0000-0000-000000000001',
   'TempStaff Medical', 'Temporary Staffing Agency',
   ARRAY['demographics', 'scheduling-data'],
   'active', '2025-04-15', '2026-04-15',
   'https://storage.protekon.com/baa/00000001/tempstaff-baa.pdf',
   '2025-04-15T10:00:00Z');

-- ============================================================
-- 13. phi_assets (4 rows)
-- ============================================================
INSERT INTO public.phi_assets (client_id, system_name, system_type, access_description, phi_content_types, encrypted_at_rest, encrypted_in_transit, risk_level, last_assessed_at, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000001',
   'MedChart EHR', 'SaaS',
   'Role-based access via SSO. 32 active users across 3 clinic locations. Admin, provider, and front-desk roles defined.',
   ARRAY['medical-records', 'lab-results', 'prescriptions', 'demographics'],
   true, true, 'low', '2026-03-15T10:00:00Z', '2025-11-20T09:00:00Z'),

  ('00000000-0000-0000-0000-000000000001',
   'Legacy Billing Server', 'On-Premise',
   'Local network access only. 5 billing staff with shared login credentials. No MFA. Server located in locked office.',
   ARRAY['billing-data', 'insurance-claims', 'demographics'],
   true, false, 'medium', '2026-02-01T14:00:00Z', '2025-11-20T09:00:00Z'),

  ('00000000-0000-0000-0000-000000000001',
   'CoastalHealth Mobile App', 'SaaS',
   'Patient-facing mobile app with MFA. Patients access own records, appointments, and messaging. Hosted on CloudVault Health infrastructure.',
   ARRAY['medical-records', 'demographics', 'appointment-data'],
   true, true, 'low', '2026-03-10T11:00:00Z', '2025-12-05T10:00:00Z'),

  ('00000000-0000-0000-0000-000000000001',
   'Archive File Server', 'On-Premise',
   'Contains pre-2020 patient records migrated from previous practice management system. No active access controls. Located in server closet without environmental monitoring.',
   ARRAY['medical-records', 'billing-data', 'demographics'],
   false, false, 'high', '2025-06-15T09:00:00Z', '2025-11-20T09:00:00Z');

-- ============================================================
-- 14. poster_compliance (6 rows)
-- ============================================================
INSERT INTO public.poster_compliance (client_id, location_name, poster_type, jurisdiction, status, last_verified_at, next_update_due, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000001',
   'Main Clinic — Break Room', 'OSHA Job Safety and Health', 'Federal',
   'verified', '2026-03-01T10:00:00Z', '2026-09-01', '2025-12-01T08:00:00Z'),

  ('00000000-0000-0000-0000-000000000001',
   'Main Clinic — Break Room', 'California Payday Notice', 'California',
   'verified', '2026-03-01T10:00:00Z', '2026-09-01', '2025-12-01T08:00:00Z'),

  ('00000000-0000-0000-0000-000000000001',
   'Main Clinic — Break Room', 'FMLA Employee Rights', 'Federal',
   'needs-update', '2026-01-15T10:00:00Z', '2026-04-01', '2025-12-01T08:00:00Z'),

  ('00000000-0000-0000-0000-000000000001',
   'East Wing — Staff Corridor', 'California Minimum Wage', 'California',
   'needs-update', '2026-01-15T10:00:00Z', '2026-04-01', '2025-12-01T08:00:00Z'),

  ('00000000-0000-0000-0000-000000000001',
   'East Wing — Staff Corridor', 'EEO is the Law', 'Federal',
   'verified', '2026-03-01T10:00:00Z', '2026-09-01', '2025-12-01T08:00:00Z'),

  ('00000000-0000-0000-0000-000000000001',
   'Satellite Office — Lobby', 'California Workplace Violence Prevention', 'California',
   'unknown', NULL, '2026-04-15', '2026-02-01T08:00:00Z');

COMMIT;

-- =============================================================================
-- Seed complete. Coastal Health Group is ready for demo.
-- Login: admin@coastalhealthgroup.com / demo-password-2026
-- Verify: SELECT count(*) FROM public.clients;  → 1
-- =============================================================================
