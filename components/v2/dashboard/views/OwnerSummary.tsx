"use client"

/**
 * OwnerSummary — ported from dashboard.jsx:708.
 * Single-line CTA strip that opens the full Manager registry.
 */

import { File as FileIcon, ArrowRight } from "@phosphor-icons/react/dist/ssr"
import { CANONICAL_NINE, INDUSTRY_HAZARDS, SPECIALIZED } from "../mocks"

type OwnerSummaryProps = {
  onExpand: () => void
}

export function OwnerSummary({ onExpand }: OwnerSummaryProps) {
  const total = CANONICAL_NINE.length + INDUSTRY_HAZARDS.length + SPECIALIZED.length
  const need = [...CANONICAL_NINE, ...INDUSTRY_HAZARDS, ...SPECIALIZED].filter(
    (t) => t.status === "missing" || t.status === "review_due"
  ).length
  return (
    <button
      onClick={onExpand}
      className="w-full flex items-center justify-between p-5 text-left transition-colors hover:brightness-105"
      style={{
        background: "var(--white)",
        border: "1px solid rgba(11,29,58,0.08)",
        cursor: "pointer",
      }}
    >
      <div className="flex items-center gap-5">
        <span style={{ color: "var(--sand)" }}>
          <FileIcon size={22} />
        </span>
        <div>
          <div
            className="font-display"
            style={{ color: "var(--midnight)", fontSize: "17px", fontWeight: 600 }}
          >
            {total} documents on file · {need} need your attention
          </div>
          <div className="font-sans mt-1" style={{ color: "var(--steel)", fontSize: "12px" }}>
            I&apos;ll surface the ones that need work above. Open the full registry only if you want to dig in.
          </div>
        </div>
      </div>
      <span
        className="font-display uppercase flex items-center gap-2"
        style={{ color: "var(--enforcement)", fontSize: "10px", letterSpacing: "2px", fontWeight: 600 }}
      >
        Open full registry <ArrowRight size={12} />
      </span>
    </button>
  )
}
