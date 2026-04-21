"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StepShell, StepFooterNext } from "@/components/onboarding/StepShell"
import { submitBusinessSnapshot } from "@/lib/actions/onboarding/business-snapshot"
import type {
  VerticalSlug,
  WorkerCountRange,
} from "@/lib/types/onboarding"

const US_STATES = [
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" }, { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" },
  { code: "DC", name: "D.C." }, { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" }, { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" }, { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" }, { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" }, { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" }, { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" }, { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" }, { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" }, { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" }, { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" }, { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" }, { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" }, { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" }, { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" }, { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" }, { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" }, { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" }, { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" }, { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" }, { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" }, { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
]

const WORKER_RANGES: { value: WorkerCountRange; label: string; hint: string }[] = [
  { value: "1-10", label: "1–10", hint: "Solo operator or small team" },
  { value: "11-50", label: "11–50", hint: "Growing crew" },
  { value: "51-200", label: "51–200", hint: "Mid-size organization" },
  { value: "200+", label: "200+", hint: "Enterprise" },
]

type VerticalRow = {
  slug: string
  label: string
  risk_tier: string | null
}

type Props = {
  verticals: VerticalRow[]
  initial: {
    vertical: VerticalSlug | null
    operatingStates: string[]
    workerCountRange: WorkerCountRange | null
  }
}

export function BusinessSnapshotForm({ verticals, initial }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [vertical, setVertical] = useState<string>(initial.vertical ?? "")
  const [states, setStates] = useState<string[]>(initial.operatingStates)
  const [workerRange, setWorkerRange] = useState<WorkerCountRange | "">(
    initial.workerCountRange ?? "",
  )

  const canSubmit = Boolean(vertical) && states.length > 0 && Boolean(workerRange)

  const toggleState = (code: string) => {
    setStates((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    startTransition(async () => {
      const result = await submitBusinessSnapshot({
        vertical: vertical as VerticalSlug,
        operatingStates: states,
        workerCountRange: workerRange as WorkerCountRange,
      })

      if (!result.ok) {
        toast.error(result.error === "unknown_vertical"
          ? "That vertical isn't recognized. Try another."
          : result.error === "unauthenticated"
            ? "Please log in again."
            : "Something went wrong. Please try again.")
        return
      }

      // Phase 1A: subsequent steps don't exist yet. Land on dashboard.
      toast.success("Snapshot saved. More onboarding steps coming soon.")
      router.push("/dashboard")
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <StepShell
        stepNumber={1}
        totalSteps={7}
        title="Tell us about your business"
        intro="A few quick answers so Protekon can tailor your compliance plan. About 60 seconds."
      >
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <Label htmlFor="vertical" className="font-display text-[12px] tracking-[2px] uppercase text-steel">
              Primary industry
            </Label>
            <Select value={vertical} onValueChange={setVertical}>
              <SelectTrigger id="vertical" className="bg-midnight/50 border-brand-white/[0.1] h-12">
                <SelectValue placeholder="Select your industry" />
              </SelectTrigger>
              <SelectContent>
                {verticals.map((v) => (
                  <SelectItem key={v.slug} value={v.slug}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="font-display text-[12px] tracking-[2px] uppercase text-steel">
              States you operate in
            </Label>
            <p className="font-sans text-[13px] text-fog">
              Select every state where you have workers or job sites. We&apos;ll tune
              regulatory monitoring to match.
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {US_STATES.map((s) => {
                const selected = states.includes(s.code)
                return (
                  <button
                    type="button"
                    key={s.code}
                    onClick={() => toggleState(s.code)}
                    className={[
                      "border px-2 py-2 font-display text-[12px] font-semibold tracking-[1px] transition-colors",
                      selected
                        ? "border-gold bg-gold/10 text-gold"
                        : "border-brand-white/[0.1] text-steel hover:border-brand-white/[0.2] hover:text-parchment",
                    ].join(" ")}
                    aria-pressed={selected}
                  >
                    {s.code}
                  </button>
                )
              })}
            </div>
            {states.length > 0 ? (
              <p className="mt-1 font-sans text-[12px] text-gold">
                {states.length} state{states.length === 1 ? "" : "s"} selected
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label className="font-display text-[12px] tracking-[2px] uppercase text-steel">
              Workforce size
            </Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4">
              {WORKER_RANGES.map((r) => {
                const selected = workerRange === r.value
                return (
                  <button
                    type="button"
                    key={r.value}
                    onClick={() => setWorkerRange(r.value)}
                    className={[
                      "flex flex-col items-start gap-1 border px-3 py-3 text-left transition-colors",
                      selected
                        ? "border-crimson bg-crimson/5"
                        : "border-brand-white/[0.1] hover:border-brand-white/[0.2]",
                    ].join(" ")}
                    aria-pressed={selected}
                  >
                    <span className={["font-display text-[16px] font-bold", selected ? "text-parchment" : "text-fog"].join(" ")}>
                      {r.label}
                    </span>
                    <span className="font-sans text-[11px] text-steel">{r.hint}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex justify-end">
            <StepFooterNext disabled={!canSubmit} loading={isPending} />
          </div>
        </div>
      </StepShell>
    </form>
  )
}
