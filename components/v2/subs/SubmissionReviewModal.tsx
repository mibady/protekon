"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  approveSubmission,
  rejectSubmission,
  type OnboardingSubmission,
} from "@/lib/actions/sub-onboarding"
import { CTAButton } from "@/components/v2/primitives/CTAButton"
import { PriorityPill } from "@/components/v2/primitives/PriorityPill"
import { ArrowSquareOut } from "@phosphor-icons/react/dist/ssr"

type Props = {
  open: boolean
  submission: OnboardingSubmission | null
  onClose: () => void
}

/**
 * Submission review drawer. For submitted status, shows Approve + Reject
 * controls; for decided status, shows a read-only view. All file URLs open
 * in a new tab (Blob URLs are signed / public-readable per the API route).
 */
export function SubmissionReviewModal({ open, submission, onClose }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<"view" | "reject">("view")
  const [rejectReason, setRejectReason] = useState("")
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  if (!open || !submission) return null

  function handleClose(): void {
    setError(null)
    setMode("view")
    setRejectReason("")
    onClose()
  }

  function handleApprove(): void {
    if (!submission) return
    setError(null)
    startTransition(async () => {
      const res = await approveSubmission(submission.id)
      if (res.error) {
        setError(res.error)
        return
      }
      router.refresh()
      handleClose()
    })
  }

  function handleReject(): void {
    if (!submission) return
    if (!rejectReason.trim()) {
      setError("A rejection reason is required.")
      return
    }
    setError(null)
    startTransition(async () => {
      const res = await rejectSubmission(submission.id, rejectReason.trim())
      if (res.error) {
        setError(res.error)
        return
      }
      router.refresh()
      handleClose()
    })
  }

  const canDecide = submission.status === "submitted"

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
        <div className="p-6">
          <Eyebrow>
            REVIEW SUBMISSION ·{" "}
            <span style={{ opacity: 1 }}>
              {submission.status.toUpperCase()}
            </span>
          </Eyebrow>
          <h2
            className="font-display tracking-tight mb-5 mt-2"
            style={{ color: "var(--ink)", fontSize: 24, fontWeight: 700 }}
          >
            {submission.legal_name}
          </h2>

          <dl className="space-y-4">
            <DetailRow label="EIN" value={submission.ein ?? "—"} />
            <DetailRow
              label="Address"
              value={submission.address ?? "—"}
              multiline
            />
            <DetailRow
              label="W-9 document"
              value={
                submission.w9_pdf_url ? (
                  <DocLink href={submission.w9_pdf_url} label="Open W-9" />
                ) : (
                  "—"
                )
              }
            />
            <DetailRow
              label="Signed MSA"
              value={
                submission.msa_signed_pdf_url ? (
                  <DocLink
                    href={submission.msa_signed_pdf_url}
                    label="Open signed MSA"
                  />
                ) : (
                  "—"
                )
              }
            />
            <DetailRow
              label="Submitted"
              value={formatDate(submission.created_at)}
            />
            {submission.reviewed_at && (
              <DetailRow
                label="Reviewed"
                value={formatDate(submission.reviewed_at)}
              />
            )}
            <DetailRow
              label="Status"
              value={
                <PriorityPill tone={statusTone(submission.status)}>
                  {submission.status.toUpperCase()}
                </PriorityPill>
              }
            />
          </dl>

          {canDecide && mode === "reject" && (
            <div className="mt-5">
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
                  Rejection reason
                </span>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  className="w-full font-sans"
                  style={{
                    background: "var(--parchment)",
                    border: "1px solid rgba(11,29,58,0.12)",
                    padding: "10px 12px",
                    fontSize: 14,
                    color: "var(--ink)",
                    outline: "none",
                    resize: "vertical",
                  }}
                  placeholder="Tell them what needs fixing."
                />
              </label>
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

          <div className="mt-6 flex items-center justify-end gap-3">
            {canDecide && mode === "view" && (
              <>
                <CTAButton
                  variant="ghost"
                  icon={false}
                  onClick={handleClose}
                  disabled={pending}
                >
                  Close
                </CTAButton>
                <CTAButton
                  variant="ghost"
                  icon={false}
                  onClick={() => setMode("reject")}
                  disabled={pending}
                >
                  Reject
                </CTAButton>
                <CTAButton
                  variant="primary"
                  icon={false}
                  onClick={handleApprove}
                  disabled={pending}
                >
                  {pending ? "Approving…" : "Approve"}
                </CTAButton>
              </>
            )}
            {canDecide && mode === "reject" && (
              <>
                <CTAButton
                  variant="ghost"
                  icon={false}
                  onClick={() => {
                    setMode("view")
                    setRejectReason("")
                    setError(null)
                  }}
                  disabled={pending}
                >
                  Back
                </CTAButton>
                <CTAButton
                  variant="primary"
                  icon={false}
                  onClick={handleReject}
                  disabled={pending}
                >
                  {pending ? "Rejecting…" : "Confirm rejection"}
                </CTAButton>
              </>
            )}
            {!canDecide && (
              <CTAButton
                variant="ghost"
                icon={false}
                onClick={handleClose}
                disabled={pending}
              >
                Close
              </CTAButton>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================

function statusTone(
  status: "submitted" | "approved" | "rejected"
): "enforcement" | "sand" | "steel" {
  if (status === "rejected") return "enforcement"
  if (status === "approved") return "steel"
  return "sand"
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

function DetailRow({
  label,
  value,
  multiline,
}: {
  label: string
  value: React.ReactNode
  multiline?: boolean
}) {
  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: multiline ? "140px 1fr" : "140px 1fr" }}
    >
      <dt
        className="font-display uppercase"
        style={{
          color: "var(--ink)",
          opacity: 0.6,
          fontSize: 11,
          letterSpacing: "2px",
          fontWeight: 600,
          paddingTop: 2,
        }}
      >
        {label}
      </dt>
      <dd
        className="font-sans"
        style={{
          color: "var(--ink)",
          fontSize: 14,
          margin: 0,
          whiteSpace: multiline ? "pre-wrap" : "normal",
        }}
      >
        {value}
      </dd>
    </div>
  )
}

function DocLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 font-sans"
      style={{ color: "var(--enforcement)", textDecoration: "underline" }}
    >
      {label}
      <ArrowSquareOut size={14} weight="bold" />
    </a>
  )
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
