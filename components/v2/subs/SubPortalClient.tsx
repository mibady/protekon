"use client"

import { useState } from "react"
import { CompanyInfoStep } from "./CompanyInfoStep"
import { W9UploadStep } from "./W9UploadStep"
import { MsaSignStep } from "./MsaSignStep"
import { CTAButton } from "@/components/v2/primitives/CTAButton"
import { CheckCircle } from "@phosphor-icons/react/dist/ssr"

type Props = {
  token: string
  companyName: string
  contactName: string | null
  contactEmail: string
}

type Step = "company" | "w9" | "msa" | "review" | "done"

type CollectedState = {
  legal_name: string
  ein: string
  address: string
  w9File: File | null
  msa_signature_data_url: string | null
}

/**
 * 3-step sub onboarding portal (Company info → W-9 upload → MSA sign) with
 * a review + submit step at the end. State is kept in-memory on the
 * client; only the final submit POSTs the multipart form. No server round
 * trips between steps.
 */
export function SubPortalClient({
  token,
  companyName,
  contactName,
  contactEmail,
}: Props) {
  const [step, setStep] = useState<Step>("company")
  const [state, setState] = useState<CollectedState>({
    legal_name: companyName,
    ein: "",
    address: "",
    w9File: null,
    msa_signature_data_url: null,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleCompany(data: {
    legal_name: string
    ein: string
    address: string
  }): void {
    setState((prev) => ({ ...prev, ...data }))
    setStep("w9")
  }

  function handleW9(file: File): void {
    setState((prev) => ({ ...prev, w9File: file }))
    setStep("msa")
  }

  function handleMsa(dataUrl: string): void {
    setState((prev) => ({ ...prev, msa_signature_data_url: dataUrl }))
    setStep("review")
  }

  async function handleSubmit(): Promise<void> {
    if (!state.w9File) {
      setError("W-9 file is missing.")
      setStep("w9")
      return
    }
    if (!state.msa_signature_data_url) {
      setError("Signature is missing.")
      setStep("msa")
      return
    }
    setError(null)
    setSubmitting(true)

    const fd = new FormData()
    fd.set("legal_name", state.legal_name)
    if (state.ein) fd.set("ein", state.ein)
    if (state.address) fd.set("address", state.address)
    fd.set("w9", state.w9File)
    fd.set("msa_signature_data_url", state.msa_signature_data_url)
    if (typeof navigator !== "undefined") {
      fd.set("user_agent", navigator.userAgent)
    }

    try {
      const res = await fetch(`/api/sub-onboarding/submit/${token}`, {
        method: "POST",
        body: fd,
      })
      const payload = await res.json().catch(() => ({}) as Record<string, unknown>)
      if (!res.ok) {
        const message =
          typeof payload.error === "string"
            ? payload.error
            : "Submission failed. Please try again."
        setError(message)
        setSubmitting(false)
        return
      }
      setStep("done")
    } catch {
      setError("Network error. Please try again.")
      setSubmitting(false)
    }
  }

  if (step === "done") {
    return (
      <div>
        <div
          className="p-6 flex items-start gap-4"
          style={{
            background: "var(--white)",
            border: "1px solid rgba(11,29,58,0.08)",
          }}
        >
          <CheckCircle size={32} color="var(--steel)" weight="fill" />
          <div>
            <Eyebrow>ONBOARDING SUBMITTED</Eyebrow>
            <h1
              className="font-display tracking-tight mt-2 mb-3"
              style={{ color: "var(--ink)", fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}
            >
              You&apos;re done. The contractor takes it from here.
            </h1>
            <p
              className="font-sans"
              style={{
                color: "var(--ink)",
                opacity: 0.7,
                fontSize: 15,
                lineHeight: 1.55,
              }}
            >
              They&apos;ll review your W-9 and signed MSA. If anything needs
              fixing they&apos;ll reach out at{" "}
              <span style={{ fontWeight: 600 }}>{contactEmail}</span>. You can
              close this tab.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Eyebrow>SUB ONBOARDING · {companyName.toUpperCase()}</Eyebrow>
      <h1
        className="font-display tracking-tight mt-2 mb-1"
        style={{ color: "var(--ink)", fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}
      >
        {headlineFor(step)}
      </h1>
      <p
        className="font-sans mb-6"
        style={{ color: "var(--ink)", opacity: 0.7, fontSize: 15 }}
      >
        {subheadFor(step)}
      </p>

      <StepIndicator step={step} />

      <div
        className="mt-6 p-6"
        style={{
          background: "var(--white)",
          border: "1px solid rgba(11,29,58,0.08)",
        }}
      >
        {step === "company" && (
          <CompanyInfoStep
            defaults={{
              legal_name: state.legal_name,
              ein: state.ein,
              address: state.address,
            }}
            onSubmit={handleCompany}
          />
        )}

        {step === "w9" && (
          <W9UploadStep
            onBack={() => setStep("company")}
            onSubmit={handleW9}
            existingFileName={state.w9File?.name ?? null}
          />
        )}

        {step === "msa" && (
          <MsaSignStep
            legalName={state.legal_name}
            contactName={contactName}
            onBack={() => setStep("w9")}
            onSubmit={handleMsa}
          />
        )}

        {step === "review" && (
          <ReviewStep
            state={state}
            contactEmail={contactEmail}
            submitting={submitting}
            error={error}
            onEdit={(target) => setStep(target)}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  )
}

// ============================================================
// Review step (inlined — doesn't need its own file)
// ============================================================

function ReviewStep({
  state,
  contactEmail,
  submitting,
  error,
  onEdit,
  onSubmit,
}: {
  state: CollectedState
  contactEmail: string
  submitting: boolean
  error: string | null
  onEdit: (step: Step) => void
  onSubmit: () => void
}) {
  return (
    <div>
      <Eyebrow>REVIEW &amp; SUBMIT</Eyebrow>
      <p
        className="font-sans mt-2 mb-5"
        style={{ color: "var(--ink)", opacity: 0.7, fontSize: 14 }}
      >
        Confirm everything looks right, then submit. The contractor will be
        notified at{" "}
        <span style={{ fontWeight: 600 }}>{contactEmail}</span>.
      </p>

      <dl className="space-y-3">
        <ReviewRow
          label="Legal name"
          value={state.legal_name}
          onEdit={() => onEdit("company")}
        />
        <ReviewRow
          label="EIN"
          value={state.ein || "—"}
          onEdit={() => onEdit("company")}
        />
        <ReviewRow
          label="Address"
          value={state.address || "—"}
          onEdit={() => onEdit("company")}
          multiline
        />
        <ReviewRow
          label="W-9"
          value={state.w9File?.name ?? "(missing)"}
          onEdit={() => onEdit("w9")}
        />
        <ReviewRow
          label="MSA signature"
          value={state.msa_signature_data_url ? "Captured" : "(missing)"}
          onEdit={() => onEdit("msa")}
        />
      </dl>

      {error && (
        <p
          className="font-sans mt-4"
          style={{ color: "var(--enforcement)", fontSize: 14 }}
        >
          {error}
        </p>
      )}

      <div className="mt-6 flex items-center justify-end gap-3">
        <CTAButton
          variant="ghost"
          icon={false}
          onClick={() => onEdit("msa")}
          disabled={submitting}
        >
          Back
        </CTAButton>
        <CTAButton
          variant="primary"
          icon={false}
          onClick={onSubmit}
          disabled={submitting}
        >
          {submitting ? "Submitting…" : "Submit onboarding"}
        </CTAButton>
      </div>
    </div>
  )
}

function ReviewRow({
  label,
  value,
  onEdit,
  multiline,
}: {
  label: string
  value: string
  onEdit: () => void
  multiline?: boolean
}) {
  return (
    <div
      className="grid gap-2 items-start"
      style={{ gridTemplateColumns: "140px 1fr auto" }}
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
      <button
        type="button"
        onClick={onEdit}
        className="font-display uppercase"
        style={{
          background: "transparent",
          border: "none",
          color: "var(--enforcement)",
          fontSize: 11,
          letterSpacing: "2px",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Edit
      </button>
    </div>
  )
}

// ============================================================
// Step indicator
// ============================================================

function StepIndicator({ step }: { step: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: "company", label: "Company" },
    { id: "w9", label: "W-9" },
    { id: "msa", label: "MSA" },
  ]
  const order: Step[] = ["company", "w9", "msa", "review"]
  const activeIdx = order.indexOf(step)

  return (
    <div className="flex items-center gap-3">
      {steps.map((s, i) => {
        const complete = activeIdx > i
        const active = activeIdx === i
        const stepState: "complete" | "active" | "pending" = complete
          ? "complete"
          : active
            ? "active"
            : "pending"

        return (
          <div key={s.id} className="flex items-center gap-3 flex-1">
            <div
              className="font-display"
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  stepState === "complete"
                    ? "var(--steel)"
                    : stepState === "active"
                      ? "var(--enforcement)"
                      : "transparent",
                color:
                  stepState === "pending" ? "var(--ink)" : "var(--parchment)",
                opacity: stepState === "pending" ? 0.5 : 1,
                border:
                  stepState === "pending"
                    ? "1px solid rgba(11,29,58,0.2)"
                    : "none",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {i + 1}
            </div>
            <div
              className="font-display uppercase"
              style={{
                color: "var(--ink)",
                opacity: stepState === "pending" ? 0.4 : 1,
                fontSize: 11,
                letterSpacing: "2px",
                fontWeight: 600,
              }}
            >
              {s.label}
            </div>
            {i < steps.length - 1 && (
              <div
                className="flex-1"
                style={{
                  height: 1,
                  background:
                    activeIdx > i
                      ? "var(--steel)"
                      : "rgba(11,29,58,0.12)",
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ============================================================

function headlineFor(step: Step): string {
  if (step === "company") return "Let's start with your company."
  if (step === "w9") return "Upload your W-9."
  if (step === "msa") return "Review and sign the MSA."
  return "Confirm and submit."
}

function subheadFor(step: Step): string {
  if (step === "company")
    return "Your legal name, Tax ID, and business address. We only keep what we need."
  if (step === "w9")
    return "A current W-9 PDF or photo — anything issued after your last tax year."
  if (step === "msa")
    return "A straightforward Master Services Agreement — read it, sign it, continue."
  return "One last check before we send this to the contractor."
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
