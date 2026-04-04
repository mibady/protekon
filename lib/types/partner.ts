// Contact form submission
export interface ContactSubmission {
  name: string
  email: string
  company?: string
  phone?: string
  subject: string
  message: string
}

// Partner portal types
export interface PartnerProfile {
  id: string
  user_id: string
  company_name: string
  contact_name: string
  email: string
  phone?: string
  tier: 'free' | 'essentials' | 'professional' | 'enterprise'
  branding?: { logo_url?: string; primary_color?: string }
  status: 'pending' | 'approved' | 'suspended'
  created_at: string
}

export interface PartnerClient {
  id: string
  partner_id: string
  client_id: string
  client_name: string
  vertical: string
  compliance_score: number
  plan: string
  status: 'active' | 'suspended' | 'churned'
  monthly_revenue: number
  created_at: string
}

export interface PartnerAssessment {
  id: string
  partner_id: string
  prospect_name: string
  prospect_email: string
  score?: number
  score_tier?: string
  gaps?: string[]
  fine_low?: number
  fine_high?: number
  status: 'pending' | 'sent' | 'completed' | 'converted'
  sent_at?: string
  completed_at?: string
  created_at: string
}

// Partner application (existing)
export interface PartnerApplication {
  name: string
  email: string
  phone?: string
  business_name: string
  business_type: string
  website?: string
  city: string
  state: string
  client_count: string
  client_industries: string[]
  verticals_interested: string[]
  previous_compliance_experience: string
  tier_interest: string
  referral_source?: string
  notes?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
}
