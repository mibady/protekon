"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"
import { submitSampleGate } from "@/lib/actions/samples"

const industries = [
  "Construction",
  "Manufacturing", 
  "Agriculture",
  "Hospitality",
  "Retail",
  "Healthcare",
  "Wholesale",
  "Transportation",
]

const employeeRanges = [
  "1-10 employees",
  "11-25 employees",
  "26-50 employees",
  "51-100 employees",
  "100+ employees",
]

export default function SampleReportCTA() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const result = await submitSampleGate(formData)

    if (result.error) {
      setError(result.error)
    } else {
      setSubmitted(true)
    }
    setIsSubmitting(false)
  }

  return (
    <section className="bg-void py-24" id="sample" ref={ref}>
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <div>
            {/* Eyebrow */}
            <motion.div
              className="flex items-center gap-3 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-4 h-[1px] bg-gold" />
              <span className="font-display font-medium text-[12px] tracking-[4px] uppercase text-crimson">
                SEE YOUR COMPLIANCE RISK
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              className="font-display font-black text-[clamp(32px,4vw,52px)] leading-[0.92] text-brand-white mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              SEE EXACTLY WHAT YOUR AI COMPLIANCE OFFICER PRODUCES
            </motion.h2>

            {/* Body */}
            <motion.p
              className="font-sans font-light text-[16px] leading-[1.75] text-fog max-w-[480px]"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Enter your industry and employee count. Your AI compliance officer generates
              a sample IIPP and compliance risk summary specific to your business profile.
              In your inbox in minutes. This is what the agent produces on day one — and it
              only gets more thorough from there.
            </motion.p>
          </div>

          {/* Right: Form Card */}
          <motion.div
            className="bg-midnight p-10"
            style={{ borderTop: "3px solid #C41230" }}
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="font-display font-medium text-[12px] tracking-[2px] uppercase text-steel">
                  BUSINESS EMAIL
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@company.com"
                  className="w-full h-12 px-4 bg-brand-white/[0.04] border border-brand-white/10 text-brand-white font-sans text-[14px] placeholder:text-steel/50 focus:border-gold focus:outline-none transition-colors"
                />
              </div>

              {/* Industry */}
              <div className="flex flex-col gap-2">
                <label className="font-display font-medium text-[12px] tracking-[2px] uppercase text-steel">
                  INDUSTRY
                </label>
                <select
                  name="vertical"
                  required
                  className="w-full h-12 px-4 bg-brand-white/[0.04] border border-brand-white/10 text-brand-white font-sans text-[14px] focus:border-gold focus:outline-none transition-colors appearance-none cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%237A8FA5' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
                >
                  <option value="" className="bg-midnight">Select your industry</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry} className="bg-midnight">
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              {/* Employee Count */}
              <div className="flex flex-col gap-2">
                <label className="font-display font-medium text-[12px] tracking-[2px] uppercase text-steel">
                  EMPLOYEE COUNT
                </label>
                <select
                  name="employeeCount"
                  required
                  className="w-full h-12 px-4 bg-brand-white/[0.04] border border-brand-white/10 text-brand-white font-sans text-[14px] focus:border-gold focus:outline-none transition-colors appearance-none cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%237A8FA5' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
                >
                  <option value="" className="bg-midnight">Select range</option>
                  {employeeRanges.map((range) => (
                    <option key={range} value={range} className="bg-midnight">
                      {range}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 bg-crimson text-brand-white font-display font-semibold text-[12px] tracking-[3px] uppercase disabled:opacity-70 disabled:cursor-not-allowed hover:brightness-110 transition-all flex items-center justify-center gap-2"
                whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.99 }}
              >
                {isSubmitting ? (
                  <span className="animate-pulse">PROCESSING...</span>
                ) : submitted ? (
                  <>SENT — CHECK YOUR INBOX ✓</>
                ) : (
                  <>SEND MY SAMPLE REPORT <span className="text-lg">→</span></>
                )}
              </motion.button>

              {error && (
                <p className="font-sans text-[12px] text-crimson text-center">{error}</p>
              )}

              {/* Fine print */}
              <p className="font-sans font-light text-[11px] text-steel text-center">
                No credit card. No sales call. Just your free report.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
