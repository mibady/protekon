import type { OnboardingVerticalConfig } from './types';

/**
 * Security services (guard services, patrol, event security) vertical
 * onboarding config.
 *
 * Tier 3 (Moderate risk) — SB 553 workplace violence prevention is the
 * dominant Cal/OSHA exposure (guards are explicitly in-scope under Labor
 * Code §6401.9). BSIS guard-card training, multi-employer worksite
 * liability (guards posted at client sites), and incident documentation
 * round out the compliance program. Doc IDs from
 * `lib/document-templates.ts`.
 *
 * Third-party management is ON — client sites are the primary third
 * parties; post-specific scope-of-work and COI flow through Step 5.
 * Sites are hidden — guards are posted at client-owned locations, not a
 * security-firm-owned multi-site footprint.
 */
export const SECURITY_CONFIG: OnboardingVerticalConfig = {
  slug: 'security',
  label: 'Security Services',
  peopleTerminology: {
    worker: 'Officer',
    team: 'Post',
    thirdParty: 'Client Site',
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
    'eap',
    'incident-investigation',
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
        'Tell us about your security operation so we can tune your Cal/OSHA compliance program — including SB 553 workplace violence prevention and BSIS guard-card training tracking.',
      workerCountLabel: 'How many officers are in your active post pool?',
    },
    sites: {
      intro: 'Add each branch or dispatch office location.',
      addButtonLabel: 'Add office location',
    },
    people: {
      intro: 'Bring your officers, supervisors, and dispatch staff into Protekon.',
      workerImportHelp:
        'Upload a CSV of your workforce or add officers one at a time. We track BSIS guard-card expirations, WVPP training, and post-specific safety acknowledgments.',
    },
    thirdParties: {
      intro: 'Add the client sites where your officers are posted.',
      classificationHelp:
        'Classify each client site by environment so we know which post orders, COI limits, and multi-employer worksite acknowledgments to attach.',
    },
    documents: {
      intro:
        'These are the written programs Cal/OSHA expects for security services — including workplace violence prevention (officers are explicitly covered under SB 553), multi-employer worksite policy, and incident investigation.',
      templateLibraryCta: 'Browse security services templates',
    },
    automations: {
      intro:
        'Keep your program current automatically — client COI renewals, guard-card expiration sweeps, and Cal/OSHA regulatory updates.',
    },
  },
};
