"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Download, ArrowDown } from "@phosphor-icons/react"
import Link from "next/link"

const kpis = [
  { label: "This Month", value: 3, delta: -2, positive: true },
  { label: "YTD", value: 47, delta: -15, positive: true },
  { label: "Open", value: 2, delta: null, positive: null },
  { label: "OSHA Recordable", value: 1, delta: 0, positive: true },
  { label: "Recordable Rate", value: "2.1%", delta: -0.3, positive: true },
]

const incidentsByType = [
  { type: "Injury", count: 28, color: "#C41230" },
  { type: "Near Miss", count: 12, color: "#C9A84C" },
  { type: "Property", count: 5, color: "#7A8FA5" },
  { type: "Illness", count: 2, color: "#B8C4CE" },
]

const correctiveActions = [
  { incident: "INC-2026-001", action: "Install additional signage in loading area", assigned: "Safety Officer", due: "Jan 25, 2026", status: "In Progress" },
  { incident: "INC-2025-047", action: "Implement two-person lift policy for >50lbs", assigned: "Supervisor", due: "Jan 20, 2026", status: "Completed" },
  { incident: "INC-2025-046", action: "Schedule plumbing inspection", assigned: "Facilities", due: "Jan 15, 2026", status: "Completed" },
  { incident: "INC-2025-045", action: "Update winter weather protocol", assigned: "Safety Officer", due: "Jan 10, 2026", status: "Completed" },
]

export default function IncidentAnalysisReportPage() {
  const total = incidentsByType.reduce((sum, i) => sum + i.count, 0)

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
          <span className="font-display font-medium text-[10px] tracking-[3px] uppercase text-gold block mb-1">
            Monthly / Quarterly Report
          </span>
          <h1 className="font-display font-bold text-[28px] text-midnight">Incident Analysis Report</h1>
          <p className="font-sans text-[14px] text-steel mt-1">
            Generated January 15, 2026
          </p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center gap-2 border border-gold text-gold font-display font-semibold text-[11px] tracking-[2px] uppercase px-6 py-3 hover:bg-gold/10 transition-colors">
            Export OSHA 300
          </button>
          <button className="inline-flex items-center gap-2 bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[2px] uppercase px-6 py-3 hover:brightness-110 transition-all">
            <Download size={16} weight="bold" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Section 1: KPI Banner */}
      <motion.div 
        className="bg-midnight p-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
          {kpis.map((kpi) => (
            <div key={kpi.label}>
              <span className="font-mono font-extrabold text-[32px] text-gold leading-none">
                {kpi.value}
              </span>
              <p className="font-display font-medium text-[9px] tracking-[2px] uppercase text-steel mt-1">
                {kpi.label}
              </p>
              {kpi.delta !== null && (
                <div className="flex items-center gap-1 mt-2">
                  <ArrowDown size={12} className={kpi.positive ? "text-[#2A7D4F] rotate-180" : "text-crimson"} />
                  <span className={`font-mono text-[11px] ${kpi.positive ? "text-[#2A7D4F]" : "text-crimson"}`}>
                    {kpi.delta > 0 ? '+' : ''}{kpi.delta} YoY
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Section 2: Donut Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <motion.div 
          className="bg-brand-white border border-midnight/[0.08] p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="font-display font-bold text-[12px] tracking-[3px] uppercase text-midnight mb-4">
            Incidents by Type
          </h3>
          <div className="flex items-center gap-8">
            {/* Donut */}
            <div className="relative w-[160px] h-[160px]">
              <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                {incidentsByType.reduce((acc, item, i) => {
                  const prevOffset = acc.offset
                  const percentage = (item.count / total) * 100
                  const dashArray = `${percentage * 4.4} ${440 - percentage * 4.4}`
                  acc.elements.push(
                    <circle
                      key={item.type}
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke={item.color}
                      strokeWidth="20"
                      strokeDasharray={dashArray}
                      strokeDashoffset={-prevOffset * 4.4}
                    />
                  )
                  acc.offset += percentage
                  return acc
                }, { elements: [] as JSX.Element[], offset: 0 }).elements}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display font-black text-[36px] text-midnight">{total}</span>
                <span className="font-display text-[9px] tracking-[2px] uppercase text-steel">Total</span>
              </div>
            </div>
            {/* Legend */}
            <div className="space-y-2">
              {incidentsByType.map((item) => (
                <div key={item.type} className="flex items-center gap-3">
                  <span className="w-3 h-3" style={{ backgroundColor: item.color }} />
                  <span className="font-sans text-[13px] text-midnight">{item.type}</span>
                  <span className="font-mono text-[12px] text-steel">({item.count})</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-brand-white border border-midnight/[0.08] p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h3 className="font-display font-bold text-[12px] tracking-[3px] uppercase text-midnight mb-4">
            Incidents by Severity
          </h3>
          <div className="flex items-center gap-8">
            <div className="relative w-[160px] h-[160px]">
              <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                <circle cx="80" cy="80" r="70" fill="none" stroke="#C41230" strokeWidth="20" strokeDasharray="44 396" strokeDashoffset="0" />
                <circle cx="80" cy="80" r="70" fill="none" stroke="#C9A84C" strokeWidth="20" strokeDasharray="88 352" strokeDashoffset="-44" />
                <circle cx="80" cy="80" r="70" fill="none" stroke="#7A8FA5" strokeWidth="20" strokeDasharray="132 308" strokeDashoffset="-132" />
                <circle cx="80" cy="80" r="70" fill="none" stroke="#B8C4CE" strokeWidth="20" strokeDasharray="176 264" strokeDashoffset="-264" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display font-black text-[36px] text-midnight">{total}</span>
                <span className="font-display text-[9px] tracking-[2px] uppercase text-steel">Total</span>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { type: "Critical", count: 2, color: "#C41230" },
                { type: "Serious", count: 8, color: "#C9A84C" },
                { type: "Moderate", count: 15, color: "#7A8FA5" },
                { type: "Minor", count: 22, color: "#B8C4CE" },
              ].map((item) => (
                <div key={item.type} className="flex items-center gap-3">
                  <span className="w-3 h-3" style={{ backgroundColor: item.color }} />
                  <span className="font-sans text-[13px] text-midnight">{item.type}</span>
                  <span className="font-mono text-[12px] text-steel">({item.count})</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Section 4: Corrective Actions */}
      <motion.div 
        className="bg-brand-white border border-midnight/[0.08] overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="p-4 border-b border-midnight/[0.06]">
          <h3 className="font-display font-bold text-[12px] tracking-[3px] uppercase text-midnight">
            Corrective Actions Tracker
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-midnight/[0.06] bg-parchment/50">
                <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Incident</th>
                <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Corrective Action</th>
                <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Assigned</th>
                <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Due Date</th>
                <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Status</th>
              </tr>
            </thead>
            <tbody>
              {correctiveActions.map((ca) => (
                <tr key={ca.incident} className="border-b border-midnight/[0.06] last:border-0">
                  <td className="px-4 py-3 font-mono text-[12px] text-midnight">{ca.incident}</td>
                  <td className="px-4 py-3 font-sans text-[13px] text-midnight">{ca.action}</td>
                  <td className="px-4 py-3 font-sans text-[12px] text-steel">{ca.assigned}</td>
                  <td className="px-4 py-3 font-sans text-[12px] text-steel">{ca.due}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 font-display font-medium text-[8px] tracking-[1px] uppercase ${
                      ca.status === 'Completed' ? 'bg-[#2A7D4F]/10 text-[#2A7D4F]' :
                      ca.status === 'In Progress' ? 'bg-gold/10 text-gold' :
                      ca.status === 'Overdue' ? 'bg-crimson/10 text-crimson' :
                      'bg-steel/10 text-steel'
                    }`}>
                      {ca.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-parchment/50 border-t border-midnight/[0.06]">
          <div className="flex items-center gap-4">
            <span className="font-sans text-[13px] text-midnight">
              3 of 4 corrective actions completed — <strong>75%</strong>
            </span>
            <div className="flex-1 h-2 bg-midnight/10 max-w-xs">
              <div className="h-full bg-[#2A7D4F]" style={{ width: '75%' }} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
