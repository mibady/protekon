"use server"

import { createClient } from "@/lib/supabase/server"

export type VerticalSummary = {
  kpis: { label: string; value: number | string; hint?: string }[]
  recent: Array<{ id: string; title: string; subtitle?: string; href: string; at: string }>
  links: { label: string; href: string; description: string }[]
}

const EMPTY: VerticalSummary = { kpis: [], recent: [], links: [] }

const LINKS: VerticalSummary["links"] = [
  {
    label: "Subcontractors",
    href: "/dashboard/construction/subcontractors",
    description: "Track CSLB license status, COI expiry, and verification.",
  },
]

export async function getConstructionSummary(): Promise<VerticalSummary> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return EMPTY

    const { data: rows, error } = await supabase
      .from("construction_subs")
      .select("id, company_name, license_number, license_status, license_expiry, updated_at, created_at")
      .order("updated_at", { ascending: false })

    if (error || !rows) return { kpis: zeroKpis(), recent: [], links: LINKS }

    const now = Date.now()
    const in30 = now + 30 * 24 * 60 * 60 * 1000
    const total = rows.length
    const active = rows.filter((r) => r.license_status === "active").length
    const expiringSoon = rows.filter((r) => {
      if (!r.license_expiry) return false
      const t = Date.parse(String(r.license_expiry))
      return !Number.isNaN(t) && t <= in30 && t >= now
    }).length

    const recent = rows.slice(0, 5).map((r) => ({
      id: String(r.id),
      title: String(r.company_name ?? "Subcontractor"),
      subtitle: r.license_status ? `License ${String(r.license_status)}` : undefined,
      href: "/dashboard/construction/subcontractors",
      at: String(r.updated_at ?? r.created_at ?? ""),
    }))

    return {
      kpis: [
        { label: "Subcontractors", value: total },
        { label: "Active licenses", value: active },
        { label: "Expiring in 30 days", value: expiringSoon, hint: "CSLB license renewals due" },
      ],
      recent,
      links: LINKS,
    }
  } catch {
    return EMPTY
  }
}

function zeroKpis(): VerticalSummary["kpis"] {
  return [
    { label: "Subcontractors", value: 0 },
    { label: "Active licenses", value: 0 },
    { label: "Expiring in 30 days", value: 0, hint: "CSLB license renewals due" },
  ]
}
