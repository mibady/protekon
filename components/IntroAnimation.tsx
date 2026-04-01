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
    const played = localStorage.getItem("protekon_intro_played")
    if (played === "true") {
      setHasPlayed(true)
      onComplete()
    } else {
      setHasPlayed(false)
    }
  }, [onComplete])

  useEffect(() => {
    if (hasPlayed !== false) return

    // Phase timing for cinematic reveal
    const timings = [
      { delay: 300, phase: 1 },     // Phase 1: Lines draw
      { delay: 800, phase: 2 },     // Phase 2: P-mark assembles
      { delay: 1800, phase: 3 },    // Phase 3: P-mark moves left, wordmark reveals
      { delay: 3200, phase: 4 },    // Phase 4: Tagline types
      { delay: 4500, phase: 5 },    // Phase 5: Hold
      { delay: 5200, phase: 6 },    // Phase 6: Exit
    ]

    const timeouts = timings.map(({ delay, phase: p }) =>
      setTimeout(() => setPhase(p), delay)
    )

    const skipTimeout = setTimeout(() => setShowSkip(true), 1200)

    const completeTimeout = setTimeout(() => {
      localStorage.setItem("protekon_intro_played", "true")
      onComplete()
    }, 5800)

    return () => {
      timeouts.forEach(clearTimeout)
      clearTimeout(skipTimeout)
      clearTimeout(completeTimeout)
    }
  }, [hasPlayed, onComplete])

  const handleSkip = () => {
    setIsExiting(true)
    setTimeout(() => {
      localStorage.setItem("protekon_intro_played", "true")
      onComplete()
    }, 400)
  }

  if (hasPlayed === null) return null
  if (hasPlayed === true) return null

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: "#070F1E" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {/* Ambient particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  backgroundColor: i % 3 === 0 ? "#C41230" : "#C9A84C",
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 0.4, 0],
                  scale: [0, 1.5, 0],
                  y: [0, -100],
                }}
                transition={{
                  duration: 4 + Math.random() * 2,
                  delay: Math.random() * 2,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>

          {/* Phase 1: Crossing lines */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 1 ? 1 : 0 }}
          >
            {/* Horizontal line */}
            <svg className="absolute w-full h-1" style={{ top: "50%" }}>
              <motion.line
                x1="0%"
                y1="50%"
                x2="100%"
                y2="50%"
                stroke="#C41230"
                strokeWidth="1"
                initial={{ pathLength: 0 }}
                animate={phase >= 1 ? { pathLength: 1 } : { pathLength: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
            </svg>
            
            {/* Vertical line */}
            <svg className="absolute h-full w-1" style={{ left: "50%" }}>
              <motion.line
                x1="50%"
                y1="0%"
                x2="50%"
                y2="100%"
                stroke="#C9A84C"
                strokeWidth="1"
                initial={{ pathLength: 0 }}
                animate={phase >= 1 ? { pathLength: 1 } : { pathLength: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut", delay: 0.1 }}
              />
            </svg>
          </motion.div>

          {/* Phase 2: P-Mark Assembly (center) */}
          <motion.div
            className="absolute flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: phase >= 2 ? 1 : 0,
              x: phase >= 3 ? -200 : 0,
              scale: phase >= 3 ? 0.6 : 1,
            }}
            transition={{ 
              opacity: { duration: 0.4 },
              x: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
              scale: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
            }}
          >
            <svg viewBox="0 0 48 84" className="w-32 h-56">
              {/* Vertical stem */}
              <motion.rect
                x="0"
                y="0"
                width="13"
                height="84"
                fill="#FAFAF8"
                initial={{ scaleY: 0 }}
                animate={phase >= 2 ? { scaleY: 1 } : { scaleY: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{ transformOrigin: "top" }}
              />
              
              {/* Top horizontal */}
              <motion.rect
                x="13"
                y="0"
                width="35"
                height="13"
                fill="#FAFAF8"
                initial={{ scaleX: 0 }}
                animate={phase >= 2 ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
                style={{ transformOrigin: "left" }}
              />
              
              {/* Right vertical */}
              <motion.rect
                x="35"
                y="13"
                width="13"
                height="27"
                fill="#FAFAF8"
                initial={{ scaleY: 0 }}
                animate={phase >= 2 ? { scaleY: 1 } : { scaleY: 0 }}
                transition={{ duration: 0.3, delay: 0.35, ease: "easeOut" }}
                style={{ transformOrigin: "top" }}
              />
              
              {/* Crimson bar - signature element */}
              <motion.rect
                x="0"
                y="40"
                width="48"
                height="10"
                fill="#C41230"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={phase >= 2 ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
                transition={{ duration: 0.4, delay: 0.5, ease: "easeOut" }}
                style={{ transformOrigin: "left" }}
              />
            </svg>
          </motion.div>

          {/* Phase 3: Wordmark reveal */}
          <AnimatePresence>
            {phase >= 3 && (
              <motion.div
                className="absolute flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {/* Small P-mark positioned to left */}
                <motion.div
                  className="absolute"
                  style={{ left: "calc(50% - 280px)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <svg viewBox="0 0 48 84" className="w-12 h-20">
                    <rect x="0" y="0" width="13" height="84" fill="#FAFAF8" />
                    <rect x="13" y="0" width="35" height="13" fill="#FAFAF8" />
                    <rect x="35" y="13" width="13" height="27" fill="#FAFAF8" />
                    <rect x="0" y="40" width="48" height="10" fill="#C41230" />
                  </svg>
                </motion.div>

                {/* Wordmark */}
                <div className="flex items-center ml-8">
                  {/* P */}
                  <motion.span
                    className="font-display font-black text-[72px] leading-none tracking-[8px]"
                    style={{ color: "#FAFAF8" }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                  >
                    P
                  </motion.span>
                  
                  {/* R */}
                  <motion.span
                    className="font-display font-black text-[72px] leading-none tracking-[8px]"
                    style={{ color: "#FAFAF8" }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
                  >
                    R
                  </motion.span>
                  
                  {/* O */}
                  <motion.span
                    className="font-display font-black text-[72px] leading-none tracking-[8px]"
                    style={{ color: "#FAFAF8" }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
                  >
                    O
                  </motion.span>
                  
                  {/* T */}
                  <motion.span
                    className="font-display font-black text-[72px] leading-none tracking-[8px]"
                    style={{ color: "#FAFAF8" }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.25, ease: "easeOut" }}
                  >
                    T
                  </motion.span>
                  
                  {/* E - Crimson accent */}
                  <motion.span
                    className="font-display font-black text-[72px] leading-none tracking-[8px]"
                    style={{ color: "#C41230" }}
                    initial={{ opacity: 0, scale: 1.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: 0.35, 
                      ease: [0.16, 1, 0.3, 1] 
                    }}
                  >
                    E
                  </motion.span>
                  
                  {/* K */}
                  <motion.span
                    className="font-display font-black text-[72px] leading-none tracking-[8px]"
                    style={{ color: "#FAFAF8" }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
                  >
                    K
                  </motion.span>
                  
                  {/* O */}
                  <motion.span
                    className="font-display font-black text-[72px] leading-none tracking-[8px]"
                    style={{ color: "#FAFAF8" }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.45, ease: "easeOut" }}
                  >
                    O
                  </motion.span>
                  
                  {/* N */}
                  <motion.span
                    className="font-display font-black text-[72px] leading-none tracking-[8px]"
                    style={{ color: "#FAFAF8" }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5, ease: "easeOut" }}
                  >
                    N
                  </motion.span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phase 4: Tagline */}
          <AnimatePresence>
            {phase >= 4 && (
              <motion.div
                className="absolute flex flex-col items-center gap-4"
                style={{ top: "60%" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                {/* Gold divider */}
                <motion.div
                  className="h-[1px] bg-gold"
                  initial={{ width: 0 }}
                  animate={{ width: 60 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
                
                {/* Tagline with typewriter - primary brand tagline */}
                <TypewriterText
                  text="COMPLIANCE, COMMANDED."
                  className="font-display font-light text-[14px] tracking-[6px] uppercase"
                  style={{ color: "#C9A84C" }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Skip button */}
          {skipable && showSkip && (
            <motion.button
              onClick={handleSkip}
              className="absolute bottom-8 right-8 font-display font-medium text-[10px] tracking-[3px] uppercase hover:opacity-80 transition-opacity px-4 py-2 border border-steel/20"
              style={{ color: "#7A8FA5" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              SKIP INTRO
            </motion.button>
          )}

          {/* Bottom accent line */}
          <motion.div
            className="absolute bottom-0 left-0 h-[3px] bg-crimson"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 5.5, ease: "linear" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Typewriter effect component
function TypewriterText({
  text,
  className,
  style,
}: {
  text: string
  className?: string
  style?: React.CSSProperties
}) {
  const [displayedText, setDisplayedText] = useState("")

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1))
        i++
      } else {
        clearInterval(interval)
      }
    }, 40)

    return () => clearInterval(interval)
  }, [text])

  return (
    <span className={className} style={style}>
      {displayedText}
      <motion.span 
        className="inline-block ml-1"
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
      >
        |
      </motion.span>
    </span>
  )
}
