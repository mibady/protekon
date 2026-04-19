/**
 * SeasonalTimeline — ported from dashboard.jsx:421.
 * Horizontal Jan→Dec calendar with colored window bands + a "Today" vertical line.
 */

import { SectionLabel } from "@/components/v2/primitives/SectionLabel"
import { SEASONAL_WINDOWS, type SeasonalWindow } from "../mocks"

const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"] as const

function toneColor(tone: SeasonalWindow["tone"]): string {
  if (tone === "enforcement") return "var(--enforcement)"
  if (tone === "sand") return "var(--sand)"
  return "var(--steel)"
}

function toneBg(tone: SeasonalWindow["tone"]): string {
  if (tone === "enforcement") return "rgba(196,18,48,0.15)"
  if (tone === "sand") return "rgba(201,168,76,0.2)"
  return "rgba(122,143,165,0.15)"
}

export function SeasonalTimeline() {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86_400_000)
  const nowPct = (dayOfYear / 365) * 100

  return (
    <div
      style={{
        background: "var(--white)",
        border: "1px solid rgba(11,29,58,0.08)",
        padding: "20px 24px",
      }}
    >
      <div className="flex items-baseline justify-between mb-5">
        <div>
          <SectionLabel>Seasonal Compliance Calendar</SectionLabel>
          <div
            className="font-display"
            style={{ color: "var(--midnight)", fontSize: "18px", fontWeight: 600 }}
          >
            You&apos;re in 2 active windows right now.
          </div>
        </div>
        <span className="font-sans" style={{ color: "var(--steel)", fontSize: "12px" }}>
          {now.toLocaleDateString("en-US", { month: "long", day: "numeric" })} · {now.getFullYear()}
        </span>
      </div>

      <div className="relative" style={{ paddingLeft: 0, paddingRight: 0 }}>
        {/* NOW vertical line */}
        <div
          className="absolute"
          style={{
            left: `${nowPct}%`,
            top: 0,
            bottom: 28,
            width: 1,
            background: "var(--enforcement)",
            zIndex: 2,
          }}
        />
        <div
          className="absolute font-display uppercase"
          style={{
            left: `${nowPct}%`,
            top: -2,
            transform: "translateX(-50%)",
            color: "var(--enforcement)",
            fontSize: "9px",
            letterSpacing: "2px",
            fontWeight: 600,
            background: "var(--white)",
            padding: "0 6px",
            zIndex: 3,
          }}
        >
          Today
        </div>

        <div style={{ height: 12 }} />
        {SEASONAL_WINDOWS.map((w) => {
          const left = (w.startMonth / 12) * 100
          const right = ((w.endMonth + 1) / 12) * 100
          const width = right - left
          const isActive = nowPct >= left && nowPct <= right
          return (
            <div key={w.id} className="relative mb-2" style={{ height: 28 }}>
              <div
                className="absolute inset-y-0 flex items-center px-3"
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                  background: toneBg(w.tone),
                  borderLeft: `2px solid ${toneColor(w.tone)}`,
                }}
              >
                <span
                  className="font-display uppercase truncate"
                  style={{
                    color: "var(--midnight)",
                    fontSize: "10px",
                    letterSpacing: "1.5px",
                    fontWeight: 600,
                  }}
                >
                  {w.label}
                </span>
                {isActive && (
                  <span
                    className="font-display uppercase ml-auto"
                    style={{
                      color: toneColor(w.tone),
                      fontSize: "9px",
                      letterSpacing: "2px",
                      fontWeight: 700,
                    }}
                  >
                    Active
                  </span>
                )}
              </div>
            </div>
          )
        })}

        <div
          className="relative mt-2"
          style={{ height: 16, borderTop: "1px solid rgba(11,29,58,0.08)" }}
        >
          {MONTHS.map((m, i) => {
            const left = (i / 12) * 100 + (1 / 24) * 100
            return (
              <span
                key={`${m}-${i}`}
                className="absolute font-display uppercase"
                style={{
                  left: `${left}%`,
                  top: 4,
                  transform: "translateX(-50%)",
                  color: "var(--steel)",
                  fontSize: "10px",
                  letterSpacing: "2px",
                  fontWeight: 500,
                }}
              >
                {m}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
