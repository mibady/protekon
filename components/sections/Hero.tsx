"use client"

// PROTEKON Hero Section - Landing Page
import { motion } from "framer-motion"
import { CaretDown, ShieldCheck, FileText, Bell } from "@phosphor-icons/react"
import Link from "next/link"

const stats = [
  { value: "$109.6M", label: "IN PENALTIES TO CA SMBS" },
  { value: "44,742", label: "VIOLATIONS IN TARGET MARKET" },
  { value: "$7,229", label: "AVG SERIOUS VIOLATION FINE" },
]

const features = [
  { icon: FileText, text: "IIPP + SB 553 Documents" },
  { icon: ShieldCheck, text: "Incident Log Management" },
  { icon: Bell, text: "Regulatory Monitoring" },
]

export default function Hero() {
  return (
    <section className="relative min-h-[100dvh] bg-void overflow-hidden">
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(250,250,248,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(250,250,248,1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Gradient overlay creating depth */}
      <div 
        className="absolute inset-0 z-[1]"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 80% 50%, rgba(11,29,58,0.4) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 20% 100%, rgba(196,18,48,0.08) 0%, transparent 40%)
          `
        }}
      />

      {/* Giant P-Mark Watermark */}
      <motion.div
        className="absolute z-[2] pointer-events-none hidden lg:block"
        style={{ 
          right: -100, 
          top: '50%', 
          transform: 'translateY(-50%)',
        }}
        animate={{ scale: [1, 1.015, 1] }}
        transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
      >
        <svg viewBox="0 0 48 84" className="w-[500px] h-[875px] opacity-[0.03]">
          <rect x="0" y="0" width="13" height="84" fill="#FAFAF8" />
          <rect x="13" y="0" width="35" height="13" fill="#FAFAF8" />
          <rect x="35" y="13" width="13" height="27" fill="#FAFAF8" />
          <rect x="0" y="40" width="48" height="10" fill="#C41230" />
        </svg>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-8 min-h-[100dvh] flex flex-col justify-center pt-28 pb-20">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          {/* Left Content - Main */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            {/* Eyebrow */}
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-8 h-[2px] bg-gold" />
              <span className="font-display font-semibold text-[11px] tracking-[4px] uppercase text-crimson">
                California Compliance Intelligence
              </span>
            </motion.div>

            {/* Headline */}
            <div className="flex flex-col gap-1">
              <motion.h1
                className="font-display font-black text-[clamp(52px,8vw,88px)] leading-[0.9] tracking-[-2px] text-parchment"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
              >
                Compliance
              </motion.h1>
              <motion.h1
                className="font-display font-black text-[clamp(52px,8vw,88px)] leading-[0.9] tracking-[-2px]"
                style={{
                  WebkitTextStroke: '1.5px #C41230',
                  WebkitTextFillColor: 'transparent',
                }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
              >
                Managed.
              </motion.h1>
              <motion.h1
                className="font-display font-black text-[clamp(52px,8vw,88px)] leading-[0.9] tracking-[-2px] text-gold"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.3 }}
              >
                Delivered.
              </motion.h1>
            </div>

            {/* Subheadline */}
            <motion.p
              className="font-sans text-[18px] leading-[1.8] text-fog max-w-[520px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              Stop waiting for an inspection to find out you&apos;re out of compliance. 
              PROTEKON writes your IIPP, builds your SB 553 plan, logs your incidents, 
              and monitors every regulation change. You run your business. We handle the rest.
            </motion.p>

            {/* Feature Pills */}
            <motion.div
              className="flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              {features.map((feature, i) => (
                <div 
                  key={feature.text}
                  className="flex items-center gap-2 px-4 py-2 border border-steel/20 bg-midnight/30"
                >
                  <feature.icon size={14} weight="bold" className="text-gold" />
                  <span className="font-display font-medium text-[10px] tracking-[2px] uppercase text-parchment/80">
                    {feature.text}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* CTA Row */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 mt-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <motion.div
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/signup"
                  className="group relative inline-flex items-center font-display font-semibold text-[11px] tracking-[3px] uppercase text-parchment bg-crimson px-8 py-4 overflow-hidden"
                >
                  <span className="relative z-10">Start Your Compliance Plan</span>
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-crimson to-[#a01028]"
                    initial={{ x: "100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              </motion.div>
              
              <Link
                href="#sample"
                className="inline-flex items-center font-display font-semibold text-[11px] tracking-[3px] uppercase text-steel hover:text-gold px-8 py-4 border border-steel/20 hover:border-gold/50 transition-all duration-300"
              >
                Download Sample Report
              </Link>
            </motion.div>

            {/* Small print */}
            <motion.p
              className="font-sans text-[13px] text-steel/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85 }}
            >
              Zero software. First document delivered in 48 hours. Cancel anytime.
            </motion.p>
          </div>

          {/* Right Content - Stats Card */}
          <motion.div 
            className="lg:col-span-5"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <div className="relative">
              {/* Stats Card */}
              <div className="bg-midnight/60 backdrop-blur-sm border border-brand-white/[0.06] p-8 lg:p-10">
                {/* Card header */}
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-brand-white/[0.06]">
                  <div className="w-2 h-2 bg-crimson" />
                  <span className="font-display font-semibold text-[10px] tracking-[3px] uppercase text-steel">
                    California Enforcement Data
                  </span>
                </div>

                {/* Stats */}
                <div className="flex flex-col gap-8">
                  {stats.map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      className="flex flex-col"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                    >
                      <span className="font-display font-black text-[42px] lg:text-[52px] text-gold leading-none">
                        {stat.value}
                      </span>
                      <span className="font-display font-medium text-[9px] tracking-[2px] uppercase text-steel mt-2">
                        {stat.label}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Card footer */}
                <div className="mt-8 pt-6 border-t border-brand-white/[0.06]">
                  <p className="font-sans text-[12px] text-steel/60 leading-relaxed">
                    73,960 Cal/OSHA citations. Scraped. Analyzed. Applied to your business.
                  </p>
                </div>
              </div>

              {/* Decorative accent */}
              <div className="absolute -top-2 -right-2 w-16 h-16 border-t-2 border-r-2 border-crimson/30" />
              <div className="absolute -bottom-2 -left-2 w-16 h-16 border-b-2 border-l-2 border-gold/20" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom trust bar */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 z-10 border-t border-brand-white/[0.04] bg-void/80 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <span className="font-display text-[10px] tracking-[3px] uppercase text-steel/60">
              Trusted by 500+ California businesses
            </span>
            <div className="hidden md:flex items-center gap-3">
              {['SOC 2', 'Cal/OSHA', 'SB 553'].map((badge) => (
                <span key={badge} className="font-display text-[9px] tracking-[2px] uppercase text-gold/50 px-3 py-1.5 border border-gold/15">
                  {badge}
                </span>
              ))}
            </div>
          </div>
          
          {/* Scroll Indicator */}
          <motion.button
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
            className="flex items-center gap-2 text-steel/50 hover:text-gold transition-colors cursor-pointer"
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="font-display text-[10px] tracking-[2px] uppercase">Explore</span>
            <CaretDown size={14} weight="bold" />
          </motion.button>
        </div>
      </motion.div>
    </section>
  )
}
