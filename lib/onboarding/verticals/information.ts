import type { OnboardingVerticalConfig } from './types';

/**
 * Information (technology, software, data services) vertical onboarding
 * config.
 *
 * Tier 3 (Moderate risk) — office-ergonomic injuries, SB 553 workplace
 * violence prevention (site-security + reception), and EAP are the
 * primary Cal/OSHA exposures. Hazcom applies minimally (cleaning + UPS
 * batteries) but is still required program documentation. Doc IDs from
 * `lib/document-templates.ts`.
 *
 * Third-party management is OFF — information-sector vendor relationships
 * (SaaS, cloud, contractors) are governed by procurement/security review,
 * not the compliance onboarding wizard.
 */
export const INFORMATION_CONFIG: OnboardingVerticalConfig = {
  slug: 'information',
  label: 'Technology & Information Services',
  peopleTerminology: {
    worker: 'Employee',
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
    'heat-illness-prevention',
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
        'Tell us about your technology or information-services operation so we can tune your Cal/OSHA compliance program — including SB 553 workplace violence prevention and the ergonomics program required for office-based work.',
      workerCountLabel: 'How many employees work across your offices?',
    },
    sites: {
      intro: 'Add each office, data center, or co-working location.',
      addButtonLabel: 'Add office',
    },
    people: {
      intro: 'Bring your engineers, operators, and office staff into Protekon.',
      workerImportHelp:
        'Upload a CSV of your workforce or add employees one at a time. We track WVPP training, ergonomics acknowledgments, and office-specific safety records.',
    },
    documents: {
      intro:
        'These are the written programs Cal/OSHA expects for information-sector employers — including workplace violence prevention, ergonomics, and an employee assistance program.',
      templateLibraryCta: 'Browse technology templates',
    },
    automations: {
      intro:
        'Keep your program current automatically — WVPP annual reviews, ergonomics refreshers, and Cal/OSHA regulatory updates.',
    },
  },
};
