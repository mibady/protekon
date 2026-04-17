import { Handshake } from "@phosphor-icons/react/dist/ssr"
import type { ResourceConfig, ResourceRow } from "@/lib/v2/coverage-types"

/**
 * Third parties — subcontractors, vendors, tenants, BAA counterparties —
 * anyone who shares compliance exposure with the client.
 *
 * Prod table: `public.third_parties`. Bands lifted from v_client_resources:
 *
 *   critical  — coi_status in (expired, missing) OR
 *               cardinality(risk_flags) > 0
 *   attention — coi_status = 'expiring'
 *   ok        — everything else
 */
export const thirdPartiesConfig: ResourceConfig<ResourceRow> = {
  type: "third_parties",
  defaultLabel: "Third parties",
  defaultSingular: "Third party",
  defaultDescription:
    "Subcontractors, vendors, tenants, and counterparties whose COIs and licenses I'm maintaining alongside yours.",
  columns: [
    {
      key: "entity_name",
      label: "Name",
      value: (row) => (row.entity_name as string | null) ?? null,
    },
    {
      key: "relationship_type",
      label: "Relationship",
      value: (row) => (row.relationship_type as string | null) ?? null,
    },
    {
      key: "license_status",
      label: "License",
      value: (row) => (row.license_status as string | null) ?? null,
      secondary: true,
    },
    {
      key: "coi_status",
      label: "COI",
      value: (row) => (row.coi_status as string | null) ?? null,
    },
    {
      key: "coi_expires_at",
      label: "COI expires",
      value: (row) => (row.coi_expires_at as string | null) ?? null,
    },
  ],
  detailSections: [
    {
      label: "Entity",
      render: (row) => [
        {
          label: "Name",
          value: (row.entity_name as string | null) ?? null,
        },
        {
          label: "Relationship",
          value: (row.relationship_type as string | null) ?? null,
        },
        {
          label: "License status",
          value: (row.license_status as string | null) ?? null,
        },
      ],
    },
    {
      label: "Insurance",
      render: (row) => [
        {
          label: "COI status",
          value: (row.coi_status as string | null) ?? null,
        },
        {
          label: "COI expires",
          value: (row.coi_expires_at as string | null) ?? null,
        },
      ],
    },
  ],
  statusFn: (row) => {
    const coiStatus = row.coi_status as string | null
    const riskFlags = row.risk_flags
    const hasRiskFlags =
      Array.isArray(riskFlags) && riskFlags.length > 0
    if (
      (coiStatus && ["expired", "missing"].includes(coiStatus)) ||
      hasRiskFlags
    ) {
      return "critical"
    }
    if (coiStatus === "expiring") return "attention"
    return "ok"
  },
}

export const thirdPartiesIcon = Handshake
