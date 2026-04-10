import type { ScoreAnswers, ScoreGap, ScoreResult } from "@/lib/types/score"

const GAP_DEFINITIONS: Record<string, { label: string; description: string; citation: string; fine: number }> = {
  has_wvpp: {
    label: "No Written WVPP",
    description:
      "Without a written plan, you have no documentation to show an inspector. This is the most commonly cited SB 553 violation.",
    citation: "Cal. Labor Code §6401.9(b)",
    fine: 25000,
  },
  wvpp_site_specific: {
    label: "WVPP Not Site-Specific",
    description:
      "A generic template with your name pasted in doesn't meet the requirement. Your plan must reference your actual address, layout, and industry-specific hazards.",
    citation: "Cal. Labor Code §6401.9(b)(1)",
    fine: 25000,
  },
  has_incident_log: {
    label: "No Violent Incident Log",
    description:
      "Every workplace violence incident must be logged with specific data fields. A spreadsheet of notes doesn't qualify.",
    citation: "Cal. Labor Code §6401.9(d)",
    fine: 25000,
  },
  pii_stripped: {
    label: "PII in Incident Log",
    description:
      "Your incident log must be free of names, addresses, and other identifying details. Any employee can legally request to see this log at any time.",
    citation: "Cal. Labor Code §6401.9(d)(2)",
    fine: 25000,
  },
  training_current: {
    label: "Training Not Current",
    description:
      "Annual interactive training is mandatory — not a one-time video. Training must be specific to your worksite plan and documented with sign-off sheets.",
    citation: "Cal. Labor Code §6401.9(e)",
    fine: 7000,
  },
  audit_ready: {
    label: "Can't Produce Audit Package",
    description:
      "If you can't hand an inspector a complete package today, every other gap becomes harder to contest. This is the gap that makes fines stick.",
    citation: "Cal. Labor Code §6401.9(a)",
    fine: 25000,
  },
}

const BOOLEAN_KEYS = [
  "has_wvpp",
  "wvpp_site_specific",
  "has_incident_log",
  "pii_stripped",
  "training_current",
  "audit_ready",
] as const satisfies readonly (keyof ScoreAnswers)[]

const EMPLOYEE_MULTIPLIERS: Record<string, number> = {
  "10-25": 1.0,
  "26-50": 1.2,
  "51-100": 1.5,
  "101-250": 1.8,
  "251+": 2.0,
}

export function calculateScore(answers: ScoreAnswers): ScoreResult {
  const gaps: ScoreGap[] = []

  for (const key of BOOLEAN_KEYS) {
    if (!answers[key]) {
      const def = GAP_DEFINITIONS[key]
      gaps.push({
        key,
        label: def.label,
        description: def.description,
        citation: def.citation,
        fine: def.fine,
        citation_amount: def.fine,
      })
    }
  }

  const score = BOOLEAN_KEYS.length - gaps.length
  const tier: ScoreResult["tier"] =
    score === 6 ? "green" : score >= 4 ? "yellow" : "red"

  const employeeMultiplier = EMPLOYEE_MULTIPLIERS[answers.employee_count] ?? 1.0
  const baseFine = gaps.reduce((sum, g) => sum + g.fine, 0) * employeeMultiplier
  const fine_low = Math.round(baseFine * 0.7)
  const fine_high = Math.round(baseFine * 1.3)

  return { score, tier, gaps, fine_low, fine_high }
}
