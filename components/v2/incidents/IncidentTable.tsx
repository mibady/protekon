import { Card } from "@/components/v2/primitives/Card"
import { PriorityPill } from "@/components/v2/primitives/PriorityPill"
import type { Incident } from "@/lib/types"

/**
 * Stateless table of incidents. Rendered inside a Card on the
 * /dashboard/incidents surface. Status is derived from the row: if the
 * incident carries a `reported_at` timestamp (added by markIncidentReported)
 * it renders as REPORTED; otherwise it's OPEN.
 *
 * Status + action wiring (e.g. "Mark reported" click) lives in the page's
 * client shell — this component stays presentation-only so it can render
 * from server data without hydration overhead.
 */

// The shipped Incident type does not include reported_at; it's appended by
// migration 045 + markIncidentReported. Extend locally so we can render the
// REPORTED state without mutating lib/types.ts.
export type IncidentRow = Incident & { reported_at?: string | null }

type IncidentTableProps = {
  incidents: IncidentRow[]
  onRowClick?: (incident: IncidentRow) => void
}

const ENFORCEMENT_SEVERITIES = new Set([
  "fatal",
  "fatality",
  "serious",
  "hospitalization",
  "amputation",
  "eye_loss",
  "in_patient",
])
const SAND_SEVERITIES = new Set(["moderate", "medium", "minor", "near_miss"])

function toneFor(severity: string): "enforcement" | "sand" | "steel" {
  const s = severity.toLowerCase()
  if (ENFORCEMENT_SEVERITIES.has(s)) return "enforcement"
  if (SAND_SEVERITIES.has(s)) return "sand"
  return "steel"
}

function formatDate(value: string | null): string {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function humanSeverity(severity: string): string {
  return severity
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

export function IncidentTable({ incidents, onRowClick }: IncidentTableProps) {
  if (incidents.length === 0) {
    return (
      <Card>
        <p
          className="font-sans"
          style={{ color: "var(--ink)", opacity: 0.6, fontSize: "14px" }}
        >
          No incidents logged yet. When you log one, the reporting clock
          starts and the record stays on your five-year retention window.
        </p>
      </Card>
    )
  }

  return (
    <Card padding="p-0">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr
              style={{
                borderBottom: "1px solid rgba(11, 29, 58, 0.08)",
              }}
            >
              <Th>Date</Th>
              <Th>Severity</Th>
              <Th>Location</Th>
              <Th>Status</Th>
              <Th>ID</Th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((incident) => {
              const reported = Boolean(incident.reported_at)
              const isClickable = !reported && typeof onRowClick === "function"
              return (
                <tr
                  key={incident.id}
                  onClick={isClickable ? () => onRowClick?.(incident) : undefined}
                  className={`${
                    isClickable ? "cursor-pointer hover:bg-[rgba(11,29,58,0.02)]" : ""
                  }`}
                  style={{
                    borderBottom: "1px solid rgba(11, 29, 58, 0.06)",
                  }}
                >
                  <Td>{formatDate(incident.incident_date)}</Td>
                  <Td>
                    <PriorityPill tone={toneFor(incident.severity)}>
                      {humanSeverity(incident.severity)}
                    </PriorityPill>
                  </Td>
                  <Td>{incident.location ?? "—"}</Td>
                  <Td>
                    <PriorityPill tone={reported ? "steel" : "enforcement"}>
                      {reported ? "Reported" : "Open"}
                    </PriorityPill>
                  </Td>
                  <Td>
                    <span
                      className="font-sans"
                      style={{
                        color: "var(--ink)",
                        opacity: 0.6,
                        fontSize: "12px",
                      }}
                    >
                      {incident.incident_id}
                    </span>
                  </Td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="font-display uppercase text-left"
      style={{
        color: "var(--ink)",
        opacity: 0.5,
        fontSize: "11px",
        letterSpacing: "2px",
        fontWeight: 600,
        padding: "12px 16px",
      }}
    >
      {children}
    </th>
  )
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td
      className="font-sans"
      style={{
        color: "var(--ink)",
        fontSize: "14px",
        padding: "14px 16px",
        verticalAlign: "middle",
      }}
    >
      {children}
    </td>
  )
}
