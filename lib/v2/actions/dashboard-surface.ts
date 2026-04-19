"use server"

import { getDashboardData } from "@/lib/actions/dashboard"
import { getSiteRollup, type SiteRollupRow, type RollupPayload } from "@/lib/actions/rollup"
import { getOpenReportableIncident } from "@/lib/actions/incidents"
import { getUnreadCount } from "@/lib/actions/alerts"
import { createClient } from "@/lib/supabase/server"
import type { ClientProfile, Incident } from "@/lib/types"

export type PostureLabel = "STRONG" | "NEEDS WORK" | "AT RISK"

export type DashboardActiveRisk = {
  title: string
  severity: "critical" | "warning"
  detail: string
  href?: string
}

export type DashboardCoverageCounts = {
  resolved: number
  reviewDue: number
  missing: number
  total: number
}

export type DashboardSurfaceData = {
  client: ClientProfile | null
  complianceScore: number
  postureLabel: PostureLabel | null
  sites: SiteRollupRow[]
  siteTotals: RollupPayload["totals"] | null
  activeRisks: DashboardActiveRisk[]
  coverageCounts: DashboardCoverageCounts
  recentIncidents: Incident[]
  openReportableIncident: Incident | null
  unreadAlerts: number
}

function posture(score: number): PostureLabel | null {
  if (score <= 0) return null
  if (score >= 80) return "STRONG"
  if (score >= 60) return "NEEDS WORK"
  return "AT RISK"
}

export async function getDashboardSurfaceData(): Promise<DashboardSurfaceData> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return {
      client: null,
      complianceScore: 0,
      postureLabel: null,
      sites: [],
      siteTotals: null,
      activeRisks: [],
      coverageCounts: { resolved: 0, reviewDue: 0, missing: 0, total: 0 },
      recentIncidents: [],
      openReportableIncident: null,
      unreadAlerts: 0,
    }
  }

  const [dashRes, rollupRes, openIncRes, unreadRes] = await Promise.allSettled([
    getDashboardData(),
    getSiteRollup(),
    getOpenReportableIncident(user.id),
    getUnreadCount(),
  ])

  const dash = dashRes.status === "fulfilled" ? dashRes.value : null
  const rollup = rollupRes.status === "fulfilled" ? rollupRes.value : null
  const openInc = openIncRes.status === "fulfilled" ? openIncRes.value : null
  const unread = unreadRes.status === "fulfilled" ? unreadRes.value.count : 0

  const score = dash?.complianceScore ?? 0
  const docCount = dash?.documentCount ?? 0

  // Derive active risks from composed signals.
  const risks: DashboardActiveRisk[] = []
  if (openInc) {
    risks.push({
      title: "Serious incident awaiting report",
      severity: "critical",
      detail: `${openInc.severity} on ${openInc.incident_date ?? "recent"} — reporting clock active.`,
      href: "/dashboard/incidents",
    })
  }
  const totals = rollup?.totals ?? null
  if (totals && totals.training_overdue > 0) {
    risks.push({
      title: `${totals.training_overdue} training certification(s) overdue`,
      severity: "warning",
      detail: `${totals.training_complete}/${totals.training_total} complete across all sites.`,
      href: "/dashboard/training",
    })
  }
  if (totals && totals.pending_log_requests > 0) {
    risks.push({
      title: `${totals.pending_log_requests} employee log request(s) pending`,
      severity: "warning",
      detail: "Review intake queue.",
      href: "/dashboard/activity",
    })
  }

  // Coverage counts — fall back to document counts until coverage-resources
  // exposes an aggregate API. RESOURCE_CONFIGS in lib/v2/coverage-resources/index.ts
  // is a per-type registry; it does not expose resolved/reviewDue/missing rollups yet.
  // TODO(wave-3): pull from lib/v2/coverage-resources/index.ts once an aggregate exists
  const coverageCounts: DashboardCoverageCounts = {
    resolved: docCount,
    reviewDue: 0,
    missing: 0,
    total: docCount,
  }

  return {
    client: dash?.client ?? null,
    complianceScore: score,
    postureLabel: posture(score),
    sites: rollup?.rows ?? [],
    siteTotals: totals,
    activeRisks: risks,
    coverageCounts,
    recentIncidents: dash?.recentIncidents ?? [],
    openReportableIncident: openInc,
    unreadAlerts: unread,
  }
}
