import { generateText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"

export type DocumentGenerationInput = {
  businessName: string
  vertical: string
  documentType: string
  complianceScore: number
  riskLevel: string
  employeeCount?: string
  location?: string
  hazards?: string[]
  intakeAnswers?: Record<string, boolean>
}

export type GeneratedDocumentContent = {
  title: string
  sections: { heading: string; body: string }[]
  recommendations: string[]
}

/**
 * HEAD Layer: AI Document Generator
 * Uses Vercel AI SDK + Claude to generate site-specific compliance document content.
 * The output feeds into DNA layer's pdf-lib renderer.
 */
export async function generateDocumentContent(
  input: DocumentGenerationInput
): Promise<GeneratedDocumentContent> {
  const verticalContext = getVerticalContext(input.vertical)
  const gapAnalysis = input.intakeAnswers
    ? Object.entries(input.intakeAnswers)
        .filter(([, v]) => !v)
        .map(([k]) => k.replace(/_/g, " "))
    : []

  const { text } = await generateText({
    model: anthropic("claude-sonnet-4-6"),
    system: `You are a California workplace compliance expert specializing in Cal/OSHA regulations, SB 553, and industry-specific safety requirements. You generate precise, legally-referenced compliance documents for small and mid-sized businesses.

Output format: Return a JSON object with this structure:
{
  "title": "Document title",
  "sections": [
    { "heading": "Section heading", "body": "Section content with specific regulatory references" }
  ],
  "recommendations": ["Specific actionable recommendation 1", "..."]
}

Rules:
- Reference specific Cal/OSHA Title 8 sections (e.g., 8 CCR 3203, SB 553)
- Include industry-specific standards from the vertical context
- Make content site-specific using the business name and details provided
- Keep each section body under 500 words
- Generate 4-6 sections appropriate to the document type
- Generate 4-6 actionable recommendations based on the compliance gaps
- All content must be California-specific`,
    prompt: `Generate a ${input.documentType.replace(/-/g, " ")} compliance document for:

Business: ${input.businessName}
Industry: ${input.vertical}
${input.location ? `Location: ${input.location}` : ""}
${input.employeeCount ? `Employees: ${input.employeeCount}` : ""}
Current Compliance Score: ${input.complianceScore}%
Risk Level: ${input.riskLevel}

${verticalContext}

${gapAnalysis.length > 0 ? `Compliance Gaps Identified:\n${gapAnalysis.map((g) => `- ${g}`).join("\n")}` : "No specific gaps identified."}

Generate the document content now.`,
    maxOutputTokens: 4000,
  })

  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("No JSON found in response")
    return JSON.parse(jsonMatch[0]) as GeneratedDocumentContent
  } catch {
    // Fallback: return structured content from raw text
    return {
      title: `${input.documentType.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} — ${input.businessName}`,
      sections: [
        { heading: "Compliance Overview", body: text.slice(0, 2000) },
      ],
      recommendations: [
        "Review and update compliance documentation",
        "Schedule Cal/OSHA consultation",
        "Conduct employee safety training",
        "Implement incident reporting procedures",
      ],
    }
  }
}

function getVerticalContext(vertical: string): string {
  const contexts: Record<string, string> = {
    construction: `Industry-Specific Standards:
- Fall Protection (8 CCR 1509 series) — #1 citation in construction
- Excavation & Trenching (8 CCR 1670) — avg fine $5,281
- Scaffolding Safety (8 CCR 1512)
- Electrical Safety (8 CCR 1712)
- Heat Illness Prevention (8 CCR 3395)
- CSLB licensing requirements (B&P Code §7000+)`,
    manufacturing: `Industry-Specific Standards:
- Machine Guarding / Lockout-Tagout (8 CCR 3314) — avg fine $10,592
- Pressure Vessels (8 CCR 4002) — avg fine $6,577
- Electrical Safety (8 CCR 4184) — avg fine $6,397
- IIPP General Requirement (8 CCR 3203)
- Housekeeping (8 CCR 461)`,
    healthcare: `Industry-Specific Standards:
- Aerosol Transmissible Diseases (8 CCR 5199) — avg fine $5,619
- Bloodborne Pathogens (8 CCR 5162)
- HIPAA Privacy/Security Rule compliance
- Patient handling and ergonomics
- Hazardous drug handling`,
    hospitality: `Industry-Specific Standards:
- IIPP General Requirement (8 CCR 3203) — 686 citations, #1 in hospitality
- Hazard Communication / GHS Labels (8 CCR 5194)
- Bloodborne Pathogens (8 CCR 5162)
- Personal Protective Equipment (8 CCR 3345)
- Heat Illness Prevention for outdoor workers`,
    agriculture: `Industry-Specific Standards:
- Heat Illness Prevention full suite (8 CCR 3395 I/C/D/H)
- Water Provision (8 CCR 3395(C)) — avg fine $2,176
- Shade Provision (8 CCR 3395(D)(1)) — avg fine $3,961
- Portable Ladders (8 CCR 3457)
- Pesticide safety and CalEPA requirements`,
    retail: `Industry-Specific Standards:
- IIPP suite (8 CCR 3203 A/A4/B2) — 480 combined citations
- Fire Safety (Title 19)
- Heat Illness for warehouse/outdoor retail (8 CCR 3395)
- Ergonomics for repetitive tasks
- Hazard Communication (8 CCR 5194)`,
    wholesale: `Industry-Specific Standards:
- Forklift/PIT Safety (8 CCR 3668F + 3664A) — 100 combined citations
- Machine Guarding / LOTO (8 CCR 3314) — avg fine $8,498
- IIPP (8 CCR 3203)
- Heat Illness (8 CCR 3395)
- Loading dock and warehouse safety`,
    transportation: `Industry-Specific Standards:
- Full IIPP suite (8 CCR 3203 A/A4/A7/A8/B2) — 286 combined citations, 18% of all transportation violations
- Heat Illness (8 CCR 3395)
- Vehicle operation and fleet safety
- Hazardous materials transport
- Hours of service and fatigue management`,
    "real-estate": `Industry-Specific Standards:
- Building code adherence and permit compliance
- Fire safety inspection requirements
- ADA accessibility compliance
- Environmental compliance (lead, asbestos, mold)
- Tenant protection laws and rent control
- Municipal ordinance tracking
- Property manager liability requirements`,
  }

  return contexts[vertical] || contexts.construction || ""
}
