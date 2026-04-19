"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { markIncidentReported } from "@/lib/actions/incidents"
import { CTAButton } from "@/components/v2/primitives/CTAButton"
import type { IncidentRow } from "./IncidentTable"

/**
 * Confirmation modal for "I reported this to the authority." Calls the
 * shipped `markIncidentReported(id)` server action. On success, closes
 * and asks the router to refresh so the table re-reads from the server.
 */
type MarkReportedDialogProps = {
  incident: IncidentRow | null
  open: boolean
  onClose: () => void
}

function formatDate(value: string | null): string {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString()
}

export function MarkReportedDialog({
  incident,
  open,
  onClose,
}: MarkReportedDialogProps) {
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  if (!open || !incident) return null

  function handleConfirm(): void {
    if (!incident) return
    setError(null)
    startTransition(async () => {
      const res = await markIncidentReported(incident.id)
      if (res.error) {
        setError(res.error)
        return
      }
      onClose()
      router.refresh()
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(7, 15, 30, 0.7)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--white)",
          border: "1px solid rgba(11, 29, 58, 0.08)",
          borderLeft: "3px solid var(--enforcement)",
        }}
      >
        <div className="p-6">
          <div
            className="font-display uppercase mb-3"
            style={{
              color: "var(--enforcement)",
              fontSize: "11px",
              letterSpacing: "3px",
              fontWeight: 600,
            }}
          >
            CONFIRM REPORT TO AUTHORITY
          </div>
          <h2
            className="font-display tracking-tight mb-4"
            style={{
              color: "var(--ink)",
              fontSize: "22px",
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            Mark {incident.incident_id} as reported?
          </h2>

          <p
            className="font-sans mb-4"
            style={{
              color: "var(--ink)",
              opacity: 0.7,
              fontSize: "14px",
              lineHeight: 1.55,
            }}
          >
            This stops the reporting clock for this incident. Confirm only
            after you've submitted the report to the applicable regulatory
            authority (e.g. Cal/OSHA DIR Form 36).
          </p>

          <dl className="space-y-2 mb-5">
            <Row label="Severity" value={incident.severity} />
            <Row label="Incident date" value={formatDate(incident.incident_date)} />
            <Row label="Location" value={incident.location ?? "—"} />
          </dl>

          {error && (
            <p
              className="font-sans mb-3"
              style={{ color: "var(--enforcement)", fontSize: "13px" }}
            >
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3">
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
              onClick={handleConfirm}
              disabled={pending}
              icon={false}
            >
              {pending ? "Marking…" : "I reported it — mark submitted"}
            </CTAButton>
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt
        className="font-display uppercase"
        style={{
          color: "var(--ink)",
          opacity: 0.5,
          fontSize: "11px",
          letterSpacing: "2px",
          fontWeight: 600,
        }}
      >
        {label}
      </dt>
      <dd
        className="font-sans text-right"
        style={{
          color: "var(--ink)",
          fontSize: "13px",
        }}
      >
        {value}
      </dd>
    </div>
  )
}
