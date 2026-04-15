-- ============================================================================
-- Migration 022: Expand document_template_meta — 26 → 37 templates, 10 → 25 verticals
-- Syncs with lib/document-templates.ts TEMPLATE_REGISTRY as of commit 22cf44a
-- ============================================================================

-- 1. INSERT 11 new templates
INSERT INTO document_template_meta (template_key, display_name, category, applicable_verticals, legal_authority, retention_years, review_frequency) VALUES

('electrical-safety-program',
 'Electrical Safety Program',
 'vertical_specific',
 '{construction,manufacturing,utilities,equipment_repair,building_services,information}',
 '8 CCR §2320 / 29 CFR 1910 Subpart S / NFPA 70E',
 5, 'annual'),

('ergonomics-program',
 'Ergonomics and Repetitive Motion Injury Program',
 'vertical_specific',
 '{healthcare,information,public_admin,professional_services,business_support,education}',
 '8 CCR §5110',
 5, 'annual'),

('respiratory-protection-program',
 'Respiratory Protection Program',
 'vertical_specific',
 '{construction,agriculture,auto-services,waste_environmental,laundry,mining}',
 '8 CCR §5144 / 29 CFR 1910.134',
 30, 'annual'),

('multi-employer-worksite-policy',
 'Multi-Employer Worksite and Joint-Employer Policy',
 'vertical_specific',
 '{construction,real-estate,information,facilities_mgmt,staffing}',
 'Cal/OSHA Multi-Employer Citation Policy / 29 CFR 1910.12',
 5, 'annual'),

('event-safety-crowd-management',
 'Event Safety and Crowd Management Plan',
 'vertical_specific',
 '{hospitality,arts_entertainment}',
 '8 CCR §3220 / Title 19 CCR / local fire marshal',
 5, 'on_change'),

('campus-safety-plan',
 'Campus Safety and Emergency Plan',
 'vertical_specific',
 '{education}',
 'Education Code §32280+ / 8 CCR §3220 / Clery Act',
 5, 'annual'),

('hazwoper-program',
 'HAZWOPER Program',
 'vertical_specific',
 '{waste_environmental}',
 '29 CFR 1910.120 / 8 CCR §5192',
 30, 'annual'),

('msha-mining-safety-program',
 'Mining Safety and Health Program (MSHA)',
 'vertical_specific',
 '{mining}',
 '30 CFR Parts 46-50, 56-57',
 5, 'annual'),

('drycleaning-solvent-safety',
 'Drycleaning and Laundry Solvent Safety Program',
 'vertical_specific',
 '{laundry}',
 '8 CCR §5155 / SCAQMD Rule 1421',
 30, 'annual'),

('janitorial-chemical-safety',
 'Janitorial Chemical Safety and HazCom Supplement',
 'vertical_specific',
 '{building_services,personal_services}',
 '8 CCR §5194 / AB 1978',
 5, 'annual'),

('salon-personal-services-safety',
 'Salon and Personal Services Safety Program',
 'vertical_specific',
 '{personal_services}',
 'Board of Barbering & Cosmetology / Prop 65 / 8 CCR §5194',
 5, 'annual');

-- 2. UPDATE 2 existing templates with expanded vertical coverage
UPDATE document_template_meta
SET applicable_verticals = '{construction,building_services}',
    updated_at = now()
WHERE template_key = 'fall-protection-plan';

UPDATE document_template_meta
SET applicable_verticals = '{manufacturing,equipment_repair}',
    updated_at = now()
WHERE template_key = 'loto-program';
