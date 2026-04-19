/**
 * StatusBadge — ported from dashboard.jsx:78.
 * Uppercase micro-pill with colored dot + label. Supports the six template statuses.
 */

import type { TemplateStatus } from "../mocks"

type BadgeStatus = TemplateStatus | string

type BadgeStyle = { label: string; color: string; bg: string }

const MAP: Record<string, BadgeStyle> = {
  current:            { label: "Current",            color: "var(--sand)",        bg: "rgba(201,168,76,0.1)" },
  review_due:         { label: "Review Required",    color: "var(--enforcement)", bg: "rgba(196,18,48,0.08)" },
  missing:            { label: "Missing",            color: "var(--enforcement)", bg: "rgba(196,18,48,0.08)" },
  retention_expiring: { label: "Retention Expiring", color: "var(--sand)",        bg: "rgba(201,168,76,0.1)" },
  expired:            { label: "Expired",            color: "var(--enforcement)", bg: "rgba(196,18,48,0.08)" },
  expiring:           { label: "Expiring",           color: "var(--sand)",        bg: "rgba(201,168,76,0.1)" },
}

export function StatusBadge({ status }: { status: BadgeStatus }) {
  const s = MAP[status] ?? MAP.current
  return (
    <span
      className="font-display uppercase inline-flex items-center gap-1.5 px-2 py-1"
      style={{
        color: s.color,
        background: s.bg,
        fontSize: "9px",
        letterSpacing: "2px",
        fontWeight: 600,
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color }} />
      {s.label}
    </span>
  )
}
