"use client"

/**
 * ViewToggle — ported from dashboard.jsx:236.
 * OWNER / MANAGER pill toggle. Manager click is gated until Wave N
 * (Team & Permissions) — emits a toast and keeps the view on Owner.
 */

import { useCallback } from "react"
import { toast } from "sonner"

export type DashboardView = "owner" | "manager"

type ViewToggleProps = {
  view: DashboardView
  onChange: (view: DashboardView) => void
  /**
   * When true, Manager view flips normally — used when the caller's role
   * is `owner` or `compliance_manager`. Default preserves the original
   * toast-gate so non-eligible roles still see the "coming in a later wave"
   * messaging without the view actually switching.
   */
  allowManagerView?: boolean
}

const OPTS: { key: DashboardView; label: string; note: string }[] = [
  { key: "owner",   label: "Owner view",   note: "Just what I need to do" },
  { key: "manager", label: "Manager view", note: "Full document registry" },
]

export function ViewToggle({
  view,
  onChange,
  allowManagerView = false,
}: ViewToggleProps) {
  const handleClick = useCallback(
    (key: DashboardView) => {
      if (key === "manager" && !allowManagerView) {
        toast.info("Manager view requires Team & Permissions — coming in a later wave", {
          duration: 4000,
        })
        return
      }
      onChange(key)
    },
    [onChange, allowManagerView]
  )

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
            onClick={() => handleClick(o.key)}
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
