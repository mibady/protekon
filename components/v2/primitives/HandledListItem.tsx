import Link from "next/link"
import { Check } from "@phosphor-icons/react/dist/ssr"
import type { ActivityEntry } from "@/lib/v2/types"

/**
 * Single row in the "Handled this week" block.
 *
 * Visual: small gold check glyph, then the narrated headline, then
 * the relative timestamp on the right.
 *
 * If the entry has a link_url, the row is clickable. Otherwise it's static
 * text (e.g., system events like "Your score updated" don't deep-link).
 */
export function HandledListItem({ entry }: { entry: ActivityEntry }) {
  const timestamp = formatRelativeTime(entry.at)

  const content = (
    <div className="flex items-baseline gap-3 py-2 group">
      <Check
        size={14}
        weight="bold"
        className="text-gold shrink-0 translate-y-0.5"
      />
      <div className="flex-1 min-w-0">
        <span className="text-midnight font-sans">{entry.headline}</span>
        {entry.detail && (
          <span className="text-steel font-sans"> — {entry.detail}</span>
        )}
      </div>
      <span className="text-xs text-steel font-sans whitespace-nowrap">
        {timestamp}
      </span>
    </div>
  )

  if (entry.link_url) {
    return (
      <Link
        href={entry.link_url}
        className="block hover:bg-white/50 px-2 -mx-2 transition-colors"
      >
        {content}
      </Link>
    )
  }

  return <div className="px-2 -mx-2">{content}</div>
}

// ──────────────────────────────────────────────────────────────────────────
// Relative time formatting
// ──────────────────────────────────────────────────────────────────────────

/**
 * Returns a short relative-time label. Examples:
 *   "just now"
 *   "12m ago"
 *   "3h ago"
 *   "yesterday"
 *   "Mon"       (within past 7 days)
 *   "Apr 3"     (more than 7 days)
 */
function formatRelativeTime(iso: string): string {
  const now = new Date()
  const then = new Date(iso)
  const diffMs = now.getTime() - then.getTime()
  const diffMin = Math.floor(diffMs / (1000 * 60))

  if (diffMin < 1) return "just now"
  if (diffMin < 60) return `${diffMin}m ago`

  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return "yesterday"
  if (diffDays < 7) {
    return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(then)
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(then)
}
