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
