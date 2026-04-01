"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Download, ShieldCheck } from "@phosphor-icons/react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { getAnnualSummary } from "@/lib/actions/reports"

const raciMatrix = [
  { task: "IIPP Maintenance", owner: "A", safety: "R", supervisors: "C", employees: "I" },
  { task: "Incident Reporting", owner: "I", safety: "A", supervisors: "R", employees: "R" },
  { task: "Inspections", owner: "I", safety: "R", supervisors: "R", employees: "C" },
  { task: "Training Delivery", owner: "A", safety: "R", supervisors: "C", employees: "I" },
  { task: "Regulatory Monitoring", owner: "I", safety: "R", supervisors: "I", employees: "I" },
  { task: "SB 553 Compliance", owner: "A", safety: "R", supervisors: "C", employees: "I" },
  { task: "Emergency Response", owner: "A", safety: "R", supervisors: "R", employees: "R" },
  { task: "Corrective Actions", owner: "A", safety: "R", supervisors: "R", employees: "C" },
]

const RaciBadge = ({ value }: { value: string }) => {
  const styles = {
    R: "bg-crimson text-white",
    A: "bg-midnight text-white",
    C: "border border-gold text-gold bg-transparent",
    I: "border border-steel text-steel bg-transparent",
  }
  const labels = { R: "Responsible", A: "Accountable", C: "Consulted", I: "Informed" }
  
  return (
    <span className={`inline-flex items-center justify-center w-7 h-7 font-display font-bold text-[11px] ${styles[value as keyof typeof styles]}`} title={labels[value as keyof typeof labels]}>
      {value}
    </span>
  )
}

export default function AnnualSummaryReportPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getAnnualSummary>> | null>(null)

  useEffect(() => {
    getAnnualSummary().then(setData)
  }, [])

  const stats = data?.stats ?? []
  const oshaLog = data?.oshaLog ?? []
  const businessName = data?.businessName ?? "—"

  return (
    <div>
      {/* Cover Section */}
      <motion.div 
        className="bg-void relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="border-t-[3px] border-crimson" />
        
        {/* Background P-mark */}
        <div className="absolute right-0 top-0 bottom-0 opacity-[0.06]">
          <svg viewBox="0 0 48 84" className="h-full w-auto">
            <rect x="0" y="0" width="13" height="84" fill="#FAFAF8" />
            <rect x="13" y="0" width="35" height="13" fill="#FAFAF8" />
            <rect x="35" y="13" width="13" height="27" fill="#FAFAF8" />
            <rect x="0" y="40" width="48" height="10" fill="#FAFAF8" />
          </svg>
        </div>

        <div className="relative z-10 px-8 lg:px-20 py-16">
          {/* Back Link */}
          <Link 
            href="/dashboard/reports"
            className="inline-flex items-center gap-2 font-display font-medium text-[11px] tracking-[2px] uppercase text-steel hover:text-brand-white transition-colors mb-8"
          >
            <ArrowLeft size={14} />
            Back to Reports
          </Link>

          <span className="font-display font-medium text-[12px] tracking-[4px] uppercase text-crimson block mb-4">
            Annual Compliance Summary
          </span>
          <h1 className="font-display font-black text-[48px] lg:text-[64px] text-brand-white leading-tight mb-4">
            {businessName}
          </h1>
          <p className="font-display font-light text-[18px] tracking-[3px] text-gold">
            Calendar Year 2025 · Prepared by Shield CaaS by PROTEKON
          </p>

          <button className="inline-flex items-center gap-2 bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[2px] uppercase px-8 py-4 mt-8 hover:brightness-110 transition-all">
            <Download size={18} weight="bold" />
            Download Full Package (PDF)
          </button>
        </div>
      </motion.div>

      {/* Executive Summary */}
      <div className="bg-parchment p-8 lg:p-12">
        {/* Stats Banner */}
        <motion.div 
          className="bg-midnight p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <span className="font-mono font-extrabold text-[28px] lg:text-[36px] text-gold leading-none">
                  {stat.value}
                </span>
                <p className="font-display font-medium text-[9px] tracking-[2px] uppercase text-steel mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Narrative */}
        <motion.div 
          className="bg-brand-white border border-midnight/[0.08] p-6 lg:p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={20} className="text-gold" />
            <span className="font-display font-bold text-[10px] tracking-[3px] uppercase text-steel">
              Executive Summary
            </span>
          </div>
          <p className="font-sans text-[15px] text-midnight leading-relaxed">
            Demo Construction Co maintained strong compliance throughout Calendar Year 2025, achieving a year-end compliance score of <strong>87/100</strong>. The organization successfully maintained <strong>6 active compliance documents</strong>, responded to <strong>18 regulatory updates</strong>, and resolved <strong>45 of 47 workplace incidents</strong>. Only <strong>1 incident</strong> was OSHA recordable, resulting in a recordable rate of <strong>2.1%</strong>, well below industry average. The company avoided an estimated <strong>$52,000</strong> in potential Cal/OSHA penalties through proactive compliance management. Key achievements include successful SB 553 implementation, quarterly IIPP updates, and 100% training compliance.
          </p>
        </motion.div>

        {/* OSHA 300 Log */}
        <motion.div 
          className="bg-midnight p-6 lg:p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="font-display font-bold text-[10px] tracking-[3px] uppercase text-gold block mb-4">
            OSHA 300 Annual Log
          </span>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-brand-white/10">
                  <th className="text-left px-3 py-2 font-display text-[8px] tracking-[2px] uppercase text-steel">Case #</th>
                  <th className="text-left px-3 py-2 font-display text-[8px] tracking-[2px] uppercase text-steel">Job Title</th>
                  <th className="text-left px-3 py-2 font-display text-[8px] tracking-[2px] uppercase text-steel">Date</th>
                  <th className="text-left px-3 py-2 font-display text-[8px] tracking-[2px] uppercase text-steel">Location</th>
                  <th className="text-left px-3 py-2 font-display text-[8px] tracking-[2px] uppercase text-steel">Description</th>
                  <th className="text-left px-3 py-2 font-display text-[8px] tracking-[2px] uppercase text-steel">Classification</th>
                  <th className="text-center px-3 py-2 font-display text-[8px] tracking-[2px] uppercase text-steel">Days Away</th>
                  <th className="text-center px-3 py-2 font-display text-[8px] tracking-[2px] uppercase text-steel">Days Restricted</th>
                </tr>
              </thead>
              <tbody>
                {oshaLog.map((log) => (
                  <tr key={log.case} className="border-b border-brand-white/10 last:border-0">
                    <td className="px-3 py-3 font-mono text-[11px] text-brand-white">{log.case}</td>
                    <td className="px-3 py-3 font-sans text-[12px] text-brand-white">{log.jobTitle}</td>
                    <td className="px-3 py-3 font-sans text-[12px] text-brand-white">{log.date}</td>
                    <td className="px-3 py-3 font-sans text-[12px] text-brand-white">{log.location}</td>
                    <td className="px-3 py-3 font-sans text-[12px] text-brand-white">{log.description}</td>
                    <td className="px-3 py-3 font-sans text-[12px] text-brand-white">{log.classification}</td>
                    <td className="px-3 py-3 font-mono text-[12px] text-brand-white text-center">{log.daysAway}</td>
                    <td className="px-3 py-3 font-mono text-[12px] text-brand-white text-center">{log.daysRestricted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <p className="font-sans text-[12px] text-steel italic">
              This log must be posted February 1–April 30 per OSHA requirements.
            </p>
            <button className="inline-flex items-center gap-2 bg-crimson text-parchment font-display font-semibold text-[10px] tracking-[2px] uppercase px-6 py-3 hover:brightness-110 transition-all">
              <Download size={14} weight="bold" />
              Download OSHA 300 Log PDF
            </button>
          </div>
        </motion.div>

        {/* RACI Matrix */}
        <motion.div 
          className="bg-brand-white border border-midnight/[0.08] overflow-hidden mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="p-4 border-b border-midnight/[0.06]">
            <span className="font-display font-bold text-[10px] tracking-[3px] uppercase text-steel">
              AI-Generated RACI Matrix
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-midnight/[0.06] bg-parchment/50">
                  <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Task</th>
                  <th className="text-center px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Owner/Mgmt</th>
                  <th className="text-center px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Safety Designee</th>
                  <th className="text-center px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Supervisors</th>
                  <th className="text-center px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Employees</th>
                </tr>
              </thead>
              <tbody>
                {raciMatrix.map((row) => (
                  <tr key={row.task} className="border-b border-midnight/[0.06] last:border-0">
                    <td className="px-4 py-3 font-sans text-[13px] text-midnight">{row.task}</td>
                    <td className="px-4 py-3 text-center"><RaciBadge value={row.owner} /></td>
                    <td className="px-4 py-3 text-center"><RaciBadge value={row.safety} /></td>
                    <td className="px-4 py-3 text-center"><RaciBadge value={row.supervisors} /></td>
                    <td className="px-4 py-3 text-center"><RaciBadge value={row.employees} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-parchment/50 border-t border-midnight/[0.06] flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <RaciBadge value="R" />
              <span className="font-sans text-[11px] text-midnight">Responsible</span>
            </div>
            <div className="flex items-center gap-2">
              <RaciBadge value="A" />
              <span className="font-sans text-[11px] text-midnight">Accountable</span>
            </div>
            <div className="flex items-center gap-2">
              <RaciBadge value="C" />
              <span className="font-sans text-[11px] text-midnight">Consulted</span>
            </div>
            <div className="flex items-center gap-2">
              <RaciBadge value="I" />
              <span className="font-sans text-[11px] text-midnight">Informed</span>
            </div>
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div 
          className="bg-crimson p-8 lg:p-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="font-display font-black text-[28px] lg:text-[36px] text-parchment mb-4">
            Download Complete Annual Audit Package
          </h2>
          <p className="font-sans text-[15px] text-parchment/80 mb-6">
            Single PDF. All documents. All logs. All reports. Print and store.
          </p>
          <button className="inline-flex items-center gap-2 bg-brand-white text-crimson font-display font-semibold text-[11px] tracking-[2px] uppercase px-8 py-4 hover:bg-parchment transition-colors">
            <Download size={18} weight="bold" />
            Download Full Package (PDF)
          </button>
        </motion.div>
      </div>
    </div>
  )
}
