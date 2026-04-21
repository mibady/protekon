"use server"

import { z } from "zod"

import { createClient } from "@/lib/supabase/server"
import { inngest } from "@/inngest/client"
import type {
  ActionResult,
  SiteUpsertInput,
  UpsertSitesInput,
  UpsertSitesResult,
} from "@/lib/types/onboarding"

const siteSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Site name required"),
  address: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().length(2).nullable(),
  zip: z.string().nullable(),
  employeeCount: z.number().int().nonnegative().nullable(),
  isPrimary: z.boolean(),
})

const payloadSchema = z.object({
  sites: z.array(siteSchema).min(1, "At least one site is required"),
})

type SiteRowSelection = {
  id: string
  is_primary: boolean
}

/**
 * Coerce the primary-flag invariant: exactly one site is primary per client.
 *
 * Rule precedence:
 *   1. If any incoming row sets `isPrimary=true`, the LAST such row wins;
 *      earlier primaries (incoming and persisted) are demoted.
 *   2. If no incoming row is primary AND the client has no persisted sites,
 *      the first incoming row is promoted.
 *   3. If no incoming row is primary AND a persisted primary already exists,
 *      leave the persisted primary untouched.
 */
function normalizePrimaryFlags(
  sites: SiteUpsertInput[],
  hasExistingPrimary: boolean,
): SiteUpsertInput[] {
  const normalized = sites.map((s) => ({ ...s }))
  const primaryIndexes = normalized
    .map((s, i) => (s.isPrimary ? i : -1))
    .filter((i) => i >= 0)

  if (primaryIndexes.length === 0) {
    if (!hasExistingPrimary && normalized.length > 0) {
      normalized[0].isPrimary = true
    }
    return normalized
  }

  const keepIdx = primaryIndexes[primaryIndexes.length - 1]
  for (let i = 0; i < normalized.length; i++) {
    normalized[i].isPrimary = i === keepIdx
  }
  return normalized
}

/**
 * Step 3: upsert site records for the authenticated client. Enforces the
 * single-primary invariant (see `normalizePrimaryFlags`).
 */
export async function upsertSites(
  input: UpsertSitesInput,
): Promise<UpsertSitesResult> {
  const parsed = payloadSchema.safeParse(input)
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

  const { data: existing, error: readErr } = await supabase
    .from("sites")
    .select("id, is_primary")
    .eq("client_id", user.id)
    .returns<SiteRowSelection[]>()

  if (readErr) {
    return { ok: false, error: readErr.message }
  }

  const hasExistingPrimary = (existing ?? []).some((r) => r.is_primary)
  const normalized = normalizePrimaryFlags(parsed.data.sites, hasExistingPrimary)

  const incomingPrimary = normalized.some((s) => s.isPrimary)
  if (incomingPrimary) {
    const { error: demoteErr } = await supabase
      .from("sites")
      .update({ is_primary: false })
      .eq("client_id", user.id)
      .eq("is_primary", true)
    if (demoteErr) {
      return { ok: false, error: demoteErr.message }
    }
  }

  const rows = normalized.map((s) => ({
    id: s.id,
    client_id: user.id,
    name: s.name,
    address: s.address,
    city: s.city,
    state: s.state,
    zip: s.zip,
    employee_count: s.employeeCount,
    is_primary: s.isPrimary,
  }))

  const { data: upserted, error: upsertErr } = await supabase
    .from("sites")
    .upsert(rows, { onConflict: "id" })
    .select("id, is_primary")
    .returns<SiteRowSelection[]>()

  if (upsertErr || !upserted) {
    return { ok: false, error: upsertErr?.message ?? "upsert_failed" }
  }

  const siteIds = upserted.map((r) => r.id)
  const primaryRow = upserted.find((r) => r.is_primary) ?? null

  await inngest.send({
    name: "onboarding/sites.submitted",
    data: { clientId: user.id, siteIds },
  })

  return {
    ok: true,
    data: {
      siteIds,
      primarySiteId: primaryRow?.id ?? null,
    },
  }
}

/**
 * Delete a site owned by the authenticated client. RLS restricts the row to
 * client-owned sites; we add an explicit `client_id` filter for defence-in-depth.
 */
export async function deleteSite(id: string): Promise<ActionResult> {
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

  const { error } = await supabase
    .from("sites")
    .delete()
    .eq("id", id)
    .eq("client_id", user.id)

  if (error) {
    return { ok: false, error: error.message }
  }

  return { ok: true, data: undefined }
}
