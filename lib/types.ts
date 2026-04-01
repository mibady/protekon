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
