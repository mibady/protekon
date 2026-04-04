"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, PaperPlaneTilt } from "@phosphor-icons/react"
import { toast } from "sonner"
import { sendAssessment } from "@/lib/actions/partner-portal"

interface SendAssessmentDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function SendAssessmentDialog({ open, onClose, onSuccess }: SendAssessmentDialogProps) {
  const [prospectName, setProspectName] = useState("")
  const [prospectEmail, setProspectEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await sendAssessment({
      prospect_name: prospectName.trim(),
      prospect_email: prospectEmail.trim(),
    })

    setLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }

    toast.success("Assessment sent successfully.")
    setProspectName("")
    setProspectEmail("")
    onClose()
    onSuccess()
  }

  const handleClose = () => {
    if (loading) return
    setError(null)
    setProspectName("")
    setProspectEmail("")
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-void/70 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Dialog */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-brand-white w-full max-w-md border border-midnight/[0.08] shadow-2xl"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-midnight/[0.06]">
                <h2 className="font-display font-bold text-[16px] tracking-[2px] uppercase text-midnight">
                  Send Assessment
                </h2>
                <button
                  onClick={handleClose}
                  disabled={loading}
                  className="p-1 text-steel hover:text-midnight transition-colors disabled:opacity-40"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
                <p className="font-sans text-[13px] text-steel">
                  Send a compliance assessment link to a prospect. They&apos;ll receive an email with a personalized assessment.
                </p>

                <div className="space-y-1">
                  <label className="block font-display font-medium text-[9px] tracking-[2px] uppercase text-steel">
                    Prospect Name <span className="text-crimson">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={prospectName}
                    onChange={(e) => setProspectName(e.target.value)}
                    placeholder="Jane Smith"
                    disabled={loading}
                    className="w-full bg-parchment border border-midnight/[0.12] px-4 py-2.5 font-sans text-[13px] text-midnight placeholder:text-steel outline-none focus:border-midnight/30 transition-colors disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-display font-medium text-[9px] tracking-[2px] uppercase text-steel">
                    Prospect Email <span className="text-crimson">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={prospectEmail}
                    onChange={(e) => setProspectEmail(e.target.value)}
                    placeholder="jane@company.com"
                    disabled={loading}
                    className="w-full bg-parchment border border-midnight/[0.12] px-4 py-2.5 font-sans text-[13px] text-midnight placeholder:text-steel outline-none focus:border-midnight/30 transition-colors disabled:opacity-50"
                  />
                </div>

                {error && (
                  <p className="font-sans text-[12px] text-crimson bg-crimson/[0.06] border border-crimson/20 px-3 py-2">
                    {error}
                  </p>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading || !prospectName.trim() || !prospectEmail.trim()}
                    className="flex items-center gap-2 bg-crimson text-brand-white px-5 py-2.5 font-display font-semibold text-[10px] tracking-[2px] uppercase hover:bg-crimson/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-brand-white/30 border-t-brand-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <PaperPlaneTilt size={14} weight="bold" />
                        Send Assessment
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="px-5 py-2.5 font-display font-medium text-[10px] tracking-[2px] uppercase text-steel border border-midnight/[0.12] hover:border-midnight/30 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
