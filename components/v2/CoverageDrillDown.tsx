import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { ResourceRow, ResourceType } from "@/lib/v2/coverage-types"
import type { V2Client } from "@/lib/v2/types"
import {
  RESOURCE_CONFIGS,
  getSitesEmptyStateCopy,
} from "@/lib/v2/coverage-resources"
import {
  getResource,
  getTeamMemberDetail,
  listResources,
  listTeamWithCompliance,
  type ListResourceFilters,
} from "@/lib/v2/actions/coverage"
import {
  getSiteComplianceLoad,
  getSiteRecentActivity,
  getSiteDocuments,
} from "@/lib/v2/actions/sites"
import { CoverageHeader } from "./coverage/CoverageHeader"
import { CoverageList } from "./coverage/CoverageList"
import { CoverageDetail } from "./coverage/CoverageDetail"
import { CoverageEmptyState } from "./coverage/CoverageEmptyState"
import { CoverageNotApplicable } from "./coverage/CoverageNotApplicable"
import { SitesHubDetail } from "./coverage/SitesHubDetail"
import { CoverageListFilterPill } from "./coverage/CoverageListFilterPill"

/**
 * Unified drill-down surface — renders either the list view or the detail
 * view for a single resource type. Route handlers call it with the
 * appropriate `mode`.
 *
 * The header is shared across both modes so the back-nav is consistent; the
 * only per-mode divergence is the body (list vs detail).
 *
 * ARCHITECTURE NOTE: this component resolves the per-vertical override
 * *inline* rather than reaching for the catalog. That keeps the list / detail
 * pages from needing to double-query, and it keeps the fallback path
 * (override missing → treat as enabled) centralized in one place.
 */
type Props =
  | {
      mode: "list"
      resourceType: ResourceType
      vertical: string
      client: V2Client
      /** NGE-460 — optional filters, currently just `site_id`. */
      filters?: ListResourceFilters
    }
  | {
      mode: "detail"
      resourceType: ResourceType
      vertical: string
      client: V2Client
      id: string
    }

type ResolvedOverride = {
  applies: boolean
  isPrimary: boolean
  label: string
  singular: string
  description: string | null
  sortOrder: number
}

export async function CoverageDrillDown(props: Props) {
  const { resourceType, vertical, client } = props
  const config = RESOURCE_CONFIGS[resourceType]
  if (!config) notFound()

  const override = await resolveOverride(resourceType, vertical, config)

  if (!override.applies) {
    return (
      <CoverageNotApplicable
        label={override.label}
        vertical={vertical}
      />
    )
  }

  if (props.mode === "detail") {
    const row =
      resourceType === "team"
        ? await getTeamMemberDetail(props.id, client.id, vertical)
        : await getResource(resourceType, props.id, client.id)
    if (!row) notFound()

    // Sites hub detail — extends the generic CoverageDetail with:
    //   • 6 compliance-load tiles (deep-links with ?site_id=…)
    //   • Recent activity merged from system_activity + incidents
    //   • Attached documents
    if (resourceType === "sites") {
      const [load, activity, documents] = await Promise.all([
        getSiteComplianceLoad(props.id, client.id),
        getSiteRecentActivity(props.id, client.id),
        getSiteDocuments(props.id, client.id),
      ])
      return (
        <div className="min-h-screen flex flex-col">
          <CoverageHeader
            resourceType={resourceType}
            label={override.label}
            singular={override.singular}
            mode="detail"
          />
          <SitesHubDetail
            config={config}
            row={row}
            singular={override.singular}
            vertical={vertical}
            load={load}
            activity={activity}
            documents={documents}
          />
        </div>
      )
    }

    return (
      <div className="min-h-screen flex flex-col">
        <CoverageHeader
          resourceType={resourceType}
          label={override.label}
          singular={override.singular}
          mode="detail"
        />
        <CoverageDetail
          config={config}
          row={row}
          singular={override.singular}
        />
      </div>
    )
  }

  // LIST MODE — pull canonical-table rows + the view rollup so we can render
  // a "N rows not yet migrated" footer when the view's total exceeds the
  // table row count. Team uses the compliance-enriched list so rows carry a
  // `credential_summary` and obey PII redaction for sensitive verticals.
  const [rows, viewTotals] = await Promise.all([
    resourceType === "team"
      ? listTeamWithCompliance(client.id, vertical)
      : listResources(resourceType, client.id, props.filters),
    getViewTotalCount(resourceType, client.id),
  ])

  // Enrichment: when listing sites, compute the compliance-load integer
  // per row up-front so the "Compliance load" column can render a number
  // instead of "—". Parallel to keep the list fast even at 20+ sites.
  let enrichedRows = rows
  if (resourceType === "sites" && rows.length > 0) {
    const loads = await Promise.all(
      rows.map((row) =>
        getSiteComplianceLoad(row.id as string, client.id).then((l) =>
          l.team + l.assets + l.inspections + l.permits + l.materials + l.findings
        )
      )
    )
    enrichedRows = rows.map((row, i) => ({
      ...row,
      __compliance_load: loads[i],
    }))
  }

  const notMigrated = Math.max(0, viewTotals.total - enrichedRows.length)

  // Filter pill — only rendered when site_id filter is active. Looks up
  // the site's name so the pill reads "Filtered to site: Main Clinic" and
  // not a uuid.
  const filterPill = await resolveFilterPill(props.filters, client.id, resourceType)

  // Vertical-aware empty state for sites — 3 variants max, branched in
  // the sites config helper. Non-sites types keep the generic override
  // description.
  const emptyDescription =
    resourceType === "sites"
      ? getSitesEmptyStateCopy(vertical)
      : override.description

  return (
    <div className="min-h-screen flex flex-col">
      <CoverageHeader
        resourceType={resourceType}
        label={override.label}
        singular={override.singular}
        mode="list"
      />
      {filterPill && (
        <CoverageListFilterPill
          label={filterPill.label}
          resourceType={resourceType}
        />
      )}
      {enrichedRows.length === 0 ? (
        <CoverageEmptyState
          label={override.label}
          singular={override.singular}
          description={emptyDescription}
        />
      ) : (
        <CoverageList
          config={config}
          rows={enrichedRows}
          resourceType={resourceType}
          label={override.label}
          notMigrated={notMigrated}
        />
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Filter pill resolver — looks up the site name for a site_id filter
// ──────────────────────────────────────────────────────────────────────────

/**
 * When a `site_id` filter is active, look up the site's `name` so the pill
 * reads human-readably. Returns null when the filter is absent, the site
 * doesn't exist, or the caller is already on the sites list itself (where
 * a "Filtered to site X" pill would be redundant).
 */
async function resolveFilterPill(
  filters: ListResourceFilters | undefined,
  clientId: string,
  resourceType: ResourceType
): Promise<{ label: string } | null> {
  if (!filters?.site_id) return null
  if (resourceType === "sites") return null
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("sites")
      .select("name")
      .eq("id", filters.site_id)
      .eq("client_id", clientId)
      .maybeSingle()
    const name = (data?.name as string | null) ?? null
    if (!name) return null
    return { label: name }
  } catch {
    return null
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Override resolution — two-step fetch with safe defaults
// ──────────────────────────────────────────────────────────────────────────

/**
 * Fetches the per-vertical override and the catalog row, then merges them
 * with the per-config defaults. The try/catch belt keeps the UI from blowing
 * up mid-render if one of the tables is missing a row — the default shape
 * ("applies = true") is used in that case.
 */
async function resolveOverride(
  resourceType: ResourceType,
  vertical: string,
  config: { defaultLabel: string; defaultSingular: string; defaultDescription: string }
): Promise<ResolvedOverride> {
  try {
    const supabase = await createClient()

    const [{ data: rtvm }, { data: rt }] = await Promise.all([
      supabase
        .from("resource_type_vertical_map")
        .select(
          "enabled, is_primary, label_override, singular_override, description_override, sort_order"
        )
        .eq("vertical_slug", vertical)
        .eq("resource_type", resourceType)
        .maybeSingle(),
      supabase
        .from("resource_types")
        .select("label, description, sort_order")
        .eq("key", resourceType)
        .maybeSingle(),
    ])

    return {
      applies: rtvm?.enabled ?? true,
      isPrimary: rtvm?.is_primary ?? false,
      label:
        rtvm?.label_override ??
        (rt?.label as string | null) ??
        config.defaultLabel,
      singular:
        rtvm?.singular_override ??
        (rt?.label as string | null) ??
        config.defaultSingular,
      description:
        rtvm?.description_override ??
        (rt?.description as string | null) ??
        config.defaultDescription,
      sortOrder:
        (rtvm?.sort_order as number | null) ??
        (rt?.sort_order as number | null) ??
        999,
    }
  } catch {
    return {
      applies: true,
      isPrimary: false,
      label: config.defaultLabel,
      singular: config.defaultSingular,
      description: config.defaultDescription,
      sortOrder: 999,
    }
  }
}

// ──────────────────────────────────────────────────────────────────────────
// View total — read-only signal for the "not yet migrated" footer
// ──────────────────────────────────────────────────────────────────────────

async function getViewTotalCount(
  resourceType: ResourceType,
  clientId: string
): Promise<{ total: number }> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("v_client_resources")
      .select("total_count")
      .eq("client_id", clientId)
      .eq("resource_type", resourceType)
      .maybeSingle()
    return { total: (data?.total_count as number | null) ?? 0 }
  } catch {
    return { total: 0 }
  }
}

// Re-export for pages that need the row type
export type { ResourceRow }
