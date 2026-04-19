import { PageHeader } from "@/components/v2/primitives/PageHeader"
import { Card } from "@/components/v2/primitives/Card"
import {
  getAuditEventTypes,
  listAuditLog,
  type AuditFilters,
  type AuditLogRow,
} from "@/lib/actions/audit-trail"

/**
 * Audit trail surface. Server component: filters live in searchParams so
 * the feed is shareable and the server does the filtering via the
 * RLS-scoped listAuditLog action.
 *
 * Export path: /api/export/audit-package is a GET endpoint (zips audit_log
 * + bundle-ready docs), so we ship it as a plain link.
 */

function formatDate(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString()
}

type SearchParams = Promise<{
  eventType?: string
  from?: string
  to?: string
}>

export default async function AuditTrailPage({
  searchParams,
}: {
  searchParams?: SearchParams
}) {
  const sp = (await searchParams) ?? {}
  const filters: AuditFilters = {
    eventType: sp.eventType || undefined,
    from: sp.from || undefined,
    to: sp.to || undefined,
    limit: 200,
  }

  const [rows, eventTypes] = await Promise.all([
    listAuditLog(filters),
    getAuditEventTypes(),
  ])

  return (
    <div className="px-8 pt-10 pb-16 max-w-6xl w-full mx-auto">
      <PageHeader
        eyebrow="ACCOUNT · AUDIT TRAIL"
        title="Every write, every export, every sensitive read."
        subtitle="Filter by actor, event type, or date. Export the whole package as a PDF."
      />

      <Card padding="p-0">
        <form
          method="get"
          className="flex flex-wrap items-end gap-3 p-4"
          style={{ borderBottom: "1px solid rgba(11, 29, 58, 0.08)" }}
        >
          <FilterField label="Event type">
            <select
              name="eventType"
              defaultValue={filters.eventType ?? ""}
              className="font-sans"
              style={selectStyle}
            >
              <option value="">All</option>
              {eventTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="From">
            <input
              name="from"
              type="date"
              defaultValue={filters.from ?? ""}
              className="font-sans"
              style={selectStyle}
            />
          </FilterField>

          <FilterField label="To">
            <input
              name="to"
              type="date"
              defaultValue={filters.to ?? ""}
              className="font-sans"
              style={selectStyle}
            />
          </FilterField>

          <button
            type="submit"
            className="font-display uppercase"
            style={{
              background: "var(--void)",
              color: "var(--parchment)",
              padding: "10px 16px",
              fontSize: "11px",
              letterSpacing: "2px",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            Filter
          </button>

          <div className="ml-auto">
            <a
              href="/api/export/audit-package"
              className="font-display uppercase inline-block"
              style={{
                background: "var(--enforcement)",
                color: "var(--parchment)",
                padding: "10px 16px",
                fontSize: "11px",
                letterSpacing: "2px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Export package
            </a>
          </div>
        </form>

        <AuditTable rows={rows} />
      </Card>
    </div>
  )
}

function AuditTable({ rows }: { rows: AuditLogRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="p-6">
        <p
          className="font-sans"
          style={{ color: "var(--ink)", opacity: 0.6, fontSize: "14px" }}
        >
          No events match these filters.
        </p>
      </div>
    )
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr
            style={{
              borderBottom: "1px solid rgba(11, 29, 58, 0.08)",
            }}
          >
            <Th>Event type</Th>
            <Th>Description</Th>
            <Th>Date</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.id}
              style={{
                borderBottom: "1px solid rgba(11, 29, 58, 0.06)",
              }}
            >
              <Td>
                <span
                  className="font-display uppercase"
                  style={{
                    color: "var(--ink)",
                    fontSize: "11px",
                    letterSpacing: "1.5px",
                    fontWeight: 600,
                  }}
                >
                  {r.event_type}
                </span>
              </Td>
              <Td>
                <span className="font-sans" style={{ color: "var(--ink)" }}>
                  {r.description ?? "—"}
                </span>
              </Td>
              <Td>
                <span
                  className="font-sans"
                  style={{
                    color: "var(--ink)",
                    opacity: 0.7,
                    fontSize: "13px",
                  }}
                >
                  {formatDate(r.created_at)}
                </span>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FilterField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span
        className="font-display uppercase block mb-1"
        style={{
          color: "var(--ink)",
          opacity: 0.5,
          fontSize: "10px",
          letterSpacing: "2px",
          fontWeight: 600,
        }}
      >
        {label}
      </span>
      {children}
    </label>
  )
}

const selectStyle: React.CSSProperties = {
  background: "var(--parchment)",
  border: "1px solid rgba(11, 29, 58, 0.12)",
  padding: "8px 10px",
  fontSize: "13px",
  color: "var(--ink)",
  outline: "none",
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
      style={{
        padding: "14px 16px",
        verticalAlign: "middle",
      }}
    >
      {children}
    </td>
  )
}
