"use server"

import { createClient } from "@/lib/supabase/server"
import { getOnboardingConfig } from "@/lib/onboarding/verticals"
import type {
  ActionResult,
  AdvanceStepResult,
  MarkCompleteResult,
  OnboardingPreview,
  OnboardingState,
  OnboardingStateClient,
  OnboardingStepNumber,
  OnboardingStatus,
  VerticalSlug,
  WorkerCountRange,
} from "@/lib/types/onboarding"

type ClientRowSelection = {
  id: string
  vertical: string | null
  operating_states: string[] | null
  worker_count_range: string | null
  onboarding_status: string
  last_onboarding_step_completed: number
  compliance_score: number | null
}

function asStatus(value: string): OnboardingStatus {
  if (
    value === "not_started" ||
    value === "in_progress" ||
    value === "completed" ||
    value === "abandoned"
  ) {
    return value
  }
  return "not_started"
}

function asWorkerRange(value: string | null): WorkerCountRange | null {
  if (value === "1-10" || value === "11-50" || value === "51-200" || value === "200+") {
    return value
  }
  return null
}

function asStep(value: number): OnboardingStepNumber {
  if (value >= 0 && value <= 7) return value as OnboardingStepNumber
  return 0
}

/**
 * Load the current onboarding state for the authenticated user.
 * Batches the client row fetch + preview counts into parallel queries.
 */
export async function getOnboardingState(): Promise<ActionResult<OnboardingState>> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { ok: false, error: "unauthenticated" }
  }

  const { data: clientRow, error: clientErr } = await supabase
    .from("clients")
    .select(
      "id, vertical, operating_states, worker_count_range, onboarding_status, last_onboarding_step_completed, compliance_score",
    )
    .eq("id", user.id)
    .single<ClientRowSelection>()

  if (clientErr || !clientRow) {
    return { ok: false, error: "client_not_found" }
  }

  const vertical = (clientRow.vertical as VerticalSlug | null) ?? null
  const config = getOnboardingConfig(vertical)

  const clientId = clientRow.id
  const showThirdParties = config.stepVisibility.thirdParties

  const [
    { count: sitesCount },
    { count: workersCount },
    { count: documentsCount },
    thirdPartyResult,
  ] = await Promise.all([
    supabase.from("sites").select("id", { count: "exact", head: true }).eq("client_id", clientId),
    supabase.from("workers").select("id", { count: "exact", head: true }).eq("client_id", clientId),
    supabase.from("documents").select("id", { count: "exact", head: true }).eq("client_id", clientId),
    showThirdParties
      ? supabase
          .from("construction_subs")
          .select("id", { count: "exact", head: true })
          .eq("client_id", clientId)
      : Promise.resolve({ count: 0 as number | null }),
  ])

  const preview: OnboardingPreview = {
    sitesCount: sitesCount ?? 0,
    workersCount: workersCount ?? 0,
    thirdPartiesCount: thirdPartyResult.count ?? 0,
    documentsCount: documentsCount ?? 0,
    postureScore:
      clientRow.compliance_score === null || clientRow.compliance_score === 0
        ? null
        : clientRow.compliance_score,
  }

  const stateClient: OnboardingStateClient = {
    id: clientRow.id,
    vertical,
    operatingStates: clientRow.operating_states ?? [],
    workerCountRange: asWorkerRange(clientRow.worker_count_range),
    onboardingStatus: asStatus(clientRow.onboarding_status),
  }

  const completedThrough = asStep(clientRow.last_onboarding_step_completed)
  const completed: OnboardingStepNumber[] = []
  for (let i = 1; i <= completedThrough; i++) {
    completed.push(i as OnboardingStepNumber)
  }

  const state: OnboardingState = {
    currentStep: completedThrough >= 7 ? 7 : ((completedThrough + 1) as OnboardingStepNumber),
    completedSteps: completed,
    skippedSteps: [],
    client: stateClient,
    config,
    preview,
  }

  return { ok: true, data: state }
}

/**
 * Advance the onboarding cursor. Uses GREATEST semantics so a user who jumps
 * back and re-submits an earlier step does not regress progress.
 */
export async function advanceStep(
  step: OnboardingStepNumber,
): Promise<AdvanceStepResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, error: "unauthenticated" }
  }

  const { data: current } = await supabase
    .from("clients")
    .select("last_onboarding_step_completed")
    .eq("id", user.id)
    .single<{ last_onboarding_step_completed: number }>()

  const next = Math.max(current?.last_onboarding_step_completed ?? 0, step)

  const { error } = await supabase
    .from("clients")
    .update({
      last_onboarding_step_completed: next,
      onboarding_status: "in_progress",
    })
    .eq("id", user.id)

  if (error) {
    return { ok: false, error: error.message }
  }

  // Caller typically re-reads state after advancing; return it fresh.
  const refreshed = await getOnboardingState()
  if (!refreshed.ok) return refreshed
  return { ok: true, data: { state: refreshed.data } }
}

/**
 * Stamp onboarding completion. Called at the end of Step 7 or by the
 * partner-provisioned auto-skip in `app/onboarding/layout.tsx`.
 */
export async function markComplete(): Promise<MarkCompleteResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, error: "unauthenticated" }
  }

  const now = new Date().toISOString()
  const { error } = await supabase
    .from("clients")
    .update({
      onboarding_status: "completed",
      onboarded_at: now,
      last_onboarding_step_completed: 7,
    })
    .eq("id", user.id)

  if (error) {
    return { ok: false, error: error.message }
  }

  return { ok: true, data: { onboardedAt: now } }
}
