"use client"

import { motion } from "framer-motion"

interface ScoreRingProps {
  score: number
  total?: number
  max?: number
  size?: number
  fineExposure?: { low: number; high: number } | null
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function ScoreRing({
  score,
  total,
  max,
  size = 160,
  fineExposure = null,
}: ScoreRingProps) {
  const maxScore = max ?? total ?? 11
  const center = size / 2
  const radius = size / 2 - 12
  const circumference = 2 * Math.PI * radius
  const strokeWidth = 8

  const ratio = maxScore > 0 ? score / maxScore : 0

  const tierLabel =
    ratio >= 0.9
      ? "Fully Compliant"
      : ratio >= 0.6
        ? "Gaps Detected"
        : score >= 1
          ? "At Risk"
          : "Not Compliant"

  const tierColor =
    ratio >= 0.9
      ? "#10B981"
      : ratio >= 0.6
        ? "#C9A84C"
        : "#C41230"

  const filledFraction = ratio
  const dashArray = `${circumference * filledFraction} ${circumference * (1 - filledFraction)}`

  return (
    <div className="relative flex flex-col items-center gap-3">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(122, 143, 165, 0.15)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={tierColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={dashArray}
          strokeDashoffset={0}
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: dashArray }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <div
        className="absolute flex flex-col items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span
          className="font-mono font-bold"
          style={{ fontSize: size * 0.175, color: tierColor }}
        >
          {score}/{maxScore}
        </span>
      </div>
      <span
        className="font-display font-semibold text-[13px] tracking-[1px] uppercase"
        style={{ color: tierColor }}
      >
        {tierLabel}
      </span>
      {fineExposure && fineExposure.low > 0 && (
        <div className="flex flex-col items-center mt-1">
          <span className="font-sans text-[13px] text-steel">
            Estimated fine exposure:
          </span>
          <span className="font-mono text-[24px] font-bold text-crimson">
            {formatCurrency(fineExposure.low)}&ndash;{formatCurrency(fineExposure.high)}
          </span>
        </div>
      )}
    </div>
  )
}
