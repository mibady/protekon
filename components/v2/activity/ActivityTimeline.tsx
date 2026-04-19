import { PriorityPill } from "@/components/v2/primitives/PriorityPill"
import type { AuditLogRow } from "@/lib/actions/audit-trail"

export type ActivityAlert = {
  id: string
  type: string
  title: string
  description: string
  date: string
  read: boolean
}

export type ActivityRow = {
  id: string
  kind: "audit" | "alert"
  actor: string
  headline: string
  description: string | null
  when: string
  tone: "enforcement" | "sand" | "steel"
}

type ActivityTimelineProps = {
  rows: ActivityRow[]
}

function formatWhen(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function ActivityTimeline({ rows }: ActivityTimelineProps) {
  if (rows.length === 0) {
    return (
      <div
        className="py-10 text-center font-sans"
        style={{ color: "var(--steel)", fontSize: "14px" }}
      >
        No recent activity. When I take an action or raise an alert, it'll show up here.
      </div>
    )
  }

  return (
    <div>
      {rows.map((row, i) => (
        <div
          key={row.id}
          className="flex items-start gap-4 py-4"
          style={{ borderTop: i === 0 ? "none" : "1px solid rgba(11, 29, 58, 0.06)" }}
        >
          <div
            className="flex-shrink-0 font-display uppercase"
            style={{
              color: "var(--steel)",
              fontSize: "10px",
              letterSpacing: "2px",
              width: "110px",
              marginTop: 4,
            }}
          >
            {row.actor}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <PriorityPill tone={row.tone}>{row.kind === "alert" ? "Alert" : "Logged"}</PriorityPill>
              <span
                className="font-display uppercase"
                style={{
                  color: "var(--steel)",
                  fontSize: "10px",
                  letterSpacing: "2px",
                }}
              >
                {formatWhen(row.when)}
              </span>
            </div>
            <div
              className="font-sans"
              style={{ color: "var(--ink)", fontSize: "15px", fontWeight: 600 }}
            >
              {row.headline}
            </div>
            {row.description && (
              <div
                className="font-sans mt-1"
                style={{ color: "var(--steel)", fontSize: "13px" }}
              >
                {row.description}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// TODO(later): richer actor resolution — right now audit rows collapse to "System".
export function mergeActivity(
  audit: AuditLogRow[],
  alerts: ActivityAlert[]
): ActivityRow[] {
  const auditRows: ActivityRow[] = audit.map((a) => ({
    id: `audit-${a.id}`,
    kind: "audit",
    actor: "System",
    headline: a.event_type.replace(/[._]/g, " "),
    description: a.description ?? null,
    when: a.created_at,
    tone: "steel",
  }))

  const alertRows: ActivityRow[] = alerts.map((a) => ({
    id: `alert-${a.id}`,
    kind: "alert",
    actor: "Protekon",
    headline: a.title,
    description: a.description ?? null,
    when: a.date,
    tone:
      a.type === "incident" || a.type === "regulatory"
        ? "enforcement"
        : a.type === "certification" || a.type === "compliance"
          ? "sand"
          : "steel",
  }))

  return [...auditRows, ...alertRows].sort((a, b) =>
    b.when.localeCompare(a.when)
  )
}
