"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Nav from "@/components/layout/Nav"
import Footer from "@/components/layout/Footer"
import { ShieldCheck, FileText, Bell, ClipboardText, Check, ArrowRight } from "@phosphor-icons/react"

const features = [
  {
    icon: FileText,
    title: "IIPP Documents",
    description: "Complete Injury and Illness Prevention Programs tailored to your business. Meets 8 CCR 3203 requirements.",
  },
  {
    icon: ShieldCheck,
    title: "SB 553 WVPP",
    description: "Workplace Violence Prevention Plans compliant with the new California law. Ready before the deadline.",
  },
  {
    icon: ClipboardText,
    title: "Incident Logging",
    description: "OSHA 300/301 compliant incident logging with automatic PII stripping. Always audit-ready.",
  },
  {
    icon: Bell,
    title: "Reg Monitoring",
    description: "Real-time alerts when regulations change. Never be caught off guard by new requirements.",
  },
]

const included = [
  "Initial IIPP document creation",
  "SB 553 Workplace Violence Prevention Plan",
  "Hazard assessment documentation",
  "Employee training records template",
  "Incident investigation procedures",
  "Annual program review checklist",
  "Cal/OSHA inspection preparation guide",
  "Quarterly compliance summaries",
  "Regulatory change alerts",
  "Dedicated compliance advisor",
]

export default function ComplianceSuitePage() {
  return (
    <main className="min-h-screen bg-void">
      <Nav />
      
      {/* Hero */}
      <section className="pt-32 pb-20 px-8">
        <div className="max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="font-display text-[10px] tracking-[4px] uppercase text-crimson">
              Compliance Suite
            </span>
            <h1 className="font-display font-black text-[clamp(36px,5vw,56px)] leading-[0.92] text-parchment mt-4 mb-6">
              SB 553 + CAL/OSHA COMPLIANCE
            </h1>
            <p className="font-sans text-[16px] text-steel leading-relaxed mb-8">
              The complete workplace safety compliance solution for California businesses. 
              IIPP documents, SB 553 Workplace Violence Prevention Plans, incident logging, 
              and real-time regulatory monitoring. All managed. All delivered.
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

          <motion.div
            className="bg-midnight border border-brand-white/[0.06] p-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="font-display text-[10px] tracking-[4px] uppercase text-gold mb-4 block">
              Starting at
            </span>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="font-display font-black text-[48px] text-parchment">$299</span>
              <span className="font-display text-[14px] text-steel">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              {["Up to 25 employees", "All compliance documents", "Incident logging", "Reg monitoring"].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <Check size={16} className="text-gold" />
                  <span className="font-sans text-[14px] text-steel">{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/pricing"
              className="font-display text-[11px] tracking-[3px] uppercase text-gold hover:text-parchment transition-colors"
            >
              View all pricing options
              <ArrowRight size={14} className="inline ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-8 bg-midnight border-y border-brand-white/[0.06]">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="font-display font-bold text-[12px] tracking-[4px] uppercase text-gold mb-12 text-center">
            What&apos;s Included
          </h2>
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

      {/* Full List */}
      <section className="py-20 px-8">
        <div className="max-w-[800px] mx-auto">
          <h2 className="font-display font-black text-[clamp(24px,4vw,36px)] leading-[0.92] text-parchment mb-8 text-center">
            EVERYTHING YOU NEED
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {included.map((item, i) => (
              <motion.div
                key={item}
                className="flex items-center gap-3 p-4 bg-midnight border border-brand-white/[0.06]"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Check size={18} className="text-gold flex-shrink-0" />
                <span className="font-sans text-[14px] text-parchment">{item}</span>
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
              Need SB 553 plus another compliance area? Add any vertical for <span className="text-gold font-semibold">+$397/month</span>. No additional setup fee.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="inline-flex items-center justify-center gap-2 bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[3px] uppercase px-8 py-4 hover:bg-crimson/90 transition-colors">
                Start My SB 553 Compliance
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
      <section className="py-20 px-8 bg-crimson">
        <div className="max-w-[800px] mx-auto text-center">
          <h2 className="font-display font-black text-[clamp(28px,4vw,40px)] leading-[0.92] text-parchment mb-6">
            START YOUR COMPLIANCE PLAN TODAY
          </h2>
          <p className="font-sans text-[16px] text-parchment/80 mb-8">
            First documents delivered within 48 hours. No long-term contracts.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center font-display font-semibold text-[11px] tracking-[3px] uppercase text-crimson bg-parchment px-8 py-4 hover:bg-gold transition-colors"
          >
            Get Started
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
