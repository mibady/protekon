"use client"

import { useState, useTransition } from "react"
import { createIncident } from "@/lib/actions/incidents"
import { CTAButton } from "@/components/v2/primitives/CTAButton"

/**
 * New-incident form. Posts to the shipped `createIncident` server action
 * via FormData (that's the action's existing signature — name-based field
 * extraction from a FormData instance).
 *
 * Severity options cover both the Wave 1 spec values
 * (fatal/serious/hospitalization/amputation/eye_loss/in_patient) and the
 * existing softer values (moderate/minor/near_miss/other) so the table
 * can render any row the database emits without a mapping layer.
 */
type NewIncidentModalProps = {
  open: boolean
  onClose: () => void
  onCreated?: () => void
}

const SEVERITY_OPTIONS: { value: string; label: string }[] = [
  { value: "fatal", label: "Fatal" },
  { value: "serious", label: "Serious" },
  { value: "hospitalization", label: "Hospitalization" },
  { value: "amputation", label: "Amputation" },
  { value: "eye_loss", label: "Loss of an eye" },
  { value: "in_patient", label: "In-patient" },
  { value: "moderate", label: "Moderate" },
  { value: "minor", label: "Minor" },
  { value: "near_miss", label: "Near miss" },
  { value: "other", label: "Other" },
]

export function NewIncidentModal({
  open,
  onClose,
  onCreated,
}: NewIncidentModalProps) {
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  if (!open) return null

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const data = new FormData(form)
    startTransition(async () => {
      const res = await createIncident(data)
      if (res.error) {
        setError(res.error)
        return
      }
      form.reset()
      onCreated?.()
      onClose()
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(7, 15, 30, 0.7)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--white)",
          border: "1px solid rgba(11, 29, 58, 0.08)",
        }}
      >
        <form onSubmit={handleSubmit} className="p-6">
          <div
            className="font-display uppercase mb-3"
            style={{
              color: "var(--ink)",
              opacity: 0.5,
              fontSize: "11px",
              letterSpacing: "3px",
              fontWeight: 500,
            }}
          >
            NEW INCIDENT
          </div>
          <h2
            className="font-display tracking-tight mb-5"
            style={{
              color: "var(--ink)",
              fontSize: "24px",
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            Log it now. The clock starts here.
          </h2>

          <div className="space-y-4">
            <Field label="What happened">
              <textarea
                name="description"
                required
                rows={3}
                className="w-full font-sans"
                style={fieldStyle}
              />
            </Field>

            <Field label="Location">
              <input
                name="location"
                type="text"
                className="w-full font-sans"
                style={fieldStyle}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Date & time">
                <input
                  name="date"
                  type="datetime-local"
                  className="w-full font-sans"
                  style={fieldStyle}
                />
              </Field>

              <Field label="Severity">
                <select
                  name="severity"
                  required
                  className="w-full font-sans"
                  style={fieldStyle}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select…
                  </option>
                  {SEVERITY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          {error && (
            <p
              className="font-sans mt-4"
              style={{ color: "var(--enforcement)", fontSize: "13px" }}
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
              disabled={pending}
              icon={false}
            >
              {pending ? "Logging…" : "Log incident"}
            </CTAButton>
          </div>
        </form>
      </div>
    </div>
  )
}

const fieldStyle: React.CSSProperties = {
  background: "var(--parchment)",
  border: "1px solid rgba(11, 29, 58, 0.12)",
  padding: "10px 12px",
  fontSize: "14px",
  color: "var(--ink)",
  outline: "none",
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
          fontSize: "11px",
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
