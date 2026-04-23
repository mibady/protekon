import type { OnboardingVerticalConfig } from './types';

/**
 * Equipment repair vertical onboarding config.
 *
 * Tier 2 (High risk) — LOTO (lockout/tagout) and machine guarding are the
 * primary Cal/OSHA exposures for shops servicing industrial, commercial, and
 * agricultural equipment. Doc IDs from `lib/document-templates.ts`.
 *
 * Third-party management is OFF — repair shops typically operate as the
 * sole service provider; suppliers are tracked separately outside Step 5.
 */
export const EQUIPMENT_REPAIR_CONFIG: OnboardingVerticalConfig = {
  slug: 'equipment_repair',
  label: 'Equipment Repair & Service',
  peopleTerminology: {
    worker: 'Technician',
    team: 'Shop',
    thirdParty: 'Supplier',
  },
  stepVisibility: {
    sites: true,
    thirdParties: false,
  },
  requiredDocCategories: [
    'iipp',
    'hazcom',
    'loto-program',
    'machine-guarding',
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
        'Tell us about your equipment repair operation so we can tune your Cal/OSHA compliance program.',
      workerCountLabel: 'How many technicians work in your shop?',
    },
    sites: {
      intro: 'Add each repair shop or service location.',
      addButtonLabel: 'Add shop location',
    },
    people: {
      intro: 'Bring your technicians, shop leads, and service managers into Protekon.',
      workerImportHelp:
        'Upload a CSV of your workforce or add technicians one at a time. We track LOTO authorization and machine-guarding training status.',
    },
    documents: {
      intro:
        'These are the written programs Cal/OSHA expects for equipment repair — including lockout/tagout procedures, machine guarding standards, and hazard communication for shop chemicals.',
      templateLibraryCta: 'Browse equipment repair templates',
    },
    automations: {
      intro:
        'Keep your program current automatically — LOTO reauthorization reminders, machine inspection schedules, and Cal/OSHA regulatory updates.',
    },
  },
};
