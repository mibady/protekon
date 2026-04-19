"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell } from "@phosphor-icons/react/dist/ssr"
import { ScoreRing } from "@/components/v2/primitives/ScoreRing"

// ──────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────

export type SidebarPosture = "STRONG" | "AT RISK" | "NEEDS WORK"

export type SidebarClient = {
  business_name: string
  vertical_display: string
  compliance_score: number | null
  posture_label: SidebarPosture | null
}

export type SidebarGroup = {
  label: string
  items: Array<{ key: string; name: string; href: string }>
}

export type SidebarProps = {
  client: SidebarClient
  criticalCount: number
  onBellClick?: () => void
}

// ──────────────────────────────────────────────────────────────────────────
// Surface map — 26 keys / 5 groups (Today/Briefing is the officer-narrated
// daily brief; the My Business → Dashboard route is the posture-at-a-glance
// registry view. Both exist side-by-side.)
// ──────────────────────────────────────────────────────────────────────────

export const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    label: "Today",
    items: [
      { key: "briefing", name: "Briefing", href: "/dashboard/briefing" },
    ],
  },
  {
    label: "My Business",
    items: [
      { key: "dashboard", name: "Dashboard", href: "/dashboard" },
      { key: "coverage", name: "Coverage", href: "/dashboard/coverage" },
      { key: "documents", name: "Documents", href: "/dashboard/documents" },
      { key: "training", name: "Training log", href: "/dashboard/training" },
      { key: "incidents", name: "Incident log", href: "/dashboard/incidents" },
      { key: "acknowledgments", name: "Acknowledgments", href: "/dashboard/acknowledgments" },
      { key: "calendar", name: "Calendar", href: "/dashboard/calendar" },
      { key: "activity", name: "Activity", href: "/dashboard/activity" },
    ],
  },
  {
    label: "My Subs",
    items: [
      { key: "projects", name: "Projects", href: "/dashboard/projects" },
      { key: "vendor_risk", name: "Vendor risk score", href: "/dashboard/vendor-risk" },
      { key: "coi_verification", name: "COI verification", href: "/dashboard/coi-verification" },
      { key: "sub_onboarding", name: "Sub onboarding", href: "/dashboard/sub-onboarding" },
      { key: "safety_programs", name: "Safety programs", href: "/dashboard/safety-programs" },
      { key: "form_1099", name: "1099-NEC", href: "/dashboard/form-1099" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { key: "whats_happening", name: "Enforcement feed", href: "/dashboard/whats-happening" },
      { key: "reg_changes", name: "Regulatory changes", href: "/dashboard/reg-changes" },
      { key: "benchmarks", name: "Peer benchmarks", href: "/dashboard/benchmarks" },
      { key: "pipeline", name: "Rulemaking & history", href: "/dashboard/pipeline" },
      { key: "knowledge", name: "Knowledge base", href: "/dashboard/knowledge" },
      { key: "marketplace", name: "Marketplace", href: "/dashboard/marketplace" },
    ],
  },
  {
    label: "Account",
    items: [
      { key: "audit_trail", name: "Audit trail", href: "/dashboard/audit-trail" },
      { key: "team", name: "Team & permissions", href: "/dashboard/team" },
      { key: "scheduled_reports", name: "Scheduled reports", href: "/dashboard/scheduled-reports" },
      { key: "integrations", name: "Integrations", href: "/dashboard/integrations" },
      { key: "my_business", name: "My business settings", href: "/dashboard/my-business" },
    ],
  },
]

// ──────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────

/**
 * Active detection. `/dashboard` must match exactly (otherwise every dashboard
 * child would light it up). All other hrefs use prefix-with-slash to preserve
 * highlight on nested routes like `/dashboard/coverage/subcontractors`.
 */
function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false
  if (href === "/dashboard") return pathname === "/dashboard"
  if (pathname === href) return true
  return pathname.startsWith(href + "/")
}

/** Posture pill palette — STRONG is sand, AT RISK / NEEDS WORK are enforcement. */
function postureColor(label: SidebarPosture): string {
  return label === "STRONG" ? "var(--sand)" : "var(--enforcement)"
}

// ──────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────

export function Sidebar({ client, criticalCount, onBellClick }: SidebarProps) {
  const pathname = usePathname()
  const borderColor = "rgba(250, 250, 248, 0.06)"
  const inactiveText = "rgba(250, 250, 248, 0.5)"

  return (
    <aside
      className="flex flex-col flex-shrink-0"
      style={{
        background: "var(--void)",
        width: "260px",
        minHeight: "100vh",
      }}
      aria-label="Primary navigation"
    >
      {/* Wordmark */}
      <div className="px-6 py-5" style={{ borderBottom: `1px solid ${borderColor}` }}>
        <Link href="/dashboard" className="inline-flex flex-col">
          <span
            className="font-display"
            style={{
              color: "var(--white)",
              fontSize: "22px",
              letterSpacing: "4px",
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            PROT<span style={{ color: "var(--crimson)" }}>E</span>KON
          </span>
          <span
            className="font-display"
            style={{
              color: "var(--sand)",
              fontSize: "9px",
              letterSpacing: "3px",
              marginTop: "4px",
            }}
          >
            YOUR COMPLIANCE OFFICER
          </span>
        </Link>
      </div>

      {/* Client identity block */}
      <Link
        href="/dashboard"
        className="block px-6 py-5 transition-colors"
        style={{
          borderBottom: `1px solid ${borderColor}`,
          background: pathname === "/dashboard" ? "rgba(196,18,48,0.08)" : "transparent",
        }}
      >
        <div className="flex items-center gap-4">
          <ScoreRing score={client.compliance_score} size="sm" />
          <div className="flex flex-col gap-1 min-w-0">
            <span
              className="font-sans truncate"
              style={{ color: "var(--white)", fontSize: "13px" }}
              title={client.business_name}
            >
              {client.business_name}
            </span>
            <span
              className="font-sans truncate"
              style={{ color: "rgba(250, 250, 248, 0.5)", fontSize: "11px" }}
            >
              {client.vertical_display}
            </span>
            {client.posture_label && (
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="rounded-full"
                  style={{
                    width: 8,
                    height: 8,
                    background: postureColor(client.posture_label),
                  }}
                />
                <span
                  className="font-display uppercase"
                  style={{
                    color: postureColor(client.posture_label),
                    fontSize: "9px",
                    letterSpacing: "2px",
                    fontWeight: 500,
                  }}
                >
                  {client.posture_label}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-4">
        {SIDEBAR_GROUPS.map((group) => (
          <div key={group.label} className="mb-5">
            <span
              className="block px-3 mb-2 font-display uppercase"
              style={{
                color: "var(--fog)",
                fontSize: "10px",
                letterSpacing: "3px",
                fontWeight: 500,
              }}
            >
              {group.label}
            </span>
            <ul className="flex flex-col" style={{ gap: "2px" }}>
              {group.items.map((item) => {
                const active = isActive(pathname, item.href)
                return (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      className="block w-full px-3 py-2.5 transition-colors"
                      style={{
                        background: active ? "rgba(196, 18, 48, 0.07)" : "transparent",
                        borderLeft: `3px solid ${active ? "var(--enforcement)" : "transparent"}`,
                      }}
                      aria-current={active ? "page" : undefined}
                    >
                      <span
                        className="font-display"
                        style={{
                          color: active ? "var(--white)" : inactiveText,
                          fontSize: "12px",
                          letterSpacing: "1px",
                          fontWeight: 500,
                        }}
                      >
                        {item.name}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer: bell + version line */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderTop: `1px solid ${borderColor}` }}
      >
        <span
          className="font-sans truncate"
          style={{ color: "var(--fog)", fontSize: "10px" }}
          title={`Protekon v3 — ${client.business_name}`}
        >
          Protekon v3 — {client.business_name}
        </span>
        <button
          type="button"
          onClick={onBellClick}
          aria-label={
            criticalCount > 0
              ? `Notifications — ${criticalCount} critical`
              : "Notifications"
          }
          className="relative flex items-center justify-center flex-shrink-0 transition-colors"
          style={{
            width: 32,
            height: 32,
            background: "rgba(250,250,248,0.06)",
            color: "var(--fog)",
            border: "1px solid rgba(250,250,248,0.08)",
            cursor: "pointer",
          }}
        >
          <Bell size={14} weight="regular" />
          {criticalCount > 0 && (
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                top: -6,
                right: -6,
                minWidth: 18,
                height: 18,
                padding: "0 5px",
                borderRadius: 9,
                background: "var(--enforcement)",
                color: "var(--parchment)",
                fontSize: "10px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid var(--void)",
                lineHeight: 1,
              }}
            >
              {criticalCount > 99 ? "99+" : criticalCount}
            </span>
          )}
        </button>
      </div>
    </aside>
  )
}
