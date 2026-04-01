"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { 
  FileText, 
  WarningCircle, 
  Bell, 
  ArrowRight,
  CheckCircle,
  Clock,
  TrendUp
} from "@phosphor-icons/react"

const documents = [
  { name: "IIPP — Injury and Illness Prevention Program", status: "current", updated: "Mar 15, 2025" },
  { name: "SB 553 Workplace Violence Prevention Plan", status: "current", updated: "Mar 15, 2025" },
  { name: "Emergency Action Plan", status: "pending", updated: "Generating..." },
]

const recentAlerts = [
  { title: "Cal/OSHA Update: 8 CCR 3203 Amendment", date: "Mar 28, 2025", type: "regulatory" },
  { title: "Quarterly Review Scheduled", date: "Apr 1, 2025", type: "reminder" },
  { title: "Document Delivery: Monthly Report", date: "Mar 25, 2025", type: "delivery" },
]

const stats = [
  { label: "Compliance Score", value: "87", suffix: "/100", icon: TrendUp, color: "text-gold" },
  { label: "Active Documents", value: "4", suffix: "", icon: FileText, color: "text-parchment" },
  { label: "Incidents (YTD)", value: "2", suffix: "", icon: WarningCircle, color: "text-parchment" },
  { label: "Pending Alerts", value: "3", suffix: "", icon: Bell, color: "text-crimson" },
]

export default function DashboardPage() {
  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Welcome */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display font-black text-[32px] text-midnight mb-2">
          Welcome back, Demo User
        </h1>
        <p className="font-sans text-[16px] text-steel">
          Your compliance status is healthy. Here&apos;s what&apos;s happening.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="bg-midnight p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
          >
            <div className="flex items-center justify-between mb-4">
              <stat.icon size={24} className={stat.color} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`font-display font-black text-[36px] ${stat.color}`}>
                {stat.value}
              </span>
              <span className="font-display font-medium text-[14px] text-steel">
                {stat.suffix}
              </span>
            </div>
            <p className="font-display font-medium text-[10px] tracking-[2px] uppercase text-steel mt-2">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Documents */}
        <motion.div
          className="lg:col-span-2 bg-brand-white border border-midnight/[0.06]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="p-6 border-b border-midnight/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-crimson" />
              <h2 className="font-display font-bold text-[14px] tracking-[2px] uppercase text-midnight">
                Your Documents
              </h2>
            </div>
            <Link 
              href="/dashboard/documents" 
              className="font-display font-medium text-[10px] tracking-[2px] uppercase text-crimson hover:text-crimson/80 flex items-center gap-1"
            >
              View All
              <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-midnight/[0.06]">
            {documents.map((doc) => (
              <div key={doc.name} className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <FileText size={24} className="text-midnight" />
                  <div>
                    <h3 className="font-display font-semibold text-[14px] text-midnight">
                      {doc.name}
                    </h3>
                    <p className="font-sans text-[12px] text-steel">
                      Updated: {doc.updated}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {doc.status === "current" ? (
                    <>
                      <CheckCircle size={16} className="text-green-600" />
                      <span className="font-display text-[10px] tracking-[1px] uppercase text-green-600">
                        Current
                      </span>
                    </>
                  ) : (
                    <>
                      <Clock size={16} className="text-gold" />
                      <span className="font-display text-[10px] tracking-[1px] uppercase text-gold">
                        Pending
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Alerts */}
        <motion.div
          className="bg-brand-white border border-midnight/[0.06]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="p-6 border-b border-midnight/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-gold" />
              <h2 className="font-display font-bold text-[14px] tracking-[2px] uppercase text-midnight">
                Recent Alerts
              </h2>
            </div>
            <Link 
              href="/dashboard/alerts" 
              className="font-display font-medium text-[10px] tracking-[2px] uppercase text-crimson hover:text-crimson/80 flex items-center gap-1"
            >
              View All
              <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-midnight/[0.06]">
            {recentAlerts.map((alert, i) => (
              <div key={i} className="p-4">
                <div className="flex items-start gap-3">
                  <Bell 
                    size={16} 
                    className={
                      alert.type === "regulatory" ? "text-crimson" : 
                      alert.type === "reminder" ? "text-gold" : "text-steel"
                    } 
                  />
                  <div>
                    <h3 className="font-sans font-medium text-[13px] text-midnight leading-tight">
                      {alert.title}
                    </h3>
                    <p className="font-sans text-[11px] text-steel mt-1">
                      {alert.date}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Link
          href="/dashboard/incidents/new"
          className="p-6 bg-crimson text-parchment flex flex-col items-center text-center hover:bg-crimson/90 transition-colors"
        >
          <WarningCircle size={28} className="mb-3" />
          <span className="font-display font-semibold text-[11px] tracking-[2px] uppercase">
            Log Incident
          </span>
        </Link>
        <Link
          href="/dashboard/documents"
          className="p-6 bg-midnight text-parchment flex flex-col items-center text-center hover:bg-midnight/90 transition-colors"
        >
          <FileText size={28} className="mb-3" />
          <span className="font-display font-semibold text-[11px] tracking-[2px] uppercase">
            View Documents
          </span>
        </Link>
        <Link
          href="/dashboard/alerts"
          className="p-6 border border-midnight/[0.1] text-midnight flex flex-col items-center text-center hover:border-midnight/20 transition-colors"
        >
          <Bell size={28} className="mb-3" />
          <span className="font-display font-semibold text-[11px] tracking-[2px] uppercase">
            Check Alerts
          </span>
        </Link>
        <Link
          href="/dashboard/settings"
          className="p-6 border border-midnight/[0.1] text-midnight flex flex-col items-center text-center hover:border-midnight/20 transition-colors"
        >
          <TrendUp size={28} className="mb-3" />
          <span className="font-display font-semibold text-[11px] tracking-[2px] uppercase">
            Get Report
          </span>
        </Link>
      </motion.div>
    </div>
  )
}
