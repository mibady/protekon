import type { OnboardingVerticalConfig } from './types';

/**
 * Facilities management vertical onboarding config.
 *
 * Tier 3 (Moderate risk) — multi-employer worksite liability is the
 * dominant exposure: FM teams execute work at client-owned facilities and
 * coordinate sub-contractors on those sites. Electrical safety, LOTO, and
 * fall protection apply to in-scope trades. Doc IDs from
 * `lib/document-templates.ts`.
 *
 * Third-party management is ON — sub-contractors (HVAC, electrical,
 * plumbing) working under the FM contract require COI + safety program
 * verification. Sites are hidden — work occurs at client-owned facilities,
 * not an FM-owned multi-site footprint.
 */
export const FACILITIES_MGMT_CONFIG: OnboardingVerticalConfig = {
  slug: 'facilities_mgmt',
  label: 'Facilities Management',
  peopleTerminology: {
    worker: 'Technician',
    team: 'Team',
    thirdParty: 'Sub-Contractor',
  },
  stepVisibility: {
    sites: false,
    thirdParties: true,
  },
  requiredDocCategories: [
    'iipp',
    'wvpp',
    'hazcom',
    'multi-employer-worksite-policy',
  ],
  recommendedDocCategories: [
    'electrical-safety-program',
    'loto-program',
    'fall-protection-plan',
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
        'Tell us about your facilities management operation so we can tune your Cal/OSHA multi-employer compliance program — including sub-contractor oversight at client-owned facilities.',
      workerCountLabel: 'How many technicians and FM staff do you deploy to client sites?',
    },
    sites: {
      intro: 'Add each branch or internal office location.',
      addButtonLabel: 'Add office location',
    },
    people: {
      intro: 'Bring your FM technicians, supervisors, and account managers into Protekon.',
      workerImportHelp:
        'Upload a CSV of your workforce or add technicians one at a time. We track trade-specific certifications, LOTO training, and client-site induction records.',
    },
    thirdParties: {
      intro: 'Add the sub-contractors (HVAC, electrical, plumbing, specialty trades) you dispatch.',
      classificationHelp:
        'Classify each sub by trade so we know which COI limits, license verifications, and multi-employer worksite policies to require.',
    },
    documents: {
      intro:
        'These are the written programs Cal/OSHA expects for facilities management — including multi-employer worksite policy, hazard communication, and trade-specific safety programs for in-scope work.',
      templateLibraryCta: 'Browse facilities management templates',
    },
    automations: {
      intro:
        'Keep your program current automatically — sub-contractor COI renewals, technician certification tracking, and Cal/OSHA regulatory updates.',
    },
  },
};
