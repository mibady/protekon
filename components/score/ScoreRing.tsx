"use client"

interface ScoreRingProps {
  score: number
  total?: number
  size?: number
}

export default function ScoreRing({ score, total = 6, size = 200 }: ScoreRingProps) {
  const center = size / 2
  const radius = size / 2 - 12
  const segmentGap = 4 // degrees
  const segmentArc = 360 / total - segmentGap

  const tierLabel =
    score === total
      ? "Fully Covered"
      : score >= 4
        ? "Gaps Detected"
        : "At Risk"

  const tierColor =
    score === total
      ? "#22c55e"
      : score >= 4
        ? "#eab308"
        : "#ef4444"

  function describeArc(startAngle: number, endAngle: number): string {
    const startRad = ((startAngle - 90) * Math.PI) / 180
    const endRad = ((endAngle - 90) * Math.PI) / 180

    const x1 = center + radius * Math.cos(startRad)
    const y1 = center + radius * Math.sin(startRad)
    const x2 = center + radius * Math.cos(endRad)
    const y2 = center + radius * Math.sin(endRad)

    const largeArc = endAngle - startAngle > 180 ? 1 : 0

    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`
  }

  const segments = Array.from({ length: total }, (_, i) => {
    const startAngle = i * (segmentArc + segmentGap)
    const endAngle = startAngle + segmentArc
    const isFilled = i < score

    return (
      <path
        key={i}
        d={describeArc(startAngle, endAngle)}
        fill="none"
        stroke={isFilled ? "#22c55e" : "rgba(239, 68, 68, 0.3)"}
        strokeWidth={10}
        strokeLinecap="round"
        className="transition-all duration-700 ease-out"
        style={{ transitionDelay: `${i * 100}ms` }}
      />
    )
  })

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments}
        <text
          x={center}
          y={center - 8}
          textAnchor="middle"
          dominantBaseline="middle"
          className="font-display font-black text-parchment"
          fill="currentColor"
          fontSize={size * 0.22}
        >
          {score} / {total}
        </text>
        <text
          x={center}
          y={center + size * 0.12}
          textAnchor="middle"
          dominantBaseline="middle"
          className="font-sans text-steel"
          fill="currentColor"
          fontSize={size * 0.07}
        >
          compliance areas
        </text>
      </svg>
      <span
        className="font-display font-bold text-[16px] tracking-[2px] uppercase"
        style={{ color: tierColor }}
      >
        {tierLabel}
      </span>
    </div>
  )
}
