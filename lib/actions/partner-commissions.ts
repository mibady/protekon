"use server"

import { createClient } from "@/lib/supabase/server"

export type PartnerCommissionStatus = "pending" | "paid" | "reversed"

export type PartnerCommission = {
  id: string
  partner_id: string
  client_id: string | null
  period_start: string
  period_end: string
  amount_cents: number
  currency: string
  status: PartnerCommissionStatus
  paid_at: string | null
  notes: string | null
  created_at: string
}

export type CommissionsSummary = {
  commissions: PartnerCommission[]
  totalCents: number
  paidCents: number
  pendingCents: number
  currency: string
}

export async function getPartnerCommissions(): Promise<CommissionsSummary> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const empty: CommissionsSummary = {
    commissions: [],
    totalCents: 0,
    paidCents: 0,
    pendingCents: 0,
    currency: "usd",
  }
  if (!user) return empty

  const { data, error } = await supabase
    .from("partner_commissions")
    .select("*")
    .order("period_start", { ascending: false })
    .limit(100)

  if (error) {
    console.error("[partner-commissions] getPartnerCommissions error:", error)
    return empty
  }

  const rows = (data ?? []) as PartnerCommission[]
  const totalCents = rows.reduce((sum, r) => sum + (r.amount_cents || 0), 0)
  const paidCents = rows
    .filter((r) => r.status === "paid")
    .reduce((sum, r) => sum + (r.amount_cents || 0), 0)
  const pendingCents = rows
    .filter((r) => r.status === "pending")
    .reduce((sum, r) => sum + (r.amount_cents || 0), 0)
  const currency = rows[0]?.currency ?? "usd"

  return { commissions: rows, totalCents, paidCents, pendingCents, currency }
}

