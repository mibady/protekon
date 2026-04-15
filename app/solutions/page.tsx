"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import Nav from "@/components/layout/Nav"
import Footer from "@/components/layout/Footer"
import { ShieldCheck, HardHat, FirstAid, Buildings, FileText, Bell, ClipboardText, ChartLine } from "@phosphor-icons/react"

const solutions = [
  {
    icon: ShieldCheck,
    title: "Compliance Suite",
    subtitle: "SB 553 + Cal/OSHA",
    description: "Complete workplace safety compliance. IIPP documents, SB 553 Workplace Violence Prevention Plans, incident logging, and real-time regulatory monitoring.",
    features: ["IIPP Documents", "SB 553 WVPP", "Incident Logging", "Reg Monitoring"],
    href: "/solutions/compliance-suite",
    color: "#C41230",
  },
  {
    icon: HardHat,
    title: "Protekon for Construction",
    subtitle: "CSLB + Site Safety",
    description: "Specialized compliance for California construction. CSLB licensing compliance, site safety plans, toolbox talks, and subcontractor documentation.",
    features: ["CSLB Compliance", "Site Safety Plans", "Toolbox Talks", "Sub Documentation"],
    href: "/solutions/construction",
    color: "#C9A84C",
  },
  {
    icon: FirstAid,
    title: "Protekon for Healthcare",
    subtitle: "Cal/OSHA Healthcare",
    description: "Healthcare-specific compliance solutions. Aerosol transmissible disease plans, bloodborne pathogen programs, and patient handling protocols.",
    features: ["ATD Plans", "BBP Programs", "Patient Handling", "Sharps Safety"],
    href: "/solutions/healthcare",
    color: "#C41230",
  },
  {
    icon: Buildings,
    title: "Protekon for Real Estate",
    subtitle: "Habitability Compliance",
    description: "Property management compliance. Habitability certifications, lead paint disclosures, mold remediation protocols, and tenant safety programs.",
    features: ["Hab Certifications", "Lead Disclosures", "Mold Protocols", "Tenant Safety"],
    href: "/solutions/real-estate",
    color: "#C9A84C",
  },
]

const howItWorks = [
  {
    icon: ChartLine,
    title: "The Protekon Engine",
    description: "PROTEKON analyzes real Cal/OSHA enforcement data to identify your specific risk profile and generate tailored compliance documentation.",
  },
  {
    icon: FileText,
    title: "Delivery Model",
    description: "No software to learn. Documents delivered to your inbox on a recurring schedule. Weekly summaries, monthly reports, quarterly reviews, annual packages.",
  },
  {
    icon: ClipboardText,
    title: "Security & Data",
    description: "SOC 2 Type II certified. All PII stripped from incident logs. End-to-end encryption. Your compliance data never leaves our secure infrastructure.",
  },
  {
    icon: Bell,
    title: "API & Integrations",
    description: "Connect PROTEKON to your existing systems. Zapier, webhooks, and direct API access for enterprise customers. Automated workflows at scale.",
  },
]

export default function SolutionsPage() {
  return (
    <main className="min-h-screen bg-void">
      <Nav />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-8 border-b border-brand-white/[0.06] relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero/compliance-night.jpg"
            alt="Business owner managing compliance"
            fill
            className="object-cover opacity-10"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-void via-void/90 to-void" />
        </div>
        <div className="max-w-[1200px] mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="font-display text-[12px] tracking-[4px] uppercase text-gold">
              Solutions
            </span>
            <h1 className="font-display font-black text-[clamp(40px,6vw,64px)] leading-[0.92] text-parchment mt-4 mb-6">
              COMPLIANCE VERTICALS
            </h1>
            <p className="font-sans text-[16px] text-steel max-w-[600px] leading-relaxed">
              Industry-specific compliance solutions built on the Protekon Engine. 
              Each vertical is tailored to the exact regulations, risks, and documentation requirements of your business.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-20 px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {solutions.map((solution, i) => (
              <motion.div
                key={solution.title}
                className="group relative bg-midnight border border-brand-white/[0.06] p-8 hover:border-brand-white/[0.12] transition-colors"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                {/* Color accent */}
                <div 
                  className="absolute top-0 left-0 w-1 h-full"
                  style={{ backgroundColor: solution.color }}
                />
                
                <div className="flex items-start gap-4 mb-6">
                  <div 
                    className="w-12 h-12 flex items-center justify-center"
                    style={{ backgroundColor: `${solution.color}15` }}
                  >
                    <solution.icon size={24} weight="bold" style={{ color: solution.color }} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-[20px] text-parchment">
                      {solution.title}
                    </h3>
                    <span className="font-display text-[12px] tracking-[2px] uppercase text-gold">
                      {solution.subtitle}
                    </span>
                  </div>
                </div>

                <p className="font-sans text-[14px] text-steel leading-relaxed mb-6">
                  {solution.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {solution.features.map((feature) => (
                    <span 
                      key={feature}
                      className="font-display text-[9px] tracking-[2px] uppercase text-steel px-3 py-1 border border-brand-white/[0.08]"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                <Link
                  href={solution.href}
                  className="inline-flex items-center font-display font-semibold text-[12px] tracking-[3px] uppercase text-gold hover:text-parchment transition-colors"
                >
                  Learn More
                  <svg className="ml-2 w-4 h-4" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-8 bg-midnight border-y border-brand-white/[0.06]">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="font-display text-[12px] tracking-[4px] uppercase text-gold">
              Platform
            </span>
            <h2 className="font-display font-black text-[clamp(32px,5vw,48px)] leading-[0.92] text-parchment mt-4">
              HOW IT WORKS
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, i) => (
              <motion.div
                key={item.title}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border border-gold/20">
                  <item.icon size={28} weight="light" className="text-gold" />
                </div>
                <h3 className="font-display font-bold text-[14px] tracking-[2px] uppercase text-parchment mb-3">
                  {item.title}
                </h3>
                <p className="font-sans text-[13px] text-steel leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-8">
        <div className="max-w-[800px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display font-black text-[clamp(28px,4vw,40px)] leading-[0.92] text-parchment mb-6">
              READY TO COMMAND YOUR COMPLIANCE?
            </h2>
            <p className="font-sans text-[16px] text-steel mb-8">
              Start with a free compliance risk assessment. No commitment required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center font-display font-semibold text-[11px] tracking-[3px] uppercase text-parchment bg-crimson px-8 py-4 hover:brightness-110 transition-all"
              >
                Get Started
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center font-display font-semibold text-[11px] tracking-[3px] uppercase text-parchment border border-brand-white/20 px-8 py-4 hover:border-gold hover:text-gold transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
