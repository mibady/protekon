import type { OnboardingVerticalConfig } from './types';

/**
 * Arts & entertainment vertical onboarding config.
 *
 * Tier 3 (Moderate risk) — live-event crowd management, fall protection for
 * rigging/lighting, and SB 553 workplace violence prevention for
 * box-office/venue staff are the primary Cal/OSHA exposures. Heat illness
 * applies to outdoor festivals and backlot shoots. Doc IDs from
 * `lib/document-templates.ts`.
 *
 * Third-party management is ON — rental houses, production companies,
 * catering, and specialty contractors all require COI + safety
 * documentation before working an event or production.
 */
export const ARTS_ENTERTAINMENT_CONFIG: OnboardingVerticalConfig = {
  slug: 'arts_entertainment',
  label: 'Arts & Entertainment',
  peopleTerminology: {
    worker: 'Crew Member',
    team: 'Crew',
    thirdParty: 'Production Vendor',
  },
  stepVisibility: {
    sites: true,
    thirdParties: true,
  },
  requiredDocCategories: [
    'iipp',
    'wvpp',
    'hazcom',
    'event-safety-crowd-management',
  ],
  recommendedDocCategories: [
    'fall-protection-plan',
    'heat-illness-prevention',
    'eap',
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
        'Tell us about your venue, production company, or entertainment operation so we can tune your Cal/OSHA compliance program — including event safety, crowd management, and workplace violence prevention.',
      workerCountLabel: 'How many crew members, artists, and venue staff do you engage?',
    },
    sites: {
      intro: 'Add each venue, set, or production location.',
      addButtonLabel: 'Add venue',
    },
    people: {
      intro: 'Bring your crew, venue staff, and in-house production team into Protekon.',
      workerImportHelp:
        'Upload a CSV of your workforce or add crew one at a time. We track WVPP training, rigging certifications, and event-specific safety acknowledgments.',
    },
    thirdParties: {
      intro: 'Add the rental houses, production companies, and specialty contractors you work with.',
      classificationHelp:
        'Classify each vendor by production role so we know which COI limits, licenses, and event-safety acknowledgments to require before they work a show.',
    },
    documents: {
      intro:
        'These are the written programs expected for arts and entertainment — including event safety, crowd management, fall protection for rigging, and workplace violence prevention for box-office and venue staff.',
      templateLibraryCta: 'Browse entertainment templates',
    },
    automations: {
      intro:
        'Keep your program current automatically — vendor COI renewals, pre-event safety reviews, and Cal/OSHA regulatory updates.',
    },
  },
};
