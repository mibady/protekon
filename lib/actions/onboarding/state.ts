"use server"

/**
 * STUB — onboarding state machine.
 *
 * In the original app these hit Supabase (read `clients` row, count
 * preview totals, update `last_onboarding_step_completed`). Here they
 * return a canned success response so the UI can run without a DB.
 */

import { getOnboardingConfig } from "@/lib/onboarding/verticals"
import type {
  ActionResult,
  AdvanceStepResult,
  MarkCompleteResult,
  OnboardingState,
  OnboardingStepNumber,
} from "@/lib/types/onboarding"

function mockState(): OnboardingState {
  const config = getOnboardingConfig(null)
  return {
    currentStep: 0,
    completedSteps: [],
    skippedSteps: [],
    client: {
      id: "stub-client-id",
      vertical: null,
      operatingStates: [],
      workerCountRange: null,
      onboardingStatus: "not_started",
    },
    config,
    preview: {
      sitesCount: 0,
      workersCount: 0,
      thirdPartiesCount: 0,
      documentsCount: 0,
      postureScore: null,
    },
  }
}

export async function getOnboardingState(): Promise<ActionResult<OnboardingState>> {
  return { ok: true, data: mockState() }
}

export async function advanceStep(
  _step: OnboardingStepNumber,
  _skipped?: boolean,
): Promise<AdvanceStepResult> {
  return { ok: true, data: { state: mockState() } }
}

export async function markComplete(): Promise<MarkCompleteResult> {
  return { ok: true, data: { onboardedAt: new Date().toISOString() } }
}
