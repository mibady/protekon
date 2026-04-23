import type { OnboardingVerticalConfig } from './types';

/**
 * Agriculture vertical onboarding config.
 *
 * Tier 2 (High risk) — pesticide safety (DPR licensing), heat illness
 * prevention (Cal/OSHA Title 8 §3395), and respiratory protection for
 * field-dust and chemical exposures are the primary regulatory requirements.
 * Doc IDs from `lib/document-templates.ts`.
 *
 * Third-party management is ON — co-operatives, labor contractors (farm labor
 * contractors require DLSE licensing), and crop-dusting subs flow through
 * Step 5 and get COI + pesticide-application credential requests from automation.
 */
export const AGRICULTURE_CONFIG: OnboardingVerticalConfig = {
  slug: 'agriculture',
  label: 'Agriculture & Farming',
  peopleTerminology: {
    worker: 'Farmworker',
    team: 'Crew',
    thirdParty: 'Cooperative',
  },
  stepVisibility: {
    sites: true,
    thirdParties: true,
  },
  requiredDocCategories: [
    'iipp',
    'hazcom',
    'heat-illness-prevention',
    'pesticide-safety',
    'respiratory-protection-program',
  ],
  recommendedDocCategories: [
    'wvpp',
    'confined-space-program',
    'hearing-conservation',
  ],
  automations: {
    expirationSweep: true,
    regulatoryAlerts: true,
    thirdPartyCoiRequests: true,
  },
  stepCopy: {
    businessSnapshot: {
      intro:
        'Tell us about your farming operation so we can tune your Cal/OSHA and DPR compliance program.',
      workerCountLabel: 'How many farmworkers and crew leads work across your fields and facilities?',
    },
    sites: {
      intro: 'Add each ranch, farm, packing shed, or processing facility.',
      addButtonLabel: 'Add farm site',
    },
    people: {
      intro: 'Bring your farmworkers, equipment operators, and crew supervisors into Protekon.',
      workerImportHelp:
        'Upload a CSV of your workforce or add workers one at a time. We track pesticide handler certifications, heat illness training, and respirator fit-test status.',
    },
    thirdParties: {
      intro: 'Add the co-operatives, farm labor contractors, and agri-service subs you work with.',
      classificationHelp:
        'Classify each partner by role so we know which COIs, DLSE farm labor contractor licenses, and pesticide applicator credentials to collect.',
    },
    documents: {
      intro:
        'These are the written programs Cal/OSHA and the DPR expect for agricultural operations — including pesticide safety plans, heat illness prevention, and respiratory protection for fieldwork.',
      templateLibraryCta: 'Browse agriculture templates',
    },
    automations: {
      intro:
        'Keep your program current automatically — pesticide certification renewals, heat illness season alerts, and Cal/OSHA regulatory updates.',
    },
  },
};
