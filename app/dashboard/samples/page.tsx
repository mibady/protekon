"use client"

import { motion } from "framer-motion"
import { FileText, Download, ShieldCheck } from "@phosphor-icons/react"
import Link from "next/link"

const sampleReports = [
  {
    title: "SB 553 Workplace Violence Prevention Plan",
    pages: 22,
    badge: "Most Downloaded",
    description:
      "Complete WVPP template meeting all SB 553 requirements. Includes hazard assessment, reporting procedures, training protocols, and incident response framework.",
    features: [
      "Cal/OSHA Title 8 compliant",
      "Hazard identification checklist",
      "Employee reporting procedures",
      "Training documentation templates",
    ],
  },
  {
    title: "Construction Subcontractor Compliance Report",
    pages: 4,
    badge: null,
    description:
      "Subcontractor verification report covering CSLB license status, insurance verification, and lien waiver compliance tracking.",
    features: [
      "CSLB license verification",
      "Insurance certificate tracking",
      "Pay/No-Pay lien status",
      "Compliance score per sub",
    ],
  },
  {
    title: "Property Management Municipal Compliance Pulse",
    pages: 6,
    badge: null,
    description:
      "Monthly municipal ordinance monitoring report covering rent control changes, habitability requirements, and local code updates.",
    features: [
      "Municipal ordinance tracking",
      "Rent control compliance",
      "Habitability requirements",
      "Local code change alerts",
    ],
  },
]

export default function DashboardSamplesPage() {
  return (
    <div className="p-6 lg:p-8 max-w-[1200px]">
      <div className="mb-8">
        <h1 className="font-display font-bold text-[28px] text-midnight mb-2">Sample Documents</h1>
        <p className="font-sans text-[15px] text-steel max-w-[640px]">
          Representative examples of what PROTEKON delivers. Download any sample to see formatting,
          section structure, and depth &mdash; then request a version tailored to your business from the
          <Link href="/dashboard/documents/request" className="text-crimson underline ml-1">documents hub</Link>.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sampleReports.map((report, i) => (
          <motion.div
            key={report.title}
            className="bg-brand-white border border-midnight/[0.08] p-5 flex flex-col"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 * i }}
          >
            <div className="flex items-start justify-between mb-3">
              <FileText size={24} className="text-crimson" />
              {report.badge && (
                <span className="font-display font-medium text-[10px] tracking-[1px] uppercase text-gold bg-gold/10 px-2 py-0.5">
                  {report.badge}
                </span>
              )}
            </div>
            <h2 className="font-display font-bold text-[16px] text-midnight mb-1 leading-tight">
              {report.title}
            </h2>
            <p className="font-sans text-[11px] text-steel mb-3">{report.pages} pages</p>
            <p className="font-sans text-[13px] text-steel leading-relaxed mb-4 flex-1">
              {report.description}
            </p>
            <ul className="space-y-1.5 mb-5">
              {report.features.map((f) => (
                <li key={f} className="flex items-start gap-2 font-sans text-[12px] text-steel">
                  <ShieldCheck size={13} weight="bold" className="text-gold mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href={`/api/samples/gate?report=${encodeURIComponent(report.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-midnight text-parchment font-display font-semibold text-[11px] tracking-[2px] uppercase px-5 py-3 hover:brightness-110 transition-all"
            >
              <Download size={14} weight="bold" /> Download PDF
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
