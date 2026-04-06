"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Download, EnvelopeSimple, CaretDown, CaretUp, Check } from "@phosphor-icons/react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { getDocumentHistory } from "@/lib/actions/reports"

export default function DocumentHistoryReportPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getDocumentHistory>> | null>(null)

  useEffect(() => {
    getDocumentHistory().then(setData)
  }, [])

  const stats = data?.stats ?? []
  const documents = data?.documents ?? []
  const deliveryLog = data?.deliveryLog ?? []
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null)

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
          <span className="font-display font-medium text-[12px] tracking-[3px] uppercase text-midnight block mb-1">
            On Demand Report
          </span>
          <h1 className="font-display font-bold text-[28px] text-midnight">Document History Report</h1>
          <p className="font-sans text-[14px] text-steel mt-1">
            Generated January 15, 2026
          </p>
        </div>
        <button
          onClick={() => window.open("/api/export/report?type=document-history&format=pdf")}
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
        <div className="grid grid-cols-3 gap-6">
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

      {/* Section 2: Version Timeline */}
      <motion.div 
        className="bg-brand-white border border-midnight/[0.08] mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="p-4 border-b border-midnight/[0.06]">
          <h3 className="font-display font-bold text-[12px] tracking-[3px] uppercase text-midnight">
            Version Timeline
          </h3>
        </div>
        <div className="divide-y divide-midnight/[0.06]">
          {documents.map((doc) => (
            <div key={doc.name}>
              <button 
                onClick={() => setExpandedDoc(expandedDoc === doc.name ? null : doc.name)}
                className="w-full flex items-center justify-between p-4 hover:bg-parchment/30 transition-colors"
              >
                <span className="font-display font-semibold text-[14px] text-midnight">{doc.name}</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[12px] text-steel">{doc.versions.length} versions</span>
                  {expandedDoc === doc.name ? (
                    <CaretUp size={16} className="text-steel" />
                  ) : (
                    <CaretDown size={16} className="text-steel" />
                  )}
                </div>
              </button>
              {expandedDoc === doc.name && (
                <div className="px-4 pb-4">
                  <div className="border-l-[3px] border-crimson pl-4 space-y-4">
                    {doc.versions.map((v, i) => (
                      <div 
                        key={v.version}
                        className={`relative pl-4 ${v.current ? 'bg-crimson/[0.04] -ml-4 p-4 border-l-[3px] border-crimson' : ''}`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-display font-extrabold text-[14px] text-crimson">{v.version}</span>
                              <span className="font-sans text-[12px] text-steel">{v.date}</span>
                              {v.current && (
                                <span className="px-2 py-0.5 bg-crimson text-white font-display font-bold text-[10px] tracking-[1px] uppercase">
                                  Current
                                </span>
                              )}
                            </div>
                            <p className="font-sans text-[13px] text-midnight mb-2">{v.reason}</p>
                            <span className="px-2 py-0.5 bg-gold/10 border border-gold/30 font-display font-medium text-[10px] tracking-[1px] text-gold">
                              {v.regulation}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-steel">
                            {v.delivered && (
                              <div className="flex items-center gap-1">
                                <EnvelopeSimple size={14} />
                                <span className="font-sans text-[11px]">Delivered</span>
                              </div>
                            )}
                            {v.opened && (
                              <div className="flex items-center gap-1 text-[#2A7D4F]">
                                <Check size={14} />
                                <span className="font-sans text-[11px]">Opened</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Section 3: Delivery Log Table */}
      <motion.div 
        className="bg-brand-white border border-midnight/[0.08] overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="p-4 border-b border-midnight/[0.06] flex items-center justify-between">
          <h3 className="font-display font-bold text-[12px] tracking-[3px] uppercase text-midnight">
            Full Delivery Log
          </h3>
          <button
            onClick={() => {
              if (!deliveryLog.length) return
              const headers = ["Date", "Document", "Version", "Recipient", "Status", "Open Time"]
              const rows = deliveryLog.map((log) => [log.date, log.document, log.version, log.recipient, log.status, log.openTime].join(","))
              const csv = [headers.join(","), ...rows].join("\n")
              const blob = new Blob([csv], { type: "text/csv" })
              const url = URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = url
              a.download = "document-history.csv"
              a.click()
              URL.revokeObjectURL(url)
            }}
            className="font-display font-medium text-[12px] tracking-[2px] uppercase text-gold hover:text-gold/80"
          >
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-midnight/[0.06] bg-parchment/50">
                <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Date</th>
                <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Document</th>
                <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Version</th>
                <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Recipient</th>
                <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Status</th>
                <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Open Time</th>
              </tr>
            </thead>
            <tbody>
              {deliveryLog.map((log, i) => (
                <tr key={i} className="border-b border-midnight/[0.06] last:border-0">
                  <td className="px-4 py-3 font-sans text-[12px] text-midnight">{log.date}</td>
                  <td className="px-4 py-3 font-sans text-[13px] text-midnight">{log.document}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-midnight">{log.version}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-steel">{log.recipient}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 font-display font-medium text-[10px] tracking-[1px] uppercase ${
                      log.status === 'Opened' ? 'bg-[#2A7D4F]/10 text-[#2A7D4F]' : 'bg-steel/10 text-steel'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-sans text-[12px] text-steel">{log.openTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-parchment/50 border-t border-midnight/[0.06]">
          <p className="font-sans text-[12px] text-steel italic">
            Retained per legal requirements (5-year minimum)
          </p>
        </div>
      </motion.div>
    </div>
  )
}
