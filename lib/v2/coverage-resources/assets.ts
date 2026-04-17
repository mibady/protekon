import { Wrench } from "@phosphor-icons/react/dist/ssr"
import type { ResourceConfig, ResourceRow } from "@/lib/v2/coverage-types"

/**
 * Assets — equipment, machinery, vehicles the client owns or operates.
 *
 * Prod table: `public.assets`. Bands lifted from v_client_resources so list
 * rendering matches rollup counts:
 *
 *   critical  — certification_status in (overdue, out_of_service)
 *   attention — certification_status = 'due' OR
 *               (certification_status = 'certified' AND
 *                next_inspection_due <= today + 30 days)
 *   ok        — everything else
 *
 * Shape mirrors permits (PR #9 NGE-479) — same string-only column pattern,
 * no render extension, so this PR lands independently of the render-extension
 * triple overlap on PRs #5/#6/#8. The 30-day threshold is hardcoded here
 * (unlike permits' per-row renewal_window_days), matching the view's CASE
 * predicate — if/when an `inspection_window_days` column is added to
 * `public.assets`, update both this statusFn and the view migration.
 */

const INSPECTION_WINDOW_DAYS = 30

// Days between now and an ISO date string. Positive = future, negative = past.
// Returns null when input isn't parseable.
function daysUntil(iso: string | null): number | null {
  if (!iso) return null
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return null
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.round((t - Date.now()) / msPerDay)
}

function formatDaysLabel(days: number): string {
  if (days < 0) return `${Math.abs(days)}d overdue`
  if (days === 0) return "due today"
  return `${days}d left`
}

export const assetsConfig: ResourceConfig<ResourceRow> = {
  type: "assets",
  defaultLabel: "Assets",
  defaultSingular: "Asset",
  defaultDescription:
    "Equipment, machinery, and vehicles with inspection and certification requirements I'm tracking.",
  columns: [
    {
      key: "asset_name",
      label: "Name",
      value: (row) => (row.asset_name as string | null) ?? null,
    },
    {
      key: "asset_type",
      label: "Type",
      value: (row) => (row.asset_type as string | null) ?? null,
    },
    {
      key: "manufacturer_model",
      label: "Manufacturer / model",
      value: (row) => {
        const mfr = row.manufacturer as string | null
        const model = row.model as string | null
        if (mfr && model) return `${mfr} ${model}`
        return mfr ?? model ?? null
      },
      secondary: true,
    },
    {
      key: "next_inspection_due",
      label: "Next inspection",
      // Compose "YYYY-MM-DD · Nd left" when inside the 30-day window, past
      // due, or certification_status='due'. Keeps the list quiet for assets
      // that aren't close to an inspection.
      value: (row) => {
        const nextDue = (row.next_inspection_due as string | null) ?? null
        if (!nextDue) return null
        const days = daysUntil(nextDue)
        if (days === null) return nextDue

        const certStatus = row.certification_status as string | null
        const withinWindow = days <= INSPECTION_WINDOW_DAYS
        if (days < 0 || withinWindow || certStatus === "due") {
          return `${nextDue} · ${formatDaysLabel(days)}`
        }
        return nextDue
      },
    },
    {
      key: "certification_status",
      label: "Certification",
      value: (row) => (row.certification_status as string | null) ?? null,
    },
  ],
  detailSections: [
    {
      label: "Asset",
      render: (row) => [
        { label: "Name", value: (row.asset_name as string | null) ?? null },
        { label: "Type", value: (row.asset_type as string | null) ?? null },
        {
          label: "Manufacturer",
          value: (row.manufacturer as string | null) ?? null,
        },
        { label: "Model", value: (row.model as string | null) ?? null },
        {
          label: "Serial number",
          value: (row.serial_number as string | null) ?? null,
        },
      ],
    },
    {
      label: "Inspection",
      render: (row) => {
        const nextDue = (row.next_inspection_due as string | null) ?? null
        const days = daysUntil(nextDue)
        return [
          {
            label: "Last inspection",
            value: (row.last_inspection_at as string | null) ?? null,
          },
          {
            label: "Next inspection",
            value: nextDue,
          },
          {
            label: "Days until next inspection",
            value:
              days === null
                ? null
                : days < 0
                  ? `${Math.abs(days)} days overdue`
                  : `${days} days`,
          },
          {
            label: "Certification status",
            value: (row.certification_status as string | null) ?? null,
          },
        ]
      },
    },
    {
      label: "Scope",
      // Scope lives partly in first-class columns (site_id — the hub FK) and
      // partly in the vertical_data jsonb bag (operating_hours, location_note).
      // Pull the known keys; siblings can extend via NGE-475 follow-ups.
      render: (row) => {
        const verticalData = (row.vertical_data ?? {}) as Record<string, unknown>
        const operatingHours =
          typeof verticalData.operating_hours === "number"
            ? `${verticalData.operating_hours} hours`
            : typeof verticalData.operating_hours === "string"
              ? verticalData.operating_hours
              : null
        const locationNote =
          typeof verticalData.location_note === "string"
            ? verticalData.location_note
            : null
        return [
          {
            label: "Site",
            // Raw site_id UUID — follow-up NGE-475-site-join will wrap in
            // a site-name lookup + link to /v2/coverage/sites/:id, mirroring
            // the pattern filed for NGE-461 team/credentials joins.
            value: (row.site_id as string | null) ?? null,
          },
          {
            label: "Operating hours",
            value: operatingHours,
          },
          {
            label: "Location note",
            value: locationNote,
          },
        ]
      },
    },
  ],
  statusFn: (row) => {
    const certStatus = row.certification_status as string | null
    if (certStatus && ["overdue", "out_of_service"].includes(certStatus)) {
      return "critical"
    }
    if (certStatus === "due") return "attention"
    if (certStatus === "certified") {
      const nextDue = row.next_inspection_due as string | null
      if (nextDue) {
        const dueTime = new Date(nextDue).getTime()
        const windowMs = INSPECTION_WINDOW_DAYS * 24 * 60 * 60 * 1000
        if (dueTime <= Date.now() + windowMs) return "attention"
      }
    }
    return "ok"
  },
}

export const assetsIcon = Wrench
