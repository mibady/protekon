"use server"

import { z } from "zod"

import { createClient } from "@/lib/supabase/server"
import { inngest } from "@/inngest/client"
import type {
  ConfigureAutomationsInput,
  ConfigureAutomationsResult,
  ScheduleInitialActionsInput,
  ScheduleInitialActionsResult,
} from "@/lib/types/onboarding"

const togglesSchema = z.object({
  expirationSweep: z.boolean(),
  regulatoryAlerts: z.boolean(),
  thirdPartyCoiRequests: z.boolean(),
})

const configureSchema = z.object({
  toggles: togglesSchema,
})

const scheduledActionSchema = z.object({
  kind: z.enum(["drill", "audit", "training", "review"]),
  label: z.string().min(1).max(200),
  dueAt: z.string().datetime(),
})

const scheduleSchema = z.object({
  actions: z.array(scheduledActionSchema).min(0).max(20),
})

type ClientMetadataSelection = {
  vertical_metadata: Record<string, unknown> | null
}

type ScheduledRowSelection = { id: string }

function mergeAutomations(
  existing: Record<string, unknown> | null | undefined,
  automations: Record<string, boolean>,
): Record<string, unknown> {
  const base = existing && typeof existing === "object" ? { ...existing } : {}
  base.automations = automations
  return base
}

/**
 * Step 7 (toggles half). Writes the three automation booleans to
 * `clients.vertical_metadata.automations`. The Inngest event
 * `onboarding/automations.configured` drives the durable finalize flow,
 * which is where `compliance/intake.submitted` actually fires — keeping
 * the end-of-wizard work retryable.
 */
export async function configureAutomations(
  input: ConfigureAutomationsInput,
): Promise<ConfigureAutomationsResult> {
  const parsed = configureSchema.safeParse(input)
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

  const { data: existing } = await supabase
    .from("clients")
    .select("vertical_metadata")
    .eq("id", user.id)
    .single<ClientMetadataSelection>()

  const automations = {
    expirationSweep: parsed.data.toggles.expirationSweep,
    regulatoryAlerts: parsed.data.toggles.regulatoryAlerts,
    thirdPartyCoiRequests: parsed.data.toggles.thirdPartyCoiRequests,
  }

  const merged = mergeAutomations(existing?.vertical_metadata, automations)

  const { error } = await supabase
    .from("clients")
    .update({ vertical_metadata: merged })
    .eq("id", user.id)

  if (error) {
    return { ok: false, error: error.message }
  }

  await inngest.send({
    name: "onboarding/automations.configured",
    data: { clientId: user.id, automations },
  })

  return { ok: true, data: { verticalMetadata: merged } }
}

/**
 * Step 7 (scheduled-actions half). Best-effort insert into
 * `scheduled_deliveries` for each action. If the delivery_type isn't one the
 * table expects, the row still persists (column is free text). Phase 2 will
 * wire these into the reminder/drill pipelines.
 */
export async function scheduleInitialActions(
  input: ScheduleInitialActionsInput,
): Promise<ScheduleInitialActionsResult> {
  const parsed = scheduleSchema.safeParse(input)
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

  if (parsed.data.actions.length === 0) {
    return { ok: true, data: { scheduledIds: [] } }
  }

  const rows = parsed.data.actions.map((a) => ({
    client_id: user.id,
    delivery_type: `onboarding_${a.kind}`,
    frequency: "once",
    next_delivery_date: a.dueAt.slice(0, 10),
    status: "scheduled",
  }))

  const { data: inserted, error } = await supabase
    .from("scheduled_deliveries")
    .insert(rows)
    .select("id")
    .returns<ScheduledRowSelection[]>()

  if (error || !inserted) {
    // Fallback: persist in vertical_metadata if table shape/RLS rejects us.
    const { data: existing } = await supabase
      .from("clients")
      .select("vertical_metadata")
      .eq("id", user.id)
      .single<ClientMetadataSelection>()

    const base =
      existing?.vertical_metadata && typeof existing.vertical_metadata === "object"
        ? { ...existing.vertical_metadata }
        : {}
    base.scheduled_actions = parsed.data.actions

    const { error: fallbackErr } = await supabase
      .from("clients")
      .update({ vertical_metadata: base })
      .eq("id", user.id)

    if (fallbackErr) {
      return { ok: false, error: fallbackErr.message }
    }

    return { ok: true, data: { scheduledIds: [] } }
  }

  return { ok: true, data: { scheduledIds: inserted.map((r) => r.id) } }
}
