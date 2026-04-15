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
    label: "Fleet",
    href: "/dashboard/transportation/fleet",
    description: "DOT inspection schedule and CDL status for drivers.",
  },
]

export async function getTransportationSummary(): Promise<VerticalSummary> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return EMPTY

    const { data: rows, error } = await supabase
      .from("transportation_fleet")
      .select("id, vehicle_id, vehicle_type, driver_name, cdl_status, cdl_expiry, next_inspection, status, updated_at, created_at")
      .order("updated_at", { ascending: false })

    if (error || !rows) return { kpis: zeroKpis(), recent: [], links: LINKS }

    const now = Date.now()
    const in30 = now + 30 * 24 * 60 * 60 * 1000
    const total = rows.length
    const active = rows.filter((r) => r.status === "active").length
    const cdlExpiring = rows.filter((r) => {
      if (!r.cdl_expiry) return false
      const t = Date.parse(String(r.cdl_expiry))
      return !Number.isNaN(t) && t <= in30 && t >= now
    }).length

    const recent = rows.slice(0, 5).map((r) => ({
      id: String(r.id),
      title: String(r.vehicle_id ?? "Vehicle"),
      subtitle: r.driver_name ? String(r.driver_name) : r.vehicle_type ? String(r.vehicle_type) : undefined,
      href: "/dashboard/transportation/fleet",
      at: String(r.updated_at ?? r.created_at ?? ""),
    }))

    return {
      kpis: [
        { label: "Fleet vehicles", value: total },
        { label: "Active vehicles", value: active },
        { label: "CDLs expiring (30d)", value: cdlExpiring },
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
    { label: "Fleet vehicles", value: 0 },
    { label: "Active vehicles", value: 0 },
    { label: "CDLs expiring (30d)", value: 0 },
  ]
}
