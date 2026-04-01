"use client"

import { motion } from "framer-motion"
import { ArrowRight, Check, Eye, ArrowSquareOut } from "@phosphor-icons/react"
import Link from "next/link"
import { useState } from "react"

const regulatoryUpdates = [
  {
    id: 1,
    severity: "high",
    code: "SB 553",
    issuingBody: "California DIR",
    publishedDate: "Jan 10, 2026",
    title: "Emergency Egress Amendment — Updated Signage Requirements",
    type: "amendment",
    summary: "Cal/OSHA has amended the emergency egress requirements under SB 553 to mandate updated exit signage in all workplace areas. The amendment requires photoluminescent signage to be installed within 90 days of the effective date.",
    effectiveDate: "Feb 15, 2026",
    complianceDeadline: "May 15, 2026",
    actionRequired: true,
    unread: true,
    impactText: "Your SB 553 Workplace Violence Prevention Plan requires an update to reflect new signage requirements."
  },
  {
    id: 2,
    severity: "high",
    code: "8 CCR 3203",
    issuingBody: "Cal/OSHA",
    publishedDate: "Jan 8, 2026",
    title: "Inspection Frequency Increase — Quarterly Self-Inspections Required",
    type: "amendment",
    summary: "The inspection frequency under 8 CCR 3203 has been increased from semi-annual to quarterly for all workplaces with more than 10 employees. This affects IIPP documentation and recordkeeping requirements.",
    effectiveDate: "Feb 1, 2026",
    complianceDeadline: "Feb 1, 2026",
    actionRequired: true,
    unread: true,
    impactText: "Your IIPP inspection schedule must be updated to quarterly frequency."
  },
  {
    id: 3,
    severity: "medium",
    code: "Cal/OSHA",
    issuingBody: "Cal/OSHA",
    publishedDate: "Jan 5, 2026",
    title: "Recordkeeping Supplemental Guidance Released",
    type: "guidance",
    summary: "Cal/OSHA has released supplemental guidance clarifying recordkeeping requirements for workplace incidents. The guidance provides examples of proper log entries and retention periods.",
    effectiveDate: "Immediate",
    complianceDeadline: null,
    actionRequired: false,
    unread: true,
    impactText: null
  },
  {
    id: 4,
    severity: "medium",
    code: "8 CCR 5194",
    issuingBody: "Cal/OSHA",
    publishedDate: "Dec 20, 2025",
    title: "Hazcom Label Format Clarification",
    type: "guidance",
    summary: "Updated guidance on GHS-compliant hazard communication labels, clarifying placement requirements and minimum text size for workplace chemicals.",
    effectiveDate: "Immediate",
    complianceDeadline: null,
    actionRequired: false,
    unread: false,
    impactText: null
  },
  {
    id: 5,
    severity: "low",
    code: "SB 553",
    issuingBody: "California DIR",
    publishedDate: "Dec 15, 2025",
    title: "SB 553 FAQ Document Published",
    type: "guidance",
    summary: "DIR has published a comprehensive FAQ document addressing common questions about SB 553 implementation, including training requirements and plan content.",
    effectiveDate: "Immediate",
    complianceDeadline: null,
    actionRequired: false,
    unread: false,
    impactText: null
  },
]

export default function RegulationsPage() {
  const [updates, setUpdates] = useState(regulatoryUpdates)

  const handleAcknowledge = (id: number) => {
    setUpdates(updates.map(u => u.id === id ? { ...u, unread: false } : u))
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
                onClick={() => handleAcknowledge(update.id)}
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
