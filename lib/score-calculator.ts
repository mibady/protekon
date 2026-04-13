import type { ScoreAnswers, ScoreGap, ScoreResult, VerticalQuestion } from "@/lib/types/score"

// Phase 1: 11 baseline gap definitions — every vertical gets these
const BASELINE_GAPS: Record<string, { label: string; description: string; citation: string; fine: number }> = {
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
  has_iipp: {
    label: "No Written IIPP",
    description:
      "The Injury and Illness Prevention Program is the most fundamental Cal/OSHA requirement — cited more than SB 553. Every California employer must have one.",
    citation: "T8 CCR §3203",
    fine: 18000,
  },
  iipp_current: {
    label: "IIPP Not Reviewed in 12 Months",
    description:
      "Stale IIPPs are citable even if you have one. Your program must be reviewed and updated at least annually.",
    citation: "T8 CCR §3203(a)(1)",
    fine: 7000,
  },
  has_eap: {
    label: "No Emergency Action Plan",
    description:
      "Required for every workplace with 10+ employees. Must cover evacuation routes, alarm systems, and emergency contacts.",
    citation: "29 CFR 1910.38",
    fine: 16131,
  },
  has_hazcom: {
    label: "No HazCom Program / Missing SDSs",
    description:
      "The #1 most-cited OSHA standard nationally. You must maintain a written HazCom program with accessible Safety Data Sheets for all hazardous chemicals.",
    citation: "29 CFR 1910.1200",
    fine: 16131,
  },
  osha_300_current: {
    label: "OSHA 300/300A Not Current or Posted",
    description:
      "Auto-citation if an inspector visits Feb–Apr and your 300A isn't posted. Records must be maintained for 5 years.",
    citation: "29 CFR 1904",
    fine: 16131,
  },
}

const BASELINE_KEYS = [
  "has_wvpp",
  "wvpp_site_specific",
  "has_incident_log",
  "pii_stripped",
  "training_current",
  "audit_ready",
  "has_iipp",
  "iipp_current",
  "has_eap",
  "has_hazcom",
  "osha_300_current",
] as const

// Phase 2: Vertical-specific question definitions
const VERTICAL_QUESTION_DEFS: Record<string, VerticalQuestion> = {
  heat_illness: { key: "heat_illness", question: "Do you have a written Heat Illness Prevention Plan?", fine: 18000, citation: "T8 CCR §3395", help: "Required for all outdoor workers in California. Must include water, shade, and acclimatization procedures." },
  fall_protection: { key: "fall_protection", question: "Do you have a fall protection plan for work above 6 feet?", fine: 16131, citation: "T8 CCR §1671.1", help: "Must cover guardrails, safety nets, or personal fall arrest systems for all elevated work." },
  silica_exposure: { key: "silica_exposure", question: "Do you have a silica exposure control plan?", fine: 16131, citation: "T8 CCR §1532.3", help: "Required when cutting, grinding, or drilling concrete, stone, or masonry." },
  hearing_conservation: { key: "hearing_conservation", question: "Do you have a hearing conservation program?", fine: 16131, citation: "T8 CCR §5097", help: "Required when noise levels exceed 85 dBA TWA. Includes audiometric testing and hearing protection." },
  bbp_exposure: { key: "bbp_exposure", question: "Do you have a Bloodborne Pathogen Exposure Control Plan?", fine: 18000, citation: "T8 CCR §5193", help: "Required for any workplace with potential exposure to blood or OPIM." },
  hipaa_sra: { key: "hipaa_sra", question: "Have you completed a HIPAA Security Risk Assessment in the last 12 months?", fine: 25000, citation: "45 CFR §164.308(a)(1)", help: "Annual SRA is the #1 HIPAA audit finding. Must document all ePHI access points." },
  baa_tracker: { key: "baa_tracker", question: "Do you track all Business Associate Agreements?", fine: 16131, citation: "45 CFR §164.502(e)", help: "Every vendor with access to PHI must have a current BAA on file." },
  atd_plan: { key: "atd_plan", question: "Do you have an Aerosol Transmissible Diseases plan?", fine: 18000, citation: "T8 CCR §5199", help: "Required for healthcare facilities and labs handling aerosol transmissible pathogens." },
  loto_procedure: { key: "loto_procedure", question: "Do you have written Lockout/Tagout procedures?", fine: 16131, citation: "T8 CCR §3314", help: "Machine-specific LOTO procedures must be documented for all energy-isolating equipment." },
  machine_guarding: { key: "machine_guarding", question: "Are all machines with moving parts properly guarded?", fine: 16131, citation: "T8 CCR §4002", help: "Point-of-operation guards, barrier guards, and two-hand controls required on applicable machinery." },
  confined_space: { key: "confined_space", question: "Do you have a permit-required confined space program?", fine: 16131, citation: "T8 CCR §5157", help: "Tanks, silos, vaults, and pits require entry permits and rescue procedures." },
  forklift_cert: { key: "forklift_cert", question: "Are all forklift operators certified and current?", fine: 16131, citation: "T8 CCR §3668", help: "Operators must be trained, evaluated, and re-certified every 3 years." },
  dq_file: { key: "dq_file", question: "Do you maintain Driver Qualification files for all CDL drivers?", fine: 16131, citation: "49 CFR §391", help: "DQ files must include road test, medical cert, driving record, and employment history." },
  spray_booth: { key: "spray_booth", question: "Does your spray booth meet ventilation and fire safety standards?", fine: 16131, citation: "T8 CCR §5416", help: "Spray booths must meet airflow, electrical classification, and fire suppression requirements." },
  pesticide_safety: { key: "pesticide_safety", question: "Do you maintain pesticide safety training records?", fine: 18000, citation: "3 CCR §6724", help: "All handlers and fieldworkers must receive annual pesticide safety training." },
  wildfire_smoke: { key: "wildfire_smoke", question: "Do you have a wildfire smoke protection plan?", fine: 18000, citation: "T8 CCR §5141.1", help: "Required when AQI exceeds 150. Must include monitoring, communication, and respiratory protection." },
  rent_control: { key: "rent_control", question: "Are your properties compliant with local rent control ordinances?", fine: 10000, citation: "AB 1482 / local", help: "Annual rent increase caps and just-cause eviction protections under the Tenant Protection Act." },
}

const BASELINE_ITEMS = ["wvpp", "iipp", "eap", "hazcom", "osha_300", "training_curriculum", "incident_log", "audit_package"]

const EMPLOYEE_MULTIPLIERS: Record<string, number> = {
  "1-9": 0.8,
  "10-25": 1.0,
  "26-50": 1.2,
  "51-100": 1.5,
  "101-250": 1.8,
  "251+": 2.0,
}

/**
 * Get vertical-specific questions based on compliance_stack.
 * Returns only the EXTRA questions beyond the 8 baseline items.
 */
export function getVerticalQuestions(complianceStack: string[]): VerticalQuestion[] {
  const extras = complianceStack.filter((item) => !BASELINE_ITEMS.includes(item))
  return extras
    .map((key) => VERTICAL_QUESTION_DEFS[key])
    .filter((q): q is VerticalQuestion => q !== undefined)
}

export function calculateScore(answers: ScoreAnswers): ScoreResult {
  const gaps: ScoreGap[] = []

  // Phase 1: Check 11 baseline questions
  for (const key of BASELINE_KEYS) {
    if (!answers[key]) {
      const def = BASELINE_GAPS[key]
      gaps.push({
        key,
        label: def.label,
        description: def.description,
        citation: def.citation,
        fine: def.fine,
        citation_amount: def.fine,
        phase: "baseline",
      })
    }
  }

  // Phase 2: Check vertical-specific answers
  if (answers.vertical_answers) {
    for (const [key, val] of Object.entries(answers.vertical_answers)) {
      if (!val) {
        const def = VERTICAL_QUESTION_DEFS[key]
        if (def) {
          gaps.push({
            key,
            label: `Missing: ${def.question.replace(/^Do you |^Have you |^Are |^Does /i, "").replace(/\?$/, "")}`,
            description: def.help ?? def.question,
            citation: def.citation,
            fine: def.fine,
            citation_amount: def.fine,
            phase: "vertical",
          })
        }
      }
    }
  }

  const verticalExtras = answers.vertical_answers ? Object.keys(answers.vertical_answers).length : 0
  const maxScore = BASELINE_KEYS.length + verticalExtras
  const score = maxScore - gaps.length

  const ratio = maxScore > 0 ? score / maxScore : 0
  const tier: ScoreResult["tier"] =
    ratio >= 0.9 ? "green" : ratio >= 0.6 ? "yellow" : "red"

  const employeeMultiplier = EMPLOYEE_MULTIPLIERS[answers.employee_count] ?? 1.0
  const baseFine = gaps.reduce((sum, g) => sum + g.fine, 0) * employeeMultiplier
  const fine_low = Math.round(baseFine * 0.7)
  const fine_high = Math.round(baseFine * 1.3)

  return { score, max_score: maxScore, tier, gaps, fine_low, fine_high }
}
