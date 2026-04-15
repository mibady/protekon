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
  {
    title: "Injury & Illness Prevention Program (IIPP)",
    pages: 16,
    badge: null,
    description:
      "Complete IIPP meeting 8 CCR §3203 requirements: responsibility, communication, hazard assessment, accident investigation, correction, training, and recordkeeping.",
    features: [
      "8 CCR §3203 compliant",
      "Responsibility + communication sections",
      "Hazard assessment procedures",
      "Accident investigation framework",
    ],
  },
  {
    title: "SB 553 Violent Incident Log (Sample)",
    pages: 5,
    badge: null,
    description:
      "Example incident log showing correct PII redaction per Labor Code §6401.9(e). Three representative entries (Types 1, 2, 3) with required log fields checklist.",
    features: [
      "PII-stripped per SB 553",
      "Types 1/2/3 representative entries",
      "5-year retention format",
      "Required fields checklist",
    ],
  },
  {
    title: "Audit-Ready Compliance Package",
    pages: 8,
    badge: null,
    description:
      "Table of contents for the on-demand Cal/OSHA inspection package. Organized the way inspectors look for records — written programs, training, incidents, inspections, vertical appendices.",
    features: [
      "Cross-referenced to standards",
      "6 sections / 30+ documents",
      "On-demand generation",
      "Vertical-specific appendices",
    ],
  },
  {
    title: "SB 553 Employee Summary",
    pages: 3,
    badge: "Shareable",
    description:
      "Plain-language 8th-grade-reading-level handout for employees. Explains the four types of workplace violence, reporting rights, retaliation protections, and how to file a report. Ready to distribute.",
    features: [
      "Employee-facing (8th grade)",
      "Cites LC §6401.9 + 8 CCR §3343",
      "Covers Types 1–4 + reporting paths",
      "Retaliation protection included",
    ],
  },
  {
    title: "WVPP Employee Sign-Off Sheet",
    pages: 2,
    badge: "Template",
    description:
      "Acknowledgment and training sign-off form with merge fields for your business name, plan revision, employee name, and signature. Required training record under 8 CCR §3203(b)(2).",
    features: [
      "Merge-field tokens included",
      "Acknowledgment + training confirmation",
      "3-year retention template",
      "Two-column print layout",
    ],
  },
  {
    title: "Manager WVP Communication Guide",
    pages: 4,
    badge: "Manager",
    description:
      "Manager-facing quick reference for rolling out your WVP plan. Five talking points, common employee questions with answers, escalation triggers, and the after-action 24-hour checklist.",
    features: [
      "5 talking points for team meetings",
      "FAQ with scripted answers",
      "Escalation trigger list",
      "After-action 24h checklist",
    ],
  },
  {
    title: "Quarterly Compliance Review",
    pages: 7,
    badge: null,
    description:
      "Professional-tier quarterly report: compliance score trend, gap closures, regulatory changes absorbed, NAICS enforcement benchmarks, and the next-90-day plan — co-signed.",
    features: [
      "Score trend + gap closures",
      "Regulatory changes absorbed",
      "Peer NAICS benchmark",
      "Next-90-day priorities",
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
