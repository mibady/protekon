import {
  CheckCircle,
  Handshake,
  Warning,
} from "@phosphor-icons/react/dist/ssr"
import type { ResourceConfig, ResourceRow } from "@/lib/v2/coverage-types"

/**
 * Third parties — subcontractors, vendors, tenants, BAA counterparties —
 * anyone who shares compliance exposure with the client. The per-vertical
 * vocab override (migration 044) supplies the user-facing label; at the data
 * layer everything routes through `public.third_parties`.
 *
 * Bands lifted from v_client_resources CASE expressions so list rendering
 * matches rollup counts:
 *
 *   critical  — coi_status in (expired, missing) OR
 *               cardinality(risk_flags) > 0
 *   attention — coi_status = 'expiring'
 *   ok        — everything else
 *
 * SCHEMA NOTE (2026-04-16): the spec body for NGE-476 references columns
 * that don't exist on prod (`agreement_expires`, `risk_tier`, `party_type`,
 * `display_name`, contact fields). We follow the prod schema verified via
 * supabase MCP this session:
 *
 *   entity_name           text
 *   relationship_type     text
 *   ein                   text
 *   license_number        text
 *   license_status        text
 *   license_expires_at    date
 *   coi_status            text
 *   coi_expires_at        date
 *   w9_on_file            boolean
 *   baa_signed_at         date        (renders as "BAA signed on {date}"
 *                                      or "No BAA on file" — not an expiry)
 *   last_verified_at      timestamptz
 *   risk_flags            text[]      (non-empty → fires critical)
 *   vertical_data         jsonb
 *
 * Contact surfacing (primary_contact_name / email / phone) is not on the
 * prod table today; a follow-up is filed as part of NGE-476 v2.
 */

// ──────────────────────────────────────────────────────────────────────────
// Presentation helpers — keep render functions pure, no client state.
// ──────────────────────────────────────────────────────────────────────────

/** Human-readable date: "Apr 16, 2026". Returns null when date is unparseable. */
function fmtDate(iso: string | null): string | null {
  if (!iso) return null
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

/** Days until expiry — positive = future, negative = past. Null if unparseable. */
function daysUntil(iso: string | null): number | null {
  if (!iso) return null
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return null
  return Math.floor((t - Date.now()) / (24 * 60 * 60 * 1000))
}

function daysTone(days: number | null): "past" | "soon" | "far" | "none" {
  if (days === null) return "none"
  if (days < 0) return "past"
  if (days <= 30) return "soon"
  return "far"
}

function daysColor(tone: "past" | "soon" | "far" | "none"): string {
  if (tone === "past") return "text-crimson"
  if (tone === "soon") return "text-gold"
  return "text-steel"
}

/** Badge for a {license,coi}_status string. Tone mirrors the view's CASE bands. */
function StatusBadge({ status }: { status: string | null }) {
  if (!status) {
    return <span className="font-sans text-sm text-steel/80">—</span>
  }
  const critical = ["expired", "missing", "suspended", "revoked"]
  const watch = ["expiring", "pending"]
  const tone = critical.includes(status)
    ? "critical"
    : watch.includes(status)
      ? "attention"
      : "ok"
  const bg =
    tone === "critical"
      ? "bg-crimson/10"
      : tone === "attention"
        ? "bg-gold/10"
        : "bg-fog/40"
  const text =
    tone === "critical"
      ? "text-crimson"
      : tone === "attention"
        ? "text-gold"
        : "text-midnight"
  return (
    <span
      className={`inline-block ${bg} ${text} text-[10px] tracking-[0.2em] font-medium px-2 py-0.5 uppercase`}
      style={{ borderRadius: 0 }}
    >
      {status}
    </span>
  )
}

/**
 * Dual-element cell: status badge + days-colored expiry line.
 * Used for both License and COI columns so the list row surfaces the two
 * signals the partner-onboarding use case cares about in one glance.
 */
function DualStatusCell({
  status,
  expiresAt,
}: {
  status: string | null
  expiresAt: string | null
}) {
  const days = daysUntil(expiresAt)
  const tone = daysTone(days)
  const color = daysColor(tone)
  const formatted = fmtDate(expiresAt)
  let expiryLabel: string
  if (formatted === null) {
    expiryLabel = "No expiry on file"
  } else if (days === null) {
    expiryLabel = formatted
  } else if (days < 0) {
    const abs = Math.abs(days)
    expiryLabel = `Expired ${abs} ${abs === 1 ? "day" : "days"} ago`
  } else if (days === 0) {
    expiryLabel = "Expires today"
  } else {
    expiryLabel = `${formatted} · ${days} ${days === 1 ? "day" : "days"} out`
  }
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5">
      <StatusBadge status={status} />
      <span className={`font-sans text-xs ${color}`}>{expiryLabel}</span>
    </span>
  )
}

/** Entity column cell — name (display) + relationship_type subtitle (steel). */
function EntityCell({ row }: { row: ResourceRow }) {
  const name = (row.entity_name as string | null) ?? "(unnamed)"
  const relationship = (row.relationship_type as string | null) ?? null
  return (
    <span className="inline-flex flex-col">
      <span className="font-display text-midnight">{name}</span>
      {relationship && (
        <span className="font-sans text-xs text-steel/80">
          {relationship}
        </span>
      )}
    </span>
  )
}

/** Risk-flags column cell — Warning icon + chip count, or em-dash when empty. */
function RiskCell({ row }: { row: ResourceRow }) {
  const flags = row.risk_flags as string[] | null | undefined
  const count = Array.isArray(flags) ? flags.length : 0
  if (count === 0) {
    return <span className="font-sans text-sm text-steel/70">—</span>
  }
  return (
    <span className="inline-flex items-center gap-1 text-crimson">
      <Warning size={14} weight="fill" />
      <span className="font-sans text-xs">
        {count} {count === 1 ? "flag" : "flags"}
      </span>
    </span>
  )
}

/** Rolled-up status badge used in the "Status" column. */
function StatusRollupCell({ row }: { row: ResourceRow }) {
  const label = thirdPartiesConfig.statusFn(row)
  if (label === "critical") {
    return (
      <span
        className="inline-block bg-crimson/10 text-crimson text-[10px] tracking-[0.2em] font-medium px-2 py-0.5 uppercase"
        style={{ borderRadius: 0 }}
      >
        Action required
      </span>
    )
  }
  if (label === "attention") {
    return (
      <span
        className="inline-block bg-gold/10 text-gold text-[10px] tracking-[0.2em] font-medium px-2 py-0.5 uppercase"
        style={{ borderRadius: 0 }}
      >
        Watch list
      </span>
    )
  }
  return (
    <span
      className="inline-block bg-fog/40 text-midnight text-[10px] tracking-[0.2em] font-medium px-2 py-0.5 uppercase"
      style={{ borderRadius: 0 }}
    >
      Compliant
    </span>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Config
// ──────────────────────────────────────────────────────────────────────────

export const thirdPartiesConfig: ResourceConfig<ResourceRow> = {
  type: "third_parties",
  defaultLabel: "Third parties",
  defaultSingular: "Third party",
  defaultDescription:
    "Your outside partners — subs, vendors, carriers, business associates — live here. I track every COI, license, and BAA so a lapse on their side never becomes your liability.",
  columns: [
    {
      key: "entity",
      label: "Entity",
      value: (row) => (row.entity_name as string | null) ?? null,
      render: (row) => <EntityCell row={row} />,
    },
    {
      key: "license",
      label: "License",
      value: (row) => (row.license_status as string | null) ?? null,
      render: (row) => (
        <DualStatusCell
          status={(row.license_status as string | null) ?? null}
          expiresAt={(row.license_expires_at as string | null) ?? null}
        />
      ),
      secondary: true,
    },
    {
      key: "coi",
      label: "COI",
      // Fallback value keeps the row visible even when status is missing —
      // missing COI is the whole point of tracking third parties.
      value: (row) =>
        (row.coi_status as string | null) ??
        (row.coi_expires_at as string | null) ??
        "—",
      render: (row) => (
        <DualStatusCell
          status={(row.coi_status as string | null) ?? null}
          expiresAt={(row.coi_expires_at as string | null) ?? null}
        />
      ),
    },
    {
      key: "risk",
      label: "Risk flags",
      value: (row) => {
        const flags = row.risk_flags as string[] | null | undefined
        const count = Array.isArray(flags) ? flags.length : 0
        return count > 0 ? `${count}` : null
      },
      render: (row) => <RiskCell row={row} />,
      secondary: true,
    },
    {
      key: "status",
      label: "Status",
      // Always renders — the rollup is the primary at-a-glance signal.
      value: () => "status",
      render: (row) => <StatusRollupCell row={row} />,
    },
  ],
  detailSections: [
    {
      label: "Entity",
      render: (row) => {
        const ein = (row.ein as string | null) ?? null
        return [
          {
            label: "Name",
            value: (row.entity_name as string | null) ?? null,
          },
          {
            label: "Relationship",
            value: (row.relationship_type as string | null) ?? null,
          },
          {
            label: "EIN",
            value: ein ?? "—",
          },
        ]
      },
    },
    {
      label: "License",
      render: (row) => {
        const status = (row.license_status as string | null) ?? null
        const expires = (row.license_expires_at as string | null) ?? null
        const days = daysUntil(expires)
        const tone = daysTone(days)
        const color = daysColor(tone)
        const formatted = fmtDate(expires)
        const expiryLabel =
          formatted === null
            ? null
            : days !== null && days < 0
              ? `${formatted} · expired ${Math.abs(days)} ${Math.abs(days) === 1 ? "day" : "days"} ago`
              : days !== null && days === 0
                ? `${formatted} · expires today`
                : days !== null
                  ? `${formatted} · ${days} ${days === 1 ? "day" : "days"} out`
                  : formatted
        return [
          {
            label: "Number",
            value: (row.license_number as string | null) ?? null,
          },
          {
            label: "Status",
            value: status,
            render: status ? <StatusBadge status={status} /> : undefined,
          },
          {
            label: "Expires",
            value: expiryLabel,
            render: expiryLabel ? (
              <span className={`font-sans text-sm ${color}`}>
                {expiryLabel}
              </span>
            ) : undefined,
          },
        ]
      },
    },
    {
      label: "Certificate of Insurance",
      render: (row) => {
        const status = (row.coi_status as string | null) ?? null
        const expires = (row.coi_expires_at as string | null) ?? null
        const days = daysUntil(expires)
        const tone = daysTone(days)
        const color = daysColor(tone)
        const formatted = fmtDate(expires)
        const expiryLabel =
          formatted === null
            ? null
            : days !== null && days < 0
              ? `${formatted} · expired ${Math.abs(days)} ${Math.abs(days) === 1 ? "day" : "days"} ago`
              : days !== null && days === 0
                ? `${formatted} · expires today`
                : days !== null
                  ? `${formatted} · ${days} ${days === 1 ? "day" : "days"} out`
                  : formatted
        return [
          {
            label: "Status",
            value: status ?? "No COI on file",
            render: status ? (
              <StatusBadge status={status} />
            ) : (
              <span className="italic text-crimson font-sans text-sm">
                No COI on file
              </span>
            ),
          },
          {
            label: "Expires",
            value: expiryLabel,
            render: expiryLabel ? (
              <span className={`font-sans text-sm ${color}`}>
                {expiryLabel}
              </span>
            ) : undefined,
          },
        ]
      },
    },
    {
      label: "Documents",
      render: (row) => {
        const w9 = row.w9_on_file === true
        const baaDate = (row.baa_signed_at as string | null) ?? null
        const baaFormatted = fmtDate(baaDate)
        return [
          {
            label: "W-9 on file",
            value: w9 ? "Yes" : "No",
            render: w9 ? (
              <span className="inline-flex items-center gap-1 font-sans text-sm text-midnight">
                <CheckCircle size={14} weight="fill" className="text-midnight" />
                On file
              </span>
            ) : (
              <span className="font-sans text-sm text-steel/80">—</span>
            ),
          },
          {
            label: "BAA",
            value: baaFormatted ?? "No BAA on file",
            render: baaFormatted ? (
              <span className="font-sans text-sm text-midnight">
                Signed on {baaFormatted}
              </span>
            ) : (
              <span className="font-sans text-sm text-steel/80 italic">
                No BAA on file
              </span>
            ),
          },
        ]
      },
    },
    {
      label: "Risk flags",
      render: (row) => {
        const flags = row.risk_flags as string[] | null | undefined
        const list = Array.isArray(flags) ? flags : []
        if (list.length === 0) {
          return [
            {
              label: "Status",
              value: "No risk flags on this party.",
              render: (
                <span className="font-sans text-sm text-steel/80 italic">
                  No risk flags on this party.
                </span>
              ),
            },
          ]
        }
        return [
          {
            label: list.length === 1 ? "Flag" : "Flags",
            value: list.join(", "),
            render: (
              <span className="inline-flex flex-wrap gap-1">
                {list.map((flag) => (
                  <span
                    key={flag}
                    className="inline-flex items-center gap-1 bg-crimson/10 text-crimson text-[10px] tracking-[0.15em] font-medium px-2 py-0.5 uppercase"
                    style={{ borderRadius: 0 }}
                  >
                    <Warning size={10} weight="fill" />
                    {flag}
                  </span>
                ))}
              </span>
            ),
          },
        ]
      },
    },
    {
      label: "Verification",
      render: (row) => {
        const lastVerified = (row.last_verified_at as string | null) ?? null
        const formatted = fmtDate(lastVerified)
        return [
          {
            label: "Last verified",
            value: formatted ?? "Never verified",
            render: formatted ? (
              <span className="font-sans text-sm text-midnight">
                {formatted}
              </span>
            ) : (
              <span className="font-sans text-sm text-steel/80 italic">
                Never verified
              </span>
            ),
          },
        ]
      },
    },
  ],
  statusFn: (row) => {
    const coiStatus = row.coi_status as string | null
    const riskFlags = row.risk_flags
    const hasRiskFlags = Array.isArray(riskFlags) && riskFlags.length > 0
    if (
      (coiStatus && ["expired", "missing"].includes(coiStatus)) ||
      hasRiskFlags
    ) {
      return "critical"
    }
    if (coiStatus === "expiring") return "attention"
    return "ok"
  },
  // Placeholder until the partner-add flow lands — hands off to the chat
  // surface so the officer can capture the first partner conversationally.
  primaryAction: {
    label: "Add a third party",
    href: () => `/dashboard/chat?q=${encodeURIComponent("Add a third party")}`,
  },
}

export const thirdPartiesIcon = Handshake
