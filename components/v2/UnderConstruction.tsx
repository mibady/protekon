import Link from "next/link"
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr"
import { SectionLabel } from "@/components/v2/primitives/SectionLabel"

/**
 * Placeholder rendered on surfaces that aren't fully built yet. Keeps the
 * sidebar navigable while the real implementations land in later sprints.
 *
 * Voice: the officer narrates "I'm building this right now" rather than
 * the standard "Coming soon" / "Under construction" patterns. This matches
 * the voice contract in PROTEKON-COPY-GUIDE.md.
 */
export function UnderConstruction({
  surface,
  description,
  linearIssue,
}: {
  surface: string
  description: string
  /** Optional Linear ticket — shown to internal users only */
  linearIssue?: string
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 px-8 pt-12 pb-8 max-w-2xl w-full mx-auto">
        <Link
          href="/v2/briefing"
          className="inline-flex items-center gap-2 text-sm text-steel hover:text-midnight font-sans mb-8 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Briefing</span>
        </Link>

        <SectionLabel>{surface}</SectionLabel>

        <h1 className="font-display text-[32px] leading-tight text-midnight mb-4">
          I'm building this for you now.
        </h1>

        <p className="text-base font-sans text-steel leading-relaxed max-w-lg">
          {description}
        </p>

        {linearIssue && (
          <p className="text-[11px] tracking-[0.2em] uppercase text-steel/60 font-sans mt-8">
            Tracked in {linearIssue}
          </p>
        )}
      </div>
    </div>
  )
}
