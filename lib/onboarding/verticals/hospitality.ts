import type { OnboardingVerticalConfig } from './types';

/**
 * Hospitality vertical onboarding config.
 *
 * Tier 2 (High risk) — bloodborne pathogen exposure (housekeeping), heat
 * illness prevention (kitchens/laundry), and workplace violence prevention
 * (SB 553) are the primary Cal/OSHA exposures for hotels, restaurants, and
 * event venues. Doc IDs from `lib/document-templates.ts`.
 *
 * Third-party management is OFF — hospitality operations primarily use
 * in-house staff; contractor COI programs are handled ad hoc.
 */
export const HOSPITALITY_CONFIG: OnboardingVerticalConfig = {
  slug: 'hospitality',
  label: 'Hospitality & Food Service',
  peopleTerminology: {
    worker: 'Staff',
    team: 'Team',
    thirdParty: 'Contractor',
  },
  stepVisibility: {
    sites: true,
    thirdParties: false,
  },
  requiredDocCategories: [
    'iipp',
    'wvpp',
    'bbp-exposure-control',
    'heat-illness-prevention',
    'hazcom',
  ],
  recommendedDocCategories: [
    'hospitality-safety-program',
    'eap',
    'fall-protection-plan',
  ],
  automations: {
    expirationSweep: true,
    regulatoryAlerts: true,
    thirdPartyCoiRequests: false,
  },
  stepCopy: {
    businessSnapshot: {
      intro:
        'Tell us about your hospitality operation so we can tune your Cal/OSHA compliance program — including SB 553 workplace violence prevention.',
      workerCountLabel: 'How many staff members work across your properties?',
    },
    sites: {
      intro: 'Add each hotel, restaurant, or event venue location.',
      addButtonLabel: 'Add property',
    },
    people: {
      intro: 'Bring your front-of-house staff, kitchen team, and housekeeping crew into Protekon.',
      workerImportHelp:
        'Upload a CSV of your workforce or add staff one at a time. We track SB 553 WVPP training and food-handler certification status.',
    },
    documents: {
      intro:
        'These are the written programs Cal/OSHA expects for hospitality operations — including workplace violence prevention, bloodborne pathogen controls, and heat illness prevention for kitchen and laundry environments.',
      templateLibraryCta: 'Browse hospitality templates',
    },
    automations: {
      intro:
        'Keep your program current automatically — WVPP annual reviews, heat illness season reminders, and Cal/OSHA regulatory updates.',
    },
  },
};
