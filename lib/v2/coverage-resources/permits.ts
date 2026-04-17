import { FileText } from "@phosphor-icons/react/dist/ssr"
import type { ResourceConfig, ResourceRow } from "@/lib/v2/coverage-types"

/**
 * Permits — operating permits, discharge permits, air quality, etc.
 *
 * Prod table: `public.permits`. Bands lifted from v_client_resources:
 *
 *   critical  — status in (expired, suspended)
 *   attention — status = 'expiring' OR
 *               (status = 'active' AND
 *                expires_date <= today + COALESCE(renewal_window_days, 90))
 *   ok        — everything else
 */
export const permitsConfig: ResourceConfig<ResourceRow> = {
  type: "permits",
  defaultLabel: "Permits",
  defaultSingular: "Permit",
  defaultDescription:
    "Operating, environmental, and discharge permits I'm tracking for renewal and amendment windows.",
  columns: [
    {
      key: "permit_name",
      label: "Name",
      value: (row) => (row.permit_name as string | null) ?? null,
    },
    {
      key: "permit_number",
      label: "Number",
      value: (row) => (row.permit_number as string | null) ?? null,
      secondary: true,
    },
    {
      key: "issuing_agency",
      label: "Agency",
      value: (row) => (row.issuing_agency as string | null) ?? null,
    },
    {
      key: "expires_date",
      label: "Expires",
      value: (row) => (row.expires_date as string | null) ?? null,
    },
    {
      key: "status",
      label: "Status",
      value: (row) => (row.status as string | null) ?? null,
    },
  ],
  detailSections: [
    {
      label: "Permit",
      render: (row) => [
        {
          label: "Name",
          value: (row.permit_name as string | null) ?? null,
        },
        {
          label: "Number",
          value: (row.permit_number as string | null) ?? null,
        },
        {
          label: "Agency",
          value: (row.issuing_agency as string | null) ?? null,
        },
        {
          label: "Status",
          value: (row.status as string | null) ?? null,
        },
      ],
    },
    {
      label: "Validity",
      render: (row) => [
        {
          label: "Issued",
          value: (row.issued_date as string | null) ?? null,
        },
        {
          label: "Expires",
          value: (row.expires_date as string | null) ?? null,
        },
        {
          label: "Renewal window",
          value:
            typeof row.renewal_window_days === "number"
              ? `${row.renewal_window_days} days`
              : null,
        },
      ],
    },
  ],
  statusFn: (row) => {
    const status = row.status as string | null
    if (status && ["expired", "suspended"].includes(status)) return "critical"
    if (status === "expiring") return "attention"
    if (status === "active") {
      const expires = row.expires_date as string | null
      if (expires) {
        const expiryTime = new Date(expires).getTime()
        const renewalDays =
          typeof row.renewal_window_days === "number"
            ? row.renewal_window_days
            : 90
        const windowMs = renewalDays * 24 * 60 * 60 * 1000
        if (expiryTime <= Date.now() + windowMs) return "attention"
      }
    }
    return "ok"
  },
}

export const permitsIcon = FileText
