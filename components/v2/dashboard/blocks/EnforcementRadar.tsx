/**
 * EnforcementRadar — ported from dashboard.jsx:567.
 * Void-background widget: large headline + 4 citation tiles + reassurance footnote.
 */

import { RADAR_CITATIONS } from "../mocks"

export function EnforcementRadar() {
  return (
    <div
      style={{
        background: "var(--void)",
        color: "var(--parchment)",
        padding: "20px 22px",
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div
            className="font-display uppercase mb-1"
            style={{ color: "var(--sand)", fontSize: "10px", letterSpacing: "2px", fontWeight: 600 }}
          >
            Enforcement Radar · Nearby activity
          </div>
          <div
            className="font-display"
            style={{ color: "var(--white)", fontSize: "20px", fontWeight: 700, lineHeight: 1.2 }}
          >
            17 citations in your vertical + geography, last 30 days.
          </div>
        </div>
        <button
          className="font-display uppercase"
          style={{
            color: "var(--sand)",
            background: "transparent",
            border: "none",
            fontSize: "10px",
            letterSpacing: "2px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Open feed →
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {RADAR_CITATIONS.map((c) => (
          <div
            key={`${c.trade}-${c.distance}`}
            className="flex items-start gap-3 p-3"
            style={{
              background: "rgba(250,250,248,0.03)",
              border: "1px solid rgba(250,250,248,0.08)",
            }}
          >
            <span
              className="font-display"
              style={{
                color: "var(--enforcement)",
                fontSize: "26px",
                fontWeight: 800,
                lineHeight: 1,
                minWidth: 36,
              }}
            >
              {c.count}
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-sans" style={{ color: "var(--white)", fontSize: "13px", fontWeight: 500 }}>
                {c.trade}
              </div>
              <div className="font-sans" style={{ color: "var(--fog)", fontSize: "11px", marginTop: 2 }}>
                {c.distance} · {c.window}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 font-sans italic" style={{ color: "var(--fog)", fontSize: "11px" }}>
        You have current documents on 3 of 4 exposure areas. The 4th — WVPP — is current, so you&apos;re covered.
      </div>
    </div>
  )
}
