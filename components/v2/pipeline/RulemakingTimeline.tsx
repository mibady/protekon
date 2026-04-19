import { Card } from "@/components/v2/primitives/Card"
import { PriorityPill } from "@/components/v2/primitives/PriorityPill"
import type { RegulationRow } from "@/components/v2/regs/RegulationsFeed"

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

// Parse a human date string ("Mar 12, 2025") back to a Date. Falls back to
// epoch for "Immediate" or unknown values.
function parseDate(s: string | null | undefined): Date {
  if (!s) return new Date(0)
  if (s === "Immediate") return new Date(0)
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? new Date(0) : d
}

/**
 * Server component. Groups regulations by year of effective date and
 * renders a single vertical timeline.
 */
export function RulemakingTimeline({ rows }: Props) {
  if (!rows || rows.length === 0) {
    return (
      <Card accent="steel">
        <div
          className="font-display uppercase mb-2"
          style={{ color: "var(--ink)", opacity: 0.5, fontSize: "11px", letterSpacing: "2px" }}
        >
          Rulemaking timeline
        </div>
        <p
          className="font-sans"
          style={{ color: "var(--ink)", opacity: 0.8, fontSize: "15px", lineHeight: 1.55, margin: 0 }}
        >
          The rulemaking timeline is still being curated. Check back after the next curator pass.
        </p>
      </Card>
    )
  }

  const sorted = [...rows].sort(
    (a, b) =>
      parseDate(a.effectiveDate).getTime() - parseDate(b.effectiveDate).getTime(),
  )

  // Group by year of effectiveDate (or "Pending" when date is unknown).
  const grouped = new Map<string, RegulationRow[]>()
  for (const row of sorted) {
    const d = parseDate(row.effectiveDate)
    const year =
      d.getTime() === 0 ? "Pending" : String(d.getUTCFullYear())
    const bucket = grouped.get(year) ?? []
    bucket.push(row)
    grouped.set(year, bucket)
  }

  const years = Array.from(grouped.keys())

  return (
    <Card accent="sand">
      <div
        className="font-display uppercase mb-6"
        style={{ color: "var(--ink)", opacity: 0.5, fontSize: "11px", letterSpacing: "2px" }}
      >
        Rulemaking timeline
      </div>

      <div className="space-y-8">
        {years.map((year) => {
          const items = grouped.get(year) ?? []
          return (
            <section key={year}>
              <div
                className="font-display mb-4 pb-2"
                style={{
                  color: "var(--ink)",
                  fontSize: "24px",
                  fontWeight: 700,
                  letterSpacing: "1px",
                  borderBottom: "1px solid rgba(11, 29, 58, 0.15)",
                }}
              >
                {year}
              </div>
              <ol className="space-y-4" style={{ paddingLeft: "1rem", borderLeft: "2px solid rgba(11, 29, 58, 0.08)" }}>
                {items.map((r) => {
                  const tone = toneForSeverity(r.severity)
                  return (
                    <li
                      key={r.id}
                      style={{
                        position: "relative",
                        paddingLeft: "1.25rem",
                      }}
                    >
                      <span
                        aria-hidden
                        style={{
                          position: "absolute",
                          left: "-1.4rem",
                          top: "6px",
                          width: "10px",
                          height: "10px",
                          background: `var(--${tone})`,
                          borderRadius: "50%",
                          border: "2px solid var(--white)",
                          boxShadow: "0 0 0 1px rgba(11, 29, 58, 0.15)",
                        }}
                      />
                      <div className="flex items-center justify-between gap-4 flex-wrap mb-1">
                        <div className="flex items-center gap-3">
                          <PriorityPill tone={tone}>{r.issuingBody}</PriorityPill>
                          <span
                            className="font-display uppercase"
                            style={{ color: "var(--steel)", fontSize: "10px", letterSpacing: "2px" }}
                          >
                            {r.code} · {r.type}
                          </span>
                        </div>
                        <span
                          className="font-sans"
                          style={{ color: "var(--steel)", fontSize: "12px" }}
                        >
                          Effective {r.effectiveDate}
                        </span>
                      </div>
                      <h3
                        className="font-display"
                        style={{ color: "var(--ink)", fontSize: "17px", fontWeight: 700, lineHeight: 1.3, marginBottom: "4px" }}
                      >
                        {r.title}
                      </h3>
                      {r.summary ? (
                        <p
                          className="font-sans"
                          style={{ color: "var(--ink)", opacity: 0.8, fontSize: "13px", lineHeight: 1.55, margin: 0 }}
                        >
                          {r.summary}
                        </p>
                      ) : null}
                      {r.complianceDeadline ? (
                        <div
                          className="font-display uppercase mt-2"
                          style={{ color: "var(--enforcement)", fontSize: "11px", letterSpacing: "2px" }}
                        >
                          Compliance deadline · {r.complianceDeadline}
                        </div>
                      ) : null}
                    </li>
                  )
                })}
              </ol>
            </section>
          )
        })}
      </div>
    </Card>
  )
}
