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
    label: "Properties",
    href: "/dashboard/real-estate/properties",
    description: "Portfolio compliance status across all buildings.",
  },
]

export async function getRealEstateSummary(): Promise<VerticalSummary> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return EMPTY

    const { data: rows, error } = await supabase
      .from("property_portfolio")
      .select("id, property_name, address, city, state, units, property_type, compliance_status, updated_at, created_at")
      .order("updated_at", { ascending: false })

    if (error || !rows) return { kpis: zeroKpis(), recent: [], links: LINKS }

    const total = rows.length
    const unitsTotal = rows.reduce((sum, r) => sum + (typeof r.units === "number" ? r.units : 0), 0)
    const compliant = rows.filter((r) => r.compliance_status === "compliant").length

    const recent = rows.slice(0, 5).map((r) => ({
      id: String(r.id),
      title: String(r.property_name ?? "Property"),
      subtitle: r.compliance_status ? String(r.compliance_status) : undefined,
      href: "/dashboard/real-estate/properties",
      at: String(r.updated_at ?? r.created_at ?? ""),
    }))

    return {
      kpis: [
        { label: "Properties", value: total },
        { label: "Total units", value: unitsTotal },
        { label: "Compliant properties", value: compliant },
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
    { label: "Properties", value: 0 },
    { label: "Total units", value: 0 },
    { label: "Compliant properties", value: 0 },
  ]
}
