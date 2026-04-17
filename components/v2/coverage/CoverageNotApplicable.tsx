import Link from "next/link"
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr"

/**
 * Rendered when a client navigates to a resource type that isn't enabled for
 * their vertical. Stays voice-consistent with the rest of Coverage — the
 * officer explains why the page is empty rather than showing a generic 404.
 *
 * Body phrasing: "{label} doesn't apply to {vertical} businesses."
 */
export function CoverageNotApplicable({
  label,
  vertical,
}: {
  label: string
  vertical: string
}) {
  const prettyVertical = vertical.replace(/_/g, " ")
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 px-8 pt-12 pb-8 max-w-2xl w-full mx-auto">
        <Link
          href="/v2/coverage"
          className="inline-flex items-center gap-2 text-sm text-steel hover:text-midnight font-sans mb-8 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Coverage</span>
        </Link>

        <h1 className="font-display text-[32px] leading-tight text-midnight mb-4">
          Nothing to show here.
        </h1>

        <p className="text-base font-sans text-steel leading-relaxed">
          {label} doesn&apos;t apply to {prettyVertical} businesses. I&apos;m
          not maintaining any {label.toLowerCase()} records for you — nothing
          here needs your attention.
        </p>
      </div>
    </div>
  )
}
