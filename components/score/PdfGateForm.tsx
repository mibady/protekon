"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, SpinnerGap, CheckCircle, WarningCircle } from "@phosphor-icons/react"

interface PdfGateFormProps {
  leadId: string | null
  onCapture: (email: string, businessName: string) => Promise<void>
}

export default function PdfGateForm({ leadId, onCapture }: PdfGateFormProps) {
  const [email, setEmail] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [pdfState, setPdfState] = useState<"idle" | "loading" | "success" | "error">("idle")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !businessName.trim()) return
    setPdfState("loading")
    try {
      await onCapture(email.trim(), businessName.trim())
      setPdfState("success")
    } catch {
      setPdfState("error")
    }
  }

  if (pdfState === "success") {
    return (
      <div className="bg-parchment p-8 mt-12">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle size={28} weight="fill" className="text-[#10B981]" />
          <h3 className="font-display text-[20px] font-semibold text-midnight">
            Your Scorecard is Ready
          </h3>
        </div>
        <p className="font-sans text-[15px] text-steel leading-relaxed mb-6">
          We also sent a copy to {email}. Keep it for your records.
        </p>
        {leadId && (
          <a
            href={`/api/score/report?id=${leadId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-crimson text-parchment font-display font-semibold text-[15px] uppercase tracking-[2px] px-8 py-4 hover:bg-crimson/90 transition-colors"
          >
            Download My Scorecard
            <ArrowRight size={16} weight="bold" />
          </a>
        )}
      </div>
    )
  }

  return (
    <div className="bg-parchment p-8 mt-12">
      <h3 className="font-display text-[20px] font-semibold text-midnight mb-2">
        Get your full Compliance Scorecard
      </h3>
      <p className="font-sans text-[15px] text-steel leading-relaxed mb-6 max-w-[560px]">
        A personalized PDF with your score breakdown, gap analysis, estimated fine exposure, and
        a comparison of what it costs to fix now vs. what it costs if Cal/OSHA shows up first.
      </p>

      {pdfState === "error" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 bg-crimson/10 border border-crimson/30 px-4 py-3 mb-4"
        >
          <WarningCircle size={18} weight="fill" className="text-crimson" />
          <p className="font-sans text-[14px] text-crimson">
            Something went wrong. Please try again.
          </p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-[480px]">
        <div>
          <label className="font-display font-semibold text-[13px] text-midnight block mb-1.5">
            Business Name
          </label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Your company name"
            className="w-full bg-brand-white border border-midnight/[0.15] text-midnight font-sans text-[15px] px-4 py-3 placeholder:text-steel/50 focus:outline-none focus:border-crimson/50 transition-colors"
          />
        </div>
        <div>
          <label className="font-display font-semibold text-[13px] text-midnight block mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full bg-brand-white border border-midnight/[0.15] text-midnight font-sans text-[15px] px-4 py-3 placeholder:text-steel/50 focus:outline-none focus:border-crimson/50 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={!email.trim() || !businessName.trim() || pdfState === "loading"}
          className="inline-flex items-center justify-center gap-2 bg-crimson text-parchment font-display font-semibold text-[15px] uppercase tracking-[2px] w-full py-4 hover:bg-crimson/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2"
        >
          {pdfState === "loading" ? (
            <>
              Generating...
              <SpinnerGap size={18} className="animate-spin" />
            </>
          ) : (
            <>
              Download My Scorecard
              <ArrowRight size={16} weight="bold" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
