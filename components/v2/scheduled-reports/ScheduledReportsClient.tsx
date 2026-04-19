"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { updateDeliveryPreference } from "@/lib/actions/scheduled-deliveries"
import { CTAButton } from "@/components/v2/primitives/CTAButton"
import { PriorityPill } from "@/components/v2/primitives/PriorityPill"
import type { DeliveryPreference } from "@/lib/actions/scheduled-deliveries"

type ScheduledReportsClientProps = {
  deliveries: DeliveryPreference[]
}

const FREQUENCY_LABEL: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly (Monday)",
  monthly: "Monthly (1st)",
  quarterly: "Quarterly",
}

function formatDate(value: string | null): string {
  if (!value) return "—"
  const d = new Date(value)
  return isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}

function statusTone(status: string): "enforcement" | "sand" | "steel" {
  const s = status.toLowerCase()
  if (s === "failed" || s === "error") return "enforcement"
  if (s === "paused" || s === "pending") return "sand"
  return "steel"
}

export function ScheduledReportsClient({ deliveries }: ScheduledReportsClientProps) {
  const [editing, setEditing] = useState<DeliveryPreference | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function togglePause(d: DeliveryPreference) {
    setError(null)
    const nextStatus = d.status === "paused" ? "active" : "paused"
    startTransition(async () => {
      const result = await updateDeliveryPreference(d.id, { status: nextStatus })
      if (result.error) setError(result.error)
      else router.refresh()
    })
  }

  return (
    <>
      {error && (
        <div
          className="mb-4 font-sans"
          style={{ color: "var(--enforcement)", fontSize: "13px" }}
        >
          {error}
        </div>
      )}

      {deliveries.length === 0 ? (
        <div
          className="py-10 text-center font-sans"
          style={{ color: "var(--steel)", fontSize: "14px" }}
        >
          No scheduled reports yet. Defaults populate on plan activation.
        </div>
      ) : (
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
                <th className="text-left py-3 pr-4">Report</th>
                <th className="text-left py-3 pr-4">Cadence</th>
                <th className="text-left py-3 pr-4">Next delivery</th>
                <th className="text-left py-3 pr-4">Last sent</th>
                <th className="text-left py-3 pr-4">Status</th>
                <th className="text-right py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((d) => (
                <tr
                  key={d.id}
                  style={{ borderBottom: "1px solid rgba(11, 29, 58, 0.06)" }}
                >
                  <td className="py-3 pr-4" style={{ color: "var(--ink)", fontWeight: 600 }}>
                    {d.delivery_type}
                  </td>
                  <td className="py-3 pr-4" style={{ color: "var(--steel)" }}>
                    {FREQUENCY_LABEL[d.frequency] ?? d.frequency}
                  </td>
                  <td className="py-3 pr-4" style={{ color: "var(--steel)" }}>
                    {formatDate(d.next_delivery_date)}
                  </td>
                  <td className="py-3 pr-4" style={{ color: "var(--steel)" }}>
                    {formatDate(d.last_delivered_at)}
                  </td>
                  <td className="py-3 pr-4">
                    <PriorityPill tone={statusTone(d.status)}>{d.status}</PriorityPill>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditing(d)}
                        className="font-display uppercase"
                        style={{
                          color: "var(--ink)",
                          fontSize: "10px",
                          letterSpacing: "2px",
                          padding: "0.4rem 0.6rem",
                          border: "1px solid rgba(11, 29, 58, 0.15)",
                          background: "transparent",
                        }}
                      >
                        Edit cadence
                      </button>
                      <button
                        onClick={() => togglePause(d)}
                        disabled={pending}
                        className="font-display uppercase"
                        style={{
                          color: "var(--steel)",
                          fontSize: "10px",
                          letterSpacing: "2px",
                          padding: "0.4rem 0.6rem",
                          border: "1px solid rgba(11, 29, 58, 0.15)",
                          background: "transparent",
                        }}
                      >
                        {d.status === "paused" ? "Resume" : "Pause"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <EditCadenceModal
        delivery={editing}
        onClose={() => setEditing(null)}
      />

      {/*
        TODO(later): "New schedule" CTA — scheduled-deliveries.ts only exports
        getDeliveryPreferences / updateDeliveryPreference / createDefaultDeliveries(clientId, plan).
        No user-facing create fn yet. Defaults are seeded by createDefaultDeliveries on plan
        activation. When a public create action ships, add the button here.
      */}
    </>
  )
}

type EditCadenceModalProps = {
  delivery: DeliveryPreference | null
  onClose: () => void
}

function EditCadenceModal({ delivery, onClose }: EditCadenceModalProps) {
  const [frequency, setFrequency] = useState<string>(delivery?.frequency ?? "weekly")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  if (!delivery) return null

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!delivery) return
    setError(null)
    startTransition(async () => {
      const result = await updateDeliveryPreference(delivery.id, { frequency })
      if (result.error) {
        setError(result.error)
        return
      }
      onClose()
      router.refresh()
    })
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-6 z-50"
      style={{ background: "rgba(7, 15, 30, 0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md"
        style={{
          background: "var(--white)",
          border: "1px solid rgba(11, 29, 58, 0.08)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div
            className="font-display uppercase"
            style={{
              color: "var(--steel)",
              fontSize: "11px",
              letterSpacing: "3px",
            }}
          >
            Edit cadence
          </div>
          <h2
            className="font-display"
            style={{
              color: "var(--ink)",
              fontSize: "20px",
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            {delivery.delivery_type}
          </h2>

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
              Frequency
            </span>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full px-3 py-2 font-sans"
              style={{
                background: "var(--parchment)",
                border: "1px solid rgba(11, 29, 58, 0.15)",
                color: "var(--ink)",
                fontSize: "14px",
              }}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </label>

          {error && (
            <div
              className="font-sans"
              style={{ color: "var(--enforcement)", fontSize: "13px" }}
            >
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <CTAButton variant="ghost" icon={false} onClick={onClose}>
              Cancel
            </CTAButton>
            <CTAButton type="submit" icon={false} disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </CTAButton>
          </div>
        </form>
      </div>
    </div>
  )
}
