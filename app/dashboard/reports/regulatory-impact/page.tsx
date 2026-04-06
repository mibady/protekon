"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Download, Check, ArrowRight } from "@phosphor-icons/react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { getRegulatoryImpact } from "@/lib/actions/reports"

const avoidedPenalties = [
  { regulation: "8 CCR 3203", violation: "Outdated IIPP", minPenalty: "$1,500", maxPenalty: "$25,000" },
  { regulation: "SB 553", violation: "No WVPP", minPenalty: "$18,000", maxPenalty: "$150,000" },
  { regulation: "8 CCR 3220", violation: "Expired EAP", minPenalty: "$1,000", maxPenalty: "$15,000" },
]

export default function RegulatoryImpactReportPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getRegulatoryImpact>> | null>(null)

  useEffect(() => {
    getRegulatoryImpact().then(setData)
  }, [])

  const stats = (data?.stats ?? []) as { label: string; value: number | string }[]
  const quarters = data?.quarters ?? []
  return (
    <div className="p-6 lg:p-8">
      {/* Back Link */}
      <Link 
        href="/dashboard/reports"
        className="inline-flex items-center gap-2 font-display font-medium text-[11px] tracking-[2px] uppercase text-steel hover:text-midnight transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Back to Reports
      </Link>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <span className="font-display font-medium text-[12px] tracking-[3px] uppercase text-crimson block mb-1">
            Quarterly Report
          </span>
          <h1 className="font-display font-bold text-[28px] text-midnight">Regulatory Impact Report</h1>
          <p className="font-sans text-[14px] text-steel mt-1">
            Calendar Year 2025
          </p>
        </div>
        <button
          onClick={() => window.open("/api/export/report?type=regulatory-impact&format=pdf")}
          className="inline-flex items-center gap-2 bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[2px] uppercase px-6 py-3 hover:brightness-110 transition-all"
        >
          <Download size={16} weight="bold" />
          Export PDF
        </button>
      </div>

      {/* Section 1: Stats */}
      <motion.div 
        className="bg-midnight p-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <span className="font-mono font-extrabold text-[36px] text-gold leading-none">
                {stat.value}
              </span>
              <p className="font-display font-medium text-[9px] tracking-[2px] uppercase text-steel mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Section 2: Quarterly Timeline */}
      <motion.div 
        className="bg-brand-white border border-midnight/[0.08] mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="p-4 border-b border-midnight/[0.06]">
          <h3 className="font-display font-bold text-[12px] tracking-[3px] uppercase text-midnight">
            Regulatory Response Timeline
          </h3>
        </div>
        <div className="divide-y divide-midnight/[0.06]">
          {quarters.map((q) => (
            <div key={q.quarter} className="p-4">
              <h4 className="font-display font-extrabold text-[16px] text-crimson mb-4">{q.quarter}</h4>
              <div className="space-y-3">
                {q.updates.map((update, i) => (
                  <div key={i} className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 bg-parchment/50">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 bg-gold/10 border border-gold/30 font-display font-medium text-[9px] tracking-[1px] text-gold">
                        {update.code}
                      </span>
                      <span className={`px-2 py-0.5 font-display font-bold text-[10px] tracking-[1px] uppercase ${
                        update.type === 'Amendment' ? 'bg-crimson text-white' : 'bg-midnight text-white'
                      }`}>
                        {update.type}
                      </span>
                      <span className={`px-2 py-0.5 font-display font-medium text-[10px] tracking-[1px] uppercase ${
                        update.impact === 'High' ? 'bg-crimson/10 text-crimson' :
                        update.impact === 'Medium' ? 'bg-gold/10 text-gold' :
                        'bg-steel/10 text-steel'
                      }`}>
                        {update.impact} Impact
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-sans text-[12px] text-midnight">{update.response}</span>
                      <div className="flex items-center gap-1 text-[#2A7D4F]">
                        <Check size={14} weight="bold" />
                        <span className="font-display font-medium text-[12px] tracking-[1px] uppercase">{update.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Section 3: Avoided Penalties */}
      <motion.div 
        className="bg-void p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="font-display font-black text-[24px] text-brand-white mb-6">
          Potential Penalties Avoided
        </h3>
        <p className="font-sans text-[14px] text-steel mb-6">
          Through proactive compliance management, your organization avoided the following potential Cal/OSHA penalties:
        </p>
        <div className="grid lg:grid-cols-3 gap-4 mb-6">
          {avoidedPenalties.map((p) => (
            <div key={p.regulation} className="bg-midnight p-4">
              <span className="px-2 py-1 bg-gold/10 border border-gold/30 font-display font-medium text-[9px] tracking-[1px] text-gold">
                {p.regulation}
              </span>
              <p className="font-sans text-[13px] text-brand-white mt-3 mb-3">{p.violation}</p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[14px] text-steel">{p.minPenalty}</span>
                <ArrowRight size={12} className="text-steel" />
                <span className="font-mono text-[14px] text-crimson font-bold">{p.maxPenalty}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-crimson p-6 text-center">
          <span className="font-display font-medium text-[12px] tracking-[3px] uppercase text-parchment/80 block mb-2">
            Estimated Total Avoided
          </span>
          <span className="font-display font-black text-[48px] text-parchment">$52,000+</span>
        </div>
      </motion.div>
    </div>
  )
}
