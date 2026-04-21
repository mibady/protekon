"use server"

import { z } from "zod"

import { createClient } from "@/lib/supabase/server"
import { inngest } from "@/inngest/client"
import { getOnboardingState } from "./state"
import type {
  BusinessSnapshotInput,
  BusinessSnapshotResult,
  VerticalSlug,
  WorkerCountRange,
} from "@/lib/types/onboarding"

const US_STATE_CODES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN",
  "IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH",
  "NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT",
  "VT","VA","WA","WV","WI","WY",
] as const

const WORKER_RANGES = ["1-10", "11-50", "51-200", "200+"] as const

const snapshotSchema = z.object({
  vertical: z.string().min(1),
  operatingStates: z
    .array(z.enum(US_STATE_CODES))
    .min(1, "Select at least one state")
    .max(US_STATE_CODES.length),
  workerCountRange: z.enum(WORKER_RANGES),
})

/**
 * Step 1 of the onboarding wizard. Validates against the canonical
 * `public.verticals` lookup (fail-closed) before updating clients and firing
 * the prebuild-context Inngest event.
 */
export async function submitBusinessSnapshot(
  input: BusinessSnapshotInput,
): Promise<BusinessSnapshotResult> {
  const parsed = snapshotSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "invalid_input" }
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser()

  if (authErr || !user) {
    return { ok: false, error: "unauthenticated" }
  }

  // Fail-closed: verify vertical exists in the lookup. Blocks bad slugs even
  // if the TypeScript union drifts from the DB.
  const { data: verticalRow, error: vertErr } = await supabase
    .from("verticals")
    .select("slug, alias_of")
    .eq("slug", parsed.data.vertical)
    .maybeSingle<{ slug: string; alias_of: string | null }>()

  if (vertErr || !verticalRow) {
    return { ok: false, error: "unknown_vertical" }
  }

  // Resolve alias → canonical (logistics → wholesale).
  const canonical = (verticalRow.alias_of ?? verticalRow.slug) as VerticalSlug

  const { error: updateErr } = await supabase
    .from("clients")
    .update({
      vertical: canonical,
      operating_states: parsed.data.operatingStates,
      worker_count_range: parsed.data.workerCountRange as WorkerCountRange,
      onboarding_status: "in_progress",
      last_onboarding_step_completed: 1,
    })
    .eq("id", user.id)

  if (updateErr) {
    return { ok: false, error: updateErr.message }
  }

  await inngest.send({
    name: "onboarding/business.snapshot.submitted",
    data: {
      clientId: user.id,
      vertical: canonical,
      operatingStates: parsed.data.operatingStates,
    },
  })

  const refreshed = await getOnboardingState()
  if (!refreshed.ok) {
    return { ok: false, error: refreshed.error }
  }

  return {
    ok: true,
    data: {
      clientId: user.id,
      nextStep: 2,
    },
  }
}
