import type { OnboardingVerticalConfig } from './types';

/**
 * Safe fallback config applied to any vertical that hasn't been specifically
 * configured. The empty `requiredDocCategories` array is intentional — we
 * refuse to fabricate compliance requirements we haven't researched. Each
 * unconfigured vertical will get a follow-up ticket to replace this default.
 *
 * See `docs/TEMPLATE-ARCHITECTURE.md` for the canonical doc-category source
 * (`lib/document-templates.ts`).
 */
export const DEFAULT_CONFIG: OnboardingVerticalConfig = {
  slug: 'default',
  label: 'General',
  peopleTerminology: {
    worker: 'Team Member',
    team: 'Team',
    thirdParty: null,
  },
  stepVisibility: {
    sites: true,
    thirdParties: false,
  },
  requiredDocCategories: [],
  recommendedDocCategories: [
    'iipp',
    'wvpp',
    'hazcom',
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
        'Tell us about your business so we can tailor your compliance setup.',
      workerCountLabel: 'How many team members do you have?',
    },
    sites: {
      intro: 'Add the locations where your team operates.',
      addButtonLabel: 'Add location',
    },
    people: {
      intro: 'Bring your team into Protekon.',
      workerImportHelp:
        'Upload a CSV of team members or add them one at a time.',
    },
    documents: {
      intro: 'Pick the policies and plans your business needs.',
      templateLibraryCta: 'Browse template library',
    },
    automations: {
      intro: 'Choose the automations you want Protekon to run on your behalf.',
    },
  },
};
