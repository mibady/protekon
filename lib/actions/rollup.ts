"use server"

import { createClient } from "@/lib/supabase/server"

export type SiteRollupRow = {
  site_id: string
  site_name: string
  is_primary: boolean
  employee_count: number | null
  incidents_total: number
  incidents_severe: number
  incidents_last_30d: number
  documents_total: number
  documents_completed: number
  training_total: number
  training_complete: number
  training_overdue: number
  training_pct: number
  pending_log_requests: number
  unread_alerts: number
}

export type RollupPayload = {
  rows: SiteRollupRow[]
  totals: Omit<SiteRollupRow, "site_id" | "site_name" | "is_primary" | "employee_count"> & {
    employee_count: number | null
  }
}

function emptyTotals(): RollupPayload["totals"] {
  return {
    employee_count: 0,
    incidents_total: 0,
    incidents_severe: 0,
    incidents_last_30d: 0,
    documents_total: 0,
    documents_completed: 0,
    training_total: 0,
    training_complete: 0,
    training_overdue: 0,
    training_pct: 0,
    pending_log_requests: 0,
    unread_alerts: 0,
  }
}

export async function getSiteRollup(): Promise<RollupPayload | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase.rpc("get_site_rollup", { p_client_id: user.id })

  if (error || !data) return { rows: [], totals: emptyTotals() }

  const rows = Array.isArray(data) ? (data as SiteRollupRow[]) : []

  const totals = rows.reduce<RollupPayload["totals"]>((acc, r) => {
    acc.employee_count = (acc.employee_count ?? 0) + (r.employee_count ?? 0)
    acc.incidents_total += r.incidents_total ?? 0
    acc.incidents_severe += r.incidents_severe ?? 0
    acc.incidents_last_30d += r.incidents_last_30d ?? 0
    acc.documents_total += r.documents_total ?? 0
    acc.documents_completed += r.documents_completed ?? 0
    acc.training_total += r.training_total ?? 0
    acc.training_complete += r.training_complete ?? 0
    acc.training_overdue += r.training_overdue ?? 0
    acc.pending_log_requests += r.pending_log_requests ?? 0
    acc.unread_alerts += r.unread_alerts ?? 0
    return acc
  }, emptyTotals())

  totals.training_pct = totals.training_total > 0
    ? Math.round((totals.training_complete / totals.training_total) * 100)
    : 0

  return { rows, totals }
}
