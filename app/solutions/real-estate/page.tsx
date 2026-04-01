"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Nav from "@/components/layout/Nav"
import Footer from "@/components/layout/Footer"
import { Buildings, FileText, Drop, Warning, Check } from "@phosphor-icons/react"

const features = [
  {
    icon: Buildings,
    title: "Hab Certifications",
    description: "Habitability certification documentation. Meet California tenant safety requirements.",
  },
  {
    icon: FileText,
    title: "Lead Disclosures",
    description: "Lead-based paint disclosures and documentation for pre-1978 properties.",
  },
  {
    icon: Drop,
    title: "Mold Protocols",
    description: "Mold inspection and remediation documentation. Protect tenants and your liability.",
  },
  {
    icon: Warning,
    title: "Tenant Safety",
    description: "Security assessments and safety documentation. Meet SB 553 requirements for multi-family.",
  },
]

export default function RealEstatePage() {
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
            <span className="font-display text-[10px] tracking-[4px] uppercase text-gold">
              Real Estate Shield
            </span>
            <h1 className="font-display font-black text-[clamp(36px,5vw,56px)] leading-[0.92] text-parchment mt-4 mb-6">
              HABITABILITY COMPLIANCE
            </h1>
            <p className="font-sans text-[16px] text-steel leading-relaxed mb-8">
              Property management compliance made simple. Real Estate Shield covers habitability certifications, 
              lead paint disclosures, mold remediation protocols, and tenant safety programs.
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
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gold/10">
                  <feature.icon size={28} weight="bold" className="text-gold" />
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

      {/* CTA */}
      <section className="py-20 px-8">
        <div className="max-w-[800px] mx-auto text-center">
          <h2 className="font-display font-black text-[clamp(28px,4vw,40px)] leading-[0.92] text-parchment mb-6">
            PROTECT YOUR PROPERTIES
          </h2>
          <p className="font-sans text-[16px] text-steel mb-8">
            Don&apos;t risk tenant lawsuits over compliance issues. Start with Real Estate Shield.
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
