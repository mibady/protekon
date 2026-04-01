"use client"
// Hero Component - Last updated: 2026-03-31T12:00:00Z

import { motion } from "framer-motion"
import Link from "next/link"

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-void">
      {/* 55/45 Grid Split */}
      <div className="grid lg:grid-cols-[55%_45%] min-h-screen">
        {/* LEFT PANEL - Content */}
        <div className="relative flex flex-col justify-center px-8 lg:px-16 py-20 lg:py-0 bg-void">
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
            {/* Headline */}
            <motion.h1
              className="font-display font-black text-[clamp(36px,6vw,64px)] leading-[0.95] tracking-tight text-brand-white mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              CALIFORNIA WORKPLACE COMPLIANCE.{" "}
              <span className="text-gold">DONE FOR YOU.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              className="font-sans text-[17px] leading-[1.7] text-fog mb-10 max-w-[480px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Stop waiting for an inspection to find out you are out of compliance. 
              PROTEKON writes your IIPP, builds your SB 553 plan, logs your incidents, 
              and monitors every regulation change. You run your business. We handle the rest.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
            >
              <Link
                href="/signup"
                className="inline-flex items-center justify-center font-display font-semibold text-[11px] tracking-[3px] uppercase text-brand-white bg-crimson px-8 py-4 border-l-[3px] border-brand-white/30 hover:brightness-110 transition-all"
              >
                Start Your Compliance Plan
              </Link>
              <Link
                href="#sample"
                className="inline-flex items-center justify-center font-display font-semibold text-[11px] tracking-[3px] uppercase text-brand-white/70 px-8 py-4 border border-brand-white/15 hover:border-gold hover:text-gold transition-colors"
              >
                Download Sample Report
              </Link>
            </motion.div>

            {/* Microcopy */}
            <motion.p
              className="font-sans text-[12px] text-steel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              Zero software. First document delivered in 48 hours. Cancel anytime.
            </motion.p>
          </div>
        </div>

        {/* RIGHT PANEL - Visual */}
        <div className="relative bg-midnight flex flex-col overflow-hidden min-h-[50vh] lg:min-h-0">
          {/* Grid lines */}
          <div className="absolute inset-0">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`h-${i}`}
                className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/10 to-transparent"
                style={{ top: `${(i + 1) * 14}%` }}
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 1, delay: 0.8 + i * 0.1 }}
              />
            ))}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={`v-${i}`}
                className="absolute top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-crimson/10 to-transparent"
                style={{ left: `${(i + 1) * 20}%` }}
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ duration: 1, delay: 1 + i * 0.1 }}
              />
            ))}
          </div>

          {/* Radial glow */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 70% 60% at 50% 40%, rgba(196,18,48,0.06) 0%, transparent 60%)`
            }}
          />

          {/* Central P-Mark */}
          <div className="flex-1 flex items-center justify-center relative">
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              {/* Pulsing rings */}
              <motion.div 
                className="absolute -inset-10 border border-crimson/20 rounded-full"
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.1, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.div 
                className="absolute -inset-16 border border-gold/10 rounded-full"
                animate={{ scale: [1, 1.08, 1], opacity: [0.2, 0.05, 0.2] }}
                transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
              />

              {/* P-mark */}
              <svg viewBox="0 0 48 84" className="w-[80px] h-[140px]">
                <motion.rect 
                  x="0" y="0" width="13" height="84" 
                  fill="#FAFAF8"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  style={{ transformOrigin: "top" }}
                />
                <motion.rect 
                  x="13" y="0" width="35" height="13" 
                  fill="#FAFAF8"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.4, delay: 0.9 }}
                  style={{ transformOrigin: "left" }}
                />
                <motion.rect 
                  x="35" y="13" width="13" height="27" 
                  fill="#FAFAF8"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.3, delay: 1.1 }}
                  style={{ transformOrigin: "top" }}
                />
                <motion.rect 
                  x="0" y="40" width="48" height="10" 
                  fill="#C41230"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.4, delay: 1.3 }}
                  style={{ transformOrigin: "left" }}
                />
              </svg>
            </motion.div>
          </div>

          {/* Stats Grid - Bottom */}
          <motion.div 
            className="relative z-10 border-t border-brand-white/[0.06]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.5 }}
          >
            <div className="grid grid-cols-2 lg:grid-cols-4">
              {[
                { value: '$109.6M', label: 'CA SMB Penalties' },
                { value: '44,742', label: 'Target Violations' },
                { value: '48hrs', label: 'First Delivery' },
                { value: '$7,229', label: 'Avg Serious Fine' },
              ].map((stat, i) => (
                <div 
                  key={stat.label}
                  className={`p-5 lg:p-6 ${i < 3 ? 'border-r border-brand-white/[0.06]' : ''} ${i < 2 ? 'border-b lg:border-b-0 border-brand-white/[0.06]' : ''}`}
                >
                  <span className="font-display font-black text-[22px] lg:text-[26px] text-gold block leading-none">
                    {stat.value}
                  </span>
                  <span className="font-display text-[8px] tracking-[2px] uppercase text-steel mt-2 block">
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

      {/* Bottom Bar */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 bg-void border-t border-brand-white/[0.06] py-4 px-8 lg:px-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
      >
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <span className="font-display text-[9px] tracking-[3px] uppercase text-steel">
            Trusted by 500+ California businesses
          </span>
          <div className="flex items-center gap-3">
            {['SOC 2', 'OSHA', 'Cal/OSHA', 'CSLB'].map((badge) => (
              <span key={badge} className="font-display text-[8px] tracking-[2px] uppercase text-gold/60 px-3 py-1 border border-gold/20">
                {badge}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
