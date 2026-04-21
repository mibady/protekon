import type { OnboardingVerticalConfig } from './types';

/**
 * Healthcare vertical onboarding config.
 *
 * Canonical doc slugs from `lib/document-templates.ts` (healthcare bucket +
 * platform-wide `all`). Kebab-case. See `docs/TEMPLATE-ARCHITECTURE.md`.
 *
 * Third-party relationships in healthcare are Business Associates tracked
 * via the `baa-tracker` document, not a standalone onboarding step. Step 5
 * is hidden here.
 */
export const HEALTHCARE_CONFIG: OnboardingVerticalConfig = {
  slug: 'healthcare',
  label: 'Healthcare',
  peopleTerminology: {
    worker: 'Staff',
    team: 'Team',
    thirdParty: null,
  },
  stepVisibility: {
    sites: true,
    thirdParties: false,
  },
  requiredDocCategories: [
    'iipp',
    'wvpp',
    'hazcom',
    'bbp-exposure-control',
    'hipaa-sra',
    'atd-plan',
  ],
  recommendedDocCategories: [
    'baa-tracker',
    'ergonomics-program',
    'heat-illness-prevention',
    'respiratory-protection-program',
  ],
  automations: {
    expirationSweep: true,
    regulatoryAlerts: true,
    thirdPartyCoiRequests: false,
  },
  stepCopy: {
    businessSnapshot: {
      intro:
        'Tell us about your practice or clinic so we can tailor your compliance setup.',
      workerCountLabel: 'How many clinical and administrative staff do you have?',
    },
    sites: {
      intro: 'Add each clinic, office, or treatment location.',
      addButtonLabel: 'Add location',
    },
    people: {
      intro: 'Bring your clinical and administrative staff into Protekon.',
      workerImportHelp:
        'Upload a CSV from your HRIS or add staff one at a time.',
    },
    documents: {
      intro:
        'These are the OSHA, Cal/OSHA, and HIPAA documents every healthcare operation needs.',
      templateLibraryCta: 'Browse healthcare templates',
    },
    automations: {
      intro:
        'Automate training expirations, BAA renewals, and regulatory alerts.',
    },
  },
};
