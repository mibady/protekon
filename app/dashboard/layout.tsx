import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
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

  // Look up the client by email using the admin client. RLS on `clients`
  // is scoped to `id = auth.uid()` — fine for signUp-created rows but
  // blocks seeded rows where clients.id ≠ auth.uid(). Admin bypass is
  // safe here because (a) identity was already verified via
  // auth.getUser() above and (b) we scope the lookup to the verified
  // email. Same pattern as lib/actions/intake.ts.
  const admin = createAdminClient()
  const { data: client } = await admin
    .from("clients")
    .select(
      "id, business_name, vertical, state, compliance_score, v2_enabled, onboarding_completed_at"
    )
    .eq("email", user.email!)
    .maybeSingle()

  if (!client) {
    // Account in auth but no matching client row — could be a partner.
    // Check partner_profiles before showing unauthorized; if approved,
    // route them to /partner instead of dead-ending here.
    const { data: partner } = await supabase
      .from("partner_profiles")
      .select("status")
      .eq("user_id", user.id)
      .maybeSingle()

    if (partner?.status === "approved") {
      redirect("/partner")
    }

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
