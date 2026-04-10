import { generateText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import {
  getDocumentTemplate,
  getTemplatesForVertical,
  buildSectionPrompt,
  validateClientData,
  type DocumentTemplate,
} from "@/lib/document-templates"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

export type GeneratedSection = {
  heading: string
  body: string
}

export type GeneratedDocumentContent = {
  title: string
  sections: GeneratedSection[]
  recommendations: string[]
}

export type DocumentGenerationResult =
  | { success: true; content: GeneratedDocumentContent; template: DocumentTemplate }
  | { success: false; error: string }

// ---------------------------------------------------------------------------
// Primary Entry Point (backward-compatible)
// ---------------------------------------------------------------------------

/**
 * HEAD Layer: AI Document Generator (v2 — template-driven)
 *
 * Uses the document template registry to lock the structure.
 * The AI fills in section content within the guardrails.
 * Every output has the same sections, same order, same regulatory
 * references — regardless of how many times a document is generated.
 *
 * Backward-compatible: returns GeneratedDocumentContent directly.
 * For full template metadata, use generateDocumentWithTemplate().
 */
export async function generateDocumentContent(
  input: DocumentGenerationInput
): Promise<GeneratedDocumentContent> {
  const result = await generateDocumentWithTemplate(input)
  if (!result.success) {
    const errorMsg = result.error
    return {
      title: `${input.documentType.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} — ${input.businessName}`,
      sections: [
        { heading: "Compliance Overview", body: `Document generation encountered an issue: ${errorMsg}. Please contact support or retry.` },
      ],
      recommendations: [
        "Review and update compliance documentation",
        "Schedule Cal/OSHA consultation",
        "Conduct employee safety training",
      ],
    }
  }
  return result.content
}

// ---------------------------------------------------------------------------
// Template-Driven Generation (preferred)
// ---------------------------------------------------------------------------

/**
 * Full template-driven generation with validation.
 * Returns the template alongside generated content so the PDF
 * renderer can use template metadata (disclaimer, retention, etc.).
 */
export async function generateDocumentWithTemplate(
  input: DocumentGenerationInput
): Promise<DocumentGenerationResult> {
  // Step 1: Resolve the template
  const template = getDocumentTemplate(input.vertical, input.documentType)
  if (!template) {
    const available = getTemplatesForVertical(input.vertical).map((t) => t.id)
    return {
      success: false,
      error: `No template "${input.documentType}" for vertical "${input.vertical}". Available: ${available.join(", ")}`,
    }
  }

  // Step 2: Validate required client data
  const validation = validateClientData(template, input as unknown as Record<string, unknown>)
  if (!validation.valid) {
    return {
      success: false,
      error: `Missing required client data: ${validation.missing.join(", ")}`,
    }
  }

  // Step 3: Build the structured prompt from the template
  const sectionPrompt = buildSectionPrompt(template)
  const gapAnalysis = input.intakeAnswers
    ? Object.entries(input.intakeAnswers)
        .filter(([, v]) => !v)
        .map(([k]) => k.replace(/_/g, " "))
    : []

  // Step 4: Generate content — AI fills the locked structure
  const { text } = await generateText({
    model: anthropic("claude-sonnet-4-6"),
    system: `You are a California workplace compliance document specialist working for Protekon, a managed compliance-as-a-service platform. You generate precise, legally-referenced compliance documents for small and mid-sized businesses.

CRITICAL RULES:
- Use the EXACT section headings provided. Do not rename, reorder, add, or remove sections.
- Every required regulatory reference MUST appear verbatim in the relevant section body.
- All content must be site-specific — use the actual business name, location, and employee count.
- All enforcement references are Cal/OSHA (California Division of Occupational Safety and Health) unless the template specifies federal jurisdiction.
- Write for a non-technical business owner who needs to understand their obligations.
- Be specific and actionable — avoid generic compliance language.
- Never reference "AI" or "Claude" — this document is from Protekon.`,
    prompt: `Generate a compliance document for:

Business: ${input.businessName}
Industry: ${input.vertical}
${input.location ? `Location: ${input.location}` : ""}
${input.employeeCount ? `Employees: ${input.employeeCount}` : ""}
Current Compliance Score: ${input.complianceScore}/6
Risk Level: ${input.riskLevel}

${gapAnalysis.length > 0 ? `Compliance Gaps Identified:\n${gapAnalysis.map((g) => `- ${g}`).join("\n")}\n` : ""}
${sectionPrompt}`,
    maxOutputTokens: 6000,
  })

  // Step 5: Parse and validate output against template
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("No JSON found in response")
    const parsed = JSON.parse(jsonMatch[0]) as GeneratedDocumentContent

    // Validate all required sections are present
    const requiredHeadings = template.sections
      .filter((s) => s.alwaysInclude)
      .map((s) => s.heading)
    const outputHeadings = parsed.sections.map((s) => s.heading)

    const missingSections = requiredHeadings.filter(
      (h) => !outputHeadings.some((oh) => oh === h)
    )

    if (missingSections.length > 0) {
      console.warn(
        `[doc-generator] AI skipped ${missingSections.length} required sections: ${missingSections.join(", ")}`
      )
      // Fill missing sections with placeholders
      for (const heading of missingSections) {
        const tmpl = template.sections.find((s) => s.heading === heading)
        parsed.sections.push({
          heading,
          body: `[This section requires completion. Purpose: ${tmpl?.purpose ?? "See template."}]`,
        })
      }
    }

    // Re-sort sections to match template order
    const headingOrder = template.sections.map((s) => s.heading)
    parsed.sections.sort(
      (a, b) => headingOrder.indexOf(a.heading) - headingOrder.indexOf(b.heading)
    )

    // Validate required regulatory references are present
    for (const tmplSection of template.sections) {
      const outputSection = parsed.sections.find(
        (s) => s.heading === tmplSection.heading
      )
      if (!outputSection) continue

      for (const ref of tmplSection.requiredReferences) {
        if (!outputSection.body.includes(ref)) {
          console.warn(
            `[doc-generator] "${tmplSection.heading}" missing required reference: ${ref}`
          )
          outputSection.body += `\n\nRegulatory reference: ${ref}`
        }
      }
    }

    return { success: true, content: parsed, template }
  } catch (err) {
    return {
      success: false,
      error: `Failed to parse output: ${err instanceof Error ? err.message : "Unknown error"}`,
    }
  }
}
