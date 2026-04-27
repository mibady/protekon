"use client"

/**
 * DashboardSurface — ported from dashboard.jsx:1582.
 * The composite root of the v3 dashboard. Client component because it owns three
 * pieces of state: active tab (internal/subs), view (owner/manager), and scoped
 * site id. Persists each to localStorage so refresh preserves operator context.
 *
 * Consumes live data from `getDashboardSurfaceData()` and feeds it into the
 * inner views — ManagerInternal + SiteSwitcher take live `sites: SiteRollupRow[]`,
 * everything else still uses mocks with TODO(wave-3) markers.
 */

import { useCallback, useEffect, useMemo, useState } from "react"
import { PageHeader } from "@/components/v2/primitives/PageHeader"
import type { DashboardSurfaceData } from "@/lib/v2/actions/dashboard-surface"
import type { UserRole } from "@/lib/auth/roles"
import { getDashboardTerminology } from "@/lib/v2/terminology"
import { ViewToggle, type DashboardView } from "./atoms/ViewToggle"
import { TabToggle, type DashboardTab } from "./atoms/TabToggle"
import { SiteSwitcher } from "./blocks/SiteSwitcher"
import { OwnerInternal } from "./views/OwnerInternal"
import { ManagerInternal } from "./views/ManagerInternal"
import { OwnerSubcontractorRisk } from "./views/OwnerSubcontractorRisk"
import { ManagerSubcontractorRisk } from "./views/ManagerSubcontractorRisk"

type DashboardSurfaceProps = {
  data: DashboardSurfaceData
  userRole: UserRole | null
  verticalSlug: string | null
}

const STORAGE_TAB = "protekon.dash.tab"
const STORAGE_VIEW = "protekon.dash.view"
const STORAGE_SITE = "protekon.dash.site"

function readStored<T extends string>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const v = window.localStorage.getItem(key)
    return (v as T | null) ?? fallback
  } catch {
    return fallback
  }
}

function writeStored(key: string, value: string): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // storage unavailable (private mode, etc.) — ignore
  }
}

export function DashboardSurface({ data, userRole, verticalSlug }: DashboardSurfaceProps) {
  // userRole is still threaded for downstream consumers (e.g., audit logging,
  // sensitive server actions); the dashboard chrome no longer gates Manager
  // view on it. Both views are always reachable from the toggle.
  void userRole
  const terminology = useMemo(
    () => getDashboardTerminology(verticalSlug),
    [verticalSlug],
  )
  const tabLabels = useMemo(
    () => ({
      internal: { title: "Internal Posture", note: "Your documents" },
      subs: {
        title: `${terminology.thirdParty} Risk`,
        note: "External liability",
      },
    }),
    [terminology],
  )
  // Initialize from sensible defaults; hydrate from localStorage after mount
  // to avoid SSR/CSR mismatches.
  const [tab, setTab] = useState<DashboardTab>("internal")
  const [view, setView] = useState<DashboardView>("owner")
  const [siteKey, setSiteKey] = useState<string>("all")

  useEffect(() => {
    setTab(readStored<DashboardTab>(STORAGE_TAB, "internal"))
    setView(readStored<DashboardView>(STORAGE_VIEW, "owner"))
    setSiteKey(readStored<string>(STORAGE_SITE, "all"))
  }, [])

  const onTab = useCallback((k: DashboardTab) => {
    setTab(k)
    writeStored(STORAGE_TAB, k)
  }, [])

  const onView = useCallback((k: DashboardView) => {
    setView(k)
    writeStored(STORAGE_VIEW, k)
  }, [])

  const onSite = useCallback((k: string) => {
    setSiteKey(k)
    writeStored(STORAGE_SITE, k)
  }, [])

  const switchToManager = useCallback(() => onView("manager"), [onView])

  return (
    <div className="px-10 py-10" style={{ maxWidth: 1400 }}>
      <div className="flex items-start justify-between gap-6 mb-8">
        <div className="flex-1">
          <PageHeader
            eyebrow="My Business · Dashboard"
            title="Risk posture, at a glance."
            subtitle={
              view === "owner"
                ? "The short version: how safe you are today, what needs fixing, and what's coming. Switch to Manager view if you want to see every document."
                : "Full registry for the compliance officer. Every template, every authority citation, every retention date."
            }
          />
        </div>
        <div className="flex flex-col items-end gap-2 pt-2" style={{ flexShrink: 0 }}>
          <ViewToggle view={view} onChange={onView} />
          <span
            className="font-sans italic"
            style={{ color: "var(--steel)", fontSize: "11px", maxWidth: 220, textAlign: "right" }}
          >
            {view === "owner" ? "For owners & operators" : "For compliance managers"}
          </span>
        </div>
      </div>

      <SiteSwitcher siteKey={siteKey} onChange={onSite} sites={data.sites} />

      <TabToggle active={tab} onChange={onTab} labels={tabLabels} />

      <div className="pt-8">
        {tab === "internal" ? (
          view === "owner" ? (
            <OwnerInternal
              siteKey={siteKey}
              sites={data.sites}
              data={data}
              onSwitchToManager={switchToManager}
            />
          ) : (
            <ManagerInternal siteKey={siteKey} sites={data.sites} />
          )
        ) : view === "owner" ? (
          <OwnerSubcontractorRisk
            siteKey={siteKey}
            sites={data.sites}
            terminology={terminology}
            onSwitchToManager={switchToManager}
          />
        ) : (
          <ManagerSubcontractorRisk
            siteKey={siteKey}
            sites={data.sites}
            terminology={terminology}
          />
        )}
      </div>
    </div>
  )
}
