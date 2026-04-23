import type { OnboardingVerticalConfig } from './types';

/**
 * Building services (janitorial, custodial, pest, HVAC) vertical
 * onboarding config.
 *
 * Tier 3 (Moderate risk) — chemical exposure from cleaning agents, BBP
 * exposure (biohazard cleanup), and multi-employer worksite liability
 * (crews working at client properties) drive the compliance program.
 * Doc IDs from `lib/document-templates.ts`.
 *
 * Third-party management is ON — client properties are the primary third
 * parties; COI collection and site-specific safety acknowledgments flow
 * through Step 5. Sites are hidden — crews operate at client-owned
 * locations, not their own multi-site footprint.
 */
export const BUILDING_SERVICES_CONFIG: OnboardingVerticalConfig = {
  slug: 'building_services',
  label: 'Building Services',
  peopleTerminology: {
    worker: 'Technician',
    team: 'Crew',
    thirdParty: 'Client Property',
  },
  stepVisibility: {
    sites: false,
    thirdParties: true,
  },
  requiredDocCategories: [
    'iipp',
    'wvpp',
    'hazcom',
    'janitorial-chemical-safety',
    'bbp-exposure-control',
  ],
  recommendedDocCategories: [
    'eap',
    'ergonomics-program',
    'respiratory-protection-program',
    'training-records',
  ],
  automations: {
    expirationSweep: true,
    regulatoryAlerts: true,
    thirdPartyCoiRequests: true,
  },
  stepCopy: {
    businessSnapshot: {
      intro:
        'Tell us about your building services operation so we can tune your Cal/OSHA compliance program — chemical safety, bloodborne pathogen controls, and multi-employer worksite coverage.',
      workerCountLabel: 'How many technicians are in your active crew pool?',
    },
    sites: {
      intro: 'Add each branch or internal office location.',
      addButtonLabel: 'Add office location',
    },
    people: {
      intro: 'Bring your cleaners, technicians, and crew leads into Protekon.',
      workerImportHelp:
        'Upload a CSV of your workforce or add technicians one at a time. We track chemical-safety training, BBP certifications, and site-specific induction records.',
    },
    thirdParties: {
      intro: 'Add the client properties your crews service.',
      classificationHelp:
        'Classify each client by property type so we know which COI limits, site-specific safety acknowledgments, and multi-employer worksite policies to attach.',
    },
    documents: {
      intro:
        'These are the written programs Cal/OSHA expects for building services — including janitorial chemical safety, bloodborne pathogen exposure control, and hazard communication for all cleaning agents in use.',
      templateLibraryCta: 'Browse building services templates',
    },
    automations: {
      intro:
        'Keep your program current automatically — client COI renewals, technician training refreshers, and Cal/OSHA regulatory updates.',
    },
  },
};
