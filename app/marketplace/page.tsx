"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Nav from "@/components/layout/Nav"
import Footer from "@/components/layout/Footer"
import { Plugs, ShieldCheck, ChartLine, Users, Bell, FileText, Clock, Star } from "@phosphor-icons/react"

const integrations = [
  {
    name: "Zapier",
    category: "Automation",
    description: "Connect PROTEKON to 5,000+ apps. Automate document delivery, incident alerts, and compliance workflows.",
    icon: Plugs,
    status: "Available",
  },
  {
    name: "Slack",
    category: "Communication",
    description: "Get real-time compliance alerts and incident notifications directly in your Slack channels.",
    icon: Bell,
    status: "Available",
  },
  {
    name: "Microsoft Teams",
    category: "Communication",
    description: "Receive compliance updates and collaborate on safety documentation within Teams.",
    icon: Users,
    status: "Available",
  },
  {
    name: "QuickBooks",
    category: "Accounting",
    description: "Sync compliance costs, billing, and ROI reporting with your QuickBooks account.",
    icon: ChartLine,
    status: "Coming Soon",
  },
  {
    name: "Gusto",
    category: "HR",
    description: "Automatic employee count sync for accurate compliance documentation and pricing.",
    icon: Users,
    status: "Available",
  },
  {
    name: "Google Workspace",
    category: "Productivity",
    description: "Store compliance documents in Google Drive with automatic organization and sharing.",
    icon: FileText,
    status: "Available",
  },
]

const addOns = [
  {
    name: "Priority Delivery",
    price: "$99/mo",
    description: "24-hour document turnaround instead of 48 hours. Priority support queue.",
    features: ["24hr Delivery", "Priority Support", "Dedicated Slack Channel"],
  },
  {
    name: "Multi-Location",
    price: "$149/mo",
    description: "Manage compliance for up to 5 locations under one account. Centralized dashboard.",
    features: ["5 Locations", "Centralized Dashboard", "Location-Specific Docs"],
  },
  {
    name: "API Access",
    price: "$299/mo",
    description: "Full REST API access. Build custom integrations and automate compliance workflows.",
    features: ["REST API", "Webhooks", "Custom Integrations"],
  },
]

const partners = [
  { name: "SafetyFirst Consulting", type: "Implementation Partner", rating: 4.9 },
  { name: "CompliancePro Services", type: "Implementation Partner", rating: 4.8 },
  { name: "Cal Safety Solutions", type: "Training Partner", rating: 4.9 },
  { name: "OSHA Ready", type: "Training Partner", rating: 4.7 },
]

export default function MarketplacePage() {
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
            <span className="font-display text-[10px] tracking-[4px] uppercase text-gold">
              Marketplace
            </span>
            <h1 className="font-display font-black text-[clamp(40px,6vw,64px)] leading-[0.92] text-parchment mt-4 mb-6">
              EXTEND PROTEKON
            </h1>
            <p className="font-sans text-[16px] text-steel max-w-[600px] leading-relaxed">
              Integrations, add-ons, and partners to enhance your compliance stack. 
              Connect PROTEKON to your existing tools and workflows.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20 px-8">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="font-display font-bold text-[12px] tracking-[4px] uppercase text-gold mb-8">
            Integrations
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration, i) => (
              <motion.div
                key={integration.name}
                className="group bg-midnight border border-brand-white/[0.06] p-6 hover:border-gold/30 transition-colors"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-gold/10">
                    <integration.icon size={24} weight="bold" className="text-gold" />
                  </div>
                  <span className={`font-display text-[9px] tracking-[2px] uppercase px-2 py-1 ${
                    integration.status === "Available" 
                      ? "text-green-400 bg-green-400/10" 
                      : "text-gold bg-gold/10"
                  }`}>
                    {integration.status}
                  </span>
                </div>

                <h3 className="font-display font-bold text-[16px] text-parchment mb-1">
                  {integration.name}
                </h3>
                <span className="font-display text-[10px] tracking-[2px] uppercase text-crimson block mb-3">
                  {integration.category}
                </span>

                <p className="font-sans text-[13px] text-steel leading-relaxed">
                  {integration.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Add-Ons */}
      <section className="py-20 px-8 bg-midnight border-y border-brand-white/[0.06]">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="font-display font-bold text-[12px] tracking-[4px] uppercase text-gold mb-8">
            Add-Ons
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {addOns.map((addon, i) => (
              <motion.div
                key={addon.name}
                className="bg-void border border-brand-white/[0.06] p-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-display font-bold text-[18px] text-parchment">
                    {addon.name}
                  </h3>
                  <span className="font-display font-bold text-[20px] text-gold">
                    {addon.price}
                  </span>
                </div>

                <p className="font-sans text-[14px] text-steel leading-relaxed mb-6">
                  {addon.description}
                </p>

                <ul className="space-y-2 mb-6">
                  {addon.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <ShieldCheck size={14} className="text-gold" />
                      <span className="font-display text-[11px] tracking-[2px] uppercase text-steel">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button className="w-full font-display font-semibold text-[10px] tracking-[3px] uppercase text-parchment border border-brand-white/20 py-3 hover:border-gold hover:text-gold transition-colors">
                  Add to Plan
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-20 px-8">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="font-display font-bold text-[12px] tracking-[4px] uppercase text-gold mb-8">
            Certified Partners
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {partners.map((partner, i) => (
              <motion.div
                key={partner.name}
                className="bg-midnight border border-brand-white/[0.06] p-6 text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <h3 className="font-display font-bold text-[14px] text-parchment mb-1">
                  {partner.name}
                </h3>
                <span className="font-display text-[10px] tracking-[2px] uppercase text-crimson block mb-4">
                  {partner.type}
                </span>
                <div className="flex items-center justify-center gap-1">
                  <Star size={14} weight="fill" className="text-gold" />
                  <span className="font-display text-[14px] text-gold">
                    {partner.rating}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-8 bg-crimson">
        <div className="max-w-[800px] mx-auto text-center">
          <Clock size={48} weight="light" className="text-parchment mx-auto mb-6" />
          <h2 className="font-display font-black text-[clamp(28px,4vw,40px)] leading-[0.92] text-parchment mb-6">
            NEED A CUSTOM INTEGRATION?
          </h2>
          <p className="font-sans text-[16px] text-parchment/80 mb-8">
            Our API team can build custom integrations for enterprise customers.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center font-display font-semibold text-[11px] tracking-[3px] uppercase text-crimson bg-parchment px-8 py-4 hover:bg-gold transition-colors"
          >
            Contact API Team
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
