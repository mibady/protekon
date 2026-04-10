"use client"

import { motion } from "framer-motion"
import type { ScoreGap } from "@/lib/types/score"

interface GapCardsProps {
  gaps: ScoreGap[]
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function GapCards({ gaps }: GapCardsProps) {
  if (gaps.length === 0) return null

  return (
    <div className="flex flex-col gap-4">
      {gaps.map((gap, i) => (
        <motion.div
          key={gap.key}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.08 }}
          className="bg-brand-white border border-midnight/[0.08] border-l-[3px] border-l-crimson p-4"
        >
          <p className="font-display text-[15px] font-semibold text-midnight">
            {gap.label}
          </p>
          <p className="font-sans text-[12px] font-medium text-steel mt-0.5">
            {gap.citation}
          </p>
          <p className="font-mono text-[14px] font-semibold text-crimson mt-1">
            Fine: {formatCurrency(gap.citation_amount)}
          </p>
          <p className="font-sans text-[14px] text-steel leading-relaxed mt-2">
            {gap.description}
          </p>
        </motion.div>
      ))}
    </div>
  )
}
