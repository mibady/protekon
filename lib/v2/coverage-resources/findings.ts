import { Warning } from "@phosphor-icons/react/dist/ssr"
import type { ResourceConfig, ResourceRow } from "@/lib/v2/coverage-types"

/**
 * Findings — OSHA citations, internal audit findings, and equivalent
 * regulator-driven corrective-action records.
 *
 * Prod table: `public.findings`. Bands lifted from v_client_resources:
 *
 *   critical  — abatement_status = 'open' AND
 *               classification in (serious, willful, repeat, failure_to_abate)
 *   attention — abatement_status = 'in_progress'
 *   ok        — abatement_status = 'closed' (or everything else)
 */
export const findingsConfig: ResourceConfig<ResourceRow> = {
  type: "findings",
  defaultLabel: "Findings",
  defaultSingular: "Finding",
  defaultDescription:
    "OSHA citations, audit findings, and corrective-action items I'm tracking from open through abatement.",
  columns: [
    {
      key: "classification",
      label: "Classification",
      value: (row) => (row.classification as string | null) ?? null,
    },
    {
      key: "description",
      label: "Description",
      value: (row) => (row.description as string | null) ?? null,
    },
    {
      key: "citation_standard",
      label: "Standard",
      value: (row) => (row.citation_standard as string | null) ?? null,
      secondary: true,
    },
    {
      key: "abatement_due_date",
      label: "Abatement due",
      value: (row) => (row.abatement_due_date as string | null) ?? null,
    },
    {
      key: "abatement_status",
      label: "Status",
      value: (row) => (row.abatement_status as string | null) ?? null,
    },
  ],
  detailSections: [
    {
      label: "Finding",
      render: (row) => [
        {
          label: "Classification",
          value: (row.classification as string | null) ?? null,
        },
        {
          label: "Description",
          value: (row.description as string | null) ?? null,
        },
        {
          label: "Citation standard",
          value: (row.citation_standard as string | null) ?? null,
        },
      ],
    },
    {
      label: "Abatement",
      render: (row) => [
        {
          label: "Status",
          value: (row.abatement_status as string | null) ?? null,
        },
        {
          label: "Due",
          value: (row.abatement_due_date as string | null) ?? null,
        },
        {
          label: "Closed",
          value: (row.abatement_closed_at as string | null) ?? null,
        },
      ],
    },
  ],
  statusFn: (row) => {
    const status = row.abatement_status as string | null
    const classification = row.classification as string | null
    if (
      status === "open" &&
      classification &&
      ["serious", "willful", "repeat", "failure_to_abate"].includes(
        classification
      )
    ) {
      return "critical"
    }
    if (status === "in_progress") return "attention"
    return "ok"
  },
}

export const findingsIcon = Warning
