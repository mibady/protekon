"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

const timelineCards = [
  {
    time: "6:00 AM",
    title: "Regulatory Scan",
    description:
      "Your AI compliance officer scans Cal/OSHA, OSHSB, and CSLB feeds. Deduplicates updates. Runs impact analysis against your active documents. Alerts you before breakfast.",
  },
  {
    time: "7:00 AM",
    title: "Scheduled Delivery",
    description:
      "Checks which reports are due — weekly summaries, monthly status, quarterly reviews. Builds them automatically. Delivers formatted, branded documents to your inbox.",
  },
  {
    time: "Any Time",
    title: "Incident Response",
    description:
      "When an incident is reported, the agent classifies severity, assigns the OSHA code, strips PII, creates an OSHA 300-compliant log entry, and schedules follow-ups based on severity.",
  },
  {
    time: "1st of Month",
    title: "Compliance Audit",
    description:
      "Calculates your overall compliance score. Identifies gaps across documents, training, and incident logs. Sends a full audit summary with action items and deadlines.",
  },
  {
    time: "Every Monday",
    title: "Training Reminders",
    description:
      "Checks for overdue certifications and upcoming training deadlines. Sends reminders to employees. Escalates to management at 2 weeks overdue.",
  },
]

export default function DailyTimeline() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="bg-void py-24" ref={ref}>
      <div className="max-w-[1400px] mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-4 h-[1px] bg-gold" />
            <span className="font-display font-medium text-[10px] tracking-[4px] uppercase text-crimson">
              ALWAYS ON
            </span>
            <div className="w-4 h-[1px] bg-gold" />
          </div>

          <motion.h2
            className="font-display font-black text-[clamp(36px,5vw,64px)] leading-[0.92] text-brand-white mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.5 }}
          >
            WHAT YOUR AI COMPLIANCE OFFICER DOES EVERY DAY
          </motion.h2>
        </div>

        {/* Timeline Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {timelineCards.map((card, i) => (
            <motion.div
              key={card.title}
              className={`bg-midnight p-8 border-t-[3px] border-brand-white/[0.06] ${
                i >= 3 ? "lg:col-span-1 md:col-span-1" : ""
              }`}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
            >
              {/* Time Badge */}
              <span className="inline-block font-display font-bold text-[10px] tracking-[2px] uppercase text-brand-white bg-crimson px-3 py-1.5 mb-5">
                {card.time}
              </span>

              {/* Title */}
              <h3 className="font-display font-extrabold text-[20px] text-brand-white mb-3">
                {card.title}
              </h3>

              {/* Description */}
              <p className="font-sans font-light text-[13px] leading-[1.75] text-steel">
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.p
          className="text-center font-display font-semibold text-[20px] text-gold"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          That is what a $597/month compliance officer looks like.
        </motion.p>
      </div>
    </section>
  )
}
