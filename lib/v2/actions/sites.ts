"use server"

/**
 * Sites hub actions — read-only aggregates for the drill-down detail page.
 *
 * Sites is a HUB, not a clock. The drill-down renders three things the
 * generic CoverageDrillDown can't supply:
 *   1. Compliance load counts — one integer per sibling resource type for
 *      rows with `site_id = this.id`. Rendered as tiles that deep-link into
 *      the sibling drill-downs with `?site_id=…`.
 *   2. Recent activity — top-5 merged chronologically from system_activity
 *      (jsonb metadata) and incidents (direct site_id column).
 *   3. Documents — rows from `documents` where `site_id = …`.
 *
 * All functions enforce `client_id = clientId` as a belt-and-suspenders
 * check alongside RLS. None of them ever throw — empties on any error.
 */

import { createClient } from "@/lib/supabase/server"

// ──────────────────────────────────────────────────────────────────────────
// Compliance load — 6 counts per site
// ──────────────────────────────────────────────────────────────────────────

export type SiteComplianceLoad = {
  team: number
  assets: number
  inspections: number
  permits: number
  materials: number
  findings: number
}

const EMPTY_LOAD: SiteComplianceLoad = {
  team: 0,
  assets: 0,
  inspections: 0,
  permits: 0,
  materials: 0,
  findings: 0,
}

/**
 * Returns row-count aggregates across 6 sibling tables for a given site.
 * All 6 tables carry `site_id` nullable columns (verified 2026-04-16).
 * Runs the six counts in parallel via Promise.all; a single failing query
 * returns 0 for that key rather than throwing the whole call.
 */
export async function getSiteComplianceLoad(
  siteId: string,
  clientId: string
): Promise<SiteComplianceLoad> {
  try {
    const supabase = await createClient()

    const tables = [
      "team_members",
      "assets",
      "inspections",
      "permits",
      "materials",
      "findings",
    ] as const
    type TableKey = (typeof tables)[number]

    const results = await Promise.all(
      tables.map(async (tbl) => {
        const { count } = await supabase
          .from(tbl)
          .select("*", { count: "exact", head: true })
          .eq("client_id", clientId)
          .eq("site_id", siteId)
        return [tbl, count ?? 0] as [TableKey, number]
      })
    )

    const byTable = Object.fromEntries(results) as Record<TableKey, number>
    return {
      team: byTable.team_members ?? 0,
      assets: byTable.assets ?? 0,
      inspections: byTable.inspections ?? 0,
      permits: byTable.permits ?? 0,
      materials: byTable.materials ?? 0,
      findings: byTable.findings ?? 0,
    }
  } catch {
    return EMPTY_LOAD
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Recent activity — merged top-5 from system_activity + incidents
// ──────────────────────────────────────────────────────────────────────────

export type SiteActivityItem = {
  id: string
  at: string // ISO timestamp
  kind: "activity" | "incident"
  title: string
  detail: string | null
}

/**
 * Merges up to 5 most-recent rows from:
 *   • `system_activity` filtered by `metadata->>'site_id' = siteId`
 *   • `incidents` filtered by `site_id = siteId`
 *
 * Both sources filter by `client_id` as a belt-and-suspenders RLS check.
 * Each source pulls 10 rows → merged → top 5 by `created_at` desc.
 *
 * Phase 0 verified `system_activity.metadata` is a jsonb column (no
 * dedicated `site_id` column yet). A follow-up ticket is filed to formalize
 * `site_id` indexing on system_activity for performance.
 */
export async function getSiteRecentActivity(
  siteId: string,
  clientId: string
): Promise<SiteActivityItem[]> {
  try {
    const supabase = await createClient()

    const [activityRes, incidentRes] = await Promise.all([
      supabase
        .from("system_activity")
        .select("id, created_at, title, detail, action_type")
        .eq("client_id", clientId)
        .filter("metadata->>site_id", "eq", siteId)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("incidents")
        .select("id, created_at, incident_date, description, severity, incident_id")
        .eq("client_id", clientId)
        .eq("site_id", siteId)
        .order("created_at", { ascending: false })
        .limit(10),
    ])

    const activity: SiteActivityItem[] = (activityRes.data ?? []).map(
      (row) => ({
        id: row.id as string,
        at: (row.created_at as string) ?? new Date(0).toISOString(),
        kind: "activity" as const,
        title:
          (row.title as string | null) ??
          (row.action_type as string | null) ??
          "Activity",
        detail: (row.detail as string | null) ?? null,
      })
    )

    const incidents: SiteActivityItem[] = (incidentRes.data ?? []).map(
      (row) => ({
        id: row.id as string,
        at:
          (row.created_at as string) ??
          (row.incident_date as string) ??
          new Date(0).toISOString(),
        kind: "incident" as const,
        title: `Incident ${(row.incident_id as string | null) ?? ""}`.trim(),
        detail:
          (row.description as string | null) ??
          (row.severity as string | null) ??
          null,
      })
    )

    return [...activity, ...incidents]
      .sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0))
      .slice(0, 5)
  } catch {
    return []
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Documents — rows where documents.site_id = siteId
// ──────────────────────────────────────────────────────────────────────────

export type SiteDocument = {
  id: string
  filename: string | null
  type: string | null
  storage_url: string | null
  created_at: string | null
}

/**
 * Returns up to 10 documents attached to a site. Phase 0 confirmed
 * `documents.site_id` exists as a uuid column. Ordered newest-first by
 * `created_at`.
 */
export async function getSiteDocuments(
  siteId: string,
  clientId: string
): Promise<SiteDocument[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("documents")
      .select("id, filename, type, storage_url, created_at")
      .eq("client_id", clientId)
      .eq("site_id", siteId)
      .order("created_at", { ascending: false })
      .limit(10)

    return (data ?? []).map((row) => ({
      id: row.id as string,
      filename: (row.filename as string | null) ?? null,
      type: (row.type as string | null) ?? null,
      storage_url: (row.storage_url as string | null) ?? null,
      created_at: (row.created_at as string | null) ?? null,
    }))
  } catch {
    return []
  }
}
