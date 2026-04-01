"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import Link from "next/link"

// ============================================
// INTRO ANIMATION
// ============================================
function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0)
  const [showSkip, setShowSkip] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [hasPlayed, setHasPlayed] = useState<boolean | null>(null)

  useEffect(() => {
    const played = sessionStorage.getItem("protekon_intro_played")
    if (played === "true") {
      setHasPlayed(true)
      onComplete()
    } else {
      setHasPlayed(false)
    }
  }, [onComplete])

  useEffect(() => {
    if (hasPlayed !== false) return

    const timings = [
      { delay: 400, phase: 1 },
      { delay: 1600, phase: 2 },
      { delay: 2800, phase: 3 },
    ]

    const timeouts = timings.map(({ delay, phase: p }) =>
      setTimeout(() => setPhase(p), delay)
    )

    const skipTimeout = setTimeout(() => setShowSkip(true), 800)

    const completeTimeout = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => {
        sessionStorage.setItem("protekon_intro_played", "true")
        onComplete()
      }, 600)
    }, 4800)

    return () => {
      timeouts.forEach(clearTimeout)
      clearTimeout(skipTimeout)
      clearTimeout(completeTimeout)
    }
  }, [hasPlayed, onComplete])

  const handleSkip = () => {
    setIsExiting(true)
    setTimeout(() => {
      sessionStorage.setItem("protekon_intro_played", "true")
      onComplete()
    }, 400)
  }

  if (hasPlayed === null) return null
  if (hasPlayed === true) return null

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ backgroundColor: "#070F1E" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {/* Subtle grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(250,250,248,1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(250,250,248,1) 1px, transparent 1px)
              `,
              backgroundSize: "80px 80px",
            }}
          />

          {/* Main content */}
          <div className="relative flex flex-col items-center justify-center gap-12">
            
            {/* P-Mark Assembly */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 1 ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <svg viewBox="0 0 48 84" className="w-24 h-[168px]">
                <motion.rect
                  x="0" y="0" width="13" height="84"
                  fill="#FAFAF8"
                  initial={{ scaleY: 0 }}
                  animate={phase >= 1 ? { scaleY: 1 } : { scaleY: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: "top" }}
                />
                <motion.rect
                  x="13" y="0" width="35" height="13"
                  fill="#FAFAF8"
                  initial={{ scaleX: 0 }}
                  animate={phase >= 1 ? { scaleX: 1 } : { scaleX: 0 }}
                  transition={{ duration: 0.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: "left" }}
                />
                <motion.rect
                  x="35" y="13" width="13" height="27"
                  fill="#FAFAF8"
                  initial={{ scaleY: 0 }}
                  animate={phase >= 1 ? { scaleY: 1 } : { scaleY: 0 }}
                  transition={{ duration: 0.3, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: "top" }}
                />
                <motion.rect
                  x="0" y="40" width="48" height="10"
                  fill="#C41230"
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={phase >= 1 ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
                  transition={{ duration: 0.4, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: "left" }}
                />
              </svg>
            </motion.div>

            {/* Wordmark */}
            <motion.div
              className="flex items-center gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 2 ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              {["P", "R", "O", "T", "E", "K", "O", "N"].map((letter, i) => (
                <motion.span
                  key={i}
                  className="font-display font-bold text-[48px] lg:text-[64px] tracking-[8px] uppercase"
                  style={{ color: letter === "E" ? "#C41230" : "#FAFAF8" }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                >
                  {letter}
                </motion.span>
              ))}
            </motion.div>

            {/* Tagline */}
            <motion.div
              className="flex flex-col items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 3 ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="h-[1px] bg-[#C9A84C]"
                initial={{ width: 0 }}
                animate={phase >= 3 ? { width: 48 } : { width: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
              <motion.span
                className="font-display font-light text-[12px] lg:text-[14px] tracking-[6px] uppercase"
                style={{ color: "#C9A84C" }}
                initial={{ opacity: 0, y: 10 }}
                animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Compliance, Commanded.
              </motion.span>
            </motion.div>
          </div>

          {/* Skip button */}
          {showSkip && (
            <motion.button
              onClick={handleSkip}
              className="absolute bottom-10 right-10 font-display font-medium text-[10px] tracking-[3px] uppercase px-4 py-2 border transition-colors"
              style={{ color: "rgba(113,128,150,0.5)", borderColor: "rgba(113,128,150,0.2)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              Skip
            </motion.button>
          )}

          {/* Progress bar */}
          <motion.div
            className="absolute bottom-0 left-0 h-[2px]"
            style={{ backgroundColor: "#C41230" }}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 4.6, ease: "linear" }}
          />

          {/* Corner accents */}
          <div className="absolute top-8 left-8 w-8 h-8 border-t border-l border-white/10" />
          <div className="absolute top-8 right-8 w-8 h-8 border-t border-r border-white/10" />
          <div className="absolute bottom-8 left-8 w-8 h-8 border-b border-l border-white/10" />
          <div className="absolute bottom-8 right-8 w-8 h-8 border-b border-r border-white/10" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================
// HERO SECTION
// ============================================
function Hero() {
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
        <div className="relative flex flex-col justify-between p-12 lg:p-20 border-r border-white/[0.06]" style={{ backgroundColor: "#070F1E" }}>
          {/* Top Section */}
          <div className="flex flex-col gap-8">
            {/* Eyebrow */}
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="font-display font-medium text-[10px] tracking-[4px] uppercase" style={{ color: "#C9A84C" }}>
                California Compliance Intelligence
              </span>
            </motion.div>

            {/* Divider */}
            <motion.div 
              className="h-[1px]"
              style={{ backgroundColor: "#C9A84C" }}
              initial={{ width: 0 }}
              animate={{ width: 32 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />

            {/* Main Headline - Brand Name */}
            <motion.h1
              className="font-display font-black text-[clamp(64px,10vw,100px)] leading-[0.88] tracking-[2px] uppercase"
              style={{ color: "#FAFAF8" }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              PROT<span style={{ color: "#C41230" }}>E</span>KON
            </motion.h1>
          </div>

          {/* Middle - Tagline and Description */}
          <div className="flex flex-col gap-7 my-12 lg:my-0">
            {/* Primary Tagline */}
            <motion.p
              className="font-display font-light text-[clamp(22px,3vw,26px)] tracking-[3px] uppercase"
              style={{ color: "#C9A84C" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              Compliance, Commanded.
            </motion.p>

            {/* Description */}
            <motion.p
              className="font-sans text-[13px] font-light leading-[1.75] max-w-[320px]"
              style={{ color: "#718096" }}
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
                className="group inline-flex items-center font-display font-semibold text-[10px] tracking-[3px] uppercase px-6 py-4 hover:brightness-110 transition-all"
                style={{ backgroundColor: "#C41230", color: "#FAFAF8" }}
              >
                Start Compliance Plan
              </Link>
              
              <Link
                href="#sample"
                className="inline-flex items-center font-display font-medium text-[10px] tracking-[3px] uppercase border-b pb-1 hover:opacity-80 transition-colors"
                style={{ color: "#C9A84C", borderColor: "rgba(201,168,76,0.4)" }}
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
            <div className="w-5 h-[1px] bg-white/15" />
            <span className="font-display text-[9px] tracking-[3px] uppercase text-white/15">
              Managed Compliance · California · 2025
            </span>
          </motion.div>
        </div>

        {/* RIGHT PANEL - P-Mark Display */}
        <div className="relative flex items-center justify-center overflow-hidden min-h-[50vh] lg:min-h-0" style={{ backgroundColor: "#0F172A" }}>
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
              className="font-display font-semibold text-[18px] tracking-[9px] uppercase text-white/40"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.6 }}
            >
              PROT<span style={{ color: "#C41230" }}>E</span>KON
            </motion.span>
          </motion.div>

          {/* Stats overlay - bottom of right panel */}
          <motion.div 
            className="absolute bottom-0 left-0 right-0 p-8 lg:p-12 border-t border-white/[0.06] backdrop-blur-sm"
            style={{ backgroundColor: "rgba(15,23,42,0.8)" }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.8 }}
          >
            <div className="grid grid-cols-3 gap-6">
              <div className="flex flex-col">
                <span className="font-display font-black text-[28px] lg:text-[36px] leading-none" style={{ color: "#C9A84C" }}>
                  $109.6M
                </span>
                <span className="font-display text-[8px] tracking-[2px] uppercase mt-2" style={{ color: "#718096" }}>
                  CA SMB Penalties
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-[28px] lg:text-[36px] leading-none" style={{ color: "#C9A84C" }}>
                  44,742
                </span>
                <span className="font-display text-[8px] tracking-[2px] uppercase mt-2" style={{ color: "#718096" }}>
                  Target Violations
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-[28px] lg:text-[36px] leading-none" style={{ color: "#C9A84C" }}>
                  $7,229
                </span>
                <span className="font-display text-[8px] tracking-[2px] uppercase mt-2" style={{ color: "#718096" }}>
                  Avg Serious Fine
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom bar */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 z-20 border-t border-white/[0.04]"
        style={{ backgroundColor: "#070F1E" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <div className="flex items-center justify-between px-12 lg:px-20 py-4">
          <div className="flex items-center gap-6">
            <span className="font-display text-[9px] tracking-[3px] uppercase text-white/30">
              Trusted by 500+ California businesses
            </span>
            <div className="hidden md:flex items-center gap-3">
              {['SOC 2', 'Cal/OSHA', 'SB 553'].map((badge) => (
                <span key={badge} className="font-display text-[8px] tracking-[2px] uppercase px-2 py-1 border" style={{ color: "rgba(201,168,76,0.4)", borderColor: "rgba(201,168,76,0.15)" }}>
                  {badge}
                </span>
              ))}
            </div>
          </div>
          
          <motion.button
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
            className="font-display text-[9px] tracking-[2px] uppercase flex items-center gap-2 transition-colors"
            style={{ color: "rgba(113,128,150,0.4)" }}
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

// ============================================
// MAIN PAGE EXPORT
// ============================================
export default function Home() {
  const [introComplete, setIntroComplete] = useState(false)

  return (
    <>
      <IntroAnimation onComplete={() => setIntroComplete(true)} />
      <div className={`${introComplete ? "opacity-100" : "opacity-0"} transition-opacity duration-500`}>
        <main>
          <Hero />
        </main>
      </div>
    </>
  )
}
