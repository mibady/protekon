"use client"

import { motion } from "framer-motion"
import { FileText, ClipboardText, Bell, EnvelopeSimple } from "@phosphor-icons/react"
import Link from "next/link"

const features = [
  {
    icon: FileText,
    iconColor: "#C9A84C",
    borderColor: "#C41230",
    title: "IIPP + SB 553 DOCUMENTS",
    description:
      "8 CCR 3203 requires every California employer to have a written IIPP. SB 553 demands a Workplace Violence Prevention Plan. We write both. In your name. Ready to post before the inspector arrives.",
    tags: ["IIPP", "SB 553", "WVPP", "8 CCR 3203"],
  },
  {
    icon: ClipboardText,
    iconColor: "#C41230",
    borderColor: "#C9A84C",
    title: "INCIDENT LOG MANAGEMENT",
    description:
      "Text or voice. That is all it takes to log an incident. AI classifies severity, strips all PII, and creates OSHA 300-compliant entries. Legally defensible documentation from day one.",
    tags: ["OSHA 300", "PII PROTECTED", "AI CLASSIFIED"],
  },
  {
    icon: Bell,
    iconColor: "#C9A84C",
    borderColor: "#C41230",
    title: "REGULATORY MONITORING",
    description:
      "Cal/OSHA. OSHSB. CSLB. Municipal ordinances. We watch them all. 24/7. When regulations change, your documents update automatically. No action required.",
    tags: ["Cal/OSHA", "SB 553", "REAL-TIME"],
  },
  {
    icon: EnvelopeSimple,
    iconColor: "#C41230",
    borderColor: "#C9A84C",
    title: "SCHEDULED DELIVERY",
    description:
      "Weekly summaries. Monthly reports. Quarterly reviews. Annual audit packages. All formatted. All branded. All in your inbox before you need them.",
    tags: ["WEEKLY", "MONTHLY", "QUARTERLY"],
  },
]

export default function ProductOverview() {
  return (
    <section className="bg-midnight py-24" id="solutions">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="grid lg:grid-cols-[40%_60%] gap-16">
          {/* Left Column - Sticky */}
          <div className="lg:sticky lg:top-32 lg:self-start">
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-4 h-[1px] bg-gold" />
              <span className="font-display font-medium text-[10px] tracking-[4px] uppercase text-crimson">
                THE PROTEKON ENGINE
              </span>
            </div>

            {/* Headline */}
            <h2 className="font-display font-black text-[clamp(36px,5vw,56px)] leading-[0.92] text-brand-white mb-6">
              COMPLIANCE IS NOT YOUR JOB.
              <br />
              IT&apos;S OURS.
            </h2>

            {/* Body */}
            <p className="font-sans font-light text-[15px] leading-[1.75] text-fog mb-8 max-w-[380px]">
              The Protekon Engine watches every regulation. Writes every document. 
              Logs every incident. Delivers everything to your inbox before the deadline hits. 
              Nothing reaches you without going through PROTEKON first.
            </p>

            {/* CTA Link */}
            <Link
              href="#engine"
              className="font-display font-semibold text-[12px] tracking-[2px] text-gold border-b border-gold/40 pb-1 hover:border-gold transition-colors inline-flex items-center gap-2"
            >
              SEE HOW IT WORKS
              <span className="text-lg">→</span>
            </Link>
          </div>

          {/* Right Column - Feature Cards */}
          <div className="flex flex-col gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="bg-void p-8"
                style={{ borderTop: `3px solid ${feature.borderColor}` }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                {/* Icon */}
                <feature.icon
                  size={28}
                  weight="light"
                  style={{ color: feature.iconColor }}
                  className="mb-4"
                />

                {/* Title */}
                <h3 className="font-display font-extrabold text-[24px] text-brand-white mb-3">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="font-sans font-light text-[13px] leading-[1.75] text-steel mb-6">
                  {feature.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {feature.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-display font-medium text-[8px] tracking-[2px] text-gold border border-gold/30 px-3 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
