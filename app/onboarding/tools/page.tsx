import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { getOnboardingState } from "@/lib/actions/onboarding/state"
import {
  INTEGRATION_PROVIDERS,
  isIntegrationProviderKey,
} from "@/lib/onboarding/integration-providers"
import { ConnectToolsForm } from "@/components/onboarding/step-2-connect-tools/ConnectToolsForm"
import type { IntegrationProviderKey } from "@/lib/types/onboarding"

export default async function ConnectToolsPage() {
  const stateResult = await getOnboardingState()
  if (!stateResult.ok) redirect("/login?next=/onboarding/tools")
  if (stateResult.data.currentStep === 0) redirect("/onboarding/business")

  const supabase = await createClient()
  const { data: existing } = await supabase
    .from("integrations")
    .select("provider")
    .eq("client_id", stateResult.data.client.id)

  const providerValueToKey = new Map<string, IntegrationProviderKey>()
  for (const [key, value] of Object.entries(INTEGRATION_PROVIDERS)) {
    if (isIntegrationProviderKey(key)) {
      providerValueToKey.set(value, key)
    }
  }

  const initialIntents: IntegrationProviderKey[] = (existing ?? [])
    .map((row: { provider: string | null }) =>
      row.provider ? providerValueToKey.get(row.provider) : undefined,
    )
    .filter((key): key is IntegrationProviderKey => Boolean(key))

  return <ConnectToolsForm initialIntents={initialIntents} />
}
