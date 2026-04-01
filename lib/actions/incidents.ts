"use server"

import { createClient } from "@/lib/supabase/server"
import type { ActionResult, Incident } from "@/lib/types"

export async function createIncident(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to log an incident." }
  }

  const description = formData.get("description") as string
  const location = formData.get("location") as string | null
  const date = formData.get("date") as string | null
  const severity = formData.get("severity") as string

  if (!description || !severity) {
    return { error: "Description and severity are required." }
  }

  // Generate incident ID: INC-YYYY-NNN
  const year = new Date().getFullYear()
  const { count } = await supabase
    .from("incidents")
    .select("*", { count: "exact", head: true })
    .eq("client_id", user.id)

  const seq = String((count ?? 0) + 1).padStart(3, "0")
  const incidentId = `INC-${year}-${seq}`

  // Collect extra form fields into metadata
  const metadata = {
    type: formData.get("type") as string | undefined,
    time: formData.get("time") as string | undefined,
    injuryOccurred: formData.get("injuryOccurred") === "yes",
    medicalTreatment: formData.get("medicalTreatment") === "yes",
    witnesses: (formData.get("witnesses") as string) || undefined,
    actionsTaken: (formData.get("actionsTaken") as string) || undefined,
  }

  const { error } = await supabase.from("incidents").insert({
    client_id: user.id,
    incident_id: incidentId,
    description,
    location: location || null,
    incident_date: date || null,
    severity,
    metadata,
  })

  if (error) {
    return { error: error.message }
  }

  // Log to audit trail
  await supabase.from("audit_log").insert({
    client_id: user.id,
    event_type: "incident.reported",
    description: `Logged incident ${incidentId} (${severity})`,
    metadata: { incident_id: incidentId, severity, type: metadata.type },
  })

  return { success: true }
}

export async function getIncidents(): Promise<Incident[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from("incidents")
    .select("*")
    .eq("client_id", user.id)
    .order("incident_date", { ascending: false })

  if (error) return []

  return data as Incident[]
}
