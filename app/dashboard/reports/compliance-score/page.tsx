"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Download, ArrowRight } from "@phosphor-icons/react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { getComplianceScoreReport } from "@/lib/actions/reports"

// Animated counter
function useCountUp(end: number, duration: number = 1400) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let startTime: number
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [end, duration])
  return count
}

export default function ComplianceScoreReportPage() {
  const [data, setData] = useState<{ score: number; monthlyScores: { month: string; score: number }[]; documents: { name: string; status: string; updated: string; regulation: string; points: string }[]; categories: { name: string; score: number; max: number; weight: string }[] } | null>(null)

  useEffect(() => {
    getComplianceScoreReport().then(setData)
  }, [])

  const categories = data?.categories ?? []
  const monthlyScores = data?.monthlyScores ?? []
  const documents = data?.documents ?? []
  const recommendations = [
    { priority: 1, action: "Review regulatory updates", gain: 4, cta: "Review Now", href: "/dashboard/regulations" },
    { priority: 2, action: "Update any documents in review status", gain: 1, cta: "Request Update", href: "/dashboard/documents/request" },
    { priority: 3, action: "Complete account settings", gain: 2, cta: "Verify Now", href: "/dashboard/settings" },
  ]
  const score = useCountUp(data?.score ?? 0)
  const scoreColor = score >= 75 ? "#2A7D4F" : score >= 50 ? "#C9A84C" : "#C41230"

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
          <span className="font-display font-medium text-[12px] tracking-[3px] uppercase text-crimson block mb-1">
            Monthly Report
          </span>
          <h1 className="font-display font-bold text-[28px] text-midnight">Compliance Score Report</h1>
          <p className="font-sans text-[14px] text-steel mt-1">
            Generated January 15, 2026
          </p>
        </div>
        <button
          onClick={() => window.open("/api/export/report?type=compliance-score&format=pdf")}
          className="inline-flex items-center gap-2 bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[2px] uppercase px-6 py-3 hover:brightness-110 transition-all"
        >
          <Download size={16} weight="bold" />
          Export PDF
        </button>
      </div>

      {/* Section 1: Score Hero */}
      <motion.div 
        className="bg-midnight p-8 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Large Gauge */}
          <div className="flex items-center justify-center">
            <div className="relative w-[160px] h-[160px] lg:w-[200px] lg:h-[200px]">
              <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="rgba(250,250,248,0.1)"
                  strokeWidth="14"
                />
                <motion.circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="14"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 565" }}
                  animate={{ strokeDasharray: `${score * 5.65} 565` }}
                  transition={{ duration: 1.4, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display font-black text-[72px] leading-none text-gold">
                  {score}
                </span>
                <span className="font-display font-medium text-[12px] tracking-[2px] uppercase text-steel">
                  / 100
                </span>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="flex flex-col justify-center">
            <h3 className="font-display font-bold text-[12px] tracking-[3px] uppercase text-steel mb-4">
              Category Breakdown
            </h3>
            <div className="space-y-3">
              {categories.map((cat) => (
                <div key={cat.name} className="flex items-center gap-3">
                  <span className="font-sans text-[12px] text-brand-white w-28">{cat.name}</span>
                  <div className="flex-1 h-2 bg-brand-white/10">
                    <div 
                      className="h-full bg-gold" 
                      style={{ width: `${(cat.score / cat.max) * 100}%` }}
                    />
                  </div>
                  <span className="font-mono text-[11px] text-brand-white w-12 text-right">
                    {cat.score}/{cat.max}
                  </span>
                  <span className="font-mono text-[12px] text-steel w-8 text-right">
                    {cat.weight}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Mini Trend */}
          <div className="flex flex-col justify-center">
            <h3 className="font-display font-bold text-[12px] tracking-[3px] uppercase text-steel mb-4">
              6-Month Trend
            </h3>
            <div className="relative h-[120px]">
              <svg className="w-full h-full" viewBox="0 0 300 120">
                {monthlyScores.length > 0 && <motion.path
                  d={`M0,${120 - monthlyScores[0].score} ${monthlyScores.map((s, i) => `L${i * 60},${120 - s.score}`).join(' ')}`}
                  fill="none"
                  stroke="#C9A84C"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5 }}
                />}
                {monthlyScores.map((s, i) => (
                  <circle
                    key={i}
                    cx={i * 60}
                    cy={120 - s.score}
                    r="4"
                    fill="#C9A84C"
                  />
                ))}
              </svg>
              <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
                {monthlyScores.map((s) => (
                  <span key={s.month} className="font-sans text-[12px] text-steel">{s.month}</span>
                ))}
              </div>
            </div>
            {monthlyScores.length >= 2 && (
              <p className="font-sans text-[11px] text-gold mt-2 text-center">
                {monthlyScores[monthlyScores.length - 1].score - monthlyScores[0].score >= 0 ? "+" : ""}{monthlyScores[monthlyScores.length - 1].score - monthlyScores[0].score} pts in {monthlyScores.length} months
              </p>
            )}
          </div>
        </div>

        {/* Tier Band */}
        <div className="mt-8 pt-6 border-t border-brand-white/10">
          <div className="relative h-3 bg-gradient-to-r from-crimson via-gold to-[#2A7D4F]">
            <div 
              className="absolute top-0 w-1 h-6 bg-brand-white -translate-y-1.5"
              style={{ left: `${score}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="font-display text-[9px] tracking-[2px] uppercase text-crimson">Critical 0-49</span>
            <span className="font-display text-[9px] tracking-[2px] uppercase text-gold">Warning 50-74</span>
            <span className="font-display text-[9px] tracking-[2px] uppercase text-[#2A7D4F]">Compliant 75-100</span>
          </div>
        </div>
      </motion.div>

      {/* Section 3: Documentation Drill-Down */}
      <motion.div 
        className="bg-brand-white border border-midnight/[0.08] mb-6 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="p-4 border-b border-midnight/[0.06]">
          <h3 className="font-display font-bold text-[12px] tracking-[3px] uppercase text-midnight">
            Documentation Readiness
          </h3>
        </div>
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-midnight/[0.06] bg-parchment/50">
                <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Document</th>
                <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Status</th>
                <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Last Updated</th>
                <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Regulation</th>
                <th className="text-right px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Points</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.name} className="border-b border-midnight/[0.06] last:border-0">
                  <td className="px-4 py-3 font-sans text-[13px] text-midnight">{doc.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 font-display font-medium text-[10px] tracking-[1px] uppercase ${
                      doc.status === 'current' ? 'bg-[#2A7D4F]/10 text-[#2A7D4F]' : 'bg-gold/10 text-gold'
                    }`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-sans text-[12px] text-steel">{doc.updated}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-gold/10 border border-gold/30 font-display font-medium text-[10px] tracking-[1px] text-gold">
                      {doc.regulation}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] text-midnight text-right">{doc.points}</td>
                </tr>
              ))}
              <tr className="bg-parchment">
                <td colSpan={4} className="px-4 py-3 font-display font-bold text-[12px] text-midnight">Total</td>
                <td className="px-4 py-3 font-mono font-bold text-[14px] text-midnight text-right">28/30</td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* Mobile Cards */}
        <div className="lg:hidden space-y-3 p-4">
          {documents.map((doc) => (
            <div key={doc.name} className="bg-midnight/50 border border-brand-white/[0.06] p-4 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <span className="font-sans text-[13px] text-midnight font-medium">{doc.name}</span>
                <span className="font-mono text-[12px] text-midnight">{doc.points}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 font-display font-medium text-[10px] tracking-[1px] uppercase ${
                  doc.status === 'current' ? 'bg-[#2A7D4F]/10 text-[#2A7D4F]' : 'bg-gold/10 text-gold'
                }`}>
                  {doc.status}
                </span>
                <span className="px-2 py-0.5 bg-gold/10 border border-gold/30 font-display font-medium text-[10px] tracking-[1px] text-gold">
                  {doc.regulation}
                </span>
              </div>
              <span className="font-sans text-[12px] text-steel">{doc.updated}</span>
            </div>
          ))}
          <div className="bg-parchment p-4 rounded-lg flex items-center justify-between">
            <span className="font-display font-bold text-[12px] text-midnight">Total</span>
            <span className="font-mono font-bold text-[14px] text-midnight">28/30</span>
          </div>
        </div>
      </motion.div>

      {/* Section 5: Recommendations */}
      <motion.div 
        className="bg-void p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="font-display font-black text-[28px] text-brand-white mb-6">
          How to Reach 90+
        </h3>
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div key={rec.priority} className="flex items-center gap-4 bg-midnight p-4">
              <span className="w-8 h-8 bg-crimson flex items-center justify-center font-display font-bold text-[14px] text-white flex-shrink-0">
                {rec.priority}
              </span>
              <div className="flex-1">
                <p className="font-sans text-[14px] text-brand-white">{rec.action}</p>
              </div>
              <span className="font-display font-bold text-[14px] text-gold">
                +{rec.gain} pts
              </span>
              <Link
                href={rec.href}
                className="inline-flex items-center gap-2 px-4 py-2 bg-crimson text-parchment font-display font-semibold text-[12px] tracking-[2px] uppercase hover:brightness-110 transition-all"
              >
                {rec.cta}
                <ArrowRight size={12} weight="bold" />
              </Link>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
