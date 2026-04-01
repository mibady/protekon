"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface IntroAnimationProps {
  onComplete: () => void
  skipable?: boolean
}

export default function IntroAnimation({ onComplete, skipable = true }: IntroAnimationProps) {
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
      { delay: 400, phase: 1 },    // P-mark starts assembling
      { delay: 1600, phase: 2 },   // Wordmark reveals
      { delay: 2800, phase: 3 },   // Tagline appears
      { delay: 4200, phase: 4 },   // Hold then exit
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
              backgroundSize: '80px 80px',
            }}
          />

          {/* Main content container */}
          <div className="relative flex flex-col items-center justify-center gap-12">
            
            {/* P-Mark Assembly */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 1 ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <svg viewBox="0 0 48 84" className="w-24 h-[168px]">
                {/* Vertical stem - draws down */}
                <motion.rect
                  x="0" y="0" width="13" height="84"
                  fill="#FAFAF8"
                  initial={{ scaleY: 0 }}
                  animate={phase >= 1 ? { scaleY: 1 } : { scaleY: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: "top" }}
                />
                
                {/* Top horizontal - draws right */}
                <motion.rect
                  x="13" y="0" width="35" height="13"
                  fill="#FAFAF8"
                  initial={{ scaleX: 0 }}
                  animate={phase >= 1 ? { scaleX: 1 } : { scaleX: 0 }}
                  transition={{ duration: 0.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: "left" }}
                />
                
                {/* Right vertical - draws down */}
                <motion.rect
                  x="35" y="13" width="13" height="27"
                  fill="#FAFAF8"
                  initial={{ scaleY: 0 }}
                  animate={phase >= 1 ? { scaleY: 1 } : { scaleY: 0 }}
                  transition={{ duration: 0.3, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: "top" }}
                />
                
                {/* Crimson command bar - signature slam effect */}
                <motion.rect
                  x="0" y="40" width="48" height="10"
                  fill="#C41230"
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={phase >= 1 ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: 0.7, 
                    ease: [0.16, 1, 0.3, 1] 
                  }}
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
                  transition={{ 
                    duration: 0.4, 
                    delay: i * 0.05,
                    ease: [0.16, 1, 0.3, 1]
                  }}
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
              {/* Gold line */}
              <motion.div
                className="h-[1px] bg-gold"
                initial={{ width: 0 }}
                animate={phase >= 3 ? { width: 48 } : { width: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
              
              {/* Tagline text */}
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
          {skipable && showSkip && (
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
          <div className="absolute top-8 left-8 w-8 h-8 border-t border-l border-brand-white/10" />
          <div className="absolute top-8 right-8 w-8 h-8 border-t border-r border-brand-white/10" />
          <div className="absolute bottom-8 left-8 w-8 h-8 border-b border-l border-brand-white/10" />
          <div className="absolute bottom-8 right-8 w-8 h-8 border-b border-r border-brand-white/10" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
