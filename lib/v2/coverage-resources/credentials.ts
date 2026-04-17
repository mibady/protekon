import { Certificate } from "@phosphor-icons/react/dist/ssr"
import type { ResourceConfig, ResourceRow } from "@/lib/v2/coverage-types"

/**
 * Credentials — licenses, certifications, and training cards held by team
 * members or the client entity.
 *
 * Prod table: `public.credentials`. Bands lifted from v_client_resources
 * CASE expressions so list rendering matches rollup counts:
 *
 *   critical  — status in (expired, suspended, revoked)
 *   attention — status = 'active' AND expires_date <= today + 30 days
 *   ok        — everything else
 */
export const credentialsConfig: ResourceConfig<ResourceRow> = {
  type: "credentials",
  defaultLabel: "Credentials",
  defaultSingular: "Credential",
  defaultDescription:
    "Licenses, certifications, and training records I'm watching for expiration and renewal deadlines.",
  columns: [
    {
      key: "holder_name",
      label: "Holder",
      value: (row) => (row.holder_name as string | null) ?? null,
    },
    {
      key: "credential_type",
      label: "Type",
      value: (row) => (row.credential_type as string | null) ?? null,
    },
    {
      key: "issuing_authority",
      label: "Issuer",
      value: (row) => (row.issuing_authority as string | null) ?? null,
      secondary: true,
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
      label: "Credential",
      render: (row) => [
        { label: "Holder", value: (row.holder_name as string | null) ?? null },
        {
          label: "Type",
          value: (row.credential_type as string | null) ?? null,
        },
        {
          label: "Issuer",
          value: (row.issuing_authority as string | null) ?? null,
        },
        { label: "Status", value: (row.status as string | null) ?? null },
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
      ],
    },
  ],
  statusFn: (row) => {
    const status = row.status as string | null
    if (status && ["expired", "suspended", "revoked"].includes(status)) {
      return "critical"
    }
    const expires = row.expires_date as string | null
    if (status === "active" && expires) {
      const expiryTime = new Date(expires).getTime()
      const thirtyDaysFromNow = Date.now() + 30 * 24 * 60 * 60 * 1000
      if (expiryTime <= thirtyDaysFromNow) return "attention"
    }
    return "ok"
  },
}

export const credentialsIcon = Certificate
