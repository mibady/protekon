/**
 * Vertical configuration contract for the Onboarding Wizard.
 *
 * Mirrors the hybrid template architecture documented in
 * `docs/TEMPLATE-ARCHITECTURE.md`: sections (configs) in code, metadata in
 * DB, one-way sync code → DB.
 *
 * Phase 1A ships 3 fully-configured verticals (construction, manufacturing,
 * healthcare). The remaining 23 canonical verticals inherit `DEFAULT_CONFIG`
 * and are refined incrementally.
 */

/**
 * Canonical vertical slugs. Authoritative source:
 * `supabase/migrations/022_verticals_reference.sql` (26 canonical + 1 alias).
 *
 * Kept in sync with the template registry buckets in
 * `lib/document-templates.ts`. `logistics` is an alias of `wholesale` and is
 * NOT listed here — resolve the alias before indexing into onboarding configs.
 */
export type VerticalSlug =
  | 'construction'
  | 'manufacturing'
  | 'healthcare'
  | 'hospitality'
  | 'agriculture'
  | 'retail'
  | 'transportation'
  | 'real-estate'
  | 'auto-services'
  | 'wholesale'
  | 'utilities'
  | 'education'
  | 'waste_environmental'
  | 'arts_entertainment'
  | 'public_admin'
  | 'building_services'
  | 'equipment_repair'
  | 'facilities_mgmt'
  | 'information'
  | 'laundry'
  | 'mining'
  | 'professional_services'
  | 'staffing'
  | 'business_support'
  | 'personal_services'
  | 'security';

/**
 * Per-vertical onboarding configuration consumed by the wizard.
 *
 * Contract note: the shape is frozen. Adding optional fields is safe;
 * renaming or removing fields requires coordinated frontend/backend updates.
 */
export type OnboardingVerticalConfig = {
  /** FK match to `verticals.slug`. `'default'` is reserved for the fallback config. */
  slug: VerticalSlug | 'default';
  /** Human-readable display label. */
  label: string;
  /** Terminology presented to the end user in wizard copy + dashboards. */
  peopleTerminology: {
    /** Singular noun for a field employee. e.g. "Worker", "Employee", "Staff", "Team Member". */
    worker: string;
    /** Collective noun for the workforce. e.g. "Team", "Crew", "Staff". */
    team: string;
    /** Label for third-party relationships, or null when not applicable. */
    thirdParty: string | null;
  };
  /** Which optional wizard steps are visible for this vertical. */
  stepVisibility: {
    /** False for single-location verticals (Step 3 is hidden). */
    sites: boolean;
    /** True only for verticals with vendor/sub management (Step 5 is hidden otherwise). */
    thirdParties: boolean;
  };
  /** Doc category slugs that MUST be produced for this vertical. Kebab-case; canonical source is `lib/document-templates.ts`. */
  requiredDocCategories: string[];
  /** Doc category slugs that are suggested but not required. */
  recommendedDocCategories: string[];
  /** Toggles presented in Step 7 (Automations). Vertical-filtered defaults. */
  automations: {
    expirationSweep: boolean;
    regulatoryAlerts: boolean;
    thirdPartyCoiRequests: boolean;
  };
  /** Per-step microcopy surfaced in the wizard UI. */
  stepCopy: {
    businessSnapshot: { intro: string; workerCountLabel: string };
    sites: { intro: string; addButtonLabel: string };
    people: { intro: string; workerImportHelp: string };
    /** Only present when `stepVisibility.thirdParties` is true. */
    thirdParties?: { intro: string; classificationHelp: string };
    documents: { intro: string; templateLibraryCta: string };
    automations: { intro: string };
  };
};
