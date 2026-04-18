import Link from "next/link"
import { X } from "@phosphor-icons/react/dist/ssr"
import type { ResourceType } from "@/lib/v2/coverage-types"

/**
 * Small filter-active banner for sibling drill-downs reached via a site
 * deep-link (NGE-460). Renders when the list route has an active `site_id`
 * param; the "Clear filter" link drops the param and returns to the
 * unfiltered list.
 */
export function CoverageListFilterPill({
  label,
  resourceType,
}: {
  label: string
  resourceType: ResourceType
}) {
  return (
    <div className="px-8 pt-6 max-w-5xl w-full mx-auto">
      <div className="inline-flex items-center gap-2 bg-parchment border border-fog/40 px-3 py-2 text-xs font-sans text-steel">
        <span>
          Filtered to site:{" "}
          <span className="text-midnight font-medium">{label}</span>
        </span>
        <Link
          href={`/dashboard/coverage/${resourceType}`}
          className="inline-flex items-center gap-1 text-steel/70 hover:text-midnight transition-colors"
          aria-label="Clear site filter"
        >
          <X size={12} />
          <span>Clear</span>
        </Link>
      </div>
    </div>
  )
}
