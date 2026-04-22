import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { getOnboardingState } from "@/lib/actions/onboarding/state"
import { AutomationsForm } from "@/components/onboarding/step-7-automations/AutomationsForm"
import type { AutomationToggles } from "@/lib/types/onboarding"

type AutomationsMetadata = {
  automations?: Partial<AutomationToggles>
}

export default async function AutomationsPage() {
  const stateResult = await getOnboardingState()
  if (!stateResult.ok) redirect("/login?next=/onboarding/automations")
  if (stateResult.data.currentStep === 0) redirect("/onboarding/business")

  const state = stateResult.data
  const supabase = await createClient()

  const { data: clientRow } = await supabase
    .from("clients")
    .select("vertical_metadata")
    .eq("id", state.client.id)
    .single<{ vertical_metadata: AutomationsMetadata | null }>()

  const saved = clientRow?.vertical_metadata?.automations ?? {}
  const defaults = state.config.automations

  const initialToggles: AutomationToggles = {
    expirationSweep:
      typeof saved.expirationSweep === "boolean"
        ? saved.expirationSweep
        : defaults.expirationSweep,
    regulatoryAlerts:
      typeof saved.regulatoryAlerts === "boolean"
        ? saved.regulatoryAlerts
        : defaults.regulatoryAlerts,
    thirdPartyCoiRequests:
      typeof saved.thirdPartyCoiRequests === "boolean"
        ? saved.thirdPartyCoiRequests
        : defaults.thirdPartyCoiRequests,
  }

  return (
    <AutomationsForm
      initialToggles={initialToggles}
      availableToggles={defaults}
      stepIntro={state.config.stepCopy.automations.intro}
    />
  )
}
