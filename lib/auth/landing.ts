import { createAdminClient } from "@/lib/supabase/admin"
import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * Where a freshly authenticated user should land based on their role.
 *
 * Resolution order (a user can only be one of these — by design):
 *   1. partner_profiles.status = 'approved' for the user_id → /partner
 *   2. clients row matching the user (by id or email) → /dashboard
 *   3. neither → /login?error=unauthorized
 *
 * The clients lookup uses the service-role admin client because RLS on
 * `clients` scopes visibility to `auth.uid() = id`, which silently filters
 * out seeded clients whose id was set independently of auth.uid (Coastal
 * Health Group is the canonical example). Identity is already verified
 * by the caller; the admin bypass is only for the self-row resolve.
 *
 * The partner_profiles lookup uses the auth-session client because that
 * table's RLS is keyed on user_id and matches signed-in identity directly.
 *
 * Reused by:
 *   - lib/actions/auth.ts signIn
 *   - app/auth/callback/route.ts (OAuth / magic-link)
 *   - app/v2/layout.tsx (when v2 finds no clients row, see if user is a
 *     partner before bouncing to unauthorized)
 */
export type LandingPath = "/partner" | "/dashboard" | "/login?error=unauthorized"

export async function resolveLandingPath(
  supabase: SupabaseClient,
  userId: string,
  userEmail: string | null | undefined,
): Promise<LandingPath> {
  // 1. Partner check.
  const { data: partner } = await supabase
    .from("partner_profiles")
    .select("status")
    .eq("user_id", userId)
    .maybeSingle()

  if (partner?.status === "approved") {
    return "/partner"
  }

  // 2. Client check (admin bypass).
  if (userEmail) {
    const admin = createAdminClient()
    const { data: client } = await admin
      .from("clients")
      .select("id")
      .eq("email", userEmail)
      .maybeSingle()

    if (client) {
      return "/dashboard"
    }
  }

  return "/login?error=unauthorized"
}
