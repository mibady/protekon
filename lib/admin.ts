import { createClient } from "@/lib/supabase/server"

/**
 * Verify the current user is an admin.
 * Admin emails are set via ADMIN_EMAILS env var (comma-separated).
 * Returns the user if admin, null otherwise.
 */
export async function verifyAdmin() {
  const adminEmails = process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) ?? []
  if (adminEmails.length === 0) return null

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) return null
  if (!adminEmails.includes(user.email.toLowerCase())) return null

  return user
}
