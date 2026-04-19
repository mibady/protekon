import { Card } from "@/components/v2/primitives/Card"
import { PriorityPill } from "@/components/v2/primitives/PriorityPill"
import { AcknowledgeButton } from "@/components/v2/regs/AcknowledgeButton"

/**
 * Shape returned by `getRegulations()` in lib/actions/reports.ts.
 * Kept local so this component is decoupled from the internal action file.
 */
export type RegulationRow = {
  id: string
  severity: string
  code: string
  issuingBody: string
  publishedDate: string
  title: string
  type: string
  summary: string
  effectiveDate: string
  complianceDeadline: string | null
  actionRequired: boolean
  unread: boolean
  impactText: string | null
}

type Props = {
  rows: RegulationRow[]
}

type Tone = "enforcement" | "sand" | "steel"

function toneForSeverity(sev: string): Tone {
  const s = sev.toLowerCase()
  if (s === "high" || s === "critical") return "enforcement"
  if (s === "medium" || s === "moderate") return "sand"
  return "steel"
}

/**
 * Server component. Renders the curated list of regulatory updates.
 * Acknowledged rows are dimmed and show an "Acknowledged" pill.
 */
export function RegulationsFeed({ rows }: Props) {
  if (!rows || rows.length === 0) {
    return (
      <Card accent="steel">
        <div
          className="font-display uppercase mb-2"
          style={{ color: "var(--ink)", opacity: 0.5, fontSize: "11px", letterSpacing: "2px" }}
        >
          Regulatory changes
        </div>
        <p
          className="font-sans"
          style={{ color: "var(--ink)", opacity: 0.8, fontSize: "15px", lineHeight: 1.55, margin: 0 }}
        >
          No new rules that touch your trade right now. I&rsquo;m watching the federal and state
          feeds daily — you&rsquo;ll see the first item here, not in your inbox at 2am.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {rows.map((r) => {
        const acked = !r.unread
        const tone = toneForSeverity(r.severity)
        return (
          <article
            key={r.id}
            style={{
              background: "var(--white)",
              border: "1px solid rgba(11, 29, 58, 0.08)",
              borderLeft: `3px solid var(--${tone})`,
              padding: "1.5rem",
              opacity: acked ? 0.55 : 1,
            }}
          >
            <div className="flex items-center justify-between mb-3 gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <PriorityPill tone={tone}>{r.issuingBody}</PriorityPill>
                <span
                  className="font-display uppercase"
                  style={{ color: "var(--steel)", fontSize: "10px", letterSpacing: "2px" }}
                >
                  {r.code} · {r.type}
                </span>
                {acked ? <PriorityPill tone="steel">Acknowledged</PriorityPill> : null}
              </div>
              <span
                className="font-sans"
                style={{ color: "var(--steel)", fontSize: "12px" }}
              >
                Published {r.publishedDate}
              </span>
            </div>

            <h3
              className="font-display"
              style={{ color: "var(--ink)", fontSize: "20px", fontWeight: 700, lineHeight: 1.25, marginBottom: "8px" }}
            >
              {r.title}
            </h3>

            <p
              className="font-sans"
              style={{ color: "var(--ink)", opacity: 0.8, fontSize: "14px", lineHeight: 1.55, margin: 0, marginBottom: "12px" }}
            >
              {r.summary}
            </p>

            {r.impactText ? (
              <p
                className="font-sans"
                style={{
                  color: "var(--ink)",
                  fontSize: "13px",
                  lineHeight: 1.55,
                  background: "rgba(201, 178, 122, 0.12)",
                  borderLeft: "2px solid var(--sand)",
                  padding: "10px 12px",
                  margin: 0,
                  marginBottom: "12px",
                }}
              >
                <span
                  className="font-display uppercase"
                  style={{ color: "var(--steel)", fontSize: "10px", letterSpacing: "2px", marginRight: "8px" }}
                >
                  What it means for you
                </span>
                {r.impactText}
              </p>
            ) : null}

            <div className="flex items-center justify-between gap-4 flex-wrap mt-3">
              <div className="flex items-center gap-6 font-sans" style={{ color: "var(--steel)", fontSize: "12px" }}>
                <span>
                  <span className="font-display uppercase" style={{ letterSpacing: "2px", marginRight: "6px" }}>
                    Effective
                  </span>
                  {r.effectiveDate}
                </span>
                {r.complianceDeadline ? (
                  <span>
                    <span className="font-display uppercase" style={{ letterSpacing: "2px", marginRight: "6px", color: "var(--enforcement)" }}>
                      Deadline
                    </span>
                    {r.complianceDeadline}
                  </span>
                ) : null}
              </div>
              <AcknowledgeButton regulationId={r.id} disabled={acked} />
            </div>
          </article>
        )
      })}
    </div>
  )
}
