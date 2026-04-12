"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Truck, Plus, Warning, Check, Clock, ArrowLeft } from "@phosphor-icons/react"
import Link from "next/link"
import { getForkliftOperators, addForkliftOperator, type ForkliftOperator } from "@/lib/actions/forklift"
import { Badge } from "@/components/ui/badge"

const FORKLIFT_TYPES = ["Class I", "Class II", "Class III", "Class IV", "Class V", "Class VI", "Class VII"]

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

export default function ForkliftOperatorsPage() {
  const [operators, setOperators] = useState<ForkliftOperator[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const load = () => {
    setLoading(true)
    getForkliftOperators().then(setOperators).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const expired = operators.filter((o) => daysUntil(o.cert_expiry) < 0).length
  const expiringSoon = operators.filter((o) => { const d = daysUntil(o.cert_expiry); return d >= 0 && d <= 90 }).length
  const current = operators.filter((o) => daysUntil(o.cert_expiry) > 90).length

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    await addForkliftOperator(fd)
    setShowForm(false)
    setSubmitting(false)
    load()
  }

  return (
    <div className="p-6 lg:p-8">
      <Link
        href="/dashboard/wholesale"
        className="inline-flex items-center gap-2 font-display font-medium text-[11px] tracking-[2px] uppercase text-steel hover:text-midnight transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Back to Warehouse
      </Link>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-[28px] text-midnight">Forklift Operators</h1>
          <p className="font-sans text-[14px] text-steel mt-1">
            OSHA 29 CFR 1910.178 — re-evaluation required every 3 years
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[2px] uppercase px-5 py-2.5 hover:brightness-110 transition-all"
        >
          <Plus size={16} weight="bold" />
          Add Operator
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Current", value: current, color: "text-[#16A34A]", bg: "bg-[#16A34A]/10", icon: Check },
          { label: "Expiring <90d", value: expiringSoon, color: "text-gold", bg: "bg-gold/10", icon: Clock },
          { label: "Expired", value: expired, color: "text-crimson", bg: "bg-crimson/10", icon: Warning },
        ].map((stat) => (
          <div key={stat.label} className="bg-brand-white border border-midnight/[0.08] p-4 flex items-center gap-3">
            <div className={`p-2 rounded ${stat.bg}`}>
              <stat.icon size={20} className={stat.color} weight="bold" />
            </div>
            <div>
              <span className="font-mono font-extrabold text-[24px] text-midnight leading-none">{stat.value}</span>
              <p className="font-display text-[9px] tracking-[2px] uppercase text-steel mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Form */}
      {showForm && (
        <motion.form
          onSubmit={handleSubmit}
          className="bg-parchment border border-midnight/[0.08] p-6 mb-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
        >
          <div>
            <label className="font-display text-[10px] tracking-[2px] uppercase text-steel block mb-1">Operator Name</label>
            <input name="operator_name" required className="w-full px-3 py-2 border border-midnight/[0.12] font-sans text-[13px] focus:outline-none focus:border-crimson" />
          </div>
          <div>
            <label className="font-display text-[10px] tracking-[2px] uppercase text-steel block mb-1">Forklift Type</label>
            <select name="forklift_type" className="w-full px-3 py-2 border border-midnight/[0.12] font-sans text-[13px] focus:outline-none focus:border-crimson bg-brand-white">
              {FORKLIFT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="font-display text-[10px] tracking-[2px] uppercase text-steel block mb-1">Certification Date</label>
            <input name="cert_date" type="date" required className="w-full px-3 py-2 border border-midnight/[0.12] font-sans text-[13px] focus:outline-none focus:border-crimson" />
          </div>
          <div>
            <label className="font-display text-[10px] tracking-[2px] uppercase text-steel block mb-1">Expiry Date</label>
            <input name="cert_expiry" type="date" required className="w-full px-3 py-2 border border-midnight/[0.12] font-sans text-[13px] focus:outline-none focus:border-crimson" />
          </div>
          <div>
            <label className="font-display text-[10px] tracking-[2px] uppercase text-steel block mb-1">Evaluator</label>
            <input name="evaluator" className="w-full px-3 py-2 border border-midnight/[0.12] font-sans text-[13px] focus:outline-none focus:border-crimson" />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-midnight text-parchment font-display font-semibold text-[11px] tracking-[2px] uppercase px-5 py-2.5 hover:brightness-125 transition-all disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save Operator"}
            </button>
          </div>
        </motion.form>
      )}

      {/* Operator Table */}
      <div className="bg-brand-white border border-midnight/[0.08] overflow-hidden">
        <div className="p-4 border-b border-midnight/[0.06] flex items-center gap-2">
          <Truck size={18} className="text-midnight" weight="bold" />
          <h3 className="font-display font-bold text-[12px] tracking-[3px] uppercase text-midnight">
            {operators.length} Certified Operators
          </h3>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-parchment rounded animate-pulse" />)}
          </div>
        ) : operators.length === 0 ? (
          <div className="p-12 text-center">
            <Truck size={48} className="text-steel/20 mx-auto mb-3" />
            <p className="font-sans text-[13px] text-steel">No operators tracked yet. Add your first operator above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-midnight/[0.06] bg-parchment/50">
                  {["Operator", "Type", "Certified", "Expires", "Status", "Evaluator"].map((h) => (
                    <th key={h} className="px-4 py-2.5 font-display font-bold text-[9px] tracking-[2px] uppercase text-steel">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-midnight/[0.06]">
                {operators.map((op, i) => {
                  const days = daysUntil(op.cert_expiry)
                  const statusColor = days < 0 ? "text-crimson bg-crimson/10" : days <= 90 ? "text-gold bg-gold/10" : "text-[#16A34A] bg-[#16A34A]/10"
                  const statusLabel = days < 0 ? "Expired" : days <= 30 ? `${days}d left` : days <= 90 ? `${days}d left` : "Current"

                  return (
                    <motion.tr
                      key={op.id}
                      className="hover:bg-parchment/30 transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <td className="px-4 py-3 font-sans text-[13px] text-midnight font-medium">{op.operator_name}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-steel">{op.forklift_type}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-steel">{op.cert_date}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-midnight">{op.cert_expiry}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={`border-0 font-display text-[9px] tracking-[1px] uppercase ${statusColor}`}>
                          {statusLabel}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-sans text-[12px] text-steel">{op.evaluator || "—"}</td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
