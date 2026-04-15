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
    label: "Locations",
    href: "/dashboard/retail/locations",
    description: "Fire, ADA, and audit status for each store.",
  },
]

export async function getRetailSummary(): Promise<VerticalSummary> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return EMPTY

    const { data: rows, error } = await supabase
      .from("retail_locations")
      .select("id, store_name, city, state, fire_inspection_status, ada_status, compliance_score, updated_at, created_at")
      .order("updated_at", { ascending: false })

    if (error || !rows) return { kpis: zeroKpis(), recent: [], links: LINKS }

    const total = rows.length
    const adaCompliant = rows.filter((r) => r.ada_status === "compliant").length
    const fireCurrent = rows.filter((r) => r.fire_inspection_status === "current").length

    const recent = rows.slice(0, 5).map((r) => ({
      id: String(r.id),
      title: String(r.store_name ?? "Location"),
      subtitle: r.city && r.state ? `${String(r.city)}, ${String(r.state)}` : undefined,
      href: "/dashboard/retail/locations",
      at: String(r.updated_at ?? r.created_at ?? ""),
    }))

    return {
      kpis: [
        { label: "Locations", value: total },
        { label: "ADA compliant", value: adaCompliant },
        { label: "Fire inspections current", value: fireCurrent },
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
    { label: "Locations", value: 0 },
    { label: "ADA compliant", value: 0 },
    { label: "Fire inspections current", value: 0 },
  ]
}
