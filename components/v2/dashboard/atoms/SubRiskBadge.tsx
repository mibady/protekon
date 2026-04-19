/**
 * SubRiskBadge — ported from dashboard.jsx:1209.
 * Colored-dot + "Low/Medium/High risk" pill for subcontractor rows.
 */

type Risk = "low" | "medium" | "high"

const MAP: Record<Risk, { label: string; color: string }> = {
  low:    { label: "Low",    color: "var(--sand)" },
  medium: { label: "Medium", color: "var(--sand)" },
  high:   { label: "High",   color: "var(--enforcement)" },
}

export function SubRiskBadge({ risk }: { risk: Risk }) {
  const r = MAP[risk] ?? MAP.low
  return (
    <span
      className="font-display uppercase inline-flex items-center gap-1.5"
      style={{ color: r.color, fontSize: "10px", letterSpacing: "2px", fontWeight: 600 }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: r.color }} />
      {r.label} risk
    </span>
  )
}
