"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Download, EnvelopeSimple, Check, Eye } from "@phosphor-icons/react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { getDeliveryLog } from "@/lib/actions/reports"

export default function DeliveryLogReportPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getDeliveryLog>> | null>(null)

  useEffect(() => {
    getDeliveryLog().then(setData)
  }, [])

  const stats = (data?.stats ?? []) as { label: string; value: number | string }[]
  const deliveries = data?.deliveries ?? []
  const deliverySchedule = (data?.deliverySchedule ?? []) as { type: string; frequency: string; next: string }[]
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
            On Demand Report
          </span>
          <h1 className="font-display font-bold text-[28px] text-midnight">Delivery Log Report</h1>
          <p className="font-sans text-[14px] text-steel mt-1">
            Generated January 15, 2026
          </p>
        </div>
        <button className="inline-flex items-center gap-2 bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[2px] uppercase px-6 py-3 hover:brightness-110 transition-all">
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Section 2: Delivery Table */}
        <motion.div 
          className="lg:col-span-2 bg-brand-white border border-midnight/[0.08] overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="p-4 border-b border-midnight/[0.06] flex items-center justify-between">
            <h3 className="font-display font-bold text-[12px] tracking-[3px] uppercase text-midnight">
              All Deliveries
            </h3>
            <button className="font-display font-medium text-[10px] tracking-[2px] uppercase text-gold hover:text-gold/80">
              Export CSV
            </button>
          </div>
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-parchment/90 backdrop-blur-sm">
                <tr className="border-b border-midnight/[0.06]">
                  <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Date</th>
                  <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Type</th>
                  <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Name</th>
                  <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Status</th>
                  <th className="text-left px-4 py-3 font-display text-[9px] tracking-[2px] uppercase text-steel">Open Time</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((d, i) => (
                  <tr key={i} className="border-b border-midnight/[0.06] last:border-0 hover:bg-parchment/30">
                    <td className="px-4 py-3 font-sans text-[12px] text-midnight">{d.date}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 font-display font-medium text-[8px] tracking-[1px] uppercase ${
                        d.type === 'Document' ? 'bg-midnight text-white' :
                        d.type === 'Report' ? 'bg-gold/10 text-gold' :
                        'bg-crimson/10 text-crimson'
                      }`}>
                        {d.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-sans text-[13px] text-midnight">{d.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {d.status === 'Opened' ? (
                          <>
                            <Eye size={12} className="text-[#2A7D4F]" />
                            <span className="font-display font-medium text-[10px] tracking-[1px] uppercase text-[#2A7D4F]">Opened</span>
                          </>
                        ) : (
                          <>
                            <EnvelopeSimple size={12} className="text-steel" />
                            <span className="font-display font-medium text-[10px] tracking-[1px] uppercase text-steel">Sent</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-sans text-[12px] text-steel">{d.openTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-parchment/50 border-t border-midnight/[0.06]">
            <p className="font-sans text-[12px] text-steel italic">
              Showing last 10 deliveries • Full history available in export
            </p>
          </div>
        </motion.div>

        {/* Section 3: Delivery Schedule */}
        <motion.div 
          className="bg-brand-white border border-midnight/[0.08]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="p-4 border-b border-midnight/[0.06]">
            <h3 className="font-display font-bold text-[12px] tracking-[3px] uppercase text-midnight">
              Upcoming Schedule
            </h3>
          </div>
          <div className="divide-y divide-midnight/[0.06]">
            {deliverySchedule.map((s, i) => (
              <div key={i} className="p-4">
                <span className="font-display font-semibold text-[14px] text-midnight block mb-1">{s.type}</span>
                <span className="font-sans text-[12px] text-steel block mb-2">{s.frequency}</span>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-gold" />
                  <span className="font-mono text-[12px] text-gold">Next: {s.next}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-midnight/[0.06]">
            <Link
              href="/dashboard/settings"
              className="font-display font-semibold text-[11px] tracking-[2px] uppercase text-crimson hover:text-crimson/80"
            >
              Manage Delivery Preferences
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
