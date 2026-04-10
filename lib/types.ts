export type ActionResult = {
  error?: string
  success?: boolean
}

export type Document = {
  id: string
  document_id: string
  type: string
  filename: string
  storage_url: string | null
  pages: number | null
  status: string
  notes: string | null
  priority: string
  created_at: string
}

export type Incident = {
  id: string
  incident_id: string
  description: string
  location: string | null
  incident_date: string | null
  severity: string
  follow_up_id: string | null
  metadata: {
    type?: string
    time?: string
    injuryOccurred?: boolean
    medicalTreatment?: boolean
    witnesses?: string
    actionsTaken?: string
  }
  created_at: string
}

export type ClientProfile = {
  id: string
  email: string
  business_name: string
  phone: string | null
  vertical: string
  plan: string
  compliance_score: number
  risk_level: string
  status: string
  created_at: string
  updated_at: string
  notification_preferences?: Record<string, boolean>
}

// --- Alerts (Phase 0: NGE-359) ---
export type AlertType = "regulatory" | "certification" | "incident" | "compliance" | "system"
export type AlertSeverity = "critical" | "high" | "medium" | "low" | "info"

export interface Alert {
  id: string
  client_id: string
  type: AlertType
  title: string
  message: string
  severity: AlertSeverity
  read: boolean
  action_url: string | null
  created_at: string
}

// --- SB 553 Violence Classification (Phase 0: NGE-361) ---
export type ViolenceType = 1 | 2 | 3 | 4
export type PerpRelationship = "stranger" | "client-customer" | "worker" | "personal"

export interface IncidentClassification {
  category: string
  severity: string
  oshaCode: string
  osha300Recordable: boolean
  violenceType: ViolenceType | null
  perpetratorRelationship: PerpRelationship | null
  piiDetected: boolean
  recommendation: string
  followUpTimeline: string
}

// --- OSHA Data API (Phase 0: NGE-360) ---
export interface OshaIndustryProfile {
  naicsCode: string
  industryName: string
  avgPenalty: number
  violationRate: number
  totalViolations: number
  topStandards: { code: string; description: string; count: number }[]
}

export interface OshaNearbyEnforcement {
  activityNr: string
  estabName: string
  city: string
  violationType: string
  penalty: number
  issuanceDate: string
}

export interface OshaBenchmarks {
  industry: string
  penaltyPercentiles: { p25: number; p50: number; p75: number; p90: number }
  clientPercentile: number
}

export type DashboardData = {
  client: ClientProfile | null
  recentDocuments: Document[]
  recentIncidents: Incident[]
  complianceScore: number
  documentCount: number
  incidentCount: number
  auditCount: number
}
