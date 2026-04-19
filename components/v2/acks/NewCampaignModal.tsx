"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createAckCampaign } from "@/lib/actions/acknowledgments"
import { CTAButton } from "@/components/v2/primitives/CTAButton"
import { TokenLinkList } from "./TokenLinkList"

/**
 * Create-campaign form. Builds a dynamic assignee list (name + optional
 * email) and posts the payload to the shipped `createAckCampaign` server
 * action. On success we keep the modal open and render the returned
 * single-use token URLs so the owner can copy and distribute them.
 *
 * TODO (next wave): swap the policyDocumentId text input for a picker
 * against the documents table once that surface is wired.
 */
type NewCampaignModalProps = {
  open: boolean
  onClose: () => void
}

type Assignee = { name: string; email: string }

export function NewCampaignModal({ open, onClose }: NewCampaignModalProps) {
  const [assignees, setAssignees] = useState<Assignee[]>([{ name: "", email: "" }])
  const [error, setError] = useState<string | null>(null)
  const [tokenUrls, setTokenUrls] = useState<string[] | null>(null)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  if (!open) return null

  function updateAssignee(i: number, field: keyof Assignee, value: string): void {
    setAssignees((prev) => {
      const next = [...prev]
      next[i] = { ...next[i], [field]: value }
      return next
    })
  }

  function addAssignee(): void {
    setAssignees((prev) => [...prev, { name: "", email: "" }])
  }

  function removeAssignee(i: number): void {
    setAssignees((prev) => prev.filter((_, idx) => idx !== i))
  }

  function handleClose(): void {
    // Keep owner on page briefly so copy links survive accidental dismiss;
    // caller controls the boolean.
    setTokenUrls(null)
    setAssignees([{ name: "", email: "" }])
    setError(null)
    onClose()
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const data = new FormData(form)
    const policyDocumentId = (data.get("policyDocumentId") as string).trim()
    const policyVersion = (data.get("policyVersion") as string).trim()
    const cohortNote = ((data.get("cohortNote") as string) || "").trim()
    const dueDateRaw = (data.get("dueDate") as string) || ""

    const cleanAssignees = assignees
      .map((a) => ({ name: a.name.trim(), email: a.email.trim() || undefined }))
      .filter((a) => a.name.length > 0)

    if (!policyDocumentId || !policyVersion) {
      setError("Policy document ID and version are required.")
      return
    }
    if (cleanAssignees.length === 0) {
      setError("Add at least one assignee.")
      return
    }

    startTransition(async () => {
      const res = await createAckCampaign({
        policyDocumentId,
        policyVersion,
        cohortNote: cohortNote || undefined,
        dueDate: dueDateRaw ? new Date(dueDateRaw).toISOString() : undefined,
        assignees: cleanAssignees,
      })
      if (res.error) {
        setError(res.error)
        return
      }
      setTokenUrls(res.tokenUrls ?? [])
      router.refresh()
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(7, 15, 30, 0.7)" }}
      onClick={handleClose}
    >
      <div
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto"
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
            NEW ACKNOWLEDGMENT CAMPAIGN
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
            Send a policy. Collect signatures. Done.
          </h2>

          <div className="space-y-4">
            <Field label="Policy document ID">
              {/* TODO: wire to documents picker in the next wave. */}
              <input
                name="policyDocumentId"
                type="text"
                required
                className="w-full font-sans"
                style={fieldStyle}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Policy version">
                <input
                  name="policyVersion"
                  type="text"
                  required
                  placeholder="v2.1"
                  className="w-full font-sans"
                  style={fieldStyle}
                />
              </Field>
              <Field label="Due date">
                <input
                  name="dueDate"
                  type="date"
                  className="w-full font-sans"
                  style={fieldStyle}
                />
              </Field>
            </div>

            <Field label="Cohort note (optional)">
              <input
                name="cohortNote"
                type="text"
                placeholder="Swing shift, 2025 new hires, …"
                className="w-full font-sans"
                style={fieldStyle}
              />
            </Field>

            <div>
              <div
                className="font-display uppercase mb-2 flex items-center justify-between"
                style={{
                  color: "var(--ink)",
                  opacity: 0.6,
                  fontSize: "11px",
                  letterSpacing: "2px",
                  fontWeight: 600,
                }}
              >
                <span>Assignees</span>
                <button
                  type="button"
                  onClick={addAssignee}
                  style={{
                    color: "var(--enforcement)",
                    fontSize: "11px",
                    letterSpacing: "2px",
                    fontWeight: 600,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  + Add
                </button>
              </div>
              <div className="space-y-2">
                {assignees.map((a, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                    <input
                      type="text"
                      placeholder="Name"
                      value={a.name}
                      onChange={(e) => updateAssignee(i, "name", e.target.value)}
                      className="font-sans"
                      style={fieldStyle}
                    />
                    <input
                      type="email"
                      placeholder="Email (optional)"
                      value={a.email}
                      onChange={(e) => updateAssignee(i, "email", e.target.value)}
                      className="font-sans"
                      style={fieldStyle}
                    />
                    <button
                      type="button"
                      onClick={() => removeAssignee(i)}
                      disabled={assignees.length === 1}
                      className="font-display uppercase"
                      style={{
                        fontSize: "11px",
                        letterSpacing: "2px",
                        fontWeight: 600,
                        color: "var(--ink)",
                        opacity: assignees.length === 1 ? 0.3 : 0.7,
                        background: "transparent",
                        border: "1px solid rgba(10, 19, 35, 0.15)",
                        padding: "8px 10px",
                        cursor: assignees.length === 1 ? "not-allowed" : "pointer",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
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

          {tokenUrls && <TokenLinkList urls={tokenUrls} />}

          <div className="mt-6 flex items-center justify-end gap-3">
            <CTAButton
              variant="ghost"
              icon={false}
              onClick={handleClose}
              disabled={pending}
            >
              {tokenUrls ? "Done" : "Cancel"}
            </CTAButton>
            {!tokenUrls && (
              <CTAButton
                variant="primary"
                type="submit"
                disabled={pending}
                icon={false}
              >
                {pending ? "Creating…" : "Create campaign"}
              </CTAButton>
            )}
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
