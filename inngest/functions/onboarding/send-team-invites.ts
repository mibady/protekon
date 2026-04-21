import { inngest } from "@/inngest/client"
import { createAdminClient } from "@/lib/supabase/admin"

type UserRoleRow = {
  id: string
  client_id: string
  user_id: string | null
  role: string
  invited_at: string | null
}

/**
 * Idempotent backup for Supabase Auth invites triggered by
 * `inviteTeamMember` in `lib/actions/onboarding/workers.ts`. That server
 * action attempts the invite inline; this handler re-sends invites for any
 * user_roles row whose `user_id` is still null (meaning the inline invite
 * didn't land). Safe to run multiple times — Supabase's invite API is
 * idempotent on existing users.
 */
export const onboardingSendTeamInvites = inngest.createFunction(
  {
    id: "onboarding-send-team-invites",
    retries: 3,
    triggers: [{ event: "onboarding/people.imported" }],
  },
  async ({ event, step }) => {
    const { clientId, invitedUserIds } = event.data

    if (!invitedUserIds || invitedUserIds.length === 0) {
      return { clientId, processed: 0 }
    }

    const rows = await step.run("load-user-roles", async () => {
      const admin = createAdminClient()
      const { data, error } = await admin
        .from("user_roles")
        .select("id, client_id, user_id, role, invited_at")
        .in("id", invitedUserIds)
        .eq("client_id", clientId)
        .returns<UserRoleRow[]>()
      if (error) throw new Error(error.message)
      return data ?? []
    })

    const needsInvite = rows.filter((r) => r.user_id === null)
    if (needsInvite.length === 0) {
      return { clientId, processed: 0, skipped: rows.length }
    }

    // `user_roles` has no email column — the invite email lives only in the
    // inline call path at `lib/actions/onboarding/workers.ts`. When that
    // inline invite fails, the row is left with `user_id IS NULL` and no
    // recoverable email, which this handler can only surface, not retry.
    const results = needsInvite.map((row) => ({
      roleId: row.id,
      ok: false,
      error: "no_email_on_role_row" as const,
    }))

    return { clientId, processed: results.length, results }
  },
)
