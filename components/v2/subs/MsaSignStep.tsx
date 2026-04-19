"use client"

import { useRef, useState } from "react"
import { CTAButton } from "@/components/v2/primitives/CTAButton"
import {
  SignaturePad,
  type SignaturePadHandle,
} from "@/components/v2/acks/SignaturePad"

const MSA_BODY = `MASTER SERVICES AGREEMENT

This Master Services Agreement ("Agreement") is entered into between the Contractor (the party that invited you to complete this onboarding) and the Subcontractor (your company, as named in Step 1). By signing below, you acknowledge and agree to the following terms:

1. SCOPE OF WORK. The Subcontractor will perform work assigned by the Contractor on a project-by-project basis. Specific scope, schedule, and price for each engagement will be memorialized in a separate project order or change order referencing this Agreement.

2. INSURANCE & COMPLIANCE. The Subcontractor will maintain general liability, workers' compensation, and any other insurance required by the project, applicable law, or the Contractor's prime contract. Certificates of Insurance must be on file before any work begins. The Subcontractor agrees to comply with all applicable OSHA, Cal/OSHA, and local safety requirements, and to provide safety program documentation upon request.

3. PAYMENT & TAXES. The Subcontractor is responsible for its own taxes, workers' compensation premiums, and benefits. Payment is made on the Contractor's standard payment cycle against approved invoices. The Subcontractor acknowledges that amounts of $600 or more paid in a given tax year may be reported on Form 1099-NEC to the IRS.

4. INDEPENDENT CONTRACTOR. The Subcontractor is an independent contractor, not an employee of the Contractor. Nothing in this Agreement creates an employment, agency, partnership, or joint venture relationship.

5. CONFIDENTIALITY. The Subcontractor will keep confidential all non-public information obtained in connection with the work, including pricing, customer information, and proprietary methods, and will not use it for any purpose other than performing the work.

By drawing your signature below, you represent that you are authorized to bind the Subcontractor and that the information provided during onboarding is true and accurate to the best of your knowledge.`

type Props = {
  legalName: string
  contactName: string | null
  onBack: () => void
  onSubmit: (dataUrl: string) => void
}

/**
 * Step 3: MSA review + signature. Reuses W1's SignaturePad canvas so
 * signature capture is identical across acknowledgments and onboarding.
 */
export function MsaSignStep({
  legalName,
  contactName,
  onBack,
  onSubmit,
}: Props) {
  const padRef = useRef<SignaturePadHandle | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [accepted, setAccepted] = useState(false)

  function handleContinue(): void {
    setError(null)
    if (!accepted) {
      setError("Confirm you've read the agreement to continue.")
      return
    }
    const pad = padRef.current
    if (!pad || pad.isEmpty()) {
      setError("Please sign above to continue.")
      return
    }
    const url = pad.getDataURL()
    if (!url) {
      setError("Signature capture failed. Please try again.")
      return
    }
    onSubmit(url)
  }

  return (
    <div className="space-y-5">
      <div
        className="p-4 max-h-72 overflow-y-auto font-sans"
        style={{
          background: "var(--parchment)",
          border: "1px solid rgba(11,29,58,0.12)",
          fontSize: 13,
          lineHeight: 1.6,
          color: "var(--ink)",
          whiteSpace: "pre-wrap",
        }}
      >
        {MSA_BODY}
      </div>

      <label
        className="flex items-start gap-3 font-sans"
        style={{ fontSize: 14, color: "var(--ink)" }}
      >
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          style={{ marginTop: 4 }}
        />
        <span>
          I, {contactName ? `${contactName} of ` : ""}
          <strong>{legalName}</strong>, have read this agreement and am
          authorized to sign on behalf of my company.
        </span>
      </label>

      <div>
        <div
          className="font-display uppercase mb-2"
          style={{
            color: "var(--ink)",
            opacity: 0.6,
            fontSize: 11,
            letterSpacing: "2px",
            fontWeight: 600,
          }}
        >
          Sign below
        </div>
        <SignaturePad ref={padRef} height={160} />
        <button
          type="button"
          onClick={() => padRef.current?.clear()}
          className="mt-2 font-display uppercase"
          style={{
            background: "transparent",
            border: "none",
            color: "var(--ink)",
            opacity: 0.7,
            fontSize: 11,
            letterSpacing: "2px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Clear
        </button>
      </div>

      {error && (
        <p
          className="font-sans"
          style={{ color: "var(--enforcement)", fontSize: 14 }}
        >
          {error}
        </p>
      )}

      <div className="flex items-center justify-between">
        <CTAButton variant="ghost" icon={false} onClick={onBack}>
          Back
        </CTAButton>
        <CTAButton variant="primary" icon={true} onClick={handleContinue}>
          Continue
        </CTAButton>
      </div>
    </div>
  )
}
