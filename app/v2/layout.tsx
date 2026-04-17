import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/v2/Sidebar"
import type { V2Client } from "@/lib/v2/types"

/**
 * Auth + feature-flag gate for all /v2/* routes.
 *
 * Contract:
 *   1. Unauthenticated users → /login
 *   2. Authenticated but v2_enabled = false → /dashboard (legacy)
 *   3. Authenticated with v2_enabled = true → render v2 shell
 *
 * The gate runs server-side on every request. No client-side flicker.
 * Sidebar receives the client record and renders identity + nav.
 */
export default async function V2Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?next=/v2")
  }

  // Single query — grab everything the sidebar and gate need in one round trip.
  // clients.id = auth.uid() per project convention (no user_id FK on this table).
  const { data: client, error } = await supabase
    .from("clients")
    .select(
      "id, business_name, vertical, state, compliance_score, v2_enabled, onboarding_completed_at"
    )
    .eq("id", user.id)
    .single()

  if (error || !client) {
    // Account in auth but no matching client row — likely a partner or admin.
    // Send them to /dashboard which handles its own role-based routing.
    redirect("/dashboard")
  }

  if (!client.v2_enabled) {
    redirect("/dashboard")
  }

  const typed = client as V2Client

  return (
    <div className="min-h-screen bg-parchment text-midnight font-sans">
      <div className="flex">
        <Sidebar client={typed} />
        <main className="flex-1 min-w-0 min-h-screen">{children}</main>
      </div>
    </div>
  )
}
