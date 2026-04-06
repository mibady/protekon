"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Users, CurrencyDollar, ChartLine, ClipboardText } from "@phosphor-icons/react"
import { getPartnerStats, getPartnerClients } from "@/lib/actions/partner-portal"
import ClientRoster from "@/components/partner/ClientRoster"
import type { PartnerClient } from "@/lib/types/partner"

type Stats = {
  totalClients: number
  mrr: number
  avgScore: number
  assessmentsSent: number
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  delay,
}: {
  icon: React.ElementType
  label: string
  value: string
  sub?: string
  delay: number
}) {
  return (
    <motion.div
      className="bg-midnight p-6 flex flex-col gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-steel" />
        <span className="font-display font-medium text-[10px] tracking-[2px] uppercase text-steel">
          {label}
        </span>
      </div>
      <span className="font-display font-black text-[36px] leading-none text-brand-white">
        {value}
      </span>
      {sub && (
        <span className="font-sans text-[11px] text-steel">{sub}</span>
      )}
    </motion.div>
  )
}

function scoreColor(score: number) {
  if (score >= 80) return "#2A7D4F"
  if (score >= 60) return "#C9A84C"
  return "#C41230"
}

export default function PartnerDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [clients, setClients] = useState<PartnerClient[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getPartnerStats(), getPartnerClients()]).then(([s, c]) => {
      setStats(s)
      setClients(c)
      setLoading(false)
    })
  }, [])

  const avgScoreValue = stats?.avgScore ?? 0

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Stats Row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Clients"
          value={loading ? "—" : String(stats?.totalClients ?? 0)}
          delay={0}
        />
        <StatCard
          icon={CurrencyDollar}
          label="Monthly Revenue"
          value={loading ? "—" : `$${(stats?.mrr ?? 0).toLocaleString()}`}
          sub="Active clients"
          delay={0.08}
        />
        <motion.div
          className="bg-midnight p-6 flex flex-col gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.16 }}
        >
          <div className="flex items-center gap-2">
            <ChartLine size={14} className="text-steel" />
            <span className="font-display font-medium text-[10px] tracking-[2px] uppercase text-steel">
              Avg Compliance Score
            </span>
          </div>
          <span
            className="font-display font-black text-[36px] leading-none"
            style={{ color: loading ? "#6B7280" : scoreColor(avgScoreValue) }}
          >
            {loading ? "—" : avgScoreValue}
          </span>
          <span className="font-sans text-[11px] text-steel">Across active clients</span>
        </motion.div>
        <StatCard
          icon={ClipboardText}
          label="Assessments Sent"
          value={loading ? "—" : String(stats?.assessmentsSent ?? 0)}
          sub="All time"
          delay={0.24}
        />
      </div>

      {/* Client Roster */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <ClientRoster clients={clients} loading={loading} />
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        className="flex items-center justify-between bg-brand-white border border-midnight/[0.08] px-6 py-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.36 }}
      >
        <div>
          <h3 className="font-display font-bold text-[14px] tracking-[1px] text-midnight">
            Ready to grow your portfolio?
          </h3>
          <p className="font-sans text-[13px] text-steel mt-1">
            Send a compliance assessment to a prospect and convert them into a managed client.
          </p>
        </div>
        <Link
          href="/partner/assessments"
          className="flex-shrink-0 flex items-center gap-2 bg-crimson text-brand-white px-5 py-2.5 font-display font-semibold text-[12px] tracking-[2px] uppercase hover:bg-crimson/90 transition-colors ml-6"
        >
          Send Assessment
          <ArrowRight size={14} weight="bold" />
        </Link>
      </motion.div>
    </div>
  )
}
