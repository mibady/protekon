import type { OnboardingVerticalConfig } from './types';

/**
 * Laundry & dry-cleaning vertical onboarding config.
 *
 * Tier 2 (High risk) — PERC (perchloroethylene) solvent safety and bloodborne
 * pathogen exposure (linen from healthcare/hospitality clients) are the primary
 * Cal/OSHA and Cal/EPA exposures. Doc IDs from `lib/document-templates.ts`.
 *
 * Third-party management is OFF — laundry operations primarily serve end
 * customers directly; equipment service vendors tracked outside Step 5.
 */
export const LAUNDRY_CONFIG: OnboardingVerticalConfig = {
  slug: 'laundry',
  label: 'Laundry & Dry Cleaning',
  peopleTerminology: {
    worker: 'Attendant',
    team: 'Team',
    thirdParty: 'Service Provider',
  },
  stepVisibility: {
    sites: true,
    thirdParties: false,
  },
  requiredDocCategories: [
    'iipp',
    'hazcom',
    'drycleaning-solvent-safety',
    'bbp-exposure-control',
  ],
  recommendedDocCategories: [
    'wvpp',
    'eap',
    'heat-illness-prevention',
    'ergonomics-program',
  ],
  automations: {
    expirationSweep: true,
    regulatoryAlerts: true,
    thirdPartyCoiRequests: false,
  },
  stepCopy: {
    businessSnapshot: {
      intro:
        'Tell us about your laundry or dry-cleaning operation so we can tune your Cal/OSHA and solvent-safety compliance program.',
      workerCountLabel: 'How many attendants and press operators work at your facility?',
    },
    sites: {
      intro: 'Add each laundry facility or dry-cleaning plant.',
      addButtonLabel: 'Add facility',
    },
    people: {
      intro: 'Bring your attendants, pressers, and shift leads into Protekon.',
      workerImportHelp:
        'Upload a CSV of your workforce or add staff one at a time. We track solvent-safety and BBP training status.',
    },
    documents: {
      intro:
        'These are the written programs Cal/OSHA and Cal/EPA expect for laundry and dry-cleaning operations — including solvent safety plans, bloodborne pathogen controls, and heat illness prevention for high-temperature work areas.',
      templateLibraryCta: 'Browse laundry & dry-cleaning templates',
    },
    automations: {
      intro:
        'Keep your program current automatically — solvent-safety refreshers, BBP annual reviews, and Cal/OSHA regulatory updates.',
    },
  },
};
