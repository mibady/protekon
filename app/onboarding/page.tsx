import { redirect } from "next/navigation"
import { getOnboardingState } from "@/lib/actions/onboarding/state"

/**
 * Entry point — route to the current step. Phase 1A only implements
 * /onboarding/business. Anyone past step 1 lands on the dashboard until
 * later steps ship.
 */
export default async function OnboardingEntryPage() {
  const result = await getOnboardingState()
  if (!result.ok) redirect("/login?next=/onboarding")

  const step = result.data.client.onboardingStatus === "completed" ? 8 : result.data.currentStep

  if (step >= 2) {
    redirect("/dashboard")
  }

  redirect("/onboarding/business")
}
