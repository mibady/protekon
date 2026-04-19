"use server"

import crypto from "crypto"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireRole, type UserRole } from "@/lib/auth/roles"

// ============================================================
// Types
// ============================================================

export type TeamMember = {
  user_id: string
  email: string | null
  role: UserRole
  invited_at: string
  activated_at: string | null
  deactivated_at: string | null
}

export type PendingInvite = {
  token: string
  email: string
  role: UserRole
  invited_at: string
  expires_at: string
}

export type ActionResult = {
  success?: boolean
  error?: string
  message?: string
}

const VALID_ROLES: UserRole[] = [
  'owner',
  'compliance_manager',
  'field_lead',
  'auditor',
]

// ============================================================
// Actions
// ============================================================

/** List all team members (activated + deactivated) plus pending invites for the current client. */
export async function listTeamMembers(): Promise<{
  members: TeamMember[]
  pending: PendingInvite[]
}> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { members: [], pending: [] }

  const admin = createAdminClient()

  const { data: roles } = await admin
    .from("user_roles")
    .select("user_id, role, invited_at, activated_at, deactivated_at")
    .eq("client_id", user.id)
    .order("invited_at", { ascending: false })

  // Fetch emails via admin API
  const members: TeamMember[] = []
  for (const r of roles ?? []) {
    let email: string | null = null
    try {
      const { data: userData } = await admin.auth.admin.getUserById(r.user_id)
      email = userData?.user?.email ?? null
    } catch {
      /* leave null */
    }
    members.push({
      user_id: r.user_id,
      email,
      role: r.role as UserRole,
      invited_at: r.invited_at,
      activated_at: r.activated_at,
      deactivated_at: r.deactivated_at,
    })
  }

  const { data: pending } = await admin
    .from("team_invite_tokens")
    .select("token, email, role, created_at, expires_at, used_at")
    .eq("client_id", user.id)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })

  const pendingList: PendingInvite[] = (pending ?? []).map((p) => ({
    token: p.token,
    email: p.email,
    role: p.role as UserRole,
    invited_at: p.created_at,
    expires_at: p.expires_at,
  }))

  return { members, pending: pendingList }
}

/** Invite a teammate. Owner-only. Generates a token and sends a Supabase Auth invite email. */
export async function inviteTeammate(
  formData: FormData
): Promise<ActionResult & { tokenUrl?: string }> {
  let resolved
  try {
    resolved = await requireRole(['owner'])
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Forbidden.' }
  }

  const email = (formData.get("email") as string | null)?.trim().toLowerCase()
  const role = formData.get("role") as UserRole | null

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Valid email is required." }
  }
  if (!role || !VALID_ROLES.includes(role)) {
    return { error: "Valid role is required." }
  }

  const admin = createAdminClient()
  const token = crypto.randomBytes(24).toString("base64url")
  const expiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  ).toISOString() // 7 days

  const { error: insertError } = await admin
    .from("team_invite_tokens")
    .insert({
      token,
      client_id: resolved.clientId,
      email,
      role,
      invited_by: resolved.userId,
      expires_at: expiresAt,
    })
  if (insertError) return { error: insertError.message }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ""
  const redirectTo = `${siteUrl}/team/invite/${token}`

  // Send Supabase Auth invite email
  try {
    await admin.auth.admin.inviteUserByEmail(email, { redirectTo })
  } catch (e) {
    // Email failure shouldn't kill the flow — token is valid and can be shared manually
    console.error("[inviteTeammate] inviteUserByEmail failed:", e)
  }

  return {
    success: true,
    tokenUrl: `/team/invite/${token}`,
    message: `Invite sent to ${email}.`,
  }
}

/** Change a teammate's role. Owner-only. */
export async function assignRole(
  userId: string,
  role: UserRole
): Promise<ActionResult> {
  let resolved
  try {
    resolved = await requireRole(['owner'])
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Forbidden.' }
  }
  if (!VALID_ROLES.includes(role)) {
    return { error: "Invalid role." }
  }

  const admin = createAdminClient()

  // Prevent owner from demoting themselves if they're the only owner
  if (userId === resolved.userId && role !== 'owner') {
    const { count } = await admin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("client_id", resolved.clientId)
      .eq("role", "owner")
      .not("activated_at", "is", null)
      .is("deactivated_at", null)
    if ((count ?? 0) <= 1) {
      return {
        error: "Can't remove the last owner — promote another owner first.",
      }
    }
  }

  const { error } = await admin
    .from("user_roles")
    .update({ role })
    .eq("client_id", resolved.clientId)
    .eq("user_id", userId)

  if (error) return { error: error.message }
  return { success: true }
}

/** Soft-deactivate a teammate. Owner-only. */
export async function deactivateTeammate(
  userId: string
): Promise<ActionResult> {
  let resolved
  try {
    resolved = await requireRole(['owner'])
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Forbidden.' }
  }
  if (userId === resolved.userId) {
    return { error: "Can't deactivate yourself." }
  }
  const admin = createAdminClient()
  const { error } = await admin
    .from("user_roles")
    .update({ deactivated_at: new Date().toISOString() })
    .eq("client_id", resolved.clientId)
    .eq("user_id", userId)

  if (error) return { error: error.message }
  return { success: true }
}

/** Accept an invite token. Called from the public /team/invite/[token] page. */
export async function acceptTeamInvite(
  token: string
): Promise<ActionResult & { clientId?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Sign in first." }

  const admin = createAdminClient()
  const { data: tok } = await admin
    .from("team_invite_tokens")
    .select("token, client_id, email, role, used_at, expires_at")
    .eq("token", token)
    .maybeSingle()

  if (!tok) return { error: "Invalid invite token." }
  if (tok.used_at) return { error: "This invite has already been used." }
  if (new Date(tok.expires_at) < new Date()) {
    return { error: "This invite has expired." }
  }
  if (user.email?.toLowerCase() !== tok.email.toLowerCase()) {
    return {
      error: `This invite is for ${tok.email}. Sign in as that email to accept.`,
    }
  }

  const { error: upsertError } = await admin.from("user_roles").upsert(
    {
      user_id: user.id,
      client_id: tok.client_id,
      role: tok.role,
      invited_at: new Date().toISOString(),
      activated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,client_id' }
  )

  if (upsertError) return { error: upsertError.message }

  await admin
    .from("team_invite_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("token", token)

  return { success: true, clientId: tok.client_id }
}

/** Revoke a pending invite. Owner-only. */
export async function revokeInvite(token: string): Promise<ActionResult> {
  try {
    await requireRole(['owner'])
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Forbidden.' }
  }
  const admin = createAdminClient()
  const { error } = await admin
    .from("team_invite_tokens")
    .delete()
    .eq("token", token)
  if (error) return { error: error.message }
  return { success: true }
}
