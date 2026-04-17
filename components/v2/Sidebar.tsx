"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  House,
  ShieldCheck,
  FileText,
  ClockCounterClockwise,
  Newspaper,
  Storefront,
  Gear,
  SignOut,
} from "@phosphor-icons/react"
import { signOut } from "@/lib/actions/auth"
import { ScoreRing } from "@/components/v2/primitives/ScoreRing"
import type { V2Client } from "@/lib/v2/types"
import type { CoverageSubItem } from "@/lib/v2/coverage-sub-items"

// ──────────────────────────────────────────────────────────────────────────
// Nav configuration
// ──────────────────────────────────────────────────────────────────────────

/**
 * The new IA: 6 items grouped into 3 sections. Voice-correct labels —
 * "My Business" not "Settings", "What's Happening" not "News Feed".
 *
 * "My Business" appears twice: once as the surface for coverage-adjacent work
 * (Coverage, Documents, Activity sit under this umbrella conceptually) and
 * once as the account settings tab. Rendered as two sections of the sidebar
 * to keep the visual model clear.
 */
const NAV_GROUPS = [
  {
    label: "TODAY",
    items: [
      { name: "Briefing", href: "/v2/briefing", icon: House },
    ],
  },
  {
    label: "MY BUSINESS",
    items: [
      { name: "Coverage", href: "/v2/coverage", icon: ShieldCheck },
      { name: "Documents", href: "/v2/documents", icon: FileText },
      { name: "Activity", href: "/v2/activity", icon: ClockCounterClockwise },
    ],
  },
  {
    label: "INTELLIGENCE",
    items: [
      { name: "What's Happening", href: "/v2/whats-happening", icon: Newspaper },
      { name: "Marketplace", href: "/v2/marketplace", icon: Storefront },
    ],
  },
] as const

// ──────────────────────────────────────────────────────────────────────────
// Verdict copy — computed from the client record, not stored
// ──────────────────────────────────────────────────────────────────────────

/**
 * One-word status shown under the business name. Intentionally vague —
 * Briefing.tsx renders the full posture narrative. This is just orientation.
 */
function computeVerdictLabel(client: V2Client): {
  label: string
  tone: "strong" | "watch" | "attention" | "onboarding"
} {
  if (client.onboarding_completed_at === null || client.compliance_score === null) {
    return { label: "Setting up", tone: "onboarding" }
  }
  if (client.compliance_score >= 75) {
    return { label: "Strong", tone: "strong" }
  }
  if (client.compliance_score >= 50) {
    return { label: "Needs a look", tone: "watch" }
  }
  return { label: "At risk", tone: "attention" }
}

// ──────────────────────────────────────────────────────────────────────────
// Vertical display name — scraper DB uses display names, app uses slugs
// ──────────────────────────────────────────────────────────────────────────

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

function formatVertical(slug: string): string {
  return VERTICAL_DISPLAY[slug] ?? slug.replace(/-/g, " ")
}

// ──────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────

export function Sidebar({
  client,
  coverageSubItems = [],
}: {
  client: V2Client
  coverageSubItems?: CoverageSubItem[]
}) {
  const pathname = usePathname()
  const verdict = computeVerdictLabel(client)
  const coverageExpanded =
    pathname?.startsWith("/v2/coverage") ?? false

  return (
    <aside
      className="w-72 bg-void text-parchment min-h-screen flex flex-col sticky top-0"
      aria-label="Primary navigation"
    >
      {/* Wordmark */}
      <div className="px-6 pt-6 pb-4">
        <Link href="/v2/briefing" className="inline-block group">
          <div className="font-display text-2xl tracking-tight leading-none">
            PROT<span className="text-crimson">E</span>KON
          </div>
          <div className="text-[10px] tracking-[0.3em] text-gold mt-1 font-sans">
            YOUR COMPLIANCE OFFICER
          </div>
        </Link>
      </div>

      {/* Client identity block */}
      <div className="px-6 pt-4 pb-6 border-b border-white/5">
        <div className="flex items-center gap-4">
          <ScoreRing score={client.compliance_score} size="sm" />
          <div className="min-w-0">
            <div className="font-display text-base truncate" title={client.business_name}>
              {client.business_name}
            </div>
            <div className="text-[11px] text-parchment/45 tracking-wide mt-0.5">
              {formatVertical(client.vertical)}
            </div>
            <VerdictPill verdict={verdict} />
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-6">
            <div className="px-3 text-[10px] tracking-[0.25em] text-parchment/35 mb-2">
              {group.label}
            </div>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon
                const active = isActive(pathname, item.href)
                const showCoverageSubs =
                  item.href === "/v2/coverage" &&
                  coverageExpanded &&
                  coverageSubItems.length > 0
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`
                        flex items-center gap-3 px-3 py-2 text-sm rounded-none
                        border-l-2 transition-colors
                        ${
                          active
                            ? "bg-crimson/[.07] border-crimson text-parchment"
                            : "border-transparent text-parchment/55 hover:text-parchment hover:bg-white/[.03]"
                        }
                      `}
                      aria-current={active ? "page" : undefined}
                    >
                      <Icon
                        size={18}
                        weight={active ? "fill" : "regular"}
                        className={active ? "text-crimson" : ""}
                      />
                      <span>{item.name}</span>
                    </Link>
                    {showCoverageSubs && (
                      <ul className="mt-0.5 mb-1 ml-8 space-y-0 border-l border-white/10">
                        {coverageSubItems.map((sub) => {
                          const subActive = pathname === sub.href
                          return (
                            <li key={sub.href}>
                              <Link
                                href={sub.href}
                                className={`
                                  block pl-4 pr-3 py-1.5 text-[13px]
                                  border-l-2 -ml-[2px] transition-colors
                                  ${
                                    subActive
                                      ? "border-crimson text-parchment"
                                      : "border-transparent text-parchment/45 hover:text-parchment/80"
                                  }
                                `}
                                aria-current={subActive ? "page" : undefined}
                              >
                                {sub.label}
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Account footer */}
      <div className="px-3 py-3 border-t border-white/5">
        <Link
          href="/v2/my-business"
          className={`
            flex items-center gap-3 px-3 py-2 text-sm rounded-none
            border-l-2 transition-colors
            ${
              isActive(pathname, "/v2/my-business")
                ? "bg-crimson/[.07] border-crimson text-parchment"
                : "border-transparent text-parchment/55 hover:text-parchment hover:bg-white/[.03]"
            }
          `}
        >
          <Gear size={18} />
          <span>My Business</span>
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-parchment/40 hover:text-parchment/70 border-l-2 border-transparent transition-colors"
          >
            <SignOut size={18} />
            <span>Sign out</span>
          </button>
        </form>
      </div>
    </aside>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────

/**
 * "Active" means the current pathname equals the href OR starts with href + "/".
 * This keeps /v2/coverage/subcontractors from un-highlighting the Coverage item.
 * But /v2/briefing must NOT match /v2/ (exact check for namespace roots).
 */
function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false
  if (pathname === href) return true
  return pathname.startsWith(href + "/")
}

function VerdictPill({
  verdict,
}: {
  verdict: { label: string; tone: "strong" | "watch" | "attention" | "onboarding" }
}) {
  const toneClass = {
    strong: "text-gold",
    watch: "text-gold/80",
    attention: "text-crimson",
    onboarding: "text-parchment/50",
  }[verdict.tone]

  return (
    <div className={`text-[11px] font-medium mt-1 tracking-wide ${toneClass}`}>
      {verdict.label}
    </div>
  )
}
