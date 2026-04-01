"use client"

import { motion } from "framer-motion"
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

export default function DashboardMarketplacePage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <span className="font-display text-[10px] tracking-[4px] uppercase text-crimson">
          Marketplace
        </span>
        <h1 className="font-display font-bold text-[24px] lg:text-[32px] text-midnight mt-2">
          Extend PROTEKON
        </h1>
        <p className="font-sans text-[14px] text-steel mt-2 max-w-[600px]">
          Integrations, add-ons, and partners to enhance your compliance stack.
        </p>
      </div>

      {/* Integrations */}
      <section>
        <h2 className="font-display font-bold text-[11px] tracking-[4px] uppercase text-crimson mb-5">
          Integrations
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((integration, i) => (
            <motion.div
              key={integration.name}
              className="bg-brand-white border border-midnight/[0.08] p-5 rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 flex items-center justify-center bg-crimson/10 rounded">
                  <integration.icon size={20} weight="bold" className="text-crimson" />
                </div>
                <span className={`font-display text-[9px] tracking-[2px] uppercase px-2 py-1 rounded ${
                  integration.status === "Available"
                    ? "text-[#2A7D4F] bg-[#2A7D4F]/10"
                    : "text-gold bg-gold/10"
                }`}>
                  {integration.status}
                </span>
              </div>

              <h3 className="font-display font-bold text-[15px] text-midnight mb-1">
                {integration.name}
              </h3>
              <span className="font-display text-[10px] tracking-[2px] uppercase text-crimson block mb-2">
                {integration.category}
              </span>

              <p className="font-sans text-[13px] text-steel leading-relaxed">
                {integration.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Add-Ons */}
      <section>
        <h2 className="font-display font-bold text-[11px] tracking-[4px] uppercase text-crimson mb-5">
          Add-Ons
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {addOns.map((addon, i) => (
            <motion.div
              key={addon.name}
              className="bg-brand-white border border-midnight/[0.08] p-6 rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-display font-bold text-[16px] text-midnight">
                  {addon.name}
                </h3>
                <span className="font-display font-bold text-[18px] text-crimson">
                  {addon.price}
                </span>
              </div>

              <p className="font-sans text-[13px] text-steel leading-relaxed mb-5">
                {addon.description}
              </p>

              <ul className="space-y-2 mb-5">
                {addon.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-[#2A7D4F] shrink-0" />
                    <span className="font-display text-[10px] tracking-[2px] uppercase text-steel">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button className="w-full font-display font-semibold text-[10px] tracking-[3px] uppercase text-brand-white bg-crimson py-3 rounded hover:brightness-110 transition-all">
                Add to Plan
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Partners */}
      <section>
        <h2 className="font-display font-bold text-[11px] tracking-[4px] uppercase text-crimson mb-5">
          Certified Partners
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {partners.map((partner, i) => (
            <motion.div
              key={partner.name}
              className="bg-brand-white border border-midnight/[0.08] p-5 rounded-lg text-center hover:shadow-lg hover:-translate-y-0.5 transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <h3 className="font-display font-bold text-[13px] text-midnight mb-1">
                {partner.name}
              </h3>
              <span className="font-display text-[9px] tracking-[2px] uppercase text-crimson block mb-3">
                {partner.type}
              </span>
              <div className="flex items-center justify-center gap-1">
                <Star size={14} weight="fill" className="text-gold" />
                <span className="font-display text-[14px] text-midnight">
                  {partner.rating}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-crimson border border-crimson rounded-lg p-6 sm:p-8 text-center">
        <Clock size={36} weight="light" className="text-brand-white mx-auto mb-4" />
        <h2 className="font-display font-bold text-[20px] lg:text-[24px] text-brand-white mb-3">
          Need a Custom Integration?
        </h2>
        <p className="font-sans text-[14px] text-brand-white/80 mb-5">
          Our API team can build custom integrations for enterprise customers.
        </p>
        <button className="font-display font-semibold text-[10px] tracking-[3px] uppercase text-crimson bg-brand-white px-8 py-3 rounded hover:bg-parchment transition-colors">
          Contact API Team
        </button>
      </section>
    </div>
  )
}
