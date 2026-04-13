"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, ShieldCheck, MapPin, Globe } from "@phosphor-icons/react"

export default function ScoreLanding() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20 px-8">
        <div className="max-w-[900px] mx-auto text-center">
          <motion.div
            className="flex items-center justify-center gap-3 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-8 h-[2px] bg-gold" />
            <span className="font-display font-semibold text-[11px] tracking-[4px] uppercase text-crimson">
              Free Compliance Assessment
            </span>
            <div className="w-8 h-[2px] bg-gold" />
          </motion.div>

          <motion.h1
            className="font-display font-black text-[clamp(36px,5.5vw,64px)] leading-[0.95] text-parchment mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            How Compliant Is Your Business?{" "}
            <span className="text-gold">Find Out in 3 Minutes.</span>
          </motion.h1>

          <motion.p
            className="font-sans text-[18px] text-fog max-w-[680px] mx-auto leading-relaxed mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            A few straightforward questions plus industry-specific checks. Real enforcement
            data from Cal/OSHA and federal OSHA. Instant gap analysis with per-violation
            fine amounts. No login required.
          </motion.p>
        </div>
      </section>

      {/* Region Cards */}
      <section className="pb-24 px-8">
        <div className="max-w-[900px] mx-auto">
          <motion.p
            className="text-center font-display font-semibold text-[11px] tracking-[4px] uppercase text-steel mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Choose Your Jurisdiction
          </motion.p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* California */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Link
                href="/score/california"
                className="group block bg-midnight border border-brand-white/[0.06] hover:border-crimson/40 transition-all duration-300"
              >
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 flex items-center justify-center bg-crimson/10">
                      <MapPin size={24} weight="fill" className="text-crimson" />
                    </div>
                    <div>
                      <h2 className="font-display font-bold text-[20px] text-parchment">
                        California
                      </h2>
                      <span className="font-display text-[11px] tracking-[2px] uppercase text-gold">
                        Cal/OSHA + SB 553
                      </span>
                    </div>
                  </div>

                  <p className="font-sans text-[14px] text-fog leading-relaxed mb-6">
                    Cal/OSHA enforcement data, SB 553 Workplace Violence Prevention,
                    IIPP requirements, and California-specific citations. Covers
                    $164M+ in penalties from real Cal/OSHA enforcement data.
                  </p>

                  <div className="flex flex-col gap-2 mb-8">
                    {[
                      "Cal/OSHA Title 8 compliance checks",
                      "SB 553 WVPP assessment",
                      "California-specific fine amounts",
                      "CSLB + industry-specific requirements",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <ShieldCheck size={14} weight="fill" className="text-gold flex-shrink-0" />
                        <span className="font-sans text-[13px] text-steel">{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 font-display font-semibold text-[11px] tracking-[3px] uppercase text-crimson group-hover:text-parchment transition-colors">
                    Start California Assessment
                    <ArrowRight size={14} weight="bold" className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* National */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <Link
                href="/score/national"
                className="group block bg-midnight border border-brand-white/[0.06] hover:border-gold/40 transition-all duration-300"
              >
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 flex items-center justify-center bg-gold/10">
                      <Globe size={24} weight="fill" className="text-gold" />
                    </div>
                    <div>
                      <h2 className="font-display font-bold text-[20px] text-parchment">
                        National
                      </h2>
                      <span className="font-display text-[11px] tracking-[2px] uppercase text-gold">
                        Federal OSHA
                      </span>
                    </div>
                  </div>

                  <p className="font-sans text-[14px] text-fog leading-relaxed mb-6">
                    Federal OSHA enforcement data covering all 50 states. $1.04B+
                    in penalties since 2020, 116K+ employers cited, 431K+
                    enforcement records with 56% serious violation rate.
                  </p>

                  <div className="flex flex-col gap-2 mb-8">
                    {[
                      "Federal OSHA compliance checks",
                      "National enforcement benchmarks",
                      "Federal fine amounts per violation",
                      "27 industry verticals covered",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <ShieldCheck size={14} weight="fill" className="text-gold flex-shrink-0" />
                        <span className="font-sans text-[13px] text-steel">{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 font-display font-semibold text-[11px] tracking-[3px] uppercase text-gold group-hover:text-parchment transition-colors">
                    Start National Assessment
                    <ArrowRight size={14} weight="bold" className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>

          {/* Bottom note */}
          <motion.p
            className="text-center font-sans text-[13px] text-steel mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
          >
            Both assessments are free, anonymous, and take under 3 minutes.
            The PDF download is the only step that asks for an email.
          </motion.p>
        </div>
      </section>
    </>
  )
}
