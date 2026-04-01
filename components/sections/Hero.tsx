"use client"

import { motion } from "framer-motion"
import Link from "next/link"

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-void">
      <div className="grid lg:grid-cols-[55%_45%] min-h-screen">
        
        {/* LEFT PANEL */}
        <div className="relative bg-void flex flex-col justify-between p-12 lg:p-20 border-r border-brand-white/[0.06]">
          <div className="flex flex-col gap-8">
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="font-display font-medium text-[10px] tracking-[4px] uppercase text-gold">
                California Compliance Intelligence
              </span>
            </motion.div>

            <motion.div 
              className="w-8 h-[1px] bg-gold"
              initial={{ width: 0 }}
              animate={{ width: 32 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />

            <motion.h1
              className="font-display font-black text-[clamp(64px,10vw,100px)] leading-[0.88] tracking-[2px] uppercase text-parchment"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              PROT<span className="text-crimson">E</span>KON
            </motion.h1>
          </div>

          <div className="flex flex-col gap-7 my-12 lg:my-0">
            <motion.p
              className="font-display font-light text-[clamp(22px,3vw,26px)] tracking-[3px] uppercase text-gold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              Compliance, Commanded.
            </motion.p>

            <motion.p
              className="font-sans text-[13px] font-light text-steel leading-[1.75] max-w-[320px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              The compliance command platform for California businesses. 
              IIPP documents. SB 553 plans. Incident logging. Regulatory monitoring. 
              All managed. All delivered.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 mt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              <Link
                href="/signup"
                className="inline-flex items-center font-display font-semibold text-[10px] tracking-[3px] uppercase text-parchment bg-crimson px-6 py-4 hover:brightness-110 transition-all"
              >
                Start Compliance Plan
              </Link>
              
              <Link
                href="#sample"
                className="inline-flex items-center font-display font-medium text-[10px] tracking-[3px] uppercase text-gold border-b border-gold/40 pb-1 hover:border-gold transition-colors"
              >
                Download Sample Report
              </Link>
            </motion.div>
          </div>

          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.4 }}
          >
            <div className="w-5 h-[1px] bg-brand-white/15" />
            <span className="font-display text-[9px] tracking-[3px] uppercase text-brand-white/15">
              Managed Compliance · California · 2025
            </span>
          </motion.div>
        </div>

        {/* RIGHT PANEL */}
        <div className="relative bg-midnight flex flex-col overflow-hidden min-h-[50vh] lg:min-h-0">
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(201,168,76,1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,1) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />

          <div className="flex-1 flex items-center justify-center relative">
            <div className="absolute opacity-[0.02] pointer-events-none">
              <svg viewBox="0 0 48 84" className="w-[400px] h-[700px]">
                <rect x="0" y="0" width="13" height="84" fill="#FAFAF8" />
                <rect x="13" y="0" width="35" height="13" fill="#FAFAF8" />
                <rect x="35" y="13" width="13" height="27" fill="#FAFAF8" />
                <rect x="0" y="40" width="48" height="10" fill="#FAFAF8" />
              </svg>
            </div>

            <motion.div
              className="relative z-10 flex flex-col items-center gap-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="absolute -inset-20">
                <motion.div 
                  className="absolute inset-0 border border-crimson/10 rounded-full"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.1, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div 
                  className="absolute -inset-8 border border-gold/5 rounded-full"
                  animate={{ scale: [1, 1.08, 1], opacity: [0.2, 0.05, 0.2] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                />
              </div>

              <svg viewBox="0 0 48 84" className="w-[100px] h-[175px] relative z-10">
                <motion.rect 
                  x="0" y="0" width="13" height="84" 
                  fill="#FAFAF8"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  style={{ transformOrigin: "top" }}
                />
                <motion.rect 
                  x="13" y="0" width="35" height="13" 
                  fill="#FAFAF8"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.4, delay: 1 }}
                  style={{ transformOrigin: "left" }}
                />
                <motion.rect 
                  x="35" y="13" width="13" height="27" 
                  fill="#FAFAF8"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.4, delay: 1.2 }}
                  style={{ transformOrigin: "top" }}
                />
                <motion.rect 
                  x="0" y="40" width="48" height="10" 
                  fill="#C41230"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5, delay: 1.4 }}
                  style={{ transformOrigin: "left" }}
                />
              </svg>

              <motion.span
                className="font-display font-semibold text-[16px] tracking-[8px] uppercase text-brand-white/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.6 }}
              >
                PROT<span className="text-crimson/60">E</span>KON
              </motion.span>
            </motion.div>
          </div>

          <motion.div 
            className="relative z-10 grid grid-cols-2 lg:grid-cols-4 border-t border-brand-white/[0.06]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.8 }}
          >
            {[
              { value: "$109.6M", label: "CA SMB Penalties" },
              { value: "44,742", label: "Target Violations" },
              { value: "48hrs", label: "First Delivery" },
              { value: "$7,229", label: "Avg Serious Fine" },
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                className={`p-5 lg:p-6 ${i < 3 ? "border-r border-brand-white/[0.06]" : ""} ${i < 2 ? "border-b lg:border-b-0 border-brand-white/[0.06]" : ""}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 2 + i * 0.1 }}
              >
                <span className="font-display font-black text-[22px] lg:text-[28px] text-gold block leading-none">
                  {stat.value}
                </span>
                <span className="font-display text-[8px] tracking-[2px] uppercase text-steel mt-2 block">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </motion.div>

          <div className="absolute top-6 left-6 w-8 h-8 border-t border-l border-gold/15" />
          <div className="absolute top-6 right-6 w-8 h-8 border-t border-r border-gold/15" />
        </div>
      </div>

      <motion.div 
        className="absolute bottom-0 left-0 right-0 z-20 bg-void border-t border-brand-white/[0.04]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
      >
        <div className="flex items-center justify-between px-12 lg:px-20 py-4">
          <div className="flex items-center gap-6">
            <span className="font-display text-[9px] tracking-[3px] uppercase text-steel/50">
              Trusted by 500+ California businesses
            </span>
            <div className="hidden md:flex items-center gap-3">
              {["SOC 2", "Cal/OSHA", "SB 553"].map((badge) => (
                <span key={badge} className="font-display text-[8px] tracking-[2px] uppercase text-gold/40 px-2 py-1 border border-gold/15">
                  {badge}
                </span>
              ))}
            </div>
          </div>
          
          <button
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
            className="font-display text-[9px] tracking-[2px] uppercase text-steel/40 hover:text-gold transition-colors flex items-center gap-2"
          >
            Scroll
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-current">
              <path d="M6 2v8M3 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </motion.div>
    </section>
  )
}
