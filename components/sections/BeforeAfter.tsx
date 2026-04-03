"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

const rows = [
  {
    before: "You track compliance in a spreadsheet",
    after: "Your AI compliance officer tracks everything automatically",
  },
  {
    before: "You find out about regulation changes from a fine notice",
    after: "The agent scans feeds at 6am and alerts you same-day",
  },
  {
    before: "Incident reports sit in an email thread",
    after: "AI classifies, strips PII, and logs OSHA 300 entries in minutes",
  },
  {
    before: "Your compliance plan is a 3-year-old template",
    after: "Site-specific documents, updated when laws change",
  },
  {
    before: "Annual training tracking is a Post-it note",
    after: "Weekly automated reminders with escalation",
  },
  {
    before: "An inspector asks for documentation and you panic",
    after: "Audit-ready packages delivered to your inbox on schedule",
  },
]

export default function BeforeAfter() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="bg-midnight py-24" ref={ref}>
      <div className="max-w-[1200px] mx-auto px-8">
        {/* Header */}
        <motion.h2
          className="font-display font-black text-[clamp(36px,5vw,64px)] leading-[0.92] text-brand-white mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.5 }}
        >
          BEFORE PROTEKON VS. AFTER
        </motion.h2>

        {/* Table */}
        <motion.div
          className="overflow-x-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Column Headers */}
          <div className="grid grid-cols-2 gap-[2px] mb-[2px]">
            <div className="bg-crimson/20 px-6 py-4">
              <span className="font-display font-bold text-[11px] tracking-[3px] uppercase text-crimson">
                BEFORE
              </span>
            </div>
            <div className="bg-gold/10 px-6 py-4">
              <span className="font-display font-bold text-[11px] tracking-[3px] uppercase text-gold">
                AFTER
              </span>
            </div>
          </div>

          {/* Rows */}
          {rows.map((row, i) => (
            <motion.div
              key={i}
              className="grid grid-cols-2 gap-[2px] mb-[2px]"
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
            >
              {/* Before */}
              <div className="bg-crimson/[0.06] border-l-[3px] border-crimson/40 px-6 py-5">
                <p className="font-sans text-[14px] leading-[1.6] text-brand-white/60">
                  {row.before}
                </p>
              </div>

              {/* After */}
              <div className="bg-gold/[0.04] border-l-[3px] border-gold/40 px-6 py-5">
                <p className="font-sans text-[14px] leading-[1.6] text-brand-white/90">
                  {row.after}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
