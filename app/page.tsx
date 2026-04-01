"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

// ============================================
// ANIMATED INTRO
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
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-void"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {/* Grid background */}
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

          <div className="relative flex flex-col items-center justify-center gap-12">
            {/* P-Mark Animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 1 ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <svg viewBox="0 0 48 84" className="w-24 h-[168px]">
                <motion.rect
                  x="0" y="0" width="13" height="84" fill="#FAFAF8"
                  initial={{ scaleY: 0 }}
                  animate={phase >= 1 ? { scaleY: 1 } : { scaleY: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: "top" }}
                />
                <motion.rect
                  x="13" y="0" width="35" height="13" fill="#FAFAF8"
                  initial={{ scaleX: 0 }}
                  animate={phase >= 1 ? { scaleX: 1 } : { scaleX: 0 }}
                  transition={{ duration: 0.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: "left" }}
                />
                <motion.rect
                  x="35" y="13" width="13" height="27" fill="#FAFAF8"
                  initial={{ scaleY: 0 }}
                  animate={phase >= 1 ? { scaleY: 1 } : { scaleY: 0 }}
                  transition={{ duration: 0.3, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: "top" }}
                />
                {/* Crimson command bar */}
                <motion.rect
                  x="0" y="40" width="48" height="10" fill="#C41230"
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={phase >= 1 ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
                  transition={{ duration: 0.4, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: "left" }}
                />
              </svg>
            </motion.div>

            {/* Wordmark Animation */}
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

            {/* Tagline Animation */}
            <motion.div
              className="flex flex-col items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 3 ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="h-[1px] bg-gold"
                initial={{ width: 0 }}
                animate={phase >= 3 ? { width: 48 } : { width: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
              <motion.span
                className="font-display font-light text-[12px] lg:text-[14px] tracking-[6px] uppercase text-gold"
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
              className="absolute bottom-10 right-10 font-display font-medium text-[10px] tracking-[3px] uppercase text-steel/50 hover:text-steel transition-colors px-4 py-2 border border-steel/20 hover:border-steel/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              Skip
            </motion.button>
          )}

          {/* Progress bar */}
          <motion.div
            className="absolute bottom-0 left-0 h-[2px] bg-crimson"
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
  return (
    <section className="min-h-screen bg-void">
      <div className="grid lg:grid-cols-[55%_45%] min-h-screen">
        {/* Left Panel - Content */}
        <div className="relative flex flex-col justify-center p-8 lg:p-16 xl:p-20 border-r border-white/[0.06]">
          <div className="max-w-[520px]">
            {/* Eyebrow */}
            <motion.div
              className="flex items-center gap-3 mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-6 h-[1px] bg-gold" />
              <span className="font-display font-medium text-[10px] tracking-[4px] uppercase text-gold">
                California Compliance Platform
              </span>
            </motion.div>

            {/* Logo */}
            <motion.h1
              className="font-display font-extrabold text-[clamp(42px,8vw,88px)] leading-[0.9] tracking-[3px] uppercase text-parchment mb-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              PROT<span className="text-crimson">E</span>KON
            </motion.h1>

            {/* Tagline */}
            <motion.p
              className="font-display font-light text-[clamp(16px,2.5vw,22px)] tracking-[4px] uppercase text-gold mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Compliance, Commanded.
            </motion.p>

            {/* Description */}
            <motion.p
              className="font-sans text-[15px] leading-[1.8] text-fog mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              Stop waiting for an inspection to find out you are out of compliance. 
              We write your IIPP. Build your SB 553 plan. Log your incidents. 
              Monitor every regulation change. You run your business. We handle the rest.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Link
                href="/signup"
                className="inline-flex items-center justify-center font-display font-semibold text-[11px] tracking-[3px] uppercase text-parchment bg-crimson px-8 py-4 hover:brightness-110 transition-all"
              >
                Start Your Compliance Plan
              </Link>
              <Link
                href="#sample"
                className="inline-flex items-center justify-center font-display font-semibold text-[11px] tracking-[3px] uppercase text-gold border border-gold/40 px-8 py-4 hover:bg-gold/10 transition-all"
              >
                Download Sample Report
              </Link>
            </motion.div>

            {/* Trust line */}
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <div className="w-5 h-[1px] bg-steel/30" />
              <span className="font-display text-[9px] tracking-[3px] uppercase text-steel/50">
                Trusted by 500+ California Businesses
              </span>
            </motion.div>
          </div>
        </div>

        {/* Right Panel - P-Mark */}
        <div className="relative hidden lg:flex items-center justify-center bg-midnight overflow-hidden">
          {/* Background P-Mark */}
          <div className="absolute opacity-[0.03] pointer-events-none">
            <svg viewBox="0 0 48 84" className="w-[400px] h-[700px]">
              <rect x="0" y="0" width="13" height="84" fill="white" />
              <rect x="13" y="0" width="35" height="13" fill="white" />
              <rect x="35" y="13" width="13" height="27" fill="white" />
              <rect x="0" y="40" width="48" height="10" fill="white" />
            </svg>
          </div>

          {/* Animated P-Mark */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <svg viewBox="0 0 48 84" className="w-[100px] h-[175px]">
              <motion.rect
                x="0" y="0" width="13" height="84" fill="#FAFAF8"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                style={{ transformOrigin: "bottom" }}
              />
              <motion.rect
                x="13" y="0" width="35" height="13" fill="#FAFAF8"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                style={{ transformOrigin: "left" }}
              />
              <motion.rect
                x="35" y="13" width="13" height="27" fill="#FAFAF8"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.4, delay: 0.8 }}
                style={{ transformOrigin: "top" }}
              />
              <motion.rect
                x="0" y="40" width="48" height="10" fill="#C41230"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.3, delay: 1.0 }}
                style={{ transformOrigin: "left" }}
              />
            </svg>

            <motion.span
              className="font-display font-semibold text-[16px] tracking-[8px] uppercase text-white/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              PROT<span className="text-crimson/60">E</span>KON
            </motion.span>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 border-t border-white/[0.06] bg-void/60 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.4 }}
          >
            <div className="grid grid-cols-3">
              <div className="p-5 border-r border-white/[0.06] text-center">
                <div className="font-display font-bold text-[24px] text-gold">$109.6M</div>
                <div className="font-display text-[8px] tracking-[2px] uppercase text-steel">CA SMB Penalties</div>
              </div>
              <div className="p-5 border-r border-white/[0.06] text-center">
                <div className="font-display font-bold text-[24px] text-parchment">44,742</div>
                <div className="font-display text-[8px] tracking-[2px] uppercase text-steel">Target Violations</div>
              </div>
              <div className="p-5 text-center">
                <div className="font-display font-bold text-[24px] text-gold">48hrs</div>
                <div className="font-display text-[8px] tracking-[2px] uppercase text-steel">First Delivery</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile Stats */}
      <motion.div
        className="lg:hidden border-t border-white/[0.06] bg-midnight"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <div className="grid grid-cols-3">
          <div className="p-4 border-r border-white/[0.06] text-center">
            <div className="font-display font-bold text-[18px] text-gold">$109.6M</div>
            <div className="font-display text-[7px] tracking-[1px] uppercase text-steel">Penalties</div>
          </div>
          <div className="p-4 border-r border-white/[0.06] text-center">
            <div className="font-display font-bold text-[18px] text-parchment">44,742</div>
            <div className="font-display text-[7px] tracking-[1px] uppercase text-steel">Violations</div>
          </div>
          <div className="p-4 text-center">
            <div className="font-display font-bold text-[18px] text-gold">48hrs</div>
            <div className="font-display text-[7px] tracking-[1px] uppercase text-steel">Delivery</div>
          </div>
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
