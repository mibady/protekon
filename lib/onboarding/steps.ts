import type { OnboardingStepNumber, OnboardingVerticalConfig } from "@/lib/types/onboarding"

export type VisibleOnboardingStep = {
  number: OnboardingStepNumber
  title: string
  shortTitle: string
  href: string
}

export const VISIBLE_ONBOARDING_STEPS: VisibleOnboardingStep[] = [
  { number: 1, title: "Business Snapshot", shortTitle: "Business", href: "/onboarding/business" },
  { number: 3, title: "Locations", shortTitle: "Sites", href: "/onboarding/sites" },
  { number: 4, title: "People", shortTitle: "People", href: "/onboarding/people" },
  { number: 5, title: "Third Parties", shortTitle: "Vendors", href: "/onboarding/subs" },
  { number: 6, title: "Documents", shortTitle: "Docs", href: "/onboarding/documents" },
]

export function getVisibleOnboardingSteps(
  config: OnboardingVerticalConfig,
): VisibleOnboardingStep[] {
  return VISIBLE_ONBOARDING_STEPS.filter((step) => {
    if (step.number === 5) return config.stepVisibility.thirdParties
    return true
  })
}

export function nextVisibleOnboardingHref(
  config: OnboardingVerticalConfig,
  completedSteps: OnboardingStepNumber[],
): string {
  const steps = getVisibleOnboardingSteps(config)
  const next = steps.find((step) => !completedSteps.includes(step.number))
  return next?.href ?? "/dashboard"
}

