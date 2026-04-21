import type { ReactNode } from "react"
import { ProgressRail } from "./ProgressRail"
import { DashboardPreview } from "./DashboardPreview"
import type { OnboardingState } from "@/lib/types/onboarding"

type Props = {
  state: OnboardingState
  businessName: string | null
  children: ReactNode
}

export function WizardLayout({ state, businessName, children }: Props) {
  return (
    <div className="min-h-screen bg-void text-parchment">
      <ProgressRail
        currentStep={state.currentStep}
        completedSteps={state.completedSteps}
        skippedSteps={state.skippedSteps}
        config={state.config}
      />
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-0 lg:grid-cols-[minmax(0,1fr)_380px]">
        <main className="p-8 lg:p-12">{children}</main>
        <DashboardPreview state={state} businessName={businessName} />
      </div>
    </div>
  )
}
