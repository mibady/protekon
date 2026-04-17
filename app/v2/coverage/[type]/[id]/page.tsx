import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { isResourceType } from "@/lib/v2/coverage-types"
import { CoverageDrillDown } from "@/components/v2/CoverageDrillDown"
import type { V2Client } from "@/lib/v2/types"

/**
 * Detail route — /v2/coverage/{type}/{id}
 *
 * Validates the `type` param, loads the client, and hands off to
 * CoverageDrillDown in detail mode. The component resolves the specific
 * row (404s internally if the id doesn't belong to the client) and renders
 * the per-config detail sections.
 *
 * Next.js 16: params are async.
 */
type Props = {
  params: Promise<{ type: string; id: string }>
}

export default async function CoverageDetailPage({ params }: Props) {
  const { type, id } = await params
  if (!isResourceType(type)) notFound()
  if (!id) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/v2/coverage/${type}/${id}`)

  const { data: client } = await supabase
    .from("clients")
    .select(
      "id, business_name, vertical, state, compliance_score, v2_enabled, onboarding_completed_at"
    )
    .eq("email", user.email!)
    .maybeSingle()

  // Break the loop: /dashboard now redirects v2_enabled clients back to v2.
  if (!client) redirect("/login?error=session_expired")

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
      mode="detail"
      resourceType={type}
      vertical={typed.vertical}
      client={typed}
      id={id}
    />
  )
}
