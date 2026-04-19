"use client"

import { useState, useTransition } from "react"
import { changePassword } from "@/lib/actions/settings"
import { CTAButton } from "@/components/v2/primitives/CTAButton"

export function SecurityTab() {
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await changePassword(formData)
      if (result.error) setError(result.error)
      else {
        setMessage("Password updated.")
        ;(e.target as HTMLFormElement).reset()
      }
    })
  }

  return (
    <div className="space-y-10">
      <form onSubmit={handleSubmit} className="space-y-4">
        <SectionLabel>Password</SectionLabel>
        <Field
          label="Current password"
          name="currentPassword"
          type="password"
          required
        />
        <Field
          label="New password"
          name="newPassword"
          type="password"
          required
        />
        <Field
          label="Confirm new password"
          name="confirmPassword"
          type="password"
          required
        />

        {error && (
          <div
            className="font-sans"
            style={{ color: "var(--enforcement)", fontSize: "13px" }}
          >
            {error}
          </div>
        )}
        {message && (
          <div
            className="font-sans"
            style={{ color: "var(--steel)", fontSize: "13px" }}
          >
            {message}
          </div>
        )}

        <div className="flex justify-end">
          <CTAButton type="submit" icon={false} disabled={pending}>
            {pending ? "Updating…" : "Update password"}
          </CTAButton>
        </div>
      </form>

      {/* TODO(later): MFA enrollment backend not yet wired. */}
      <StubRow
        label="Multi-factor authentication"
        hint="Require a second factor (authenticator app or SMS) at sign-in."
        cta="Enable MFA"
      />

      {/* TODO(later): active-session list backend not yet wired. */}
      <StubRow
        label="Active sessions"
        hint="Review devices and browsers signed into this account."
        cta="View sessions"
      />
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="font-display uppercase"
      style={{
        color: "var(--ink)",
        fontSize: "11px",
        letterSpacing: "3px",
        fontWeight: 600,
        borderBottom: "1px solid rgba(11, 29, 58, 0.08)",
        paddingBottom: "0.5rem",
      }}
    >
      {children}
    </div>
  )
}

function Field({
  label,
  name,
  type = "text",
  required = false,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
}) {
  return (
    <label className="block">
      <span
        className="block font-display uppercase mb-2"
        style={{
          color: "var(--steel)",
          fontSize: "10px",
          letterSpacing: "2px",
          fontWeight: 600,
        }}
      >
        {label}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full px-3 py-2 font-sans"
        style={{
          background: "var(--parchment)",
          border: "1px solid rgba(11, 29, 58, 0.15)",
          color: "var(--ink)",
          fontSize: "14px",
        }}
      />
    </label>
  )
}

function StubRow({
  label,
  hint,
  cta,
}: {
  label: string
  hint: string
  cta: string
}) {
  return (
    <div
      className="flex items-start justify-between gap-4 py-4"
      style={{ borderTop: "1px solid rgba(11, 29, 58, 0.06)" }}
    >
      <div>
        <div
          className="font-sans"
          style={{ color: "var(--ink)", fontSize: "15px", fontWeight: 600 }}
        >
          {label}
        </div>
        <div
          className="font-sans mt-1"
          style={{ color: "var(--steel)", fontSize: "13px" }}
        >
          {hint}
        </div>
      </div>
      <button
        disabled
        className="font-display uppercase"
        style={{
          color: "var(--steel)",
          fontSize: "10px",
          letterSpacing: "2px",
          padding: "0.5rem 0.75rem",
          border: "1px solid rgba(11, 29, 58, 0.15)",
          background: "transparent",
          opacity: 0.5,
          cursor: "not-allowed",
        }}
      >
        {cta} — soon
      </button>
    </div>
  )
}
