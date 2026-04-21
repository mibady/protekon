import type { OnboardingVerticalConfig } from './types';

/**
 * Construction vertical onboarding config.
 *
 * Required doc categories are drawn from the canonical template registry in
 * `lib/document-templates.ts` — the construction bucket plus the cross-
 * vertical `all` bucket. Slugs are kebab-case. See
 * `docs/TEMPLATE-ARCHITECTURE.md` for the full mapping.
 *
 * Third-party management is ON — Step 5 writes to `construction_subs`.
 */
export const CONSTRUCTION_CONFIG: OnboardingVerticalConfig = {
  slug: 'construction',
  label: 'Construction',
  peopleTerminology: {
    worker: 'Worker',
    team: 'Crew',
    thirdParty: 'Subcontractor',
  },
  stepVisibility: {
    sites: true,
    thirdParties: true,
  },
  // Canonical slugs from lib/document-templates.ts (construction + platform-wide)
  requiredDocCategories: [
    'iipp',
    'heat-illness-prevention',
    'hazcom',
    'fall-protection-plan',
    'silica-exposure-control',
    'respiratory-protection-program',
  ],
  recommendedDocCategories: [
    'wvpp',
    'confined-space-program',
    'wildfire-smoke-protection',
    'electrical-safety-program',
    'multi-employer-worksite-policy',
  ],
  automations: {
    expirationSweep: true,
    regulatoryAlerts: true,
    thirdPartyCoiRequests: true,
  },
  stepCopy: {
    businessSnapshot: {
      intro:
        'Tell us about your construction business so we can tune your compliance program.',
      workerCountLabel: 'How many workers are on your crews?',
    },
    sites: {
      intro: 'Add each active jobsite. You can add more later.',
      addButtonLabel: 'Add jobsite',
    },
    people: {
      intro: 'Import your crews and invite foremen to Protekon.',
      workerImportHelp:
        'Upload a CSV of your workforce or add workers one at a time.',
    },
    thirdParties: {
      intro: 'Add the subcontractors you work with.',
      classificationHelp:
        'Classify each sub by trade so we know which COIs and safety packets to request.',
    },
    documents: {
      intro:
        'These are the written programs OSHA and Cal/OSHA expect on every construction project.',
      templateLibraryCta: 'Browse construction templates',
    },
    automations: {
      intro:
        'Keep your program current automatically — training expirations, reg updates, and sub COI requests.',
    },
  },
};
