"use server"

import crypto from "crypto"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireRole, RoleError } from "@/lib/auth/roles"

// ============================================================
// Types
// ============================================================

export type OnboardingStatus = "submitted" | "approved" | "rejected"

export type OnboardingSubmission = {
  id: string
  token: string
  sub_id: string | null
  legal_name: string
  ein: string | null
  address: string | null
  w9_pdf_url: string | null
  msa_signed_pdf_url: string | null
  status: OnboardingStatus
  created_at: string
  reviewed_at: string | null
  sub_company_name?: string
}

export type PendingInvite = {
  token: string
  sub_company_name: string
  contact_email: string
  contact_name: string | null
  expires_at: string
  created_at: string
  sub_id: string | null
}

export type ActionResult = {
  success?: boolean
  error?: string
  id?: string
  tokenUrl?: string
}

// ============================================================
// Reads
// ============================================================

/**
 * Lists onboarding submissions (RLS-scoped) + pending invites (admin client,
 * tokens table is deny-all). Returns both so the UI can render submitted-for-
 * review and still-outstanding-invites in one pane.
 */
export async function listOnboardingSubmissions(): Promise<{
  submissions: OnboardingSubmission[]
  pending: PendingInvite[]
}> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { submissions: [], pending: [] }

  // Submissions respect RLS (client-scoped)
  const { data: subs } = await supabase
    .from("sub_onboarding_submissions")
    .select(
      "id, token, sub_id, legal_name, ein, address, w9_pdf_url, msa_signed_pdf_url, status, created_at, reviewed_at"
    )
    .order("created_at", { ascending: false })

  // Tokens are deny-all → admin client, client-scoped filter
  const admin = createAdminClient()
  const [{ data: tokens }, companyNameMap] = await Promise.all([
    admin
      .from("sub_onboarding_tokens")
      .select(
        "token, sub_company_name, contact_email, contact_name, expires_at, used_at, created_at, sub_id, client_id"
      )
      .eq("client_id", user.id)
      .order("created_at", { ascending: false }),
    (async () => {
      if (!subs || subs.length === 0) return new Map<string, string>()
      const tokenList = subs.map((s) => s.token)
      const { data } = await admin
        .from("sub_onboarding_tokens")
        .select("token, sub_company_name")
        .in("token", tokenList)
      const m = new Map<string, string>()
      for (const r of data ?? []) m.set(r.token, r.sub_company_name)
      return m
    })(),
  ])

  const submissions: OnboardingSubmission[] = (subs ?? []).map((s) => ({
    id: s.id,
    token: s.token,
    sub_id: s.sub_id,
    legal_name: s.legal_name,
    ein: s.ein,
    address: s.address,
    w9_pdf_url: s.w9_pdf_url,
    msa_signed_pdf_url: s.msa_signed_pdf_url,
    status: s.status as OnboardingStatus,
    created_at: s.created_at,
    reviewed_at: s.reviewed_at,
    sub_company_name: companyNameMap.get(s.token),
  }))

  const pending: PendingInvite[] = (tokens ?? [])
    .filter((t) => !t.used_at && new Date(t.expires_at) > new Date())
    .map((t) => ({
      token: t.token,
      sub_company_name: t.sub_company_name,
      contact_email: t.contact_email,
      contact_name: t.contact_name,
      expires_at: t.expires_at,
      created_at: t.created_at,
      sub_id: t.sub_id,
    }))

  return { submissions, pending }
}

// ============================================================
// Writes
// ============================================================

/**
 * Creates a new sub-onboarding invite token. Returns a shareable tokenUrl
 * that routes to the public `/sub/[token]` portal.
 */
export async function inviteSub(formData: FormData): Promise<ActionResult> {
  try {
    const { userId, clientId } = await requireRole([
      "owner",
      "compliance_manager",
    ])

    const subCompanyName = (formData.get("sub_company_name") as string)?.trim()
    const contactEmail = (formData.get("contact_email") as string)?.trim()
    const contactName =
      (formData.get("contact_name") as string)?.trim() || null
    const subIdRaw = (formData.get("sub_id") as string)?.trim() || null
    const subId = subIdRaw || null

    if (!subCompanyName) return { error: "Company name is required." }
    if (!contactEmail) return { error: "Contact email is required." }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      return { error: "Contact email is invalid." }
    }

    const admin = createAdminClient()

    const token = crypto.randomBytes(24).toString("base64url")
    const expiresAt = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString()

    const { error: tokErr } = await admin
      .from("sub_onboarding_tokens")
      .insert({
        token,
        client_id: clientId,
        sub_id: subId,
        sub_company_name: subCompanyName,
        contact_email: contactEmail,
        contact_name: contactName,
        expires_at: expiresAt,
        invited_by: userId,
      })

    if (tokErr) return { error: tokErr.message }

    await admin.from("audit_log").insert({
      client_id: clientId,
      event_type: "sub_onboarding.invited",
      description: `Invited ${subCompanyName} (${contactEmail}) to onboarding`,
      metadata: { token, sub_id: subId },
    })

    return { success: true, tokenUrl: `/sub/${token}` }
  } catch (err) {
    if (err instanceof RoleError) return { error: err.message }
    return { error: err instanceof Error ? err.message : "Unknown error." }
  }
}

/**
 * Approves a pending submission. If no sub_id is linked yet, creates a new
 * construction_subs row from the submission's legal_name and links it.
 */
export async function approveSubmission(id: string): Promise<ActionResult> {
  try {
    const { userId, clientId } = await requireRole([
      "owner",
      "compliance_manager",
    ])
    const admin = createAdminClient()

    const { data: sub, error: fetchErr } = await admin
      .from("sub_onboarding_submissions")
      .select("id, sub_id, legal_name, client_id, status")
      .eq("id", id)
      .eq("client_id", clientId)
      .maybeSingle()

    if (fetchErr) return { error: fetchErr.message }
    if (!sub) return { error: "Submission not found." }
    if (sub.status !== "submitted") {
      return { error: `Cannot approve a submission that is ${sub.status}.` }
    }

    let linkedSubId = sub.sub_id as string | null
    if (!linkedSubId) {
      const { data: newSub, error: insErr } = await admin
        .from("construction_subs")
        .insert({
          client_id: clientId,
          company_name: sub.legal_name,
        })
        .select("id")
        .single()
      if (insErr || !newSub) {
        return { error: insErr?.message ?? "Could not create sub." }
      }
      linkedSubId = newSub.id
    }

    const { error: updErr } = await admin
      .from("sub_onboarding_submissions")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
        reviewed_by: userId,
        sub_id: linkedSubId,
      })
      .eq("id", id)
      .eq("client_id", clientId)

    if (updErr) return { error: updErr.message }

    await admin.from("audit_log").insert({
      client_id: clientId,
      event_type: "sub_onboarding.approved",
      description: `Approved onboarding submission for ${sub.legal_name}`,
      metadata: { submission_id: id, sub_id: linkedSubId },
    })

    return { success: true, id: linkedSubId ?? undefined }
  } catch (err) {
    if (err instanceof RoleError) return { error: err.message }
    return { error: err instanceof Error ? err.message : "Unknown error." }
  }
}

/**
 * Rejects a pending submission with reviewer notes.
 */
export async function rejectSubmission(
  id: string,
  reason: string
): Promise<ActionResult> {
  try {
    const { userId, clientId } = await requireRole([
      "owner",
      "compliance_manager",
    ])
    const admin = createAdminClient()

    const trimmed = (reason ?? "").trim()
    if (!trimmed) return { error: "A rejection reason is required." }

    const { data: sub, error: fetchErr } = await admin
      .from("sub_onboarding_submissions")
      .select("id, status, notes, legal_name")
      .eq("id", id)
      .eq("client_id", clientId)
      .maybeSingle()

    if (fetchErr) return { error: fetchErr.message }
    if (!sub) return { error: "Submission not found." }
    if (sub.status !== "submitted") {
      return { error: `Cannot reject a submission that is ${sub.status}.` }
    }

    const stamp = new Date().toISOString()
    const appended = sub.notes
      ? `${sub.notes}\n---\n[${stamp}] Rejected: ${trimmed}`
      : `[${stamp}] Rejected: ${trimmed}`

    const { error: updErr } = await admin
      .from("sub_onboarding_submissions")
      .update({
        status: "rejected",
        reviewed_at: stamp,
        reviewed_by: userId,
        notes: appended,
      })
      .eq("id", id)
      .eq("client_id", clientId)

    if (updErr) return { error: updErr.message }

    await admin.from("audit_log").insert({
      client_id: clientId,
      event_type: "sub_onboarding.rejected",
      description: `Rejected onboarding submission for ${sub.legal_name}`,
      metadata: { submission_id: id, reason: trimmed },
    })

    return { success: true }
  } catch (err) {
    if (err instanceof RoleError) return { error: err.message }
    return { error: err instanceof Error ? err.message : "Unknown error." }
  }
}
