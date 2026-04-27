"use client"

/**
 * ViewToggle — ported from dashboard.jsx:236.
 * OWNER / MANAGER pill toggle. Both views are always available.
 */

export type DashboardView = "owner" | "manager"

type ViewToggleProps = {
  view: DashboardView
  onChange: (view: DashboardView) => void
}

const OPTS: { key: DashboardView; label: string; note: string }[] = [
  { key: "owner",   label: "Owner view",   note: "Just what I need to do" },
  { key: "manager", label: "Manager view", note: "Full document registry" },
]

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div
      className="inline-flex items-center"
      style={{ background: "var(--white)", border: "1px solid rgba(11,29,58,0.1)", padding: 3 }}
    >
      {OPTS.map((o) => {
        const active = view === o.key
        return (
          <button
            key={o.key}
            onClick={() => onChange(o.key)}
            className="px-4 py-2 font-display uppercase transition-colors"
            style={{
              background: active ? "var(--void)" : "transparent",
              color: active ? "var(--parchment)" : "var(--steel)",
              fontSize: "10px",
              letterSpacing: "2px",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
            title={o.note}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
