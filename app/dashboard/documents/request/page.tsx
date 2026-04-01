"use client"

import { motion } from "framer-motion"
import { FileText, ArrowLeft, Lightning, Check } from "@phosphor-icons/react"
import Link from "next/link"
import { useState } from "react"
import { requestDocument } from "@/lib/actions/documents"

const documentTypes = [
  { id: "iipp", name: "IIPP Update", description: "Injury & Illness Prevention Program", regulation: "8 CCR 3203" },
  { id: "sb553", name: "SB 553 Plan", description: "Workplace Violence Prevention Plan", regulation: "SB 553" },
  { id: "eap", name: "Emergency Action Plan", description: "Emergency procedures and evacuation", regulation: "8 CCR 3220" },
  { id: "hazcom", name: "Hazcom Program", description: "Hazard Communication Program", regulation: "8 CCR 5194" },
  { id: "heat", name: "Heat Illness Prevention", description: "Outdoor heat illness prevention", regulation: "8 CCR 3395" },
  { id: "custom", name: "Custom Document", description: "Request a custom compliance document", regulation: "Various" },
]

export default function DocumentRequestPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedType) return

    setIsSubmitting(true)
    setError(null)

    const formData = new FormData()
    formData.set("type", selectedType)

    const form = e.currentTarget as HTMLFormElement
    const notes = (form.querySelector('textarea[name="notes"]') as HTMLTextAreaElement)?.value
    if (notes) formData.set("notes", notes)

    const priority = (form.querySelector('input[name="priority"]:checked') as HTMLInputElement)?.value
    if (priority) formData.set("priority", priority)

    const result = await requestDocument(formData)

    if (result?.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div className="p-6 lg:p-8">
        <motion.div 
          className="max-w-lg mx-auto text-center py-16"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-16 h-16 bg-[#2A7D4F] mx-auto mb-6 flex items-center justify-center">
            <Check size={32} weight="bold" className="text-white" />
          </div>
          <h1 className="font-display font-bold text-[28px] text-midnight mb-4">
            Request Submitted
          </h1>
          <p className="font-sans text-[15px] text-steel mb-8">
            Your document request has been received. Our AI engine will generate your updated document within 48 hours. You&apos;ll receive an email notification when it&apos;s ready.
          </p>
          <Link
            href="/dashboard/documents"
            className="inline-flex items-center gap-2 bg-midnight text-parchment font-display font-semibold text-[11px] tracking-[2px] uppercase px-6 py-3 hover:brightness-110 transition-all"
          >
            Back to Documents
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Back Link */}
      <Link 
        href="/dashboard/documents"
        className="inline-flex items-center gap-2 font-display font-medium text-[11px] tracking-[2px] uppercase text-steel hover:text-midnight transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Back to Documents
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-[28px] text-midnight mb-2">
          Request Document Update
        </h1>
        <p className="font-sans text-[15px] text-steel">
          Trigger on-demand AI document generation customized for your business.
        </p>
      </div>

      {/* AI Notice */}
      <motion.div 
        className="bg-gold/10 border border-gold/30 p-4 mb-8 flex items-start gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Lightning size={20} className="text-gold flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-display font-semibold text-[12px] text-midnight mb-1">
            AI-Powered Document Generation
          </p>
          <p className="font-sans text-[13px] text-steel">
            Documents are generated using your business profile, recent regulatory updates, and industry best practices. Most documents are delivered within 48 hours.
          </p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit}>
        {/* Document Type Selection */}
        <div className="mb-8">
          <label className="block font-display font-medium text-[10px] tracking-[3px] uppercase text-steel mb-4">
            Select Document Type
          </label>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentTypes.map((type) => (
              <motion.button
                key={type.id}
                type="button"
                onClick={() => setSelectedType(type.id)}
                className={`text-left p-4 border transition-all ${
                  selectedType === type.id 
                    ? 'border-crimson bg-crimson/[0.04]' 
                    : 'border-midnight/[0.08] bg-brand-white hover:border-midnight/20'
                }`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start justify-between mb-2">
                  <FileText size={24} className={selectedType === type.id ? 'text-crimson' : 'text-midnight'} />
                  {selectedType === type.id && (
                    <span className="w-5 h-5 bg-crimson flex items-center justify-center">
                      <Check size={12} weight="bold" className="text-white" />
                    </span>
                  )}
                </div>
                <h3 className="font-display font-bold text-[14px] text-midnight mb-1">
                  {type.name}
                </h3>
                <p className="font-sans text-[12px] text-steel mb-2">
                  {type.description}
                </p>
                <span className="px-2 py-0.5 border border-gold/30 bg-gold/5 font-display font-medium text-[8px] tracking-[1px] text-gold">
                  {type.regulation}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Additional Notes */}
        <div className="mb-8">
          <label className="block font-display font-medium text-[10px] tracking-[3px] uppercase text-steel mb-3">
            Additional Notes (Optional)
          </label>
          <textarea
            name="notes"
            rows={4}
            placeholder="Describe any specific requirements or changes needed..."
            className="w-full bg-brand-white border border-midnight/[0.08] px-4 py-3 font-sans text-[14px] text-midnight placeholder:text-steel focus:border-midnight focus:outline-none resize-none"
          />
        </div>

        {/* Priority */}
        <div className="mb-8">
          <label className="block font-display font-medium text-[10px] tracking-[3px] uppercase text-steel mb-3">
            Priority
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="radio" name="priority" value="standard" defaultChecked className="sr-only peer" />
              <span className="w-4 h-4 border-2 border-midnight/30 peer-checked:border-crimson peer-checked:bg-crimson flex items-center justify-center">
                <span className="w-2 h-2 bg-white opacity-0 peer-checked:opacity-100" />
              </span>
              <span className="font-sans text-[14px] text-midnight">Standard (48 hrs)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="radio" name="priority" value="rush" className="sr-only peer" />
              <span className="w-4 h-4 border-2 border-midnight/30 peer-checked:border-crimson peer-checked:bg-crimson flex items-center justify-center">
                <span className="w-2 h-2 bg-white opacity-0 peer-checked:opacity-100" />
              </span>
              <span className="font-sans text-[14px] text-midnight">Rush (24 hrs) <span className="text-gold">+$49</span></span>
            </label>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8 px-4 py-3 bg-crimson/10 border border-crimson/20 text-crimson font-sans text-[13px]">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={!selectedType || isSubmitting}
            className="inline-flex items-center gap-2 bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[2px] uppercase px-8 py-4 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </button>
          <Link
            href="/dashboard/documents"
            className="font-display font-medium text-[11px] tracking-[2px] uppercase text-steel hover:text-midnight transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
