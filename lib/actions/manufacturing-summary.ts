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
    label: "Equipment",
    href: "/dashboard/manufacturing/equipment",
    description: "LOTO status, inspection schedule, and risk level per machine.",
  },
]

export async function getManufacturingSummary(): Promise<VerticalSummary> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return EMPTY

    const { data: rows, error } = await supabase
      .from("manufacturing_equipment")
      .select("id, equipment_name, equipment_type, loto_status, next_inspection, risk_level, updated_at, created_at")
      .order("updated_at", { ascending: false })

    if (error || !rows) return { kpis: zeroKpis(), recent: [], links: LINKS }

    const now = Date.now()
    const in30 = now + 30 * 24 * 60 * 60 * 1000
    const total = rows.length
    const lotoCurrent = rows.filter((r) => r.loto_status === "current").length
    const inspectionsDue = rows.filter((r) => {
      if (!r.next_inspection) return false
      const t = Date.parse(String(r.next_inspection))
      return !Number.isNaN(t) && t <= in30
    }).length

    const recent = rows.slice(0, 5).map((r) => ({
      id: String(r.id),
      title: String(r.equipment_name ?? "Equipment"),
      subtitle: r.equipment_type ? String(r.equipment_type) : undefined,
      href: "/dashboard/manufacturing/equipment",
      at: String(r.updated_at ?? r.created_at ?? ""),
    }))

    return {
      kpis: [
        { label: "Equipment tracked", value: total },
        { label: "LOTO current", value: lotoCurrent, hint: "Lockout/tagout procedures on file" },
        { label: "Inspections due (30d)", value: inspectionsDue },
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
    { label: "Equipment tracked", value: 0 },
    { label: "LOTO current", value: 0, hint: "Lockout/tagout procedures on file" },
    { label: "Inspections due (30d)", value: 0 },
  ]
}
