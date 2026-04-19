import { CheckCircle, Warning, XCircle } from "@phosphor-icons/react/dist/ssr"
import { PriorityPill } from "@/components/v2/primitives/PriorityPill"
import { getTopicMeta, TRAINING_TOPICS } from "./topics"

/**
 * Training row shape — mirrors `training_records` columns that are
 * confirmed shipped in lib/actions/training.ts (employee_name, training_type,
 * due_date, completed_at, status, site_id). Richer Remix fields (trainer,
 * duration, authority) are derived where possible; missing fields render as
 * an em-dash for honesty.
 */
export type TrainingRecord = {
  id: string
  employee_name: string | null
  training_type: string | null
  due_date: string | null
  completed_at: string | null
  status: string | null
  site_id?: string | null
  // Optional richer columns (present in some installs) — adapt if null.
  trainer?: string | null
  duration?: string | null
  authority?: string | null
  expires_at?: string | null
}

type DerivedStatus = "current" | "expiring" | "expired" | "missing"

export function deriveStatus(row: TrainingRecord, now: Date = new Date()): DerivedStatus {
  if (!row.completed_at) return "missing"
  const expiresIso = row.expires_at ?? computeExpiresFromTopic(row)
  if (!expiresIso) return "current"
  const expires = new Date(expiresIso)
  const msPerDay = 86_400_000
  const days = (expires.getTime() - now.getTime()) / msPerDay
  if (days < 0) return "expired"
  if (days <= 30) return "expiring"
  return "current"
}

function computeExpiresFromTopic(row: TrainingRecord): string | null {
  if (!row.completed_at || !row.training_type) return null
  const meta = getTopicMeta(row.training_type)
  const d = new Date(row.completed_at)
  if (Number.isNaN(d.getTime())) return null
  d.setFullYear(d.getFullYear() + meta.years)
  return d.toISOString()
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toISOString().slice(0, 10)
}

function StatusCell({ status }: { status: DerivedStatus }) {
  switch (status) {
    case "expired":
      return (
        <span className="inline-flex items-center gap-1.5">
          <XCircle size={14} color="var(--enforcement)" weight="fill" />
          <PriorityPill tone="enforcement">Expired</PriorityPill>
        </span>
      )
    case "expiring":
      return (
        <span className="inline-flex items-center gap-1.5">
          <Warning size={14} color="var(--sand)" weight="fill" />
          <PriorityPill tone="sand">Expiring</PriorityPill>
        </span>
      )
    case "missing":
      return (
        <span className="inline-flex items-center gap-1.5">
          <Warning size={14} color="var(--enforcement)" weight="fill" />
          <PriorityPill tone="enforcement">Missing</PriorityPill>
        </span>
      )
    case "current":
    default:
      return (
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle size={14} color="var(--steel)" weight="fill" />
          <PriorityPill tone="steel">Current</PriorityPill>
        </span>
      )
  }
}

const HEADERS = [
  "Worker",
  "Topic",
  "Authority",
  "Trainer",
  "Completed",
  "Expires",
  "Status",
]

type TrainingTableProps = {
  rows: ReadonlyArray<TrainingRecord>
}

export function TrainingTable({ rows }: TrainingTableProps) {
  return (
    <div
      style={{
        background: "var(--white)",
        border: "1px solid rgba(11, 29, 58, 0.08)",
        borderTop: "none",
      }}
    >
      <table className="w-full" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "rgba(11, 29, 58, 0.03)" }}>
            {HEADERS.map((h) => (
              <th
                key={h}
                className="font-display uppercase text-left px-4 py-3"
                style={{
                  color: "var(--steel)",
                  fontSize: "10px",
                  letterSpacing: "2px",
                  fontWeight: 600,
                  borderBottom: "1px solid rgba(11, 29, 58, 0.08)",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const status = deriveStatus(row)
            const topicMeta = row.training_type
              ? TRAINING_TOPICS.find((t) => t.topic === row.training_type)
              : undefined
            const authority = row.authority ?? topicMeta?.auth ?? "—"
            const expiresIso = row.expires_at ?? computeExpiresFromTopic(row)
            return (
              <tr
                key={row.id}
                style={{ borderBottom: "1px solid rgba(11, 29, 58, 0.05)" }}
              >
                <td
                  className="px-4 py-3 font-sans"
                  style={{ color: "var(--ink)", fontSize: "13px", fontWeight: 500 }}
                >
                  {row.employee_name ?? "—"}
                </td>
                <td
                  className="px-4 py-3 font-sans"
                  style={{ color: "var(--ink)", fontSize: "13px" }}
                >
                  {row.training_type ?? "—"}
                </td>
                <td
                  className="px-4 py-3 font-sans"
                  style={{
                    color: "var(--steel)",
                    fontSize: "11px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {authority}
                </td>
                <td
                  className="px-4 py-3 font-sans"
                  style={{ color: "var(--ink)", fontSize: "12px" }}
                >
                  {row.trainer ?? "—"}
                </td>
                <td
                  className="px-4 py-3 font-sans"
                  style={{
                    color: "var(--steel)",
                    fontSize: "12px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {fmtDate(row.completed_at)}
                </td>
                <td
                  className="px-4 py-3 font-sans"
                  style={{
                    color:
                      status === "expired" ? "var(--enforcement)" : "var(--ink)",
                    fontSize: "12px",
                    whiteSpace: "nowrap",
                    fontWeight: status === "expired" ? 600 : 400,
                  }}
                >
                  {fmtDate(expiresIso)}
                </td>
                <td className="px-4 py-3">
                  <StatusCell status={status} />
                </td>
              </tr>
            )
          })}
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={HEADERS.length}
                className="px-4 py-8 font-sans text-center"
                style={{ color: "var(--steel)", fontSize: "13px" }}
              >
                No matching training records.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
