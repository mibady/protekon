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
    // Check localStorage on mount
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

    // Phase timing
    const timings = [
      { delay: 0, phase: 1 },      // Phase 1: Line draw (0-0.4s)
      { delay: 400, phase: 2 },    // Phase 2: P-mark fade in (0.4-1.2s)
      { delay: 1200, phase: 3 },   // Phase 3: Wordmark (1.2-2.2s)
      { delay: 2200, phase: 4 },   // Phase 4: Tagline (2.2-2.8s)
      { delay: 2800, phase: 5 },   // Phase 5: Hold (2.8-3.4s)
      { delay: 3400, phase: 6 },   // Phase 6: Exit (3.4-3.8s)
    ]

    const timeouts = timings.map(({ delay, phase: p }) =>
      setTimeout(() => setPhase(p), delay)
    )

    // Show skip button after 1s
    const skipTimeout = setTimeout(() => setShowSkip(true), 1000)

    // Complete and set localStorage
    const completeTimeout = setTimeout(() => {
      localStorage.setItem("protekon_intro_played", "true")
      onComplete()
    }, 3800)

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
    }, 300)
  }

  // Don't render anything until we've checked localStorage
  if (hasPlayed === null) return null
  // Skip if already played
  if (hasPlayed === true) return null

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: "#070F1E" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          {/* Phase 1: Horizontal crimson line */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 1 ? 1 : 0 }}
          >
            <svg width="100%" height="3" className="max-w-[600px]">
              <motion.line
                x1="50%"
                y1="1.5"
                x2="50%"
                y2="1.5"
                stroke="#C41230"
                strokeWidth="3"
                initial={{ x1: "50%", x2: "50%" }}
                animate={phase >= 1 ? { x1: "0%", x2: "100%" } : {}}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </svg>
          </motion.div>

          {/* Phase 2: Radial gradient bloom */}
          <motion.div
            className="absolute pointer-events-none"
            style={{
              background: "radial-gradient(circle, #0B1D3A 0%, transparent 70%)",
              width: "80vw",
              height: "80vw",
              maxWidth: "800px",
              maxHeight: "800px",
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={
              phase >= 2
                ? { opacity: 0.6, scale: 1 }
                : { opacity: 0, scale: 0 }
            }
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 18,
            }}
          />

          {/* Phase 2: P-Mark Logo */}
          <motion.div
            className="absolute flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.3 }}
            animate={
              phase >= 2
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: 0.3 }
            }
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 18,
            }}
          >
            <svg
              viewBox="0 0 48 84"
              width="120"
              height="210"
              className={phase >= 3 ? "opacity-0 transition-opacity duration-300" : ""}
            >
              <rect x="0" y="0" width="13" height="84" fill="#FAFAF8" />
              <rect x="13" y="0" width="35" height="13" fill="#FAFAF8" />
              <rect x="35" y="13" width="13" height="27" fill="#FAFAF8" />
              <rect x="0" y="40" width="48" height="10" fill="#C41230" />
            </svg>
          </motion.div>

          {/* Phase 3-4: Wordmark and Tagline */}
          {phase >= 3 && (
            <div className="flex flex-col items-center gap-6">
              {/* Wordmark */}
              <div className="flex items-baseline">
                {/* PROTE */}
                <motion.span
                  className="font-display font-black text-[88px] leading-none tracking-tight"
                  style={{ color: "#FAFAF8" }}
                  initial={{ opacity: 0, letterSpacing: "2em" }}
                  animate={{ opacity: 1, letterSpacing: "7px" }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  PROTE
                </motion.span>

                {/* K */}
                <motion.span
                  className="font-display font-black text-[88px] leading-none"
                  style={{ color: "#C41230" }}
                  initial={{ opacity: 0, scale: 1.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15, duration: 0.3, ease: "easeOut" }}
                >
                  K
                </motion.span>

                {/* ON */}
                <motion.span
                  className="font-display font-black text-[88px] leading-none tracking-tight"
                  style={{ color: "#FAFAF8" }}
                  initial={{ opacity: 0, letterSpacing: "2em" }}
                  animate={{ opacity: 1, letterSpacing: "7px" }}
                  transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
                >
                  ON
                </motion.span>
              </div>

              {/* Phase 4: Gold line and tagline */}
              {phase >= 4 && (
                <div className="flex flex-col items-center gap-4">
                  {/* Gold divider line */}
                  <motion.div
                    className="h-[1px] w-10"
                    style={{ backgroundColor: "#C9A84C" }}
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 40, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Tagline with typewriter effect */}
                  <TypewriterText
                    text="MANAGED COMPLIANCE. DELIVERED."
                    className="font-display font-light text-[16px] tracking-[5px] uppercase"
                    style={{ color: "#C9A84C" }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Skip button */}
          {skipable && showSkip && (
            <motion.button
              onClick={handleSkip}
              className="absolute bottom-8 right-8 font-display font-medium text-[9px] tracking-[2px] uppercase hover:opacity-80 transition-opacity"
              style={{ color: "#7A8FA5" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              SKIP
            </motion.button>
          )}
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
    }, 35)

    return () => clearInterval(interval)
  }, [text])

  return (
    <span className={className} style={style}>
      {displayedText}
      <span className="animate-pulse">|</span>
    </span>
  )
}
