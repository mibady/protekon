import { UsersThree } from "@phosphor-icons/react/dist/ssr"
import type { ResourceConfig, ResourceRow } from "@/lib/v2/coverage-types"

/**
 * Team members — employees, contractors, and supervisors.
 *
 * Prod table: `public.team_members`. The v_client_resources view filters on
 * `status = 'active'` when producing counts — we apply the same band at the
 * row level so list display matches the rollup. Any row not active is
 * surfaced as "attention" because inactive-but-present is usually a record
 * that needs to be closed out or reactivated.
 */
export const teamConfig: ResourceConfig<ResourceRow> = {
  type: "team",
  defaultLabel: "Team",
  defaultSingular: "Team member",
  defaultDescription:
    "Everyone I'm tracking on your payroll and contractor rolls — active, on leave, or recently departed.",
  columns: [
    {
      key: "full_name",
      label: "Name",
      value: (row) => (row.full_name as string | null) ?? null,
    },
    {
      key: "role",
      label: "Role",
      value: (row) => (row.role as string | null) ?? null,
    },
    {
      key: "status",
      label: "Status",
      value: (row) => (row.status as string | null) ?? null,
    },
    {
      key: "is_supervisor",
      label: "Supervisor",
      value: (row) => (row.is_supervisor === true ? "Yes" : null),
      secondary: true,
    },
    {
      key: "start_date",
      label: "Start date",
      value: (row) => (row.start_date as string | null) ?? null,
      secondary: true,
    },
  ],
  detailSections: [
    {
      label: "Person",
      render: (row) => [
        { label: "Full name", value: (row.full_name as string | null) ?? null },
        { label: "Role", value: (row.role as string | null) ?? null },
        { label: "Status", value: (row.status as string | null) ?? null },
        {
          label: "Supervisor",
          value: row.is_supervisor === true ? "Yes" : "No",
        },
      ],
    },
    {
      label: "Assignment",
      render: (row) => [
        { label: "Site", value: (row.site_id as string | null) ?? null },
        { label: "Start date", value: (row.start_date as string | null) ?? null },
      ],
    },
  ],
  statusFn: (row) => {
    const status = row.status as string | null
    if (status && status !== "active") return "attention"
    return "ok"
  },
}

export const teamIcon = UsersThree
