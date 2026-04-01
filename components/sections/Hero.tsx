"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import Link from "next/link"
import { useRef } from "react"

// PROTEKON Hero Component
export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })
  
  const pmarkY = useTransform(scrollYProgress, [0, 1], [0, 150])
  const pmarkOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <section ref={containerRef} className="relative min-h-screen">
      {/* Split layout - 55% / 45% per brand kit */}
      <div className="grid lg:grid-cols-[55%_45%] min-h-screen">
        
        {/* LEFT PANEL - Content */}
        <div className="relative bg-void flex flex-col justify-between p-12 lg:p-20 border-r border-brand-white/[0.06]">
          {/* Top Section */}
          <div className="flex flex-col gap-8">
            {/* Eyebrow */}
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="font-display font-medium text-[10px] tracking-[4px] uppercase text-gold">
                California Compliance Intelligence
              </span>
            </motion.div>

            {/* Divider */}
            <motion.div 
              className="w-8 h-[1px] bg-gold"
              initial={{ width: 0 }}
              animate={{ width: 32 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />

            {/* Main Headline - Brand Name */}
            <motion.h1
              className="font-display font-black text-[clamp(64px,10vw,100px)] leading-[0.88] tracking-[2px] uppercase text-parchment"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              PROT<span className="text-crimson">E</span>KON
            </motion.h1>
          </div>

          {/* Middle - Tagline and Description */}
          <div className="flex flex-col gap-7 my-12 lg:my-0">
            {/* Primary Tagline */}
            <motion.p
              className="font-display font-light text-[clamp(22px,3vw,26px)] tracking-[3px] uppercase text-gold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              Compliance, Commanded.
            </motion.p>

            {/* Description */}
            <motion.p
              className="font-sans text-[13px] font-light text-steel leading-[1.75] max-w-[320px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              The compliance command platform for California businesses. 
              IIPP documents. SB 553 plans. Incident logging. Regulatory monitoring. 
              All managed. All delivered. Nothing reaches you without going through PROTEKON first.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 mt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              <Link
                href="/signup"
                className="group inline-flex items-center font-display font-semibold text-[10px] tracking-[3px] uppercase text-parchment bg-crimson px-6 py-4 hover:brightness-110 transition-all"
              >
                Start Compliance Plan
              </Link>
              
              <Link
                href="#sample"
                className="inline-flex items-center font-display font-medium text-[10px] tracking-[3px] uppercase text-gold border-b border-gold/40 pb-1 hover:border-gold transition-colors"
              >
                Download Sample Report
              </Link>
            </motion.div>
          </div>

          {/* Bottom - Stamp */}
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.4 }}
          >
            <div className="w-5 h-[1px] bg-brand-white/15" />
            <span className="font-display text-[9px] tracking-[3px] uppercase text-brand-white/15">
              Managed Compliance · California · 2025
            </span>
          </motion.div>
        </div>

        {/* RIGHT PANEL - P-Mark Display */}
        <div className="relative bg-midnight flex items-center justify-center overflow-hidden min-h-[50vh] lg:min-h-0">
          {/* Giant faded P-mark background */}
          <motion.div 
            className="absolute opacity-[0.03] pointer-events-none"
            style={{ y: pmarkY, opacity: pmarkOpacity }}
          >
            <svg viewBox="0 0 48 84" className="w-[480px] h-[840px]">
              <rect x="0" y="0" width="13" height="84" fill="#FAFAF8" />
              <rect x="13" y="0" width="35" height="13" fill="#FAFAF8" />
              <rect x="35" y="13" width="13" height="27" fill="#FAFAF8" />
              <rect x="0" y="40" width="48" height="10" fill="#FAFAF8" />
            </svg>
          </motion.div>

          {/* Centered P-Mark with wordmark */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Main P-mark */}
            <svg viewBox="0 0 48 84" className="w-[120px] h-[210px]">
              <motion.rect 
                x="0" y="0" width="13" height="84" 
                fill="#FAFAF8"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                style={{ transformOrigin: "top" }}
              />
              <motion.rect 
                x="13" y="0" width="35" height="13" 
                fill="#FAFAF8"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.4, delay: 1 }}
                style={{ transformOrigin: "left" }}
              />
              <motion.rect 
                x="35" y="13" width="13" height="27" 
                fill="#FAFAF8"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.4, delay: 1.2 }}
                style={{ transformOrigin: "top" }}
              />
              <motion.rect 
                x="0" y="40" width="48" height="10" 
                fill="#C41230"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: 1.4 }}
                style={{ transformOrigin: "left" }}
              />
            </svg>

            {/* Wordmark under the mark */}
            <motion.span
              className="font-display font-semibold text-[18px] tracking-[9px] uppercase text-brand-white/40"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.6 }}
            >
              PROT<span className="text-crimson">E</span>KON
            </motion.span>
          </motion.div>

          {/* Stats overlay - bottom of right panel */}
          <motion.div 
            className="absolute bottom-0 left-0 right-0 p-8 lg:p-12 border-t border-brand-white/[0.06] bg-midnight/80 backdrop-blur-sm"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.8 }}
          >
            <div className="grid grid-cols-3 gap-6">
              <div className="flex flex-col">
                <span className="font-display font-black text-[28px] lg:text-[36px] text-gold leading-none">
                  $109.6M
                </span>
                <span className="font-display text-[8px] tracking-[2px] uppercase text-steel mt-2">
                  CA SMB Penalties
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-[28px] lg:text-[36px] text-gold leading-none">
                  44,742
                </span>
                <span className="font-display text-[8px] tracking-[2px] uppercase text-steel mt-2">
                  Target Violations
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-[28px] lg:text-[36px] text-gold leading-none">
                  $7,229
                </span>
                <span className="font-display text-[8px] tracking-[2px] uppercase text-steel mt-2">
                  Avg Serious Fine
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom bar */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 z-20 bg-void border-t border-brand-white/[0.04]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <div className="flex items-center justify-between px-12 lg:px-20 py-4">
          <div className="flex items-center gap-6">
            <span className="font-display text-[9px] tracking-[3px] uppercase text-steel/50">
              Trusted by 500+ California businesses
            </span>
            <div className="hidden md:flex items-center gap-3">
              {['SOC 2', 'Cal/OSHA', 'SB 553'].map((badge) => (
                <span key={badge} className="font-display text-[8px] tracking-[2px] uppercase text-gold/40 px-2 py-1 border border-gold/15">
                  {badge}
                </span>
              ))}
            </div>
          </div>
          
          <motion.button
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
            className="font-display text-[9px] tracking-[2px] uppercase text-steel/40 hover:text-gold transition-colors flex items-center gap-2"
            animate={{ y: [0, 3, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Scroll
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-current">
              <path d="M6 2v8M3 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.button>
        </div>
      </motion.div>
    </section>
  )
}
