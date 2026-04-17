import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { isResourceType } from "@/lib/v2/coverage-types"
import { CoverageDrillDown } from "@/components/v2/CoverageDrillDown"
import type { V2Client } from "@/lib/v2/types"

/**
 * List route — /v2/coverage/{type}
 *
 * Validates the `type` param against the catalog, loads the client, and
 * hands off to CoverageDrillDown in list mode. The component handles empty
 * states, not-applicable messaging, and the "not yet migrated" footer.
 *
 * NGE-460 added optional `?site_id=…` — when present, the drill-down scopes
 * its list query to rows attached to the named site. This is how the Sites
 * hub tiles deep-link into sibling drill-downs (team / assets / inspections
 * / permits / materials / findings).
 *
 * Next.js 16: both params and searchParams are async.
 */
type Props = {
  params: Promise<{ type: string }>
  searchParams: Promise<{ site_id?: string | string[] }>
}

export default async function CoverageListPage({ params, searchParams }: Props) {
  const { type } = await params
  const { site_id: rawSiteId } = await searchParams
  // searchParams values may be arrays when a key repeats; take the first.
  const siteId = Array.isArray(rawSiteId) ? rawSiteId[0] : rawSiteId
  if (!isResourceType(type)) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/v2/coverage/${type}`)

  const { data: client } = await supabase
    .from("clients")
    .select(
      "id, business_name, vertical, state, compliance_score, v2_enabled, onboarding_completed_at"
    )
    .eq("id", user.id)
    .maybeSingle()

  // Break the loop: /dashboard now redirects v2_enabled clients back to v2.
  if (!client) redirect("/login?error=session_expired")

  // Short-circuit when the type is disabled for the client's vertical. The
  // missing-row case defaults to enabled (pre-seed tolerance), so only an
  // explicit enabled=false triggers the 404.
  const { data: rtvm } = await supabase
    .from("resource_type_vertical_map")
    .select("enabled")
    .eq("vertical_slug", client.vertical as string)
    .eq("resource_type", type)
    .maybeSingle()

  if (rtvm?.enabled === false) notFound()

  const typed = client as V2Client

  return (
    <CoverageDrillDown
      mode="list"
      resourceType={type}
      vertical={typed.vertical}
      client={typed}
      filters={siteId ? { site_id: siteId } : undefined}
    />
  )
}
