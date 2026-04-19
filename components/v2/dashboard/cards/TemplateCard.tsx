"use client"

/**
 * TemplateCard — ported from dashboard.jsx:326.
 * Progressive-disclosure card: click to expand retention / review / next action.
 */

import { useState } from "react"
import type { Template } from "../mocks"
import { StatusBadge } from "../atoms/StatusBadge"
import { MetaLabel } from "../atoms/MetaLabel"

type TemplateCardProps = {
  tpl: Template
  accent?: string | null
}

export function TemplateCard({ tpl, accent = null }: TemplateCardProps) {
  const [open, setOpen] = useState(false)
  const hasCrit = tpl.status === "missing" || tpl.status === "review_due"
  const borderColor = hasCrit ? "rgba(196,18,48,0.25)" : "rgba(11,29,58,0.1)"

  return (
    <div
      style={{
        background: "var(--white)",
        border: `1px solid ${borderColor}`,
        borderLeft: accent ? `3px solid ${accent}` : undefined,
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-4 text-left flex items-start gap-3"
        style={{ background: "transparent", border: "none", cursor: "pointer" }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div
              className="font-display"
              style={{ color: "var(--midnight)", fontSize: "15px", fontWeight: 600, lineHeight: 1.2 }}
            >
              {tpl.name}
            </div>
            <StatusBadge status={tpl.status} />
          </div>
          <div className="font-sans" style={{ color: "var(--steel)", fontSize: "11px" }}>
            {tpl.authority}
          </div>
        </div>
        <span
          style={{
            color: "var(--steel)",
            fontSize: "10px",
            marginTop: 6,
            transform: open ? "rotate(180deg)" : "rotate(0)",
            transition: "transform 0.2s",
            display: "inline-block",
          }}
        >
          ▾
        </span>
      </button>

      {open && (
        <div
          className="px-4 pb-4 pt-1 grid grid-cols-3 gap-3"
          style={{ borderTop: "1px solid rgba(11,29,58,0.06)" }}
        >
          <div>
            <MetaLabel>Retention</MetaLabel>
            <div className="font-sans mt-1" style={{ color: "var(--midnight)", fontSize: "13px" }}>
              {tpl.retention_years} {tpl.retention_years === 1 ? "year" : "years"}
            </div>
          </div>
          <div>
            <MetaLabel>Review cycle</MetaLabel>
            <div className="font-sans mt-1" style={{ color: "var(--midnight)", fontSize: "13px" }}>
              {tpl.review}
            </div>
          </div>
          <div>
            <MetaLabel>Last updated</MetaLabel>
            <div className="font-sans mt-1" style={{ color: "var(--midnight)", fontSize: "13px" }}>
              {tpl.updated}
            </div>
          </div>
          <div
            className="col-span-3 flex items-center justify-between pt-2"
            style={{ borderTop: "1px solid rgba(11,29,58,0.06)" }}
          >
            <div>
              <MetaLabel>Next action</MetaLabel>
              <div
                className="font-sans mt-1"
                style={{
                  color: hasCrit ? "var(--enforcement)" : "var(--midnight)",
                  fontSize: "13px",
                  fontWeight: tpl.status === "missing" ? 600 : 400,
                }}
              >
                {tpl.next_review}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {tpl.status === "missing" ? (
                <button
                  className="px-3 py-1.5 font-display uppercase"
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
                  Generate now
                </button>
              ) : (
                <button
                  className="px-3 py-1.5 font-display uppercase"
                  style={{
                    background: "transparent",
                    color: "var(--midnight)",
                    fontSize: "10px",
                    letterSpacing: "2px",
                    fontWeight: 600,
                    border: "1px solid rgba(11,29,58,0.15)",
                    cursor: "pointer",
                  }}
                >
                  View document
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
