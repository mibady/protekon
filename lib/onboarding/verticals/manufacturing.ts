import type { OnboardingVerticalConfig } from './types';

/**
 * Manufacturing vertical onboarding config.
 *
 * Canonical doc slugs from `lib/document-templates.ts` (manufacturing bucket
 * + platform-wide `all`). Kebab-case. See `docs/TEMPLATE-ARCHITECTURE.md`.
 *
 * Vendor management is deferred to Phase 2, so `stepVisibility.thirdParties`
 * and `automations.thirdPartyCoiRequests` are both false.
 */
export const MANUFACTURING_CONFIG: OnboardingVerticalConfig = {
  slug: 'manufacturing',
  label: 'Manufacturing',
  peopleTerminology: {
    worker: 'Employee',
    team: 'Team',
    thirdParty: 'Vendor',
  },
  stepVisibility: {
    sites: true,
    thirdParties: false,
  },
  requiredDocCategories: [
    'iipp',
    'hazcom',
    'loto-program',
    'machine-guarding',
    'respiratory-protection-program',
  ],
  recommendedDocCategories: [
    'wvpp',
    'confined-space-program',
    'pit-safety-program',
    'electrical-safety-program',
    'hearing-conservation',
  ],
  automations: {
    expirationSweep: true,
    regulatoryAlerts: true,
    thirdPartyCoiRequests: false,
  },
  stepCopy: {
    businessSnapshot: {
      intro:
        'Tell us about your manufacturing operation so we can tailor your safety program.',
      workerCountLabel: 'How many employees work in your facilities?',
    },
    sites: {
      intro: 'Add each plant or facility.',
      addButtonLabel: 'Add facility',
    },
    people: {
      intro: 'Bring shop floor employees and leads into Protekon.',
      workerImportHelp:
        'Upload a CSV from your HRIS or add employees one at a time.',
    },
    documents: {
      intro:
        'These are the written programs OSHA expects for general industry manufacturing.',
      templateLibraryCta: 'Browse manufacturing templates',
    },
    automations: {
      intro:
        'Let Protekon handle training expirations and regulatory updates automatically.',
    },
  },
};
