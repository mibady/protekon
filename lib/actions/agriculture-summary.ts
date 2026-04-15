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
    label: "Crews",
    href: "/dashboard/agriculture/crews",
    description: "Manage field crews, heat-illness plans, and water/shade logs.",
  },
]

export async function getAgricultureSummary(): Promise<VerticalSummary> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return EMPTY

    const { data: rows, error } = await supabase
      .from("agriculture_crews")
      .select("id, crew_name, field_location, heat_plan_status, water_station, shade_available, last_safety_check, updated_at, created_at")
      .order("updated_at", { ascending: false })

    if (error || !rows) return { kpis: zeroKpis(), recent: [], links: LINKS }

    const total = rows.length
    const activePlans = rows.filter((r) => r.heat_plan_status === "active").length
    const missingControls = rows.filter((r) => r.water_station === false || r.shade_available === false).length

    const recent = rows.slice(0, 5).map((r) => ({
      id: String(r.id),
      title: String(r.crew_name ?? "Crew"),
      subtitle: r.field_location ? String(r.field_location) : undefined,
      href: "/dashboard/agriculture/crews",
      at: String(r.updated_at ?? r.created_at ?? ""),
    }))

    return {
      kpis: [
        { label: "Crews tracked", value: total },
        { label: "Heat plans active", value: activePlans, hint: "Required during heat season" },
        { label: "Missing controls", value: missingControls, hint: "No water or shade on file" },
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
    { label: "Crews tracked", value: 0 },
    { label: "Heat plans active", value: 0, hint: "Required during heat season" },
    { label: "Missing controls", value: 0, hint: "No water or shade on file" },
  ]
}
