"use client"

type Size = "sm" | "md" | "lg"

const SIZE_CONFIG: Record<
  Size,
  { box: number; ring: number; stroke: number; fontSize: number }
> = {
  sm: { box: 48, ring: 40, stroke: 3, fontSize: 14 },
  md: { box: 72, ring: 64, stroke: 4, fontSize: 20 },
  lg: { box: 112, ring: 100, stroke: 5, fontSize: 32 },
}

/**
 * Circular compliance score indicator.
 *
 * Three visual states:
 *   1. score === null     → pulsing gold dot (onboarding / no data yet)
 *   2. score < 50         → crimson ring (at risk)
 *   3. score >= 50        → gold ring (strong / watch)
 *
 * Note: 50-74 and 75+ both render gold. We rely on the surrounding context
 * (posture text, action items, verdict label) to communicate the difference
 * between "strong" and "watch". A third color tier would complicate the
 * visual system without adding clarity.
 */
export function ScoreRing({
  score,
  size = "md",
}: {
  score: number | null
  size?: Size
}) {
  const config = SIZE_CONFIG[size]

  if (score === null) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ width: config.box, height: config.box }}
        aria-label="Score not yet available"
      >
        <div
          className="bg-gold rounded-full animate-pulse-slow"
          style={{
            width: config.stroke * 3,
            height: config.stroke * 3,
          }}
        />
      </div>
    )
  }

  const radius = config.ring / 2 - config.stroke
  const circumference = 2 * Math.PI * radius
  const progress = Math.max(0, Math.min(100, score)) / 100
  const dashOffset = circumference * (1 - progress)

  // Color threshold: below 50 is crimson (at risk). Above is gold.
  // The context around the ring (posture text, verdict label) distinguishes
  // "strong" (75+) from "watch" (50-74).
  const color = score < 50 ? "var(--crimson)" : "var(--gold)"

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: config.box, height: config.box }}
      role="img"
      aria-label={`Compliance score: ${score} out of 100`}
    >
      <svg
        width={config.ring}
        height={config.ring}
        viewBox={`0 0 ${config.ring} ${config.ring}`}
        className="-rotate-90"
      >
        {/* Track */}
        <circle
          cx={config.ring / 2}
          cy={config.ring / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.08}
          strokeWidth={config.stroke}
        />
        {/* Progress */}
        <circle
          cx={config.ring / 2}
          cy={config.ring / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={config.stroke}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="butt"
          style={{ transition: "stroke-dashoffset 600ms ease-out" }}
        />
      </svg>
      <div
        className="absolute font-display font-bold leading-none"
        style={{ fontSize: config.fontSize }}
      >
        {score}
      </div>
    </div>
  )
}
