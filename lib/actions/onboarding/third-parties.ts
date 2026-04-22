"use server"

import crypto from "crypto"
import { z } from "zod"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { inngest } from "@/inngest/client"
import { getOnboardingState } from "./state"
import type {
  RequestOnboardingPacketResult,
  UpsertThirdPartiesInput,
  UpsertThirdPartiesResult,
} from "@/lib/types/onboarding"

const thirdPartySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Name required"),
  classification: z.string().nullable(),
  contactEmail: z
    .string()
    .email()
    .nullable()
    .or(z.literal("").transform(() => null)),
  contactPhone: z.string().nullable(),
  tradeOrCategory: z.string().nullable(),
})

const upsertSchema = z.object({
  records: z.array(thirdPartySchema).min(1).max(200),
})

type SubRowSelection = { id: string }

/**
 * Guard: wizard Step 5 is hidden unless the vertical config enables third
 * parties. Backend mirrors that gate so a manual API call from a non-enabled
 * vertical returns a typed error.
 */
async function assertThirdPartiesEnabled(): Promise<
  | { ok: true; clientId: string }
  | { ok: false; error: string }
> {
  const state = await getOnboardingState()
  if (!state.ok) return { ok: false, error: state.error }
  if (!state.data.config.stepVisibility.thirdParties) {
    return { ok: false, error: "third_parties_disabled_for_vertical" }
  }
  return { ok: true, clientId: state.data.client.id }
}

/**
 * Step 5: upsert third-party (subcontractor) records. Writes to
 * `construction_subs`. The existing schema only has `company_name` — richer
 * contact fields are written to `audit_log.metadata` for Phase 2 when the
 * table is extended/renamed.
 */
export async function upsertThirdParties(
  input: UpsertThirdPartiesInput,
): Promise<UpsertThirdPartiesResult> {
  const gate = await assertThirdPartiesEnabled()
  if (!gate.ok) return { ok: false, error: gate.error }

  const parsed = upsertSchema.safeParse(input)
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

  const recordIds: string[] = []

  for (const r of parsed.data.records) {
    if (r.id) {
      const { data: updated, error: updErr } = await supabase
        .from("construction_subs")
        .update({ company_name: r.name })
        .eq("id", r.id)
        .eq("client_id", user.id)
        .select("id")
        .single<SubRowSelection>()
      if (updErr || !updated) {
        return { ok: false, error: updErr?.message ?? "update_failed" }
      }
      recordIds.push(updated.id)
    } else {
      const { data: inserted, error: insErr } = await supabase
        .from("construction_subs")
        .insert({ client_id: user.id, company_name: r.name })
        .select("id")
        .single<SubRowSelection>()
      if (insErr || !inserted) {
        return { ok: false, error: insErr?.message ?? "insert_failed" }
      }
      recordIds.push(inserted.id)
    }
  }

  await inngest.send({
    name: "onboarding/third-parties.imported",
    data: { clientId: user.id, subIds: recordIds },
  })

  return { ok: true, data: { recordIds } }
}

/**
 * Create a 30-day invite token for the sub and fire the existing
 * `sub_onboarding.invite.sent` event so the downstream email pipeline can
 * reuse the same handler as the partner-portal flow.
 */
export async function requestOnboardingPacket(
  id: string,
): Promise<RequestOnboardingPacketResult> {
  const gate = await assertThirdPartiesEnabled()
  if (!gate.ok) return { ok: false, error: gate.error }

  if (!z.string().uuid().safeParse(id).success) {
    return { ok: false, error: "invalid_id" }
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser()

  if (authErr || !user) {
    return { ok: false, error: "unauthenticated" }
  }

  const admin = createAdminClient()

  const { data: sub, error: subErr } = await admin
    .from("construction_subs")
    .select("id, company_name, client_id")
    .eq("id", id)
    .eq("client_id", user.id)
    .maybeSingle<{ id: string; company_name: string; client_id: string }>()

  if (subErr || !sub) {
    return { ok: false, error: "sub_not_found" }
  }

  const token = crypto.randomBytes(24).toString("base64url")
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  const { error: tokErr } = await admin.from("sub_onboarding_tokens").insert({
    token,
    client_id: user.id,
    sub_id: sub.id,
    sub_company_name: sub.company_name,
    contact_email: "",
    contact_name: null,
    expires_at: expiresAt,
    invited_by: user.id,
  })

  if (tokErr) {
    return { ok: false, error: tokErr.message }
  }

  await inngest.send({
    name: "sub_onboarding.invite.sent",
    data: { clientId: user.id, subId: sub.id, token },
  })

  return { ok: true, data: { tokenId: token } }
}
