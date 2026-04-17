import type { V2Client, Posture } from "@/lib/v2/types"

/**
 * The verdict banner at the top of Briefing. Establishes tone and context
 * in one glance:
 *
 *   [Good morning / afternoon / evening, {first name}.]
 *
 *   Your Cal/OSHA posture is strong. You're caught up on training,
 *   the quarterly review is filed, and there's nothing open today.
 *
 *   Down 3 points from last week.  ← optional detail line
 *
 * The greeting is deterministic by current hour (server-rendered). The
 * verdict word inside the summary is colored by tone. The detail line
 * under the summary is optional and typically conveys trend.
 */
export function PostureHeader({
  client,
  posture,
}: {
  client: V2Client
  posture: Posture
}) {
  const greeting = computeGreeting()
  const firstName = extractFirstName(client.business_name)

  return (
    <header className="mb-12">
      <div className="text-steel text-sm font-sans mb-2">
        {greeting}
        {firstName ? `, ${firstName}.` : "."}
      </div>
      <p
        className="font-display text-[28px] leading-snug text-midnight"
        data-posture-verdict={posture.verdict}
      >
        {renderSummaryWithVerdictColor(posture.summary, posture.verdict)}
      </p>
      {posture.detail && (
        <p className="text-sm text-steel mt-3 font-sans">{posture.detail}</p>
      )}
    </header>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────

/**
 * Server-rendered greeting based on current hour. Not timezone-aware —
 * uses UTC. Acceptable because the greeting is atmospheric, not operational.
 * A user in PST who opens the app at 5am sees "Good morning" regardless of
 * the server's clock, because the page is Next.js dynamic rendering
 * evaluating at request time.
 */
function computeGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 5) return "Late hours"
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

/**
 * Pull a first name for the greeting. business_name is what we have in the
 * client record. For single-proprietor businesses ("Mike's Auto") we take
 * the first token. For company names ("Inland Empire Construction LLC") we
 * skip the name entirely — no awkward "Good morning, Inland".
 *
 * Heuristic: if the first token contains an apostrophe-s or is a single word
 * shorter than 12 chars and not a common company suffix, use it. Otherwise
 * return empty string and the greeting stands alone.
 */
function extractFirstName(businessName: string): string {
  if (!businessName) return ""
  const first = businessName.split(/\s+/)[0]
  if (!first) return ""
  if (first.includes("'s") || first.endsWith("s'")) {
    return first.replace(/'s$/, "").replace(/s'$/, "")
  }
  // If it looks like a company name (long first word, or contains Inc/LLC/Corp
  // anywhere in the full name), skip personalization.
  const looksLikeCompany = /\b(Inc|LLC|Corp|Company|Co|Ltd|Group)\b/i.test(businessName)
  if (looksLikeCompany) return ""
  if (first.length > 12) return ""
  return first
}

/**
 * The summary is a single sentence or two from the server. The verdict word
 * (strong / needs a look / at risk) appears inside that sentence and needs to
 * be colored. We locate it by searching for known verdict phrases rather than
 * accepting a pre-tokenized payload — this keeps the server action producing
 * natural prose instead of structured tokens.
 *
 * If no verdict phrase is found, the summary renders without coloring.
 */
function renderSummaryWithVerdictColor(
  summary: string,
  verdict: Posture["verdict"]
): React.ReactNode {
  const phraseMap: Record<Posture["verdict"], { phrase: RegExp; className: string } | null> = {
    strong: { phrase: /\bstrong\b/i, className: "text-midnight font-semibold" },
    needs_attention: {
      phrase: /\bneeds a look\b/i,
      className: "text-gold font-semibold",
    },
    at_risk: { phrase: /\bat risk\b/i, className: "text-crimson font-semibold" },
    onboarding: null, // No verdict phrase to highlight — summary reads as-is
  }
  const config = phraseMap[verdict]
  if (!config) return summary

  const match = summary.match(config.phrase)
  if (!match || match.index === undefined) return summary

  const before = summary.slice(0, match.index)
  const hit = summary.slice(match.index, match.index + match[0].length)
  const after = summary.slice(match.index + match[0].length)

  return (
    <>
      {before}
      <span className={config.className}>{hit}</span>
      {after}
    </>
  )
}
