"use client"

import { useState, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UploadSimple, X, FileText } from "@phosphor-icons/react"
import { toast } from "sonner"

interface Props {
  subId: string
  subName: string
  onUploaded?: () => void | Promise<void>
  trigger?: ReactNode
}

const ACCEPT = "application/pdf,image/png,image/jpeg"
const MAX_BYTES = 10 * 1024 * 1024

export default function CoiUploadDialog({ subId, subName, onUploaded, trigger }: Props) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [policyNumber, setPolicyNumber] = useState("")
  const [carrier, setCarrier] = useState("")
  const [wcExpiresAt, setWcExpiresAt] = useState("")
  const [glExpiresAt, setGlExpiresAt] = useState("")
  const [submitting, setSubmitting] = useState(false)

  function reset() {
    setFile(null)
    setPolicyNumber("")
    setCarrier("")
    setWcExpiresAt("")
    setGlExpiresAt("")
  }

  function close() {
    if (submitting) return
    setOpen(false)
    reset()
  }

  async function handleUpload() {
    if (!file) {
      toast.error("Select a file first")
      return
    }
    if (file.size > MAX_BYTES) {
      toast.error("File too large (max 10MB)")
      return
    }

    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.set("file", file)
      fd.set("sub_id", subId)

      // Optional extracted data — caller can paste what Document AI pulled,
      // or leave blank and let the DB function default fields.
      const extracted: Record<string, string> = {}
      if (policyNumber) extracted.policy_number = policyNumber
      if (carrier) extracted.carrier = carrier
      if (wcExpiresAt) extracted.wc_expires_at = wcExpiresAt
      if (glExpiresAt) extracted.gl_expires_at = glExpiresAt
      if (Object.keys(extracted).length > 0) {
        fd.set("extracted_data", JSON.stringify(extracted))
      }

      const res = await fetch("/api/construction/coi-upload", { method: "POST", body: fd })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || "Upload failed")
        return
      }

      toast.success("COI uploaded")
      await onUploaded?.()
      setOpen(false)
      reset()
    } catch {
      toast.error("Upload failed")
    } finally {
      setSubmitting(false)
    }
  }

  const defaultTrigger = (
    <button
      onClick={() => setOpen(true)}
      className="px-3 py-1.5 bg-midnight/5 text-midnight font-display font-medium text-[10px] tracking-[1px] uppercase hover:bg-midnight/10 transition-colors inline-flex items-center gap-1.5"
    >
      <UploadSimple size={12} weight="bold" />
      COI
    </button>
  )

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)} className="cursor-pointer">
          {trigger}
        </span>
      ) : (
        defaultTrigger
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <motion.div
              className="w-full max-w-[520px] bg-brand-white border border-midnight/10 shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between p-5 border-b border-midnight/[0.08]">
                <div>
                  <h2 className="font-display font-bold text-[16px] text-midnight">Upload Certificate of Insurance</h2>
                  <p className="font-sans text-[12px] text-steel mt-0.5">{subName}</p>
                </div>
                <button onClick={close} className="p-1 hover:bg-midnight/5 transition-colors">
                  <X size={18} className="text-steel" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                {/* File picker */}
                <div>
                  <label className="font-display text-[11px] tracking-[2px] uppercase text-steel block mb-2">
                    Certificate file
                  </label>
                  <label className="flex items-center gap-3 border border-dashed border-midnight/20 p-4 cursor-pointer hover:border-midnight/40 transition-colors">
                    <FileText size={20} className="text-steel shrink-0" />
                    <span className="font-sans text-[13px] text-midnight flex-1 truncate">
                      {file ? file.name : "Choose a PDF, PNG, or JPEG"}
                    </span>
                    <span className="font-display text-[10px] tracking-[1px] uppercase text-crimson">Browse</span>
                    <input
                      type="file"
                      accept={ACCEPT}
                      className="hidden"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  <p className="font-sans text-[11px] text-steel mt-1.5">Max 10MB. PDF, PNG, or JPEG.</p>
                </div>

                <div className="border-t border-midnight/[0.06] pt-4">
                  <p className="font-display text-[10px] tracking-[2px] uppercase text-steel mb-3">
                    Extracted data (optional)
                  </p>
                  <p className="font-sans text-[11px] text-steel mb-4 leading-relaxed">
                    Leave blank to process the file as-is. If you already have policy details, fill them in and Protekon
                    will cross-check them against the subcontractor&apos;s CSLB record.
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-display text-[10px] tracking-[1px] uppercase text-steel block mb-1">Policy #</label>
                      <input
                        type="text"
                        value={policyNumber}
                        onChange={(e) => setPolicyNumber(e.target.value)}
                        className="w-full border border-ash px-3 py-2 font-sans text-[13px] text-midnight focus:border-midnight focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-display text-[10px] tracking-[1px] uppercase text-steel block mb-1">Carrier</label>
                      <input
                        type="text"
                        value={carrier}
                        onChange={(e) => setCarrier(e.target.value)}
                        className="w-full border border-ash px-3 py-2 font-sans text-[13px] text-midnight focus:border-midnight focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-display text-[10px] tracking-[1px] uppercase text-steel block mb-1">WC Expires</label>
                      <input
                        type="date"
                        value={wcExpiresAt}
                        onChange={(e) => setWcExpiresAt(e.target.value)}
                        className="w-full border border-ash px-3 py-2 font-sans text-[13px] text-midnight focus:border-midnight focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-display text-[10px] tracking-[1px] uppercase text-steel block mb-1">GL Expires</label>
                      <input
                        type="date"
                        value={glExpiresAt}
                        onChange={(e) => setGlExpiresAt(e.target.value)}
                        className="w-full border border-ash px-3 py-2 font-sans text-[13px] text-midnight focus:border-midnight focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-5 border-t border-midnight/[0.08] bg-parchment/40">
                <button
                  onClick={close}
                  disabled={submitting}
                  className="border border-midnight/[0.1] text-midnight font-display font-semibold text-[11px] tracking-[2px] uppercase px-5 py-2.5 hover:bg-midnight/[0.04] transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={submitting || !file}
                  className="bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[2px] uppercase px-5 py-2.5 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  <UploadSimple size={14} weight="bold" />
                  {submitting ? "Uploading..." : "Upload COI"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
