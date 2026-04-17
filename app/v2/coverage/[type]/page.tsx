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
 * Next.js 16: params are async.
 */
type Props = {
  params: Promise<{ type: string }>
}

export default async function CoverageListPage({ params }: Props) {
  const { type } = await params
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
    .single()

  if (!client) redirect("/dashboard")

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
    />
  )
}
