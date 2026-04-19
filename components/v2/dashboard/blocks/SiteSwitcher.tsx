"use client"

/**
 * SiteSwitcher — ported from dashboard.jsx:1512.
 * Void-background dropdown scoped to live site rollup rows. Click to reveal all
 * sites + their derived "score" (training %) + note. Emits the selected site id.
 */

import { useState } from "react"
import { CaretDown } from "@phosphor-icons/react/dist/ssr"
import type { SiteRollupRow } from "@/lib/actions/rollup"

type SiteSwitcherProps = {
  siteKey: string
  onChange: (siteKey: string) => void
  sites: SiteRollupRow[]
}

function siteScore(row: SiteRollupRow): number {
  return Math.max(0, Math.min(100, Math.round(row.training_pct)))
}

function siteNote(row: SiteRollupRow): string {
  const headcount = row.employee_count
  const trainingSummary = `${row.training_complete}/${row.training_total} training complete`
  if (headcount && headcount > 0) {
    return `${headcount} worker${headcount === 1 ? "" : "s"} · ${trainingSummary}`
  }
  return trainingSummary
}

function scoreColor(score: number): string {
  if (score >= 85) return "var(--sand)"
  if (score >= 75) return "var(--sand)"
  return "var(--enforcement)"
}

export function SiteSwitcher({ siteKey, onChange, sites }: SiteSwitcherProps) {
  const [open, setOpen] = useState(false)

  if (sites.length === 0) return null

  const activeRow = sites.find((s) => s.site_id === siteKey) ?? sites[0]
  const activeScore = siteScore(activeRow)
  const scoreCol = scoreColor(activeScore)
  const scope = activeRow.is_primary ? "Shop" : "Project"

  return (
    <div
      className="mb-8"
      style={{ background: "var(--void)", color: "var(--parchment)", position: "relative" }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 px-5 py-4"
        style={{ background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
      >
        <div
          className="font-display uppercase"
          style={{ color: "var(--sand)", fontSize: "10px", letterSpacing: "2px", fontWeight: 600, minWidth: 110 }}
        >
          Viewing site
        </div>
        <div className="flex-1 flex items-baseline gap-3" style={{ minWidth: 0 }}>
          <div
            className="font-display"
            style={{ color: "var(--white)", fontSize: "22px", fontWeight: 600, whiteSpace: "nowrap" }}
          >
            {activeRow.site_name}
          </div>
          <div
            className="font-display uppercase"
            style={{
              color: "var(--fog)",
              fontSize: "10px",
              letterSpacing: "2px",
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            · {scope}
          </div>
          <div
            className="font-sans"
            style={{
              color: "var(--fog)",
              fontSize: "12px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {siteNote(activeRow)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="font-display uppercase"
            style={{ color: "var(--fog)", fontSize: "9px", letterSpacing: "2px", fontWeight: 500 }}
          >
            Score
          </div>
          <div
            className="font-display"
            style={{ color: scoreCol, fontSize: "26px", fontWeight: 700, lineHeight: 1 }}
          >
            {activeScore}
          </div>
        </div>
        <div style={{ color: "var(--fog)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
          <CaretDown size={16} />
        </div>
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 50,
            background: "var(--white)",
            color: "var(--midnight)",
            border: "1px solid rgba(11,29,58,0.12)",
            boxShadow: "0 12px 40px rgba(11,29,58,0.18)",
          }}
        >
          {sites.map((s) => {
            const score = siteScore(s)
            const col = scoreColor(score)
            const rowScope = s.is_primary ? "Shop" : "Project"
            return (
              <button
                key={s.site_id}
                onClick={() => {
                  onChange(s.site_id)
                  setOpen(false)
                }}
                className="w-full flex items-center gap-4 px-5 py-3"
                style={{
                  background: s.site_id === siteKey ? "rgba(201,168,76,0.08)" : "transparent",
                  border: "none",
                  borderBottom: "1px solid rgba(11,29,58,0.05)",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div
                  className="font-display uppercase"
                  style={{
                    color: "var(--steel)",
                    fontSize: "9px",
                    letterSpacing: "2px",
                    fontWeight: 600,
                    minWidth: 70,
                  }}
                >
                  {rowScope}
                </div>
                <div className="flex-1">
                  <div
                    className="font-sans"
                    style={{ color: "var(--midnight)", fontSize: "14px", fontWeight: 500 }}
                  >
                    {s.site_name}
                  </div>
                  <div className="font-sans" style={{ color: "var(--steel)", fontSize: "11px", marginTop: 2 }}>
                    {siteNote(s)}
                  </div>
                </div>
                <div
                  className="font-display"
                  style={{ color: col, fontSize: "18px", fontWeight: 700 }}
                >
                  {score}
                </div>
              </button>
            )
          })}
          <div
            className="px-5 py-3 font-sans italic"
            style={{ color: "var(--steel)", fontSize: "11px", background: "var(--parchment)" }}
          >
            Switching site re-scopes every widget on this page — score, templates, gaps, vendors, alerts.
          </div>
        </div>
      )}
    </div>
  )
}
