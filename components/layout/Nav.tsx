"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion"
import { X, List } from "@phosphor-icons/react"

const navLinks = [
  { name: "Solutions", href: "/solutions", hasMega: true },
  { name: "Industries", href: "/industries" },
  { name: "Pricing", href: "/pricing" },
  { name: "Resources", href: "/resources" },
  { name: "Samples", href: "/samples" },
  { name: "About", href: "/about" },
]

const solutionsMegaMenu = {
  left: {
    label: "COMPLIANCE VERTICALS",
    items: [
      { name: "Compliance Suite — SB 553 + Cal/OSHA", href: "/solutions/compliance-suite" },
      { name: "Construction Shield — CSLB + Site Safety", href: "/solutions/construction" },
      { name: "Healthcare Shield — Cal/OSHA Healthcare", href: "/solutions/healthcare" },
      { name: "Real Estate Shield — Hab Compliance", href: "/solutions/real-estate" },
    ],
  },
  right: {
    label: "HOW IT WORKS",
    items: [
      { name: "The Protekon Engine", href: "/about#engine" },
      { name: "Delivery Model", href: "/about#delivery" },
      { name: "Security & Data", href: "/about#security" },
      { name: "API & Integrations", href: "/marketplace" },
    ],
  },
}

export default function Nav() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)

  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    const isScrollingDown = latest > lastScrollY
    const scrollDelta = Math.abs(latest - lastScrollY)

    // Only hide/show if scroll delta is significant
    if (scrollDelta > 10) {
      setIsHidden(isScrollingDown && latest > 200)
    }

    setIsScrolled(latest > 80)
    setLastScrollY(latest)
  })

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileMenuOpen])

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50"
        initial={{ y: 0 }}
        animate={{ y: isHidden ? "-100%" : 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <nav
          className={`h-[72px] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isScrolled
              ? "bg-void/95 backdrop-blur-[20px] border-b border-brand-white/[0.06]"
              : "bg-transparent"
          }`}
        >
          <div className="max-w-[1400px] mx-auto h-full px-8 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              {/* P-Mark Icon */}
              <svg viewBox="0 0 48 84" className="w-8 h-14">
                <rect x="0" y="0" width="13" height="84" fill="#FAFAF8" />
                <rect x="13" y="0" width="35" height="13" fill="#FAFAF8" />
                <rect x="35" y="13" width="13" height="27" fill="#FAFAF8" />
                <rect x="0" y="40" width="48" height="10" fill="#C41230" />
              </svg>

              {/* Wordmark */}
              <div className="flex flex-col">
                <span className="font-display font-bold text-[22px] tracking-[6px] text-brand-white">
                  PROT<span className="text-crimson">E</span>KON
                </span>
                <span className="font-display font-normal text-[9px] tracking-[2.5px] text-gold">
                  AI COMPLIANCE OFFICER
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <div
                  key={link.name}
                  className="relative"
                  onMouseEnter={() => link.hasMega && setMegaMenuOpen(true)}
                  onMouseLeave={() => link.hasMega && setMegaMenuOpen(false)}
                >
                  <Link
                    href={link.href}
                    className="group relative font-display font-medium text-[11px] tracking-[3px] uppercase text-brand-white/55 hover:text-brand-white transition-colors duration-200"
                  >
                    {link.name}
                    <motion.span
                      className="absolute -bottom-1 left-0 h-[1px] bg-gold"
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.2 }}
                      style={{ transformOrigin: "left", width: "100%" }}
                    />
                  </Link>

                  {/* Mega Menu for Solutions */}
                  {link.hasMega && (
                    <AnimatePresence>
                      {megaMenuOpen && (
                        <motion.div
                          className="absolute top-full left-1/2 -translate-x-1/2 pt-4"
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="bg-midnight border border-brand-white/[0.06] shadow-2xl min-w-[520px]">
                            <div className="grid grid-cols-2">
                              {/* Left Column */}
                              <div className="p-6 border-r border-brand-white/[0.06]">
                                <span className="font-display font-medium text-[9px] tracking-[3px] text-steel uppercase mb-4 block">
                                  {solutionsMegaMenu.left.label}
                                </span>
                                <div className="flex flex-col gap-3">
                                  {solutionsMegaMenu.left.items.map((item) => (
                                    <Link
                                      key={item.name}
                                      href={item.href}
                                      className="text-brand-white/70 hover:text-brand-white text-sm font-normal transition-colors"
                                    >
                                      {item.name}
                                    </Link>
                                  ))}
                                </div>
                              </div>

                              {/* Right Column */}
                              <div className="p-6">
                                <span className="font-display font-medium text-[9px] tracking-[3px] text-steel uppercase mb-4 block">
                                  {solutionsMegaMenu.right.label}
                                </span>
                                <div className="flex flex-col gap-3">
                                  {solutionsMegaMenu.right.items.map((item) => (
                                    <Link
                                      key={item.name}
                                      href={item.href}
                                      className="text-brand-white/70 hover:text-brand-white text-sm font-normal transition-colors"
                                    >
                                      {item.name}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-4">
              <Link
                href="/login"
                className="font-display font-semibold text-[9px] tracking-[3px] uppercase text-brand-white px-5 py-2 border border-brand-white/20 hover:border-crimson hover:text-crimson transition-colors"
              >
                CLIENT LOGIN
              </Link>
              <motion.div
                whileHover={{ scale: 0.98, filter: "brightness(1.1)" }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Link
                  href="/signup"
                  className="font-display font-semibold text-[9px] tracking-[3px] uppercase text-brand-white bg-crimson px-6 py-2.5 inline-block"
                >
                  GET STARTED
                </Link>
              </motion.div>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2"
              aria-label="Open menu"
            >
              <List size={24} weight="bold" className="text-brand-white" />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-[100] bg-void lg:hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Close Button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-6 right-6 p-2"
              aria-label="Close menu"
            >
              <X size={28} weight="bold" className="text-crimson" />
            </button>

            {/* Mobile Nav Links */}
            <div className="flex flex-col justify-center h-full pl-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="font-display font-bold text-[32px] text-brand-white block py-3 hover:text-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}

              {/* Mobile CTAs */}
              <motion.div
                className="mt-12 flex flex-col gap-4 pr-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-display font-semibold text-[11px] tracking-[3px] uppercase text-brand-white px-6 py-3 border border-brand-white/20 text-center"
                >
                  CLIENT LOGIN
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-display font-semibold text-[11px] tracking-[3px] uppercase text-brand-white bg-crimson px-6 py-3 text-center"
                >
                  GET STARTED
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
