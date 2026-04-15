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
    label: "Inspections",
    href: "/dashboard/hospitality/inspections",
    description: "Health and safety inspection log with findings.",
  },
]

export async function getHospitalitySummary(): Promise<VerticalSummary> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return EMPTY

    const { data: rows, error } = await supabase
      .from("hospitality_inspections")
      .select("id, inspection_type, inspector, inspection_date, score, violations, status, updated_at, created_at")
      .order("updated_at", { ascending: false })

    if (error || !rows) return { kpis: zeroKpis(), recent: [], links: LINKS }

    const total = rows.length
    const passed = rows.filter((r) => r.status === "passed").length
    const totalViolations = rows.reduce((sum, r) => sum + (typeof r.violations === "number" ? r.violations : 0), 0)

    const recent = rows.slice(0, 5).map((r) => ({
      id: String(r.id),
      title: r.inspection_type ? `${String(r.inspection_type)} inspection` : "Inspection",
      subtitle: r.status ? String(r.status) : undefined,
      href: "/dashboard/hospitality/inspections",
      at: String(r.updated_at ?? r.created_at ?? ""),
    }))

    return {
      kpis: [
        { label: "Inspections logged", value: total },
        { label: "Passed inspections", value: passed },
        { label: "Open violations", value: totalViolations, hint: "Sum across all inspections" },
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
    { label: "Inspections logged", value: 0 },
    { label: "Passed inspections", value: 0 },
    { label: "Open violations", value: 0, hint: "Sum across all inspections" },
  ]
}
