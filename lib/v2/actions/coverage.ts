"use server"

import { createClient } from "@/lib/supabase/server"
import type {
  ResourceRow,
  ResourceType,
  VerticalOverride,
} from "@/lib/v2/coverage-types"
import { shouldRedactPII } from "@/lib/v2/pii"

/**
 * Canonical table for each resource type. These are the *primary* tables —
 * not unioned with any legacy vertical-specific tables. The v_client_resources
 * view does the union for rollup counting; drill-down lists stay on the
 * canonical table to keep row shapes predictable.
 */
const TABLE_FOR: Record<ResourceType, string> = {
  sites: "sites",
  team: "team_members",
  credentials: "credentials",
  assets: "assets",
  third_parties: "third_parties",
  inspections: "inspections",
  materials: "materials",
  permits: "permits",
  findings: "findings",
}

// ──────────────────────────────────────────────────────────────────────────
// Overview — one call returns the nine rollups (joined with is_primary)
// ──────────────────────────────────────────────────────────────────────────

export type CoverageOverviewRow = {
  resource_type: ResourceType
  label: string
  singular_label: string | null
  sort_order: number
  total_count: number
  attention_count: number
  critical_count: number
  last_updated: string | null
  population_state: string | null
  is_primary: boolean
  enabled: boolean
}

/**
 * Pulls the nine rollups for a client from v_client_resources and joins each
 * one to its `resource_type_vertical_map` row so the caller can split primary
 * vs secondary tiles.
 *
 * JOIN STRATEGY: PostgREST embedding across a view → table with a non-FK
 * relationship is brittle. We issue two queries and fold in JS — cheap at
 * this cardinality (9 rows per side), and resilient to RPC quirks. Flagged
 * as `strategy: "two-query-fallback"` in the reported metrics.
 */
export async function getCoverageOverview(
  clientId: string
): Promise<CoverageOverviewRow[]> {
  const supabase = await createClient()

  // 1) The per-client rollups (view) — nine rows, one per resource type.
  const { data: rollupRows, error: rollupErr } = await supabase
    .from("v_client_resources")
    .select(
      "resource_type, label, singular_label, sort_order, total_count, attention_count, critical_count, last_updated, population_state, client_vertical"
    )
    .eq("client_id", clientId)
    .order("sort_order", { ascending: true })

  if (rollupErr || !rollupRows || rollupRows.length === 0) return []

  const vertical =
    (rollupRows[0].client_vertical as string | undefined) ?? null

  // 2) is_primary / enabled map for the client's vertical — also nine rows.
  let primaryByType: Record<string, { is_primary: boolean; enabled: boolean }> = {}
  if (vertical) {
    const { data: mapRows } = await supabase
      .from("resource_type_vertical_map")
      .select("resource_type, is_primary, enabled")
      .eq("vertical_slug", vertical)

    primaryByType = Object.fromEntries(
      (mapRows ?? []).map((row) => [
        row.resource_type as string,
        {
          is_primary: (row.is_primary as boolean | null) ?? false,
          enabled: (row.enabled as boolean | null) ?? true,
        },
      ])
    )
  }

  return rollupRows.map((row) => {
    const mapEntry = primaryByType[row.resource_type as string]
    return {
      resource_type: row.resource_type as ResourceType,
      label: (row.label as string) ?? (row.resource_type as string),
      singular_label: (row.singular_label as string | null) ?? null,
      sort_order: (row.sort_order as number | null) ?? 999,
      total_count: (row.total_count as number | null) ?? 0,
      attention_count: (row.attention_count as number | null) ?? 0,
      critical_count: (row.critical_count as number | null) ?? 0,
      last_updated: (row.last_updated as string | null) ?? null,
      population_state: (row.population_state as string | null) ?? null,
      is_primary: mapEntry?.is_primary ?? false,
      enabled: mapEntry?.enabled ?? true,
    }
  })
}

// ──────────────────────────────────────────────────────────────────────────
// List + Detail — canonical-table queries
// ──────────────────────────────────────────────────────────────────────────

/**
 * Returns the canonical-table rows for a resource type + client. Does NOT
 * union legacy vertical-specific tables — when the view's total_count
 * exceeds rows.length, the UI renders a "N rows not yet migrated" footer.
 */
export async function listResources(
  type: ResourceType,
  clientId: string
): Promise<ResourceRow[]> {
  const supabase = await createClient()
  const table = TABLE_FOR[type]

  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("client_id", clientId)
    .limit(500)

  if (error || !data) return []
  return data as ResourceRow[]
}

/**
 * Canonical-table detail fetch. Returns null when the row isn't found or
 * doesn't belong to the client (RLS enforces ownership; the .eq filter is a
 * belt-and-suspenders check).
 */
export async function getResource(
  type: ResourceType,
  id: string,
  clientId: string
): Promise<ResourceRow | null> {
  const supabase = await createClient()
  const table = TABLE_FOR[type]

  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("id", id)
    .eq("client_id", clientId)
    .maybeSingle()

  if (error || !data) return null
  return data as ResourceRow
}

// ──────────────────────────────────────────────────────────────────────────
// Vertical override — single (vertical, type) lookup
// ──────────────────────────────────────────────────────────────────────────

/**
 * Fetches the vertical-specific override for a given (vertical, type) pair.
 * Returns the "default applies" shape when no row exists — this mirrors the
 * pre-seed tolerance used throughout the Coverage UI.
 */
export async function getVerticalOverride(
  vertical: string,
  type: ResourceType
): Promise<VerticalOverride> {
  const supabase = await createClient()

  const { data } = await supabase
    .from("resource_type_vertical_map")
    .select(
      "enabled, is_primary, label_override, singular_override, description_override, sort_order"
    )
    .eq("vertical_slug", vertical)
    .eq("resource_type", type)
    .maybeSingle()

  return {
    enabled: data?.enabled ?? true,
    is_primary: data?.is_primary ?? false,
    label_override: data?.label_override ?? null,
    singular_override: data?.singular_override ?? null,
    description_override: data?.description_override ?? null,
    sort_order: (data?.sort_order as number | null) ?? null,
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Team drill-down — credential compliance rollup (NGE-461 v1)
// ──────────────────────────────────────────────────────────────────────────

/**
 * Per-member credential rollup attached to the enriched team row.
 *
 * `expired`    — credential status ∈ {expired, revoked, suspended}
 * `expiring`   — still active but `expires_date` falls inside the next 30 days
 * `active`     — everything else with a row
 *
 * `total` is the count of credentials joined to this member.
 */
export type CredentialSummary = {
  total: number
  expired: number
  expiring: number
  active: number
}

/**
 * Enriched row shape returned from `listTeamWithCompliance`. All `team_members`
 * columns pass through verbatim; we graft `credential_summary` on top so the
 * config's `statusFn` + column accessors can read it without re-querying.
 *
 * NOTE: `training_summary` is intentionally absent in v1 — see the Phase 0
 * schema audit. `training_records` has no FK to `team_members`; filed under
 * follow-up ticket NGE-461 v2.
 */
export type TeamRowWithCompliance = ResourceRow & {
  credential_summary: CredentialSummary
}

const EXPIRED_STATUSES = new Set<string>(["expired", "revoked", "suspended"])
const THIRTY_DAYS_MS = 30 * 86_400_000

function summarizeCredentialsFor(
  memberId: string,
  all: Array<{
    holder_id: string | null
    status: string | null
    expires_date: string | null
  }>
): CredentialSummary {
  const now = Date.now()
  const soon = now + THIRTY_DAYS_MS
  let expired = 0
  let expiring = 0
  let active = 0
  for (const cred of all) {
    if (cred.holder_id !== memberId) continue
    const status = (cred.status ?? "").toLowerCase()
    if (EXPIRED_STATUSES.has(status)) {
      expired++
      continue
    }
    if (cred.expires_date) {
      const ts = new Date(cred.expires_date).getTime()
      if (!Number.isNaN(ts) && ts <= soon) {
        expiring++
        continue
      }
    }
    active++
  }
  return {
    total: expired + expiring + active,
    expired,
    expiring,
    active,
  }
}

/**
 * List all active team members for a client, each row enriched with a
 * credential compliance rollup + optional PII redaction for sensitive
 * verticals.
 *
 * PII-SENSITIVE MODE: when `shouldRedactPII(vertical)` is true we swap
 * `full_name` for the member's role. The table isn't mutated; we replace the
 * field on the returned row so downstream list/detail surfaces render the
 * safe value without any extra branching.
 */
export async function listTeamWithCompliance(
  clientId: string,
  vertical: string | null
): Promise<TeamRowWithCompliance[]> {
  const supabase = await createClient()

  const { data: members, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("client_id", clientId)
    .neq("status", "terminated")
    .order("full_name", { ascending: true })
    .limit(500)

  if (error || !members || members.length === 0) return []

  const memberIds = members.map((m) => m.id as string)

  const { data: creds } = await supabase
    .from("credentials")
    .select("holder_id, status, expires_date")
    .eq("client_id", clientId)
    .in("holder_id", memberIds)

  const credsList = (creds ?? []) as Array<{
    holder_id: string | null
    status: string | null
    expires_date: string | null
  }>

  const redact = shouldRedactPII(vertical)

  return members.map((raw) => {
    const row = raw as ResourceRow
    const memberId = row.id as string
    const summary = summarizeCredentialsFor(memberId, credsList)
    const role = (row.role as string | null) ?? "Team member"
    return {
      ...row,
      full_name: redact ? role : row.full_name,
      email: redact ? null : row.email,
      phone: redact ? null : row.phone,
      credential_summary: summary,
    }
  })
}

/**
 * Detail fetch for a single team member — full profile + linked credentials.
 * Incident + training joins are deferred (see Phase 0 schema note); when the
 * upstream tickets land those lists will attach here.
 *
 * PII redaction follows the same rule as the list action.
 */
export async function getTeamMemberDetail(
  id: string,
  clientId: string,
  vertical: string | null
): Promise<
  | (TeamRowWithCompliance & {
      credentials: Array<{
        id: string
        credential_type: string | null
        credential_number: string | null
        issuing_authority: string | null
        issued_date: string | null
        expires_date: string | null
        status: string | null
      }>
    })
  | null
> {
  const supabase = await createClient()

  const { data: member, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("id", id)
    .eq("client_id", clientId)
    .maybeSingle()

  if (error || !member) return null

  const { data: creds } = await supabase
    .from("credentials")
    .select(
      "id, credential_type, credential_number, issuing_authority, issued_date, expires_date, status, holder_id"
    )
    .eq("client_id", clientId)
    .eq("holder_id", id)
    .order("expires_date", { ascending: true, nullsFirst: false })

  const credsList = (creds ?? []) as Array<{
    id: string
    credential_type: string | null
    credential_number: string | null
    issuing_authority: string | null
    issued_date: string | null
    expires_date: string | null
    status: string | null
    holder_id: string | null
  }>

  const summary = summarizeCredentialsFor(
    id,
    credsList.map((c) => ({
      holder_id: c.holder_id,
      status: c.status,
      expires_date: c.expires_date,
    }))
  )

  const redact = shouldRedactPII(vertical)
  const row = member as ResourceRow
  const role = (row.role as string | null) ?? "Team member"

  return {
    ...row,
    full_name: redact ? role : row.full_name,
    email: redact ? null : row.email,
    phone: redact ? null : row.phone,
    credential_summary: summary,
    credentials: credsList.map(({ holder_id: _omit, ...c }) => c),
  }
}
