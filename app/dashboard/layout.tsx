import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardClientShell from "./DashboardClientShell"

/**
 * Server-side gate for the legacy /dashboard/* surface.
 *
 * Contract:
 *   1. Unauthenticated users           → /login?next=/dashboard
 *   2. Authenticated w/ v2_enabled=true → /v2/briefing  (new home)
 *   3. No matching client row
 *      (partner / admin / internal)    → render legacy shell
 *   4. Authenticated client w/
 *      v2_enabled=false                → render legacy shell
 *
 * Runs on every request under /dashboard/*. No client-side flicker.
 *
 * The UI itself lives in ./DashboardClientShell.tsx — this file only gates.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?next=/dashboard")
  }

  // Protekon convention: clients.id === auth.users.id (no user_id FK).
  // maybeSingle so partners/admins without a client row fall through
  // cleanly — they keep using the legacy shell.
  const { data: client } = await supabase
    .from("clients")
    .select("v2_enabled")
    .eq("id", user.id)
    .maybeSingle()

  if (client?.v2_enabled) {
    redirect("/v2/briefing")
  }

  return <DashboardClientShell>{children}</DashboardClientShell>
}
