"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Bell, Calendar, GraduationCap, Rocket } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { StepShell } from "@/components/onboarding/StepShell"
import { configureAutomations } from "@/lib/actions/onboarding/automations"
import { scheduleInitialActions } from "@/lib/actions/onboarding/automations"
import { markComplete } from "@/lib/actions/onboarding/state"
import type {
  AutomationToggles,
  ScheduledAction,
} from "@/lib/types/onboarding"

type ToggleKey = keyof AutomationToggles

type ToggleDef = {
  key: ToggleKey
  title: string
  description: string
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>
}

const TOGGLE_DEFS: ToggleDef[] = [
  {
    key: "expirationSweep",
    title: "Training expiration sweep",
    description:
      "Auto-remind workers and managers 30/14/7 days before certifications expire.",
    icon: GraduationCap,
  },
  {
    key: "regulatoryAlerts",
    title: "Regulatory alerts",
    description:
      "Get notified when OSHA, EPA, or state agencies publish rules that affect you.",
    icon: Bell,
  },
  {
    key: "thirdPartyCoiRequests",
    title: "Third-party COI requests",
    description:
      "Automatically request and track certificates of insurance for every vendor.",
    icon: Rocket,
  },
]

type Props = {
  initialToggles: AutomationToggles
  availableToggles: AutomationToggles
  stepIntro: string
}

export function AutomationsForm({
  initialToggles,
  availableToggles,
  stepIntro,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [toggles, setToggles] = useState<AutomationToggles>(initialToggles)
  const [auditDate, setAuditDate] = useState("")
  const [trainingDate, setTrainingDate] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const visibleToggles = TOGGLE_DEFS.filter((def) => availableToggles[def.key])

  const setToggle = (key: ToggleKey, value: boolean) => {
    setToggles((prev) => ({ ...prev, [key]: value }))
  }

  const buildActions = (): ScheduledAction[] => {
    const actions: ScheduledAction[] = []
    if (auditDate) {
      const iso = new Date(`${auditDate}T09:00:00`).toISOString()
      actions.push({
        kind: "audit",
        label: "First audit review",
        dueAt: iso,
      })
    }
    if (trainingDate) {
      const iso = new Date(`${trainingDate}T09:00:00`).toISOString()
      actions.push({
        kind: "training",
        label: "Team training kickoff",
        dueAt: iso,
      })
    }
    return actions
  }

  const handleLaunch = () => {
    setErrorMessage(null)
    startTransition(async () => {
      const configured = await configureAutomations({ toggles })
      if (!configured.ok) {
        setErrorMessage("We couldn't save your automation preferences. Please try again.")
        return
      }
      const scheduled = await scheduleInitialActions({ actions: buildActions() })
      if (!scheduled.ok) {
        setErrorMessage(
          "Your automations were saved, but scheduling the initial actions failed.",
        )
        return
      }
      const finalized = await markComplete()
      if (!finalized.ok) {
        setErrorMessage("Everything saved, but we couldn't finalize onboarding.")
        return
      }
      toast.success("Welcome aboard. Launching your dashboard.")
      router.push("/dashboard")
    })
  }

  return (
    <StepShell
      stepNumber={7}
      totalSteps={7}
      title="Launch your compliance autopilot"
      intro={stepIntro}
      backHref="/onboarding/documents"
    >
      <div className="flex flex-col gap-8">
        {visibleToggles.length > 0 ? (
          <section className="flex flex-col gap-4">
            <span className="font-display text-[12px] font-semibold tracking-[2px] uppercase text-steel">
              Automations
            </span>
            <ul className="flex flex-col gap-3">
              {visibleToggles.map((def) => {
                const Icon = def.icon
                return (
                  <li
                    key={def.key}
                    className="flex items-start gap-4 border border-brand-white/[0.1] bg-midnight/40 p-4"
                  >
                    <span className="mt-1 flex h-9 w-9 items-center justify-center border border-brand-white/[0.1] bg-void">
                      <Icon className="h-4 w-4 text-gold" aria-hidden={true} />
                    </span>
                    <div className="flex-1">
                      <Label
                        htmlFor={`toggle-${def.key}`}
                        className="font-display text-[14px] font-bold text-parchment"
                      >
                        {def.title}
                      </Label>
                      <p className="mt-1 font-sans text-[12px] text-fog">
                        {def.description}
                      </p>
                    </div>
                    <Switch
                      id={`toggle-${def.key}`}
                      checked={toggles[def.key]}
                      onCheckedChange={(checked) => setToggle(def.key, checked)}
                    />
                  </li>
                )
              })}
            </ul>
          </section>
        ) : null}

        <section className="flex flex-col gap-4">
          <span className="font-display text-[12px] font-semibold tracking-[2px] uppercase text-steel">
            Schedule your first moves
          </span>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-3 border border-brand-white/[0.1] bg-midnight/40 p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gold" aria-hidden="true" />
                <span className="font-display text-[13px] font-semibold text-parchment">
                  First audit review
                </span>
              </div>
              <Label htmlFor="audit-date" className="sr-only">
                First audit review date
              </Label>
              <Input
                id="audit-date"
                type="date"
                value={auditDate}
                onChange={(e) => setAuditDate(e.target.value)}
              />
              <span className="font-sans text-[11px] text-steel">
                Optional. Leave blank to schedule later.
              </span>
            </div>

            <div className="flex flex-col gap-3 border border-brand-white/[0.1] bg-midnight/40 p-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-gold" aria-hidden="true" />
                <span className="font-display text-[13px] font-semibold text-parchment">
                  Team training kickoff
                </span>
              </div>
              <Label htmlFor="training-date" className="sr-only">
                Team training kickoff date
              </Label>
              <Input
                id="training-date"
                type="date"
                value={trainingDate}
                onChange={(e) => setTrainingDate(e.target.value)}
              />
              <span className="font-sans text-[11px] text-steel">
                Optional. We&apos;ll add a task to your dashboard.
              </span>
            </div>
          </div>
        </section>

        {errorMessage ? (
          <div
            role="alert"
            className="border border-crimson/40 bg-crimson/5 p-3 font-sans text-[13px] text-crimson"
          >
            {errorMessage}
          </div>
        ) : null}

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleLaunch}
            disabled={isPending}
            className="gap-2"
          >
            {isPending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-parchment/30 border-t-parchment" />
            ) : (
              <Rocket className="h-4 w-4" />
            )}
            Launch my dashboard
          </Button>
        </div>
      </div>
    </StepShell>
  )
}
