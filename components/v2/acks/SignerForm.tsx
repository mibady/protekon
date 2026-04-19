"use client"

import { useRef, useState } from "react"
import { CTAButton } from "@/components/v2/primitives/CTAButton"
import { SignaturePad, type SignaturePadHandle } from "./SignaturePad"

/**
 * Mobile-first signer form. Posts JSON to /api/ack/sign/[token] and,
 * on success, replaces its own body with a confirmation surface that
 * includes a truncated hash preview and the timestamp.
 */
type SignerFormProps = {
  token: string
  policyVersion: string
  cohortNote: string | null
  dueDate: string | null
  assignedTo: string | null
}

type SignSuccess = {
  signedAt: string
  hashPreview: string
  pdfUrl?: string
}

export function SignerForm({
  token,
  policyVersion,
  cohortNote,
  dueDate,
  assignedTo,
}: SignerFormProps) {
  const padRef = useRef<SignaturePadHandle | null>(null)
  const [name, setName] = useState(assignedTo?.split("<")[0]?.trim() ?? "")
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [success, setSuccess] = useState<SignSuccess | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setError(null)

    if (!padRef.current || padRef.current.isEmpty()) {
      setError("Please sign above before submitting.")
      return
    }
    if (!name.trim()) {
      setError("Enter your name.")
      return
    }

    setPending(true)
    try {
      const res = await fetch(`/api/ack/sign/${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          signatureDataUrl: padRef.current.getDataURL(),
          signerName: name.trim(),
          signerEmail: email.trim() || undefined,
          userAgent: navigator.userAgent,
        }),
      })
      const json = (await res.json()) as {
        error?: string
        success?: boolean
        signedPdfUrl?: string
      }
      if (!res.ok || !json.success) {
        setError(json.error ?? "Could not record signature. Try again.")
        return
      }
      // Server doesn't echo the hash; compute a short visual confirmation
      // from the URL so the signer sees something stable.
      const preview = json.signedPdfUrl
        ? json.signedPdfUrl.split("/").pop()?.slice(0, 16) ?? ""
        : ""
      setSuccess({
        signedAt: new Date().toLocaleString(),
        hashPreview: preview,
        pdfUrl: json.signedPdfUrl,
      })
    } catch {
      setError("Network error — please try again.")
    } finally {
      setPending(false)
    }
  }

  if (success) {
    return (
      <div style={{ textAlign: "center" }}>
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
          SIGNED
        </div>
        <h2
          className="font-display tracking-tight mb-3"
          style={{
            color: "var(--ink)",
            fontSize: "28px",
            fontWeight: 700,
            lineHeight: 1.2,
          }}
        >
          Thank you. You can close this tab.
        </h2>
        <p
          className="font-sans mb-4"
          style={{
            color: "var(--ink)",
            opacity: 0.7,
            fontSize: "15px",
            lineHeight: 1.55,
          }}
        >
          We recorded your signature for policy <strong>{policyVersion}</strong> at{" "}
          {success.signedAt}.
        </p>
        {success.hashPreview && (
          <p
            className="font-sans"
            style={{
              color: "var(--ink)",
              opacity: 0.5,
              fontSize: "12px",
            }}
          >
            Record ID: {success.hashPreview}…
          </p>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div
          style={{
            background: "var(--parchment)",
            border: "1px solid rgba(11, 29, 58, 0.08)",
            padding: "14px 16px",
          }}
        >
          <DetailRow label="Policy" value={policyVersion} />
          {cohortNote && <DetailRow label="Cohort" value={cohortNote} />}
          {dueDate && (
            <DetailRow label="Due" value={new Date(dueDate).toLocaleDateString()} />
          )}
        </div>

        <p
          className="font-sans"
          style={{
            color: "var(--ink)",
            opacity: 0.8,
            fontSize: "15px",
            lineHeight: 1.55,
          }}
        >
          By signing below, you acknowledge you've read and understood this
          policy.
        </p>

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
            Your name
          </span>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full font-sans"
            style={inputStyle}
          />
        </label>

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
            Email (optional)
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full font-sans"
            style={inputStyle}
          />
        </label>

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
            <span>Sign here</span>
            <button
              type="button"
              onClick={() => padRef.current?.clear()}
              style={{
                color: "var(--ink)",
                opacity: 0.7,
                fontSize: "11px",
                letterSpacing: "2px",
                fontWeight: 600,
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          </div>
          <SignaturePad ref={padRef} height={180} />
        </div>

        {error && (
          <p
            className="font-sans"
            style={{ color: "var(--enforcement)", fontSize: "14px" }}
          >
            {error}
          </p>
        )}

        <CTAButton
          variant="primary"
          type="submit"
          disabled={pending}
          icon={false}
          className="w-full justify-center"
        >
          {pending ? "Recording signature…" : "Submit signature"}
        </CTAButton>
      </div>
    </form>
  )
}

const inputStyle: React.CSSProperties = {
  background: "var(--parchment)",
  border: "1px solid rgba(11, 29, 58, 0.15)",
  padding: "12px 14px",
  fontSize: "16px", // ≥16px prevents iOS zoom-on-focus
  color: "var(--ink)",
  outline: "none",
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1">
      <span
        className="font-display uppercase"
        style={{
          color: "var(--ink)",
          opacity: 0.5,
          fontSize: "10px",
          letterSpacing: "2px",
          fontWeight: 600,
        }}
      >
        {label}
      </span>
      <span
        className="font-sans text-right"
        style={{ color: "var(--ink)", fontSize: "14px" }}
      >
        {value}
      </span>
    </div>
  )
}
