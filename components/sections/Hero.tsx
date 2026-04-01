"use client"

import { motion } from "framer-motion"
import { CaretDown } from "@phosphor-icons/react"
import Link from "next/link"

const stats = [
  { value: "$109.6M", label: "IN PENALTIES TO CA SMBS" },
  { value: "44,742", label: "VIOLATIONS IN TARGET MARKET" },
  { value: "$7,229", label: "AVG SERIOUS VIOLATION FINE" },
]

export default function Hero() {
  return (
    <section className="relative min-h-[100dvh] bg-void overflow-hidden">
      {/* Video Background with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        {/* Placeholder for video - using gradient for now */}
        <div className="absolute inset-0 bg-gradient-to-br from-void via-midnight to-void" />
        
        {/* Gradient overlay for text readability */}
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to right, 
              rgba(7,15,30,0.96) 0%, 
              rgba(7,15,30,0.85) 50%, 
              rgba(7,15,30,0.5) 75%,
              rgba(7,15,30,0.2) 100%)`
          }}
        />
      </div>

      {/* Giant P-Mark Watermark */}
      <motion.div
        className="absolute right-[-80px] top-1/2 -translate-y-1/2 z-[2] pointer-events-none"
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
      >
        <svg viewBox="0 0 48 84" className="w-[640px] h-[1120px] opacity-[0.04]">
          <rect x="0" y="0" width="13" height="84" fill="#FAFAF8" />
          <rect x="13" y="0" width="35" height="13" fill="#FAFAF8" />
          <rect x="35" y="13" width="13" height="27" fill="#FAFAF8" />
          <rect x="0" y="40" width="48" height="10" fill="#FAFAF8" />
        </svg>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-8 min-h-[100dvh] flex flex-col justify-center pt-24 pb-16">
        <div className="grid lg:grid-cols-[55%_45%] gap-12 items-center">
          <div className="flex flex-col gap-8">
            {/* Eyebrow */}
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-4 h-[1px] bg-gold" />
              <span className="font-display font-medium text-[10px] tracking-[4px] uppercase text-crimson">
                CALIFORNIA COMPLIANCE INTELLIGENCE
              </span>
            </motion.div>

            {/* Headline */}
            <div className="flex flex-col">
              <motion.h1
                className="font-display font-black text-[clamp(48px,8vw,96px)] leading-[0.88] tracking-tight text-brand-white"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 80, damping: 18, delay: 0.1 }}
              >
                COMPLIANCE
              </motion.h1>
              <motion.h1
                className="font-display font-black text-[clamp(48px,8vw,96px)] leading-[0.88] tracking-tight text-outline"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 80, damping: 18, delay: 0.25 }}
              >
                MANAGED.
              </motion.h1>
              <motion.h1
                className="font-display font-black text-[clamp(48px,8vw,96px)] leading-[0.88] tracking-tight text-gold"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 80, damping: 18, delay: 0.4 }}
              >
                DELIVERED.
              </motion.h1>
            </div>

            {/* Subheadline */}
            <motion.p
              className="font-sans font-light text-[17px] leading-[1.75] text-fog max-w-[480px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              Shield CaaS turns California&apos;s most complex workplace safety regulations 
              into a hands-off, recurring service — IIPP, SB 553, incident logging, 
              and regulatory monitoring, all done for you.
            </motion.p>

            {/* Stats Row */}
            <motion.div
              className="grid grid-cols-3 border border-brand-white/[0.06]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`py-5 px-6 ${i < 2 ? "border-r border-brand-white/[0.06]" : ""}`}
                >
                  <div className="font-display font-extrabold text-[32px] text-gold">
                    {stat.value}
                  </div>
                  <div className="font-display font-light text-[9px] tracking-[2px] text-steel uppercase">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* CTA Row */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.5 }}
            >
              <motion.div
                whileHover={{ y: -2, filter: "brightness(1.08)" }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  href="/signup"
                  className="inline-flex items-center font-display font-semibold text-[10px] tracking-[3px] uppercase text-brand-white bg-crimson px-8 py-4 border-l-[3px] border-brand-white/30"
                >
                  START YOUR COMPLIANCE PLAN
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ borderColor: "#C9A84C", color: "#C9A84C" }}>
                <Link
                  href="#sample"
                  className="inline-flex items-center font-display font-semibold text-[10px] tracking-[3px] uppercase text-brand-white/70 px-8 py-4 border border-brand-white/15 hover:border-gold hover:text-gold transition-colors"
                >
                  DOWNLOAD SAMPLE REPORT
                </Link>
              </motion.div>
            </motion.div>

            {/* Small print */}
            <motion.p
              className="font-sans font-light text-[12px] text-brand-white/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              No software to learn. First document delivered in 48 hours. Cancel anytime.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <CaretDown size={24} weight="bold" className="text-gold/50" />
      </motion.div>
    </section>
  )
}
