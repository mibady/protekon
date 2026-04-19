import { PriorityPill } from "@/components/v2/primitives/PriorityPill"
import type { Document } from "@/lib/types"

/**
 * Table of the client's request-to-sign / generated documents.
 *
 * Status tone logic:
 *   enforcement → failed, expired, missing
 *   sand        → pending, review, draft
 *   steel       → complete, current, ready (default)
 */
type DocumentsTableProps = {
  documents: Document[]
}

function toneFor(status: string): "enforcement" | "sand" | "steel" {
  const s = (status || "").toLowerCase()
  if (["failed", "expired", "missing", "error"].includes(s)) return "enforcement"
  if (["pending", "review", "draft", "in_progress", "processing"].includes(s)) return "sand"
  return "steel"
}

function formatDate(value: string | null): string {
  if (!value) return "—"
  const d = new Date(value)
  return isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}

export function DocumentsTable({ documents }: DocumentsTableProps) {
  if (documents.length === 0) {
    return (
      <div
        className="py-10 text-center font-sans"
        style={{ color: "var(--steel)", fontSize: "14px" }}
      >
        No documents yet. Request your first plan from the button above.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full font-sans" style={{ fontSize: "14px" }}>
        <thead>
          <tr
            className="font-display uppercase"
            style={{
              color: "var(--steel)",
              fontSize: "10px",
              letterSpacing: "2px",
              borderBottom: "2px solid var(--void)",
            }}
          >
            <th className="text-left py-3 pr-4">Name</th>
            <th className="text-left py-3 pr-4">Category</th>
            <th className="text-left py-3 pr-4">Status</th>
            <th className="text-left py-3 pr-4">Requested</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr
              key={doc.id}
              style={{ borderBottom: "1px solid rgba(11, 29, 58, 0.06)" }}
            >
              <td className="py-3 pr-4" style={{ color: "var(--ink)" }}>
                <div style={{ fontWeight: 600 }}>{doc.filename || doc.document_id}</div>
                {doc.notes && (
                  <div
                    className="mt-1"
                    style={{ color: "var(--steel)", fontSize: "13px" }}
                  >
                    {doc.notes}
                  </div>
                )}
              </td>
              <td className="py-3 pr-4" style={{ color: "var(--steel)" }}>
                {doc.type}
              </td>
              <td className="py-3 pr-4">
                <PriorityPill tone={toneFor(doc.status)}>{doc.status}</PriorityPill>
              </td>
              <td className="py-3 pr-4" style={{ color: "var(--steel)" }}>
                {formatDate(doc.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
