import { Card } from "@/components/v2/primitives/Card"
import { PriorityPill } from "@/components/v2/primitives/PriorityPill"
import type { AckCampaign } from "@/lib/actions/acknowledgments"

/**
 * Stateless list of ack campaigns. Each row surfaces: policy version,
 * cohort note, created/due dates, and signed/total progress. The status
 * pill is derived from due_date + signed_count/total_count:
 *   - all signed                 → steel "COMPLETE"
 *   - past due + unsigned slots  → enforcement "OVERDUE"
 *   - due ≤ 7 days + unsigned    → sand "DUE SOON"
 *   - otherwise                  → steel "OPEN"
 */
type CampaignTableProps = {
  campaigns: AckCampaign[]
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

type Status = {
  label: string
  tone: "enforcement" | "sand" | "steel"
}

function statusFor(c: AckCampaign): Status {
  const pending = Math.max(0, c.total_count - c.signed_count)
  if (pending === 0 && c.total_count > 0)
    return { label: "Complete", tone: "steel" }
  if (c.due_date) {
    const due = new Date(c.due_date).getTime()
    const now = Date.now()
    const dayMs = 24 * 60 * 60 * 1000
    if (due < now) return { label: "Overdue", tone: "enforcement" }
    if (due - now < 7 * dayMs) return { label: "Due soon", tone: "sand" }
  }
  return { label: "Open", tone: "steel" }
}

export function CampaignTable({ campaigns }: CampaignTableProps) {
  if (campaigns.length === 0) {
    return (
      <Card>
        <p
          className="font-sans"
          style={{ color: "var(--ink)", opacity: 0.6, fontSize: "14px" }}
        >
          No campaigns yet. Start one to send a policy to a cohort and
          collect signed acknowledgments.
        </p>
      </Card>
    )
  }

  return (
    <Card padding="p-0">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(11, 29, 58, 0.08)" }}>
              <Th>Policy</Th>
              <Th>Cohort</Th>
              <Th>Created</Th>
              <Th>Due</Th>
              <Th>Signed</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => {
              const status = statusFor(c)
              return (
                <tr
                  key={c.id}
                  style={{
                    borderBottom: "1px solid rgba(11, 29, 58, 0.06)",
                  }}
                >
                  <Td>
                    <span
                      className="font-sans"
                      style={{ color: "var(--ink)", fontWeight: 500 }}
                    >
                      {c.policy_version}
                    </span>
                  </Td>
                  <Td>{c.cohort_note ?? "—"}</Td>
                  <Td>{formatDate(c.created_at)}</Td>
                  <Td>{formatDate(c.due_date)}</Td>
                  <Td>
                    <span className="font-sans">
                      {c.signed_count} / {c.total_count}
                    </span>
                  </Td>
                  <Td>
                    <PriorityPill tone={status.tone}>
                      {status.label}
                    </PriorityPill>
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
