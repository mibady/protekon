import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Sidebar, type SidebarClient, type SidebarPosture } from "@/components/v2/Sidebar"
import {
  ReportingBanner,
  type ReportingBannerIncident,
  type ReportingBannerSeverity,
} from "@/components/v2/ReportingBanner"
import { getUnreadCount } from "@/lib/actions/alerts"
import { getOpenReportableIncident } from "@/lib/actions/incidents"
import { getUserRole } from "@/lib/auth/roles"

// Map the DB `severity` string onto the banner's constrained union. The
// banner only cares about the reportable-to-Cal/OSHA severities; anything
// else degrades to "other" which short-circuits banner rendering.
function toBannerSeverity(severity: string): ReportingBannerSeverity {
  switch (severity) {
    case "fatality":
    case "fatal":
      return "fatality"
    case "hospitalization":
    case "in_patient":
      return "hospitalization"
    case "amputation":
      return "amputation"
    case "eye_loss":
      return "eye_loss"
    default:
      return "other"
  }
}

// Vertical slug → human display. Scraper DB ships display strings; app stores
// slugs. Centralised here so the sidebar can stay presentation-only.
const VERTICAL_DISPLAY: Record<string, string> = {
  construction: "Construction",
  manufacturing: "Manufacturing",
  healthcare: "Healthcare",
  hospitality: "Hospitality",
  warehouse: "Warehouse & logistics",
  wholesale: "Warehouse & logistics",
  agriculture: "Agriculture",
  retail: "Retail",
  transportation: "Transportation",
  "real-estate": "Real estate",
  "auto-services": "Auto services",
}

function verticalDisplay(slug: string): string {
  return VERTICAL_DISPLAY[slug] ?? slug.replace(/-/g, " ")
}

/**
 * Posture rule for the sidebar pill. Matches the spec contract:
 *   >= 80 → STRONG, 60-79 → NEEDS WORK, < 60 → AT RISK, null → null.
 * The full briefing narrative lives in Briefing.tsx — this is orientation only.
 */
function postureFor(score: number | null): SidebarPosture | null {
  if (score === null) return null
  if (score >= 80) return "STRONG"
  if (score >= 60) return "NEEDS WORK"
  return "AT RISK"
}

/**
 * Auth gate for all /v2/* routes.
 *
 * Contract:
 *   1. Unauthenticated users              → /login?next=/v2
 *   2. No matching client row (partner/admin)
 *                                         → /login?error=unauthorized
 *   3. Authenticated client               → render v2 shell
 *
 * The legacy /dashboard surface was removed when v2 went all-in; the
 * v2_enabled flag is kept in the schema but no longer gated on here. If
 * we ever need to roll back a specific client to the legacy UI, the flag
 * can be re-wired, but today every client is on v2 unconditionally.
 *
 * The gate runs server-side on every request. No client-side flicker.
 * Sidebar receives the client record and renders identity + nav.
 */
export default async function V2Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?next=/dashboard")
  }

  // Admin client bypasses RLS for the self-lookup. Identity is already
  // verified via auth.getUser() above. Same pattern as lib/actions/intake.ts.
  //
  // Column list MUST match the actual prod schema. `state` and
  // `onboarding_completed_at` are V2Client-typed optionals but DO NOT
  // exist on the `clients` table — including them in the select made
  // PostgREST silently return null for the whole row, which the layout
  // misclassified as "no client found" → unauthorized redirect. Always
  // log the error to catch the next column-typo regression early.
  const admin = createAdminClient()
  const { data: client, error: clientErr } = await admin
    .from("clients")
    .select(
      "id, business_name, vertical, compliance_score, v2_enabled, onboarding_status, partner_id",
    )
    .eq("email", user.email!)
    .maybeSingle()

  if (clientErr) {
    console.error("[dashboard/layout] clients lookup error:", clientErr)
  }

  if (!client) {
    const { data: partner } = await supabase
      .from("partner_profiles")
      .select("status")
      .eq("user_id", user.id)
      .maybeSingle()

    if (partner?.status === "approved") {
      redirect("/partner")
    }

    redirect("/login?error=unauthorized")
  }

  // Direct-signup clients with no completed onboarding get routed to the
  // wizard. Partner-provisioned clients (partner_id set) skip this guard —
  // their onboarding is a separate concern handled outside /dashboard.
  if (
    client.onboarding_status === "not_started" &&
    client.partner_id === null
  ) {
    redirect("/onboarding/business")
  }

  const sidebarClient: SidebarClient = {
    business_name: client.business_name,
    vertical_display: verticalDisplay(client.vertical),
    compliance_score: client.compliance_score,
    posture_label: postureFor(client.compliance_score),
  }

  // Wire notification unread count and most-recent-open-reportable incident
  // in parallel. Both helpers are resilient (return 0 / null on error) so
  // the layout never breaks if either lookup fails.
  const [criticalCountResult, rawIncident] = await Promise.all([
    getUnreadCount().catch(() => ({ count: 0 })),
    getOpenReportableIncident(user.id).catch(() => null),
  ])
  const criticalCount = criticalCountResult.count ?? 0

  // Adapt the DB Incident row onto the banner's prop contract. The banner
  // takes `occurred_at` (ISO) and a `site.state` 2-letter code; the DB
  // row carries `incident_date` (date or datetime) and doesn't surface a
  // site row through this query yet. Falling back to the client's vertical
  // state is a future wire — for Wave 1 we default to the CA ruleset since
  // every seat today operates in California. If no site context is
  // available the banner still renders correctly.
  const incident: ReportingBannerIncident | null = rawIncident
    ? {
        id: rawIncident.id,
        occurred_at:
          rawIncident.incident_date ?? rawIncident.created_at ?? new Date().toISOString(),
        severity: toBannerSeverity(rawIncident.severity),
        reported_at:
          (rawIncident as { reported_at?: string | null }).reported_at ?? null,
        site: { state: "CA" },
      }
    : null

  // Resolve the caller's role via the user_roles table (migration 047).
  // Existing single-user-per-client seats are seeded as 'owner', so no
  // behavior regresses. Default to least-privilege field_lead if the
  // caller has no activated role row — keeps the banner copy honest.
  const userRole = (await getUserRole()) ?? "field_lead"

  return (
    <div
      className="flex min-h-screen"
      style={{ background: "var(--parchment)" }}
    >
      <Sidebar client={sidebarClient} criticalCount={criticalCount} />
      <main className="flex-1 min-w-0 min-h-screen flex flex-col">
        <ReportingBanner
          incident={incident}
          userRole={userRole}
          serverNow={new Date().toISOString()}
        />
        {children}
      </main>
    </div>
  )
}
