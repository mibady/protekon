import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/v2/Sidebar"
import { coverageSubItemsFor } from "@/lib/v2/coverage-sub-items"
import type { V2Client } from "@/lib/v2/types"

/**
 * Auth gate for all /v2/* routes.
 *
 * Contract:
 *   1. Unauthenticated users              → /login?next=/v2
 *   2. No matching client row (partner/admin)
 *                                         → /login?error=unauthorized
 *   3. Authenticated client               → render v2 shell
 *
 * The legacy /dashboard surface was removed when v2 went all-in; the
 * v2_enabled flag is kept in the schema but no longer gated on here. If
 * we ever need to roll back a specific client to the legacy UI, the flag
 * can be re-wired, but today every client is on v2 unconditionally.
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

  // Look up the client by email. Most rows created via signUp have
  // clients.id === auth.uid(), but seeded clients (e.g. Coastal Health
  // Group) were inserted with their own UUIDs and only match on email.
  // lib/actions/intake.ts uses the same pattern — keeping one canonical
  // join column avoids the silent-null class of bugs.
  const { data: client } = await supabase
    .from("clients")
    .select(
      "id, business_name, vertical, state, compliance_score, v2_enabled, onboarding_completed_at"
    )
    .eq("email", user.email!)
    .maybeSingle()

  if (!client) {
    // Account in auth but no matching client row — likely a partner or
    // admin from a parallel surface. Force re-auth instead of bouncing to
    // a now-deleted /dashboard.
    redirect("/login?error=unauthorized")
  }

  const typed = client as V2Client

  // Primary Coverage sub-items for this vertical. Rendered as indented nav
  // entries under the Coverage item when the user is on a /v2/coverage/*
  // route. Query runs unconditionally — Sidebar decides whether to show them
  // based on pathname.
  const coverageSubItems = await coverageSubItemsFor(typed.vertical)

  return (
    <div className="min-h-screen bg-parchment text-midnight font-sans">
      <div className="flex">
        <Sidebar client={typed} coverageSubItems={coverageSubItems} />
        <main className="flex-1 min-w-0 min-h-screen">{children}</main>
      </div>
    </div>
  )
}
