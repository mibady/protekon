import { generateText, Output } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { z } from "zod"

const incidentClassificationSchema = z.object({
  severity: z.enum(["severe", "serious", "moderate", "minor", "near-miss"]).describe(
    "Classified severity based on Cal/OSHA standards"
  ),
  oshaCode: z.string().describe(
    "Most relevant Cal/OSHA standard code (Title 8 CCR, e.g., '8 CCR 3203(A)', 'SB 553')"
  ),
  category: z.enum([
    "workplace-violence",
    "fall-protection",
    "chemical-exposure",
    "machinery",
    "ergonomic",
    "heat-illness",
    "electrical",
    "vehicle",
    "slip-trip-fall",
    "other",
  ]).describe("Incident category for classification"),
  violenceType: z.enum(["1", "2", "3", "4"]).nullable().describe(
    "SB 553 violence type per Labor Code §6401.9(d): Type 1 = criminal intent/stranger, Type 2 = customer/client, Type 3 = worker-on-worker, Type 4 = personal relationship. Only set when category is workplace-violence, otherwise null."
  ),
  perpetratorRelationship: z.enum(["stranger", "client-customer", "worker", "personal"]).nullable().describe(
    "Relationship of perpetrator to victim. Only set when category is workplace-violence, otherwise null."
  ),
  piiDetected: z.array(z.string()).describe(
    "Types of PII detected in the description (e.g., 'email', 'phone', 'name', 'ssn')"
  ),
  recommendation: z.string().describe(
    "Immediate recommended action for the employer"
  ),
  osha300Recordable: z.boolean().describe(
    "Whether this incident is OSHA 300 log recordable"
  ),
  followUpDays: z.number().describe(
    "Recommended follow-up period in days based on severity"
  ),
})

export type IncidentClassification = z.infer<typeof incidentClassificationSchema>

/**
 * HEAD Layer: AI Incident Classifier
 * Uses Vercel AI SDK v6 + Claude to classify incident severity, detect PII,
 * suggest OSHA codes, and determine recordability.
 */
export async function classifyIncident(input: {
  description: string
  location: string
  date: string
  vertical: string
  userSeverity?: string
}): Promise<IncidentClassification> {
  const { output } = await generateText({
    model: anthropic("claude-sonnet-4-6"),
    output: Output.object({ schema: incidentClassificationSchema }),
    system: `You are a Cal/OSHA incident classification specialist. Analyze workplace incident reports for California businesses and provide:

1. Severity classification based on Cal/OSHA definitions:
   - severe: fatality, amputation, hospitalization, or loss of eye
   - serious: realistic possibility of death or serious physical harm
   - moderate: injury requiring medical treatment beyond first aid
   - minor: first aid only, no lost time
   - near-miss: no injury occurred but hazard was present

2. The most relevant Cal/OSHA standard code

3. PII detection: identify any personally identifiable information types present in the description (emails, phone numbers, names, SSNs, addresses)

4. OSHA 300 recordability: an incident is recordable if it results in death, days away from work, restricted work, transfer, medical treatment beyond first aid, loss of consciousness, or significant injury/illness diagnosed by a physician

5. Follow-up recommendation with timeline based on severity

6. SB 553 workplace violence classification (California Labor Code §6401.9(d)):
   When the incident category is workplace-violence, you MUST classify:
   - violenceType: "1" = criminal intent by stranger, "2" = customer/client, "3" = worker-on-worker, "4" = personal relationship
   - perpetratorRelationship: "stranger", "client-customer", "worker", or "personal"
   For non-violence incidents, set both violenceType and perpetratorRelationship to null.`,
    prompt: `Classify this workplace incident:

Industry: ${input.vertical}
Location: ${input.location}
Date: ${input.date}
${input.userSeverity ? `User-reported severity: ${input.userSeverity}` : ""}

Incident Description:
${input.description}`,
    maxOutputTokens: 1000,
  })

  if (!output) throw new Error("AI classification returned no output")
  return output
}
