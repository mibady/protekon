import { Flask } from "@phosphor-icons/react/dist/ssr"
import type { ResourceConfig, ResourceRow } from "@/lib/v2/coverage-types"

/**
 * Materials — hazardous, regulated, or inventoried substances.
 *
 * Prod table: `public.materials`. Bands lifted from v_client_resources:
 *
 *   critical  — sds_url IS NULL              (missing SDS is a regulator issue)
 *   attention — last_inventory_at < today - 1 year
 *   ok        — everything else
 */
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
      value: (row) => (row.last_inventory_at as string | null) ?? null,
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
      render: (row) => [
        {
          label: "SDS",
          value: row.sds_url ? "On file" : "Missing — regulator-required",
        },
        {
          label: "Last inventory",
          value: (row.last_inventory_at as string | null) ?? null,
        },
      ],
    },
  ],
  statusFn: (row) => {
    if (!row.sds_url) return "critical"
    const lastInventory = row.last_inventory_at as string | null
    if (lastInventory) {
      const time = new Date(lastInventory).getTime()
      const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000
      if (time < oneYearAgo) return "attention"
    }
    return "ok"
  },
}

export const materialsIcon = Flask
