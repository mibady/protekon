"use client"

/**
 * TabToggle — ported from dashboard.jsx:269.
 * Internal Posture / Subcontractor Risk tab row with enforcement underline.
 *
 * Labels are localized per-vertical via the optional `labels` prop. State
 * keys (`internal` | `subs`) stay stable so localStorage hydration doesn't
 * break across vertical switches.
 */

export type DashboardTab = "internal" | "subs"

export type TabToggleLabels = {
  internal: { title: string; note: string }
  subs: { title: string; note: string }
}

type TabToggleProps = {
  active: DashboardTab
  onChange: (tab: DashboardTab) => void
  labels?: TabToggleLabels
}

const DEFAULT_LABELS: TabToggleLabels = {
  internal: { title: "Internal Posture", note: "Your documents" },
  subs: { title: "Subcontractor Risk", note: "External liability" },
}

export function TabToggle({ active, onChange, labels }: TabToggleProps) {
  const resolved = labels ?? DEFAULT_LABELS
  const tabs: { key: DashboardTab; label: string; note: string }[] = [
    { key: "internal", label: resolved.internal.title, note: resolved.internal.note },
    { key: "subs", label: resolved.subs.title, note: resolved.subs.note },
  ]

  return (
    <div className="flex" style={{ borderBottom: "1px solid rgba(11,29,58,0.1)" }}>
      {tabs.map((t) => {
        const isActive = active === t.key
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className="transition-colors"
            style={{
              background: "transparent",
              marginBottom: "-1px",
              cursor: "pointer",
              border: "none",
              borderBottomWidth: "2px",
              borderBottomStyle: "solid",
              borderBottomColor: isActive ? "var(--enforcement)" : "transparent",
              padding: "14px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "4px",
              minWidth: 240,
            }}
          >
            <span
              className="font-display uppercase"
              style={{
                color: isActive ? "var(--midnight)" : "var(--steel)",
                fontSize: "13px",
                letterSpacing: "2px",
                fontWeight: 600,
                whiteSpace: "nowrap",
                lineHeight: 1.2,
              }}
            >
              {t.label}
            </span>
            <span
              className="font-sans"
              style={{ color: "var(--steel)", fontSize: "11px", whiteSpace: "nowrap", lineHeight: 1.2 }}
            >
              {t.note}
            </span>
          </button>
        )
      })}
    </div>
  )
}
