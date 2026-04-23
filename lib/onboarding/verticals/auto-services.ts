import type { OnboardingVerticalConfig } from './types';

/**
 * Auto services vertical onboarding config.
 *
 * Tier 2 (High risk) — spray booth compliance (Cal/OSHA Title 8 §5415),
 * respiratory protection for paint fumes and solvents, and LOTO for lift
 * and shop equipment are the primary regulatory exposures for auto repair,
 * body shops, and dealership service departments. Doc IDs from
 * `lib/document-templates.ts`.
 *
 * Third-party management is OFF — auto service operations primarily use
 * in-house technicians; parts vendors are tracked outside Step 5.
 */
export const AUTO_SERVICES_CONFIG: OnboardingVerticalConfig = {
  slug: 'auto-services',
  label: 'Auto Repair & Body Services',
  peopleTerminology: {
    worker: 'Technician',
    team: 'Shop',
    thirdParty: 'Vendor',
  },
  stepVisibility: {
    sites: true,
    thirdParties: false,
  },
  requiredDocCategories: [
    'iipp',
    'hazcom',
    'respiratory-protection-program',
    'spray-booth-compliance',
    'loto-program',
  ],
  recommendedDocCategories: [
    'wvpp',
    'eap',
    'hearing-conservation',
  ],
  automations: {
    expirationSweep: true,
    regulatoryAlerts: true,
    thirdPartyCoiRequests: false,
  },
  stepCopy: {
    businessSnapshot: {
      intro:
        'Tell us about your auto repair or body shop so we can tune your Cal/OSHA compliance program — including spray booth and solvent safety requirements.',
      workerCountLabel: 'How many technicians and painters work in your shop?',
    },
    sites: {
      intro: 'Add each repair shop or body shop location.',
      addButtonLabel: 'Add shop location',
    },
    people: {
      intro: 'Bring your technicians, painters, and service advisors into Protekon.',
      workerImportHelp:
        'Upload a CSV of your workforce or add employees one at a time. We track respirator fit-test status, LOTO authorization, and spray booth operator training.',
    },
    documents: {
      intro:
        'These are the written programs Cal/OSHA expects for auto repair and body shops — including spray booth compliance, respiratory protection for paint fumes, lockout/tagout for lift equipment, and hazard communication for shop chemicals.',
      templateLibraryCta: 'Browse auto services templates',
    },
    automations: {
      intro:
        'Keep your program current automatically — respirator fit-test reminders, spray booth inspection schedules, and Cal/OSHA regulatory updates.',
    },
  },
};
