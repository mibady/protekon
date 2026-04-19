"use server"

import { createClient } from "@/lib/supabase/server"

export type CoiRecord = {
  id: string
  sub_id: string
  client_id: string
  carrier_name: string | null
  policy_number: string | null
  policy_type: string | null
  coverage_limit: number | null
  aggregate_limit: number | null
  effective_date: string | null
  expiration_date: string | null
  insured_name: string | null
  additional_insured: boolean | null
  waiver_of_subrogation: boolean | null
  extraction_status: string | null
  extraction_confidence: number | null
  storage_path: string | null
  created_at: string | null
  // Joined
  sub_company_name?: string
}

export type CoiSummary = {
  current: number
  expiringSoon: number     // within 30 days
  expired: number
  missing: number          // subs with no COI row
}

/** List COI records, optionally filtered to a single sub. */
export async function listCoiRecords(subId?: string): Promise<CoiRecord[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  let q = supabase
    .from("construction_coi")
    .select("*, construction_subs!inner(company_name)")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })
  if (subId) q = q.eq("sub_id", subId)
  const { data } = await q
  return (data ?? []).map((r: any) => ({
    ...r,
    sub_company_name: r.construction_subs?.company_name,
  })) as CoiRecord[]
}

/** Count-summary for a dashboard tile. */
export async function getCoiSummary(): Promise<CoiSummary> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { current: 0, expiringSoon: 0, expired: 0, missing: 0 }

  const now = new Date()
  const in30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  // Most-recent COI per sub
  const { data: cois } = await supabase
    .from("construction_coi")
    .select("sub_id, expiration_date")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })

  const latestBySub = new Map<string, string | null>()
  for (const r of (cois ?? [])) {
    if (!latestBySub.has(r.sub_id)) latestBySub.set(r.sub_id, r.expiration_date)
  }

  const { data: subs } = await supabase
    .from("construction_subs")
    .select("id")
    .eq("client_id", user.id)

  let current = 0, expiringSoon = 0, expired = 0, missing = 0
  for (const s of (subs ?? [])) {
    const expiry = latestBySub.get(s.id)
    if (!expiry) { missing++; continue }
    const d = new Date(expiry)
    if (d < now) expired++
    else if (d < in30) expiringSoon++
    else current++
  }
  return { current, expiringSoon, expired, missing }
}
