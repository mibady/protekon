import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getDashboardSurfaceData } from "@/lib/v2/actions/dashboard-surface"
import { getUserRole } from "@/lib/auth/roles"
import { DashboardSurface } from "@/components/v2/dashboard/DashboardSurface"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login?next=/dashboard")

  const [data, userRole] = await Promise.all([
    getDashboardSurfaceData(),
    getUserRole(),
  ])
  return <DashboardSurface data={data} userRole={userRole} />
}
