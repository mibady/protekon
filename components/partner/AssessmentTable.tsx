"use client"

import { motion } from "framer-motion"
import type { PartnerAssessment } from "@/lib/types/partner"

interface AssessmentTableProps {
  assessments: PartnerAssessment[]
  loading: boolean
}

function StatusBadge({ status }: { status: PartnerAssessment["status"] }) {
  const map = {
    pending: { bg: "bg-steel/10", text: "text-steel", label: "Pending" },
    sent: { bg: "bg-gold/10", text: "text-gold", label: "Sent" },
    completed: { bg: "bg-[#2A7D4F]/10", text: "text-[#2A7D4F]", label: "Completed" },
    converted: { bg: "bg-crimson/10", text: "text-crimson", label: "Converted" },
  }
  const s = map[status]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 font-display font-medium text-[9px] tracking-[1px] uppercase ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  )
}

function ScoreDisplay({ score, tier }: { score?: number; tier?: string }) {
  if (score === undefined) return <span className="font-sans text-[12px] text-steel">—</span>
  const color =
    score >= 80 ? "#2A7D4F" : score >= 60 ? "#C9A84C" : "#C41230"
  return (
    <span className="font-display font-bold text-[13px]" style={{ color }}>
      {score}{tier ? ` · ${tier}` : ""}
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

export default function AssessmentTable({ assessments, loading }: AssessmentTableProps) {
  return (
    <div className="bg-brand-white border border-midnight/[0.08]">
      <div className="px-6 py-4 border-b border-midnight/[0.06]">
        <h2 className="font-display font-medium text-[12px] tracking-[3px] uppercase text-steel">
          Assessments
        </h2>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-midnight/[0.06]">
              {["Prospect Name", "Email", "Status", "Score", "Sent Date", "Completed"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left font-display font-medium text-[10px] tracking-[2px] uppercase text-steel"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(4)].map((_, i) => <SkeletonRow key={i} />)
            ) : assessments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <p className="font-sans text-[13px] text-steel">No assessments sent yet.</p>
                </td>
              </tr>
            ) : (
              assessments.map((a, i) => (
                <motion.tr
                  key={a.id}
                  className="border-b border-midnight/[0.04] last:border-0 hover:bg-midnight/[0.02] transition-colors"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                >
                  <td className="px-4 py-3 font-sans text-[13px] text-midnight font-medium">
                    {a.prospect_name}
                  </td>
                  <td className="px-4 py-3 font-sans text-[13px] text-steel">
                    {a.prospect_email}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="px-4 py-3">
                    {(a.status === "completed" || a.status === "converted") ? (
                      <ScoreDisplay score={a.score} tier={a.score_tier} />
                    ) : (
                      <span className="font-sans text-[12px] text-steel">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-sans text-[12px] text-steel">
                    {a.sent_at
                      ? new Date(a.sent_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      : "—"}
                  </td>
                  <td className="px-4 py-3 font-sans text-[12px] text-steel">
                    {a.completed_at
                      ? new Date(a.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      : "—"}
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
        ) : assessments.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="font-sans text-[13px] text-steel">No assessments sent yet.</p>
          </div>
        ) : (
          assessments.map((a, i) => (
            <motion.div
              key={a.id}
              className="px-4 py-4 space-y-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <div className="flex items-center justify-between">
                <span className="font-sans text-[13px] text-midnight font-medium">{a.prospect_name}</span>
                <StatusBadge status={a.status} />
              </div>
              <p className="font-sans text-[12px] text-steel">{a.prospect_email}</p>
              <div className="flex items-center gap-3 flex-wrap">
                {(a.status === "completed" || a.status === "converted") && (
                  <ScoreDisplay score={a.score} tier={a.score_tier} />
                )}
                {a.sent_at && (
                  <span className="font-sans text-[11px] text-steel">
                    Sent {new Date(a.sent_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
