/**
 * Reusable prompt builder for blog post SEO metadata generation.
 *
 * Returns a {system, user} pair for the Anthropic messages API.
 * No hardcoded brand/vertical values — caller supplies context.
 */

export interface SeoPromptInput {
  title: string
  excerpt?: string | null
  regulatoryDomain?: string | null
  keywordCluster?: string | null
  /**
   * Optional retry feedback. When a prior attempt violated length constraints,
   * the caller passes which field and what went wrong so the model can fix it.
   */
  retryFeedback?: string | null
}

export interface SeoPromptOutput {
  system: string
  user: string
}

export function buildSeoPrompt(input: SeoPromptInput): SeoPromptOutput {
  const system = [
    "You are an SEO specialist writing search metadata for a B2B compliance SaaS blog.",
    "Your job: produce a metaTitle and metaDescription that maximize click-through from search results while staying within strict character limits.",
    "",
    "HARD CONSTRAINTS (non-negotiable):",
    "- metaTitle: maximum 60 characters. Count characters carefully. Include the primary keyword near the start.",
    "- metaDescription: between 150 and 160 characters inclusive. Not 149. Not 161. Count carefully.",
    "- No clickbait, no ALL CAPS, no emojis, no trailing ellipsis, no quote marks wrapping the whole string.",
    "- Active voice. Lead with the reader benefit or concrete outcome.",
    "- Mention the regulatory domain or industry when it is relevant to search intent.",
    "",
    "OUTPUT FORMAT:",
    "Return ONLY a JSON object with exactly two string keys: metaTitle and metaDescription.",
    "No preamble, no markdown fences, no commentary. Just the raw JSON object.",
  ].join("\n")

  const contextLines: string[] = [
    `Title: ${input.title}`,
  ]
  if (input.excerpt) contextLines.push(`Excerpt: ${input.excerpt}`)
  if (input.regulatoryDomain) contextLines.push(`Regulatory domain: ${input.regulatoryDomain}`)
  if (input.keywordCluster) contextLines.push(`Keyword cluster: ${input.keywordCluster}`)

  const userParts: string[] = [
    "Generate SEO metadata for the following blog post.",
    "",
    contextLines.join("\n"),
  ]

  if (input.retryFeedback) {
    userParts.push(
      "",
      "IMPORTANT — your previous attempt failed validation:",
      input.retryFeedback,
      "Fix the specific constraint violation above and return corrected JSON.",
    )
  }

  userParts.push("", "Return the JSON object now.")

  return {
    system,
    user: userParts.join("\n"),
  }
}
