import type { OnboardingVerticalConfig } from './types';

/**
 * Personal services (salons, barbers, spas, nail salons, pet grooming)
 * vertical onboarding config.
 *
 * Tier 3 (Moderate risk) — chemical exposure (hair dyes, nail solvents,
 * disinfectants), BBP exposure (client blood from accidental cuts), and
 * SB 553 workplace violence prevention (cash handling, after-hours) are
 * the primary Cal/OSHA and Board of Barbering & Cosmetology exposures.
 * Doc IDs from `lib/document-templates.ts`.
 *
 * Third-party management is OFF — personal-services operations primarily
 * use in-house or booth-rental staff; product vendors handled ad hoc.
 */
export const PERSONAL_SERVICES_CONFIG: OnboardingVerticalConfig = {
  slug: 'personal_services',
  label: 'Personal Services',
  peopleTerminology: {
    worker: 'Stylist',
    team: 'Team',
    thirdParty: 'Booth Renter',
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
    'salon-personal-services-safety',
  ],
  recommendedDocCategories: [
    'ergonomics-program',
    'eap',
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
        'Tell us about your salon, spa, or personal-services business so we can tune your Cal/OSHA and Board of Barbering & Cosmetology compliance program.',
      workerCountLabel: 'How many stylists, technicians, and support staff work across your locations?',
    },
    sites: {
      intro: 'Add each salon, spa, or studio location.',
      addButtonLabel: 'Add location',
    },
    people: {
      intro: 'Bring your stylists, technicians, and front-desk staff into Protekon.',
      workerImportHelp:
        'Upload a CSV of your workforce or add staff one at a time. We track license expirations, BBP certifications, and salon-specific safety acknowledgments.',
    },
    documents: {
      intro:
        'These are the written programs Cal/OSHA and the Board of Barbering & Cosmetology expect for personal-services operations — including salon safety, bloodborne pathogen controls, and hazard communication for all chemicals in use.',
      templateLibraryCta: 'Browse personal services templates',
    },
    automations: {
      intro:
        'Keep your program current automatically — license renewal reminders, BBP refreshers, and Cal/OSHA regulatory updates.',
    },
  },
};
