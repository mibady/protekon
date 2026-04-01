"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { 
  ArrowRight, 
  Check, 
  Clock, 
  FileText,
  WarningCircle,
  Storefront
} from "@phosphor-icons/react"
import { useEffect, useState } from "react"

// Animated counter hook
function useCountUp(end: number, duration: number = 800) {
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

// Demo data
const documents = [
  { name: "Injury & Illness Prevention Program (IIPP)", status: "current", date: "Updated Jan 8, 2026" },
  { name: "SB 553 Workplace Violence Prevention Plan", status: "current", date: "Updated Dec 15, 2025" },
  { name: "Emergency Action Plan", status: "review", date: "Review due Jan 20, 2026" },
  { name: "Hazcom Program", status: "current", date: "Updated Nov 3, 2025" },
]

const regulatoryUpdates = [
  { severity: "high", code: "SB 553", title: "Emergency egress amendment requires updated signage", date: "Jan 10, 2026", unread: true },
  { severity: "high", code: "8 CCR 3203", title: "Inspection frequency increase effective Feb 1", date: "Jan 8, 2026", unread: true },
  { severity: "medium", code: "Cal/OSHA", title: "Recordkeeping supplemental guidance released", date: "Jan 5, 2026", unread: true },
  { severity: "low", code: "SB 553", title: "FAQ document published by DIR", date: "Dec 28, 2025", unread: false },
]

const deliveryTimeline = [
  { date: "JAN 15", label: "Monthly Summary", status: "sent" },
  { date: "FEB 1", label: "IIPP Review", status: "sent" },
  { date: "FEB 15", label: "Incident Export", status: "sent" },
  { date: "MAR 1", label: "Quarterly Report", status: "current" },
  { date: "MAR 15", label: "Doc Update", status: "upcoming" },
  { date: "APR 1", label: "Monthly Summary", status: "upcoming" },
  { date: "JAN 2027", label: "Annual Package", status: "upcoming" },
]

export default function DashboardPage() {
  const complianceScore = useCountUp(87)
  const openIncidents = useCountUp(2)
  const closedIncidents = useCountUp(45)
  const recordableIncidents = useCountUp(1)

  const scoreColor = complianceScore >= 75 ? "#2A7D4F" : complianceScore >= 50 ? "#C9A84C" : "#C41230"

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* BENTO ROW 1 - Three Equal Columns */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Card A: Compliance Score */}
        <motion.div 
          className="bg-brand-white border border-midnight/[0.08] p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="font-display font-medium text-[10px] tracking-[3px] uppercase text-steel mb-4">
            Compliance Score
          </h3>
          
          {/* Score Gauge */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-[180px] h-[180px]">
              <svg viewBox="0 0 180 180" className="w-full h-full -rotate-90">
                <circle
                  cx="90"
                  cy="90"
                  r="80"
                  fill="none"
                  stroke="rgba(11,29,58,0.08)"
                  strokeWidth="12"
                />
                <motion.circle
                  cx="90"
                  cy="90"
                  r="80"
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="12"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 502" }}
                  animate={{ strokeDasharray: `${complianceScore * 5.02} 502` }}
                  transition={{ duration: 1.4, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display font-black text-[56px] leading-none" style={{ color: scoreColor }}>
                  {complianceScore}
                </span>
                <span className="font-display font-medium text-[10px] tracking-[2px] uppercase text-steel">
                  / 100
                </span>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="space-y-3">
            {[
              { name: "Documentation", score: 28, max: 30 },
              { name: "Incidents", score: 20, max: 25 },
              { name: "Regulatory", score: 16, max: 20 },
            ].map((cat) => (
              <div key={cat.name} className="flex items-center gap-3">
                <span className="font-sans text-[12px] text-midnight w-28">{cat.name}</span>
                <div className="flex-1 h-2 bg-midnight/[0.06]">
                  <div 
                    className="h-full bg-gold" 
                    style={{ width: `${(cat.score / cat.max) * 100}%` }}
                  />
                </div>
                <span className="font-mono text-[11px] text-midnight w-12 text-right">
                  {cat.score}/{cat.max}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Card B: Document Status */}
        <motion.div 
          className="bg-brand-white border border-midnight/[0.08] p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3 className="font-display font-medium text-[10px] tracking-[3px] uppercase text-steel mb-4">
            Document Status
          </h3>
          
          <ul className="space-y-4">
            {documents.map((doc, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  doc.status === 'current' ? 'bg-[#2A7D4F]' : 
                  doc.status === 'review' ? 'bg-gold' : 'bg-crimson'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-[13px] text-midnight truncate">{doc.name}</p>
                  <p className="font-sans text-[11px] text-steel">{doc.date}</p>
                </div>
                <span className={`px-2 py-0.5 font-display font-medium text-[8px] tracking-[1px] uppercase flex-shrink-0 ${
                  doc.status === 'current' ? 'bg-[#2A7D4F]/10 text-[#2A7D4F]' : 
                  doc.status === 'review' ? 'bg-gold/10 text-gold' : 'bg-crimson/10 text-crimson'
                }`}>
                  {doc.status === 'current' ? 'Current' : doc.status === 'review' ? 'Review Due' : 'Expired'}
                </span>
              </li>
            ))}
          </ul>

          <Link 
            href="/dashboard/documents/request"
            className="flex items-center gap-2 mt-6 font-display font-semibold text-[11px] tracking-[2px] uppercase text-crimson hover:text-crimson/80 transition-colors"
          >
            Request Document Update
            <ArrowRight size={14} weight="bold" />
          </Link>
        </motion.div>

        {/* Card C: Incident Summary */}
        <motion.div 
          className="bg-brand-white border border-midnight/[0.08] p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="font-display font-medium text-[10px] tracking-[3px] uppercase text-steel mb-4">
            Incident Summary
          </h3>
          
          {/* Metrics */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <span className="font-display font-black text-[48px] leading-none text-crimson">
                {openIncidents}
              </span>
              <p className="font-display font-medium text-[9px] tracking-[2px] uppercase text-steel mt-1">
                Open
              </p>
            </div>
            <div className="text-center">
              <span className="font-display font-black text-[48px] leading-none text-midnight">
                {closedIncidents}
              </span>
              <p className="font-display font-medium text-[9px] tracking-[2px] uppercase text-steel mt-1">
                Closed
              </p>
            </div>
            <div className="text-center">
              <span className="font-display font-black text-[48px] leading-none text-gold">
                {recordableIncidents}
              </span>
              <p className="font-display font-medium text-[9px] tracking-[2px] uppercase text-steel mt-1">
                Recordable
              </p>
            </div>
          </div>

          {/* Mini Bar Chart */}
          <div className="flex items-end gap-1 h-[90px] mb-6">
            {[3, 5, 2, 4, 6, 3, 2, 5, 4, 3, 2, 4].map((val, i) => (
              <motion.div
                key={i}
                className="flex-1 bg-crimson/80"
                initial={{ height: 0 }}
                animate={{ height: `${val * 15}%` }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.05 }}
              />
            ))}
          </div>

          <Link 
            href="/dashboard/incidents/new"
            className="flex items-center gap-2 font-display font-semibold text-[11px] tracking-[2px] uppercase text-crimson hover:text-crimson/80 transition-colors"
          >
            Log New Incident
            <ArrowRight size={14} weight="bold" />
          </Link>
        </motion.div>
      </div>

      {/* BENTO ROW 2 - 70/30 Split */}
      <div className="grid lg:grid-cols-[70%_30%] gap-6">
        {/* Incident Trend Chart */}
        <motion.div 
          className="bg-brand-white border border-midnight/[0.08] p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-medium text-[10px] tracking-[3px] uppercase text-steel">
              Incident Trend — 24 Month
            </h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-midnight text-brand-white font-display font-medium text-[9px] tracking-[2px] uppercase">
                Monthly
              </button>
              <button className="px-3 py-1 border border-midnight/20 text-midnight font-display font-medium text-[9px] tracking-[2px] uppercase hover:bg-midnight/[0.04]">
                Quarterly
              </button>
            </div>
          </div>

          {/* Area Chart */}
          <div className="relative h-[200px] border-l border-b border-midnight/10">
            <svg className="w-full h-full" viewBox="0 0 900 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0B1D3A" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#0B1D3A" stopOpacity="0" />
                </linearGradient>
              </defs>
              <motion.path
                d="M0,150 C50,140 100,120 150,130 C200,140 250,100 300,110 C350,120 400,80 450,90 C500,100 550,60 600,70 C650,80 700,40 750,50 C800,60 850,30 900,40 L900,200 L0,200 Z"
                fill="url(#areaGradient)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
              />
              <motion.path
                d="M0,150 C50,140 100,120 150,130 C200,140 250,100 300,110 C350,120 400,80 450,90 C500,100 550,60 600,70 C650,80 700,40 750,50 C800,60 850,30 900,40"
                fill="none"
                stroke="#0B1D3A"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5 }}
              />
              <motion.path
                d="M0,180 C50,175 100,165 150,170 C200,175 250,155 300,160 C350,165 400,145 450,150 C500,155 550,135 600,140 C650,145 700,125 750,130 C800,135 850,120 900,125"
                fill="none"
                stroke="#C41230"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 0.3 }}
              />
            </svg>
            
            {/* Legend */}
            <div className="absolute top-2 right-2 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-[2px] bg-midnight" />
                <span className="font-sans text-[10px] text-steel">Total</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-[2px] bg-crimson" />
                <span className="font-sans text-[10px] text-steel">Recordable</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Regulatory Feed */}
        <motion.div 
          className="bg-brand-white border border-midnight/[0.08] p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-medium text-[10px] tracking-[3px] uppercase text-steel">
              Regulatory Feed
            </h3>
            <span className="px-2 py-0.5 bg-crimson text-brand-white font-display font-bold text-[9px] rounded-full">
              3
            </span>
          </div>
          
          <ul className="space-y-4">
            {regulatoryUpdates.map((update, i) => (
              <li key={i} className="pb-4 border-b border-midnight/[0.06] last:border-0 last:pb-0">
                <div className="flex items-start gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                    update.severity === 'high' ? 'bg-crimson' : 
                    update.severity === 'medium' ? 'bg-gold' : 'bg-steel'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-1.5 py-0.5 bg-gold/10 border border-gold/30 font-display font-medium text-[8px] tracking-[1px] text-gold">
                        {update.code}
                      </span>
                      <span className="font-sans text-[10px] text-steel">{update.date}</span>
                    </div>
                    <p className="font-sans text-[12px] text-midnight line-clamp-2">{update.title}</p>
                  </div>
                </div>
                {update.unread && (
                  <span className="inline-block mt-2 px-2 py-0.5 bg-crimson/10 text-crimson font-display font-medium text-[8px] tracking-[1px] uppercase">
                    Unread
                  </span>
                )}
              </li>
            ))}
          </ul>

          <Link 
            href="/dashboard/regulations"
            className="flex items-center gap-2 mt-4 font-display font-semibold text-[11px] tracking-[2px] uppercase text-gold hover:text-gold/80 transition-colors"
          >
            View All Updates
            <ArrowRight size={14} weight="bold" />
          </Link>
        </motion.div>
      </div>

      {/* BENTO ROW 3 - Delivery Timeline */}
      <motion.div 
        className="bg-brand-white border border-midnight/[0.08] p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <h3 className="font-display font-medium text-[10px] tracking-[3px] uppercase text-steel mb-6">
          Scheduled Delivery Timeline
        </h3>
        
        {/* Horizontal Timeline */}
        <div className="relative overflow-x-auto pb-4">
          <div className="flex items-center min-w-[800px]">
            {/* Timeline Line */}
            <div className="absolute top-6 left-0 right-0 h-[1px] bg-midnight/20" />
            
            {deliveryTimeline.map((item, i) => (
              <div key={i} className="flex-1 relative flex flex-col items-center">
                {/* Node */}
                <div className={`relative z-10 flex items-center justify-center ${
                  item.status === 'current' ? 'w-10 h-10' : 'w-9 h-9'
                }`}>
                  {item.status === 'sent' ? (
                    <div className="w-9 h-9 bg-[#2A7D4F] rounded-full flex items-center justify-center">
                      <Check size={16} weight="bold" className="text-white" />
                    </div>
                  ) : item.status === 'current' ? (
                    <div className="relative">
                      <motion.div 
                        className="absolute inset-0 bg-crimson/30 rounded-full"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <div className="w-10 h-10 bg-crimson rounded-full flex items-center justify-center relative z-10">
                        <Clock size={18} weight="bold" className="text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-9 h-9 bg-brand-white border-2 border-steel/30 rounded-full flex items-center justify-center">
                      <Clock size={14} className="text-steel" />
                    </div>
                  )}
                </div>
                
                {/* Date */}
                <span className={`mt-2 font-display font-bold text-[10px] tracking-[1px] ${
                  item.status === 'current' ? 'text-crimson' : 'text-midnight'
                }`}>
                  {item.date}
                </span>
                
                {/* Label */}
                <span className="font-sans text-[10px] text-steel text-center mt-1">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* BENTO ROW 4 - Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            icon: WarningCircle,
            title: "Log an Incident",
            description: "AI-powered classification + automatic PII removal.",
            cta: "Log Now",
            href: "/dashboard/incidents/new",
            color: "crimson"
          },
          {
            icon: FileText,
            title: "Request Doc Update",
            description: "Trigger on-demand AI document generation for your business.",
            cta: "Request",
            href: "/dashboard/documents/request",
            color: "gold"
          },
          {
            icon: Storefront,
            title: "Browse Marketplace",
            description: "Audit prep packages, training, contractor verification and more.",
            cta: "Explore",
            href: "/marketplace",
            color: "midnight"
          }
        ].map((action, i) => (
          <Link href={action.href} key={i}>
            <motion.div
              className="bg-brand-white border border-midnight/[0.08] p-6 group hover:shadow-lg hover:-translate-y-0.5 transition-all h-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
            >
              <action.icon size={32} className={`mb-4 ${
                action.color === 'crimson' ? 'text-crimson' : 
                action.color === 'gold' ? 'text-gold' : 'text-midnight'
              }`} />
              <h3 className="font-display font-bold text-[16px] text-midnight mb-2">
                {action.title}
              </h3>
              <p className="font-sans text-[13px] text-steel mb-4">
                {action.description}
              </p>
              <span className={`inline-flex items-center gap-2 font-display font-semibold text-[11px] tracking-[2px] uppercase ${
                action.color === 'crimson' ? 'text-crimson' : 
                action.color === 'gold' ? 'text-gold' : 'text-midnight'
              }`}>
                {action.cta}
                <ArrowRight size={14} weight="bold" />
              </span>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  )
}
