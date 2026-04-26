import { redirect } from "next/navigation"
import { getOnboardingState } from "@/lib/actions/onboarding/state"
import { nextVisibleOnboardingHref } from "@/lib/onboarding/steps"

export default async function OnboardingEntryPage() {
  const result = await getOnboardingState()
  if (!result.ok) redirect("/login?next=/onboarding")

  if (result.data.client.onboardingStatus === "completed") {
    redirect("/dashboard")
  }

  redirect(nextVisibleOnboardingHref(result.data.config, result.data.completedSteps))
}
