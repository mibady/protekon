"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import Link from "next/link"

/* INTRO ANIMATION */
function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0)
  const [showSkip, setShowSkip] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const played = sessionStorage.getItem("protekon_intro_played")
    if (played === "true") {
      onComplete()
      return
    }

    const t1 = setTimeout(() => setPhase(1), 300)
    const t2 = setTimeout(() => setPhase(2), 1400)
    const t3 = setTimeout(() => setPhase(3), 2400)
    const tSkip = setTimeout(() => setShowSkip(true), 600)
    
    const tComplete = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => {
        sessionStorage.setItem("protekon_intro_played", "true")
        onComplete()
      }, 500)
    }, 4200)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(tSkip)
      clearTimeout(tComplete)
    }
  }, [onComplete])

  const handleSkip = () => {
    setIsExiting(true)
    setTimeout(() => {
      sessionStorage.setItem("protekon_intro_played", "true")
      onComplete()
    }, 400)
  }

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-void"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div 
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: `linear-gradient(rgba(250,250,248,1) 1px, transparent 1px), linear-gradient(90deg, rgba(250,250,248,1) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />

          <div className="absolute top-8 left-8 w-12 h-12 border-t border-l border-white/10" />
          <div className="absolute top-8 right-8 w-12 h-12 border-t border-r border-white/10" />
          <div className="absolute bottom-8 left-8 w-12 h-12 border-b border-l border-white/10" />
          <div className="absolute bottom-8 right-8 w-12 h-12 border-b border-r border-white/10" />

          <div className="relative flex flex-col items-center gap-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={phase >= 1 ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <svg viewBox="0 0 48 84" className="w-20 h-[140px]">
                <motion.rect
                  x="0" y="0" width="13" height="84"
                  fill="#FAFAF8"
                  initial={{ scaleY: 0 }}
                  animate={phase >= 1 ? { scaleY: 1 } : {}}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: "top" }}
                />
                <motion.rect
                  x="13" y="0" width="35" height="13"
                  fill="#FAFAF8"
                  initial={{ scaleX: 0 }}
                  animate={phase >= 1 ? { scaleX: 1 } : {}}
                  transition={{ duration: 0.3, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: "left" }}
                />
                <motion.rect
                  x="35" y="13" width="13" height="27"
                  fill="#FAFAF8"
                  initial={{ scaleY: 0 }}
                  animate={phase >= 1 ? { scaleY: 1 } : {}}
                  transition={{ duration: 0.25, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: "top" }}
                />
                <motion.rect
                  x="0" y="40" width="48" height="10"
                  fill="#C41230"
                  initial={{ scaleX: 0 }}
                  animate={phase >= 1 ? { scaleX: 1 } : {}}
                  transition={{ duration: 0.35, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: "left" }}
                />
              </svg>
            </motion.div>

            <motion.div className="flex items-center">
              {["P", "R", "O", "T", "E", "K", "O", "N"].map((letter, i) => (
                <motion.span
                  key={i}
                  className="font-display font-bold text-[42px] lg:text-[56px] tracking-[6px] uppercase"
                  style={{ color: letter === "E" ? "#C41230" : "#FAFAF8" }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={phase >= 2 ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.35, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                >
                  {letter}
                </motion.span>
              ))}
            </motion.div>

            <motion.div
              className="flex flex-col items-center gap-3"
              initial={{ opacity: 0 }}
              animate={phase >= 3 ? { opacity: 1 } : {}}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                className="h-[1px] bg-gold"
                initial={{ width: 0 }}
                animate={phase >= 3 ? { width: 40 } : {}}
                transition={{ duration: 0.5 }}
              />
              <motion.span
                className="font-display font-light text-[11px] lg:text-[13px] tracking-[5px] uppercase text-gold"
                initial={{ opacity: 0, y: 8 }}
                animate={phase >= 3 ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.15 }}
              >
                Compliance, Commanded.
              </motion.span>
            </motion.div>
          </div>

          {showSkip && (
            <motion.button
              onClick={handleSkip}
              className="absolute bottom-8 right-8 font-display font-medium text-[9px] tracking-[2px] uppercase text-steel/40 hover:text-steel transition-colors px-3 py-2 border border-steel/20 hover:border-steel/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              Skip
            </motion.button>
          )}

          <motion.div
            className="absolute bottom-0 left-0 h-[2px] bg-crimson"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 4, ease: "linear" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* HERO SECTION */
function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })
  
  const pmarkY = useTransform(scrollYProgress, [0, 1], [0, 100])

  return (
    <section ref={containerRef} className="relative min-h-screen">
      <div className="grid lg:grid-cols-[55%_45%] min-h-screen">
        
        {/* LEFT PANEL */}
        <div className="relative bg-void flex flex-col justify-between p-10 lg:p-16 xl:p-20 border-r border-brand-white/[0.06]">
          <div className="flex flex-col gap-6">
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span className="font-display font-medium text-[9px] tracking-[3px] uppercase text-gold">
                Brand Identity System
              </span>
            </motion.div>

            <motion.div 
              className="w-8 h-[1px] bg-gold"
              initial={{ width: 0 }}
              animate={{ width: 32 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            />

            <motion.h1
              className="font-display font-black text-[clamp(52px,9vw,100px)] leading-[0.88] tracking-[2px] uppercase text-parchment"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              PROT<span className="text-crimson">E</span>KON
            </motion.h1>
          </div>

          <div className="flex flex-col gap-6 my-10 lg:my-0">
            <motion.p
              className="font-display font-light text-[clamp(18px,2.5vw,26px)] tracking-[2px] uppercase text-gold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              Compliance, Commanded.
            </motion.p>

            <motion.p
              className="font-sans text-[13px] font-light text-steel leading-[1.8] max-w-[340px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              A complete identity system for PROTEKON — the compliance command platform. 
              Rooted in proteger, the Spanish for protect, and kon, the authority to enforce it.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 mt-2"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.1 }}
            >
              <Link
                href="/signup"
                className="inline-flex items-center font-display font-semibold text-[9px] tracking-[2.5px] uppercase text-parchment bg-crimson px-6 py-3.5 hover:brightness-110 transition-all"
              >
                Start Compliance Plan
              </Link>
              
              <Link
                href="#sample"
                className="inline-flex items-center font-display font-medium text-[9px] tracking-[2.5px] uppercase text-gold border-b border-gold/40 pb-1 hover:border-gold transition-colors"
              >
                Download Sample Report
              </Link>
            </motion.div>
          </div>

          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.3 }}
          >
            <div className="w-5 h-[1px] bg-brand-white/15" />
            <span className="font-display text-[8px] tracking-[2.5px] uppercase text-brand-white/20">
              Confidential · Brand Guidelines · 2025
            </span>
          </motion.div>
        </div>

        {/* RIGHT PANEL */}
        <div className="relative bg-midnight flex items-center justify-center overflow-hidden min-h-[50vh] lg:min-h-0">
          <div className="absolute opacity-[0.025] pointer-events-none">
            <svg viewBox="0 0 48 84" className="w-[400px] h-[700px]">
              <rect x="0" y="0" width="13" height="84" fill="#FAFAF8" />
              <rect x="13" y="0" width="35" height="13" fill="#FAFAF8" />
              <rect x="35" y="13" width="13" height="27" fill="#FAFAF8" />
              <rect x="0" y="40" width="48" height="10" fill="#FAFAF8" />
            </svg>
          </div>

          <motion.div
            className="relative z-10 flex flex-col items-center gap-8"
            style={{ y: pmarkY }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <svg viewBox="0 0 48 84" className="w-[100px] h-[175px] lg:w-[120px] lg:h-[210px]">
                <motion.rect 
                  x="0" y="0" width="13" height="84" 
                  fill="#FAFAF8"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  style={{ transformOrigin: "top" }}
                />
                <motion.rect 
                  x="13" y="0" width="35" height="13" 
                  fill="#FAFAF8"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.4, delay: 0.8 }}
                  style={{ transformOrigin: "left" }}
                />
                <motion.rect 
                  x="35" y="13" width="13" height="27" 
                  fill="#FAFAF8"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.35, delay: 0.95 }}
                  style={{ transformOrigin: "top" }}
                />
                <motion.rect 
                  x="0" y="40" width="48" height="10" 
                  fill="#C41230"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.45, delay: 1.1 }}
                  style={{ transformOrigin: "left" }}
                />
              </svg>
            </motion.div>

            <motion.span
              className="font-display font-semibold text-[16px] lg:text-[18px] tracking-[8px] uppercase text-brand-white/40"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.3 }}
            >
              PROT<span className="text-crimson">E</span>KON
            </motion.span>
          </motion.div>
        </div>
      </div>

      <motion.div 
        className="absolute bottom-0 left-0 right-0 z-20 bg-void/90 backdrop-blur-sm border-t border-brand-white/[0.04]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <div className="flex items-center justify-between px-10 lg:px-16 xl:px-20 py-4">
          <div className="flex items-center gap-5">
            <span className="font-display text-[8px] tracking-[2px] uppercase text-steel/50">
              Trusted by 500+ California businesses
            </span>
            <div className="hidden md:flex items-center gap-2">
              {["SOC 2", "Cal/OSHA", "SB 553"].map((badge) => (
                <span key={badge} className="font-display text-[7px] tracking-[1.5px] uppercase text-gold/50 px-2 py-1 border border-gold/20">
                  {badge}
                </span>
              ))}
            </div>
          </div>
          
          <motion.button
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
            className="font-display text-[8px] tracking-[2px] uppercase text-steel/40 hover:text-gold transition-colors flex items-center gap-2"
            animate={{ y: [0, 3, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Scroll
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M6 2v8M3 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.button>
        </div>
      </motion.div>
    </section>
  )
}

/* MAIN PAGE */
export default function Home() {
  const [introComplete, setIntroComplete] = useState(false)

  return (
    <>
      <IntroAnimation onComplete={() => setIntroComplete(true)} />
      
      <div className={introComplete ? "opacity-100 transition-opacity duration-500" : "opacity-0"}>
        <main>
          <Hero />
          
          <section className="min-h-screen bg-parchment flex items-center justify-center">
            <div className="text-center">
              <h2 className="font-display font-bold text-[48px] text-midnight tracking-[2px] uppercase mb-4">
                More Content Coming
              </h2>
              <p className="font-sans text-steel">
                Additional sections will be added here
              </p>
            </div>
          </section>
        </main>
      </div>
    </>
  )
}
