"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { getFormattedStats } from "@/lib/actions/public-stats"

// Fallback values used during SSR and before live data loads
const FALLBACK_STATS = [
  { value: "$1.04B", label: "Penalties Exposed" },
  { value: "$16,131", label: "Max Per Violation" },
  { value: "48hrs", label: "First Delivery" },
  { value: "56%", label: "Classified Serious" },
]

export default function Hero() {
  const [stats, setStats] = useState(FALLBACK_STATS)

  useEffect(() => {
    getFormattedStats().then((live) => {
      if (live) {
        setStats([
          { value: live.penalties, label: "Penalties Exposed" },
          { value: "$16,131", label: "Max Per Violation" },
          { value: "48hrs", label: "First Delivery" },
          { value: "56%", label: "Classified Serious" },
        ])
      }
    })
  }, [])

  return (
    <section className="relative min-h-screen bg-void">
      {/* 55/45 Grid Split */}
      <div className="grid lg:grid-cols-[55%_45%] min-h-screen">
        {/* LEFT PANEL - Content */}
        <div className="relative flex flex-col justify-center px-8 lg:px-16 pt-24 pb-20 lg:pt-[96px] lg:pb-0 bg-void">
          {/* Background texture */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(201,168,76,1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(201,168,76,1) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative z-10 max-w-[560px]">
            {/* Eyebrow */}
            <motion.span
              className="font-display font-medium text-[12px] tracking-[4px] uppercase text-crimson mb-4 block"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
            >
              COMPLIANCE INTELLIGENCE FOR AMERICAN BUSINESS
            </motion.span>

            {/* Headline */}
            <motion.h1
              className="font-display font-black text-[clamp(32px,5.5vw,58px)] leading-[0.95] tracking-tight text-brand-white mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              THE INSPECTOR IS NOT GOING TO WARN YOU.{" "}
              <span className="text-gold">PROTEKON WILL.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              className="font-sans text-[17px] leading-[1.7] text-fog mb-10 max-w-[480px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Protekon monitors real enforcement actions in your industry — the fines, the
              citations, the inspections — and keeps your business audit-ready before the
              visit that counts. Plans, incident classification, PII scrubbing, regulatory
              updates: all handled after a one-time intake.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
            >
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center font-display font-semibold text-[11px] tracking-[3px] uppercase text-brand-white bg-crimson px-8 py-4 border-l-[3px] border-brand-white/30 hover:brightness-110 transition-all"
              >
                Activate Your Compliance Officer
              </Link>
              <Link
                href="#sample"
                className="inline-flex items-center justify-center font-display font-semibold text-[11px] tracking-[3px] uppercase text-brand-white/70 px-8 py-4 border border-brand-white/15 hover:border-gold hover:text-gold transition-colors"
              >
                See What PROTEKON Delivers
              </Link>
            </motion.div>

          </div>
        </div>

        {/* RIGHT PANEL - Visual */}
        <div className="relative bg-midnight flex flex-col overflow-hidden min-h-[50vh] lg:min-h-0">
          {/* Dashboard screenshot */}
          <motion.div
            className="flex-1 relative"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Image
              src="/images/protekon-dashboard2.png"
              alt="Protekon compliance dashboard"
              fill
              className="object-cover object-left-top"
              priority
            />
          </motion.div>

          {/* Stats Grid - Bottom */}
          <motion.div 
            className="relative z-10 border-t border-brand-white/[0.06]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.5 }}
          >
            <div className="grid grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, i) => (
                <div 
                  key={stat.label}
                  className={`p-5 lg:p-6 ${i < 3 ? 'border-r border-brand-white/[0.06]' : ''} ${i < 2 ? 'border-b lg:border-b-0 border-brand-white/[0.06]' : ''}`}
                >
                  <span className="font-display font-black text-[22px] lg:text-[26px] text-gold block leading-none">
                    {stat.value}
                  </span>
                  <span className="font-display text-[10px] tracking-[2px] uppercase text-steel mt-2 block">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Corner accents */}
          <div className="absolute top-5 left-5 w-8 h-8 border-t border-l border-gold/20" />
          <div className="absolute top-5 right-5 w-8 h-8 border-t border-r border-gold/20" />
        </div>
      </div>

    </section>
  )
}
