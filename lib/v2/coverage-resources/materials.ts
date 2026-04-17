import { Flask } from "@phosphor-icons/react/dist/ssr"
import type { ResourceConfig, ResourceRow } from "@/lib/v2/coverage-types"

/**
 * Materials — hazardous, regulated, or inventoried substances.
 *
 * Prod table: `public.materials`. Bands lifted from v_client_resources so
 * list rendering matches rollup counts:
 *
 *   critical  — sds_url IS NULL              (missing SDS is a regulator issue)
 *   attention — last_inventory_at < today - 1 year
 *   ok        — everything else
 *
 * Shape mirrors permits/assets/inspections (PRs #9/#10/#11) — string-only
 * columns, no render extension — so this PR lands independently of the
 * render-extension triple overlap on PRs #5/#6/#8.
 *
 * INVERTED-CLOCK NOTE: unlike the sibling drill-downs where the clock is
 * future-facing (when does this expire?), materials runs a BACKWARD clock
 * (how long since the last inventory?). The countdown column shows "N days
 * ago" instead of "N days left", and the attention threshold is breached
 * when staleness EXCEEDS 365 days rather than when it falls below a
 * near-expiry window.
 *
 * SDS is a separate, non-time-based critical signal — a missing SDS is a
 * documentation gap a regulator will cite regardless of inventory freshness.
 */

const STALE_INVENTORY_DAYS = 365
// Heads-up window: start showing the "N days ago" suffix in the list column
// 30 days before the staleness threshold so operators have advance warning
// before the row flips to attention tone.
const INVENTORY_WARNING_WINDOW_DAYS = 30

// Days between an ISO date string and now. Positive = past, negative = future.
// Returns null when input isn't parseable.
function daysSince(iso: string | null): number | null {
  if (!iso) return null
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return null
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.round((Date.now() - t) / msPerDay)
}

function formatStalenessLabel(days: number): string {
  if (days <= 0) return "today"
  if (days === 1) return "1d ago"
  if (days < 60) return `${days}d ago`
  // Over two months, months read cleaner than day counts in a list cell.
  const months = Math.round(days / 30)
  return `${months}mo ago`
}

export const materialsConfig: ResourceConfig<ResourceRow> = {
  type: "materials",
  defaultLabel: "Materials",
  defaultSingular: "Material",
  defaultDescription:
    "Hazardous and regulated materials I'm tracking for SDS currency, inventory, and storage compliance.",
  columns: [
    {
      key: "material_name",
      label: "Name",
      value: (row) => (row.material_name as string | null) ?? null,
    },
    {
      key: "material_type",
      label: "Type",
      value: (row) => (row.material_type as string | null) ?? null,
    },
    {
      key: "quantity_on_hand",
      label: "Quantity",
      value: (row) =>
        typeof row.quantity_on_hand === "number"
          ? String(row.quantity_on_hand)
          : (row.quantity_on_hand as string | null) ?? null,
      secondary: true,
    },
    {
      key: "storage_location",
      label: "Storage",
      value: (row) => (row.storage_location as string | null) ?? null,
      secondary: true,
    },
    {
      key: "sds_url",
      label: "SDS",
      value: (row) => (row.sds_url ? "On file" : "Missing"),
    },
    {
      key: "last_inventory_at",
      label: "Last inventory",
      // Compose "YYYY-MM-DD · Nmo ago" when the row is stale OR within the
      // 30-day warning window approaching staleness. Fresh rows render the
      // date alone so the list stays quiet. Rows with no last_inventory_at
      // render "never" since an un-inventoried material is itself a signal.
      value: (row) => {
        const last = (row.last_inventory_at as string | null) ?? null
        if (!last) return "never"
        const days = daysSince(last)
        if (days === null) return last

        const approachingStale =
          days >= STALE_INVENTORY_DAYS - INVENTORY_WARNING_WINDOW_DAYS
        if (approachingStale) {
          return `${last} · ${formatStalenessLabel(days)}`
        }
        return last
      },
      secondary: true,
    },
  ],
  detailSections: [
    {
      label: "Material",
      render: (row) => [
        {
          label: "Name",
          value: (row.material_name as string | null) ?? null,
        },
        {
          label: "Type",
          value: (row.material_type as string | null) ?? null,
        },
        {
          label: "Quantity on hand",
          value:
            typeof row.quantity_on_hand === "number"
              ? String(row.quantity_on_hand)
              : (row.quantity_on_hand as string | null) ?? null,
        },
        {
          label: "Storage location",
          value: (row.storage_location as string | null) ?? null,
        },
      ],
    },
    {
      label: "Documentation",
      render: (row) => {
        const last = (row.last_inventory_at as string | null) ?? null
        const days = daysSince(last)
        const inventoryAge = (() => {
          if (last === null) return "Never inventoried"
          if (days === null) return null
          if (days <= 0) return "Today"
          return days === 1 ? "1 day ago" : `${days} days ago`
        })()
        return [
          {
            label: "SDS",
            value: row.sds_url ? "On file" : "Missing — regulator-required",
          },
          {
            label: "Last inventory",
            value: last,
          },
          {
            label: "Inventory age",
            value: inventoryAge,
          },
          {
            label: "Staleness threshold",
            value: `${STALE_INVENTORY_DAYS} days`,
          },
        ]
      },
    },
    {
      label: "Scope",
      // Scope lives partly in first-class columns (site_id — the hub FK) and
      // partly in the vertical_data jsonb bag (hazard_class, cas_number,
      // container_type). Pull the known keys; siblings can extend via
      // NGE-478 follow-ups.
      render: (row) => {
        const verticalData = (row.vertical_data ?? {}) as Record<string, unknown>
        const hazardClass =
          typeof verticalData.hazard_class === "string"
            ? verticalData.hazard_class
            : null
        const casNumber =
          typeof verticalData.cas_number === "string"
            ? verticalData.cas_number
            : null
        const containerType =
          typeof verticalData.container_type === "string"
            ? verticalData.container_type
            : null
        return [
          {
            label: "Site",
            // Raw site_id UUID — follow-up NGE-478-site-join will wrap in
            // a site-name lookup + link to /v2/coverage/sites/:id, mirroring
            // the pattern filed for NGE-461 team/credentials joins.
            value: (row.site_id as string | null) ?? null,
          },
          {
            label: "Hazard class",
            value: hazardClass,
          },
          {
            label: "CAS number",
            value: casNumber,
          },
          {
            label: "Container type",
            value: containerType,
          },
        ]
      },
    },
  ],
  statusFn: (row) => {
    if (!row.sds_url) return "critical"
    const lastInventory = row.last_inventory_at as string | null
    if (lastInventory) {
      const time = new Date(lastInventory).getTime()
      const staleThreshold =
        Date.now() - STALE_INVENTORY_DAYS * 24 * 60 * 60 * 1000
      if (time < staleThreshold) return "attention"
    }
    return "ok"
  },
}

export const materialsIcon = Flask
