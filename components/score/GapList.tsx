"use client"

import { X } from "@phosphor-icons/react"
import type { ScoreGap } from "@/lib/types/score"

interface GapListProps {
  gaps: ScoreGap[]
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function GapList({ gaps }: GapListProps) {
  if (gaps.length === 0) return null

  return (
    <div className="flex flex-col gap-4">
      {gaps.map((gap) => (
        <div
          key={gap.key}
          className="bg-midnight border border-brand-white/[0.06] p-5"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <X size={18} weight="bold" className="text-crimson" />
            </div>
            <div className="flex-1">
              <p className="font-display font-bold text-[15px] text-parchment mb-1">
                {gap.label}
              </p>
              <p className="font-sans text-[14px] text-steel leading-relaxed mb-2">
                {gap.description}
              </p>
              <p className="font-sans text-[13px] text-crimson/80">
                Average citation: {formatCurrency(gap.citation_amount)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
