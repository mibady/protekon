import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { getOnboardingState } from "@/lib/actions/onboarding/state"
import { SitesForm } from "@/components/onboarding/step-3-sites/SitesForm"

type SiteRowDb = {
  id: string
  name: string
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  employee_count: number | null
  is_primary: boolean
}

export default async function SitesPage() {
  const stateResult = await getOnboardingState()
  if (!stateResult.ok) redirect("/login?next=/onboarding/sites")
  if (stateResult.data.currentStep === 0) redirect("/onboarding/business")

  const state = stateResult.data
  if (!state.config.stepVisibility.sites) {
    redirect("/onboarding/people")
  }

  const supabase = await createClient()
  const { data } = await supabase
    .from("sites")
    .select("id, name, address, city, state, zip, employee_count, is_primary")
    .eq("client_id", state.client.id)
    .order("created_at", { ascending: true })
    .returns<SiteRowDb[]>()

  const initialSites = (data ?? []).map((row) => ({
    localId: row.id,
    id: row.id,
    name: row.name,
    address: row.address,
    city: row.city,
    state: row.state,
    zip: row.zip,
    employeeCount: row.employee_count,
    isPrimary: row.is_primary,
  }))

  return (
    <SitesForm
      initialSites={initialSites}
      operatingStates={state.client.operatingStates}
      stepIntro={state.config.stepCopy.sites.intro}
      addButtonLabel={state.config.stepCopy.sites.addButtonLabel}
    />
  )
}
