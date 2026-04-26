/**
 * Onboarding Wizard contract types.
 *
 * This file is the wire between the Backend Builder and Frontend Builder for
 * Phase 1A of the Onboarding Wizard. It imports the vertical config type
 * from `lib/onboarding/verticals/types.ts` and re-exports the minimum
 * surface needed by the wizard UI.
 *
 * Rule: types only — no runtime. Zod schemas validate inputs server-side
 * and should derive from these types.
 */

import type {
  OnboardingVerticalConfig,
  VerticalSlug,
} from '@/lib/onboarding/verticals/types';

// ---------------------------------------------------------------------------
// Core enums
// ---------------------------------------------------------------------------

/** Step 0 = not started, Step 7 = launched (terminal). */
export type OnboardingStepNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type OnboardingStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'abandoned';

/** Matches the CHECK constraint on `clients.worker_count_range` (migration 051). */
export type WorkerCountRange = '1-10' | '11-50' | '51-200' | '200+';

/** Role enum used by `user_roles` (migration 047). */
export type TeamMemberRole =
  | 'owner'
  | 'compliance_manager'
  | 'field_lead'
  | 'auditor';

// ---------------------------------------------------------------------------
// ClientOnboardingRow — the fields the wizard reads from `clients`
// ---------------------------------------------------------------------------

/**
 * Minimum `clients` row shape used by the wizard. Fields added by migration
 * 051 plus pre-existing `id` / `vertical`.
 */
export type ClientOnboardingRow = {
  id: string;
  plan: string;
  vertical: VerticalSlug | null;
  operating_states: string[];
  worker_count_range: WorkerCountRange | null;
  onboarding_status: OnboardingStatus;
  last_onboarding_step_completed: number;
  vertical_metadata: Record<string, unknown>;
  onboarded_at: string | null;
};

// ---------------------------------------------------------------------------
// OnboardingState — returned by getOnboardingState()
// ---------------------------------------------------------------------------

export type OnboardingPreview = {
  sitesCount: number;
  workersCount: number;
  thirdPartiesCount: number;
  documentsCount: number;
  /** Null until Step 6 completes. */
  postureScore: number | null;
};

export type OnboardingStateClient = {
  id: string;
  plan: string;
  vertical: VerticalSlug | null;
  operatingStates: string[];
  workerCountRange: WorkerCountRange | null;
  onboardingStatus: OnboardingStatus;
};

export type OnboardingState = {
  /** Current step (0-7). */
  currentStep: OnboardingStepNumber;
  completedSteps: OnboardingStepNumber[];
  skippedSteps: OnboardingStepNumber[];
  client: OnboardingStateClient;
  /** Resolved via `getOnboardingConfig(client.vertical)`. */
  config: OnboardingVerticalConfig;
  preview: OnboardingPreview;
};

// ---------------------------------------------------------------------------
// Server-action input / result types
// ---------------------------------------------------------------------------

/** Generic success/failure envelope used by every server action. */
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

// --- Step 1: business snapshot --------------------------------------------

export type BusinessSnapshotInput = {
  vertical: VerticalSlug;
  operatingStates: string[];
  workerCountRange: WorkerCountRange;
};

export type BusinessSnapshotResult = ActionResult<{
  clientId: string;
  nextStep: OnboardingStepNumber;
}>;

// --- Step 2: connect tools (stub) -----------------------------------------

/** Keys map to the canonical provider strings in `lib/onboarding/integration-providers.ts`. */
export type IntegrationProviderKey =
  | 'gmail'
  | 'outlook'
  | 'google_drive'
  | 'onedrive'
  | 'dropbox'
  | 'quickbooks'
  | 'sage_intacct'
  | 'foundation'
  | 'mycoi'
  | 'evident'
  | 'procore'
  | 'billy';

export type ToolIntentInput = {
  providerKey: IntegrationProviderKey;
};

export type ToolIntentResult = ActionResult<{
  integrationId: string;
}>;

// --- Step 3: sites --------------------------------------------------------

/**
 * Upsert payload for a single site. `id` is optional — omitted for new rows,
 * present for updates.
 */
export type SiteUpsertInput = {
  id?: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  employeeCount: number | null;
  isPrimary: boolean;
};

export type UpsertSitesInput = {
  sites: SiteUpsertInput[];
};

export type UpsertSitesResult = ActionResult<{
  siteIds: string[];
  primarySiteId: string | null;
}>;

// --- Step 4: people (workers + team members) ------------------------------

export type WorkerImportRow = {
  id?: string;
  name: string;
  role: string | null;
  hireDate: string | null;
  phone: string | null;
  email: string | null;
  siteId: string | null;
};

export type ImportWorkersInput = {
  workers: WorkerImportRow[];
};

export type ImportWorkersResult = ActionResult<{
  workerIds: string[];
  createdCount: number;
  updatedCount: number;
}>;

export type InviteTeamMemberInput = {
  email: string;
  role: TeamMemberRole;
};

export type InviteTeamMemberResult = ActionResult<{
  inviteTokenId: string;
  /** Null when the invitee already has an account — they are activated directly. */
  magicLinkSent: boolean;
}>;

// --- Step 5: third parties (gated to verticals with stepVisibility.thirdParties) ---

export type ThirdPartyRecordInput = {
  id?: string;
  name: string;
  classification: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  tradeOrCategory: string | null;
};

export type UpsertThirdPartiesInput = {
  records: ThirdPartyRecordInput[];
};

export type UpsertThirdPartiesResult = ActionResult<{
  recordIds: string[];
}>;

export type RequestOnboardingPacketInput = {
  thirdPartyId: string;
};

export type RequestOnboardingPacketResult = ActionResult<{
  tokenId: string;
}>;

export type SendThirdPartyPacketsInput = {
  records: Array<{
    id?: string;
    name: string;
    contactEmail: string;
  }>;
};

export type SendThirdPartyPacketsResult = ActionResult<{
  queued: Array<{
    thirdPartyId: string;
    tokenId: string;
  }>;
}>;

// --- Step 6: documents ----------------------------------------------------

export type ApproveImportedDocumentInput = { documentId: string };
export type AdoptTemplateInput = { category: string };
export type MarkDocumentSkippedInput = { category: string; reason?: string };

export type DocumentStepActionResult = ActionResult<{
  documentId: string | null;
  category: string;
}>;

// --- Step 7: automations --------------------------------------------------

export type AutomationToggles = {
  expirationSweep: boolean;
  regulatoryAlerts: boolean;
  thirdPartyCoiRequests: boolean;
};

export type ConfigureAutomationsInput = {
  toggles: AutomationToggles;
};

export type ConfigureAutomationsResult = ActionResult<{
  verticalMetadata: Record<string, unknown>;
}>;

export type ScheduledAction = {
  kind: 'drill' | 'audit' | 'training' | 'review';
  label: string;
  dueAt: string;
};

export type ScheduleInitialActionsInput = {
  actions: ScheduledAction[];
};

export type ScheduleInitialActionsResult = ActionResult<{
  scheduledIds: string[];
}>;

// --- State machine --------------------------------------------------------

export type AdvanceStepInput = {
  step: OnboardingStepNumber;
  skipped?: boolean;
};

export type AdvanceStepResult = ActionResult<{
  state: OnboardingState;
}>;

export type MarkCompleteResult = ActionResult<{
  onboardedAt: string;
}>;

// ---------------------------------------------------------------------------
// Re-exports for consumer ergonomics
// ---------------------------------------------------------------------------

export type { OnboardingVerticalConfig, VerticalSlug };
