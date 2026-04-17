/**
 * Sites — the physical locations the client operates from.
 *
 * Prod table: `public.sites` (11 cols, no compliance clocks). Sites is a
 * HUB, not a clock: per `v_client_resources`, `sites_roll` hardcodes
 * attention=0/critical=0 because there's no status enum on a site row.
 * The drill-down's value is NAVIGATION to attached compliance load
 * (team_members, assets, inspections, permits, materials, findings) via
 * `site_id` FKs — not status on the site itself.
 *
 * ⚠️ CRITICAL `is_primary` COLLISION — READ BEFORE EDITING ⚠️
 *
 * There are TWO unrelated booleans in this codebase that share the name
 * `is_primary`. Do NOT conflate them:
 *
 *   • `sites.is_primary`                      — the operational "main
 *                                                site" flag on a client's
 *                                                own site row. True for
 *                                                the client's HQ / main
 *                                                location; false for
 *                                                satellites. THIS is the
 *                                                one the "Primary" badge
 *                                                in the list view reads.
 *
 *   • `resource_type_vertical_map.is_primary` — the Coverage sidebar pin
 *                                                flag on the per-vertical
 *                                                override matrix. True
 *                                                when a resource type
 *                                                should be pinned as a
 *                                                primary tile in the
 *                                                sidebar for that
 *                                                vertical.
 *
 * They are entirely unrelated booleans that share a name. If you find
 * yourself reaching for `is_primary` outside this file, pause and verify
 * which table you're pulling from.
 *
 * Sites are owner-managed operational data — NOT Protekon-generated.
 * The officer voice MUST NOT claim authorship of a client's sites
 * ("I set up your sites" is FALSE). The empty-state copy enforces this.
 */

import { Buildings } from "@phosphor-icons/react/dist/ssr"
import type { ResourceConfig, ResourceRow } from "@/lib/v2/coverage-types"

// ──────────────────────────────────────────────────────────────────────────
// Officer-voice empty state by vertical — 3 variants only (not 27)
// ──────────────────────────────────────────────────────────────────────────

/**
 * Returns the officer-voice empty state copy for a given vertical.
 *
 * We intentionally keep this to 3 buckets:
 *   • construction  — crew / permit / inspection / citation vocab
 *   • healthcare    — HIPAA posture / inspection record vocab
 *   • default       — generic roster / permits / inspections / docs
 *
 * DO NOT add per-vertical overrides beyond these three — the copy is
 * deliberately broad so we don't end up with 25 slightly-different strings
 * to maintain when vocab shifts.
 */
export function getSitesEmptyStateCopy(vertical: string | null): string {
  const v = (vertical ?? "").toLowerCase()
  if (v === "construction" || v === "general_construction") {
    return "You haven't added your job sites yet. When you do, I'll track crew assignments, permits, inspections, and citations at each one separately."
  }
  if (v === "healthcare" || v === "dental" || v === "medical") {
    return "You haven't added your practices yet. Each practice carries its own HIPAA posture and inspection record — let me know and I'll set them up."
  }
  return "You haven't added your sites yet. Each site gets its own roster, permits, inspections, and document trail."
}

// ──────────────────────────────────────────────────────────────────────────
// Config — list columns + detail sections
// ──────────────────────────────────────────────────────────────────────────

export const sitesConfig: ResourceConfig<ResourceRow> = {
  type: "sites",
  defaultLabel: "Sites",
  defaultSingular: "Site",
  defaultDescription:
    "Every physical location I'm maintaining plans for — your primary address and any additional sites you've added.",
  columns: [
    {
      key: "name",
      label: "Name",
      value: (row) => (row.name as string | null) ?? null,
    },
    {
      key: "location",
      label: "Location",
      value: (row) => {
        // Composed "address, city, state" in a single column.
        const parts = [
          row.address as string | null,
          row.city as string | null,
          row.state as string | null,
        ].filter((part): part is string => typeof part === "string" && part.length > 0)
        return parts.length ? parts.join(", ") : null
      },
    },
    {
      key: "employee_count",
      label: "Employees",
      value: (row) =>
        typeof row.employee_count === "number" ? String(row.employee_count) : null,
      secondary: true,
    },
    {
      key: "is_primary",
      // Reads `sites.is_primary` — the operational main-site flag.
      // See file header: this is NOT resource_type_vertical_map.is_primary.
      label: "Primary",
      value: (row) => (row.is_primary === true ? "Primary" : null),
      secondary: true,
    },
    {
      key: "compliance_load",
      label: "Compliance load",
      // The compliance-load integer is populated by the detail action when
      // rendered on the detail page. The list column reads a denormalized
      // `__compliance_load` field set by CoverageDrillDown before render;
      // when absent (list hasn't been enriched), show "—".
      value: (row) => {
        const n = row.__compliance_load
        return typeof n === "number" ? String(n) : "—"
      },
      secondary: true,
    },
  ],
  detailSections: [
    {
      label: "Location",
      render: (row) => [
        { label: "Address", value: (row.address as string | null) ?? null },
        { label: "City", value: (row.city as string | null) ?? null },
        { label: "State", value: (row.state as string | null) ?? null },
        { label: "ZIP", value: (row.zip as string | null) ?? null },
        {
          label: "Employees",
          value:
            typeof row.employee_count === "number"
              ? String(row.employee_count)
              : null,
        },
        {
          label: "Primary site",
          value: row.is_primary === true ? "Yes" : "No",
        },
      ],
    },
  ],
  // Sites has no regulator-driven state machine — every row reports "ok".
  // The v_client_resources view hardcodes attention=0/critical=0 for the
  // sites rollup, so any other tone here would disagree with the overview.
  statusFn: () => "ok",
  primaryAction: {
    label: "Add a site",
    // Sites are owner-managed. This routes to the my-business surface
    // (NGE-429 journey), NOT to an auto-generation flow.
    href: () => "/v2/my-business/sites",
  },
}

export const sitesIcon = Buildings
