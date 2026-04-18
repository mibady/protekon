import Link from "next/link"
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr"
import { SectionLabel } from "@/components/v2/primitives/SectionLabel"
import type { ResourceType } from "@/lib/v2/coverage-types"

/**
 * Header row shared by list + detail views. Back-nav always points up one
 * level:
 *   - list mode   → /v2/coverage
 *   - detail mode → /v2/coverage/{resourceType}
 */
export function CoverageHeader({
  resourceType,
  label,
  singular,
  mode,
}: {
  resourceType: ResourceType
  label: string
  singular: string
  mode: "list" | "detail"
}) {
  const backHref =
    mode === "detail" ? `/dashboard/coverage/${resourceType}` : `/dashboard/coverage`
  const backLabel = mode === "detail" ? `Back to ${label}` : "Back to Coverage"
  const heading = mode === "detail" ? singular : label

  return (
    <div className="px-8 pt-12 pb-6 max-w-5xl w-full mx-auto">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm text-steel hover:text-midnight font-sans mb-8 transition-colors"
      >
        <ArrowLeft size={14} />
        <span>{backLabel}</span>
      </Link>

      <SectionLabel>Coverage</SectionLabel>

      <h1 className="font-display text-[32px] leading-tight text-midnight">
        {heading}
      </h1>
    </div>
  )
}
