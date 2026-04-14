"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { HardHat, Factory, Buildings } from "@phosphor-icons/react"
import type { Icon } from "@phosphor-icons/react"

const testimonials: {
  quote: string
  attribution: string
  location: string
  industry: string
  borderColor: string
  Icon: Icon
}[] = [
  {
    quote:
      "We got cited $14,200 before we had any compliance program. After switching to PROTEKON, the inspector walked away with zero citations. Zero.",
    attribution: "Construction Company Owner",
    location: "Inland Empire, CA",
    industry: "CONSTRUCTION",
    borderColor: "#C41230",
    Icon: HardHat,
  },
  {
    quote:
      "Incident logging used to mean a sticky note on my desk. Now every entry is classified, documented, and legally protected. OSHA 300 compliant from day one.",
    attribution: "Operations Manager",
    location: "Houston, TX",
    industry: "MANUFACTURING",
    borderColor: "#C9A84C",
    Icon: Factory,
  },
  {
    quote:
      "A new OSHA emphasis program hit our industry and we had no idea. PROTEKON flagged it, updated our safety plan, and had the revised documents in our inbox before our next shift started.",
    attribution: "HR Director",
    location: "Atlanta, GA",
    industry: "HOSPITALITY",
    borderColor: "#C41230",
    Icon: Buildings,
  },
]

export default function Testimonials() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="bg-midnight py-24" ref={ref}>
      <div className="max-w-[1400px] mx-auto px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-12">
          <div className="w-4 h-[1px] bg-gold" />
          <span className="font-display font-medium text-[12px] tracking-[4px] uppercase text-crimson">
            TESTIMONIALS
          </span>
        </div>

        <motion.h2
          className="font-display font-black text-[clamp(36px,5vw,56px)] leading-[0.92] text-brand-white mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.5 }}
        >
          WHAT PROTECTED BUSINESSES SAY
        </motion.h2>

        {/* Testimonial Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.industry}
              className="bg-void p-8 relative"
              style={{ borderTop: `3px solid ${testimonial.borderColor}` }}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
            >
              {/* Industry icon badge */}
              <div
                className="absolute -top-7 right-6 w-14 h-14 flex items-center justify-center bg-void border-2"
                style={{ borderColor: testimonial.borderColor }}
              >
                <testimonial.Icon size={26} weight="bold" style={{ color: testimonial.borderColor }} />
              </div>

              {/* Opening quote mark */}
              <span className="font-display font-black text-[64px] leading-none text-crimson absolute -top-2 left-6">
                &ldquo;
              </span>

              {/* Quote */}
              <p className="font-sans font-light italic text-[18px] leading-[1.75] text-fog mt-8 mb-8">
                {testimonial.quote}
              </p>

              {/* Attribution */}
              <div className="flex flex-col gap-1">
                <span className="font-display font-bold text-[16px] text-brand-white">
                  — {testimonial.attribution}
                </span>
                <span className="font-display font-normal text-[11px] tracking-[2px] text-steel">
                  {testimonial.location}
                </span>
                <span className="inline-block mt-3 font-display font-medium text-[9px] tracking-[2px] text-gold border border-gold/30 px-3 py-1 self-start">
                  {testimonial.industry}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
