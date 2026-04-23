import type { OnboardingVerticalConfig } from './types';

/**
 * Retail vertical onboarding config.
 *
 * Tier 3 (Moderate risk) — SB 553 workplace violence prevention is the
 * dominant Cal/OSHA exposure for retail (customer-facing, cash handling,
 * after-hours stocking). Ergonomics and heat illness apply in back-of-house
 * and outdoor garden-center work. Doc IDs from `lib/document-templates.ts`.
 *
 * Third-party management is OFF — retail operations primarily run on
 * in-house associates; vendor/distributor COIs are handled ad hoc.
 */
export const RETAIL_CONFIG: OnboardingVerticalConfig = {
  slug: 'retail',
  label: 'Retail',
  peopleTerminology: {
    worker: 'Associate',
    team: 'Team',
    thirdParty: 'Vendor',
  },
  stepVisibility: {
    sites: true,
    thirdParties: false,
  },
  requiredDocCategories: [
    'iipp',
    'wvpp',
    'hazcom',
    'store-safety-program',
  ],
  recommendedDocCategories: [
    'eap',
    'ergonomics-program',
    'heat-illness-prevention',
    'training-records',
  ],
  automations: {
    expirationSweep: true,
    regulatoryAlerts: true,
    thirdPartyCoiRequests: false,
  },
  stepCopy: {
    businessSnapshot: {
      intro:
        'Tell us about your retail operation so we can tune your Cal/OSHA compliance program — including SB 553 workplace violence prevention for customer-facing and cash-handling environments.',
      workerCountLabel: 'How many associates work across your stores?',
    },
    sites: {
      intro: 'Add each store or outlet location.',
      addButtonLabel: 'Add store',
    },
    people: {
      intro: 'Bring your sales associates, cashiers, and store managers into Protekon.',
      workerImportHelp:
        'Upload a CSV of your workforce or add associates one at a time. We track SB 553 WVPP training and store-specific safety acknowledgments.',
    },
    documents: {
      intro:
        'These are the written programs Cal/OSHA expects for retail — including workplace violence prevention, store safety, and hazard communication for back-of-house chemicals.',
      templateLibraryCta: 'Browse retail templates',
    },
    automations: {
      intro:
        'Keep your program current automatically — WVPP annual reviews, store-safety refreshers, and Cal/OSHA regulatory updates.',
    },
  },
};
