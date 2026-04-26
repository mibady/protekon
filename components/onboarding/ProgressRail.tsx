import { Check } from "lucide-react"
import { getVisibleOnboardingSteps } from "@/lib/onboarding/steps"
import type { OnboardingStepNumber, OnboardingVerticalConfig } from "@/lib/types/onboarding"

type Props = {
  currentStep: OnboardingStepNumber
  completedSteps: OnboardingStepNumber[]
  skippedSteps: OnboardingStepNumber[]
  config: OnboardingVerticalConfig
}

export function ProgressRail({ currentStep, completedSteps, skippedSteps, config }: Props) {
  const steps = getVisibleOnboardingSteps(config)

  return (
    <nav aria-label="Onboarding progress" className="hidden w-20 shrink-0 lg:block">
      <ol className="sticky top-8 flex flex-col items-center">
        {steps.map((step, index) => {
          const isComplete = completedSteps.includes(step.number)
          const isSkipped = skippedSteps.includes(step.number)
          const isCurrent = currentStep === step.number
          const nextStep = steps[index + 1]
          const lineComplete = Boolean(nextStep && completedSteps.includes(nextStep.number))

          return (
            <li key={step.number} className="flex flex-col items-center">
              <div className="group relative flex h-10 w-10 items-center justify-center">
                <span
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-full border font-display text-[11px] font-bold tracking-[1px] transition-all",
                    isComplete
                      ? "border-gold bg-gold text-void shadow-[0_0_10px_rgba(255,215,0,0.5)]"
                      : isCurrent
                        ? "border-gold bg-midnight text-gold shadow-[0_0_10px_rgba(255,215,0,0.25)]"
                        : isSkipped
                          ? "border-dashed border-brand-white/[0.2] bg-void text-steel/50"
                          : "border-brand-white/[0.2] bg-void text-steel",
                  ].join(" ")}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isComplete ? <Check className="h-4 w-4" /> : index + 1}
                </span>
                <span className="pointer-events-none absolute left-11 top-1/2 z-10 -translate-y-1/2 whitespace-nowrap border border-brand-white/[0.08] bg-midnight px-2 py-1 font-display text-[10px] tracking-[2px] text-parchment opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                  {step.shortTitle}
                </span>
              </div>
              {index < steps.length - 1 ? (
                <span
                  className={[
                    "h-16 w-px transition-colors",
                    lineComplete || isComplete ? "bg-gold shadow-[0_0_10px_rgba(255,215,0,0.35)]" : "bg-brand-white/[0.12]",
                  ].join(" ")}
                  aria-hidden
                />
              ) : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

