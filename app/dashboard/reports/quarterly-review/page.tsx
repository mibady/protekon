"use client"

import { motion } from "framer-motion"
import { ArrowLeft, CalendarBlank, TrendUp, TrendDown, ShieldCheck, WarningCircle, FileText, Bell } from "@phosphor-icons/react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { getComplianceScoreReport } from "@/lib/actions/reports"
import { getClientProfile } from "@/lib/actions/settings"
import type { ClientProfile } from "@/lib/types"

type ReviewData = {
  score: number
  monthlyScores: { month: string; score: number }[]
  documents: { name: string; status: string; updated: string; regulation: string; points: string }[]
  categories: { name: string; score: number; max: number; weight: string }[]
}

function currentQuarterLabel(): string {
  const d = new Date()
  const q = Math.floor(d.getMonth() / 3) + 1
  return `Q${q} ${d.getFullYear()}`
}

function previousQuarterLabel(): string {
  const d = new Date()
  const q = Math.floor(d.getMonth() / 3) + 1
  if (q === 1) return `Q4 ${d.getFullYear() - 1}`
  return `Q${q - 1} ${d.getFullYear()}`
}

export default function QuarterlyReviewPage() {
  const [data, setData] = useState<ReviewData | null>(null)
  const [client, setClient] = useState<ClientProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getComplianceScoreReport(), getClientProfile()]).then(([report, profile]) => {
      setData(report)
      setClient(profile)
      setLoading(false)
    })
  }, [])

  const tier = client?.plan ?? "core"
  const eligible = tier === "professional" || tier === "multi-site"
  const bookingUrl = process.env.NEXT_PUBLIC_REVIEW_BOOKING_URL || ""

  if (loading) {
    return (
      <div className="p-8 text-steel font-sans text-[14px]">Loading quarterly review...</div>
    )
  }

  if (!eligible) {
    return (
      <div className="p-8 max-w-[720px]">
        <Link href="/dashboard/reports" className="flex items-center gap-2 text-steel hover:text-parchment mb-6 font-display text-[11px] tracking-[2px] uppercase">
          <ArrowLeft size={14} /> Back to reports
        </Link>
        <div className="bg-midnight border border-gold/30 p-8">
          <h1 className="font-display font-black text-[28px] text-parchment mb-3">Quarterly Reviews</h1>
          <p className="font-sans text-[14px] text-steel leading-relaxed mb-6">
            Quarterly reviews are included on Professional and Multi-Site plans. Every 90 days PROTEKON
            generates a full posture review covering incidents, regulatory impact, document deliveries,
            and priorities for the next quarter &mdash; plus a 30-minute review call with our team.
          </p>
          <Link
            href="/dashboard/settings"
            className="inline-block bg-gold text-midnight font-display font-bold text-[12px] tracking-[2px] uppercase px-6 py-3 hover:bg-gold/90 transition-colors"
          >
            Upgrade plan
          </Link>
        </div>
      </div>
    )
  }

  const monthlyScores = data?.monthlyScores ?? []
  const currentQ = monthlyScores.slice(-3)
  const priorQ = monthlyScores.slice(-6, -3)
  const currentAvg = currentQ.length ? Math.round(currentQ.reduce((s, m) => s + m.score, 0) / currentQ.length) : (data?.score ?? 0)
  const priorAvg = priorQ.length ? Math.round(priorQ.reduce((s, m) => s + m.score, 0) / priorQ.length) : currentAvg
  const delta = currentAvg - priorAvg
  const incidentsThisQuarter = 0
  const docsDeliveredThisQuarter = data?.documents?.length ?? 0
  const regulatoryUpdatesThisQuarter = 0

  const widgets = [
    {
      label: "Posture Score",
      value: `${currentAvg}`,
      delta,
      icon: ShieldCheck,
      sub: `vs ${priorAvg} in ${previousQuarterLabel()}`,
    },
    {
      label: "Incidents Logged",
      value: `${incidentsThisQuarter}`,
      delta: 0,
      icon: WarningCircle,
      sub: "reported, classified, PII-stripped",
    },
    {
      label: "Documents Delivered",
      value: `${docsDeliveredThisQuarter}`,
      delta: 0,
      icon: FileText,
      sub: "generated or refreshed",
    },
    {
      label: "Regulatory Updates",
      value: `${regulatoryUpdatesThisQuarter}`,
      delta: 0,
      icon: Bell,
      sub: "analyzed for doc impact",
    },
  ]

  const nextQuarterPriorities = [
    { title: "Confirm no new citations in your industry", source: "Enforcement scan" },
    { title: "Verify employee count hasn't crossed a tier threshold", source: "Intake data" },
    { title: "Review incident trends with leadership", source: "Incident log" },
  ]

  return (
    <div className="p-8 max-w-[1100px]">
      <Link href="/dashboard/reports" className="flex items-center gap-2 text-steel hover:text-parchment mb-6 font-display text-[11px] tracking-[2px] uppercase">
        <ArrowLeft size={14} /> Back to reports
      </Link>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <span className="font-display text-[11px] tracking-[3px] uppercase text-gold">
          {currentQuarterLabel()} Review
        </span>
        <h1 className="font-display font-black text-[clamp(28px,4vw,42px)] text-parchment mt-2 mb-3 leading-[1.05]">
          Quarterly Compliance Review
        </h1>
        <p className="font-sans text-[14px] text-steel max-w-[640px] leading-relaxed">
          A 90-day look at your compliance posture, delivered every quarter. Includes a 30-minute call with
          our team to walk through findings and next-quarter priorities.
        </p>
      </motion.div>

      <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {widgets.map((w, i) => {
          const Icon = w.icon
          const showDelta = w.delta !== 0
          const Trend = w.delta > 0 ? TrendUp : TrendDown
          return (
            <motion.div
              key={w.label}
              className="bg-midnight border border-brand-white/[0.06] p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 * i }}
            >
              <div className="flex items-center justify-between mb-3">
                <Icon size={18} className="text-gold" />
                {showDelta && (
                  <span className={`flex items-center gap-1 font-display text-[10px] tracking-[1px] uppercase ${w.delta > 0 ? "text-green-400" : "text-crimson"}`}>
                    <Trend size={12} weight="bold" /> {Math.abs(w.delta)}
                  </span>
                )}
              </div>
              <div className="font-display font-black text-[32px] text-parchment leading-none mb-1">{w.value}</div>
              <div className="font-display text-[10px] tracking-[2px] uppercase text-steel mb-1">{w.label}</div>
              <div className="font-sans text-[11px] text-steel/70 leading-snug">{w.sub}</div>
            </motion.div>
          )
        })}
      </div>

      <motion.div
        className="mt-10 bg-midnight border border-gold/30 p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CalendarBlank size={18} className="text-gold" />
            <span className="font-display text-[10px] tracking-[3px] uppercase text-gold">Review Call</span>
          </div>
          <h2 className="font-display font-bold text-[20px] text-parchment mb-2">Book your 30-minute review call</h2>
          <p className="font-sans text-[13px] text-steel leading-relaxed max-w-[480px]">
            Walk through this quarter&rsquo;s findings with our team. We&rsquo;ll answer questions,
            flag what to watch next quarter, and adjust your monitoring settings if anything has changed.
          </p>
        </div>
        {bookingUrl ? (
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gold text-midnight font-display font-bold text-[12px] tracking-[2px] uppercase px-6 py-4 hover:bg-gold/90 transition-colors whitespace-nowrap"
          >
            Schedule Call
          </a>
        ) : (
          <a
            href="mailto:support@protekon.com?subject=Schedule%20Quarterly%20Review%20Call"
            className="bg-gold text-midnight font-display font-bold text-[12px] tracking-[2px] uppercase px-6 py-4 hover:bg-gold/90 transition-colors whitespace-nowrap"
          >
            Request a Time
          </a>
        )}
      </motion.div>

      <div className="mt-10 grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-display font-bold text-[11px] tracking-[3px] uppercase text-gold mb-4">
            Next-Quarter Priorities
          </h3>
          <ul className="space-y-3">
            {nextQuarterPriorities.map((p) => (
              <li key={p.title} className="bg-midnight border border-brand-white/[0.06] p-4">
                <div className="font-display font-semibold text-[14px] text-parchment mb-1">{p.title}</div>
                <div className="font-display text-[10px] tracking-[2px] uppercase text-steel">{p.source}</div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display font-bold text-[11px] tracking-[3px] uppercase text-gold mb-4">
            Posture Trend
          </h3>
          <div className="bg-midnight border border-brand-white/[0.06] p-5">
            {monthlyScores.length > 0 ? (
              <div className="flex items-end gap-2 h-[140px]">
                {monthlyScores.slice(-6).map((m) => (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-gold/60"
                      style={{ height: `${Math.max(10, m.score)}%` }}
                      title={`${m.month}: ${m.score}`}
                    />
                    <span className="font-display text-[9px] tracking-[1px] uppercase text-steel">{m.month}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-sans text-[12px] text-steel">
                Trend data appears after your second quarter with PROTEKON.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
