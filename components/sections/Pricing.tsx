"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Check, X } from "@phosphor-icons/react"
import Link from "next/link"

const tiers = [
  {
    name: "CORE",
    price: "$597",
    borderColor: "#7A8FA5",
    nameColor: "#7A8FA5",
    vertical: "AI Compliance Officer — 1 Location",
    features: [
      { text: "1 business location", included: true },
      { text: "Complete IIPP (AI-generated + updated)", included: true },
      { text: "SB 553 Workplace Violence Prevention Plan", included: true },
      { text: "Incident logging with PII stripping", included: true },
      { text: "Weekly regulatory monitoring", included: true },
      { text: "Monthly compliance report to inbox", included: true },
      { text: "2-day document delivery", included: true },
      { text: "AI compliance chat assistant", included: true },
      { text: "Quarterly audit package", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "GET STARTED",
    ctaStyle: "ghost",
    featured: false,
  },
  {
    name: "PROFESSIONAL",
    price: "$897",
    borderColor: "#C41230",
    nameColor: "#C41230",
    vertical: "AI Compliance Officer — Up to 2 Locations",
    badge: "MOST POPULAR",
    features: [
      { text: "Up to 2 locations (+$197/location)", included: true },
      { text: "Complete IIPP + SB 553 + Emergency Action Plan", included: true },
      { text: "Unlimited incident logging + AI classification", included: true },
      { text: "Daily regulatory monitoring + AI impact analysis", included: true },
      { text: "Weekly + Monthly reports delivered to inbox", included: true },
      { text: "Quarterly compliance reviews", included: true },
      { text: "24-hour document delivery", included: true },
      { text: "Subcontractor compliance tracking (construction)", included: true },
      { text: "Priority support + dedicated analyst", included: true },
      { text: "Compliance risk calculator access", included: true },
    ],
    cta: "START PROFESSIONAL",
    ctaStyle: "filled",
    featured: true,
  },
  {
    name: "MULTI-SITE",
    price: "$1,297",
    borderColor: "#C9A84C",
    nameColor: "#C9A84C",
    vertical: "AI Compliance Officer — Multi-Location",
    features: [
      { text: "Up to 3 locations (+$147/location)", included: true },
      { text: "Full vertical stack (OSHA + CSLB + Real Estate + Healthcare)", included: true },
      { text: "Dedicated compliance analyst (human review)", included: true },
      { text: "Same-day document delivery", included: true },
      { text: "Consolidated multi-site reporting", included: true },
      { text: "Custom delivery schedule", included: true },
      { text: "White-glove onboarding ($0 setup fee)", included: true },
      { text: "Annual audit package", included: true },
    ],
    cta: "START MULTI-SITE",
    ctaStyle: "gold",
    featured: false,
  },
]

export default function Pricing() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="bg-ash py-24" id="pricing" ref={ref}>
      <div className="max-w-[1400px] mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-4 h-[1px] bg-gold" />
            <span className="font-display font-medium text-[10px] tracking-[4px] uppercase text-crimson">
              TRANSPARENT PRICING
            </span>
            <div className="w-4 h-[1px] bg-gold" />
          </div>
          
          <motion.h2
            className="font-display font-black text-[clamp(36px,5vw,64px)] leading-[0.92] text-midnight mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.5 }}
          >
            YOUR AI COMPLIANCE OFFICER. ONE FLAT FEE.
          </motion.h2>

          <p className="font-sans font-light text-[16px] leading-[1.75] text-steel max-w-[600px] mx-auto">
            A compliance officer costs $60–80K a year. Your AI compliance officer costs
            $597–$1,297 a month. Same job. No PTO. No turnover. No benefits package.
            And it works nights, weekends, and holidays.
          </p>
        </div>

        {/* ROI Callout */}
        <motion.div
          className="mb-12 py-4 px-6 bg-gold/[0.08] border border-gold/20 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="font-display font-semibold text-[18px] text-gold">
            A single serious Cal/OSHA violation: $7,229. A full year of your AI compliance officer: $7,164. One prevented citation pays for itself.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 items-end">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              className={`relative bg-brand-white ${tier.featured ? "md:-mt-8 shadow-2xl z-10" : ""}`}
              style={{ borderTop: `3px solid ${tier.borderColor}` }}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
            >
              {/* Badge */}
              {tier.badge && (
                <div className="absolute -top-3 right-4 bg-crimson px-3 py-1">
                  <span className="font-display font-semibold text-[8px] tracking-[2px] text-brand-white">
                    {tier.badge}
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Tier Name */}
                <h3 
                  className="font-display font-black text-[24px] tracking-[4px] mb-4"
                  style={{ color: tier.nameColor }}
                >
                  {tier.name}
                </h3>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-display font-extrabold text-[72px] leading-none text-midnight">
                    {tier.price}
                  </span>
                  <span className="font-sans font-light text-[18px] text-steel">/mo</span>
                </div>

                {/* Vertical */}
                <p className="font-sans font-light text-[13px] text-steel mb-8">
                  {tier.vertical}
                </p>

                {/* Features */}
                <ul className="flex flex-col gap-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check size={16} weight="bold" style={{ color: tier.nameColor }} className="shrink-0 mt-0.5" />
                      ) : (
                        <X size={16} weight="bold" className="text-steel/40 shrink-0 mt-0.5" />
                      )}
                      <span className={`font-sans text-[13px] ${feature.included ? "text-midnight" : "text-steel/60"}`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href="/signup"
                  className={`block w-full py-4 text-center font-display font-semibold text-[10px] tracking-[3px] uppercase transition-all ${
                    tier.ctaStyle === "filled"
                      ? "bg-crimson text-brand-white hover:brightness-110"
                      : tier.ctaStyle === "gold"
                      ? "border border-gold text-gold hover:bg-gold hover:text-midnight"
                      : "border border-midnight/20 text-midnight hover:border-midnight"
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
