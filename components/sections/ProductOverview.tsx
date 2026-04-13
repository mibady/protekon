"use client"

import { motion } from "framer-motion"
import { FileText, ClipboardText, Bell, EnvelopeSimple } from "@phosphor-icons/react"
import Link from "next/link"

const features = [
  {
    icon: FileText,
    iconColor: "#C9A84C",
    borderColor: "#C41230",
    title: "COMPLIANCE DOCUMENTS",
    description:
      "Federal OSHA and state plans require written safety programs — IIPP, WVPP, HazCom, EAP, and more. PROTEKON writes them all, generated from your actual business address, worksite layout, and employee count. Not a template. A site-specific plan, ready to post before the inspector arrives.",
    tags: ["IIPP", "WVPP", "HAZCOM", "EAP", "OSHA 300"],
  },
  {
    icon: ClipboardText,
    iconColor: "#C41230",
    borderColor: "#C9A84C",
    title: "INCIDENT LOG MANAGEMENT",
    description:
      "Describe what happened in plain English. PROTEKON classifies severity, assigns the OSHA code, flags personally identifiable information, strips it, creates an OSHA 300-compliant entry, notifies your compliance team, and schedules follow-ups based on severity — all from one description. You never touch a log.",
    tags: ["OSHA 300", "PII PROTECTED", "AUTO-CLASSIFIED"],
  },
  {
    icon: Bell,
    iconColor: "#C9A84C",
    borderColor: "#C41230",
    title: "REGULATORY MONITORING",
    description:
      "Every morning at 6am, PROTEKON scans federal OSHA, your state plan, and industry-specific feeds. When a regulation changes, it determines which of your documents are affected, assesses the penalty risk, generates a plain-English impact summary, and alerts you with a compliance deadline. Before you pour your first coffee.",
    tags: ["FEDERAL OSHA", "STATE PLANS", "REAL-TIME"],
  },
  {
    icon: EnvelopeSimple,
    iconColor: "#C41230",
    borderColor: "#C9A84C",
    title: "SCHEDULED DELIVERY",
    description:
      "PROTEKON delivers weekly summaries, monthly status reports, quarterly compliance reviews, and annual audit packages — formatted, branded, and in your inbox on schedule. Not reminders to go do something. Proof that it is already done.",
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
              <span className="font-display font-medium text-[12px] tracking-[4px] uppercase text-crimson">
                THE PROTEKON ENGINE
              </span>
            </div>

            {/* Headline */}
            <h2 className="font-display font-black text-[clamp(36px,5vw,56px)] leading-[0.92] text-brand-white mb-6">
              PROTEKON RUNS YOUR COMPLIANCE DEPARTMENT.
            </h2>

            {/* Body */}
            <p className="font-sans font-light text-[15px] leading-[1.75] text-fog mb-8 max-w-[380px]">
              Most businesses handle compliance one of two ways: they hire an $80K/year officer,
              or they use a spreadsheet and hope nobody checks. PROTEKON is the third option.
              A compliance officer that monitors every regulation, writes every document,
              classifies every incident, and delivers audit-ready proof to your inbox — while
              you sleep. It never takes a sick day. It never misses a deadline. And it costs
              less than a single serious violation.
            </p>

            {/* CTA Link */}
            <Link
              href="#engine"
              className="font-display font-semibold text-[12px] tracking-[2px] text-gold border-b border-gold/40 pb-1 hover:border-gold transition-colors inline-flex items-center gap-2"
            >
              SEE WHAT PROTEKON DOES
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
                      className="font-display font-medium text-[10px] tracking-[2px] text-gold border border-gold/30 px-3 py-1"
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
