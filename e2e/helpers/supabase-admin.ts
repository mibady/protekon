import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/**
 * Service-role Supabase client for the customer-journey test.
 *
 * Resolves credentials from JOURNEY_SUPABASE_* first (so the cron can use
 * a scoped key) and falls back to the same keys the rest of the codebase
 * uses for local runs.
 */
export function getJourneyAdminClient(): SupabaseClient {
  const url = process.env.JOURNEY_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.JOURNEY_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      "Journey test requires JOURNEY_SUPABASE_URL + JOURNEY_SUPABASE_SERVICE_ROLE_KEY " +
        "(or NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY for local runs)",
    )
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function findAuthUserByEmail(
  admin: SupabaseClient,
  email: string,
): Promise<{ id: string; email: string } | null> {
  const target = email.toLowerCase()
  for (let page = 1; page <= 5; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    if (error) return null
    const found = data?.users.find((u) => u.email?.toLowerCase() === target)
    if (found) return { id: found.id, email: found.email! }
    if ((data?.users?.length ?? 0) < 200) return null
  }
  return null
}

/**
 * Polls until both the auth.users row and the matching clients row exist for
 * `email`. Used by the journey test to assert the Stripe webhook fired and
 * created the post-checkout state.
 */
export async function pollForUserCreation(
  admin: SupabaseClient,
  email: string,
  opts: { timeoutMs?: number; intervalMs?: number } = {},
): Promise<{ userId: string; clientId: string }> {
  const timeoutMs = opts.timeoutMs ?? 60_000
  const intervalMs = opts.intervalMs ?? 3_000
  const deadline = Date.now() + timeoutMs

  let lastFailure = "no auth.users row yet"
  while (Date.now() < deadline) {
    const user = await findAuthUserByEmail(admin, email)
    if (user) {
      const { data: client } = await admin
        .from("clients")
        .select("id")
        .eq("id", user.id)
        .maybeSingle()
      if (client) return { userId: user.id, clientId: client.id }
      lastFailure = `auth.users row exists (${user.id}) but no clients row`
    }
    await sleep(intervalMs)
  }
  throw new Error(
    `pollForUserCreation timed out after ${timeoutMs}ms for ${email} — ${lastFailure}`,
  )
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
