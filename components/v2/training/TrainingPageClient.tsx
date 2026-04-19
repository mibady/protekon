"use client"

import { useMemo, useState } from "react"
import { Plus } from "@phosphor-icons/react/dist/ssr"
import { StatTile } from "./StatTile"
import { TrainingTable, deriveStatus, type TrainingRecord } from "./TrainingTable"
import { NewTrainingModal } from "./NewTrainingModal"

type TrainingPageClientProps = {
  records: ReadonlyArray<TrainingRecord>
}

type StatusFilter = "all" | "current" | "expiring" | "expired" | "missing"

export function TrainingPageClient({ records }: TrainingPageClientProps) {
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [logModalOpen, setLogModalOpen] = useState(false)

  // Precompute derived statuses once per render to avoid recomputing in every
  // filter pass + stats pass.
  const withStatus = useMemo(
    () => records.map((r) => ({ row: r, status: deriveStatus(r) })),
    [records],
  )

  const stats = useMemo(() => {
    let current = 0
    let expiring = 0
    let expired = 0
    const workers = new Set<string>()
    for (const { row, status } of withStatus) {
      if (status === "current") current += 1
      else if (status === "expiring") expiring += 1
      else if (status === "expired") expired += 1
      if (status === "current" && row.employee_name) {
        workers.add(row.employee_name.trim().toLowerCase())
      }
    }
    return {
      current,
      expiring,
      expired,
      uniqueWorkers: workers.size,
    }
  }, [withStatus])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return withStatus
      .filter(({ row, status }) => {
        if (statusFilter !== "all" && status !== statusFilter) return false
        if (!q) return true
        const haystack = [
          row.employee_name,
          row.training_type,
          row.trainer,
          row.authority,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
        return haystack.includes(q)
      })
      .map(({ row }) => row)
  }, [withStatus, query, statusFilter])

  return (
    <>
      <div className="flex items-center justify-end mb-6">
        <button
          type="button"
          onClick={() => setLogModalOpen(true)}
          className="inline-flex items-center gap-2 font-display uppercase"
          style={{
            background: "var(--enforcement)",
            color: "var(--parchment)",
            fontSize: "11px",
            letterSpacing: "2px",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
            padding: "12px 16px",
          }}
        >
          <Plus size={14} weight="bold" /> Log training
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatTile
          label="Current records"
          value={stats.current}
          note="In retention"
          accent="steel"
        />
        <StatTile
          label="Expiring ≤30 days"
          value={stats.expiring}
          note="Auto-nags scheduled"
          accent="sand"
        />
        <StatTile
          label="Expired"
          value={stats.expired}
          note="Block assignment"
          accent="enforcement"
        />
        <StatTile
          label="Workers trained"
          value={stats.uniqueWorkers}
          note="Active roster"
          accent="ink"
        />
      </div>

      <div
        className="flex flex-wrap items-center gap-3 p-3"
        style={{
          background: "var(--white)",
          border: "1px solid rgba(11, 29, 58, 0.08)",
          borderBottom: "none",
        }}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search worker, topic, trainer…"
          className="flex-1 min-w-[200px] font-sans"
          aria-label="Search training records"
          style={{
            background: "var(--parchment)",
            border: "1px solid rgba(11, 29, 58, 0.1)",
            fontSize: "13px",
            color: "var(--ink)",
            outline: "none",
            padding: "8px 12px",
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="font-sans"
          aria-label="Filter by status"
          style={{
            background: "var(--parchment)",
            border: "1px solid rgba(11, 29, 58, 0.1)",
            fontSize: "12px",
            color: "var(--ink)",
            padding: "8px 12px",
          }}
        >
          <option value="all">All status</option>
          <option value="current">Current</option>
          <option value="expiring">Expiring</option>
          <option value="expired">Expired</option>
          <option value="missing">Missing</option>
        </select>
      </div>

      <TrainingTable rows={filtered} />

      <div
        className="font-sans italic mt-4 text-center"
        style={{ color: "var(--steel)", fontSize: "12px" }}
      >
        Retention: training records kept for duration of employment + 3 years
        (8 CCR §3203(b)).
      </div>

      <NewTrainingModal
        open={logModalOpen}
        onClose={() => setLogModalOpen(false)}
      />
    </>
  )
}
