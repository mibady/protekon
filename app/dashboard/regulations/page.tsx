"use client"

import { motion } from "framer-motion"
import { ArrowRight, Check, Eye, ArrowSquareOut } from "@phosphor-icons/react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { getRegulations, acknowledgeRegulation } from "@/lib/actions/reports"

type Regulation = {
  id: string; severity: string; code: string; issuingBody: string; publishedDate: string;
  title: string; type: string; summary: string; effectiveDate: string;
  complianceDeadline: string | null; actionRequired: boolean; unread: boolean; impactText: string | null;
}

export default function RegulationsPage() {
  const [updates, setUpdates] = useState<Regulation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getRegulations().then((data) => {
      setUpdates(data as Regulation[])
      setLoading(false)
    })
  }, [])

  const handleAcknowledge = async (id: string) => {
    setUpdates(updates.map(u => u.id === id ? { ...u, unread: false } : u))
    await acknowledgeRegulation(id)
  }

  const unreadCount = updates.filter(u => u.unread).length

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-[28px] text-midnight">Regulatory Updates</h1>
          <p className="font-sans text-[14px] text-steel mt-1">
            {unreadCount} unread update{unreadCount !== 1 ? 's' : ''} requiring attention
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-display font-medium text-[10px] tracking-[2px] uppercase text-steel">
            Filter by Severity:
          </span>
          <select className="bg-brand-white border border-midnight/[0.08] px-3 py-2 font-sans text-[13px] text-midnight">
            <option>All</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
      </div>

      {/* Update Cards */}
      <div className="space-y-4">
        {updates.map((update, i) => (
          <motion.div 
            key={update.id}
            className={`bg-brand-white border border-midnight/[0.08] overflow-hidden ${
              update.severity === 'high' ? 'border-l-4 border-l-crimson' :
              update.severity === 'medium' ? 'border-l-4 border-l-gold' :
              'border-l-4 border-l-steel'
            } ${update.unread ? 'border-t border-t-crimson/20' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <div className="p-6">
              {/* Top Row */}
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className={`px-2 py-1 font-display font-bold text-[9px] tracking-[1px] uppercase ${
                  update.severity === 'high' ? 'bg-crimson/10 text-crimson' :
                  update.severity === 'medium' ? 'bg-gold/10 text-gold' :
                  'bg-steel/10 text-steel'
                }`}>
                  {update.severity}
                </span>
                <span className="px-2 py-1 bg-gold/10 border border-gold/30 font-display font-medium text-[9px] tracking-[1px] text-gold">
                  {update.code}
                </span>
                <span className="font-sans text-[12px] text-steel">{update.issuingBody}</span>
                <span className="font-sans text-[12px] text-steel">{update.publishedDate}</span>
                {update.type === 'amendment' && (
                  <span className="px-2 py-0.5 bg-crimson text-white font-display font-bold text-[8px] tracking-[1px] uppercase">
                    Amendment
                  </span>
                )}
                {update.type === 'guidance' && (
                  <span className="px-2 py-0.5 bg-midnight text-white font-display font-bold text-[8px] tracking-[1px] uppercase">
                    Guidance
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="font-display font-semibold text-[16px] text-midnight mb-2">
                {update.title}
              </h3>

              {/* Summary */}
              <p className="font-sans text-[14px] text-steel leading-relaxed mb-4">
                {update.summary}
              </p>

              {/* Dates */}
              <div className="flex flex-wrap gap-6 mb-4">
                <div>
                  <span className="font-display font-medium text-[9px] tracking-[2px] uppercase text-steel block mb-1">
                    Effective Date
                  </span>
                  <span className="font-sans text-[13px] text-midnight">{update.effectiveDate}</span>
                </div>
                {update.complianceDeadline && (
                  <div>
                    <span className="font-display font-medium text-[9px] tracking-[2px] uppercase text-steel block mb-1">
                      Compliance Deadline
                    </span>
                    <span className="font-sans text-[13px] text-crimson font-medium">{update.complianceDeadline}</span>
                  </div>
                )}
              </div>

              {/* Impact Block */}
              {update.impactText && (
                <div className="bg-crimson/[0.04] border-l-2 border-crimson p-4 mb-4">
                  <span className="font-display font-bold text-[10px] tracking-[2px] uppercase text-crimson block mb-1">
                    Action Required
                  </span>
                  <p className="font-sans text-[13px] text-midnight">
                    {update.impactText}
                  </p>
                </div>
              )}

              {/* Status */}
              {update.unread && (
                <span className="inline-block px-2 py-0.5 bg-crimson/10 text-crimson font-display font-medium text-[9px] tracking-[1px] uppercase mb-4">
                  Unread
                </span>
              )}
            </div>

            {/* Action Row */}
            <div className="flex border-t border-midnight/[0.06]">
              <button 
                onClick={() => handleAcknowledge(String(update.id))}
                className={`flex-1 flex items-center justify-center gap-2 py-3 font-display font-medium text-[10px] tracking-[2px] uppercase transition-colors border-r border-midnight/[0.06] ${
                  update.unread 
                    ? 'text-midnight hover:bg-midnight/[0.04]' 
                    : 'text-[#2A7D4F] bg-[#2A7D4F]/[0.04]'
                }`}
              >
                <Check size={14} />
                {update.unread ? 'Acknowledge' : 'Acknowledged'}
              </button>
              {update.actionRequired && (
                <Link 
                  href="/dashboard/documents/request"
                  className="flex-1 flex items-center justify-center gap-2 py-3 font-display font-medium text-[10px] tracking-[2px] uppercase text-crimson hover:bg-crimson/[0.04] transition-colors border-r border-midnight/[0.06]"
                >
                  Request Doc Update
                  <ArrowRight size={14} weight="bold" />
                </Link>
              )}
              <button className="flex-1 flex items-center justify-center gap-2 py-3 font-display font-medium text-[10px] tracking-[2px] uppercase text-midnight hover:bg-midnight/[0.04] transition-colors">
                <ArrowSquareOut size={14} />
                View Source
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
