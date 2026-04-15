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
    label: "BAA Tracker",
    href: "/dashboard/healthcare/baa-tracker",
    description: "Business Associate Agreements with PHI vendors.",
  },
  {
    label: "PHI Inventory",
    href: "/dashboard/healthcare/phi-inventory",
    description: "Systems that store or transmit protected health information.",
  },
]

type BaaRow = {
  id: string
  vendor_name: string | null
  baa_status: string | null
  expiration_date: string | null
  updated_at: string | null
  created_at: string | null
}

type PhiRow = {
  id: string
  system_name: string | null
  system_type: string | null
  risk_level: string | null
  updated_at: string | null
  created_at: string | null
}

export async function getHealthcareSummary(): Promise<VerticalSummary> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return EMPTY

    const [baaRes, phiRes] = await Promise.all([
      supabase
        .from("baa_agreements")
        .select("id, vendor_name, baa_status, expiration_date, updated_at, created_at")
        .order("updated_at", { ascending: false }),
      supabase
        .from("phi_assets")
        .select("id, system_name, system_type, risk_level, updated_at, created_at")
        .order("updated_at", { ascending: false }),
    ])

    const baas: BaaRow[] = (baaRes.data as BaaRow[] | null) ?? []
    const phis: PhiRow[] = (phiRes.data as PhiRow[] | null) ?? []

    const now = Date.now()
    const in30 = now + 30 * 24 * 60 * 60 * 1000
    const expiringBaas = baas.filter((b) => {
      if (!b.expiration_date) return false
      const t = Date.parse(String(b.expiration_date))
      return !Number.isNaN(t) && t <= in30 && t >= now
    }).length
    const activeBaas = baas.filter((b) => b.baa_status === "active").length
    const highRiskPhi = phis.filter((p) => p.risk_level === "high" || p.risk_level === "critical").length

    const combined = [
      ...baas.map((b) => ({
        id: String(b.id),
        title: String(b.vendor_name ?? "BAA vendor"),
        subtitle: b.baa_status ? `BAA ${String(b.baa_status)}` : undefined,
        href: "/dashboard/healthcare/baa-tracker",
        at: String(b.updated_at ?? b.created_at ?? ""),
      })),
      ...phis.map((p) => ({
        id: String(p.id),
        title: String(p.system_name ?? "PHI system"),
        subtitle: p.system_type ? String(p.system_type) : undefined,
        href: "/dashboard/healthcare/phi-inventory",
        at: String(p.updated_at ?? p.created_at ?? ""),
      })),
    ]
    combined.sort((a, b) => (a.at > b.at ? -1 : 1))
    const recent = combined.slice(0, 5)

    return {
      kpis: [
        { label: "BAAs on file", value: baas.length, hint: `${activeBaas} active` },
        { label: "PHI systems", value: phis.length },
        { label: "High-risk systems", value: highRiskPhi, hint: "Risk level high or critical" },
        { label: "BAAs expiring (30d)", value: expiringBaas },
      ],
      recent,
      links: LINKS,
    }
  } catch {
    return EMPTY
  }
}
