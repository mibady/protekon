export interface ScoreAnswers {
  industry: string
  employee_count: string
  location_count: string
  city: string
  state: string

  has_iipp: boolean
  iipp_site_specific: boolean
  has_incident_log: boolean
  training_current: boolean
  has_industry_programs: boolean
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
  citation_amount: number
}

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
