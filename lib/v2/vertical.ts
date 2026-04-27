import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

/**
 * Resolve the current authenticated client's vertical slug.
 *
 * Returns null when the user is not authenticated or has no client row.
 * Mirrors the lookup pattern in `app/dashboard/layout.tsx` — admin client
 * bypasses RLS for the self-lookup; identity is verified via auth.getUser()
 * before the admin client touches anything.
 */
export async function getCurrentVertical(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email) return null

  const admin = createAdminClient()
  const { data: client, error } = await admin
    .from("clients")
    .select("vertical")
    .eq("email", user.email)
    .maybeSingle()

  if (error) {
    console.error("[lib/v2/vertical] clients lookup error:", error)
    return null
  }

  return client?.vertical ?? null
}
