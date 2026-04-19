/**
 * BigGauge — ported from dashboard.jsx:125.
 * 168px SVG arc gauge + label column. Used in Manager Internal header.
 */

import { MetaLabel } from "./MetaLabel"

type BigGaugeProps = {
  score: number
  label: string
}

export function BigGauge({ score, label }: BigGaugeProps) {
  const color = score >= 70 ? "var(--sand)" : "var(--enforcement)"
  const r = 72
  const circumference = 2 * Math.PI * r
  const dashArray = `${(score / 100) * circumference} ${circumference}`
  return (
    <div className="flex items-center gap-6">
      <div className="relative" style={{ width: 168, height: 168 }}>
        <svg viewBox="0 0 168 168" width="168" height="168" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="84" cy="84" r={r} fill="none" stroke="rgba(11,29,58,0.08)" strokeWidth="6" />
          <circle cx="84" cy="84" r={r} fill="none" stroke={color} strokeWidth="6" strokeDasharray={dashArray} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display" style={{ color: "var(--midnight)", fontSize: "44px", fontWeight: 800, lineHeight: 1 }}>
            {score}
            <span style={{ fontSize: "20px", color: "var(--steel)", fontWeight: 500 }}>%</span>
          </span>
          <MetaLabel>Compliant</MetaLabel>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <MetaLabel>Compliance Health</MetaLabel>
        <div className="font-display" style={{ color: "var(--midnight)", fontSize: "22px", fontWeight: 700, lineHeight: 1.15, maxWidth: "18rem" }}>
          {label}
        </div>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1.5">
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--sand)" }} />
            <span className="font-sans" style={{ color: "var(--steel)", fontSize: "12px" }}>12 current</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--sand)" }} />
            <span className="font-sans" style={{ color: "var(--steel)", fontSize: "12px" }}>3 review due</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--enforcement)" }} />
            <span className="font-sans" style={{ color: "var(--steel)", fontSize: "12px" }}>2 missing</span>
          </div>
        </div>
      </div>
    </div>
  )
}
