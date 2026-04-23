import type { OnboardingVerticalConfig } from './types';

/**
 * Utilities vertical onboarding config.
 *
 * Tier 2 (High risk) — confined space entry (Cal/OSHA Title 8 §5156-5158),
 * electrical safety (NFPA 70E / Cal/OSHA electrical standards), and fall
 * protection for pole and tower work are the primary regulatory exposures
 * for electric, gas, water, and telecommunications utilities. Doc IDs from
 * `lib/document-templates.ts`.
 *
 * Third-party management is ON — line contractors, engineering subs, and
 * meter-service vendors flow through Step 5 and get COI + qualified-worker
 * documentation requests from the automation sweep.
 */
export const UTILITIES_CONFIG: OnboardingVerticalConfig = {
  slug: 'utilities',
  label: 'Utilities & Energy Services',
  peopleTerminology: {
    worker: 'Technician',
    team: 'Crew',
    thirdParty: 'Contractor',
  },
  stepVisibility: {
    sites: true,
    thirdParties: true,
  },
  requiredDocCategories: [
    'iipp',
    'hazcom',
    'confined-space-program',
    'respiratory-protection-program',
    'electrical-safety-program',
    'fall-protection-plan',
  ],
  recommendedDocCategories: [
    'wvpp',
    'hearing-conservation',
    'heat-illness-prevention',
  ],
  automations: {
    expirationSweep: true,
    regulatoryAlerts: true,
    thirdPartyCoiRequests: true,
  },
  stepCopy: {
    businessSnapshot: {
      intro:
        'Tell us about your utility operation so we can tune your Cal/OSHA and CPUC compliance program — including electrical safety and confined space requirements.',
      workerCountLabel: 'How many technicians and crew members work in your field operations?',
    },
    sites: {
      intro: 'Add each service center, substation, or field operations hub.',
      addButtonLabel: 'Add service location',
    },
    people: {
      intro: 'Bring your linemen, field technicians, and operations supervisors into Protekon.',
      workerImportHelp:
        'Upload a CSV of your workforce or add employees one at a time. We track confined-space entry authorization, electrical qualified-worker status, and fall-protection training.',
    },
    thirdParties: {
      intro: 'Add the line contractors, engineering firms, and meter-service subs you work with.',
      classificationHelp:
        'Classify each contractor by scope so we know which COIs, qualified-worker certifications, and confined-space entry authorizations to collect.',
    },
    documents: {
      intro:
        'These are the written programs Cal/OSHA and CPUC expect for utility operations — including confined space entry programs, electrical safety plans, fall protection, and respiratory protection for underground and chemical-exposure work.',
      templateLibraryCta: 'Browse utilities templates',
    },
    automations: {
      intro:
        'Keep your program current automatically — confined-space permit renewals, electrical safety refreshers, contractor COI requests, and Cal/OSHA regulatory updates.',
    },
  },
};
