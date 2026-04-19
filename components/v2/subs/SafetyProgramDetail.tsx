"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  upsertSafetyProgram,
  reviewSafetyProgram,
  type SafetyProgram,
} from "@/lib/actions/safety-programs"
import type { ProgramType } from "@/lib/data/safety-program-templates"
import { CTAButton } from "@/components/v2/primitives/CTAButton"
import { PriorityPill } from "@/components/v2/primitives/PriorityPill"
import { ArrowSquareOut } from "@phosphor-icons/react/dist/ssr"

type SubRow = { id: string; company_name: string | null }
type TemplateRow = {
  type: string
  title: string
  authority: string
  reviewIntervalDays: number
  description: string
}

type Props = {
  open: boolean
  sub: SubRow | null
  programType: ProgramType | null
  program: SafetyProgram | null
  templates: TemplateRow[]
  onClose: () => void
}

/**
 * Safety-program detail drawer. Two primary actions:
 *   - Upsert: attach/replace a document URL + effective date (resets status
 *     to pending).
 *   - Review: owner/compliance_manager can approve or reject with notes.
 *
 * Document storage is URL-only for MVP — use the Documents surface to
 * upload a PDF first, then paste its URL here. TODO(later): inline upload
 * via Vercel Blob.
 */
export function SafetyProgramDetail({
  open,
  sub,
  programType,
  program,
  templates,
  onClose,
}: Props) {
  const [error, setError] = useState<string | null>(null)
  const [documentUrl, setDocumentUrl] = useState("")
  const [effectiveDate, setEffectiveDate] = useState("")
  const [reviewerNotes, setReviewerNotes] = useState("")
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  // Reset form when a new cell is opened
  useEffect(() => {
    if (!open) return
    setError(null)
    setReviewerNotes("")
    setDocumentUrl(program?.document_url ?? "")
    setEffectiveDate(program?.effective_date ?? "")
  }, [open, program?.id, program?.document_url, program?.effective_date])

  if (!open || !sub || !programType) return null

  const template = templates.find((t) => t.type === programType)

  function handleUpsert(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault()
    if (!sub || !programType) return
    setError(null)
    const fd = new FormData()
    fd.set("sub_id", sub.id)
    fd.set("program_type", programType)
    if (documentUrl) fd.set("document_url", documentUrl)
    if (effectiveDate) fd.set("effective_date", effectiveDate)

    startTransition(async () => {
      const res = await upsertSafetyProgram(fd)
      if (res.error) {
        setError(res.error)
        return
      }
      router.refresh()
      onClose()
    })
  }

  function handleReview(decision: "approved" | "rejected"): void {
    if (!program) return
    if (decision === "rejected" && !reviewerNotes.trim()) {
      setError("Reviewer notes are required when rejecting.")
      return
    }
    setError(null)
    startTransition(async () => {
      const res = await reviewSafetyProgram(
        program.id,
        decision,
        reviewerNotes.trim() || undefined
      )
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
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--white)",
          border: "1px solid rgba(11,29,58,0.08)",
        }}
      >
        <div className="p-6">
          <Eyebrow>
            {sub.company_name ?? "(unnamed sub)"} · {template?.authority ?? ""}
          </Eyebrow>
          <h2
            className="font-display tracking-tight mb-2 mt-2"
            style={{ color: "var(--ink)", fontSize: 24, fontWeight: 700 }}
          >
            {template?.title ?? programType.toUpperCase()}
          </h2>
          <p
            className="font-sans mb-5"
            style={{ color: "var(--ink)", opacity: 0.7, fontSize: 14 }}
          >
            {template?.description ?? ""}
          </p>

          {program && (
            <div
              className="p-4 mb-5"
              style={{
                background: "var(--parchment)",
                border: "1px solid rgba(11,29,58,0.08)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <Eyebrow>CURRENT STATUS</Eyebrow>
                <PriorityPill tone={toneFor(program.status)}>
                  {program.status.toUpperCase()}
                </PriorityPill>
              </div>
              {program.document_url && (
                <a
                  href={program.document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-sans"
                  style={{
                    color: "var(--enforcement)",
                    textDecoration: "underline",
                    fontSize: 14,
                  }}
                >
                  Open current document
                  <ArrowSquareOut size={14} weight="bold" />
                </a>
              )}
              {program.reviewer_notes && (
                <p
                  className="font-sans mt-3"
                  style={{
                    color: "var(--ink)",
                    opacity: 0.8,
                    fontSize: 13,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  Reviewer notes: {program.reviewer_notes}
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleUpsert}>
            <Eyebrow>{program ? "REPLACE DOCUMENT" : "ATTACH DOCUMENT"}</Eyebrow>
            <p
              className="font-sans mt-1 mb-4"
              style={{ color: "var(--ink)", opacity: 0.6, fontSize: 12 }}
            >
              Paste the URL of the program PDF. Upload to Documents first.
              TODO: inline upload in the next wave.
            </p>

            <div className="space-y-4">
              <Field label="Document URL">
                <input
                  type="url"
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  placeholder="https://…"
                  className="w-full font-sans"
                  style={fieldStyle}
                />
              </Field>
              <Field label="Effective date">
                <input
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full font-sans"
                  style={fieldStyle}
                />
              </Field>
            </div>

            <div className="mt-4 flex items-center justify-end gap-3">
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
                {pending ? "Saving…" : program ? "Update program" : "Save program"}
              </CTAButton>
            </div>
          </form>

          {program && program.status === "pending" && (
            <div
              className="mt-6 pt-6"
              style={{ borderTop: "1px solid rgba(11,29,58,0.08)" }}
            >
              <Eyebrow>REVIEWER DECISION</Eyebrow>
              <label className="block mt-3">
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
                  Notes (required for rejection)
                </span>
                <textarea
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  rows={3}
                  className="w-full font-sans"
                  style={{ ...fieldStyle, resize: "vertical" }}
                />
              </label>
              <div className="mt-4 flex items-center justify-end gap-3">
                <CTAButton
                  variant="ghost"
                  icon={false}
                  onClick={() => handleReview("rejected")}
                  disabled={pending}
                >
                  Reject
                </CTAButton>
                <CTAButton
                  variant="primary"
                  icon={false}
                  onClick={() => handleReview("approved")}
                  disabled={pending}
                >
                  Approve
                </CTAButton>
              </div>
            </div>
          )}

          {error && (
            <p
              className="font-sans mt-4"
              style={{ color: "var(--enforcement)", fontSize: 13 }}
            >
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================

function toneFor(
  status: "approved" | "pending" | "rejected" | "expired"
): "enforcement" | "sand" | "steel" {
  if (status === "approved") return "steel"
  if (status === "pending") return "sand"
  return "enforcement"
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
