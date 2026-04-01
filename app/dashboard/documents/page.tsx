"use client"

import { motion } from "framer-motion"
import { FileText, Download, Eye, ArrowRight, ArrowsClockwise } from "@phosphor-icons/react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { getDocuments } from "@/lib/actions/documents"
import type { Document } from "@/lib/types"

const filterPills = ["ALL", "IIPP", "SB 553", "EMERGENCY", "HAZCOM", "REPORTS"]

const typeLabels: Record<string, string> = {
  iipp: "IIPP",
  sb553: "SB 553",
  eap: "EMERGENCY",
  hazcom: "HAZCOM",
  heat: "IIPP",
  custom: "REPORTS",
}

export default function DocumentsPage() {
  const [activeFilter, setActiveFilter] = useState("ALL")
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDocuments().then((docs) => {
      setDocuments(docs)
      setLoading(false)
    })
  }, [])

  const filteredDocs = activeFilter === "ALL"
    ? documents
    : documents.filter(d => (typeLabels[d.type] || d.type.toUpperCase()) === activeFilter)

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

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-midnight/20 border-t-midnight rounded-full animate-spin mx-auto mb-4" />
          <p className="font-sans text-[14px] text-steel">Loading documents...</p>
        </div>
      )}

      {/* Document Cards Grid */}
      {!loading && (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredDocs.map((doc, i) => {
            const displayType = typeLabels[doc.type] || doc.type.toUpperCase()
            const isRequested = doc.status === "requested"
            const statusColor = isRequested ? "gold" : doc.status === "current" ? "#2A7D4F" : "steel"
            const statusLabel = isRequested ? "Requested" : doc.status === "current" ? "Current" : doc.status === "review" ? "Review Due" : "Final"

            return (
              <motion.div
                key={doc.id}
                className={`bg-brand-white border border-midnight/[0.08] overflow-hidden ${
                  isRequested ? "border-t-[3px] border-t-gold" : "border-t-[3px] border-t-crimson"
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <div className="p-6">
                  {/* Type Eyebrow */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-display font-medium text-[9px] tracking-[2px] uppercase text-crimson">
                      {displayType}
                    </span>
                    {doc.priority === "rush" && (
                      <span className="px-2 py-0.5 bg-gold text-midnight font-display font-bold text-[8px] tracking-[1px] uppercase">
                        Rush
                      </span>
                    )}
                  </div>

                  {/* Document Name */}
                  <h3 className="font-display font-bold text-[18px] text-midnight mb-2">
                    {doc.filename.replace(".pdf", "")}
                  </h3>

                  {/* Meta Row */}
                  <div className="flex items-center gap-4 text-steel font-sans text-[12px] mb-4">
                    <span>{doc.document_id}</span>
                    <span>{new Date(doc.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    {doc.pages && <span>{doc.pages} pages</span>}
                  </div>

                  {/* Notes */}
                  {doc.notes && (
                    <p className="font-sans text-[12px] text-steel mb-4 line-clamp-2">
                      {doc.notes}
                    </p>
                  )}

                  {/* Status */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColor }} />
                    <span className="font-display font-medium text-[10px] tracking-[2px] uppercase" style={{ color: statusColor }}>
                      {statusLabel}
                    </span>
                  </div>
                </div>

                {/* Action Row */}
                <div className="flex border-t border-midnight/[0.06]">
                  {doc.storage_url ? (
                    <>
                      <button className="flex-1 flex items-center justify-center gap-2 py-3 font-display font-medium text-[10px] tracking-[2px] uppercase text-midnight hover:bg-midnight/[0.04] transition-colors border-r border-midnight/[0.06]">
                        <Download size={14} />
                        Download PDF
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 py-3 font-display font-medium text-[10px] tracking-[2px] uppercase text-midnight hover:bg-midnight/[0.04] transition-colors border-r border-midnight/[0.06]">
                        <Eye size={14} />
                        View Online
                      </button>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center gap-2 py-3 font-display font-medium text-[10px] tracking-[2px] uppercase text-steel border-r border-midnight/[0.06]">
                      <ArrowsClockwise size={14} className="animate-spin-slow" />
                      Generating...
                    </div>
                  )}
                  <Link
                    href="/dashboard/documents/request"
                    className="flex-1 flex items-center justify-center gap-2 py-3 font-display font-medium text-[10px] tracking-[2px] uppercase text-crimson hover:bg-crimson/[0.04] transition-colors"
                  >
                    Request Update
                    <ArrowRight size={14} weight="bold" />
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {!loading && filteredDocs.length === 0 && (
        <div className="text-center py-12 bg-brand-white border border-midnight/[0.08]">
          <FileText size={48} className="text-steel/30 mx-auto mb-4" />
          <p className="font-sans text-[14px] text-steel">
            {documents.length === 0
              ? "No documents yet. Request your first compliance document."
              : "No documents found in this category"}
          </p>
        </div>
      )}
    </div>
  )
}
