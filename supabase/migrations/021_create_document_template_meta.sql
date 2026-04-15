-- ============================================================================
-- Migration 021: document_template_meta — queryable metadata projection of
-- lib/document-templates.ts
--
-- Source of truth for section definitions, legal citations, and AI prompt
-- structure remains the TS registry. This table stores ONLY the fields the
-- database needs for compliance calendar, retention alerts, partner reporting,
-- and gap analysis queries.
--
-- Seed data matches lib/document-templates.ts TEMPLATE_REGISTRY as of 2026-04-15.
-- When templates change in code, run a data migration to sync this table.
-- ============================================================================

CREATE TABLE document_template_meta (
  template_key        text PRIMARY KEY,
  display_name        text NOT NULL,
  category            text NOT NULL CHECK (category IN ('platform_wide', 'vertical_specific')),
  applicable_verticals text[] NOT NULL DEFAULT '{}',
  legal_authority     text NOT NULL,
  retention_years     integer NOT NULL,
  review_frequency    text NOT NULL CHECK (review_frequency IN ('annual','semi_annual','quarterly','on_change','per_project','per_incident','every_3_years','one_time')),
  is_active           boolean NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_dtm_verticals ON document_template_meta USING gin (applicable_verticals);
CREATE INDEX idx_dtm_category ON document_template_meta (category);

CREATE OR REPLACE FUNCTION update_dtm_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_dtm_updated_at
  BEFORE UPDATE ON document_template_meta
  FOR EACH ROW EXECUTE FUNCTION update_dtm_timestamp();

COMMENT ON TABLE document_template_meta IS
  'Read-only metadata projection of lib/document-templates.ts. Section definitions and AI prompt structure live in the TS registry — this table stores only queryable fields for compliance calendar, retention alerts, and reporting.';

-- ============================================================================
-- SEED: 26 templates matching TEMPLATE_REGISTRY
-- ============================================================================

-- PLATFORM-WIDE (9) — applicable_verticals is empty; these apply to all clients
INSERT INTO document_template_meta (template_key, display_name, category, applicable_verticals, legal_authority, retention_years, review_frequency) VALUES
('wvpp',                    'Workplace Violence Prevention Plan',              'platform_wide', '{}', 'CA Labor Code §6401.9 (SB 553)',    5,  'annual'),
('iipp',                    'Injury & Illness Prevention Program',             'platform_wide', '{}', '8 CCR §3203',                       5,  'annual'),
('eap',                     'Emergency Action Plan',                           'platform_wide', '{}', '8 CCR §3220',                       5,  'annual'),
('hazcom',                  'Hazard Communication Program (GHS)',              'platform_wide', '{}', '8 CCR §5194',                       30, 'annual'),
('heat-illness-prevention', 'Heat Illness Prevention Plan',                    'platform_wide', '{}', '8 CCR §3395',                       5,  'annual'),
('osha-300-log',            'OSHA 300/300A/301 Recordkeeping',                 'platform_wide', '{}', '8 CCR §14300',                      5,  'annual'),
('incident-investigation',  'Incident Investigation Procedures',               'platform_wide', '{}', '8 CCR §3203(a)(6)',                 5,  'annual'),
('training-records',        'Training Records Framework',                      'platform_wide', '{}', '8 CCR §3203(a)(7)',                 5,  'annual'),
('hearing-conservation',    'Hearing Conservation Program',                    'platform_wide', '{}', '29 CFR 1910.95 / 8 CCR §5097',     30, 'annual');

-- VERTICAL-SPECIFIC (17)
INSERT INTO document_template_meta (template_key, display_name, category, applicable_verticals, legal_authority, retention_years, review_frequency) VALUES
('fall-protection-plan',       'Fall Protection Plan',                         'vertical_specific', '{construction}',                          '8 CCR §1509 / 29 CFR 1926.502(k)',        5,  'per_project'),
('silica-exposure-control',    'Silica Exposure Control Plan',                 'vertical_specific', '{construction}',                          '29 CFR 1926.1153',                         30, 'annual'),
('bbp-exposure-control',       'Bloodborne Pathogen Exposure Control Plan',    'vertical_specific', '{healthcare,hospitality}',                '8 CCR §5193',                              5,  'annual'),
('hipaa-sra',                  'HIPAA Security Risk Analysis',                 'vertical_specific', '{healthcare}',                            '45 CFR §164.308(a)(1)',                    6,  'annual'),
('atd-plan',                   'Aerosol Transmissible Disease Plan',           'vertical_specific', '{healthcare}',                            '8 CCR §5199',                              5,  'annual'),
('baa-tracker',                'Business Associate Agreement Tracker',         'vertical_specific', '{healthcare}',                            '45 CFR §164.308(b)',                       6,  'semi_annual'),
('loto-program',               'Lockout/Tagout (LOTO) Program',                'vertical_specific', '{manufacturing}',                         '8 CCR §3314 / 29 CFR 1910.147',           5,  'annual'),
('machine-guarding',           'Machine Guarding Program',                     'vertical_specific', '{manufacturing}',                         '8 CCR §4001-4005',                         5,  'annual'),
('confined-space-program',     'Confined Space Entry Program',                 'vertical_specific', '{manufacturing,construction}',             '8 CCR §5157',                              5,  'annual'),
('wildfire-smoke-protection',  'Wildfire Smoke Protection Plan',               'vertical_specific', '{agriculture,construction}',              '8 CCR §5141.1',                            5,  'annual'),
('pesticide-safety',           'Pesticide Safety Program',                     'vertical_specific', '{agriculture}',                           '3 CCR §6724',                              5,  'annual'),
('fleet-safety-program',       'Fleet Safety Program',                         'vertical_specific', '{transportation}',                        '49 CFR Parts 382-396 / 8 CCR §3203',      5,  'annual'),
('pit-safety-program',         'Forklift/PIT Safety Program',                  'vertical_specific', '{wholesale,manufacturing,retail}',        '8 CCR §3668',                              5,  'every_3_years'),
('store-safety-program',       'Multi-Location Store Safety Program',          'vertical_specific', '{retail}',                                '8 CCR §3203 + SB 553',                    5,  'annual'),
('hospitality-safety-program', 'Guest & Employee Safety Program',              'vertical_specific', '{hospitality}',                           '8 CCR §3203 + §5193',                     5,  'annual'),
('property-compliance-program','Property Portfolio Compliance Program',         'vertical_specific', '{real-estate}',                           'Civil Code §1940-1954 / H&S Code §17920', 7,  'semi_annual'),
('spray-booth-compliance',     'Spray Booth & Respiratory Protection Program', 'vertical_specific', '{auto-services}',                         '8 CCR §5154 + §5208',                     30, 'annual');

-- ============================================================================
-- Recreate v_retention_alerts using the new meta table
-- ============================================================================

DROP VIEW IF EXISTS v_retention_alerts;

CREATE VIEW v_retention_alerts AS
SELECT
  d.id AS document_id,
  d.client_id,
  d.type AS document_type,
  d.filename,
  d.template_key,
  COALESCE(dtm.display_name, INITCAP(REPLACE(COALESCE(d.template_key, d.type), '-', ' '))) AS template_name,
  dtm.retention_years,
  dtm.review_frequency,
  d.created_at,
  d.retention_expires_at,
  d.retention_status,
  d.next_review_due,
  d.last_reviewed_at,
  CASE
    WHEN d.retention_expires_at < CURRENT_DATE THEN 'retention_expired'
    WHEN d.retention_expires_at < (CURRENT_DATE + interval '90 days') THEN 'retention_expiring'
    WHEN d.next_review_due IS NOT NULL AND d.next_review_due < CURRENT_DATE THEN 'review_overdue'
    WHEN d.next_review_due IS NOT NULL AND d.next_review_due < (CURRENT_DATE + interval '30 days') THEN 'review_upcoming'
    ELSE 'ok'
  END AS alert_type,
  CASE
    WHEN d.retention_expires_at IS NOT NULL THEN d.retention_expires_at - CURRENT_DATE
    ELSE NULL
  END AS days_until_retention_expiry,
  CASE
    WHEN d.next_review_due IS NOT NULL THEN d.next_review_due - CURRENT_DATE
    ELSE NULL
  END AS days_until_review
FROM documents d
LEFT JOIN document_template_meta dtm ON dtm.template_key = d.template_key
WHERE d.status != 'archived'
ORDER BY
  CASE
    WHEN d.retention_expires_at < CURRENT_DATE THEN 0
    WHEN d.next_review_due < CURRENT_DATE THEN 1
    WHEN d.retention_expires_at < (CURRENT_DATE + interval '90 days') THEN 2
    WHEN d.next_review_due < (CURRENT_DATE + interval '30 days') THEN 3
    ELSE 4
  END,
  COALESCE(d.retention_expires_at, d.next_review_due, '2099-12-31'::date);

COMMENT ON VIEW v_retention_alerts IS
  'Joins documents to document_template_meta for retention/review deadline monitoring. Used by compliance calendar and alerting systems.';
