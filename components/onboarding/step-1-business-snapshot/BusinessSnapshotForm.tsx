"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  BriefcaseBusiness,
  Building2,
  Factory,
  HardHat,
  HeartPulse,
  ShoppingBag,
  Truck,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StepShell, StepFooterNext } from "@/components/onboarding/StepShell"
import { submitBusinessSnapshot } from "@/lib/actions/onboarding/business-snapshot"
import type { VerticalSlug, WorkerCountRange } from "@/lib/types/onboarding"

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID",
  "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO",
  "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA",
  "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
]

const FEATURED_INDUSTRIES = [
  { slug: "construction", label: "Construction", icon: HardHat },
  { slug: "healthcare", label: "Healthcare", icon: HeartPulse },
  { slug: "manufacturing", label: "Manufacturing", icon: Factory },
  { slug: "logistics", label: "Logistics", icon: Truck },
  { slug: "retail", label: "Retail", icon: ShoppingBag },
  { slug: "professional_services", label: "Professional Services", icon: BriefcaseBusiness },
]

const WORKER_RANGES: { value: WorkerCountRange; label: string }[] = [
  { value: "1-10", label: "1-10" },
  { value: "11-50", label: "11-50" },
  { value: "51-200", label: "51-200" },
  { value: "200+", label: "200+" },
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
  totalSteps: number
}

function workerIndex(value: WorkerCountRange | ""): number {
  const index = WORKER_RANGES.findIndex((range) => range.value === value)
  return index >= 0 ? index : 1
}

export function BusinessSnapshotForm({ verticals, initial, totalSteps }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [vertical, setVertical] = useState<string | undefined>(initial.vertical ?? undefined)
  const [industrySearch, setIndustrySearch] = useState("")
  const [states, setStates] = useState<string[]>(initial.operatingStates)
  const [workerRange, setWorkerRange] = useState<WorkerCountRange | "">(
    initial.workerCountRange ?? "",
  )

  const verticalMap = useMemo(() => new Map(verticals.map((v) => [v.slug, v])), [verticals])
  const featured = FEATURED_INDUSTRIES.filter((item) => verticalMap.has(item.slug))
  const otherMatches = verticals
    .filter((v) => !FEATURED_INDUSTRIES.some((item) => item.slug === v.slug))
    .filter((v) => v.label.toLowerCase().includes(industrySearch.toLowerCase()))
    .slice(0, 6)

  const canSubmit = Boolean(vertical) && states.length > 0 && Boolean(workerRange)
  const selectedWorkerIndex = workerIndex(workerRange)
  const sliderFill = `${(selectedWorkerIndex / (WORKER_RANGES.length - 1)) * 100}%`

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
        toast.error(
          result.error === "unknown_vertical"
            ? "That vertical isn't recognized. Try another."
            : result.error === "unauthenticated"
              ? "Please log in again."
              : "Something went wrong. Please try again.",
        )
        return
      }

      toast.success("Business snapshot saved.")
      router.push("/onboarding/sites")
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <StepShell
        stepNumber={1}
        totalSteps={totalSteps}
        title="Tell us about your business"
        intro="A few quick answers so Protekon can tailor your compliance plan. About 60 seconds."
      >
        <div className="flex flex-col gap-10">
          <section className="flex flex-col gap-4">
            <Label className="font-display text-[12px] tracking-[2px] text-steel uppercase">
              Primary industry
            </Label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {featured.map((item) => {
                const Icon = item.icon
                const selected = vertical === item.slug
                return (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => setVertical(item.slug)}
                    className={[
                      "flex min-h-28 flex-col items-start justify-between border bg-midnight/50 p-4 text-left transition-all hover:border-gold hover:text-gold",
                      selected ? "border-gold text-parchment" : "border-brand-white/[0.1] text-fog",
                    ].join(" ")}
                    aria-pressed={selected}
                  >
                    <Icon className={selected ? "h-5 w-5 text-gold" : "h-5 w-5 text-steel"} />
                    <span className="font-display text-[13px] font-bold tracking-[1px] uppercase">
                      {item.label}
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="flex flex-col gap-2">
              <Input
                value={industrySearch}
                onChange={(e) => setIndustrySearch(e.target.value)}
                placeholder="Other industries"
                className="border-0 border-b border-brand-white/[0.2] bg-void px-0 font-sans text-parchment shadow-none focus-visible:ring-0"
              />
              {industrySearch.trim() ? (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {otherMatches.map((match) => (
                    <button
                      key={match.slug}
                      type="button"
                      onClick={() => setVertical(match.slug)}
                      className={[
                        "flex items-center gap-2 border px-3 py-2 text-left font-sans text-[12px] transition-all hover:border-gold hover:text-gold",
                        vertical === match.slug
                          ? "border-gold bg-gold/5 text-parchment"
                          : "border-brand-white/[0.08] bg-midnight/40 text-fog",
                      ].join(" ")}
                    >
                      <Building2 className="h-4 w-4 text-steel" />
                      {match.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <div>
              <Label className="font-display text-[12px] tracking-[2px] text-steel uppercase">
                States you operate in
              </Label>
              <p className="mt-2 font-sans text-[13px] leading-[1.6] text-fog">
                Select every state where you have workers or job sites.
              </p>
            </div>
            <div className="grid grid-cols-6 gap-2 sm:grid-cols-9 lg:grid-cols-10">
              {US_STATES.map((code) => {
                const selected = states.includes(code)
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => toggleState(code)}
                    className={[
                      "h-10 border font-display text-[11px] font-bold tracking-[1px] transition-all",
                      selected
                        ? "border-gold bg-gold/10 text-gold"
                        : "border-brand-white/[0.1] bg-midnight/40 text-steel hover:border-gold hover:text-gold",
                    ].join(" ")}
                    aria-pressed={selected}
                  >
                    {code}
                  </button>
                )
              })}
            </div>
            {states.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {states.map((code) => (
                  <Badge
                    key={code}
                    className="border border-gold/20 bg-gold/10 font-display text-[11px] tracking-[1px] text-gold hover:bg-gold/10"
                  >
                    {code}
                  </Badge>
                ))}
              </div>
            ) : null}
          </section>

          <section className="flex flex-col gap-5">
            <Label className="font-display text-[12px] tracking-[2px] text-steel uppercase">
              Workforce size
            </Label>
            <input
              type="range"
              min={0}
              max={WORKER_RANGES.length - 1}
              step={1}
              value={selectedWorkerIndex}
              onChange={(e) => setWorkerRange(WORKER_RANGES[Number(e.target.value)].value)}
              className="h-2 w-full cursor-pointer appearance-none rounded-full [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-parchment [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-parchment"
              style={{
                background: `linear-gradient(to right, var(--gold) 0%, var(--gold) ${sliderFill}, var(--midnight) ${sliderFill}, var(--midnight) 100%)`,
              }}
            />
            <div className="grid grid-cols-4 gap-2">
              {WORKER_RANGES.map((range) => (
                <button
                  key={range.value}
                  type="button"
                  onClick={() => setWorkerRange(range.value)}
                  className={[
                    "font-display text-[11px] tracking-[1px] transition-colors",
                    workerRange === range.value ? "text-gold" : "text-steel hover:text-fog",
                  ].join(" ")}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </section>

          <div className="flex justify-end">
            <StepFooterNext disabled={!canSubmit || isPending} loading={isPending} />
          </div>
        </div>
      </StepShell>
    </form>
  )
}
