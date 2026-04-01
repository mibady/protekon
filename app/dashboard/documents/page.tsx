"use client"

import { motion } from "framer-motion"
import { FileText, Download, Eye, ArrowRight, ArrowsClockwise } from "@phosphor-icons/react"
import { useState } from "react"
import Link from "next/link"

const filterPills = ["ALL", "IIPP", "SB 553", "EMERGENCY", "HAZCOM", "REPORTS"]

const documents = [
  {
    id: 1,
    name: "Injury and Illness Prevention Program",
    type: "IIPP",
    category: "required",
    status: "current",
    lastUpdated: "Jan 8, 2026",
    autoUpdate: true,
    regulations: ["8 CCR 3203", "Cal/OSHA"],
    version: "v2.3",
    hasUpdate: false,
  },
  {
    id: 2,
    name: "Workplace Violence Prevention Plan",
    type: "SB 553",
    category: "required",
    status: "current",
    lastUpdated: "Dec 15, 2025",
    autoUpdate: true,
    regulations: ["SB 553", "8 CCR 3343"],
    version: "v1.4",
    hasUpdate: true,
  },
  {
    id: 3,
    name: "Emergency Action Plan",
    type: "EMERGENCY",
    category: "required",
    status: "review",
    lastUpdated: "Nov 20, 2025",
    autoUpdate: true,
    regulations: ["8 CCR 3220"],
    version: "v1.2",
    hasUpdate: false,
  },
  {
    id: 4,
    name: "Hazard Communication Program",
    type: "HAZCOM",
    category: "required",
    status: "current",
    lastUpdated: "Nov 3, 2025",
    autoUpdate: true,
    regulations: ["8 CCR 5194"],
    version: "v2.1",
    hasUpdate: false,
  },
  {
    id: 5,
    name: "Heat Illness Prevention Plan",
    type: "IIPP",
    category: "recommended",
    status: "current",
    lastUpdated: "Oct 15, 2025",
    autoUpdate: true,
    regulations: ["8 CCR 3395"],
    version: "v1.1",
    hasUpdate: false,
  },
  {
    id: 6,
    name: "Q4 2025 Compliance Summary",
    type: "REPORTS",
    category: "report",
    status: "final",
    lastUpdated: "Jan 5, 2026",
    autoUpdate: false,
    regulations: [],
    version: "Final",
    hasUpdate: false,
  },
]

export default function DocumentsPage() {
  const [activeFilter, setActiveFilter] = useState("ALL")

  const filteredDocs = activeFilter === "ALL" 
    ? documents 
    : documents.filter(d => d.type === activeFilter)

  const docCount = filteredDocs.length

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-[28px] text-midnight">My Documents</h1>
          <p className="font-sans text-[14px] text-steel mt-1">
            {docCount} document{docCount !== 1 ? 's' : ''} in your library
          </p>
        </div>
        <Link 
          href="/dashboard/documents/request"
          className="inline-flex items-center gap-2 bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[2px] uppercase px-6 py-3 hover:brightness-110 transition-all"
        >
          Request New Document
        </Link>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filterPills.map((pill) => (
          <button
            key={pill}
            onClick={() => setActiveFilter(pill)}
            className={`px-4 py-2 font-display font-medium text-[10px] tracking-[2px] uppercase transition-colors ${
              activeFilter === pill 
                ? 'bg-midnight text-brand-white' 
                : 'bg-brand-white border border-midnight/10 text-midnight hover:bg-midnight/[0.04]'
            }`}
          >
            {pill}
          </button>
        ))}
      </div>

      {/* Document Cards Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredDocs.map((doc, i) => (
          <motion.div 
            key={doc.id}
            className={`bg-brand-white border border-midnight/[0.08] overflow-hidden ${
              doc.category === 'required' ? 'border-t-[3px] border-t-crimson' :
              doc.category === 'recommended' ? 'border-t-[3px] border-t-gold' :
              'border-t-[3px] border-t-steel'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <div className="p-6">
              {/* Type Eyebrow */}
              <div className="flex items-center justify-between mb-3">
                <span className={`font-display font-medium text-[9px] tracking-[2px] uppercase ${
                  doc.category === 'required' ? 'text-crimson' :
                  doc.category === 'recommended' ? 'text-gold' : 'text-steel'
                }`}>
                  {doc.category === 'required' ? 'Required Document' :
                   doc.category === 'recommended' ? 'Recommended' : 'Report'}
                </span>
                {doc.hasUpdate && (
                  <span className="px-2 py-0.5 bg-gold text-midnight font-display font-bold text-[8px] tracking-[1px] uppercase">
                    Update Available
                  </span>
                )}
              </div>

              {/* Document Name */}
              <h3 className="font-display font-bold text-[18px] text-midnight mb-2">
                {doc.name}
              </h3>

              {/* Meta Row */}
              <div className="flex items-center gap-4 text-steel font-sans text-[12px] mb-4">
                <span>{doc.version}</span>
                <span>Updated {doc.lastUpdated}</span>
                {doc.autoUpdate && (
                  <span className="flex items-center gap-1 text-gold">
                    <ArrowsClockwise size={12} />
                    Auto-update
                  </span>
                )}
              </div>

              {/* Regulation Tags */}
              {doc.regulations.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {doc.regulations.map((reg) => (
                    <span key={reg} className="px-2 py-1 border border-gold/30 bg-gold/5 font-display font-medium text-[9px] tracking-[1px] text-gold">
                      {reg}
                    </span>
                  ))}
                </div>
              )}

              {/* Status */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`w-2 h-2 rounded-full ${
                  doc.status === 'current' ? 'bg-[#2A7D4F]' :
                  doc.status === 'review' ? 'bg-gold' : 'bg-steel'
                }`} />
                <span className={`font-display font-medium text-[10px] tracking-[2px] uppercase ${
                  doc.status === 'current' ? 'text-[#2A7D4F]' :
                  doc.status === 'review' ? 'text-gold' : 'text-steel'
                }`}>
                  {doc.status === 'current' ? 'Current' :
                   doc.status === 'review' ? 'Review Due' : 'Final'}
                </span>
              </div>
            </div>

            {/* Action Row */}
            <div className="flex border-t border-midnight/[0.06]">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 font-display font-medium text-[10px] tracking-[2px] uppercase text-midnight hover:bg-midnight/[0.04] transition-colors border-r border-midnight/[0.06]">
                <Download size={14} />
                Download PDF
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 font-display font-medium text-[10px] tracking-[2px] uppercase text-midnight hover:bg-midnight/[0.04] transition-colors border-r border-midnight/[0.06]">
                <Eye size={14} />
                View Online
              </button>
              <Link 
                href="/dashboard/documents/request"
                className="flex-1 flex items-center justify-center gap-2 py-3 font-display font-medium text-[10px] tracking-[2px] uppercase text-crimson hover:bg-crimson/[0.04] transition-colors"
              >
                Request Update
                <ArrowRight size={14} weight="bold" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredDocs.length === 0 && (
        <div className="text-center py-12 bg-brand-white border border-midnight/[0.08]">
          <FileText size={48} className="text-steel/30 mx-auto mb-4" />
          <p className="font-sans text-[14px] text-steel">No documents found in this category</p>
        </div>
      )}
    </div>
  )
}
