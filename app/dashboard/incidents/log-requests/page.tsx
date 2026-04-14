"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Plus, Clock, CheckCircle, XCircle, Warning } from "@phosphor-icons/react"
import Link from "next/link"
import { useEffect, useState, useTransition } from "react"
import {
  listEmployeeLogRequests,
  releaseEmployeeLogRequest,
  declineEmployeeLogRequest,
  type EmployeeLogRequest,
} from "@/lib/actions/employee-log-requests"

function daysLeft(dueAt: string): number {
  return Math.ceil((new Date(dueAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
}

const statusStyles: Record<EmployeeLogRequest["status"], { cls: string; label: string; Icon: typeof Clock }> = {
  pending:    { cls: "bg-gold/10 text-gold border-gold/30", label: "Pending", Icon: Clock },
  processing: { cls: "bg-gold/10 text-gold border-gold/30", label: "Processing", Icon: Clock },
  released:   { cls: "bg-[#2A7D4F]/10 text-[#2A7D4F] border-[#2A7D4F]/30", label: "Released", Icon: CheckCircle },
  declined:   { cls: "bg-steel/10 text-steel border-steel/30", label: "Declined", Icon: XCircle },
  expired:    { cls: "bg-crimson/10 text-crimson border-crimson/30", label: "Expired (SLA missed)", Icon: Warning },
}

export default function EmployeeLogRequestsPage() {
  const [records, setRecords] = useState<EmployeeLogRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    listEmployeeLogRequests().then((rows) => {
      setRecords(rows)
      setLoading(false)
    })
  }, [])

  const refresh = () => listEmployeeLogRequests().then(setRecords)

  const onRelease = (id: string) => {
    startTransition(async () => {
      const result = await releaseEmployeeLogRequest(id)
      if ("error" in result) setError(result.error)
      else { setError(null); refresh() }
    })
  }

  const onDecline = (id: string) => {
    const reason = window.prompt("Reason for declining this request:")
    if (!reason?.trim()) return
    startTransition(async () => {
      const result = await declineEmployeeLogRequest(id, reason.trim())
      if ("error" in result) setError(result.error)
      else { setError(null); refresh() }
    })
  }

  return (
    <div className="p-6 lg:p-8">
      <Link href="/dashboard/incidents" className="inline-flex items-center gap-2 font-display font-medium text-[11px] tracking-[2px] uppercase text-steel hover:text-midnight mb-6">
        <ArrowLeft size={14} /> Back to incidents
      </Link>

      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-[28px] text-midnight mb-2">Employee Log Requests</h1>
          <p className="font-sans text-[14px] text-steel max-w-[640px]">
            California Labor Code &sect;6401.9 (SB 553) requires employers to release a copy of the
            workplace-violence log within 15 days of an employee request. PROTEKON tracks the SLA,
            scrubs PII, and produces the release packet.
          </p>
        </div>
        <Link
          href="/dashboard/incidents/log-requests/new"
          className="inline-flex items-center gap-2 bg-crimson text-parchment font-display font-semibold text-[11px] tracking-[2px] uppercase px-5 py-3 hover:brightness-110 transition-all"
        >
          <Plus size={14} weight="bold" /> New Request
        </Link>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-crimson/10 border border-crimson/20 text-crimson font-sans text-[13px]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-steel font-sans text-[14px] py-12 text-center">Loading log requests&hellip;</div>
      ) : records.length === 0 ? (
        <div className="bg-brand-white border border-midnight/[0.08] p-10 text-center">
          <h2 className="font-display font-bold text-[16px] text-midnight mb-2">No log requests yet</h2>
          <p className="font-sans text-[13px] text-steel">
            When an employee or agency requests their workplace violence log, log it here to start the 15-day SLA timer.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((r, i) => {
            const sty = statusStyles[r.status]
            const d = daysLeft(r.due_at)
            const warn = r.status === "pending" && d <= 2
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.02 * i }}
                className={`bg-brand-white border ${warn ? "border-crimson/30" : "border-midnight/[0.08]"} p-5`}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-[260px]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 border font-display font-medium text-[10px] tracking-[1px] uppercase ${sty.cls}`}>
                        <sty.Icon size={12} weight="bold" /> {sty.label}
                      </span>
                      {(r.status === "pending" || r.status === "processing") && (
                        <span className={`font-display text-[10px] tracking-[1px] uppercase ${warn ? "text-crimson" : "text-steel"}`}>
                          {d > 0 ? `${d} day${d === 1 ? "" : "s"} to SLA` : "overdue"}
                        </span>
                      )}
                    </div>
                    <h3 className="font-display font-bold text-[15px] text-midnight mb-1">
                      {r.requester_name} <span className="font-sans font-normal text-steel">&middot; {r.requester_role}</span>
                    </h3>
                    <p className="font-sans text-[12px] text-steel mb-1">
                      Period: {r.period_start} &rarr; {r.period_end}
                    </p>
                    <p className="font-sans text-[12px] text-steel">
                      Due: {new Date(r.due_at).toLocaleDateString()}
                      {r.released_at && ` · Released ${new Date(r.released_at).toLocaleDateString()}`}
                    </p>
                    {r.reason && (
                      <p className="font-sans text-[12px] text-steel mt-2 italic">&ldquo;{r.reason}&rdquo;</p>
                    )}
                    {r.decline_reason && (
                      <p className="font-sans text-[12px] text-crimson mt-2">
                        Declined: {r.decline_reason}
                      </p>
                    )}
                  </div>

                  {(r.status === "pending" || r.status === "processing") && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onRelease(r.id)}
                        disabled={isPending}
                        className="font-display font-semibold text-[11px] tracking-[2px] uppercase px-4 py-2 bg-midnight text-parchment hover:brightness-110 disabled:opacity-50"
                      >
                        Release packet
                      </button>
                      <button
                        onClick={() => onDecline(r.id)}
                        disabled={isPending}
                        className="font-display font-semibold text-[11px] tracking-[2px] uppercase px-4 py-2 border border-midnight/20 text-midnight hover:border-crimson hover:text-crimson disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  {r.released_packet_url && (
                    <a
                      href={r.released_packet_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-display font-semibold text-[11px] tracking-[2px] uppercase px-4 py-2 border border-[#2A7D4F] text-[#2A7D4F] hover:bg-[#2A7D4F]/5"
                    >
                      View packet
                    </a>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
