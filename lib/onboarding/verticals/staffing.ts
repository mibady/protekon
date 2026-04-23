import type { OnboardingVerticalConfig } from './types';

/**
 * Staffing agency vertical onboarding config.
 *
 * Tier 2 (High risk) — multi-employer worksite liability under Cal/OSHA
 * makes staffing agencies jointly responsible for temp worker safety at
 * client sites. WVPP and hazcom coverage must extend to all placed workers.
 * Doc IDs from `lib/document-templates.ts`.
 *
 * Third-party management is ON — client companies are the primary third
 * parties; COI collection and worksite safety verification flow through Step 5.
 *
 * Note: `stepVisibility.sites` is false — staffing agencies do not manage
 * their own multi-site footprint; work sites are client-owned.
 */
export const STAFFING_CONFIG: OnboardingVerticalConfig = {
  slug: 'staffing',
  label: 'Staffing & Temporary Workforce',
  peopleTerminology: {
    worker: 'Temporary Worker',
    team: 'Pool',
    thirdParty: 'Client Company',
  },
  stepVisibility: {
    sites: false,
    thirdParties: true,
  },
  requiredDocCategories: [
    'iipp',
    'wvpp',
    'hazcom',
    'multi-employer-worksite-policy',
  ],
  recommendedDocCategories: [
    'training-records',
    'incident-investigation',
  ],
  automations: {
    expirationSweep: true,
    regulatoryAlerts: true,
    thirdPartyCoiRequests: true,
  },
  stepCopy: {
    businessSnapshot: {
      intro:
        'Tell us about your staffing agency so we can tune your Cal/OSHA multi-employer compliance program.',
      workerCountLabel: 'How many temporary workers are currently in your active placement pool?',
    },
    sites: {
      intro: 'Add each branch or internal office location.',
      addButtonLabel: 'Add office location',
    },
    people: {
      intro: 'Bring your placed workers, recruiters, and account managers into Protekon.',
      workerImportHelp:
        'Upload a CSV of your workforce or add workers one at a time. We track placement status, site-specific induction records, and SB 553 WVPP training.',
    },
    thirdParties: {
      intro: 'Add the client companies where your temp workers are placed.',
      classificationHelp:
        'Classify each client by industry so we know which worksite safety verifications, COIs, and multi-employer policy acknowledgments to request.',
    },
    documents: {
      intro:
        'These are the written programs Cal/OSHA expects for staffing agencies — including multi-employer worksite policy, workplace violence prevention, and hazard communication coverage that extends to all placed workers.',
      templateLibraryCta: 'Browse staffing templates',
    },
    automations: {
      intro:
        'Keep your program current automatically — client COI renewals, placed-worker induction tracking, and Cal/OSHA regulatory updates.',
    },
  },
};
