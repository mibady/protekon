import Link from "next/link"
import { CalendarBlank } from "@phosphor-icons/react/dist/ssr"

/**
 * Row in the "Up next" block. Each row is a single upcoming deadline —
 * a document expiring, a training due, a scheduled delivery, or a
 * regulatory milestone.
 *
 * Unlike action items (which demand action now), Up Next items are
 * informational: "here's what's on the horizon so nothing sneaks up
 * on you." If the date is more than 60 days out, consider hiding.
 */
export type UpNextItem = {
  id: string
  /** Short title — "Q2 training refresh" or "WVPP annual review" */
  title: string
  /** ISO datetime. Must be in the future. */
  due_at: string
  /** Optional one-line context. e.g., "All Compton-site employees" */
  context: string | null
  /** Relative URL if this item has a destination. */
  link_url: string | null
}

export function UpNextRow({ item }: { item: UpNextItem }) {
  const { day, month } = splitDate(item.due_at)
  const distance = computeDistance(item.due_at)

  const inner = (
    <div className="flex items-center gap-4 py-3">
      {/* Date badge */}
      <div
        className="flex flex-col items-center justify-center bg-white border border-fog text-midnight shrink-0"
        style={{ width: 48, height: 48, borderRadius: 0 }}
      >
        <div className="text-[10px] tracking-wide text-steel uppercase leading-none">
          {month}
        </div>
        <div className="font-display text-lg leading-none mt-0.5">{day}</div>
      </div>

      {/* Title + context */}
      <div className="flex-1 min-w-0">
        <div className="text-midnight font-sans">{item.title}</div>
        {item.context && (
          <div className="text-xs text-steel font-sans mt-0.5">
            {item.context}
          </div>
        )}
      </div>

      {/* Distance indicator */}
      <div className="text-xs text-steel font-sans shrink-0 flex items-center gap-1.5">
        <CalendarBlank size={12} />
        <span>{distance}</span>
      </div>
    </div>
  )

  if (item.link_url) {
    return (
      <Link href={item.link_url} className="block hover:bg-white/50 px-2 -mx-2 transition-colors">
        {inner}
      </Link>
    )
  }

  return <div className="px-2 -mx-2">{inner}</div>
}

// ──────────────────────────────────────────────────────────────────────────
// Date helpers
// ──────────────────────────────────────────────────────────────────────────

function splitDate(iso: string): { day: string; month: string } {
  const d = new Date(iso)
  const day = d.getDate().toString()
  const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(d).toUpperCase()
  return { day, month }
}

function computeDistance(iso: string): string {
  const now = new Date()
  const then = new Date(iso)
  const diffDays = Math.ceil(
    (then.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (diffDays <= 0) return "today"
  if (diffDays === 1) return "tomorrow"
  if (diffDays < 14) return `in ${diffDays}d`
  if (diffDays < 60) return `in ${Math.floor(diffDays / 7)}w`
  return `in ${Math.floor(diffDays / 30)}mo`
}
