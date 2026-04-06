"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Warning, Calendar, MapPin, User, FileText, PaperPlaneTilt } from "@phosphor-icons/react"
import Link from "next/link"
import { createIncident } from "@/lib/actions/incidents"

export default function NewIncidentPage() {
  const [formState, setFormState] = useState({
    date: "",
    time: "",
    location: "",
    type: "",
    severity: "",
    description: "",
    witnesses: "",
    actionsTaken: "",
    injuryOccurred: "no",
    medicalTreatment: "no",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData()
    formData.set("date", formState.date)
    formData.set("time", formState.time)
    formData.set("location", formState.location)
    formData.set("type", formState.type)
    formData.set("severity", formState.severity)
    formData.set("description", formState.description)
    formData.set("witnesses", formState.witnesses)
    formData.set("actionsTaken", formState.actionsTaken)
    formData.set("injuryOccurred", formState.injuryOccurred)
    formData.set("medicalTreatment", formState.medicalTreatment)

    const result = await createIncident(formData)

    setIsSubmitting(false)
    if (result?.error) {
      setError(result.error)
    } else {
      setIsSubmitted(true)
    }
  }

  if (isSubmitted) {
    return (
      <div className="max-w-[600px] mx-auto text-center py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="w-20 h-20 flex items-center justify-center bg-green-50 border border-green-200 mx-auto mb-6">
            <PaperPlaneTilt size={36} className="text-green-600" />
          </div>
          <h2 className="font-display font-bold text-[24px] text-midnight mb-3">
            Incident Report Submitted
          </h2>
          <p className="font-sans text-[14px] text-steel mb-8 max-w-[400px] mx-auto">
            Your incident has been logged and classified. All PII has been automatically stripped. 
            You will receive a confirmation email shortly.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="font-display text-[11px] tracking-[2px] uppercase text-steel hover:text-midnight border border-ash px-6 py-3 hover:border-midnight transition-colors"
            >
              Back to Dashboard
            </Link>
            <button
              onClick={() => {
                setIsSubmitted(false)
                setFormState({
                  date: "",
                  time: "",
                  location: "",
                  type: "",
                  severity: "",
                  description: "",
                  witnesses: "",
                  actionsTaken: "",
                  injuryOccurred: "no",
                  medicalTreatment: "no",
                })
              }}
              className="font-display text-[11px] tracking-[2px] uppercase text-parchment bg-crimson px-6 py-3 hover:brightness-110 transition-all"
            >
              Log Another Incident
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-[800px]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Warning size={24} className="text-crimson" />
          <h1 className="font-display font-bold text-[28px] text-midnight">Log New Incident</h1>
        </div>
        <p className="font-sans text-[14px] text-steel">
          Document workplace incidents for OSHA 300 compliance. All PII is automatically stripped.
        </p>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        className="bg-white border border-ash p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Date & Time */}
        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          <div className="flex flex-col gap-2">
            <label className="font-display text-[12px] tracking-[2px] uppercase text-steel flex items-center gap-2">
              <Calendar size={14} />
              Date of Incident *
            </label>
            <input
              type="date"
              required
              value={formState.date}
              onChange={(e) => setFormState({ ...formState, date: e.target.value })}
              className="border border-ash px-4 py-3 font-sans text-[14px] text-midnight focus:border-midnight focus:outline-none transition-colors"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-display text-[12px] tracking-[2px] uppercase text-steel">
              Time of Incident *
            </label>
            <input
              type="time"
              required
              value={formState.time}
              onChange={(e) => setFormState({ ...formState, time: e.target.value })}
              className="border border-ash px-4 py-3 font-sans text-[14px] text-midnight focus:border-midnight focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Location */}
        <div className="flex flex-col gap-2 mb-8">
          <label className="font-display text-[12px] tracking-[2px] uppercase text-steel flex items-center gap-2">
            <MapPin size={14} />
            Location *
          </label>
          <input
            type="text"
            required
            placeholder="e.g., Warehouse Floor B, Loading Dock, Office Building 2nd Floor"
            value={formState.location}
            onChange={(e) => setFormState({ ...formState, location: e.target.value })}
            className="border border-ash px-4 py-3 font-sans text-[14px] text-midnight placeholder:text-steel/50 focus:border-midnight focus:outline-none transition-colors"
          />
        </div>

        {/* Type & Severity */}
        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          <div className="flex flex-col gap-2">
            <label className="font-display text-[12px] tracking-[2px] uppercase text-steel">
              Incident Type *
            </label>
            <select
              required
              value={formState.type}
              onChange={(e) => setFormState({ ...formState, type: e.target.value })}
              className="border border-ash px-4 py-3 font-sans text-[14px] text-midnight focus:border-midnight focus:outline-none transition-colors"
            >
              <option value="">Select type...</option>
              <option value="slip-fall">Slip/Trip/Fall</option>
              <option value="struck-by">Struck By Object</option>
              <option value="caught-between">Caught In/Between</option>
              <option value="overexertion">Overexertion</option>
              <option value="exposure">Chemical/Substance Exposure</option>
              <option value="violence">Workplace Violence</option>
              <option value="vehicle">Vehicle/Equipment Related</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-display text-[12px] tracking-[2px] uppercase text-steel">
              Severity Level *
            </label>
            <select
              required
              value={formState.severity}
              onChange={(e) => setFormState({ ...formState, severity: e.target.value })}
              className="border border-ash px-4 py-3 font-sans text-[14px] text-midnight focus:border-midnight focus:outline-none transition-colors"
            >
              <option value="">Select severity...</option>
              <option value="near-miss">Near Miss (No Injury)</option>
              <option value="minor">Minor (First Aid Only)</option>
              <option value="moderate">Moderate (Medical Treatment)</option>
              <option value="serious">Serious (Lost Work Time)</option>
              <option value="severe">Severe (Hospitalization)</option>
            </select>
          </div>
        </div>

        {/* Injury Questions */}
        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          <div className="flex flex-col gap-2">
            <label className="font-display text-[12px] tracking-[2px] uppercase text-steel">
              Did an injury occur?
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="injury"
                  value="yes"
                  checked={formState.injuryOccurred === "yes"}
                  onChange={(e) => setFormState({ ...formState, injuryOccurred: e.target.value })}
                  className="accent-crimson"
                />
                <span className="font-sans text-[14px] text-midnight">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="injury"
                  value="no"
                  checked={formState.injuryOccurred === "no"}
                  onChange={(e) => setFormState({ ...formState, injuryOccurred: e.target.value })}
                  className="accent-crimson"
                />
                <span className="font-sans text-[14px] text-midnight">No</span>
              </label>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-display text-[12px] tracking-[2px] uppercase text-steel">
              Medical treatment required?
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="medical"
                  value="yes"
                  checked={formState.medicalTreatment === "yes"}
                  onChange={(e) => setFormState({ ...formState, medicalTreatment: e.target.value })}
                  className="accent-crimson"
                />
                <span className="font-sans text-[14px] text-midnight">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="medical"
                  value="no"
                  checked={formState.medicalTreatment === "no"}
                  onChange={(e) => setFormState({ ...formState, medicalTreatment: e.target.value })}
                  className="accent-crimson"
                />
                <span className="font-sans text-[14px] text-midnight">No</span>
              </label>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2 mb-8">
          <label className="font-display text-[12px] tracking-[2px] uppercase text-steel flex items-center gap-2">
            <FileText size={14} />
            Description of Incident *
          </label>
          <textarea
            required
            rows={4}
            placeholder="Describe what happened, including any contributing factors..."
            value={formState.description}
            onChange={(e) => setFormState({ ...formState, description: e.target.value })}
            className="border border-ash px-4 py-3 font-sans text-[14px] text-midnight placeholder:text-steel/50 focus:border-midnight focus:outline-none transition-colors resize-none"
          />
        </div>

        {/* Witnesses */}
        <div className="flex flex-col gap-2 mb-8">
          <label className="font-display text-[12px] tracking-[2px] uppercase text-steel flex items-center gap-2">
            <User size={14} />
            Witnesses (Optional)
          </label>
          <input
            type="text"
            placeholder="Names of any witnesses (will be anonymized in reports)"
            value={formState.witnesses}
            onChange={(e) => setFormState({ ...formState, witnesses: e.target.value })}
            className="border border-ash px-4 py-3 font-sans text-[14px] text-midnight placeholder:text-steel/50 focus:border-midnight focus:outline-none transition-colors"
          />
        </div>

        {/* Actions Taken */}
        <div className="flex flex-col gap-2 mb-8">
          <label className="font-display text-[12px] tracking-[2px] uppercase text-steel">
            Immediate Actions Taken
          </label>
          <textarea
            rows={3}
            placeholder="What steps were taken immediately after the incident?"
            value={formState.actionsTaken}
            onChange={(e) => setFormState({ ...formState, actionsTaken: e.target.value })}
            className="border border-ash px-4 py-3 font-sans text-[14px] text-midnight placeholder:text-steel/50 focus:border-midnight focus:outline-none transition-colors resize-none"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8 px-4 py-3 bg-crimson/10 border border-crimson/20 text-crimson font-sans text-[13px]">
            {error}
          </div>
        )}

        {/* Notice */}
        <div className="bg-fog/50 p-4 mb-8">
          <p className="font-sans text-[12px] text-steel">
            <strong className="text-midnight">Privacy Notice:</strong> All personally identifiable information (PII) 
            including names and identifying details will be automatically stripped from this report before storage. 
            The incident will be classified by our AI system for OSHA 300 compliance.
          </p>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="font-display text-[11px] tracking-[2px] uppercase text-steel hover:text-midnight transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[3px] uppercase px-8 py-4 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Submit Incident Report"}
          </button>
        </div>
      </motion.form>
    </div>
  )
}
