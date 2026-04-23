import type { OnboardingVerticalConfig } from './types';

/**
 * Wholesale trade vertical onboarding config.
 *
 * Tier 2 (High risk) — powered industrial truck (PIT/forklift) operations and
 * warehouse hazard communication are the primary Cal/OSHA exposures for
 * distributors and wholesale trade facilities. Doc IDs from
 * `lib/document-templates.ts`.
 *
 * Third-party management is OFF — wholesale operations manage inbound carriers
 * at the shipping-dock level; formal COI programs are out of scope for Step 5.
 */
export const WHOLESALE_CONFIG: OnboardingVerticalConfig = {
  slug: 'wholesale',
  label: 'Wholesale & Distribution',
  peopleTerminology: {
    worker: 'Warehouse Worker',
    team: 'Team',
    thirdParty: 'Carrier',
  },
  stepVisibility: {
    sites: true,
    thirdParties: false,
  },
  requiredDocCategories: [
    'iipp',
    'hazcom',
    'pit-safety-program',
    'eap',
  ],
  recommendedDocCategories: [
    'wvpp',
    'fleet-safety-program',
    'confined-space-program',
  ],
  automations: {
    expirationSweep: true,
    regulatoryAlerts: true,
    thirdPartyCoiRequests: false,
  },
  stepCopy: {
    businessSnapshot: {
      intro:
        'Tell us about your wholesale or distribution operation so we can tune your Cal/OSHA compliance program.',
      workerCountLabel: 'How many warehouse workers and forklift operators are on your team?',
    },
    sites: {
      intro: 'Add each warehouse, distribution center, or fulfillment facility.',
      addButtonLabel: 'Add warehouse location',
    },
    people: {
      intro: 'Bring your warehouse workers, forklift operators, and supervisors into Protekon.',
      workerImportHelp:
        'Upload a CSV of your workforce or add employees one at a time. We track PIT certification and hazcom training status.',
    },
    documents: {
      intro:
        'These are the written programs Cal/OSHA expects for wholesale and distribution facilities — including powered industrial truck safety, hazard communication, and emergency action planning.',
      templateLibraryCta: 'Browse wholesale & distribution templates',
    },
    automations: {
      intro:
        'Keep your program current automatically — PIT recertification reminders, forklift inspection schedules, and Cal/OSHA regulatory updates.',
    },
  },
};
