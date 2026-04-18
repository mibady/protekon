import Link from "next/link"
import { ArrowRight } from "@phosphor-icons/react/dist/ssr"
import type { ActionItem } from "@/lib/v2/types"

/**
 * The card rendered for each open action item in the "I need you on" block.
 *
 * Priority drives the left-border color:
 *   must   → crimson    (act today; overdue or regulatory deadline)
 *   high   → gold       (act this week)
 *   medium → steel      (act this month)
 *   low    → fog        (informational, when convenient)
 *
 * Due text is computed from `due_at`:
 *   overdue          → "Overdue"
 *   due today        → "Due today"
 *   due tomorrow     → "Due tomorrow"
 *   due in N days    → "Due in N days"   (N = 2–30)
 *   due beyond 30d   → "Due {Mon D}"
 *   no due_at        → render nothing
 */
export function ActionItemCard({ item }: { item: ActionItem }) {
  const config = PRIORITY_CONFIG[item.priority]
  const dueText = formatDueText(item.due_at)

  // The card must deep-link somewhere. If the row has no cta_href we fall
  // back to chat with the title as the prefilled message — the user can
  // always ask the officer about it.
  const href =
    item.cta_href ?? `/dashboard/chat?q=${encodeURIComponent(item.title)}`
  const ctaLabel = item.cta_label ?? "Handle it"

  return (
    <Link
      href={href}
      className={`
        block bg-white border-l-[3px] ${config.border}
        hover:shadow-[0_2px_12px_rgba(7,15,30,0.06)] transition-shadow
        group
      `}
      style={{ borderRadius: 0 }}
    >
      <div className="flex items-start gap-4 p-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3 mb-1">
            <span
              className={`text-[10px] tracking-[0.2em] font-medium ${config.label} uppercase`}
            >
              {config.labelText}
            </span>
            {dueText && (
              <span
                className={`text-[11px] font-sans ${
                  dueText === "Overdue" ? "text-crimson font-semibold" : "text-steel"
                }`}
              >
                {dueText}
              </span>
            )}
          </div>
          <div className="font-display text-lg text-midnight leading-snug mb-1">
            {item.title}
          </div>
          {item.description && (
            <div className="text-sm text-steel font-sans leading-relaxed">
              {item.description}
            </div>
          )}
        </div>
        <div
          className={`
            flex items-center gap-2 px-4 py-2.5 text-sm font-sans font-medium
            ${config.cta} whitespace-nowrap
            group-hover:translate-x-0.5 transition-transform
          `}
          style={{ borderRadius: 0 }}
        >
          <span>{ctaLabel}</span>
          <ArrowRight size={14} weight="bold" />
        </div>
      </div>
    </Link>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Priority config
// ──────────────────────────────────────────────────────────────────────────

const PRIORITY_CONFIG = {
  must: {
    border: "border-crimson",
    label: "text-crimson",
    labelText: "Must — today",
    cta: "bg-crimson text-parchment",
  },
  high: {
    border: "border-gold",
    label: "text-gold",
    labelText: "This week",
    cta: "bg-midnight text-parchment",
  },
  medium: {
    border: "border-steel",
    label: "text-steel",
    labelText: "This month",
    cta: "bg-midnight/90 text-parchment",
  },
  low: {
    border: "border-fog",
    label: "text-steel",
    labelText: "When you can",
    cta: "bg-midnight/80 text-parchment",
  },
} as const

// ──────────────────────────────────────────────────────────────────────────
// Due text
// ──────────────────────────────────────────────────────────────────────────

function formatDueText(dueAt: string | null): string | null {
  if (!dueAt) return null

  const now = new Date()
  const due = new Date(dueAt)
  const diffMs = due.getTime() - now.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return "Overdue"
  if (diffDays === 0) return "Due today"
  if (diffDays === 1) return "Due tomorrow"
  if (diffDays <= 30) return `Due in ${diffDays} days`

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  })
  return `Due ${formatter.format(due)}`
}
