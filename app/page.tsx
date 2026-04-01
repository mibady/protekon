"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from "framer-motion"
import Link from "next/link"
import { X, List, FileText, ClipboardText, Bell, EnvelopeSimple, LinkedinLogo, XLogo, ShieldCheck } from "@phosphor-icons/react"

/* ============================================
   INTRO ANIMATION
   ============================================ */
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

    const t1 = setTimeout(() => setPhase(1), 400)
    const t2 = setTimeout(() => setPhase(2), 1600)
    const t3 = setTimeout(() => setPhase(3), 2800)
    const tSkip = setTimeout(() => setShowSkip(true), 800)
    
    const tComplete = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => {
        sessionStorage.setItem("protekon_intro_played", "true")
        onComplete()
      }, 600)
    }, 4800)

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
          transition={{ duration: 0.6 }}
        >
          {/* Grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `linear-gradient(rgba(250,250,248,1) 1px, transparent 1px), linear-gradient(90deg, rgba(250,250,248,1) 1px, transparent 1px)`,
              backgroundSize: "80px 80px",
            }}
          />

          {/* Corner accents */}
          <div className="absolute top-8 left-8 w-8 h-8 border-t border-l border-white/10" />
          <div className="absolute top-8 right-8 w-8 h-8 border-t border-r border-white/10" />
          <div className="absolute bottom-8 left-8 w-8 h-8 border-b border-l border-white/10" />
          <div className="absolute bottom-8 right-8 w-8 h-8 border-b border-r border-white/10" />

          {/* Main content */}
          <div className="relative flex flex-col items-center gap-12">
            {/* P-Mark */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 1 ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <svg viewBox="0 0 48 84" className="w-24 h-[168px]">
                <motion.rect x="0" y="0" width="13" height="84" fill="#FAFAF8"
                  initial={{ scaleY: 0 }} animate={phase >= 1 ? { scaleY: 1 } : {}}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} style={{ transformOrigin: "top" }}
                />
                <motion.rect x="13" y="0" width="35" height="13" fill="#FAFAF8"
                  initial={{ scaleX: 0 }} animate={phase >= 1 ? { scaleX: 1 } : {}}
                  transition={{ duration: 0.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }} style={{ transformOrigin: "left" }}
                />
                <motion.rect x="35" y="13" width="13" height="27" fill="#FAFAF8"
                  initial={{ scaleY: 0 }} animate={phase >= 1 ? { scaleY: 1 } : {}}
                  transition={{ duration: 0.3, delay: 0.5, ease: [0.16, 1, 0.3, 1] }} style={{ transformOrigin: "top" }}
                />
                <motion.rect x="0" y="40" width="48" height="10" fill="#C41230"
                  initial={{ scaleX: 0 }} animate={phase >= 1 ? { scaleX: 1 } : {}}
                  transition={{ duration: 0.4, delay: 0.7, ease: [0.16, 1, 0.3, 1] }} style={{ transformOrigin: "left" }}
                />
              </svg>
            </motion.div>

            {/* Wordmark */}
            <motion.div className="flex items-center" initial={{ opacity: 0 }} animate={{ opacity: phase >= 2 ? 1 : 0 }} transition={{ duration: 0.5 }}>
              {["P", "R", "O", "T", "E", "K", "O", "N"].map((letter, i) => (
                <motion.span
                  key={i}
                  className="font-display font-bold text-[48px] lg:text-[64px] tracking-[8px] uppercase"
                  style={{ color: letter === "E" ? "#C41230" : "#FAFAF8" }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={phase >= 2 ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                >
                  {letter}
                </motion.span>
              ))}
            </motion.div>

            {/* Tagline */}
            <motion.div className="flex flex-col items-center gap-4" initial={{ opacity: 0 }} animate={{ opacity: phase >= 3 ? 1 : 0 }} transition={{ duration: 0.5 }}>
              <motion.div className="h-[1px] bg-gold" initial={{ width: 0 }} animate={phase >= 3 ? { width: 48 } : {}} transition={{ duration: 0.6 }} />
              <motion.span
                className="font-display font-light text-[12px] lg:text-[14px] tracking-[6px] uppercase text-gold"
                initial={{ opacity: 0, y: 10 }}
                animate={phase >= 3 ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Compliance, Commanded.
              </motion.span>
            </motion.div>
          </div>

          {/* Skip button */}
          {showSkip && (
            <motion.button onClick={handleSkip}
              className="absolute bottom-10 right-10 font-display font-medium text-[10px] tracking-[3px] uppercase text-steel/50 hover:text-steel transition-colors px-4 py-2 border border-steel/20 hover:border-steel/40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
            >
              Skip
            </motion.button>
          )}

          {/* Progress bar */}
          <motion.div className="absolute bottom-0 left-0 h-[2px] bg-crimson" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 4.6, ease: "linear" }} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ============================================
   NAVIGATION
   ============================================ */
const navLinks = [
  { name: "Solutions", href: "#solutions", hasMega: true },
  { name: "Industries", href: "#industries" },
  { name: "Pricing", href: "#pricing" },
  { name: "About", href: "/about" },
]

const solutionsMegaMenu = {
  left: { label: "COMPLIANCE VERTICALS", items: [
    { name: "Compliance Suite — SB 553 + Cal/OSHA", href: "#compliance-suite" },
    { name: "Construction Shield", href: "#construction" },
    { name: "Healthcare Shield", href: "#healthcare" },
  ]},
  right: { label: "HOW IT WORKS", items: [
    { name: "The Protekon Engine", href: "#engine" },
    { name: "Delivery Model", href: "#delivery" },
    { name: "Security & Data", href: "#security" },
  ]},
}

function Nav() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    const isScrollingDown = latest > lastScrollY
    if (Math.abs(latest - lastScrollY) > 10) {
      setIsHidden(isScrollingDown && latest > 200)
    }
    setIsScrolled(latest > 80)
    setLastScrollY(latest)
  })

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileMenuOpen])

  return (
    <>
      <motion.header className="fixed top-0 left-0 right-0 z-50" initial={{ y: 0 }} animate={{ y: isHidden ? "-100%" : 0 }} transition={{ duration: 0.3 }}>
        <nav className={`h-[72px] transition-all duration-300 ${isScrolled ? "bg-void/95 backdrop-blur-[20px] border-b border-brand-white/[0.06]" : "bg-transparent"}`}>
          <div className="max-w-[1400px] mx-auto h-full px-8 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <svg viewBox="0 0 48 84" className="w-8 h-14">
                <rect x="0" y="0" width="13" height="84" fill="#FAFAF8" />
                <rect x="13" y="0" width="35" height="13" fill="#FAFAF8" />
                <rect x="35" y="13" width="13" height="27" fill="#FAFAF8" />
                <rect x="0" y="40" width="48" height="10" fill="#C41230" />
              </svg>
              <div className="flex flex-col">
                <span className="font-display font-bold text-[22px] tracking-[6px] text-brand-white">PROT<span className="text-crimson">E</span>KON</span>
                <span className="font-display font-normal text-[9px] tracking-[2.5px] text-gold">MANAGED COMPLIANCE</span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <div key={link.name} className="relative" onMouseEnter={() => link.hasMega && setMegaMenuOpen(true)} onMouseLeave={() => link.hasMega && setMegaMenuOpen(false)}>
                  <Link href={link.href} className="font-display font-medium text-[11px] tracking-[3px] uppercase text-brand-white/55 hover:text-brand-white transition-colors">
                    {link.name}
                  </Link>
                  {link.hasMega && megaMenuOpen && (
                    <motion.div className="absolute top-full left-1/2 -translate-x-1/2 pt-4" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                      <div className="bg-midnight border border-brand-white/[0.06] shadow-2xl min-w-[480px]">
                        <div className="grid grid-cols-2">
                          <div className="p-6 border-r border-brand-white/[0.06]">
                            <span className="font-display font-medium text-[9px] tracking-[3px] text-steel uppercase mb-4 block">{solutionsMegaMenu.left.label}</span>
                            <div className="flex flex-col gap-3">
                              {solutionsMegaMenu.left.items.map((item) => (
                                <Link key={item.name} href={item.href} className="text-brand-white/70 hover:text-brand-white text-sm transition-colors">{item.name}</Link>
                              ))}
                            </div>
                          </div>
                          <div className="p-6">
                            <span className="font-display font-medium text-[9px] tracking-[3px] text-steel uppercase mb-4 block">{solutionsMegaMenu.right.label}</span>
                            <div className="flex flex-col gap-3">
                              {solutionsMegaMenu.right.items.map((item) => (
                                <Link key={item.name} href={item.href} className="text-brand-white/70 hover:text-brand-white text-sm transition-colors">{item.name}</Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-4">
              <Link href="/login" className="font-display font-semibold text-[9px] tracking-[3px] uppercase text-brand-white px-5 py-2 border border-brand-white/20 hover:border-crimson hover:text-crimson transition-colors">CLIENT LOGIN</Link>
              <Link href="/signup" className="font-display font-semibold text-[9px] tracking-[3px] uppercase text-brand-white bg-crimson px-6 py-2.5">GET STARTED</Link>
            </div>

            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2"><List size={24} weight="bold" className="text-brand-white" /></button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div className="fixed inset-0 z-[100] bg-void lg:hidden" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
            <button onClick={() => setMobileMenuOpen(false)} className="absolute top-6 right-6 p-2"><X size={28} weight="bold" className="text-crimson" /></button>
            <div className="flex flex-col justify-center h-full pl-8">
              {navLinks.map((link, i) => (
                <motion.div key={link.name} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
                  <Link href={link.href} onClick={() => setMobileMenuOpen(false)} className="font-display font-bold text-[32px] text-brand-white block py-3 hover:text-gold transition-colors">{link.name}</Link>
                </motion.div>
              ))}
              <motion.div className="mt-12 flex flex-col gap-4 pr-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="font-display font-semibold text-[11px] tracking-[3px] uppercase text-brand-white px-6 py-3 border border-brand-white/20 text-center">CLIENT LOGIN</Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="font-display font-semibold text-[11px] tracking-[3px] uppercase text-brand-white bg-crimson px-6 py-3 text-center">GET STARTED</Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ============================================
   HERO SECTION
   ============================================ */
function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] })
  const pmarkY = useTransform(scrollYProgress, [0, 1], [0, 150])

  return (
    <section ref={containerRef} className="relative min-h-screen">
      <div className="grid lg:grid-cols-[55%_45%] min-h-screen">
        {/* LEFT PANEL */}
        <div className="relative bg-void flex flex-col justify-between p-12 lg:p-20 border-r border-brand-white/[0.06]">
          <div className="flex flex-col gap-8">
            <motion.div className="flex items-center gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              <span className="font-display font-medium text-[10px] tracking-[4px] uppercase text-gold">California Compliance Intelligence</span>
            </motion.div>
            <motion.div className="w-8 h-[1px] bg-gold" initial={{ width: 0 }} animate={{ width: 32 }} transition={{ duration: 0.8, delay: 0.4 }} />
            <motion.h1 className="font-display font-black text-[clamp(64px,10vw,100px)] leading-[0.88] tracking-[2px] uppercase text-parchment" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}>
              PROT<span className="text-crimson">E</span>KON
            </motion.h1>
          </div>

          <div className="flex flex-col gap-7 my-12 lg:my-0">
            <motion.p className="font-display font-light text-[clamp(22px,3vw,26px)] tracking-[3px] uppercase text-gold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.8 }}>Compliance, Commanded.</motion.p>
            <motion.p className="font-sans text-[13px] font-light text-steel leading-[1.75] max-w-[320px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 1 }}>
              The compliance command platform for California businesses. IIPP documents. SB 553 plans. Incident logging. Regulatory monitoring. All managed. All delivered.
            </motion.p>
            <motion.div className="flex flex-col sm:flex-row gap-4 mt-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 1.2 }}>
              <Link href="/signup" className="inline-flex items-center font-display font-semibold text-[10px] tracking-[3px] uppercase text-parchment bg-crimson px-6 py-4 hover:brightness-110 transition-all">Start Compliance Plan</Link>
              <Link href="#sample" className="inline-flex items-center font-display font-medium text-[10px] tracking-[3px] uppercase text-gold border-b border-gold/40 pb-1 hover:border-gold transition-colors">Download Sample Report</Link>
            </motion.div>
          </div>

          <motion.div className="flex items-center gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 1.4 }}>
            <div className="w-5 h-[1px] bg-brand-white/15" />
            <span className="font-display text-[9px] tracking-[3px] uppercase text-brand-white/15">Managed Compliance · California · 2025</span>
          </motion.div>
        </div>

        {/* RIGHT PANEL */}
        <div className="relative bg-midnight flex items-center justify-center overflow-hidden min-h-[50vh] lg:min-h-0">
          <motion.div className="absolute opacity-[0.03] pointer-events-none" style={{ y: pmarkY }}>
            <svg viewBox="0 0 48 84" className="w-[480px] h-[840px]">
              <rect x="0" y="0" width="13" height="84" fill="#FAFAF8" />
              <rect x="13" y="0" width="35" height="13" fill="#FAFAF8" />
              <rect x="35" y="13" width="13" height="27" fill="#FAFAF8" />
              <rect x="0" y="40" width="48" height="10" fill="#FAFAF8" />
            </svg>
          </motion.div>

          <motion.div className="relative z-10 flex flex-col items-center gap-8" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.6 }}>
            <svg viewBox="0 0 48 84" className="w-[120px] h-[210px]">
              <motion.rect x="0" y="0" width="13" height="84" fill="#FAFAF8" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.6, delay: 0.8 }} style={{ transformOrigin: "top" }} />
              <motion.rect x="13" y="0" width="35" height="13" fill="#FAFAF8" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.4, delay: 1 }} style={{ transformOrigin: "left" }} />
              <motion.rect x="35" y="13" width="13" height="27" fill="#FAFAF8" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.4, delay: 1.2 }} style={{ transformOrigin: "top" }} />
              <motion.rect x="0" y="40" width="48" height="10" fill="#C41230" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.5, delay: 1.4 }} style={{ transformOrigin: "left" }} />
            </svg>
            <motion.span className="font-display font-semibold text-[18px] tracking-[9px] uppercase text-brand-white/40" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 1.6 }}>
              PROT<span className="text-crimson">E</span>KON
            </motion.span>
          </motion.div>

          <motion.div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12 border-t border-brand-white/[0.06] bg-midnight/80 backdrop-blur-sm" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.8 }}>
            <div className="grid grid-cols-3 gap-6">
              <div className="flex flex-col"><span className="font-display font-black text-[28px] lg:text-[36px] text-gold leading-none">$109.6M</span><span className="font-display text-[8px] tracking-[2px] uppercase text-steel mt-2">CA SMB Penalties</span></div>
              <div className="flex flex-col"><span className="font-display font-black text-[28px] lg:text-[36px] text-gold leading-none">44,742</span><span className="font-display text-[8px] tracking-[2px] uppercase text-steel mt-2">Target Violations</span></div>
              <div className="flex flex-col"><span className="font-display font-black text-[28px] lg:text-[36px] text-gold leading-none">$7,229</span><span className="font-display text-[8px] tracking-[2px] uppercase text-steel mt-2">Avg Serious Fine</span></div>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div className="absolute bottom-0 left-0 right-0 z-20 bg-void border-t border-brand-white/[0.04]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>
        <div className="flex items-center justify-between px-12 lg:px-20 py-4">
          <div className="flex items-center gap-6">
            <span className="font-display text-[9px] tracking-[3px] uppercase text-steel/50">Trusted by 500+ California businesses</span>
            <div className="hidden md:flex items-center gap-3">
              {["SOC 2", "Cal/OSHA", "SB 553"].map((badge) => (<span key={badge} className="font-display text-[8px] tracking-[2px] uppercase text-gold/40 px-2 py-1 border border-gold/15">{badge}</span>))}
            </div>
          </div>
          <motion.button onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })} className="font-display text-[9px] tracking-[2px] uppercase text-steel/40 hover:text-gold transition-colors flex items-center gap-2" animate={{ y: [0, 3, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            Scroll
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2v8M3 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </motion.button>
        </div>
      </motion.div>
    </section>
  )
}

/* ============================================
   SOCIAL PROOF
   ============================================ */
const industries = ["CONSTRUCTION", "MANUFACTURING", "AGRICULTURE", "HOSPITALITY", "RETAIL", "HEALTHCARE", "WHOLESALE", "TRANSPORTATION"]

function SocialProof() {
  return (
    <section className="bg-parchment py-12 border-t border-b border-midnight/[0.08]">
      <div className="max-w-[1400px] mx-auto px-8 flex flex-col md:flex-row items-center gap-8">
        <span className="font-display font-medium text-[9px] tracking-[3px] uppercase text-steel shrink-0">SERVING BUSINESSES IN</span>
        <div className="relative overflow-hidden flex-1 w-full">
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-parchment to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-parchment to-transparent z-10" />
          <div className="flex animate-marquee gap-12">
            {[...industries, ...industries].map((industry, i) => (
              <div key={`${industry}-${i}`} className="flex items-center gap-3 shrink-0">
                <div className="w-1 h-1 bg-crimson" />
                <span className="font-display font-bold text-[14px] tracking-[4px] text-midnight whitespace-nowrap">{industry}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ============================================
   PRODUCT OVERVIEW
   ============================================ */
const features = [
  { icon: FileText, iconColor: "#C9A84C", borderColor: "#C41230", title: "IIPP + SB 553 DOCUMENTS", description: "8 CCR 3203 requires every California employer to have a written IIPP. SB 553 demands a Workplace Violence Prevention Plan. We write both.", tags: ["IIPP", "SB 553", "WVPP"] },
  { icon: ClipboardText, iconColor: "#C41230", borderColor: "#C9A84C", title: "INCIDENT LOG MANAGEMENT", description: "Text or voice. That is all it takes to log an incident. AI classifies severity, strips all PII, and creates OSHA 300-compliant entries.", tags: ["OSHA 300", "PII PROTECTED"] },
  { icon: Bell, iconColor: "#C9A84C", borderColor: "#C41230", title: "REGULATORY MONITORING", description: "Cal/OSHA. OSHSB. CSLB. Municipal ordinances. We watch them all. 24/7. When regulations change, your documents update automatically.", tags: ["Cal/OSHA", "REAL-TIME"] },
  { icon: EnvelopeSimple, iconColor: "#C41230", borderColor: "#C9A84C", title: "SCHEDULED DELIVERY", description: "Weekly summaries. Monthly reports. Quarterly reviews. Annual audit packages. All in your inbox before you need them.", tags: ["WEEKLY", "MONTHLY"] },
]

function ProductOverview() {
  return (
    <section className="bg-midnight py-24" id="solutions">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="grid lg:grid-cols-[40%_60%] gap-16">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <div className="flex items-center gap-3 mb-6"><div className="w-4 h-[1px] bg-gold" /><span className="font-display font-medium text-[10px] tracking-[4px] uppercase text-crimson">THE PROTEKON ENGINE</span></div>
            <h2 className="font-display font-black text-[clamp(36px,5vw,56px)] leading-[0.92] text-brand-white mb-6">COMPLIANCE IS NOT YOUR JOB.<br />IT&apos;S OURS.</h2>
            <p className="font-sans font-light text-[15px] leading-[1.75] text-fog mb-8 max-w-[380px]">The Protekon Engine watches every regulation. Writes every document. Logs every incident. Delivers everything to your inbox before the deadline hits.</p>
            <Link href="#engine" className="font-display font-semibold text-[12px] tracking-[2px] text-gold border-b border-gold/40 pb-1 hover:border-gold transition-colors inline-flex items-center gap-2">SEE HOW IT WORKS <span className="text-lg">→</span></Link>
          </div>
          <div className="flex flex-col gap-6">
            {features.map((feature, i) => (
              <motion.div key={feature.title} className="bg-void p-8" style={{ borderTop: `3px solid ${feature.borderColor}` }} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.5, delay: i * 0.1 }}>
                <feature.icon size={28} weight="light" style={{ color: feature.iconColor }} className="mb-4" />
                <h3 className="font-display font-extrabold text-[24px] text-brand-white mb-3">{feature.title}</h3>
                <p className="font-sans font-light text-[13px] leading-[1.75] text-steel mb-6">{feature.description}</p>
                <div className="flex flex-wrap gap-2">{feature.tags.map((tag) => (<span key={tag} className="font-display font-medium text-[8px] tracking-[2px] text-gold border border-gold/30 px-3 py-1">{tag}</span>))}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ============================================
   FOOTER
   ============================================ */
function Footer() {
  return (
    <footer className="bg-void border-t border-brand-white/[0.05] relative">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-crimson" />
      <div className="max-w-[1400px] mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <Link href="/" className="flex items-center gap-3 mb-6">
              <svg viewBox="0 0 48 84" className="w-9 h-16"><rect x="0" y="0" width="13" height="84" fill="#FAFAF8" /><rect x="13" y="0" width="35" height="13" fill="#FAFAF8" /><rect x="35" y="13" width="13" height="27" fill="#FAFAF8" /><rect x="0" y="40" width="48" height="10" fill="#C41230" /></svg>
              <span className="font-display font-bold text-[24px] tracking-[7px] text-brand-white">PROT<span className="text-crimson">E</span>KON</span>
            </Link>
            <p className="font-display font-light text-[11px] tracking-[4px] uppercase text-gold mb-4">MANAGED COMPLIANCE. DELIVERED.</p>
            <p className="font-sans font-light text-[12px] leading-[1.75] text-steel max-w-[240px]">PROTEKON delivers California workplace compliance as a recurring managed service.</p>
          </div>
          <div>
            <h4 className="font-display font-semibold text-[9px] tracking-[3px] uppercase text-steel mb-6">SOLUTIONS</h4>
            <ul className="flex flex-col gap-3">
              {["Compliance Suite", "Construction Shield", "Healthcare Shield"].map((item) => (<li key={item}><Link href="#" className="font-sans font-light text-[13px] text-steel hover:text-gold transition-colors">{item}</Link></li>))}
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold text-[9px] tracking-[3px] uppercase text-steel mb-6">COMPANY</h4>
            <ul className="flex flex-col gap-3">
              {["About", "Careers", "Contact"].map((item) => (<li key={item}><Link href="#" className="font-sans font-light text-[13px] text-steel hover:text-gold transition-colors">{item}</Link></li>))}
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold text-[9px] tracking-[3px] uppercase text-steel mb-6">RESOURCES</h4>
            <ul className="flex flex-col gap-3">
              {["Blog", "Sample Reports", "Privacy Policy"].map((item) => (<li key={item}><Link href="#" className="font-sans font-light text-[13px] text-steel hover:text-gold transition-colors">{item}</Link></li>))}
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-brand-white/[0.04] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-display font-normal text-[9px] tracking-[2px] text-brand-white/20">© 2025 PROTEKON. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <ShieldCheck size={12} weight="fill" className="text-gold" />
            <span className="font-display font-normal text-[9px] tracking-[2px] text-steel">SOC 2 Compliant · TLS 1.3 · AES-256</span>
          </div>
          <p className="font-display font-medium text-[9px] tracking-[3px] text-crimson">INLAND EMPIRE, CALIFORNIA</p>
        </div>
      </div>
    </footer>
  )
}

/* ============================================
   MAIN PAGE
   ============================================ */
export default function Home() {
  const [introComplete, setIntroComplete] = useState(false)

  return (
    <>
      <IntroAnimation onComplete={() => setIntroComplete(true)} />
      
      <div className={introComplete ? "opacity-100 transition-opacity duration-500" : "opacity-0 pointer-events-none"}>
        <Nav />
        <main>
          <Hero />
          <SocialProof />
          <ProductOverview />
        </main>
        <Footer />
      </div>
    </>
  )
}
