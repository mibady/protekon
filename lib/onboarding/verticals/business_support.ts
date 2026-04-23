import type { OnboardingVerticalConfig } from './types';

/**
 * Business support (call centers, BPO, admin services, shared services)
 * vertical onboarding config.
 *
 * Tier 3 (Moderate risk) — ergonomic injuries from sustained keyboard and
 * headset work, hearing conservation (high-call-volume environments), and
 * SB 553 workplace violence prevention are the primary Cal/OSHA exposures.
 * Doc IDs from `lib/document-templates.ts`.
 *
 * Third-party management is OFF — business-support operations primarily
 * use in-house staff; vendor relationships flow through procurement.
 */
export const BUSINESS_SUPPORT_CONFIG: OnboardingVerticalConfig = {
  slug: 'business_support',
  label: 'Business Support & Call Centers',
  peopleTerminology: {
    worker: 'Agent',
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
    'ergonomics-program',
    'eap',
  ],
  recommendedDocCategories: [
    'hazcom',
    'hearing-conservation',
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
        'Tell us about your call center or business-support operation so we can tune your Cal/OSHA compliance program — ergonomics, hearing conservation, and SB 553 workplace violence prevention.',
      workerCountLabel: 'How many agents and support staff work across your centers?',
    },
    sites: {
      intro: 'Add each contact center or office location.',
      addButtonLabel: 'Add center',
    },
    people: {
      intro: 'Bring your agents, team leads, and support staff into Protekon.',
      workerImportHelp:
        'Upload a CSV of your workforce or add agents one at a time. We track WVPP training, ergonomics acknowledgments, and center-specific safety records.',
    },
    documents: {
      intro:
        'These are the written programs Cal/OSHA expects for business-support operations — including workplace violence prevention, ergonomics for keyboard-intensive work, and an employee assistance program.',
      templateLibraryCta: 'Browse business-support templates',
    },
    automations: {
      intro:
        'Keep your program current automatically — WVPP annual reviews, ergonomics refreshers, and Cal/OSHA regulatory updates.',
    },
  },
};
