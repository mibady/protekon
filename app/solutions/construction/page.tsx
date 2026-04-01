"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Nav from "@/components/layout/Nav"
import Footer from "@/components/layout/Footer"
import { HardHat, FileText, Users, Wrench, Check, ArrowRight } from "@phosphor-icons/react"

const features = [
  {
    icon: HardHat,
    title: "CSLB Compliance",
    description: "License requirements, bond documentation, and workers comp certificates. Always current, always compliant.",
  },
  {
    icon: FileText,
    title: "Site Safety Plans",
    description: "Project-specific safety plans for every job site. Customized to your scope of work and hazards.",
  },
  {
    icon: Users,
    title: "Toolbox Talks",
    description: "Weekly safety meeting topics delivered to your inbox. Documentation included.",
  },
  {
    icon: Wrench,
    title: "Sub Documentation",
    description: "Subcontractor qualification packages. Insurance verification and compliance tracking.",
  },
]

const stats = [
  { value: "18,234", label: "Construction Violations (2023)" },
  { value: "$8,420", label: "Average Fine" },
  { value: "12,400+", label: "CA Contractors" },
  { value: "#1", label: "Most Cited Industry" },
]

export default function ConstructionPage() {
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
              Construction Shield
            </span>
            <h1 className="font-display font-black text-[clamp(36px,5vw,56px)] leading-[0.92] text-parchment mt-4 mb-6">
              CSLB + SITE SAFETY COMPLIANCE
            </h1>
            <p className="font-sans text-[16px] text-steel leading-relaxed mb-8">
              California construction faces the highest enforcement rates of any industry. 
              Construction Shield covers CSLB licensing, Cal/OSHA site safety, subcontractor documentation, 
              and project-specific safety plans.
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

      {/* Stats */}
      <section className="bg-crimson">
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <div 
              key={stat.label}
              className={`p-8 text-center ${i < 3 ? "border-r border-parchment/20" : ""}`}
            >
              <span className="font-display font-black text-[32px] text-parchment block">
                {stat.value}
              </span>
              <span className="font-display text-[9px] tracking-[2px] uppercase text-parchment/70">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-8 bg-midnight">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="font-display font-bold text-[12px] tracking-[4px] uppercase text-gold mb-12 text-center">
            Construction-Specific Compliance
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
            PROTECT YOUR CONTRACTOR LICENSE
          </h2>
          <p className="font-sans text-[16px] text-steel mb-8">
            Don&apos;t risk your CSLB license over a compliance violation. Start with Construction Shield.
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
