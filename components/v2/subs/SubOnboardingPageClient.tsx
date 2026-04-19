"use client"

import { useMemo, useState } from "react"
import { CTAButton } from "@/components/v2/primitives/CTAButton"
import { PriorityPill } from "@/components/v2/primitives/PriorityPill"
import { InviteSubModal } from "./InviteSubModal"
import { SubmissionReviewModal } from "./SubmissionReviewModal"
import type {
  OnboardingSubmission,
  PendingInvite,
} from "@/lib/actions/sub-onboarding"
import { Copy, Check } from "@phosphor-icons/react/dist/ssr"

/**
 * Client shell for Sub Onboarding — owns modal state + copy-token state.
 * Server passes the full submissions + pending invites lists; we slice them
 * into three lists (pending review, historical approvals, rejections) and
 * render an invites strip above.
 */
type Props = {
  submissions: OnboardingSubmission[]
  pending: PendingInvite[]
}

export function SubOnboardingPageClient({ submissions, pending }: Props) {
  const [inviteOpen, setInviteOpen] = useState(false)
  const [reviewing, setReviewing] = useState<OnboardingSubmission | null>(null)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  const { submitted, decided } = useMemo(() => {
    const submitted = submissions.filter((s) => s.status === "submitted")
    const decided = submissions.filter((s) => s.status !== "submitted")
    return { submitted, decided }
  }, [submissions])

  async function copyLink(token: string): Promise<void> {
    const url = `${window.location.origin}/sub/${token}`
    try {
      await navigator.clipboard.writeText(url)
      setCopiedToken(token)
      window.setTimeout(() => setCopiedToken(null), 1500)
    } catch {
      // TODO: add inline error toast on clipboard failure.
    }
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-end">
        <CTAButton onClick={() => setInviteOpen(true)} icon={false}>
          Invite a sub
        </CTAButton>
      </div>

      {/* Pending invites — token exists, sub hasn't started / hasn't finished */}
      <section className="mb-10">
        <SectionHeading
          eyebrow="OUTSTANDING INVITES"
          title={`Sent, not yet submitted${pending.length > 0 ? ` · ${pending.length}` : ""}`}
        />
        {pending.length === 0 ? (
          <EmptyState text="No open invites. Send one above." />
        ) : (
          <div style={tableShell}>
            <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <ThHeader>Company</ThHeader>
                  <ThHeader>Contact</ThHeader>
                  <ThHeader>Sent</ThHeader>
                  <ThHeader>Expires</ThHeader>
                  <ThHeader align="right">Link</ThHeader>
                </tr>
              </thead>
              <tbody>
                {pending.map((p) => (
                  <tr key={p.token} style={trStyle}>
                    <Td>
                      <span className="font-display" style={{ fontWeight: 600 }}>
                        {p.sub_company_name}
                      </span>
                    </Td>
                    <Td>
                      <span style={{ opacity: 0.8 }}>
                        {p.contact_name ? `${p.contact_name} · ` : ""}
                        {p.contact_email}
                      </span>
                    </Td>
                    <Td>{formatDate(p.created_at)}</Td>
                    <Td>{formatDate(p.expires_at)}</Td>
                    <Td align="right">
                      <button
                        type="button"
                        onClick={() => copyLink(p.token)}
                        className="inline-flex items-center gap-1 font-display uppercase"
                        style={copyBtnStyle}
                      >
                        {copiedToken === p.token ? (
                          <>
                            <Check size={12} weight="bold" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy size={12} weight="bold" /> Copy
                          </>
                        )}
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Submitted — needs review */}
      <section className="mb-10">
        <SectionHeading
          eyebrow="AWAITING REVIEW"
          title={`Submitted, ready for approval${submitted.length > 0 ? ` · ${submitted.length}` : ""}`}
        />
        {submitted.length === 0 ? (
          <EmptyState text="No submissions awaiting review." />
        ) : (
          <SubmissionTable rows={submitted} onReview={setReviewing} />
        )}
      </section>

      {/* Historical */}
      <section>
        <SectionHeading
          eyebrow="HISTORY"
          title="Previously reviewed"
        />
        {decided.length === 0 ? (
          <EmptyState text="No reviewed submissions yet." />
        ) : (
          <SubmissionTable rows={decided} onReview={setReviewing} historical />
        )}
      </section>

      <InviteSubModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
      <SubmissionReviewModal
        open={reviewing !== null}
        submission={reviewing}
        onClose={() => setReviewing(null)}
      />
    </>
  )
}

// ============================================================
// Sub-components
// ============================================================

type SubmissionTableProps = {
  rows: OnboardingSubmission[]
  onReview: (s: OnboardingSubmission) => void
  historical?: boolean
}

function SubmissionTable({ rows, onReview, historical }: SubmissionTableProps) {
  return (
    <div style={tableShell}>
      <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <ThHeader>Legal name</ThHeader>
            <ThHeader>EIN</ThHeader>
            <ThHeader>Received</ThHeader>
            <ThHeader>Status</ThHeader>
            <ThHeader align="right">Action</ThHeader>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => (
            <tr key={s.id} style={trStyle}>
              <Td>
                <span className="font-display" style={{ fontWeight: 600 }}>
                  {s.legal_name}
                </span>
                {s.sub_company_name && s.sub_company_name !== s.legal_name && (
                  <div style={{ opacity: 0.6, fontSize: 12 }}>
                    Invited as: {s.sub_company_name}
                  </div>
                )}
              </Td>
              <Td>{s.ein ?? "—"}</Td>
              <Td>{formatDate(s.created_at)}</Td>
              <Td>
                <PriorityPill tone={statusTone(s.status)}>
                  {s.status.toUpperCase()}
                </PriorityPill>
              </Td>
              <Td align="right">
                <button
                  type="button"
                  onClick={() => onReview(s)}
                  className="font-display uppercase"
                  style={copyBtnStyle}
                >
                  {historical ? "View" : "Review"}
                </button>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function statusTone(
  status: "submitted" | "approved" | "rejected"
): "enforcement" | "sand" | "steel" {
  if (status === "rejected") return "enforcement"
  if (status === "approved") return "steel"
  return "sand"
}

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string
  title: string
}) {
  return (
    <div className="mb-3">
      <div
        className="font-display uppercase mb-1"
        style={{
          color: "var(--ink)",
          opacity: 0.5,
          fontSize: "11px",
          letterSpacing: "3px",
          fontWeight: 500,
        }}
      >
        {eyebrow}
      </div>
      <h2
        className="font-display"
        style={{ color: "var(--ink)", fontSize: 20, fontWeight: 700 }}
      >
        {title}
      </h2>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div
      className="font-sans"
      style={{
        padding: "20px",
        background: "var(--parchment)",
        color: "var(--ink)",
        opacity: 0.7,
        fontSize: 14,
      }}
    >
      {text}
    </div>
  )
}

function ThHeader({
  children,
  align = "left",
}: {
  children: React.ReactNode
  align?: "left" | "right"
}) {
  return (
    <th
      className="font-display uppercase"
      style={{
        textAlign: align,
        fontSize: 10,
        letterSpacing: "2px",
        fontWeight: 600,
        color: "var(--ink)",
        opacity: 0.55,
        padding: "10px 14px",
        borderBottom: "1px solid rgba(11,29,58,0.08)",
      }}
    >
      {children}
    </th>
  )
}

function Td({
  children,
  align = "left",
}: {
  children: React.ReactNode
  align?: "left" | "right"
}) {
  return (
    <td
      style={{
        textAlign: align,
        padding: "12px 14px",
        color: "var(--ink)",
        fontSize: 14,
        verticalAlign: "top",
      }}
    >
      {children}
    </td>
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

const tableShell: React.CSSProperties = {
  background: "var(--white)",
  border: "1px solid rgba(11,29,58,0.08)",
}

const trStyle: React.CSSProperties = {
  borderBottom: "1px solid rgba(11,29,58,0.06)",
}

const copyBtnStyle: React.CSSProperties = {
  background: "transparent",
  border: "1px solid rgba(10,19,35,0.15)",
  padding: "6px 10px",
  fontSize: 11,
  letterSpacing: "2px",
  fontWeight: 600,
  color: "var(--ink)",
  cursor: "pointer",
}
