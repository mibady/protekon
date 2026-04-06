"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Nav from "@/components/layout/Nav"
import Footer from "@/components/layout/Footer"
import { HardHat, Factory, ForkKnife, Hospital, Buildings, Truck, ShoppingCart, Wrench } from "@phosphor-icons/react"

const industries = [
  {
    icon: HardHat,
    name: "Construction",
    riskLevel: "Very High",
    enforcement: "Highest enforcement rate",
    description: "Residential, commercial, and industrial contractors face the highest enforcement rates in California. PROTEKON covers CSLB, Cal/OSHA, and site safety requirements.",
  },
  {
    icon: Factory,
    name: "Manufacturing",
    riskLevel: "Very High",
    enforcement: "Heavy penalty exposure",
    description: "Machine guarding, lockout/tagout, and process safety management. Our manufacturing vertical handles the complex compliance requirements of California factories.",
  },
  {
    icon: ForkKnife,
    name: "Hospitality",
    riskLevel: "High",
    enforcement: "Frequent inspections",
    description: "Restaurants, hotels, and entertainment venues. From kitchen safety to guest protection, PROTEKON manages your full compliance stack.",
  },
  {
    icon: Hospital,
    name: "Healthcare",
    riskLevel: "Very High",
    enforcement: "Strictest penalties per violation",
    description: "Clinics, dental offices, and care facilities. Bloodborne pathogens, aerosol transmissible diseases, and patient handling compliance.",
  },
  {
    icon: Buildings,
    name: "Real Estate",
    riskLevel: "Moderate",
    enforcement: "Growing enforcement",
    description: "Property management, development, and maintenance. Lead paint, habitability, and tenant safety requirements managed automatically.",
  },
  {
    icon: Truck,
    name: "Logistics",
    riskLevel: "High",
    enforcement: "Significant penalty exposure",
    description: "Warehousing, distribution, and transportation. Forklift safety, ergonomics, and fleet compliance for California logistics operations.",
  },
  {
    icon: ShoppingCart,
    name: "Retail",
    riskLevel: "Moderate",
    enforcement: "High volume of inspections",
    description: "Stores, outlets, and distribution centers. Slip and fall prevention, ladder safety, and workplace violence prevention for retail.",
  },
  {
    icon: Wrench,
    name: "Auto Services",
    riskLevel: "High",
    enforcement: "Hazmat-driven penalties",
    description: "Dealerships, repair shops, and body shops. Hazardous materials handling, spray booth safety, and lift inspection compliance.",
  },
]

export default function IndustriesPage() {
  return (
    <main className="min-h-screen bg-void">
      <Nav />
      
      {/* Hero */}
      <section className="pt-32 pb-20 px-8 border-b border-brand-white/[0.06]">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="font-display text-[12px] tracking-[4px] uppercase text-gold">
              Industries
            </span>
            <h1 className="font-display font-black text-[clamp(40px,6vw,64px)] leading-[0.92] text-parchment mt-4 mb-6">
              BUILT FOR YOUR INDUSTRY
            </h1>
            <p className="font-sans text-[16px] text-steel max-w-[600px] leading-relaxed">
              Every industry has unique compliance requirements. PROTEKON&apos;s engine analyzes
              California enforcement patterns to understand the specific risks and regulations that affect your business.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-midnight border-b border-brand-white/[0.06]">
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4">
          {[
            { value: "9", label: "Industry Verticals" },
            { value: "24/7", label: "Regulatory Monitoring" },
            { value: "100%", label: "Cal/OSHA Coverage" },
            { value: "48hr", label: "First Delivery" },
          ].map((stat, i) => (
            <div 
              key={stat.label}
              className={`p-8 ${i < 3 ? "border-r border-brand-white/[0.06]" : ""}`}
            >
              <span className="font-display font-black text-[28px] text-gold block">
                {stat.value}
              </span>
              <span className="font-display text-[9px] tracking-[2px] uppercase text-steel">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Industries Grid */}
      <section className="py-20 px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {industries.map((industry, i) => (
              <motion.div
                key={industry.name}
                className="group bg-midnight border border-brand-white/[0.06] p-8 hover:border-gold/30 transition-colors"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-gold/10">
                      <industry.icon size={24} weight="bold" className="text-gold" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-[18px] text-parchment">
                        {industry.name}
                      </h3>
                      <span className={`font-display text-[12px] tracking-[2px] uppercase ${
                        industry.riskLevel === "Very High" ? "text-crimson" :
                        industry.riskLevel === "High" ? "text-gold" : "text-steel"
                      }`}>
                        {industry.riskLevel} Risk
                      </span>
                    </div>
                  </div>
                </div>

                <p className="font-sans text-[14px] text-steel leading-relaxed mb-6">
                  {industry.description}
                </p>

                <div className="p-4 bg-void/50 mb-6">
                  <span className="font-display font-medium text-[13px] text-parchment">
                    {industry.enforcement}
                  </span>
                </div>

                <Link
                  href={`/industries/${industry.name.toLowerCase().replace(' ', '-')}`}
                  className="inline-flex items-center font-display font-semibold text-[12px] tracking-[3px] uppercase text-gold hover:text-parchment transition-colors"
                >
                  View {industry.name} Solutions
                  <svg className="ml-2 w-4 h-4" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-8 bg-crimson">
        <div className="max-w-[800px] mx-auto text-center">
          <h2 className="font-display font-black text-[clamp(28px,4vw,40px)] leading-[0.92] text-parchment mb-6">
            DON&apos;T SEE YOUR INDUSTRY?
          </h2>
          <p className="font-sans text-[16px] text-parchment/80 mb-8">
            We cover all California businesses. Contact us for a custom compliance assessment.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center font-display font-semibold text-[11px] tracking-[3px] uppercase text-crimson bg-parchment px-8 py-4 hover:bg-gold transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
