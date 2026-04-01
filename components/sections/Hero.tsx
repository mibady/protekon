"use client"

// PROTEKON Hero Section
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
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover grayscale"
          poster="/images/hero-poster.jpg"
        >
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>
        
        {/* Gradient overlay - bleeds video in from right */}
        <div 
          className="absolute inset-0 z-[1]"
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
        className="absolute z-[2] pointer-events-none"
        style={{ 
          right: -80, 
          top: '50%', 
          transform: 'translateY(-50%)',
          width: 640,
          height: 640,
        }}
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
      >
        <svg viewBox="0 0 48 48" className="w-full h-full opacity-[0.04]">
          <rect x="0" y="0" width="13" height="48" fill="#FAFAF8" />
          <rect x="13" y="0" width="35" height="13" fill="#FAFAF8" />
          <rect x="35" y="13" width="13" height="14" fill="#FAFAF8" />
          <rect x="13" y="27" width="35" height="8" fill="#FAFAF8" />
        </svg>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-8 min-h-[100dvh] flex flex-col justify-center pt-24 pb-16">
        <div className="grid lg:grid-cols-[55%_45%] gap-8 lg:gap-12 items-center">
          {/* Left Content - 55% */}
          <div className="flex flex-col gap-6 lg:gap-8">
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

            {/* Headline - 3 lines staggered */}
            <div className="flex flex-col">
              <motion.h1
                className="font-display font-black text-[clamp(48px,7vw,96px)] leading-[0.88] tracking-[-1px] text-parchment"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 80, damping: 18, delay: 0.1 }}
              >
                COMPLIANCE
              </motion.h1>
              <motion.h1
                className="font-display font-black text-[clamp(48px,7vw,96px)] leading-[0.88] tracking-[-1px]"
                style={{
                  WebkitTextStroke: '2px #C41230',
                  WebkitTextFillColor: 'transparent',
                }}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 80, damping: 18, delay: 0.25 }}
              >
                MANAGED.
              </motion.h1>
              <motion.h1
                className="font-display font-black text-[clamp(48px,7vw,96px)] leading-[0.88] tracking-[-1px] text-gold"
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
                  className={`py-5 px-4 lg:px-6 ${i < 2 ? "border-r border-brand-white/[0.06]" : ""}`}
                >
                  <div className="font-display font-extrabold text-[clamp(24px,3vw,32px)] text-gold leading-none">
                    {stat.value}
                  </div>
                  <div className="font-display font-light text-[8px] lg:text-[9px] tracking-[2px] text-steel uppercase mt-2">
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
                  className="inline-flex items-center font-display font-semibold text-[10px] tracking-[3px] uppercase text-parchment bg-crimson px-6 lg:px-8 py-4 border-l-[3px] border-brand-white/30"
                >
                  START YOUR COMPLIANCE PLAN
                </Link>
              </motion.div>
              
              <Link
                href="#sample"
                className="inline-flex items-center font-display font-semibold text-[10px] tracking-[3px] uppercase text-brand-white/70 px-6 lg:px-8 py-4 border border-brand-white/[0.15] hover:border-gold hover:text-gold transition-colors duration-300"
              >
                DOWNLOAD SAMPLE REPORT
              </Link>
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

          {/* Right side is the video bleeding through - no content needed */}
          <div className="hidden lg:block" />
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
