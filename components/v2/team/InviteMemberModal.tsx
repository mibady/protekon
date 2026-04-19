"use client"

/**
 * InviteMemberModal — ModalShell pattern (fixed backdrop + centered Card).
 * Submits to inviteTeammate server action. On success, surfaces the returned
 * tokenUrl with a manual Copy-link fallback so the owner can share it directly
 * if the Supabase Auth invite email bounces.
 */

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CTAButton } from "@/components/v2/primitives/CTAButton"
import { Card } from "@/components/v2/primitives/Card"
import { inviteTeammate } from "@/lib/actions/team"
import type { UserRole } from "@/lib/auth/roles"

type InviteMemberModalProps = {
  open: boolean
  onClose: () => void
}

const ROLE_OPTIONS: { value: UserRole; label: string; note: string }[] = [
  { value: "owner", label: "Owner", note: "Full access + billing + team." },
  {
    value: "compliance_manager",
    label: "Compliance manager",
    note: "Day-to-day operator. Writes across surfaces.",
  },
  {
    value: "field_lead",
    label: "Field lead",
    note: "Logs incidents + training only.",
  },
  { value: "auditor", label: "Auditor", note: "Read-only access." },
]

export function InviteMemberModal({ open, onClose }: InviteMemberModalProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<UserRole>("field_lead")
  const [error, setError] = useState<string | null>(null)
  const [sentTokenUrl, setSentTokenUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  if (!open) return null

  const reset = () => {
    setEmail("")
    setRole("field_lead")
    setError(null)
    setSentTokenUrl(null)
    setCopied(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const fd = new FormData()
    fd.set("email", email)
    fd.set("role", role)
    startTransition(async () => {
      const res = await inviteTeammate(fd)
      if (res.error) {
        setError(res.error)
        return
      }
      setSentTokenUrl(res.tokenUrl ?? null)
      router.refresh()
    })
  }

  const handleCopy = async () => {
    if (!sentTokenUrl) return
    const url = `${window.location.origin}${sentTokenUrl}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // eslint-disable-next-line no-alert
      prompt("Copy this invite URL:", url)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(10, 19, 35, 0.55)" }}
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <Card accent="enforcement" padding="p-8">
          <div
            className="font-display uppercase mb-3"
            style={{
              color: "var(--ink)",
              opacity: 0.5,
              fontSize: 11,
              letterSpacing: 3,
              fontWeight: 500,
            }}
          >
            Team · Invite
          </div>
          <h2
            className="font-display tracking-tight"
            style={{
              color: "var(--ink)",
              fontSize: 24,
              fontWeight: 700,
              lineHeight: 1.2,
              marginBottom: 20,
            }}
          >
            {sentTokenUrl ? "Invite sent." : "Add a teammate."}
          </h2>

          {sentTokenUrl ? (
            <div>
              <p
                className="font-sans mb-4"
                style={{ color: "var(--ink)", opacity: 0.75, fontSize: 14, lineHeight: 1.55 }}
              >
                We emailed {email} a link to accept. If the email bounces, copy
                the link below and send it manually.
              </p>
              <div
                className="flex items-center gap-2 mb-6"
                style={{
                  background: "var(--parchment)",
                  border: "1px solid rgba(11, 29, 58, 0.15)",
                  padding: "10px 12px",
                }}
              >
                <code
                  className="flex-1 font-sans"
                  style={{
                    fontSize: 12,
                    color: "var(--ink)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {sentTokenUrl}
                </code>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="font-display uppercase"
                  style={{
                    background: "var(--void)",
                    color: "var(--parchment)",
                    border: "none",
                    padding: "6px 10px",
                    fontSize: 10,
                    letterSpacing: 2,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {copied ? "Copied" : "Copy link"}
                </button>
              </div>
              <div className="flex justify-end">
                <CTAButton onClick={handleClose} icon={false}>
                  Done
                </CTAButton>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <label
                className="font-display uppercase block mb-2"
                style={{
                  color: "var(--ink)",
                  opacity: 0.7,
                  fontSize: 11,
                  letterSpacing: 3,
                  fontWeight: 600,
                }}
              >
                Email
              </label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full font-sans mb-5"
                style={{
                  background: "var(--parchment)",
                  border: "1px solid rgba(11, 29, 58, 0.15)",
                  padding: "10px 12px",
                  fontSize: 14,
                  color: "var(--ink)",
                }}
              />

              <label
                className="font-display uppercase block mb-2"
                style={{
                  color: "var(--ink)",
                  opacity: 0.7,
                  fontSize: 11,
                  letterSpacing: 3,
                  fontWeight: 600,
                }}
              >
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full font-sans mb-2"
                style={{
                  background: "var(--parchment)",
                  border: "1px solid rgba(11, 29, 58, 0.15)",
                  padding: "10px 12px",
                  fontSize: 14,
                  color: "var(--ink)",
                }}
              >
                {ROLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <p
                className="font-sans italic mb-6"
                style={{ color: "var(--steel)", fontSize: 12 }}
              >
                {ROLE_OPTIONS.find((o) => o.value === role)?.note}
              </p>

              {error && (
                <div
                  className="font-sans mb-4"
                  style={{
                    color: "var(--enforcement)",
                    fontSize: 13,
                    background: "rgba(196, 57, 43, 0.08)",
                    border: "1px solid rgba(196, 57, 43, 0.25)",
                    padding: "8px 12px",
                  }}
                >
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3">
                <CTAButton
                  variant="ghost"
                  icon={false}
                  onClick={handleClose}
                >
                  Cancel
                </CTAButton>
                <CTAButton type="submit" disabled={isPending}>
                  {isPending ? "Sending…" : "Send invite"}
                </CTAButton>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
