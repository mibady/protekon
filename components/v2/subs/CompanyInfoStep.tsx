"use client"

import { useState } from "react"
import { CTAButton } from "@/components/v2/primitives/CTAButton"

type Props = {
  defaults: { legal_name: string; ein: string; address: string }
  onSubmit: (data: { legal_name: string; ein: string; address: string }) => void
}

/**
 * Step 1: Company info. Collects legal_name, EIN (optional, masked
 * XX-XXXXXXX), and business address. Legal name is prefilled from the
 * invite's sub_company_name.
 */
export function CompanyInfoStep({ defaults, onSubmit }: Props) {
  const [legalName, setLegalName] = useState(defaults.legal_name)
  const [ein, setEin] = useState(defaults.ein)
  const [address, setAddress] = useState(defaults.address)
  const [error, setError] = useState<string | null>(null)

  function formatEin(raw: string): string {
    const digits = raw.replace(/\D/g, "").slice(0, 9)
    if (digits.length <= 2) return digits
    return `${digits.slice(0, 2)}-${digits.slice(2)}`
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault()
    setError(null)
    const trimmed = legalName.trim()
    if (!trimmed) {
      setError("Your legal company name is required.")
      return
    }
    onSubmit({
      legal_name: trimmed,
      ein: ein.trim(),
      address: address.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Legal company name">
        <input
          type="text"
          value={legalName}
          onChange={(e) => setLegalName(e.target.value)}
          required
          className="w-full font-sans"
          style={fieldStyle}
        />
      </Field>

      <Field label="Tax ID / EIN (optional)">
        <input
          type="text"
          value={ein}
          onChange={(e) => setEin(formatEin(e.target.value))}
          placeholder="12-3456789"
          className="w-full font-sans"
          style={fieldStyle}
          inputMode="numeric"
          autoComplete="off"
        />
      </Field>

      <Field label="Business address">
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={3}
          className="w-full font-sans"
          style={{ ...fieldStyle, resize: "vertical" }}
          placeholder="Street, City, State ZIP"
        />
      </Field>

      {error && (
        <p
          className="font-sans"
          style={{ color: "var(--enforcement)", fontSize: 14 }}
        >
          {error}
        </p>
      )}

      <div className="flex items-center justify-end">
        <CTAButton variant="primary" type="submit" icon={true}>
          Continue
        </CTAButton>
      </div>
    </form>
  )
}

// ============================================================

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
  padding: "12px 14px",
  fontSize: 16,
  color: "var(--ink)",
  outline: "none",
}
