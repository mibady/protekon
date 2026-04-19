"use client"

/**
 * GapAnalysisBlock — ported from dashboard.jsx:977.
 * Empty-state generate buttons. Surfaces every `missing` + `review_due` template
 * across Canonical Nine / Industry Hazards / Specialized with one-click Generate.
 */

import { useState } from "react"
import { CANONICAL_NINE, INDUSTRY_HAZARDS, SPECIALIZED, type Template } from "../mocks"

export function GapAnalysisBlock() {
  const [generated, setGenerated] = useState<Record<string, boolean>>({})

  const allTemplates: Template[] = [...CANONICAL_NINE, ...INDUSTRY_HAZARDS, ...SPECIALIZED]
  const missing = allTemplates.filter((t) => t.status === "missing")
  const overdue = allTemplates.filter((t) => t.status === "review_due")
  const gaps = [...missing, ...overdue]

  if (gaps.length === 0) return null

  const markGenerated = (id: string) => setGenerated((g) => ({ ...g, [id]: true }))

  return (
    <div
      style={{
        background: "var(--white)",
        border: "1px solid rgba(196,18,48,0.2)",
        borderLeft: "3px solid var(--enforcement)",
      }}
    >
      {/* Header */}
      <div
        className="p-5 flex items-center justify-between gap-5"
        style={{ borderBottom: "1px solid rgba(11,29,58,0.06)", flexWrap: "wrap" }}
      >
        <div>
          <div
            className="font-display uppercase mb-1"
            style={{ color: "var(--enforcement)", fontSize: "10px", letterSpacing: "2.5px", fontWeight: 700 }}
          >
            Gap analysis · {gaps.length} {gaps.length === 1 ? "template needs" : "templates need"} your attention
          </div>
          <div
            className="font-display"
            style={{ color: "var(--midnight)", fontSize: "20px", fontWeight: 700, lineHeight: 1.25, marginBottom: 10 }}
          >
            {missing.length > 0
              ? `${missing.length} core document${missing.length === 1 ? " is" : "s are"} missing — Protekon will draft ${missing.length === 1 ? "it" : "them"} from your profile.`
              : "Templates are on file, but some are overdue for their annual review."}
          </div>
          <div
            className="font-sans"
            style={{ color: "var(--steel)", fontSize: "12px", lineHeight: 1.5, maxWidth: 640 }}
          >
            Pre-filled with your entity name, FEIN, sites, and trade profile. Review once, sign, and it&apos;s audit-ready. Every generated template goes through your normal review cycle afterward.
          </div>
        </div>
        <button
          className="px-4 py-3 font-display uppercase"
          style={{
            background: "var(--enforcement)",
            color: "var(--parchment)",
            fontSize: "11px",
            letterSpacing: "2px",
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
          }}
        >
          Generate all · {gaps.length} docs
        </button>
      </div>

      {/* Gap rows */}
      <div>
        {gaps.map((t, i) => {
          const isMissing = t.status === "missing"
          const isGen = generated[t.id]
          return (
            <div
              key={t.id}
              className="px-5 py-4 flex items-center gap-4"
              style={{
                borderBottom: i < gaps.length - 1 ? "1px solid rgba(11,29,58,0.05)" : "none",
                background: isGen ? "rgba(201,168,76,0.05)" : "transparent",
                transition: "background 0.3s",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: isGen
                    ? "var(--sand)"
                    : isMissing
                    ? "var(--enforcement)"
                    : "rgba(201,168,76,0.18)",
                  color: isGen
                    ? "var(--parchment)"
                    : isMissing
                    ? "var(--parchment)"
                    : "var(--sand)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: 700,
                }}
              >
                {isGen ? "✓" : isMissing ? "✕" : "!"}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 4 }}>
                  <div
                    className="font-display"
                    style={{ color: "var(--midnight)", fontSize: "15px", fontWeight: 600, lineHeight: 1.25 }}
                  >
                    {t.name}
                  </div>
                  <span
                    className="font-display uppercase"
                    style={{
                      color: isMissing ? "var(--enforcement)" : "var(--sand)",
                      background: isMissing ? "rgba(196,18,48,0.08)" : "rgba(201,168,76,0.12)",
                      padding: "2px 7px",
                      fontSize: "9px",
                      letterSpacing: "2px",
                      fontWeight: 600,
                    }}
                  >
                    {isMissing ? "Missing" : "Overdue"}
                  </span>
                </div>
                <div className="font-sans" style={{ color: "var(--steel)", fontSize: "11px", lineHeight: 1.45 }}>
                  {t.authority} ·{" "}
                  {isMissing
                    ? "Required but not on file. Typical draft time: under 2 minutes."
                    : `Last updated ${t.updated}. ${t.next_review}.`}
                </div>
              </div>

              <div className="flex-shrink-0">
                {isGen ? (
                  <span
                    className="font-display uppercase"
                    style={{ color: "var(--sand)", fontSize: "10px", letterSpacing: "2px", fontWeight: 700 }}
                  >
                    Draft ready · review
                  </span>
                ) : (
                  <button
                    onClick={() => markGenerated(t.id)}
                    className="px-4 py-2 font-display uppercase"
                    style={{
                      background: isMissing ? "var(--enforcement)" : "var(--void)",
                      color: "var(--parchment)",
                      fontSize: "10px",
                      letterSpacing: "2px",
                      fontWeight: 600,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {isMissing ? "Generate" : "Refresh & re-sign"}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div
        className="px-5 py-3 font-sans italic"
        style={{
          color: "var(--steel)",
          fontSize: "11px",
          background: "var(--parchment)",
          borderTop: "1px solid rgba(11,29,58,0.05)",
        }}
      >
        Generated templates use Protekon&apos;s Cal/OSHA-maintained master language, pre-bound to your business profile. You own the final document — edit freely before signing.
      </div>
    </div>
  )
}
