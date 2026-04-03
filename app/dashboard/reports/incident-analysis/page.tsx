"use client"

import React from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Download, ArrowDown } from "@phosphor-icons/react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { getIncidentAnalysis } from "@/lib/actions/reports"

export default function IncidentAnalysisReportPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getIncidentAnalysis>> | null>(null)

  useEffect(() => {
    getIncidentAnalysis().then(setData)
  }, [])

  const kpis = (data?.kpis ?? []) as { label: string; value: number | string; delta: number | null; positive: boolean | null }[]
  const incidentsByType = data?.incidentsByType ?? []
  const correctiveActions = data?.correctiveActions ?? []
  const total = incidentsByType.reduce((sum, i) => sum + i.count, 0)

  return (
    <div className="p-4 sm:p-6 lg:p-8">
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
          <button
            onClick={() => window.open("/api/export/report?type=incident-analysis&format=pdf")}
            className="inline-flex items-center gap-2 border border-gold text-gold font-display font-semibold text-[11px] tracking-[2px] uppercase px-6 py-3 hover:bg-gold/10 transition-colors"
          >
            Export OSHA 300
          </button>
          <button
            onClick={() => window.open("/api/export/report?type=incident-analysis&format=pdf")}
            className="inline-flex items-center gap-2 bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[2px] uppercase px-6 py-3 hover:brightness-110 transition-all"
          >
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
              <span className="font-mono font-extrabold text-[24px] lg:text-[32px] text-gold leading-none">
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
            <div className="relative w-[120px] h-[120px] lg:w-[160px] lg:h-[160px]">
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
                }, { elements: [] as React.ReactNode[], offset: 0 }).elements}
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
            <div className="relative w-[120px] h-[120px] lg:w-[160px] lg:h-[160px]">
              <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                {(data?.incidentsBySeverity ?? []).reduce((acc, item, _i) => {
                  const prevOffset = acc.offset
                  const percentage = total > 0 ? (item.count / total) * 100 : 0
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
                }, { elements: [] as React.ReactNode[], offset: 0 }).elements}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display font-black text-[36px] text-midnight">{total}</span>
                <span className="font-display text-[9px] tracking-[2px] uppercase text-steel">Total</span>
              </div>
            </div>
            <div className="space-y-2">
              {(data?.incidentsBySeverity ?? []).map((item) => (
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
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
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
        {/* Mobile Cards */}
        <div className="lg:hidden space-y-3 p-4">
          {correctiveActions.map((ca) => (
            <div key={ca.incident} className="bg-midnight/50 border border-brand-white/[0.06] p-4 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <span className="font-mono text-[12px] text-midnight">{ca.incident}</span>
                <span className={`px-2 py-0.5 font-display font-medium text-[8px] tracking-[1px] uppercase ${
                  ca.status === 'Completed' ? 'bg-[#2A7D4F]/10 text-[#2A7D4F]' :
                  ca.status === 'In Progress' ? 'bg-gold/10 text-gold' :
                  ca.status === 'Overdue' ? 'bg-crimson/10 text-crimson' :
                  'bg-steel/10 text-steel'
                }`}>
                  {ca.status}
                </span>
              </div>
              <p className="font-sans text-[13px] text-midnight mb-2">{ca.action}</p>
              <div className="flex items-center justify-between">
                <span className="font-sans text-[12px] text-steel">{ca.assigned}</span>
                <span className="font-sans text-[12px] text-steel">Due: {ca.due}</span>
              </div>
            </div>
          ))}
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
