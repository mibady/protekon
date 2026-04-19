"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CTAButton } from "@/components/v2/primitives/CTAButton"
import { Year1099Table } from "./Year1099Table"
import { ManualPaymentModal } from "./ManualPaymentModal"
import { CsvImportModal } from "./CsvImportModal"
import { Download } from "@phosphor-icons/react/dist/ssr"
import type { VendorPayment, YearRow } from "@/lib/actions/nec-1099"

type SubRow = { id: string; company_name: string | null }

type Props = {
  taxYear: number
  summary: YearRow[]
  payments: VendorPayment[]
  subs: SubRow[]
}

/**
 * 1099-NEC client shell — year picker, summary table, recent payments,
 * CSV + manual entry modals, and client-side packet export.
 */
export function Nec1099PageClient({ taxYear, summary, payments, subs }: Props) {
  const [manualOpen, setManualOpen] = useState(false)
  const [csvOpen, setCsvOpen] = useState(false)
  const [, startTransition] = useTransition()
  const router = useRouter()

  const currentYear = new Date().getFullYear()
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3]

  function changeYear(next: number): void {
    startTransition(() => {
      router.push(`/dashboard/form-1099?year=${next}`)
    })
  }

  function exportPacket(): void {
    const flaggedOnly = summary.filter((s) => s.status === "flagged")
    const rows = flaggedOnly.length > 0 ? flaggedOnly : summary
    const header = [
      "company_name",
      "ein",
      "total_paid",
      "payment_count",
      "tax_year",
      "threshold_status",
    ]
    const body = rows.map((r) => [
      escapeCsv(r.company_name),
      escapeCsv(r.ein ?? ""),
      r.total.toFixed(2),
      r.payment_count,
      taxYear,
      r.status,
    ])
    const csv = [header, ...body].map((line) => line.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `1099-nec-packet-${taxYear}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const flaggedCount = summary.filter((s) => s.status === "flagged").length
  const totalPaid = summary.reduce((acc, s) => acc + s.total, 0)

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-end gap-4">
          <label className="block">
            <span
              className="font-display uppercase block mb-2"
              style={{
                color: "var(--ink)",
                opacity: 0.6,
                fontSize: 11,
                letterSpacing: "2px",
                fontWeight: 600,
              }}
            >
              Tax year
            </span>
            <select
              value={taxYear}
              onChange={(e) => changeYear(Number(e.target.value))}
              className="font-sans"
              style={{
                background: "var(--parchment)",
                border: "1px solid rgba(11,29,58,0.12)",
                padding: "10px 14px",
                fontSize: 14,
                color: "var(--ink)",
                outline: "none",
                minWidth: 140,
              }}
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>

          <Metric label="Subs flagged" value={String(flaggedCount)} />
          <Metric label="Total paid" value={formatCurrency(totalPaid)} />
        </div>

        <div className="flex items-center gap-3">
          <CTAButton variant="ghost" icon={false} onClick={() => setCsvOpen(true)}>
            Import CSV
          </CTAButton>
          <CTAButton variant="ghost" icon={false} onClick={() => setManualOpen(true)}>
            Add payment
          </CTAButton>
          <button
            type="button"
            onClick={exportPacket}
            className="inline-flex items-center gap-2 px-4 py-2 font-display uppercase"
            style={{
              background: "var(--void)",
              color: "var(--parchment)",
              border: "none",
              fontSize: 12,
              letterSpacing: "2px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Download size={12} weight="bold" />
            Export packet
          </button>
        </div>
      </div>

      <section className="mb-10">
        <Year1099Table rows={summary} taxYear={taxYear} />
      </section>

      <section>
        <div className="mb-3">
          <Eyebrow>RECENT PAYMENTS</Eyebrow>
          <h2
            className="font-display mt-1"
            style={{ color: "var(--ink)", fontSize: 20, fontWeight: 700 }}
          >
            {taxYear} ledger · {payments.length} entries
          </h2>
        </div>
        {payments.length === 0 ? (
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
            No payments logged for {taxYear} yet.
          </div>
        ) : (
          <div
            style={{
              background: "var(--white)",
              border: "1px solid rgba(11,29,58,0.08)",
            }}
          >
            <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <ThHeader>Sub</ThHeader>
                  <ThHeader>Date</ThHeader>
                  <ThHeader>Category</ThHeader>
                  <ThHeader>Source</ThHeader>
                  <ThHeader align="right">Amount</ThHeader>
                </tr>
              </thead>
              <tbody>
                {payments.slice(0, 50).map((p) => (
                  <tr
                    key={p.id}
                    style={{ borderBottom: "1px solid rgba(11,29,58,0.06)" }}
                  >
                    <Td>
                      <span className="font-display" style={{ fontWeight: 600 }}>
                        {p.sub_company_name ?? "—"}
                      </span>
                    </Td>
                    <Td>{formatDate(p.payment_date)}</Td>
                    <Td>
                      <span style={{ opacity: 0.8 }}>{p.category ?? "—"}</span>
                    </Td>
                    <Td>
                      <span style={{ opacity: 0.6, fontSize: 12 }}>
                        {p.source.toUpperCase()}
                      </span>
                    </Td>
                    <Td align="right">
                      <span className="font-display" style={{ fontWeight: 600 }}>
                        {formatCurrency(p.amount)}
                      </span>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
            {payments.length > 50 && (
              <div
                className="font-sans"
                style={{
                  padding: 12,
                  borderTop: "1px solid rgba(11,29,58,0.08)",
                  color: "var(--ink)",
                  opacity: 0.5,
                  fontSize: 12,
                }}
              >
                Showing 50 of {payments.length} payments · export for the full
                ledger.
              </div>
            )}
          </div>
        )}
      </section>

      <ManualPaymentModal
        open={manualOpen}
        subs={subs}
        defaultTaxYear={taxYear}
        onClose={() => setManualOpen(false)}
      />
      <CsvImportModal open={csvOpen} onClose={() => setCsvOpen(false)} />
    </>
  )
}

// ============================================================

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        className="font-display uppercase mb-1"
        style={{
          color: "var(--ink)",
          opacity: 0.5,
          fontSize: 10,
          letterSpacing: "2px",
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <div
        className="font-display"
        style={{ color: "var(--ink)", fontSize: 22, fontWeight: 700 }}
      >
        {value}
      </div>
    </div>
  )
}

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

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

function escapeCsv(v: string): string {
  if (v == null) return ""
  const needsQuotes = /[",\n\r]/.test(v)
  const safe = v.replace(/"/g, '""')
  return needsQuotes ? `"${safe}"` : safe
}
