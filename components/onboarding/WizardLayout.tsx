"use client"

import { useState, type ReactNode } from "react"
import { ChevronDown, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ProgressRail } from "./ProgressRail"
import { DashboardPreview } from "./DashboardPreview"
import type { OnboardingState } from "@/lib/types/onboarding"

type Props = {
  state: OnboardingState
  businessName: string | null
  children: ReactNode
}

export function WizardLayout({ state, businessName, children }: Props) {
  const [previewOpen, setPreviewOpen] = useState(false)

  return (
    <div className="min-h-screen bg-void text-parchment">
      <div className="mx-auto flex max-w-7xl px-4 py-6 lg:px-8">
        <ProgressRail
          currentStep={state.currentStep}
          completedSteps={state.completedSteps}
          skippedSteps={state.skippedSteps}
          config={state.config}
        />
        <div className="grid min-w-0 flex-1 grid-cols-1 gap-0 lg:grid-cols-[minmax(0,1fr)_380px]">
          <main className="min-w-0 px-2 pb-28 pt-2 sm:px-4 lg:px-8 lg:pb-12">
            {children}
          </main>
          <div className="hidden lg:block">
            <div className="sticky top-6 h-[calc(100vh-48px)]">
              <DashboardPreview state={state} businessName={businessName} />
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-white/[0.12] bg-midnight/95 p-3 shadow-2xl backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <div>
            <div className="font-display text-[10px] tracking-[2px] text-steel uppercase">
              Dashboard Preview
            </div>
            <div className="font-sans text-[12px] text-fog">
              {previewOpen ? "Preview expanded" : "Track onboarding progress"}
            </div>
          </div>
          <Button
            type="button"
            onClick={() => setPreviewOpen((open) => !open)}
            className="gap-2 border border-gold bg-midnight text-gold hover:bg-gold/10"
          >
            {previewOpen ? <ChevronDown className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            View Progress
          </Button>
        </div>
        {previewOpen ? (
          <div className="mx-auto mt-3 max-h-[60vh] max-w-lg overflow-y-auto border border-brand-white/[0.08]">
            <DashboardPreview state={state} businessName={businessName} />
          </div>
        ) : null}
      </div>
    </div>
  )
}

