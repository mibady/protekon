import { jurisdictionFor } from "@/lib/v2/reporting-rules"
import { CTAButton } from "@/components/v2/primitives/CTAButton"

/**
 * ReportingBanner — jurisdiction + role aware OSHA reporting alert.
 *
 * Pure presentational server component. Accepts `serverNow` so all
 * "time remaining" math is resolved server-side on each render —
 * never reads the client clock. Consumers pass a server-resolved ISO
 * timestamp (e.g. `new Date().toISOString()` in the parent Server
 * Component) so SSR output stays deterministic.
 *
 * Returns `null` when there is nothing to escalate:
 *   - no incident
 *   - incident already reported
 *   - severity is "other" (not reportable)
 */

export type ReportingBannerSeverity =
  | "fatality"
  | "hospitalization"
  | "amputation"
  | "eye_loss"
  | "other"

export type ReportingBannerRole =
  | "owner"
  | "compliance_manager"
  | "field_lead"
  | "auditor"

export type ReportingBannerIncident = {
  id: string
  occurred_at: string // ISO timestamp
  severity: ReportingBannerSeverity
  reported_at: string | null
  site: { state: string } // 2-letter code
}

export type ReportingBannerProps = {
  incident: ReportingBannerIncident | null
  userRole: ReportingBannerRole
  serverNow: string // ISO — MUST be passed from server, never use Date.now()
  onReportClick?: () => void
}

type Tone = "overdue" | "urgent" | "warning" | "info"

type ToneStyle = {
  background: string
  color: string
  accent: string
}

const TONE_STYLES: Record<Tone, ToneStyle> = {
  overdue: {
    background: "var(--enforcement)",
    color: "var(--parchment)",
    accent: "var(--parchment)",
  },
  urgent: {
    background: "var(--enforcement)",
    color: "var(--parchment)",
    accent: "var(--parchment)",
  },
  warning: {
    background: "var(--sand)",
    color: "var(--ink)",
    accent: "var(--ink)",
  },
  info: {
    background: "var(--steel)",
    color: "var(--parchment)",
    accent: "var(--parchment)",
  },
}

const SEVERITY_LABEL: Record<Exclude<ReportingBannerSeverity, "other">, string> = {
  fatality: "Fatality",
  hospitalization: "In-patient hospitalization",
  amputation: "Amputation",
  eye_loss: "Loss of eye",
}

const MS_PER_HOUR = 3_600_000

function pickClockHours(
  severity: Exclude<ReportingBannerSeverity, "other">,
  jurisdiction: ReturnType<typeof jurisdictionFor>,
): number {
  switch (severity) {
    case "fatality":
      return jurisdiction.fatalityClockHours
    case "hospitalization":
      return jurisdiction.hospitalizationClockHours
    case "amputation":
      return jurisdiction.amputationClockHours
    case "eye_loss":
      return jurisdiction.eyeLossClockHours
  }
}

function toneForRemaining(remainingHours: number): Tone {
  if (remainingHours < 0) return "overdue"
  if (remainingHours < 2) return "urgent"
  if (remainingHours < 8) return "warning"
  return "info"
}

function formatCountdown(remainingMs: number): string {
  if (remainingMs < 0) {
    const overdueMs = Math.abs(remainingMs)
    const h = Math.floor(overdueMs / MS_PER_HOUR)
    const m = Math.floor((overdueMs % MS_PER_HOUR) / 60_000)
    return `OVERDUE by ${h}h ${m}m`
  }
  if (remainingMs < MS_PER_HOUR) {
    const m = Math.max(0, Math.floor(remainingMs / 60_000))
    return `${m}m remaining`
  }
  const h = Math.floor(remainingMs / MS_PER_HOUR)
  const m = Math.floor((remainingMs % MS_PER_HOUR) / 60_000)
  return `${h}h ${m}m`
}

function stripPhone(phone: string): string {
  return phone.replace(/[^\d+]/g, "")
}

export function ReportingBanner({
  incident,
  userRole,
  serverNow,
  onReportClick,
}: ReportingBannerProps) {
  // Gating — render nothing when there is nothing to escalate.
  if (incident === null) return null
  if (incident.reported_at !== null) return null
  if (incident.severity === "other") return null

  const severity = incident.severity
  const jurisdiction = jurisdictionFor(incident.site.state)
  const clockHours = pickClockHours(severity, jurisdiction)

  const occurredMs = new Date(incident.occurred_at).getTime()
  const nowMs = new Date(serverNow).getTime()
  const deadlineMs = occurredMs + clockHours * MS_PER_HOUR
  const remainingMs = deadlineMs - nowMs
  const remainingHours = remainingMs / MS_PER_HOUR

  const tone = toneForRemaining(remainingHours)
  const toneStyle = TONE_STYLES[tone]
  const countdown = formatCountdown(remainingMs)
  const telHref = `tel:${stripPhone(jurisdiction.phone)}`

  const deadlineHeadline = `${SEVERITY_LABEL[severity]} reportable to ${jurisdiction.authority} in ${countdown}`

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        background: toneStyle.background,
        color: toneStyle.color,
      }}
      className="w-full border-0"
    >
      <div className="flex flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
        {/* Left: countdown badge + severity */}
        <div className="flex items-center gap-4">
          <div
            className="font-display uppercase"
            style={{
              borderLeft: `3px solid ${toneStyle.accent}`,
              paddingLeft: "12px",
              letterSpacing: "2px",
              fontSize: "11px",
              fontWeight: 600,
              opacity: 0.85,
            }}
          >
            {tone === "overdue"
              ? "Past deadline"
              : tone === "urgent"
                ? "Urgent"
                : tone === "warning"
                  ? "Warning"
                  : "Informational"}
          </div>
          <div
            className="font-display uppercase"
            style={{
              fontSize: "22px",
              fontWeight: 700,
              letterSpacing: "1px",
              lineHeight: 1,
            }}
          >
            {countdown}
          </div>
        </div>

        {/* Middle: deadline headline + citation + form + phone */}
        <div className="flex-1 md:px-6">
          <div
            className="font-display uppercase"
            style={{
              fontSize: "15px",
              fontWeight: 700,
              letterSpacing: "0.5px",
              lineHeight: 1.2,
            }}
          >
            {deadlineHeadline}
          </div>
          <div
            className="font-sans"
            style={{ fontSize: "12px", opacity: 0.85, marginTop: "4px" }}
          >
            {jurisdiction.citation} · {jurisdiction.reportingForm} ·{" "}
            <a
              href={telHref}
              style={{
                color: "inherit",
                textDecoration: "underline",
                textUnderlineOffset: "2px",
              }}
            >
              {jurisdiction.phone}
            </a>
          </div>
        </div>

        {/* Right: role-specific actions */}
        <div className="flex flex-wrap items-center gap-3">
          <RoleActions
            userRole={userRole}
            phone={jurisdiction.phone}
            telHref={telHref}
            onReportClick={onReportClick}
            accent={toneStyle.accent}
          />
        </div>
      </div>
    </div>
  )
}

type RoleActionsProps = {
  userRole: ReportingBannerRole
  phone: string
  telHref: string
  onReportClick?: () => void
  accent: string
}

function RoleActions({
  userRole,
  phone,
  telHref,
  onReportClick,
  accent,
}: RoleActionsProps) {
  if (userRole === "owner") {
    return (
      <>
        <CTAButton variant="primary" onClick={onReportClick}>
          Report now
        </CTAButton>
        <a
          href="#assign"
          className="font-sans"
          style={{
            color: "inherit",
            fontSize: "12px",
            textDecoration: "underline",
            textUnderlineOffset: "2px",
            opacity: 0.9,
          }}
        >
          Assign to compliance manager
        </a>
      </>
    )
  }

  if (userRole === "compliance_manager") {
    return (
      <div className="flex flex-col items-end gap-1">
        <CTAButton variant="primary" onClick={onReportClick}>
          Start report
        </CTAButton>
        <span
          className="font-sans"
          style={{ fontSize: "11px", opacity: 0.8 }}
        >
          Escalate to owner if unable to complete by deadline
        </span>
      </div>
    )
  }

  if (userRole === "field_lead") {
    return (
      <div
        className="font-sans"
        style={{
          fontSize: "13px",
          fontWeight: 500,
          textAlign: "right",
          lineHeight: 1.3,
        }}
      >
        Call your compliance manager.
        <br />
        <a
          href={telHref}
          style={{
            color: "inherit",
            textDecoration: "underline",
            textUnderlineOffset: "2px",
            fontWeight: 600,
          }}
        >
          {phone}
        </a>
      </div>
    )
  }

  // auditor — read-only badge, no CTAs
  return (
    <span
      className="font-display uppercase"
      style={{
        border: `1px solid ${accent}`,
        padding: "4px 10px",
        fontSize: "10px",
        letterSpacing: "2px",
        fontWeight: 600,
        opacity: 0.9,
      }}
    >
      Read only
    </span>
  )
}
