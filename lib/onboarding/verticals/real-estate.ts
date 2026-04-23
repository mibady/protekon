import type { OnboardingVerticalConfig } from './types';

/**
 * Real estate & property management vertical onboarding config.
 *
 * Tier 3 (Moderate risk) — dual fiduciary duty to owners and tenants drives
 * vendor COI tracking for every contractor touching a managed property.
 * SB 553 WVPP applies to leasing offices and on-site staff. Doc IDs from
 * `lib/document-templates.ts`.
 *
 * Third-party management is ON — maintenance crews, landscapers, cleaning
 * services, and specialty contractors all require active COI + license
 * verification before accessing managed properties.
 */
export const REAL_ESTATE_CONFIG: OnboardingVerticalConfig = {
  slug: 'real-estate',
  label: 'Real Estate & Property Management',
  peopleTerminology: {
    worker: 'Property Manager',
    team: 'Team',
    thirdParty: 'Contractor',
  },
  stepVisibility: {
    sites: true,
    thirdParties: true,
  },
  requiredDocCategories: [
    'iipp',
    'wvpp',
    'hazcom',
    'property-compliance-program',
  ],
  recommendedDocCategories: [
    'eap',
    'fall-protection-plan',
    'bbp-exposure-control',
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
        'Tell us about your real estate or property management operation so we can tune your compliance program — owner fiduciary duty, tenant protections, and vendor COI tracking.',
      workerCountLabel: 'How many property managers and leasing staff do you have?',
    },
    sites: {
      intro: 'Add each managed property or portfolio asset.',
      addButtonLabel: 'Add property',
    },
    people: {
      intro: 'Bring your property managers, leasing agents, and in-house maintenance staff into Protekon.',
      workerImportHelp:
        'Upload a CSV of your workforce or add staff one at a time. We track WVPP training and property-specific access records.',
    },
    thirdParties: {
      intro: 'Add the maintenance crews, landscapers, and contractors who service your properties.',
      classificationHelp:
        'Classify each vendor by trade so we know which COI limits, licenses, and safety acknowledgments to require before they access a managed property.',
    },
    documents: {
      intro:
        'These are the written programs expected for real estate operations — including property compliance, workplace violence prevention, and vendor access controls.',
      templateLibraryCta: 'Browse real estate templates',
    },
    automations: {
      intro:
        'Keep your program current automatically — contractor COI renewals, property compliance reviews, and regulatory updates.',
    },
  },
};
