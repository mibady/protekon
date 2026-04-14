"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Buildings, WarningCircle, FileText, GraduationCap, BellRinging, Warning } from "@phosphor-icons/react"
import { useEffect, useState } from "react"
import { getSiteRollup, type RollupPayload } from "@/lib/actions/rollup"
import { getClientProfile } from "@/lib/actions/settings"
import type { ClientProfile } from "@/lib/types"

export default function MultiSiteRollupPage() {
  const [data, setData] = useState<RollupPayload | null>(null)
  const [client, setClient] = useState<ClientProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getSiteRollup(), getClientProfile()]).then(([r, c]) => {
      setData(r)
      setClient(c)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <div className="p-8 text-steel font-sans text-[14px]">Loading rollup…</div>
  }

  const eligible = client?.plan === "multi-site"
  if (!eligible) {
    return (
      <div className="p-8 max-w-[720px]">
        <Link href="/dashboard" className="flex items-center gap-2 text-steel hover:text-parchment mb-6 font-display text-[11px] tracking-[2px] uppercase">
          <ArrowLeft size={14} /> Back to dashboard
        </Link>
        <div className="bg-midnight border border-gold/30 p-8">
          <h1 className="font-display font-black text-[28px] text-parchment mb-3">Multi-Site Rollup</h1>
          <p className="font-sans text-[14px] text-steel leading-relaxed mb-6">
            Consolidated rollup across locations is included on the Multi-Site plan. See posture, incidents,
            documents, training, alerts, and SB 553 log requests for every site in one matrix.
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

  const rows = data?.rows ?? []
  const totals = data?.totals

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-steel hover:text-midnight mb-6 font-display text-[11px] tracking-[2px] uppercase">
        <ArrowLeft size={14} /> Back to dashboard
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Buildings size={20} className="text-crimson" />
          <span className="font-display text-[11px] tracking-[3px] uppercase text-crimson">Multi-Site</span>
        </div>
        <h1 className="font-display font-black text-[clamp(28px,4vw,40px)] text-midnight mb-2 leading-[1.05]">
          Consolidated Rollup
        </h1>
        <p className="font-sans text-[14px] text-steel max-w-[680px] leading-relaxed">
          A single view across every location. Posture, incidents, document deliveries, training coverage, and
          open obligations per site — plus the portfolio totals.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="bg-brand-white border border-midnight/[0.08] p-10 text-center">
          <Buildings size={40} className="text-steel/40 mx-auto mb-4" />
          <h2 className="font-display font-bold text-[16px] text-midnight mb-2">No sites yet</h2>
          <p className="font-sans text-[13px] text-steel mb-6">
            Your Multi-Site plan is active. Add your first site to start rolling up data.
          </p>
          <Link
            href="/dashboard/sites"
            className="inline-block bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[2px] uppercase px-5 py-3 hover:brightness-110 transition-all"
          >
            Manage sites
          </Link>
        </div>
      ) : (
        <>
          {totals && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
              <Tile Icon={Buildings} label="Sites" value={rows.length} />
              <Tile Icon={WarningCircle} label="Incidents (30d)" value={totals.incidents_last_30d} accent={totals.incidents_severe > 0 ? "crimson" : "none"} />
              <Tile Icon={FileText} label="Docs delivered" value={`${totals.documents_completed}/${totals.documents_total}`} />
              <Tile Icon={GraduationCap} label="Training done" value={`${totals.training_pct}%`} accent={totals.training_overdue > 0 ? "gold" : "none"} />
              <Tile Icon={Warning} label="Log requests" value={totals.pending_log_requests} accent={totals.pending_log_requests > 0 ? "crimson" : "none"} />
              <Tile Icon={BellRinging} label="Unread alerts" value={totals.unread_alerts} accent={totals.unread_alerts > 0 ? "gold" : "none"} />
            </div>
          )}

          <div className="bg-brand-white border border-midnight/[0.08] overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-midnight/5">
                <tr className="font-display font-medium text-[10px] tracking-[2px] uppercase text-steel text-left">
                  <th className="px-4 py-3">Site</th>
                  <th className="px-3 py-3 text-right">Employees</th>
                  <th className="px-3 py-3 text-right">Incidents</th>
                  <th className="px-3 py-3 text-right">Severe</th>
                  <th className="px-3 py-3 text-right">30d</th>
                  <th className="px-3 py-3 text-right">Docs</th>
                  <th className="px-3 py-3 text-right">Training %</th>
                  <th className="px-3 py-3 text-right">Overdue</th>
                  <th className="px-3 py-3 text-right">Log reqs</th>
                  <th className="px-3 py-3 text-right">Alerts</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <motion.tr
                    key={r.site_id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: 0.02 * i }}
                    className="border-t border-midnight/[0.06] hover:bg-midnight/[0.02]"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-[13px] text-midnight">{r.site_name}</span>
                        {r.is_primary && (
                          <span className="font-display font-medium text-[9px] tracking-[1px] uppercase text-gold bg-gold/10 px-1.5 py-0.5">Primary</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right font-sans text-[13px] text-midnight">{r.employee_count ?? "—"}</td>
                    <td className="px-3 py-3 text-right font-sans text-[13px] text-midnight">{r.incidents_total}</td>
                    <td className={`px-3 py-3 text-right font-sans text-[13px] ${r.incidents_severe > 0 ? "text-crimson font-semibold" : "text-steel"}`}>
                      {r.incidents_severe}
                    </td>
                    <td className="px-3 py-3 text-right font-sans text-[13px] text-midnight">{r.incidents_last_30d}</td>
                    <td className="px-3 py-3 text-right font-sans text-[13px] text-midnight">
                      {r.documents_completed}/{r.documents_total}
                    </td>
                    <td className={`px-3 py-3 text-right font-sans text-[13px] ${r.training_pct >= 90 ? "text-[#2A7D4F] font-semibold" : r.training_pct < 70 ? "text-crimson" : "text-midnight"}`}>
                      {r.training_pct}%
                    </td>
                    <td className={`px-3 py-3 text-right font-sans text-[13px] ${r.training_overdue > 0 ? "text-crimson font-semibold" : "text-steel"}`}>
                      {r.training_overdue}
                    </td>
                    <td className={`px-3 py-3 text-right font-sans text-[13px] ${r.pending_log_requests > 0 ? "text-crimson font-semibold" : "text-steel"}`}>
                      {r.pending_log_requests}
                    </td>
                    <td className={`px-3 py-3 text-right font-sans text-[13px] ${r.unread_alerts > 0 ? "text-gold font-semibold" : "text-steel"}`}>
                      {r.unread_alerts}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <Link
              href="/dashboard/sites"
              className="inline-flex items-center gap-2 font-display font-semibold text-[11px] tracking-[2px] uppercase text-midnight hover:text-crimson"
            >
              Manage sites →
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

function Tile({
  Icon,
  label,
  value,
  accent = "none",
}: {
  Icon: React.ComponentType<{ size?: number; className?: string; weight?: "light" | "regular" | "bold" | "fill" }>
  label: string
  value: string | number
  accent?: "none" | "gold" | "crimson"
}) {
  const accentCls =
    accent === "crimson" ? "text-crimson" :
    accent === "gold" ? "text-gold" :
    "text-midnight"
  return (
    <div className="bg-brand-white border border-midnight/[0.08] p-4">
      <div className="flex items-center justify-between mb-2">
        <Icon size={16} className="text-steel" weight="bold" />
      </div>
      <div className={`font-display font-black text-[22px] ${accentCls} leading-none mb-1`}>{value}</div>
      <div className="font-display text-[10px] tracking-[2px] uppercase text-steel">{label}</div>
    </div>
  )
}
