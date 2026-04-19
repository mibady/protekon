"use server"

import crypto from "crypto"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requirePaidAuth } from "@/lib/billing-guard"

// ============================================================
// Types
// ============================================================

export type AckCampaign = {
  id: string
  policy_document_id: string
  policy_version: string
  cohort_note: string | null
  due_date: string | null
  created_at: string
  signed_count: number
  total_count: number
}

export type CreateCampaignInput = {
  policyDocumentId: string
  policyVersion: string
  cohortNote?: string
  dueDate?: string // ISO string
  assignees: Array<{ name: string; email?: string }>
}

export type CreateCampaignResult = {
  success?: boolean
  error?: string
  requestId?: string
  tokenUrls?: string[] // each like /ack/<token>
}

export type CampaignStatus = {
  total: number
  signed: number
  pending: number
}

// ============================================================
// Actions
// ============================================================

/**
 * Creates a new acknowledgment campaign + single-use tokens for each assignee.
 * Tokens expire in 30 days.
 *
 * Gated behind requirePaidAuth — campaigns are a billable primitive.
 */
export async function createAckCampaign(
  input: CreateCampaignInput
): Promise<CreateCampaignResult> {
  const auth = await requirePaidAuth()
  if (auth.error) return { error: auth.message }
  const clientId = auth.clientId

  if (!input.assignees || input.assignees.length === 0) {
    return { error: "At least one assignee is required." }
  }

  const admin = createAdminClient()

  // Insert the campaign request
  const { data: request, error: reqErr } = await admin
    .from("acknowledgment_requests")
    .insert({
      client_id: clientId,
      policy_document_id: input.policyDocumentId,
      policy_version: input.policyVersion,
      cohort_note: input.cohortNote ?? null,
      due_date: input.dueDate ?? null,
    })
    .select("id")
    .single()

  if (reqErr || !request) {
    return { error: reqErr?.message ?? "Could not create campaign." }
  }

  // Generate tokens (30-day expiry)
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  const tokenRows = input.assignees.map((a) => ({
    token: crypto.randomBytes(24).toString("base64url"),
    request_id: request.id,
    assigned_to: a.email ? `${a.name} <${a.email}>` : a.name,
    expires_at: expires,
  }))

  const { error: tokErr } = await admin
    .from("acknowledgment_tokens")
    .insert(tokenRows)

  if (tokErr) {
    // Best-effort rollback
    await admin.from("acknowledgment_requests").delete().eq("id", request.id)
    return { error: tokErr.message }
  }

  // Audit log
  await admin.from("audit_log").insert({
    client_id: clientId,
    event_type: "acknowledgment_campaign.created",
    description: `Created ack campaign for policy ${input.policyVersion} with ${input.assignees.length} assignee(s)`,
    metadata: {
      request_id: request.id,
      policy_document_id: input.policyDocumentId,
      policy_version: input.policyVersion,
      assignee_count: input.assignees.length,
    },
  })

  return {
    success: true,
    requestId: request.id,
    tokenUrls: tokenRows.map((t) => `/ack/${t.token}`),
  }
}

/**
 * Lists ack campaigns for the current client with signed/total counts.
 * Read path — uses the authed supabase client (respects RLS).
 */
export async function listCampaigns(): Promise<AckCampaign[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data: requests, error } = await supabase
    .from("acknowledgment_requests")
    .select("id, policy_document_id, policy_version, cohort_note, due_date, created_at")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })

  if (error || !requests) return []

  // Counts require the tokens table which is deny-all to authenticated;
  // use admin client for aggregation only (no row data returned to caller).
  const admin = createAdminClient()
  const campaigns: AckCampaign[] = []
  for (const r of requests) {
    const { count: totalCount } = await admin
      .from("acknowledgment_tokens")
      .select("token", { count: "exact", head: true })
      .eq("request_id", r.id)

    const { count: signedCount } = await admin
      .from("acknowledgments")
      .select("id", { count: "exact", head: true })
      .eq("request_id", r.id)

    campaigns.push({
      id: r.id,
      policy_document_id: r.policy_document_id,
      policy_version: r.policy_version,
      cohort_note: r.cohort_note,
      due_date: r.due_date,
      created_at: r.created_at,
      total_count: totalCount ?? 0,
      signed_count: signedCount ?? 0,
    })
  }
  return campaigns
}

/**
 * Returns counts for a single campaign. Admin client used for token counts
 * because the tokens table denies all authenticated access.
 */
export async function getCampaignStatus(
  requestId: string
): Promise<CampaignStatus> {
  const admin = createAdminClient()
  const [{ count: total }, { count: signed }] = await Promise.all([
    admin
      .from("acknowledgment_tokens")
      .select("token", { count: "exact", head: true })
      .eq("request_id", requestId),
    admin
      .from("acknowledgments")
      .select("id", { count: "exact", head: true })
      .eq("request_id", requestId),
  ])
  const t = total ?? 0
  const s = signed ?? 0
  return { total: t, signed: s, pending: Math.max(0, t - s) }
}
