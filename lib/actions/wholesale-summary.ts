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
    label: "Forklift Operators",
    href: "/dashboard/wholesale/forklift-operators",
    description: "Operator certifications and evaluation status.",
  },
  {
    label: "Zones",
    href: "/dashboard/wholesale/zones",
    description: "Warehouse zones, hazmat presence, and safety audits.",
  },
]

type OperatorRow = {
  id: string
  operator_name: string | null
  forklift_type: string | null
  evaluation_status: string | null
  cert_expiry: string | null
  updated_at: string | null
  created_at: string | null
}

type ZoneRow = {
  id: string
  zone_name: string | null
  zone_type: string | null
  status: string | null
  hazmat_present: boolean | null
  updated_at: string | null
  created_at: string | null
}

export async function getWholesaleSummary(): Promise<VerticalSummary> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return EMPTY

    const [opsRes, zonesRes] = await Promise.all([
      supabase
        .from("forklift_operators")
        .select("id, operator_name, forklift_type, evaluation_status, cert_expiry, updated_at, created_at")
        .order("updated_at", { ascending: false }),
      supabase
        .from("wholesale_zones")
        .select("id, zone_name, zone_type, status, hazmat_present, updated_at, created_at")
        .order("updated_at", { ascending: false }),
    ])

    const operators: OperatorRow[] = (opsRes.data as OperatorRow[] | null) ?? []
    const zones: ZoneRow[] = (zonesRes.data as ZoneRow[] | null) ?? []

    const now = Date.now()
    const in30 = now + 30 * 24 * 60 * 60 * 1000
    const certsExpiring = operators.filter((o) => {
      if (!o.cert_expiry) return false
      const t = Date.parse(String(o.cert_expiry))
      return !Number.isNaN(t) && t <= in30 && t >= now
    }).length
    const hazmatZones = zones.filter((z) => z.hazmat_present === true).length
    const compliantZones = zones.filter((z) => z.status === "compliant").length

    const combined = [
      ...operators.map((o) => ({
        id: String(o.id),
        title: String(o.operator_name ?? "Operator"),
        subtitle: o.forklift_type ? String(o.forklift_type) : undefined,
        href: "/dashboard/wholesale/forklift-operators",
        at: String(o.updated_at ?? o.created_at ?? ""),
      })),
      ...zones.map((z) => ({
        id: String(z.id),
        title: String(z.zone_name ?? "Zone"),
        subtitle: z.zone_type ? String(z.zone_type) : undefined,
        href: "/dashboard/wholesale/zones",
        at: String(z.updated_at ?? z.created_at ?? ""),
      })),
    ]
    combined.sort((a, b) => (a.at > b.at ? -1 : 1))
    const recent = combined.slice(0, 5)

    return {
      kpis: [
        { label: "Forklift operators", value: operators.length },
        { label: "Certs expiring (30d)", value: certsExpiring },
        { label: "Zones", value: zones.length, hint: `${compliantZones} compliant` },
        { label: "Hazmat zones", value: hazmatZones },
      ],
      recent,
      links: LINKS,
    }
  } catch {
    return EMPTY
  }
}
