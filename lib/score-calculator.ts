import type { ScoreAnswers, ScoreGap, ScoreResult } from "@/lib/types/score"

const GAP_DEFINITIONS: Record<string, { label: string; description: string }> = {
  has_iipp: {
    label: "No site-specific IIPP",
    description:
      "Cal/OSHA can cite you for not having a written plan specific to your worksite. Average citation: $16,131.",
  },
  iipp_site_specific: {
    label: "IIPP doesn't address specific hazards",
    description:
      "A generic plan doesn't satisfy the site-specific requirement. This is the most common reason IIPPs fail inspection.",
  },
  has_incident_log: {
    label: "No compliant incident log",
    description:
      "Without a PII-scrubbed incident log, you're exposed to OSHA citations and employee records requests you can't fulfill.",
  },
  training_current: {
    label: "Training not current",
    description:
      "Annual interactive training is required. Expired training records are a separate citation from a missing IIPP.",
  },
  has_industry_programs: {
    label: "No industry-specific programs",
    description:
      "Your industry requires specific compliance programs. Missing documentation is a citable gap.",
  },
  audit_ready: {
    label: "Not audit-ready",
    description:
      "If Cal/OSHA arrived today, you couldn't produce your compliance package.",
  },
}

const BOOLEAN_KEYS = [
  "has_iipp",
  "iipp_site_specific",
  "has_incident_log",
  "training_current",
  "has_industry_programs",
  "audit_ready",
] as const satisfies readonly (keyof ScoreAnswers)[]

const EMPLOYEE_MULTIPLIERS: Record<string, number> = {
  "10-25": 0.8,
  "26-50": 1.0,
  "51-100": 1.2,
  "101-250": 1.5,
  "251+": 2.0,
}

const CITATION_AMOUNT = 16_131

export function calculateScore(answers: ScoreAnswers): ScoreResult {
  const gaps: ScoreGap[] = []

  for (const key of BOOLEAN_KEYS) {
    if (!answers[key]) {
      const def = GAP_DEFINITIONS[key]
      gaps.push({
        key,
        label: def.label,
        description: def.description,
        citation_amount: CITATION_AMOUNT,
      })
    }
  }

  const score = BOOLEAN_KEYS.length - gaps.length
  const tier: ScoreResult["tier"] =
    score === 6 ? "green" : score >= 4 ? "yellow" : "red"

  const employeeMultiplier = EMPLOYEE_MULTIPLIERS[answers.employee_count] ?? 1.0
  const base = gaps.length * CITATION_AMOUNT * employeeMultiplier
  const fine_low = Math.round(base * 0.7)
  const fine_high = Math.round(base * 1.3)

  return { score, tier, gaps, fine_low, fine_high }
}
