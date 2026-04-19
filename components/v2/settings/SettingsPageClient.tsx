"use client"

import { useState } from "react"
import { Card } from "@/components/v2/primitives/Card"
import { ProfileTab } from "./ProfileTab"
import { SitesTab } from "./SitesTab"
import { BillingTab } from "./BillingTab"
import { NotificationsTab } from "./NotificationsTab"
import { SecurityTab } from "./SecurityTab"
import { DataTab } from "./DataTab"
import type { ClientProfile } from "@/lib/types"
import type { Site } from "@/lib/actions/sites"

type TabKey = "profile" | "sites" | "billing" | "notifications" | "security" | "data"

const TABS: { key: TabKey; label: string }[] = [
  { key: "profile", label: "Profile" },
  { key: "sites", label: "Sites" },
  { key: "billing", label: "Billing" },
  { key: "notifications", label: "Notifications" },
  { key: "security", label: "Security" },
  { key: "data", label: "Data" },
]

type SettingsPageClientProps = {
  profile: ClientProfile | null
  sites: Site[]
  notificationPrefs: Record<string, boolean>
}

export function SettingsPageClient({
  profile,
  sites,
  notificationPrefs,
}: SettingsPageClientProps) {
  const [tab, setTab] = useState<TabKey>("profile")

  return (
    <>
      <div
        className="flex items-end gap-1 mb-6 flex-wrap"
        style={{ borderBottom: "1px solid rgba(11, 29, 58, 0.1)" }}
      >
        {TABS.map((t) => {
          const active = tab === t.key
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="font-display uppercase"
              style={{
                color: active ? "var(--ink)" : "var(--steel)",
                fontSize: "11px",
                letterSpacing: "2px",
                fontWeight: 600,
                padding: "0.75rem 1rem",
                borderBottom: active
                  ? "2px solid var(--enforcement)"
                  : "2px solid transparent",
                marginBottom: "-1px",
                background: "transparent",
              }}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      <Card>
        {tab === "profile" && <ProfileTab profile={profile} />}
        {tab === "sites" && <SitesTab sites={sites} />}
        {tab === "billing" && <BillingTab />}
        {tab === "notifications" && <NotificationsTab prefs={notificationPrefs} />}
        {tab === "security" && <SecurityTab />}
        {tab === "data" && <DataTab />}
      </Card>
    </>
  )
}
