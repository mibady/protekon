import Link from "next/link"
import { ArrowRight } from "@phosphor-icons/react/dist/ssr"
import type {
  ResourceConfig,
  ResourceRow,
  ResourceType,
  StatusTone,
} from "@/lib/v2/coverage-types"

/**
 * One row in the list view. Card-style presentation matches the
 * ActionItemCard pattern from Briefing:
 *   - left border colored by statusFn tone
 *   - primary column as the display heading
 *   - secondary columns as key: value pairs below
 *   - chevron on the right hinting at navigation
 */
export function CoverageRow({
  config,
  row,
  resourceType,
}: {
  config: ResourceConfig
  row: ResourceRow
  resourceType: ResourceType
}) {
  const tone = config.statusFn(row)
  const border = BORDER_FOR_TONE[tone]
  const badge = BADGE_FOR_TONE[tone]

  const [headingCol, ...restCols] = config.columns
  const heading = headingCol?.value(row) ?? "(unnamed)"
  const detailCols = restCols.filter(
    (col) => !col.secondary || col.value(row) !== null
  )

  const rowId = (row.id as string | undefined) ?? ""
  const href = rowId
    ? `/v2/coverage/${resourceType}/${rowId}`
    : `/v2/coverage/${resourceType}`

  return (
    <Link
      href={href}
      className={`
        block bg-white border-l-[3px] ${border}
        hover:shadow-[0_2px_12px_rgba(7,15,30,0.06)] transition-shadow
        group
      `}
      style={{ borderRadius: 0 }}
    >
      <div className="flex items-start gap-4 p-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3 mb-1">
            {badge && (
              <span
                className={`text-[10px] tracking-[0.2em] font-medium ${badge.text} ${badge.bg} px-2 py-0.5 uppercase`}
                style={{ borderRadius: 0 }}
              >
                {badge.label}
              </span>
            )}
          </div>
          <div className="font-display text-lg text-midnight leading-snug mb-1">
            {heading}
          </div>
          {detailCols.length > 0 && (
            <dl className="text-sm text-steel font-sans grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0.5 mt-2">
              {detailCols.map((col) => {
                const value = col.value(row)
                if (value === null) return null
                return (
                  <div key={col.key} className="flex gap-2 min-w-0">
                    <dt className="text-steel/70 shrink-0">{col.label}:</dt>
                    <dd className="truncate text-midnight/80">{value}</dd>
                  </div>
                )
              })}
            </dl>
          )}
        </div>
        <div className="text-steel group-hover:text-crimson transition-colors pt-2">
          <ArrowRight size={16} weight="bold" />
        </div>
      </div>
    </Link>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Tone → tailwind
// ──────────────────────────────────────────────────────────────────────────

const BORDER_FOR_TONE: Record<StatusTone, string> = {
  critical: "border-crimson",
  attention: "border-gold",
  ok: "border-fog",
  unknown: "border-fog",
}

const BADGE_FOR_TONE: Record<
  StatusTone,
  { label: string; bg: string; text: string } | null
> = {
  critical: {
    label: "Critical",
    bg: "bg-crimson/10",
    text: "text-crimson",
  },
  attention: {
    label: "Attention",
    bg: "bg-gold/10",
    text: "text-gold",
  },
  ok: null,
  unknown: null,
}
