"use client"

/**
 * TabToggle — ported from dashboard.jsx:269.
 * Internal Posture / Subcontractor Risk tab row with enforcement underline.
 */

export type DashboardTab = "internal" | "subs"

type TabToggleProps = {
  active: DashboardTab
  onChange: (tab: DashboardTab) => void
}

const TABS: { key: DashboardTab; label: string; note: string }[] = [
  { key: "internal", label: "Internal Posture",   note: "Your documents" },
  { key: "subs",     label: "Subcontractor Risk", note: "External liability" },
]

export function TabToggle({ active, onChange }: TabToggleProps) {
  return (
    <div className="flex" style={{ borderBottom: "1px solid rgba(11,29,58,0.1)" }}>
      {TABS.map((t) => {
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
