import type { OnboardingVerticalConfig } from './types';

/**
 * Transportation vertical onboarding config.
 *
 * Tier 2 (High risk) — DOT/FMCSA driver qualification and hours-of-service,
 * fleet safety, and powered industrial truck (dock/yard) operations are the
 * primary Cal/OSHA and federal DOT exposures for trucking, freight, and
 * last-mile carriers. Doc IDs from `lib/document-templates.ts`.
 *
 * Third-party management is ON — owner-operators and brokered carriers
 * flow through Step 5 and get COI + FMCSA authority verification from
 * the automation sweep.
 */
export const TRANSPORTATION_CONFIG: OnboardingVerticalConfig = {
  slug: 'transportation',
  label: 'Transportation & Freight',
  peopleTerminology: {
    worker: 'Driver',
    team: 'Fleet',
    thirdParty: 'Carrier',
  },
  stepVisibility: {
    sites: true,
    thirdParties: true,
  },
  requiredDocCategories: [
    'iipp',
    'hazcom',
    'fleet-safety-program',
    'pit-safety-program',
  ],
  recommendedDocCategories: [
    'wvpp',
    'eap',
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
        'Tell us about your transportation operation so we can tune your DOT and Cal/OSHA compliance program.',
      workerCountLabel: 'How many drivers and dock workers are in your fleet operation?',
    },
    sites: {
      intro: 'Add each terminal, depot, or distribution hub.',
      addButtonLabel: 'Add terminal location',
    },
    people: {
      intro: 'Bring your drivers, dock workers, and dispatch supervisors into Protekon.',
      workerImportHelp:
        'Upload a CSV of your workforce or add employees one at a time. We track CDL status, DOT medical certificates, and forklift certification at dock facilities.',
    },
    thirdParties: {
      intro: 'Add the owner-operators and brokered carriers you dispatch loads through.',
      classificationHelp:
        'Classify each carrier by authority type so we know which COIs, FMCSA operating authority proofs, and cargo liability certificates to request.',
    },
    documents: {
      intro:
        'These are the written programs DOT, FMCSA, and Cal/OSHA expect for transportation operations — including fleet safety plans, powered industrial truck programs for dock operations, and hazard communication for fuel and cargo handling.',
      templateLibraryCta: 'Browse transportation templates',
    },
    automations: {
      intro:
        'Keep your program current automatically — CDL and DOT medical expiration reminders, carrier COI renewals, and Cal/OSHA regulatory updates.',
    },
  },
};
