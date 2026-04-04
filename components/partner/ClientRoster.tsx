"use client"

import { motion } from "framer-motion"
import type { PartnerClient } from "@/lib/types/partner"

interface ClientRosterProps {
  clients: PartnerClient[]
  loading: boolean
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? "#2A7D4F" : score >= 60 ? "#C9A84C" : "#C41230"
  const bg =
    score >= 80 ? "bg-[#2A7D4F]/10" : score >= 60 ? "bg-gold/10" : "bg-crimson/10"
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 font-display font-medium text-[9px] tracking-[1px] uppercase ${bg}`}
      style={{ color }}
    >
      {score}%
    </span>
  )
}

function StatusBadge({ status }: { status: PartnerClient["status"] }) {
  const map = {
    active: { bg: "bg-[#2A7D4F]/10", text: "text-[#2A7D4F]", label: "Active" },
    suspended: { bg: "bg-gold/10", text: "text-gold", label: "Suspended" },
    churned: { bg: "bg-crimson/10", text: "text-crimson", label: "Churned" },
  }
  const s = map[status]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 font-display font-medium text-[9px] tracking-[1px] uppercase ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  )
}

function SkeletonRow() {
  return (
    <tr>
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-midnight/[0.06] animate-pulse rounded" />
        </td>
      ))}
    </tr>
  )
}

export default function ClientRoster({ clients, loading }: ClientRosterProps) {
  return (
    <div className="bg-brand-white border border-midnight/[0.08]">
      <div className="px-6 py-4 border-b border-midnight/[0.06]">
        <h2 className="font-display font-medium text-[10px] tracking-[3px] uppercase text-steel">
          Client Roster
        </h2>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-midnight/[0.06]">
              {["Client Name", "Vertical", "Plan", "Compliance Score", "Monthly Revenue", "Status"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left font-display font-medium text-[8px] tracking-[2px] uppercase text-steel"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(4)].map((_, i) => <SkeletonRow key={i} />)
            ) : clients.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <p className="font-sans text-[13px] text-steel">
                    No clients yet. Send assessments to start building your portfolio.
                  </p>
                </td>
              </tr>
            ) : (
              clients.map((client, i) => (
                <motion.tr
                  key={client.id}
                  className="border-b border-midnight/[0.04] last:border-0 hover:bg-midnight/[0.02] transition-colors"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                >
                  <td className="px-4 py-3 font-sans text-[13px] text-midnight font-medium">
                    {client.client_name}
                  </td>
                  <td className="px-4 py-3 font-sans text-[13px] text-steel capitalize">
                    {client.vertical}
                  </td>
                  <td className="px-4 py-3 font-sans text-[13px] text-steel capitalize">
                    {client.plan}
                  </td>
                  <td className="px-4 py-3">
                    <ScoreBadge score={client.compliance_score} />
                  </td>
                  <td className="px-4 py-3 font-sans text-[13px] text-midnight">
                    ${client.monthly_revenue.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={client.status} />
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-midnight/[0.06]">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="px-4 py-4 space-y-2">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-4 bg-midnight/[0.06] animate-pulse rounded" />
              ))}
            </div>
          ))
        ) : clients.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="font-sans text-[13px] text-steel">
              No clients yet. Send assessments to start building your portfolio.
            </p>
          </div>
        ) : (
          clients.map((client, i) => (
            <motion.div
              key={client.id}
              className="px-4 py-4 space-y-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <div className="flex items-center justify-between">
                <span className="font-sans text-[13px] text-midnight font-medium">{client.client_name}</span>
                <StatusBadge status={client.status} />
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-sans text-[12px] text-steel capitalize">{client.vertical}</span>
                <span className="text-steel/30">·</span>
                <span className="font-sans text-[12px] text-steel capitalize">{client.plan}</span>
                <span className="text-steel/30">·</span>
                <ScoreBadge score={client.compliance_score} />
                <span className="text-steel/30">·</span>
                <span className="font-sans text-[12px] text-midnight">${client.monthly_revenue.toLocaleString()}/mo</span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
