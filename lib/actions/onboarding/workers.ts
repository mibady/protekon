"use server"

import { z } from "zod"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { inngest } from "@/inngest/client"
import type {
  ImportWorkersInput,
  ImportWorkersResult,
  InviteTeamMemberInput,
  InviteTeamMemberResult,
} from "@/lib/types/onboarding"

const TEAM_ROLES = [
  "owner",
  "compliance_manager",
  "field_lead",
  "auditor",
] as const

const workerRowSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Worker name required"),
  role: z.string().nullable(),
  hireDate: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().email().nullable().or(z.literal("").transform(() => null)),
  siteId: z.string().uuid().nullable(),
})

const importSchema = z.object({
  workers: z.array(workerRowSchema).min(1).max(1000),
})

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(TEAM_ROLES),
})

type WorkerRowSelection = {
  id: string
}

type UserRoleRowSelection = {
  id: string
}

/**
 * Bulk import workers for the authenticated client. Insert-only for Phase 1
 * — rows with an `id` are ignored for the insert but passed through so the
 * caller can reconcile existing records client-side. Fires the
 * `onboarding/people.imported` event so `send-team-invites.ts` can no-op
 * (no invited user ids) while preserving a single observable event shape.
 */
export async function importWorkers(
  input: ImportWorkersInput,
): Promise<ImportWorkersResult> {
  const parsed = importSchema.safeParse(input)
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

  const newRows = parsed.data.workers
    .filter((w) => !w.id)
    .map((w) => ({
      client_id: user.id,
      site_id: w.siteId,
      name: w.name,
      role: w.role,
      hire_date: w.hireDate,
      phone: w.phone,
      email: w.email,
    }))

  if (newRows.length === 0) {
    return {
      ok: true,
      data: { workerIds: [], createdCount: 0, updatedCount: 0 },
    }
  }

  const { data: inserted, error } = await supabase
    .from("workers")
    .insert(newRows)
    .select("id")
    .returns<WorkerRowSelection[]>()

  if (error || !inserted) {
    return { ok: false, error: error?.message ?? "insert_failed" }
  }

  const workerIds = inserted.map((r) => r.id)

  await inngest.send({
    name: "onboarding/people.imported",
    data: {
      clientId: user.id,
      importedWorkerIds: workerIds,
      invitedUserIds: [],
    },
  })

  return {
    ok: true,
    data: {
      workerIds,
      createdCount: workerIds.length,
      updatedCount: 0,
    },
  }
}

/**
 * Step 4 (team half): invite a team member via Supabase Auth and register the
 * user_role row. If Supabase already has that email, we still create the
 * user_roles row (activation happens when the user accepts the invite link).
 *
 * Order: create user_roles row first (with invited_at stamp) → attempt auth
 * invite → on success, backfill user_id. This keeps user_roles consistent
 * even if the auth invite temporarily fails; `send-team-invites.ts` is the
 * idempotent retry path.
 */
export async function inviteTeamMember(
  input: InviteTeamMemberInput,
): Promise<InviteTeamMemberResult> {
  const parsed = inviteSchema.safeParse(input)
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

  const admin = createAdminClient()
  const now = new Date().toISOString()

  const { data: inserted, error: insertErr } = await admin
    .from("user_roles")
    .insert({
      client_id: user.id,
      role: parsed.data.role,
      invited_at: now,
      invited_by: user.id,
    })
    .select("id")
    .single<UserRoleRowSelection>()

  if (insertErr || !inserted) {
    return { ok: false, error: insertErr?.message ?? "role_insert_failed" }
  }

  let magicLinkSent = false
  const { data: inviteData, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(
    parsed.data.email,
  )

  if (!inviteErr && inviteData?.user?.id) {
    magicLinkSent = true
    await admin
      .from("user_roles")
      .update({ user_id: inviteData.user.id })
      .eq("id", inserted.id)
  }

  await inngest.send({
    name: "onboarding/people.imported",
    data: {
      clientId: user.id,
      importedWorkerIds: [],
      invitedUserIds: [inserted.id],
    },
  })

  return {
    ok: true,
    data: {
      inviteTokenId: inserted.id,
      magicLinkSent,
    },
  }
}
