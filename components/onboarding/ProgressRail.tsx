import { Check } from "lucide-react"
import type { OnboardingStepNumber, OnboardingVerticalConfig } from "@/lib/types/onboarding"

type Step = {
  number: OnboardingStepNumber
  title: string
  shortTitle: string
}

const ALL_STEPS: Step[] = [
  { number: 1, title: "Business Snapshot", shortTitle: "Business" },
  { number: 2, title: "Connect Your Tools", shortTitle: "Tools" },
  { number: 3, title: "Sites", shortTitle: "Sites" },
  { number: 4, title: "Your People", shortTitle: "People" },
  { number: 5, title: "Third-Party Vendors", shortTitle: "Vendors" },
  { number: 6, title: "Confirm Documents", shortTitle: "Docs" },
  { number: 7, title: "Automations", shortTitle: "Automate" },
]

export function getVisibleSteps(config: OnboardingVerticalConfig): Step[] {
  return ALL_STEPS.filter((s) => {
    if (s.number === 3) return config.stepVisibility.sites
    if (s.number === 5) return config.stepVisibility.thirdParties
    return true
  })
}

type Props = {
  currentStep: OnboardingStepNumber
  completedSteps: OnboardingStepNumber[]
  skippedSteps: OnboardingStepNumber[]
  config: OnboardingVerticalConfig
}

export function ProgressRail({ currentStep, completedSteps, skippedSteps, config }: Props) {
  const steps = getVisibleSteps(config)

  return (
    <nav
      aria-label="Onboarding progress"
      className="w-full overflow-x-auto border-b border-brand-white/[0.08] bg-midnight/60 backdrop-blur"
    >
      <ol className="mx-auto flex min-w-max items-center gap-2 px-6 py-4">
        {steps.map((step, idx) => {
          const isComplete = completedSteps.includes(step.number)
          const isSkipped = skippedSteps.includes(step.number)
          const isCurrent = currentStep === step.number

          return (
            <li key={step.number} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={[
                    "flex h-7 w-7 items-center justify-center border text-[11px] font-display font-bold tracking-[1px]",
                    isComplete
                      ? "border-gold bg-gold/10 text-gold"
                      : isCurrent
                        ? "border-crimson bg-crimson text-parchment ring-2 ring-crimson/30"
                        : isSkipped
                          ? "border-dashed border-steel/40 text-steel/40"
                          : "border-steel/30 text-steel/60",
                  ].join(" ")}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isComplete ? <Check className="h-3.5 w-3.5" /> : step.number}
                </span>
                <span
                  className={[
                    "font-display text-[11px] tracking-[2px] uppercase",
                    isCurrent ? "text-parchment" : isComplete ? "text-gold/80" : "text-steel/60",
                  ].join(" ")}
                >
                  {step.shortTitle}
                </span>
              </div>
              {idx < steps.length - 1 ? (
                <span
                  className={[
                    "h-px w-6",
                    completedSteps.includes(steps[idx + 1].number) || isComplete
                      ? "bg-gold/40"
                      : "bg-steel/20",
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
