"use client"

// Hero Section - PROTEKON Shield CaaS
import { motion, useScroll, useTransform } from "framer-motion"
import { CaretDown, ShieldCheck, Lightning, ChartLineUp } from "@phosphor-icons/react"
import Link from "next/link"
import { useRef } from "react"

const stats = [
  { value: "$109.6M", label: "CA SMB Penalties", icon: ChartLineUp },
  { value: "44,742", label: "Target Market Violations", icon: ShieldCheck },
  { value: "48hrs", label: "First Delivery", icon: Lightning },
]

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })
  
  const y = useTransform(scrollYProgress, [0, 1], [0, 200])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <section ref={containerRef} className="relative min-h-[100dvh] bg-void overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />
        {/* Radial gradient overlay */}
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 70% 40%, rgba(191,49,49,0.08) 0%, transparent 60%),
                         radial-gradient(ellipse 60% 50% at 20% 80%, rgba(201,168,76,0.05) 0%, transparent 50%)`
          }}
        />
      </div>

      {/* Giant P-Mark - Architectural Element */}
      <motion.div
        className="absolute -right-32 top-1/2 -translate-y-1/2 z-[1] pointer-events-none"
        style={{ y, opacity }}
      >
        <svg viewBox="0 0 48 84" className="w-[800px] h-[1400px]">
          <defs>
            <linearGradient id="pmark-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#BF3131" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#BF3131" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="13" height="84" fill="url(#pmark-gradient)" />
          <rect x="13" y="0" width="35" height="13" fill="url(#pmark-gradient)" />
          <rect x="35" y="13" width="13" height="27" fill="url(#pmark-gradient)" />
          <rect x="0" y="40" width="48" height="10" fill="url(#pmark-gradient)" />
        </svg>
      </motion.div>

      {/* Diagonal Accent Line */}
      <motion.div 
        className="absolute top-0 right-0 w-[1px] h-[70vh] bg-gradient-to-b from-crimson/0 via-crimson/40 to-crimson/0 origin-top"
        style={{ transform: 'rotate(25deg) translateX(200px)' }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
      />

      {/* Content - Full Width Centered */}
      <div className="relative z-10 min-h-[100dvh] flex flex-col">
        <div className="flex-1 flex items-center">
          <div className="w-full max-w-[1600px] mx-auto px-8 lg:px-16">
            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-0">
              {/* Left Column - Typography */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                {/* Eyebrow with animated line */}
                <motion.div
                  className="flex items-center gap-4"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <motion.div 
                    className="h-[2px] bg-crimson origin-left"
                    initial={{ width: 0 }}
                    animate={{ width: 48 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  />
                  <span className="font-display font-bold text-[11px] tracking-[5px] uppercase text-crimson">
                    California Compliance Intelligence
                  </span>
                </motion.div>

                {/* Main Headline - Massive Typography */}
                <div className="flex flex-col -space-y-2 lg:-space-y-4">
                  <div className="overflow-hidden">
                    <motion.h1
                      className="font-display font-black text-[clamp(56px,12vw,160px)] leading-[0.85] tracking-[-0.02em] text-parchment"
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      transition={{ type: "spring", stiffness: 50, damping: 15, delay: 0.2 }}
                    >
                      COMPLIANCE
                    </motion.h1>
                  </div>
                  
                  <div className="overflow-hidden flex items-baseline gap-4 lg:gap-8">
                    <motion.h1
                      className="font-display font-black text-[clamp(56px,12vw,160px)] leading-[0.85] tracking-[-0.02em]"
                      style={{
                        WebkitTextStroke: '1.5px rgba(250,250,248,0.4)',
                        WebkitTextFillColor: 'transparent',
                      }}
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      transition={{ type: "spring", stiffness: 50, damping: 15, delay: 0.35 }}
                    >
                      AS A
                    </motion.h1>
                    <motion.div
                      className="hidden lg:block h-[3px] flex-1 max-w-[200px] bg-gold/30"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.8, delay: 0.8 }}
                    />
                  </div>
                  
                  <div className="overflow-hidden">
                    <motion.h1
                      className="font-display font-black text-[clamp(56px,12vw,160px)] leading-[0.85] tracking-[-0.02em] text-gold"
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      transition={{ type: "spring", stiffness: 50, damping: 15, delay: 0.5 }}
                    >
                      SERVICE
                      <motion.span
                        className="inline-block text-crimson"
                        initial={{ opacity: 0, scale: 1.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.9 }}
                      >
                        .
                      </motion.span>
                    </motion.h1>
                  </div>
                </div>

                {/* Subheadline */}
                <motion.p
                  className="font-sans text-[18px] lg:text-[20px] leading-[1.7] text-fog/80 max-w-[600px] mt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                >
                  Shield CaaS transforms California&apos;s complex workplace safety regulations 
                  into a fully managed, recurring service. IIPP, SB 553, incident logging — 
                  <span className="text-parchment font-medium"> all done for you.</span>
                </motion.p>

                {/* CTA Row */}
                <motion.div
                  className="flex flex-col sm:flex-row gap-4 mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1, duration: 0.5 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href="/signup"
                      className="group relative inline-flex items-center gap-3 font-display font-bold text-[12px] tracking-[3px] uppercase text-parchment bg-crimson px-10 py-5 overflow-hidden"
                    >
                      <span className="relative z-10">Start Your Compliance Plan</span>
                      <motion.div 
                        className="absolute inset-0 bg-brand-white/10"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    </Link>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ borderColor: "#C9A84C" }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      href="#sample"
                      className="inline-flex items-center gap-3 font-display font-semibold text-[12px] tracking-[3px] uppercase text-fog hover:text-gold px-10 py-5 border border-steel/30 hover:border-gold transition-colors duration-300"
                    >
                      Download Sample Report
                    </Link>
                  </motion.div>
                </motion.div>

                {/* Microcopy */}
                <motion.p
                  className="font-sans text-[13px] text-steel mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3 }}
                >
                  No software to learn · First document in 48 hours · Cancel anytime
                </motion.p>
              </div>

              {/* Right Column - Stats */}
              <motion.div 
                className="lg:col-span-4 flex lg:flex-col items-start lg:items-end justify-start lg:justify-center gap-6 lg:gap-0 mt-8 lg:mt-0"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0, duration: 0.8 }}
              >
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    className="relative lg:py-8 lg:pr-8 lg:border-r border-steel/20 group"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 + i * 0.15 }}
                  >
                    {/* Hover accent */}
                    <motion.div 
                      className="absolute right-0 top-0 bottom-0 w-[2px] bg-gold origin-top"
                      initial={{ scaleY: 0 }}
                      whileHover={{ scaleY: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    
                    <div className="flex items-center gap-3 mb-2">
                      <stat.icon size={16} weight="bold" className="text-gold/60" />
                      <span className="font-display font-black text-[36px] lg:text-[48px] text-parchment leading-none">
                        {stat.value}
                      </span>
                    </div>
                    <p className="font-display font-medium text-[10px] tracking-[2px] uppercase text-steel lg:text-right">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <motion.div 
          className="relative z-10 border-t border-steel/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <div className="max-w-[1600px] mx-auto px-8 lg:px-16 py-6 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <span className="font-display text-[10px] tracking-[3px] uppercase text-steel">
                Trusted by 500+ California businesses
              </span>
              <div className="hidden md:flex items-center gap-4">
                {['SOC 2', 'OSHA', 'Cal/OSHA'].map((badge) => (
                  <span key={badge} className="font-display text-[9px] tracking-[2px] uppercase text-gold/60 px-3 py-1 border border-gold/20">
                    {badge}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Scroll Indicator */}
            <motion.div
              className="flex items-center gap-2 text-steel cursor-pointer"
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="font-display text-[10px] tracking-[2px] uppercase">Scroll</span>
              <CaretDown size={14} weight="bold" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
