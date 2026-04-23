import type { OnboardingVerticalConfig } from './types';

/**
 * Professional services (law, accounting, consulting, architecture, A&E)
 * vertical onboarding config.
 *
 * Tier 3 (Moderate risk) — ergonomic injuries and SB 553 workplace violence
 * prevention (client-facing reception, courthouse work, site visits) drive
 * the compliance program. EAP is standard benefit-program documentation.
 * Doc IDs from `lib/document-templates.ts`.
 *
 * Third-party management is OFF — professional services firms engage
 * vendors through procurement/engagement letters, not through the
 * compliance onboarding wizard.
 */
export const PROFESSIONAL_SERVICES_CONFIG: OnboardingVerticalConfig = {
  slug: 'professional_services',
  label: 'Professional Services',
  peopleTerminology: {
    worker: 'Professional',
    team: 'Firm',
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
    'training-records',
    'heat-illness-prevention',
  ],
  automations: {
    expirationSweep: true,
    regulatoryAlerts: true,
    thirdPartyCoiRequests: false,
  },
  stepCopy: {
    businessSnapshot: {
      intro:
        'Tell us about your firm so we can tune your Cal/OSHA compliance program — including SB 553 workplace violence prevention and the ergonomics program required for office-based work.',
      workerCountLabel: 'How many professionals and staff work across your offices?',
    },
    sites: {
      intro: 'Add each office or firm location.',
      addButtonLabel: 'Add office',
    },
    people: {
      intro: 'Bring your attorneys, CPAs, consultants, and support staff into Protekon.',
      workerImportHelp:
        'Upload a CSV of your workforce or add staff one at a time. We track WVPP training, ergonomics acknowledgments, and office-specific safety records.',
    },
    documents: {
      intro:
        'These are the written programs Cal/OSHA expects for professional-services firms — including workplace violence prevention, ergonomics, and an employee assistance program.',
      templateLibraryCta: 'Browse professional services templates',
    },
    automations: {
      intro:
        'Keep your program current automatically — WVPP annual reviews, ergonomics refreshers, and Cal/OSHA regulatory updates.',
    },
  },
};
