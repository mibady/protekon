"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

const testimonials = [
  {
    quote:
      "$14,200 Cal/OSHA fine. That was before PROTEKON. This year the inspector walked away with zero citations. Zero.",
    name: "R. Castillo",
    title: "Owner",
    company: "Castillo Brothers Construction",
    location: "Riverside, CA",
    industry: "CONSTRUCTION",
    borderColor: "#C41230",
  },
  {
    quote:
      "Incident logging used to mean a sticky note on my desk. Now every entry is classified, documented, and legally protected. OSHA 300 compliant. Day one.",
    name: "D. Nguyen",
    title: "Operations Mgr",
    company: "Pacific Rim Manufacturing",
    location: "Ontario, CA",
    industry: "MANUFACTURING",
    borderColor: "#C9A84C",
  },
  {
    quote:
      "SB 553 dropped. Six days to comply. PROTEKON had my Workplace Violence Prevention Plan written, reviewed, and posted in 48 hours. Not a week. 48 hours.",
    name: "A. Vasquez",
    title: "HR Director",
    company: "Valle Verde Hospitality Group",
    location: "Fresno, CA",
    industry: "HOSPITALITY",
    borderColor: "#C41230",
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
          <span className="font-display font-medium text-[10px] tracking-[4px] uppercase text-crimson">
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
              key={testimonial.name}
              className="bg-void p-8 relative"
              style={{ borderTop: `3px solid ${testimonial.borderColor}` }}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
            >
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
                  — {testimonial.name}
                </span>
                <span className="font-display font-normal text-[11px] tracking-[2px] text-steel">
                  {testimonial.title} | {testimonial.company} | {testimonial.location}
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
