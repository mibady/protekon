/**
 * OwnerHeroGauge — ported from dashboard.jsx:745.
 * 240px SVG gauge with giant numeric + "Audit-ready" label. Used inside OwnerInternal.
 */

type OwnerHeroGaugeProps = {
  score: number
}

export function OwnerHeroGauge({ score }: OwnerHeroGaugeProps) {
  const color = score >= 70 ? "var(--sand)" : "var(--enforcement)"
  const r = 104
  const circumference = 2 * Math.PI * r
  const dashArray = `${(score / 100) * circumference} ${circumference}`
  return (
    <div className="relative flex-shrink-0" style={{ width: 240, height: 240 }}>
      <svg viewBox="0 0 240 240" width="240" height="240" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="120" cy="120" r={r} fill="none" stroke="rgba(11,29,58,0.08)" strokeWidth="8" />
        <circle
          cx="120"
          cy="120"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={dashArray}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-display"
          style={{ color: "var(--midnight)", fontSize: "72px", fontWeight: 800, lineHeight: 1 }}
        >
          {score}
          <span style={{ fontSize: "28px", color: "var(--steel)", fontWeight: 500 }}>%</span>
        </span>
        <span
          className="font-display uppercase mt-1"
          style={{ color: "var(--sand)", fontSize: "11px", letterSpacing: "3px", fontWeight: 600 }}
        >
          Audit-ready
        </span>
      </div>
    </div>
  )
}
