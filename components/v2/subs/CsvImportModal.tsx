"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { importCsv } from "@/lib/actions/nec-1099"
import { CTAButton } from "@/components/v2/primitives/CTAButton"
import { CheckCircle } from "@phosphor-icons/react/dist/ssr"

type Props = {
  open: boolean
  onClose: () => void
}

/**
 * Vendor-payment CSV import modal. Walks the user through the expected
 * schema, accepts a .csv file, and reports imported/skipped counts on
 * success.
 */
export function CsvImportModal({ open, onClose }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    imported: number
    skipped: number
  } | null>(null)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  if (!open) return null

  function handleClose(): void {
    setError(null)
    setResult(null)
    onClose()
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault()
    setError(null)
    const data = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await importCsv(data)
      if (res.error) {
        setError(res.error)
        return
      }
      setResult({ imported: res.imported, skipped: res.skipped })
      router.refresh()
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(7,15,30,0.7)" }}
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--white)",
          border: "1px solid rgba(11,29,58,0.08)",
        }}
      >
        <form onSubmit={handleSubmit} className="p-6">
          <Eyebrow>IMPORT VENDOR PAYMENTS</Eyebrow>
          <h2
            className="font-display tracking-tight mb-3 mt-2"
            style={{ color: "var(--ink)", fontSize: 24, fontWeight: 700 }}
          >
            Bring your ledger in.
          </h2>
          <p
            className="font-sans mb-5"
            style={{ color: "var(--ink)", opacity: 0.7, fontSize: 14 }}
          >
            CSV with a header row. Required columns:{" "}
            <code style={codeStyle}>payment_date</code>,{" "}
            <code style={codeStyle}>amount</code>,{" "}
            <code style={codeStyle}>tax_year</code>, and at least one of{" "}
            <code style={codeStyle}>sub_id</code>,{" "}
            <code style={codeStyle}>ein</code>, or{" "}
            <code style={codeStyle}>company_name</code>. Optional:{" "}
            <code style={codeStyle}>category</code>,{" "}
            <code style={codeStyle}>external_id</code>.
          </p>

          <Field label="CSV file">
            <input
              name="file"
              type="file"
              accept=".csv,text/csv"
              required
              className="w-full font-sans"
              style={{ ...fieldStyle, padding: "8px 12px" }}
            />
          </Field>

          {error && (
            <p
              className="font-sans mt-4"
              style={{ color: "var(--enforcement)", fontSize: 13 }}
            >
              {error}
            </p>
          )}

          {result && (
            <div
              className="mt-5 p-4 flex items-center gap-3"
              style={{
                background: "var(--parchment)",
                border: "1px solid rgba(11,29,58,0.08)",
              }}
            >
              <CheckCircle size={20} color="var(--steel)" weight="fill" />
              <div>
                <div
                  className="font-display"
                  style={{ color: "var(--ink)", fontSize: 15, fontWeight: 600 }}
                >
                  Imported {result.imported} · Skipped {result.skipped}
                </div>
                <div
                  className="font-sans"
                  style={{ color: "var(--ink)", opacity: 0.6, fontSize: 12 }}
                >
                  Skipped rows failed validation or duplicated an existing
                  (sub, external_id) pair.
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-3">
            <CTAButton
              variant="ghost"
              icon={false}
              onClick={handleClose}
              disabled={pending}
            >
              {result ? "Done" : "Cancel"}
            </CTAButton>
            {!result && (
              <CTAButton
                variant="primary"
                type="submit"
                icon={false}
                disabled={pending}
              >
                {pending ? "Importing…" : "Import"}
              </CTAButton>
            )}
          </div>
        </form>
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

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
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
        {label}
      </span>
      {children}
    </label>
  )
}

const fieldStyle: React.CSSProperties = {
  background: "var(--parchment)",
  border: "1px solid rgba(11,29,58,0.12)",
  padding: "10px 12px",
  fontSize: 14,
  color: "var(--ink)",
  outline: "none",
}

const codeStyle: React.CSSProperties = {
  background: "var(--parchment)",
  padding: "1px 6px",
  fontSize: 12,
  fontFamily: "var(--font-mono, ui-monospace, monospace)",
  border: "1px solid rgba(11,29,58,0.08)",
}
