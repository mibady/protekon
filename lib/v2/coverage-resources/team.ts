import { UsersThree } from "@phosphor-icons/react/dist/ssr"
import type { ResourceConfig, ResourceRow } from "@/lib/v2/coverage-types"

type CredentialSummary = {
  total: number
  expired: number
  expiring: number
  active: number
}

type LinkedCredential = {
  id: string
  credential_type: string | null
  credential_number: string | null
  issuing_authority: string | null
  issued_date: string | null
  expires_date: string | null
  status: string | null
}

function getSummary(row: ResourceRow): CredentialSummary | null {
  const s = row.credential_summary
  if (!s || typeof s !== "object") return null
  const summary = s as Partial<CredentialSummary>
  return {
    total: summary.total ?? 0,
    expired: summary.expired ?? 0,
    expiring: summary.expiring ?? 0,
    active: summary.active ?? 0,
  }
}

function formatCredentialCell(summary: CredentialSummary | null): string | null {
  if (!summary || summary.total === 0) return "None on file"
  if (summary.expired > 0) {
    return `${summary.expired} expired · ${summary.total} total`
  }
  if (summary.expiring > 0) {
    return `${summary.expiring} expiring · ${summary.total} total`
  }
  return `${summary.total} current`
}

/**
 * Team members — employees, contractors, and supervisors.
 *
 * Prod table: `public.team_members`. Rows are enriched with a
 * `credential_summary` rollup when fetched via `listTeamWithCompliance` /
 * `getTeamMemberDetail` (NGE-461). The `statusFn` reads that rollup to flag
 * expired (critical) or near-expiring (attention) credentials on the row.
 *
 * v1 SCOPE (NGE-461 v1):
 *   - credential compliance bands live
 *   - PII-aware rendering handled in the action layer (role substitutes for
 *     full_name when vertical is PII-sensitive)
 *
 * DEFERRED to NGE-461 v2:
 *   - training_records join (schema has no FK to team_members)
 *   - incident filter (incidents table has no member reference)
 */
export const teamConfig: ResourceConfig<ResourceRow> = {
  type: "team",
  defaultLabel: "Team",
  defaultSingular: "Team member",
  defaultDescription:
    "Add your team and I'll track every certification, training cycle, and hire date so nothing slips through the cracks.",
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
      key: "credentials",
      label: "Credentials",
      value: (row) => formatCredentialCell(getSummary(row)),
    },
    {
      key: "status",
      label: "Status",
      value: (row) => (row.status as string | null) ?? null,
      secondary: true,
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
      label: "Profile",
      render: (row) => [
        { label: "Full name", value: (row.full_name as string | null) ?? null },
        { label: "Role", value: (row.role as string | null) ?? null },
        { label: "Status", value: (row.status as string | null) ?? null },
        {
          label: "Supervisor",
          value: row.is_supervisor === true ? "Yes" : "No",
        },
        { label: "Email", value: (row.email as string | null) ?? null },
        { label: "Phone", value: (row.phone as string | null) ?? null },
      ],
    },
    {
      label: "Assignment",
      render: (row) => [
        { label: "Site", value: (row.site_id as string | null) ?? null },
        { label: "Start date", value: (row.start_date as string | null) ?? null },
        { label: "End date", value: (row.end_date as string | null) ?? null },
      ],
    },
    {
      label: "Credentials",
      render: (row) => {
        const summary = getSummary(row)
        const creds = (row.credentials as LinkedCredential[] | undefined) ?? []
        if (!summary || summary.total === 0) {
          return [
            {
              label: "On file",
              value: "None yet. Upload certifications and I'll watch the expirations.",
            },
          ]
        }
        const fields: { label: string; value: string | null }[] = [
          {
            label: "Total on file",
            value: String(summary.total),
          },
          {
            label: "Expired",
            value: summary.expired > 0 ? String(summary.expired) : null,
          },
          {
            label: "Expiring in 30 days",
            value: summary.expiring > 0 ? String(summary.expiring) : null,
          },
          {
            label: "Current",
            value: summary.active > 0 ? String(summary.active) : null,
          },
        ]
        for (const cred of creds.slice(0, 10)) {
          const parts: string[] = []
          if (cred.credential_type) parts.push(cred.credential_type)
          if (cred.issuing_authority) parts.push(cred.issuing_authority)
          const left = parts.join(" · ") || "Credential"
          const rightParts: string[] = []
          if (cred.expires_date) rightParts.push(`expires ${cred.expires_date}`)
          if (cred.status) rightParts.push(cred.status)
          fields.push({
            label: left,
            value: rightParts.join(" · ") || null,
          })
        }
        return fields
      },
    },
  ],
  statusFn: (row) => {
    const summary = getSummary(row)
    if (summary) {
      if (summary.expired > 0) return "critical"
      if (summary.expiring > 0) return "attention"
      if (summary.total > 0) return "ok"
    }
    const status = row.status as string | null
    if (status && status !== "active") return "attention"
    return "ok"
  },
}

export const teamIcon = UsersThree
