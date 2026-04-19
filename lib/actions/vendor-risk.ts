"use server"

import { createClient } from "@/lib/supabase/server"

export type SubWithRisk = {
  id: string
  company_name: string
  license_number: string | null
  cslb_primary_status: string | null
  cslb_risk_score: number | null
  cslb_status_color: string | null
  cslb_license_expires: string | null
  cslb_wc_expires: string | null
  coi_status: 'current' | 'expiring' | 'expired' | 'missing'
  coi_expiration: string | null
  overall_risk: 'low' | 'medium' | 'high' | 'critical'
}

export type VendorRiskDetail = SubWithRisk & {
  coi_history: Array<{
    id: string
    carrier_name: string | null
    effective_date: string | null
    expiration_date: string | null
    policy_type: string | null
  }>
  incident_count: number
  training_overdue_count: number
  // TODO(wave-b): vendor-level incident/training joins; Phase A counts all for now
}

function deriveOverallRisk(
  cslbRisk: number | null,
  coiStatus: SubWithRisk['coi_status']
): SubWithRisk['overall_risk'] {
  if (coiStatus === 'missing' || coiStatus === 'expired') return 'critical'
  if (coiStatus === 'expiring') return 'high'
  if (cslbRisk !== null && cslbRisk >= 70) return 'medium'
  return 'low'
}

/** List all subs with derived risk signals. */
export async function listSubsWithRisk(): Promise<SubWithRisk[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: subs } = await supabase
    .from("v_construction_subs_dashboard")
    .select("*")
    .eq("client_id", user.id)

  const subIds = (subs ?? []).map((s: any) => s.id)
  const coiMap = new Map<string, { status: SubWithRisk['coi_status']; expiration: string | null }>()

  if (subIds.length > 0) {
    const { data: cois } = await supabase
      .from("construction_coi")
      .select("sub_id, expiration_date, created_at")
      .in("sub_id", subIds)
      .order("created_at", { ascending: false })

    const now = new Date()
    const in30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    const latestBySub = new Map<string, string | null>()
    for (const r of (cois ?? [])) {
      if (!latestBySub.has(r.sub_id)) latestBySub.set(r.sub_id, r.expiration_date)
    }
    for (const id of subIds) {
      const expiry = latestBySub.get(id)
      if (!expiry) { coiMap.set(id, { status: 'missing', expiration: null }); continue }
      const d = new Date(expiry)
      if (d < now) coiMap.set(id, { status: 'expired', expiration: expiry })
      else if (d < in30) coiMap.set(id, { status: 'expiring', expiration: expiry })
      else coiMap.set(id, { status: 'current', expiration: expiry })
    }
  }

  return (subs ?? []).map((s: any) => {
    const coi = coiMap.get(s.id) ?? { status: 'missing' as const, expiration: null }
    return {
      id: s.id,
      company_name: s.company_name,
      license_number: s.license_number ?? null,
      cslb_primary_status: s.cslb_primary_status ?? null,
      cslb_risk_score: s.cslb_risk_score ?? null,
      cslb_status_color: s.cslb_status_color ?? null,
      cslb_license_expires: s.cslb_license_expires ?? null,
      cslb_wc_expires: s.cslb_wc_expires ?? null,
      coi_status: coi.status,
      coi_expiration: coi.expiration,
      overall_risk: deriveOverallRisk(s.cslb_risk_score, coi.status),
    }
  })
}

/** Detail view with COI history. */
export async function getVendorRiskDetail(subId: string): Promise<VendorRiskDetail | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: sub } = await supabase
    .from("v_construction_subs_dashboard")
    .select("*")
    .eq("id", subId)
    .eq("client_id", user.id)
    .maybeSingle()
  if (!sub) return null

  const { data: cois } = await supabase
    .from("construction_coi")
    .select("id, carrier_name, effective_date, expiration_date, policy_type, created_at")
    .eq("sub_id", subId)
    .order("created_at", { ascending: false })

  // For Phase A, incident_count + training_overdue_count come from the client-wide rollup.
  // Sub-specific joins come later (TODO wave-B).
  const coi_history = (cois ?? []).map((c: any) => ({
    id: c.id,
    carrier_name: c.carrier_name,
    effective_date: c.effective_date,
    expiration_date: c.expiration_date,
    policy_type: c.policy_type,
  }))

  const coiStatus = ((): SubWithRisk['coi_status'] => {
    const latest = cois?.[0]?.expiration_date as string | null | undefined
    if (!latest) return 'missing'
    const d = new Date(latest)
    if (d < new Date()) return 'expired'
    if (d < new Date(Date.now() + 30 * 86400_000)) return 'expiring'
    return 'current'
  })()

  return {
    id: sub.id,
    company_name: sub.company_name,
    license_number: sub.license_number ?? null,
    cslb_primary_status: sub.cslb_primary_status ?? null,
    cslb_risk_score: sub.cslb_risk_score ?? null,
    cslb_status_color: sub.cslb_status_color ?? null,
    cslb_license_expires: sub.cslb_license_expires ?? null,
    cslb_wc_expires: sub.cslb_wc_expires ?? null,
    coi_status: coiStatus,
    coi_expiration: cois?.[0]?.expiration_date ?? null,
    overall_risk: deriveOverallRisk(sub.cslb_risk_score, coiStatus),
    coi_history,
    incident_count: 0,    // TODO(wave-b): join incidents by sub_id (no such column today)
    training_overdue_count: 0,  // TODO(wave-b)
  }
}
