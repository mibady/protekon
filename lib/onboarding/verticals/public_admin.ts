import type { OnboardingVerticalConfig } from './types';

/**
 * Public administration vertical onboarding config.
 *
 * Tier 3 (Moderate risk) — public-facing service windows and enforcement
 * staff drive SB 553 workplace violence prevention exposure. Ergonomics,
 * BBP (first-aid responders, corrections), and hazcom (facilities/parks)
 * apply across municipal and state agencies. Doc IDs from
 * `lib/document-templates.ts`.
 *
 * Third-party management is ON — public agencies procure a large volume of
 * contracted services (IT, facilities, professional services); vendor COI
 * + prevailing-wage compliance flows through Step 5.
 */
export const PUBLIC_ADMIN_CONFIG: OnboardingVerticalConfig = {
  slug: 'public_admin',
  label: 'Public Administration',
  peopleTerminology: {
    worker: 'Employee',
    team: 'Department',
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
    'training-records',
  ],
  recommendedDocCategories: [
    'eap',
    'ergonomics-program',
    'bbp-exposure-control',
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
        'Tell us about your agency or municipality so we can tune your Cal/OSHA compliance program — including SB 553 workplace violence prevention for public-facing service and enforcement staff.',
      workerCountLabel: 'How many employees work across your departments?',
    },
    sites: {
      intro: 'Add each office, service center, or facility location.',
      addButtonLabel: 'Add location',
    },
    people: {
      intro: 'Bring your department heads, front-line staff, and field personnel into Protekon.',
      workerImportHelp:
        'Upload a CSV of your workforce or add employees one at a time. We track WVPP training, BBP certifications, and department-specific safety acknowledgments.',
    },
    thirdParties: {
      intro: 'Add the contractors who deliver services to your agency.',
      classificationHelp:
        'Classify each contractor by service type so we know which COI limits, prevailing-wage certifications, and background checks to require.',
    },
    documents: {
      intro:
        'These are the written programs Cal/OSHA expects for public agencies — including workplace violence prevention, hazard communication for facilities, and training documentation across departments.',
      templateLibraryCta: 'Browse public-sector templates',
    },
    automations: {
      intro:
        'Keep your program current automatically — contractor COI renewals, WVPP annual reviews, and regulatory updates.',
    },
  },
};
