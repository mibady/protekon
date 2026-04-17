import { ClipboardText } from "@phosphor-icons/react/dist/ssr"
import type { ResourceConfig, ResourceRow } from "@/lib/v2/coverage-types"

/**
 * Inspections — scheduled and completed regulatory inspections.
 *
 * Prod table: `public.inspections`. Bands lifted from v_client_resources so
 * list rendering matches rollup counts:
 *
 *   critical  — status = 'overdue' OR outcome = 'citation'
 *   attention — status = 'scheduled' AND scheduled_date <= today + 14 days
 *   ok        — everything else
 *
 * Shape mirrors permits/assets (PRs #9/#10) — string-only columns, no render
 * extension — so this PR lands independently of the render-extension triple
 * overlap on PRs #5/#6/#8.
 *
 * DUAL-LIFECYCLE NOTE: unlike permits/assets where the clock is always
 * future-facing, an inspection row has two states:
 *   • pre-completion — `scheduled_date` is a future target, `completed_at`
 *     is null. Countdown is meaningful here.
 *   • post-completion — `completed_at` is populated, `status` is 'completed'.
 *     The scheduled_date is in the past but is NOT overdue — it happened.
 *
 * The countdown suffix is gated on `status IN ('scheduled','overdue')` so
 * completed rows render their scheduled_date plainly, without an erroneous
 * "Nd overdue" tag.
 */

const ATTENTION_WINDOW_DAYS = 14

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
  if (days === 0) return "today"
  return `${days}d left`
}

export const inspectionsConfig: ResourceConfig<ResourceRow> = {
  type: "inspections",
  defaultLabel: "Inspections",
  defaultSingular: "Inspection",
  defaultDescription:
    "Scheduled and completed inspections from Cal/OSHA, DOT, health departments, and other regulators.",
  columns: [
    {
      key: "inspection_type",
      label: "Type",
      value: (row) => (row.inspection_type as string | null) ?? null,
    },
    {
      key: "regulatory_body",
      label: "Agency",
      value: (row) => (row.regulatory_body as string | null) ?? null,
    },
    {
      key: "scheduled_date",
      label: "Scheduled",
      // Compose "YYYY-MM-DD · Nd left" ONLY when the row is still on the
      // clock — status in (scheduled, overdue). Completed inspections render
      // the plain date so historical rows don't look like they're overdue.
      value: (row) => {
        const scheduled = (row.scheduled_date as string | null) ?? null
        if (!scheduled) return null

        const status = row.status as string | null
        const isOnClock = status === "scheduled" || status === "overdue"
        if (!isOnClock) return scheduled

        const days = daysUntil(scheduled)
        if (days === null) return scheduled

        // Show countdown when overdue, inside the attention window, or when
        // the status is already 'overdue'. Far-future scheduled inspections
        // render the date alone so the list stays quiet.
        const withinWindow = days <= ATTENTION_WINDOW_DAYS
        if (days < 0 || withinWindow || status === "overdue") {
          return `${scheduled} · ${formatDaysLabel(days)}`
        }
        return scheduled
      },
    },
    {
      key: "status",
      label: "Status",
      value: (row) => (row.status as string | null) ?? null,
    },
    {
      key: "outcome",
      label: "Outcome",
      value: (row) => (row.outcome as string | null) ?? null,
      secondary: true,
    },
  ],
  detailSections: [
    {
      label: "Inspection",
      render: (row) => [
        {
          label: "Type",
          value: (row.inspection_type as string | null) ?? null,
        },
        {
          label: "Agency",
          value: (row.regulatory_body as string | null) ?? null,
        },
        {
          label: "Status",
          value: (row.status as string | null) ?? null,
        },
        {
          label: "Outcome",
          value: (row.outcome as string | null) ?? null,
        },
      ],
    },
    {
      label: "Dates",
      render: (row) => {
        const scheduled = (row.scheduled_date as string | null) ?? null
        const completed = (row.completed_at as string | null) ?? null
        const status = row.status as string | null
        const days = daysUntil(scheduled)

        // Show the temporal-position field appropriate to the lifecycle:
        //   • on the clock → "Days until scheduled" (or overdue label)
        //   • completed    → "Days since completion" (so historical rows
        //                     carry a recency signal instead of a stale
        //                     future-facing countdown)
        const isOnClock = status === "scheduled" || status === "overdue"
        const positionLabel = isOnClock
          ? "Days until scheduled"
          : "Days since completion"
        const positionValue = (() => {
          if (isOnClock) {
            if (days === null) return null
            return days < 0
              ? `${Math.abs(days)} days overdue`
              : `${days} days`
          }
          // Post-completion: render elapsed time since completed_at.
          const completedDays = daysUntil(completed)
          if (completedDays === null) return null
          return completedDays >= 0
            ? `${completedDays} days (scheduled)`
            : `${Math.abs(completedDays)} days ago`
        })()

        return [
          { label: "Scheduled", value: scheduled },
          { label: "Completed", value: completed },
          { label: positionLabel, value: positionValue },
        ]
      },
    },
    {
      label: "Scope",
      // Scope lives partly in first-class columns (site_id — the hub FK) and
      // partly in the vertical_data jsonb bag (inspector_name, notes, scope).
      // Pull the known keys; siblings can extend via NGE-477 follow-ups.
      render: (row) => {
        const verticalData = (row.vertical_data ?? {}) as Record<string, unknown>
        const inspectorName =
          typeof verticalData.inspector_name === "string"
            ? verticalData.inspector_name
            : null
        const scopeDescription =
          typeof verticalData.scope_description === "string"
            ? verticalData.scope_description
            : null
        const notes =
          typeof verticalData.notes === "string" ? verticalData.notes : null
        return [
          {
            label: "Site",
            // Raw site_id UUID — follow-up NGE-477-site-join will wrap in
            // a site-name lookup + link to /v2/coverage/sites/:id, mirroring
            // the pattern filed for NGE-461 team/credentials joins.
            value: (row.site_id as string | null) ?? null,
          },
          {
            label: "Inspector",
            value: inspectorName,
          },
          {
            label: "Scope description",
            value: scopeDescription,
          },
          {
            label: "Notes",
            value: notes,
          },
        ]
      },
    },
  ],
  statusFn: (row) => {
    const status = row.status as string | null
    const outcome = row.outcome as string | null
    if (status === "overdue" || outcome === "citation") return "critical"
    if (status === "scheduled") {
      const scheduled = row.scheduled_date as string | null
      if (scheduled) {
        const time = new Date(scheduled).getTime()
        const windowMs = ATTENTION_WINDOW_DAYS * 24 * 60 * 60 * 1000
        if (time <= Date.now() + windowMs) return "attention"
      }
    }
    return "ok"
  },
}

export const inspectionsIcon = ClipboardText
