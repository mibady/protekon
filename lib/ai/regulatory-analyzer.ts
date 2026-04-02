import { generateText, Output } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { z } from "zod"

const regulatoryImpactSchema = z.object({
  impactLevel: z.enum(["critical", "high", "medium", "low", "informational"]).describe(
    "How significantly this regulatory change impacts the client"
  ),
  affectedDocuments: z.array(z.string()).describe(
    "List of compliance document types that need updating (e.g., 'IIPP', 'WVPP', 'Emergency Action Plan')"
  ),
  affectedIndustries: z.array(z.string()).describe(
    "Which of Protekon's 8 served industries are affected"
  ),
  clientAction: z.string().describe(
    "Specific action the client should take in response to this update"
  ),
  complianceDeadline: z.string().nullable().describe(
    "Compliance deadline if one exists, in YYYY-MM-DD format, or null"
  ),
  summary: z.string().describe(
    "2-3 sentence plain-English summary of what changed and why it matters"
  ),
  penaltyRisk: z.string().nullable().describe(
    "Estimated penalty range for non-compliance, or null if not applicable"
  ),
})

export type RegulatoryImpact = z.infer<typeof regulatoryImpactSchema>

/**
 * HEAD Layer: AI Regulatory Impact Analyzer
 * Uses Vercel AI SDK v6 + Claude to assess how regulatory updates
 * impact clients' compliance posture.
 */
export async function analyzeRegulatoryImpact(input: {
  title: string
  summary: string
  jurisdiction: string
  category: string
  sourceUrl: string
  effectiveDate: string | null
}): Promise<RegulatoryImpact> {
  const { output } = await generateText({
    model: anthropic("claude-sonnet-4-6"),
    output: Output.object({ schema: regulatoryImpactSchema }),
    system: `You are a California regulatory compliance analyst. Analyze regulatory updates and assess their impact on small and mid-sized businesses (10-500 employees) across these 8 industries: Construction, Manufacturing, Agriculture, Hospitality, Retail, Healthcare, Wholesale, Transportation.

Consider:
- Which Cal/OSHA standards are affected
- Which compliance documents need updating (IIPP, WVPP, EAP, HazCom, etc.)
- Penalty implications for non-compliance
- Timeline urgency
- Whether this requires immediate document regeneration or just monitoring

Protekon serves California SMBs with managed compliance. Your analysis helps determine which clients need proactive document updates.`,
    prompt: `Analyze this regulatory update:

Title: ${input.title}
Jurisdiction: ${input.jurisdiction}
Category: ${input.category}
${input.effectiveDate ? `Effective Date: ${input.effectiveDate}` : "No effective date specified"}
Source: ${input.sourceUrl}

Summary:
${input.summary}`,
    maxOutputTokens: 1000,
  })

  if (!output) throw new Error("AI analysis returned no output")
  return output
}
