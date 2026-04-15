-- ============================================================================
-- Migration 023: Fix 3 templates that were over-assigned to verticals not in
-- their TEMPLATE_REGISTRY buckets. Corrections verified against
-- lib/document-templates.ts as of commit 22cf44a.
-- ============================================================================

-- ergonomics-program: education bucket does NOT contain this template
-- Registry buckets: healthcare, information, public_admin, professional_services, business_support
UPDATE document_template_meta
SET applicable_verticals = '{healthcare,information,public_admin,professional_services,business_support}',
    updated_at = now()
WHERE template_key = 'ergonomics-program'
  AND 'education' = ANY(applicable_verticals);

-- respiratory-protection-program: mining bucket does NOT contain this template
-- Registry buckets: construction, agriculture, auto-services, waste_environmental, laundry
UPDATE document_template_meta
SET applicable_verticals = '{construction,agriculture,auto-services,waste_environmental,laundry}',
    updated_at = now()
WHERE template_key = 'respiratory-protection-program'
  AND 'mining' = ANY(applicable_verticals);

-- multi-employer-worksite-policy: information bucket does NOT contain this template
-- Registry buckets: construction, real-estate, facilities_mgmt, staffing
UPDATE document_template_meta
SET applicable_verticals = '{construction,real-estate,facilities_mgmt,staffing}',
    updated_at = now()
WHERE template_key = 'multi-employer-worksite-policy'
  AND 'information' = ANY(applicable_verticals);
