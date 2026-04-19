"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { addPayment } from "@/lib/actions/nec-1099"
import { CTAButton } from "@/components/v2/primitives/CTAButton"

type SubRow = { id: string; company_name: string | null }

type Props = {
  open: boolean
  subs: SubRow[]
  defaultTaxYear: number
  onClose: () => void
}

/**
 * Single-payment entry modal — posts to `addPayment`. Default tax year
 * matches the page's currently-selected year.
 */
export function ManualPaymentModal({
  open,
  subs,
  defaultTaxYear,
  onClose,
}: Props) {
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  if (!open) return null

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault()
    setError(null)
    const data = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await addPayment(data)
      if (res.error) {
        setError(res.error)
        return
      }
      router.refresh()
      onClose()
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(7,15,30,0.7)" }}
      onClick={onClose}
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
          <Eyebrow>RECORD A PAYMENT</Eyebrow>
          <h2
            className="font-display tracking-tight mb-5 mt-2"
            style={{ color: "var(--ink)", fontSize: 24, fontWeight: 700 }}
          >
            Add to the {defaultTaxYear} ledger.
          </h2>

          <div className="space-y-4">
            <Field label="Sub">
              <select
                name="sub_id"
                required
                className="w-full font-sans"
                style={fieldStyle}
                defaultValue=""
              >
                <option value="" disabled>
                  Pick a sub…
                </option>
                {subs.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.company_name ?? "(unnamed)"}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Payment date">
                <input
                  name="payment_date"
                  type="date"
                  required
                  className="w-full font-sans"
                  style={fieldStyle}
                />
              </Field>
              <Field label="Amount (USD)">
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="w-full font-sans"
                  style={fieldStyle}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Tax year">
                <input
                  name="tax_year"
                  type="number"
                  min="2000"
                  max="2100"
                  required
                  defaultValue={defaultTaxYear}
                  className="w-full font-sans"
                  style={fieldStyle}
                />
              </Field>
              <Field label="Category (optional)">
                <input
                  name="category"
                  type="text"
                  placeholder="Labor, Materials, …"
                  className="w-full font-sans"
                  style={fieldStyle}
                />
              </Field>
            </div>
          </div>

          {error && (
            <p
              className="font-sans mt-4"
              style={{ color: "var(--enforcement)", fontSize: 13 }}
            >
              {error}
            </p>
          )}

          <div className="mt-6 flex items-center justify-end gap-3">
            <CTAButton
              variant="ghost"
              icon={false}
              onClick={onClose}
              disabled={pending}
            >
              Cancel
            </CTAButton>
            <CTAButton
              variant="primary"
              type="submit"
              icon={false}
              disabled={pending}
            >
              {pending ? "Saving…" : "Record payment"}
            </CTAButton>
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
