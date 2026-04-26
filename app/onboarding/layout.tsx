import { redirect } from "next/navigation"
import type { ReactNode } from "react"

import { createClient } from "@/lib/supabase/server"
import { getOnboardingState } from "@/lib/actions/onboarding/state"
import { WizardLayout } from "@/components/onboarding/WizardLayout"

export default async function OnboardingLayout({ children }: { children: ReactNode }) {
  const stateResult = await getOnboardingState()

  if (!stateResult.ok) {
    redirect(`/login?next=${encodeURIComponent("/onboarding")}`)
  }

  const state = stateResult.data

  const supabase = await createClient()
  const { data: clientMeta } = await supabase
    .from("clients")
    .select("business_name")
    .eq("id", state.client.id)
    .single<{ business_name: string | null }>()

  return (
    <WizardLayout state={state} businessName={clientMeta?.business_name ?? null}>
      {children}
    </WizardLayout>
  )
}
