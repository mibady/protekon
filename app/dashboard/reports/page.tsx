"use client"

import { motion } from "framer-motion"
import { ChartLine, WarningCircle, FileText, Scales, EnvelopeSimple, CalendarCheck, Download, ArrowRight } from "@phosphor-icons/react"
import Link from "next/link"

const reports = [
  {
    name: "Compliance Score Report",
    icon: ChartLine,
    description: "Your complete compliance health breakdown with category scores, trends, and actionable recommendations.",
    frequency: ["Monthly", "On Demand"],
    borderColor: "border-t-crimson",
    href: "/dashboard/reports/compliance-score",
  },
  {
    name: "Incident Analysis Report",
    icon: WarningCircle,
    description: "Deep dive into incident trends, root causes, OSHA recordable rates, and corrective action tracking.",
    frequency: ["Monthly", "Quarterly", "On Demand"],
    borderColor: "border-t-gold",
    href: "/dashboard/reports/incident-analysis",
  },
  {
    name: "Document History Report",
    icon: FileText,
    description: "Complete version history and delivery log for all compliance documents with regulatory triggers.",
    frequency: ["On Demand", "Annual Package"],
    borderColor: "border-t-midnight",
    href: "/dashboard/reports/document-history",
  },
  {
    name: "Regulatory Impact Report",
    icon: Scales,
    description: "Summary of regulatory changes affecting your business and your response status to each update.",
    frequency: ["Quarterly", "On Demand"],
    borderColor: "border-t-crimson",
    href: "/dashboard/reports/regulatory-impact",
  },
  {
    name: "Delivery Log Report",
    icon: EnvelopeSimple,
    description: "Every document and report delivery with open rates, timestamps, and recipient confirmation.",
    frequency: ["On Demand", "Annual Package"],
    borderColor: "border-t-gold",
    href: "/dashboard/reports/delivery-log",
  },
  {
    name: "Annual Compliance Summary",
    icon: CalendarCheck,
    description: "The flagship year-in-review audit package. Every document, incident, and regulatory response in one PDF.",
    frequency: ["Annual", "On Demand"],
    borderColor: "border-t-crimson",
    href: "/dashboard/reports/annual-summary",
  },
]

export default function ReportsHubPage() {
  return (
    <div className="p-6 lg:p-8">
      {/* Quick Generate Bar */}
      <div className="bg-midnight p-4 mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-[11px] tracking-[3px] uppercase text-gold">
            Generate Now:
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 border border-brand-white/30 text-brand-white font-display font-semibold text-[9px] tracking-[2px] uppercase hover:bg-brand-white/10 transition-colors">
            Monthly Summary
          </button>
          <button className="px-4 py-2 border border-brand-white/30 text-brand-white font-display font-semibold text-[9px] tracking-[2px] uppercase hover:bg-brand-white/10 transition-colors">
            Incident Export
          </button>
          <button className="px-4 py-2 border border-brand-white/30 text-brand-white font-display font-semibold text-[9px] tracking-[2px] uppercase hover:bg-brand-white/10 transition-colors">
            Annual Package
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display font-bold text-[28px] text-midnight">Reports</h1>
        <p className="font-sans text-[14px] text-steel mt-1">
          Generate compliance reports on demand or view scheduled deliveries
        </p>
      </div>

      {/* Report Cards Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {reports.map((report, i) => (
          <motion.div
            key={report.name}
            className={`bg-brand-white border border-midnight/[0.08] border-t-[3px] ${report.borderColor} group hover:shadow-lg hover:-translate-y-0.5 transition-all`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <div className="p-6">
              <report.icon size={32} className="text-midnight mb-4" />
              <h3 className="font-display font-black text-[22px] text-midnight mb-2">
                {report.name}
              </h3>
              <p className="font-sans text-[13px] text-steel leading-relaxed mb-4">
                {report.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {report.frequency.map((freq) => (
                  <span key={freq} className="px-2 py-1 bg-parchment font-display font-medium text-[8px] tracking-[1px] uppercase text-midnight">
                    {freq}
                  </span>
                ))}
              </div>
              <Link 
                href={report.href}
                className="inline-flex items-center gap-2 font-display font-semibold text-[11px] tracking-[2px] uppercase text-crimson group-hover:gap-3 transition-all"
              >
                View Report
                <ArrowRight size={14} weight="bold" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Annual Package Banner */}
      <motion.div 
        className="bg-parchment border border-midnight/[0.08] p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h2 className="font-display font-black text-[24px] text-midnight mb-2">
              Generate Full Audit Package
            </h2>
            <p className="font-sans text-[14px] text-steel">
              Download your complete compliance archive as a single PDF. Includes all 6 reports + all documents + delivery log. One-click generation.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[2px] uppercase px-8 py-4 hover:brightness-110 transition-all flex-shrink-0">
            <Download size={18} weight="bold" />
            Generate Full Package
          </button>
        </div>
      </motion.div>
    </div>
  )
}
