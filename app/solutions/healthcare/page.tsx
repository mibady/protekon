"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Nav from "@/components/layout/Nav"
import Footer from "@/components/layout/Footer"
import { FirstAid, FileText, Syringe, Heart, Check, ArrowRight } from "@phosphor-icons/react"

const features = [
  {
    icon: FirstAid,
    title: "ATD Plans",
    description: "Aerosol Transmissible Disease exposure control plans. Required for all healthcare settings.",
  },
  {
    icon: Syringe,
    title: "BBP Programs",
    description: "Bloodborne Pathogen exposure control. Sharps injury logs and training documentation.",
  },
  {
    icon: Heart,
    title: "Patient Handling",
    description: "Safe patient handling programs. Lift equipment requirements and ergonomic assessments.",
  },
  {
    icon: FileText,
    title: "Sharps Safety",
    description: "Sharps injury prevention program. Engineering controls and work practice documentation.",
  },
]

export default function HealthcarePage() {
  return (
    <main className="min-h-screen bg-void">
      <Nav />
      
      {/* Hero */}
      <section className="pt-32 pb-20 px-8">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-[700px]"
          >
            <span className="font-display text-[12px] tracking-[4px] uppercase text-crimson">
              Healthcare Shield
            </span>
            <h1 className="font-display font-black text-[clamp(36px,5vw,56px)] leading-[0.92] text-parchment mt-4 mb-6">
              CAL/OSHA HEALTHCARE COMPLIANCE
            </h1>
            <p className="font-sans text-[16px] text-steel leading-relaxed mb-8">
              Healthcare facilities face unique Cal/OSHA requirements. Healthcare Shield covers aerosol 
              transmissible disease plans, bloodborne pathogen programs, patient handling, and sharps safety.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center font-display font-semibold text-[11px] tracking-[3px] uppercase text-parchment bg-crimson px-8 py-4 hover:brightness-110 transition-all"
              >
                Get Started
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center font-display font-semibold text-[11px] tracking-[3px] uppercase text-parchment border border-brand-white/20 px-8 py-4 hover:border-gold hover:text-gold transition-colors"
              >
                Talk to Sales
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-8 bg-midnight border-y border-brand-white/[0.06]">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-crimson/10">
                  <feature.icon size={28} weight="bold" className="text-crimson" />
                </div>
                <h3 className="font-display font-bold text-[14px] text-parchment mb-2">
                  {feature.title}
                </h3>
                <p className="font-sans text-[13px] text-steel leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Unified Pricing */}
      <section className="py-24 px-6 lg:px-8 bg-midnight">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-black text-[clamp(28px,4vw,42px)] text-parchment mb-4">
              One price for managed compliance. Every domain.
            </h2>
            <p className="font-sans text-[16px] text-fog max-w-[700px] mx-auto">
              PROTEKON uses one pricing structure across all compliance verticals — SB 553, Construction, Healthcare,
              Manufacturing, Retail, Transportation, Wholesale, Hospitality, Agriculture, and Real Estate.
              You pick your domain during intake. The service level is the same.
            </p>
          </div>

          {/* 3 tier cards in a row */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Core */}
            <div className="bg-void border border-brand-white/[0.06] p-6">
              <h3 className="font-display font-bold text-[20px] text-parchment mb-1">Core</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-display font-black text-[32px] text-gold">$597</span>
                <span className="text-steel text-[14px]">/month</span>
              </div>
              <p className="text-steel text-[12px] mb-3">+ $297 one-time setup</p>
              <p className="text-fog text-[14px]">Single location, 10–50 employees, full managed compliance for one vertical.</p>
            </div>

            {/* Professional */}
            <div className="bg-void border border-crimson/30 p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="font-display font-semibold text-[9px] tracking-[2px] uppercase text-parchment bg-crimson px-3 py-1">Most Popular</span>
              </div>
              <h3 className="font-display font-bold text-[20px] text-parchment mb-1">Professional</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-display font-black text-[32px] text-gold">$897</span>
                <span className="text-steel text-[14px]">/month</span>
              </div>
              <p className="text-steel text-[12px] mb-3">+ $397 one-time setup</p>
              <p className="text-fog text-[14px]">50–150 employees, quarterly reviews, vertical-specific tracking, priority support.</p>
            </div>

            {/* Multi-Site */}
            <div className="bg-void border border-brand-white/[0.06] p-6">
              <h3 className="font-display font-bold text-[20px] text-parchment mb-1">Multi-Site</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-display font-black text-[32px] text-gold">$1,297</span>
                <span className="text-steel text-[14px]">/month</span>
              </div>
              <p className="text-steel text-[12px] mb-3">+ $597 one-time setup</p>
              <p className="text-fog text-[14px]">2+ locations, per-site documentation, consolidated reporting, monthly review call.</p>
            </div>
          </div>

          {/* Add-on note + CTAs */}
          <div className="text-center">
            <p className="text-fog text-[15px] mb-8">
              Need healthcare compliance plus another compliance area? Add any vertical for <span className="text-gold font-semibold">+$397/month</span>. No additional setup fee.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="inline-flex items-center justify-center gap-2 bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[3px] uppercase px-8 py-4 hover:bg-crimson/90 transition-colors">
                Start My Healthcare Compliance
                <ArrowRight size={14} weight="bold" />
              </Link>
              <Link href="/pricing" className="inline-flex items-center justify-center gap-2 border border-brand-white/[0.1] text-parchment font-display font-semibold text-[11px] tracking-[3px] uppercase px-8 py-4 hover:border-gold/50 hover:text-gold transition-colors">
                See Full Pricing
              </Link>
            </div>
            <p className="text-steel text-[12px] mt-4">Setup fee + first month at sign-up. Cancel anytime after month 3. 48-hour delivery guarantee.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-8">
        <div className="max-w-[800px] mx-auto text-center">
          <h2 className="font-display font-black text-[clamp(28px,4vw,40px)] leading-[0.92] text-parchment mb-6">
            PROTECT YOUR HEALTHCARE PRACTICE
          </h2>
          <p className="font-sans text-[16px] text-steel mb-8">
            Healthcare compliance is complex. Let PROTEKON manage it for you.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center font-display font-semibold text-[11px] tracking-[3px] uppercase text-parchment bg-crimson px-8 py-4 hover:brightness-110 transition-all"
          >
            Get Started
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
