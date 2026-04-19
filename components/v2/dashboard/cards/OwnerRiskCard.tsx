"use client"

/**
 * OwnerRiskCard — ported from dashboard.jsx:769.
 * Big enforcement-accented action card used in the Owner Internal "what needs your
 * attention" list. Warning icon + title + detail + primary enforcement CTA.
 */

import { Warning } from "@phosphor-icons/react/dist/ssr"

type OwnerRiskCardProps = {
  title: string
  detail: string
  cta: string
  onClick?: () => void
}

export function OwnerRiskCard({ title, detail, cta, onClick }: OwnerRiskCardProps) {
  return (
    <div
      className="p-5 flex items-start gap-4"
      style={{
        background: "var(--white)",
        border: "1px solid rgba(196,18,48,0.2)",
        borderLeft: "3px solid var(--enforcement)",
      }}
    >
      <div style={{ color: "var(--enforcement)", marginTop: 3 }}>
        <Warning size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="font-display"
          style={{ color: "var(--midnight)", fontSize: "18px", fontWeight: 700, lineHeight: 1.25, marginBottom: 6 }}
        >
          {title}
        </div>
        <div className="font-sans" style={{ color: "var(--steel)", fontSize: "13px", lineHeight: 1.5 }}>
          {detail}
        </div>
      </div>
      <button
        onClick={onClick}
        className="px-4 py-2 font-display uppercase flex-shrink-0"
        style={{
          background: "var(--enforcement)",
          color: "var(--parchment)",
          fontSize: "10px",
          letterSpacing: "2px",
          fontWeight: 600,
          border: "none",
          cursor: "pointer",
        }}
      >
        {cta}
      </button>
    </div>
  )
}
