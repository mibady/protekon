import type { OnboardingVerticalConfig } from './types';

/**
 * Education vertical onboarding config.
 *
 * Tier 3 (Moderate risk) — campus safety planning, bloodborne pathogen
 * exposure (nursing offices, athletic trainers, custodial blood-cleanup),
 * and SB 553 workplace violence prevention are the primary Cal/OSHA
 * exposures. Doc IDs from `lib/document-templates.ts`.
 *
 * Third-party management is OFF — K-12 and higher-ed operations primarily
 * use in-house staff; food-service and custodial contractors tracked
 * outside the onboarding wizard.
 */
export const EDUCATION_CONFIG: OnboardingVerticalConfig = {
  slug: 'education',
  label: 'Education',
  peopleTerminology: {
    worker: 'Staff Member',
    team: 'Faculty & Staff',
    thirdParty: 'Contractor',
  },
  stepVisibility: {
    sites: true,
    thirdParties: false,
  },
  requiredDocCategories: [
    'iipp',
    'wvpp',
    'hazcom',
    'campus-safety-plan',
  ],
  recommendedDocCategories: [
    'bbp-exposure-control',
    'eap',
    'ergonomics-program',
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
        'Tell us about your school, district, or campus so we can tune your Cal/OSHA compliance program — including campus safety planning and SB 553 workplace violence prevention.',
      workerCountLabel: 'How many faculty and staff work across your campuses?',
    },
    sites: {
      intro: 'Add each campus, school site, or administrative location.',
      addButtonLabel: 'Add campus',
    },
    people: {
      intro: 'Bring your teachers, administrators, support staff, and facilities team into Protekon.',
      workerImportHelp:
        'Upload a CSV of your workforce or add staff one at a time. We track WVPP training, BBP certifications, and campus-specific safety acknowledgments.',
    },
    documents: {
      intro:
        'These are the written programs Cal/OSHA expects for educational institutions — including campus safety planning, workplace violence prevention, and bloodborne pathogen controls for nursing and athletic staff.',
      templateLibraryCta: 'Browse education templates',
    },
    automations: {
      intro:
        'Keep your program current automatically — campus safety plan reviews, WVPP annual updates, and Cal/OSHA regulatory changes.',
    },
  },
};
