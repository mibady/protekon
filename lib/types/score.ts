export interface ScoreAnswers {
  industry: string
  employee_count: string

  // Phase 1: SB 553 (existing)
  has_wvpp: boolean
  wvpp_site_specific: boolean
  has_incident_log: boolean
  pii_stripped: boolean
  training_current: boolean
  audit_ready: boolean

  // Phase 1: Platform-wide (new)
  has_iipp: boolean
  iipp_current: boolean
  has_eap: boolean
  has_hazcom: boolean
  osha_300_current: boolean

  // Phase 2: Vertical-specific (dynamic)
  vertical_answers?: Record<string, boolean>
}

export interface ScoreResult {
  score: number
  max_score: number
  tier: "green" | "yellow" | "red"
  gaps: ScoreGap[]
  fine_low: number
  fine_high: number
}

export interface ScoreGap {
  key: string
  label: string
  description: string
  citation: string
  fine: number
  citation_amount: number
  phase: "baseline" | "vertical"
}

export interface VerticalBenchmark {
  slug: string
  display_name: string
  tier: string
  national_violations: number
  national_penalties_usd: number
  serious_pct: number
  top_hazcats: string[]
  compliance_stack: string[]
}

export interface VerticalQuestion {
  key: string
  question: string
  fine: number
  citation: string
  help?: string
}

/** Two-phase submit: anonymous score (no email required) */
export interface ScoreLeadAnonymous {
  answers: ScoreAnswers
  result: ScoreResult
  partner_ref?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  referrer_url?: string
}

/** Two-phase submit: email capture (after anonymous score) */
export interface ScoreLeadCapture {
  lead_id: string
  email: string
  business_name: string
}

/** @deprecated Use ScoreLeadAnonymous + ScoreLeadCapture for two-phase submit */
export interface ScoreLead {
  email: string
  name: string
  phone?: string
  answers: ScoreAnswers
  result: ScoreResult
  partner_ref?: string
  pid?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
}
