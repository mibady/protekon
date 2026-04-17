import { Buildings } from "@phosphor-icons/react/dist/ssr"
import type { ResourceConfig, ResourceRow } from "@/lib/v2/coverage-types"

/**
 * Sites — the physical locations the client operates from.
 *
 * Prod table: `public.sites`. Per v_client_resources, sites roll up total
 * count only (no attention or critical bands) — there's no regulator-driven
 * state machine on a site itself. All row-level status reports as "ok".
 *
 * Column keys map to real `sites` columns: name, address, city, state, zip,
 * employee_count, is_primary (flag on sites rows — distinct from the
 * resource_type_vertical_map flag of the same name).
 */
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
      key: "address",
      label: "Address",
      value: (row) => {
        const parts = [
          row.address,
          row.city,
          [row.state, row.zip].filter(Boolean).join(" ") || null,
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
      label: "Primary",
      value: (row) => (row.is_primary === true ? "Yes" : null),
      secondary: true,
    },
  ],
  detailSections: [
    {
      label: "Location",
      render: (row) => [
        { label: "Name", value: (row.name as string | null) ?? null },
        { label: "Address", value: (row.address as string | null) ?? null },
        { label: "City", value: (row.city as string | null) ?? null },
        { label: "State", value: (row.state as string | null) ?? null },
        { label: "ZIP", value: (row.zip as string | null) ?? null },
      ],
    },
    {
      label: "Footprint",
      render: (row) => [
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
  statusFn: () => "ok",
}

export const sitesIcon = Buildings
