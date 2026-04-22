import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { getOnboardingState } from "@/lib/actions/onboarding/state"
import { BusinessSnapshotForm } from "@/components/onboarding/step-1-business-snapshot/BusinessSnapshotForm"

export default async function BusinessSnapshotPage() {
  const stateResult = await getOnboardingState()
  if (!stateResult.ok) redirect("/login?next=/onboarding/business")

  const supabase = await createClient()
  const { data: verticals } = await supabase
    .from("verticals")
    .select("slug, label:display_name, risk_tier:tier")
    .eq("status", "active")
    .order("display_name", { ascending: true })

  const current = stateResult.data.client

  return (
    <BusinessSnapshotForm
      verticals={verticals ?? []}
      initial={{
        vertical: current.vertical,
        operatingStates: current.operatingStates,
        workerCountRange: current.workerCountRange,
      }}
    />
  )
}
