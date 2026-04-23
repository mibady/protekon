import type { OnboardingVerticalConfig } from './types';

/**
 * Mining vertical onboarding config.
 *
 * Tier 1 (Very High risk) — MSHA enforcement, Permit-to-Work systems, and
 * dust/silica/noise exposure controls are load-bearing. Doc IDs from
 * `lib/document-templates.ts` (`msha-mining-safety-program` is mining-
 * specific; the rest are platform-wide).
 *
 * Third-party management is ON — haulers, drilling contractors, and blasting
 * subs flow through Step 5 and get COI requests from the automation sweep.
 */
export const MINING_CONFIG: OnboardingVerticalConfig = {
  slug: 'mining',
  label: 'Mining & Extraction',
  peopleTerminology: {
    worker: 'Miner',
    team: 'Crew',
    thirdParty: 'Contractor',
  },
  stepVisibility: {
    sites: true,
    thirdParties: true,
  },
  requiredDocCategories: [
    'iipp',
    'hazcom',
    'msha-mining-safety-program',
    'respiratory-protection-program',
    'hearing-conservation',
    'silica-exposure-control',
  ],
  recommendedDocCategories: [
    'wvpp',
    'confined-space-program',
    'fall-protection-plan',
    'electrical-safety-program',
    'eap',
  ],
  automations: {
    expirationSweep: true,
    regulatoryAlerts: true,
    thirdPartyCoiRequests: true,
  },
  stepCopy: {
    businessSnapshot: {
      intro:
        'Tell us about your mining operation so we can tune your MSHA and Cal/OSHA compliance program.',
      workerCountLabel: 'How many miners are on your crews?',
    },
    sites: {
      intro: 'Add each active mine, quarry, or pit.',
      addButtonLabel: 'Add mine site',
    },
    people: {
      intro: 'Bring your miners, equipment operators, and site supervisors into Protekon.',
      workerImportHelp:
        'Upload a CSV of your workforce or add miners one at a time. We track MSHA Part 46/48 training status.',
    },
    thirdParties: {
      intro: 'Add the contractors who work on your sites — haulers, drillers, blasters, and specialty trades.',
      classificationHelp:
        'Classify each contractor by scope so we know which COIs, Part 46 training proofs, and permit documentation to request.',
    },
    documents: {
      intro:
        'These are the written programs MSHA and Cal/OSHA expect for extractive operations — including hazard communication and exposure controls for silica, respirable dust, and noise.',
      templateLibraryCta: 'Browse mining templates',
    },
    automations: {
      intro:
        'Keep your program current automatically — training expirations, MSHA reg updates, and contractor COI requests.',
    },
  },
};
