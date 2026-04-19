import Link from "next/link"
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr"

/**
 * A narrated industry intelligence story. Two paragraphs:
 *
 *   1. Story — what happened out there (1-3 sentences, journalism voice)
 *   2. Officer paragraph — "What this means for you" (1-2 sentences, first
 *      person, contextualized to the client's vertical and state)
 *
 * Rendered in both the Briefing intelligence block (compact) and on the
 * /v2/whats-happening surface (full). The `variant` prop controls density.
 */
export type IntelligenceStory = {
  id: string
  /** Short headline. "A warehouse in San Bernardino paid $38K." */
  headline: string
  /** The journalism paragraph. Plain-English, no database counts leaked. */
  story: string
  /** The officer's "What this means for you" paragraph. First person. */
  means_for_you: string
  /** Published date for chronology. */
  published_at: string
  /** Deep link to the full story page. */
  link_url: string
  /**
   * Optional severity for color accent. Stories that map to a real
   * compliance exposure get crimson; industry context is gold;
   * neutral informational is steel.
   */
  severity?: "exposure" | "context" | "neutral"
}

export function IntelligenceCard({
  story,
  variant = "compact",
}: {
  story: IntelligenceStory
  variant?: "compact" | "full"
}) {
  const accentClass = {
    exposure: "border-l-crimson",
    context: "border-l-gold",
    neutral: "border-l-steel",
  }[story.severity ?? "context"]

  return (
    <article
      className={`bg-white border-l-[3px] ${accentClass} p-5 mb-4 group`}
      style={{ borderRadius: 0 }}
    >
      <h3 className="font-display text-lg text-midnight leading-snug mb-2">
        <Link
          href={story.link_url}
          className="hover:text-crimson transition-colors inline-flex items-start gap-1"
        >
          <span>{story.headline}</span>
          <ArrowUpRight
            size={14}
            weight="bold"
            className="shrink-0 translate-y-1 opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </Link>
      </h3>

      <p
        className={`text-sm font-sans text-steel leading-relaxed mb-3 ${
          variant === "compact" ? "line-clamp-3" : ""
        }`}
      >
        {story.story}
      </p>

      <div className="bg-parchment -mx-5 -mb-5 px-5 py-4 mt-3 border-t border-fog/40">
        <div className="text-[10px] tracking-[0.25em] text-gold uppercase font-medium mb-1.5">
          What this means for you
        </div>
        <p className="text-sm font-sans text-midnight leading-relaxed">
          {story.means_for_you}
        </p>
      </div>
    </article>
  )
}
