import type { OnboardingVerticalConfig } from './types';

/**
 * Waste management & environmental services vertical onboarding config.
 *
 * Tier 1 (Very High risk) — RCRA contingency planning, HAZWOPER training,
 * and DOT HazMat transport overlap for landfills, transfer stations, and
 * recycling centers. Doc IDs from `lib/document-templates.ts`
 * (`hazwoper-program` covers emergency response for hazardous-waste sites).
 *
 * Third-party management is ON — haulers and disposal subs flow through
 * Step 5 and get COI + manifest tracking from automation.
 */
export const WASTE_ENVIRONMENTAL_CONFIG: OnboardingVerticalConfig = {
  slug: 'waste_environmental',
  label: 'Waste Management & Environmental Services',
  peopleTerminology: {
    worker: 'Handler',
    team: 'Crew',
    thirdParty: 'Hauler',
  },
  stepVisibility: {
    sites: true,
    thirdParties: true,
  },
  requiredDocCategories: [
    'iipp',
    'hazcom',
    'hazwoper-program',
    'respiratory-protection-program',
    'eap',
  ],
  recommendedDocCategories: [
    'wvpp',
    'heat-illness-prevention',
    'hearing-conservation',
    'confined-space-program',
    'fleet-safety-program',
  ],
  automations: {
    expirationSweep: true,
    regulatoryAlerts: true,
    thirdPartyCoiRequests: true,
  },
  stepCopy: {
    businessSnapshot: {
      intro:
        'Tell us about your waste or environmental services operation so we can tune your RCRA and Cal/OSHA compliance program.',
      workerCountLabel: 'How many handlers and drivers are on your crews?',
    },
    sites: {
      intro: 'Add each landfill, transfer station, or recycling facility.',
      addButtonLabel: 'Add facility',
    },
    people: {
      intro: 'Bring your handlers, drivers, and site supervisors into Protekon.',
      workerImportHelp:
        'Upload a CSV of your workforce. We track HAZWOPER certifications and DOT HazMat endorsements separately.',
    },
    thirdParties: {
      intro: 'Add the haulers and disposal partners you work with.',
      classificationHelp:
        'Classify each hauler by waste stream so we know which COIs, DOT registrations, and manifest agreements to request.',
    },
    documents: {
      intro:
        'These are the written programs the EPA, DOT, and Cal/OSHA expect for hazardous-waste operations — including contingency plans and emergency response for spill events.',
      templateLibraryCta: 'Browse waste & environmental templates',
    },
    automations: {
      intro:
        'Keep your program current automatically — HAZWOPER refreshers, RCRA reg updates, and hauler COI requests.',
    },
  },
};
