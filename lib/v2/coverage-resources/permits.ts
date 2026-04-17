import { FileText } from "@phosphor-icons/react/dist/ssr"
import type { ResourceConfig, ResourceRow } from "@/lib/v2/coverage-types"

/**
 * Permits — operating permits, discharge permits, air quality, etc.
 *
 * Prod table: `public.permits`. Bands lifted from v_client_resources so list
 * rendering matches rollup counts:
 *
 *   critical  — status in (expired, suspended)
 *   attention — status = 'expiring' OR
 *               (status = 'active' AND
 *                expires_date <= today + COALESCE(renewal_window_days, 90))
 *   ok        — everything else
 *
 * Shape mirrors credentials (PR #5 NGE-474) intentionally — permits are the
 * closest sibling in semantics: one row = one tracked document with an expiry
 * clock. The one difference is renewal_window_days: permits carry it on the
 * row, credentials use a flat 30-day threshold. That difference is reflected
 * in the statusFn and exposed in the Validity detail section.
 */

// Days between now and an ISO date string. Positive = future, negative = past.
// Returns null when input isn't parseable.
function daysUntil(iso: string | null): number | null {
  if (!iso) return null
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return null
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.round((t - Date.now()) / msPerDay)
}

function formatDaysLabel(days: number): string {
  if (days < 0) return `${Math.abs(days)}d overdue`
  if (days === 0) return "due today"
  return `${days}d left`
}

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
      // Compose "YYYY-MM-DD · Nd left" when within the renewal window so the
      // list surfaces the same urgency the statusFn is about to classify.
      // Outside the window we show the date alone.
      value: (row) => {
        const expires = (row.expires_date as string | null) ?? null
        if (!expires) return null
        const days = daysUntil(expires)
        if (days === null) return expires

        const status = row.status as string | null
        const renewalDays =
          typeof row.renewal_window_days === "number"
            ? row.renewal_window_days
            : 90

        // Show the countdown when past due, within the renewal window, or
        // when the status is already 'expiring'. Keeps the list quiet for
        // permits that aren't close to expiration.
        const withinWindow = days <= renewalDays
        if (days < 0 || withinWindow || status === "expiring") {
          return `${expires} · ${formatDaysLabel(days)}`
        }
        return expires
      },
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
      render: (row) => {
        const expires = (row.expires_date as string | null) ?? null
        const days = daysUntil(expires)
        return [
          {
            label: "Issued",
            value: (row.issued_date as string | null) ?? null,
          },
          {
            label: "Expires",
            value: expires,
          },
          {
            label: "Days until expiry",
            value:
              days === null
                ? null
                : days < 0
                  ? `${Math.abs(days)} days overdue`
                  : `${days} days`,
          },
          {
            label: "Renewal window",
            value:
              typeof row.renewal_window_days === "number"
                ? `${row.renewal_window_days} days before expiry`
                : null,
          },
        ]
      },
    },
    {
      label: "Scope",
      // Scope lives partly in first-class columns (site_id — the hub FK) and
      // partly in the vertical_data jsonb bag (scope_description, activity
      // tags). Pull the known keys; ignore the rest. Siblings can pick up
      // additional keys via NGE-479 follow-ups if demand surfaces.
      render: (row) => {
        const verticalData = (row.vertical_data ?? {}) as Record<string, unknown>
        const scopeDescription =
          typeof verticalData.scope_description === "string"
            ? verticalData.scope_description
            : null
        return [
          {
            label: "Site",
            // The list-view hub navigation uses `?site_id=…` query params.
            // The detail page renders this as a plain string — downstream
            // follow-up (filed as part of NGE-479 queue) can wrap it in a
            // site-name join + link to /v2/coverage/sites/:id.
            value: (row.site_id as string | null) ?? null,
          },
          {
            label: "Scope description",
            value: scopeDescription,
          },
        ]
      },
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
