"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import Link from "next/link"

export default function FinalCTA() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="bg-crimson py-24" ref={ref}>
      <div className="max-w-[900px] mx-auto px-8 text-center">
        {/* Headline */}
        <motion.h2
          className="font-display font-black text-[clamp(36px,6vw,72px)] leading-[0.88] text-brand-white mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.5 }}
        >
          YOU CAN&apos;T AFFORD A COMPLIANCE OFFICER. YOU CAN&apos;T AFFORD NOT TO HAVE ONE.
        </motion.h2>

        {/* Subheadline */}
        <motion.p
          className="font-sans font-light text-[18px] text-brand-white/75 mb-10"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          A compliance officer costs $80K. An OSHA serious citation costs $16,131. PROTEKON costs $597/month. The math is not complicated.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.div
            whileHover={{ scale: 0.98 }}
            whileTap={{ scale: 0.96 }}
          >
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center font-display font-semibold text-[12px] tracking-[3px] uppercase bg-brand-white text-crimson px-8 py-4 min-w-[280px]"
            >
              ACTIVATE YOUR COMPLIANCE OFFICER
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 0.98 }}
            whileTap={{ scale: 0.96 }}
          >
            <Link
              href="/contact"
              className="inline-flex items-center justify-center font-display font-semibold text-[12px] tracking-[3px] uppercase border border-brand-white text-brand-white px-8 py-4 min-w-[280px] hover:bg-brand-white/10 transition-colors"
            >
              SEE WHAT PROTEKON DELIVERS
            </Link>
          </motion.div>
        </motion.div>

        {/* Data Point */}
        <motion.p
          className="font-display font-light text-[13px] tracking-[2px] text-brand-white/50"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          $597/month. $80K/year compliance officer. $16,131 per serious citation. Pick your math.
        </motion.p>
      </div>
    </section>
  )
}
