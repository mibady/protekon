import Link from "next/link"
import { Certificate, FileArrowDown } from "@phosphor-icons/react/dist/ssr"
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
 *
 * NOTE — per-row dates vs rollup divergence (NGE-474 v1 → v2 follow-up):
 * The Dates section colors the days-until-expiry with a 60-day attention
 * band (crimson <0, gold <60, steel ≥60). The statusFn above — and the
 * v_client_resources CASE expression it mirrors — uses a 30-day band. The
 * spec for NGE-474 calls for 60 days across the board. A refactor ticket is
 * filed to update the view so the rollup and per-row display realign. Until
 * that lands, the row's left-border badge (statusFn) may say OK while the
 * Dates detail color says Attention for the 30–60 day window. This is
 * intentional and documented.
 */

// Pool badge — shown when holder_id is null, meaning the credential is
// assigned to the client entity rather than a specific team member.
// Common for staffing / warehouse shared certifications.
function PoolBadge() {
  return (
    <span
      className="inline-block bg-gold/15 text-gold text-[10px] tracking-[0.2em] font-medium px-2 py-0.5 uppercase"
      style={{ borderRadius: 0 }}
    >
      Unassigned pool
    </span>
  )
}

function HolderLink({ id, name }: { id: string; name: string }) {
  return (
    <Link
      href={`/dashboard/coverage/team/${id}`}
      className="text-midnight underline decoration-steel/40 underline-offset-2 hover:decoration-crimson hover:text-crimson"
    >
      {name}
    </Link>
  )
}

function DocumentLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 text-midnight underline decoration-steel/40 underline-offset-2 hover:decoration-crimson hover:text-crimson"
    >
      <FileArrowDown size={16} weight="regular" />
      View uploaded scan
    </a>
  )
}

// Days-until-expiry tone — 60-day attention band per NGE-474 spec.
// Diverges from statusFn (30-day) intentionally; see note at file top.
function expiryTone(expires: string): "past" | "soon" | "far" {
  const delta = new Date(expires).getTime() - Date.now()
  const days = Math.floor(delta / (24 * 60 * 60 * 1000))
  if (days < 0) return "past"
  if (days < 60) return "soon"
  return "far"
}

function DaysUntil({ expires }: { expires: string }) {
  const tone = expiryTone(expires)
  const delta = new Date(expires).getTime() - Date.now()
  const days = Math.floor(delta / (24 * 60 * 60 * 1000))
  const label =
    days < 0
      ? `Expired ${Math.abs(days)} ${Math.abs(days) === 1 ? "day" : "days"} ago`
      : days === 0
        ? "Expires today"
        : `${days} ${days === 1 ? "day" : "days"} until expiry`
  const color =
    tone === "past"
      ? "text-crimson"
      : tone === "soon"
        ? "text-gold"
        : "text-steel"
  return <span className={`font-sans text-sm ${color}`}>{label}</span>
}

function StatusBadge({ status }: { status: string }) {
  const critical = ["expired", "suspended", "revoked"]
  const tone = critical.includes(status) ? "critical" : "ok"
  const bg = tone === "critical" ? "bg-crimson/10" : "bg-fog/40"
  const text = tone === "critical" ? "text-crimson" : "text-midnight"
  return (
    <span
      className={`inline-block ${bg} ${text} text-[10px] tracking-[0.2em] font-medium px-2 py-0.5 uppercase`}
      style={{ borderRadius: 0 }}
    >
      {status}
    </span>
  )
}

export const credentialsConfig: ResourceConfig<ResourceRow> = {
  type: "credentials",
  defaultLabel: "Credentials",
  defaultSingular: "Credential",
  defaultDescription:
    "Start by adding the credentials your team holds — I'll track every expiration date so nothing lapses.",
  columns: [
    {
      key: "holder_name",
      label: "Holder",
      value: (row) => {
        const holderId = (row.holder_id as string | null) ?? null
        if (holderId === null) return "Unassigned pool"
        return (row.holder_name as string | null) ?? null
      },
      render: (row) => {
        const holderId = (row.holder_id as string | null) ?? null
        if (holderId === null) return <PoolBadge />
        const name = (row.holder_name as string | null) ?? null
        if (name === null) return null
        return <HolderLink id={holderId} name={name} />
      },
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
      label: "Record",
      render: (row) => {
        const status = (row.status as string | null) ?? null
        return [
          {
            label: "Type",
            value: (row.credential_type as string | null) ?? null,
          },
          {
            label: "Number",
            // Prod stores credential_number as plain text today. Field-level
            // encryption is tracked as a separate v2 follow-up (see NGE-474 v2).
            value: (row.credential_number as string | null) ?? null,
          },
          {
            label: "Issuer",
            value: (row.issuing_authority as string | null) ?? null,
          },
          {
            label: "Status",
            value: status,
            render: status ? <StatusBadge status={status} /> : undefined,
          },
        ]
      },
    },
    {
      label: "Holder",
      render: (row) => {
        const holderId = (row.holder_id as string | null) ?? null
        const name = (row.holder_name as string | null) ?? null
        if (holderId !== null && name !== null) {
          return [
            {
              label: "Assigned to",
              value: name,
              render: <HolderLink id={holderId} name={name} />,
            },
            { label: "Assignment", value: "Assigned" },
          ]
        }
        return [
          {
            label: "Assigned to",
            value: "Unassigned (credential pool)",
            render: (
              <span className="italic text-steel">
                Unassigned (credential pool)
              </span>
            ),
          },
        ]
      },
    },
    {
      label: "Dates",
      render: (row) => {
        const issued = (row.issued_date as string | null) ?? null
        const expires = (row.expires_date as string | null) ?? null
        return [
          { label: "Issued", value: issued },
          { label: "Expires", value: expires },
          {
            label: "Outlook",
            // Displayed per-row with a 60-day attention band, per NGE-474
            // spec. Rollup statusFn still uses 30 days — divergence noted at
            // the top of this file and tracked as a follow-up ticket.
            value: expires,
            render: expires ? <DaysUntil expires={expires} /> : undefined,
          },
        ]
      },
    },
    {
      label: "Document",
      render: (row) => {
        const url = (row.document_url as string | null) ?? null
        return [
          {
            label: "Uploaded scan",
            value: url ?? "No document on file yet.",
            render: url ? (
              <DocumentLink href={url} />
            ) : (
              <span className="italic text-steel">
                No document on file yet.
              </span>
            ),
          },
        ]
      },
    },
  ],
  // statusFn mirrors the v_client_resources CASE expression's 30-day
  // attention band so rollup counts and list badges stay in lockstep.
  // The per-row Dates section above uses a 60-day band per NGE-474 spec;
  // a view migration to realign both is tracked as a follow-up ticket.
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
