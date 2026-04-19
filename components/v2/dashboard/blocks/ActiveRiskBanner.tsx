/**
 * ActiveRiskBanner — ported from dashboard.jsx:169.
 * Enforcement-tinted banner announcing the 2 critical gaps + one-click resolve CTA.
 */

import { Warning } from "@phosphor-icons/react/dist/ssr"

export function ActiveRiskBanner() {
  return (
    <div
      className="flex items-start gap-3 px-5 py-4"
      style={{
        background: "rgba(196,18,48,0.06)",
        borderLeft: "3px solid var(--enforcement)",
        border: "1px solid rgba(196,18,48,0.15)",
      }}
    >
      <div style={{ color: "var(--enforcement)", marginTop: 2 }}>
        <Warning size={18} />
      </div>
      <div className="flex-1">
        <div
          className="font-display uppercase mb-1"
          style={{ color: "var(--enforcement)", fontSize: "10px", letterSpacing: "2px", fontWeight: 600 }}
        >
          Active Risk · 2 critical gaps
        </div>
        <div className="font-sans" style={{ color: "var(--midnight)", fontSize: "14px", lineHeight: 1.5 }}>
          <strong>Hearing Conservation Program</strong> not on file — mandatory under 29 CFR 1910.95
          given your noise-exposure profile. <strong>IIPP</strong> annual review is 42 days overdue.
          Both resolve with one-click generation.
        </div>
      </div>
      <button
        className="px-3 py-2 font-display uppercase"
        style={{
          background: "var(--enforcement)",
          color: "var(--parchment)",
          fontSize: "10px",
          letterSpacing: "2px",
          fontWeight: 600,
          border: "none",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        Resolve both
      </button>
    </div>
  )
}
