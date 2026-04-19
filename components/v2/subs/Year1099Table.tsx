"use client"

import { PriorityPill } from "@/components/v2/primitives/PriorityPill"
import type { YearRow } from "@/lib/actions/nec-1099"

type Props = {
  rows: YearRow[]
  taxYear: number
}

/**
 * 1099-NEC threshold table. Rows are sorted server-side by total DESC so
 * flagged (≥$600) subs surface to the top. Pill tone: enforcement when
 * flagged, steel when below.
 */
export function Year1099Table({ rows, taxYear }: Props) {
  if (rows.length === 0) {
    return (
      <div>
        <div className="mb-3">
          <Eyebrow>{taxYear} · 1099 SUMMARY</Eyebrow>
          <h2
            className="font-display mt-1"
            style={{ color: "var(--ink)", fontSize: 20, fontWeight: 700 }}
          >
            No payments recorded yet
          </h2>
        </div>
        <div
          className="font-sans"
          style={{
            padding: 20,
            background: "var(--parchment)",
            color: "var(--ink)",
            opacity: 0.7,
            fontSize: 14,
          }}
        >
          Add a manual payment or import a CSV to start tracking this year.
        </div>
      </div>
    )
  }

  const flagged = rows.filter((r) => r.status === "flagged").length

  return (
    <div>
      <div className="mb-3">
        <Eyebrow>{taxYear} · 1099 SUMMARY</Eyebrow>
        <h2
          className="font-display mt-1"
          style={{ color: "var(--ink)", fontSize: 20, fontWeight: 700 }}
        >
          {flagged} sub{flagged === 1 ? "" : "s"} at or above $600 threshold
        </h2>
      </div>
      <div
        style={{
          background: "var(--white)",
          border: "1px solid rgba(11,29,58,0.08)",
        }}
      >
        <table
          className="w-full text-sm"
          style={{ borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <ThHeader>Company</ThHeader>
              <ThHeader>EIN</ThHeader>
              <ThHeader align="right">Total paid</ThHeader>
              <ThHeader align="right">Payments</ThHeader>
              <ThHeader>Threshold</ThHeader>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.sub_id}
                style={{ borderBottom: "1px solid rgba(11,29,58,0.06)" }}
              >
                <Td>
                  <span className="font-display" style={{ fontWeight: 600 }}>
                    {r.company_name}
                  </span>
                </Td>
                <Td>
                  <span style={{ opacity: r.ein ? 1 : 0.4 }}>
                    {r.ein ?? "Missing EIN"}
                  </span>
                </Td>
                <Td align="right">
                  <span
                    className="font-display"
                    style={{ fontWeight: 600, fontSize: 15 }}
                  >
                    {formatCurrency(r.total)}
                  </span>
                </Td>
                <Td align="right">{r.payment_count}</Td>
                <Td>
                  <PriorityPill
                    tone={r.status === "flagged" ? "enforcement" : "steel"}
                  >
                    {r.status === "flagged" ? "FILE 1099" : "BELOW"}
                  </PriorityPill>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============================================================

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="font-display uppercase"
      style={{
        color: "var(--ink)",
        opacity: 0.5,
        fontSize: 11,
        letterSpacing: "3px",
        fontWeight: 500,
      }}
    >
      {children}
    </div>
  )
}

function ThHeader({
  children,
  align = "left",
}: {
  children: React.ReactNode
  align?: "left" | "right"
}) {
  return (
    <th
      className="font-display uppercase"
      style={{
        textAlign: align,
        fontSize: 10,
        letterSpacing: "2px",
        fontWeight: 600,
        color: "var(--ink)",
        opacity: 0.55,
        padding: "10px 14px",
        borderBottom: "1px solid rgba(11,29,58,0.08)",
      }}
    >
      {children}
    </th>
  )
}

function Td({
  children,
  align = "left",
}: {
  children: React.ReactNode
  align?: "left" | "right"
}) {
  return (
    <td
      style={{
        textAlign: align,
        padding: "12px 14px",
        color: "var(--ink)",
        fontSize: 14,
      }}
    >
      {children}
    </td>
  )
}

function formatCurrency(n: number): string {
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  })
}
