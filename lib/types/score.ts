export interface ScoreAnswers {
  industry: string
  employee_count: string

  has_wvpp: boolean
  wvpp_site_specific: boolean
  has_incident_log: boolean
  pii_stripped: boolean
  training_current: boolean
  audit_ready: boolean
}

export interface ScoreResult {
  score: number
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
