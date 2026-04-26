import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { getOnboardingState } from "@/lib/actions/onboarding/state"
import { getVisibleOnboardingSteps } from "@/lib/onboarding/steps"
import { ThirdPartiesForm } from "@/components/onboarding/step-5-third-parties/ThirdPartiesForm"

type SubRow = {
  id: string
  company_name: string | null
  trade_type: string | null
}

export default async function ThirdPartiesPage() {
  const stateResult = await getOnboardingState()
  if (!stateResult.ok) redirect("/login?next=/onboarding/subs")
  if (stateResult.data.currentStep === 0) redirect("/onboarding/business")

  const state = stateResult.data
  if (!state.config.stepVisibility.thirdParties) {
    redirect("/onboarding/documents")
  }

  const termSingular = state.config.peopleTerminology.thirdParty ?? "Vendor"
  const termPlural = `${termSingular}s`

  const supabase = await createClient()
  const { data } = await supabase
    .from("construction_subs")
    .select("id, company_name, trade_type")
    .eq("client_id", state.client.id)
    .order("created_at", { ascending: true })
    .returns<SubRow[]>()

  const initialRecords = (data ?? []).map((row) => ({
    localId: row.id,
    id: row.id,
    name: row.company_name ?? "",
    contactEmail: null,
    selected: Boolean(row.company_name),
  }))

  const stepCopy = state.config.stepCopy.thirdParties ?? {
    intro: `Log every ${termSingular.toLowerCase()} that touches your compliance posture.`,
    classificationHelp:
      "Classification and trade help us route the right onboarding packet and COI tracking rules.",
  }

  return (
    <ThirdPartiesForm
      initialRecords={initialRecords}
      termSingular={termSingular}
      termPlural={termPlural}
      stepIntro={stepCopy.intro}
      classificationHelp={stepCopy.classificationHelp}
      totalSteps={getVisibleOnboardingSteps(state.config).length}
    />
  )
}
