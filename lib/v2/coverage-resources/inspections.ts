import { ClipboardText } from "@phosphor-icons/react/dist/ssr"
import type { ResourceConfig, ResourceRow } from "@/lib/v2/coverage-types"

/**
 * Inspections — scheduled and completed regulatory inspections.
 *
 * Prod table: `public.inspections`. Bands lifted from v_client_resources:
 *
 *   critical  — status = 'overdue' OR outcome = 'citation'
 *   attention — status = 'scheduled' AND scheduled_date <= today + 14 days
 *   ok        — everything else
 */
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
      value: (row) => (row.scheduled_date as string | null) ?? null,
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
      render: (row) => [
        {
          label: "Scheduled",
          value: (row.scheduled_date as string | null) ?? null,
        },
        {
          label: "Completed",
          value: (row.completed_at as string | null) ?? null,
        },
      ],
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
        const fourteenDays = Date.now() + 14 * 24 * 60 * 60 * 1000
        if (time <= fourteenDays) return "attention"
      }
    }
    return "ok"
  },
}

export const inspectionsIcon = ClipboardText
