"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CTAButton } from "@/components/v2/primitives/CTAButton"
import { inviteSub } from "@/lib/actions/sub-onboarding"
import { Copy, Check } from "@phosphor-icons/react/dist/ssr"

type Props = {
  open: boolean
  onClose: () => void
}

/**
 * Invite-a-sub modal. Collects company + contact, calls `inviteSub`, and
 * reveals the returned `/sub/[token]` URL for the owner to copy and
 * distribute out of band (email, text, whatever).
 */
export function InviteSubModal({ open, onClose }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [tokenUrl, setTokenUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  if (!open) return null

  function handleClose(): void {
    setTokenUrl(null)
    setError(null)
    setCopied(false)
    onClose()
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const data = new FormData(form)

    startTransition(async () => {
      const res = await inviteSub(data)
      if (res.error) {
        setError(res.error)
        return
      }
      const absolute = res.tokenUrl
        ? `${window.location.origin}${res.tokenUrl}`
        : null
      setTokenUrl(absolute)
      router.refresh()
    })
  }

  async function handleCopy(): Promise<void> {
    if (!tokenUrl) return
    try {
      await navigator.clipboard.writeText(tokenUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // TODO: inline error toast on clipboard failure.
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(7, 15, 30, 0.7)" }}
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--white)",
          border: "1px solid rgba(11, 29, 58, 0.08)",
        }}
      >
        <form onSubmit={handleSubmit} className="p-6">
          <Eyebrow>INVITE A SUB</Eyebrow>
          <h2
            className="font-display tracking-tight mb-5"
            style={{ color: "var(--ink)", fontSize: 24, fontWeight: 700 }}
          >
            Send them one link. You get everything back.
          </h2>

          <div className="space-y-4">
            <Field label="Company name">
              <input
                name="sub_company_name"
                type="text"
                required
                className="w-full font-sans"
                style={fieldStyle}
              />
            </Field>

            <Field label="Contact name (optional)">
              <input
                name="contact_name"
                type="text"
                className="w-full font-sans"
                style={fieldStyle}
              />
            </Field>

            <Field label="Contact email">
              <input
                name="contact_email"
                type="email"
                required
                className="w-full font-sans"
                style={fieldStyle}
              />
            </Field>
          </div>

          {error && (
            <p
              className="font-sans mt-4"
              style={{ color: "var(--enforcement)", fontSize: 13 }}
            >
              {error}
            </p>
          )}

          {tokenUrl && (
            <div
              className="mt-5 p-4"
              style={{
                background: "var(--parchment)",
                border: "1px solid rgba(11,29,58,0.08)",
              }}
            >
              <Eyebrow>SHAREABLE LINK — 30 DAYS</Eyebrow>
              <div className="mt-2 flex items-center gap-2">
                <input
                  readOnly
                  value={tokenUrl}
                  className="flex-1 font-sans"
                  style={{ ...fieldStyle, background: "var(--white)" }}
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 font-display uppercase"
                  style={copyBtnStyle}
                >
                  {copied ? (
                    <>
                      <Check size={12} weight="bold" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy size={12} weight="bold" /> Copy
                    </>
                  )}
                </button>
              </div>
              <p
                className="font-sans mt-3"
                style={{
                  color: "var(--ink)",
                  opacity: 0.6,
                  fontSize: 12,
                }}
              >
                Send this URL to the sub. They&apos;ll submit their W-9 and
                sign the MSA, then you&apos;ll see the submission in the
                Awaiting Review list.
              </p>
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-3">
            <CTAButton
              variant="ghost"
              icon={false}
              onClick={handleClose}
              disabled={pending}
            >
              {tokenUrl ? "Done" : "Cancel"}
            </CTAButton>
            {!tokenUrl && (
              <CTAButton
                variant="primary"
                type="submit"
                disabled={pending}
                icon={false}
              >
                {pending ? "Generating…" : "Generate invite"}
              </CTAButton>
            )}
          </div>
        </form>
      </div>
    </div>
  )
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

const copyBtnStyle: React.CSSProperties = {
  background: "transparent",
  border: "1px solid rgba(10,19,35,0.15)",
  padding: "8px 12px",
  fontSize: 11,
  letterSpacing: "2px",
  fontWeight: 600,
  color: "var(--ink)",
  cursor: "pointer",
}
