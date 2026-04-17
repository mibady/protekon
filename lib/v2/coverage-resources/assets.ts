import { Wrench } from "@phosphor-icons/react/dist/ssr"
import type { ResourceConfig, ResourceRow } from "@/lib/v2/coverage-types"

/**
 * Assets — equipment, machinery, vehicles the client owns or operates.
 *
 * Prod table: `public.assets`. Bands lifted from v_client_resources:
 *
 *   critical  — certification_status in (overdue, out_of_service)
 *   attention — certification_status = 'due' OR
 *               (certification_status = 'certified' AND
 *                next_inspection_due <= today + 30 days)
 *   ok        — everything else
 */
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
      value: (row) => (row.next_inspection_due as string | null) ?? null,
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
      render: (row) => [
        {
          label: "Last inspection",
          value: (row.last_inspection_at as string | null) ?? null,
        },
        {
          label: "Next inspection",
          value: (row.next_inspection_due as string | null) ?? null,
        },
        {
          label: "Certification status",
          value: (row.certification_status as string | null) ?? null,
        },
      ],
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
        const thirtyDaysFromNow = Date.now() + 30 * 24 * 60 * 60 * 1000
        if (dueTime <= thirtyDaysFromNow) return "attention"
      }
    }
    return "ok"
  },
}

export const assetsIcon = Wrench
