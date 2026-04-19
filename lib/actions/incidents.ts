"use server"

import { createClient } from "@/lib/supabase/server"
import { requirePaidAuth } from "@/lib/billing-guard"
import { inngest } from "@/inngest/client"
import { getSiteContext } from "@/lib/site-context"
import type { ActionResult, Incident } from "@/lib/types"

export async function createIncident(formData: FormData): Promise<ActionResult> {
  const auth = await requirePaidAuth()
  if (auth.error) return { error: auth.message }
  const { supabase, user } = auth

  const description = formData.get("description") as string
  const location = formData.get("location") as string | null
  const date = formData.get("date") as string | null
  const severity = formData.get("severity") as string

  if (!description || !severity) {
    return { error: "Description and severity are required." }
  }

  // Generate collision-safe incident ID: INC-YYYY-XXXXX
  const year = new Date().getFullYear()
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // no ambiguous 0/O/1/I
  let suffix = ""
  for (let i = 0; i < 5; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)]
  }
  const incidentId = `INC-${year}-${suffix}`

  // Collect extra form fields into metadata
  const metadata = {
    type: formData.get("type") as string | undefined,
    time: formData.get("time") as string | undefined,
    injuryOccurred: formData.get("injuryOccurred") === "yes",
    medicalTreatment: formData.get("medicalTreatment") === "yes",
    witnesses: (formData.get("witnesses") as string) || undefined,
    actionsTaken: (formData.get("actionsTaken") as string) || undefined,
  }

  const { siteId } = await getSiteContext()
  const { error } = await supabase.from("incidents").insert({
    client_id: user.id,
    incident_id: incidentId,
    description,
    location: location || null,
    incident_date: date || null,
    severity,
    site_id: siteId,
    metadata,
  })

  if (error) {
    return { error: error.message }
  }

  // Log to audit trail
  const { error: auditError } = await supabase.from("audit_log").insert({
    client_id: user.id,
    event_type: "incident.reported",
    description: `Logged incident ${incidentId} (${severity})`,
    metadata: { incident_id: incidentId, severity, type: metadata.type },
  })
  if (auditError) console.error("[createIncident] Audit log failed:", auditError.message)

  // Fire Inngest event to trigger incident processing pipeline
  await inngest.send({
    name: "compliance/incident.reported",
    data: {
      clientId: user.id,
      businessName: user.user_metadata?.business_name || "",
      incidentData: {
        description,
        location: location || "",
        date: date || new Date().toISOString().slice(0, 10),
        severity,
      },
    },
  })

  return { success: true }
}

export async function getIncidents(): Promise<Incident[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { siteId } = await getSiteContext()
  let query = supabase
    .from("incidents")
    .select("*")
    .eq("client_id", user.id)
  if (siteId) query = query.eq("site_id", siteId)
  const { data, error } = await query.order("incident_date", { ascending: false })

  if (error) {
    console.error("[getIncidents] Database error:", error.message)
    return []
  }

  return data as Incident[]
}

export async function updateIncident(
  id: string,
  data: Partial<Omit<Incident, "id" | "incident_id" | "created_at">>
): Promise<ActionResult> {
  const auth = await requirePaidAuth()
  if (auth.error) return { error: auth.message }
  const { supabase, user } = auth

  // Verify ownership
  const { data: existing, error: fetchError } = await supabase
    .from("incidents")
    .select("id, incident_id, client_id")
    .eq("id", id)
    .eq("client_id", user.id)
    .single()

  if (fetchError || !existing) {
    return { error: "Incident not found or access denied." }
  }

  // Build update payload — only include fields that were provided
  const updatePayload: Record<string, unknown> = {}
  if (data.description !== undefined) updatePayload.description = data.description
  if (data.location !== undefined) updatePayload.location = data.location
  if (data.incident_date !== undefined) updatePayload.incident_date = data.incident_date
  if (data.severity !== undefined) updatePayload.severity = data.severity
  if (data.follow_up_id !== undefined) updatePayload.follow_up_id = data.follow_up_id
  if (data.metadata !== undefined) updatePayload.metadata = data.metadata

  const { error } = await supabase
    .from("incidents")
    .update(updatePayload)
    .eq("id", id)
    .eq("client_id", user.id)

  if (error) {
    return { error: error.message }
  }

  // Log to audit trail
  const { error: auditError } = await supabase.from("audit_log").insert({
    client_id: user.id,
    event_type: "incident.updated",
    description: `Updated incident ${existing.incident_id}`,
    metadata: { incident_id: existing.incident_id, updated_fields: Object.keys(updatePayload) },
  })
  if (auditError) console.error("[updateIncident] Audit log failed:", auditError.message)

  return { success: true }
}

/**
 * Mark an incident as reported to the regulatory authority.
 * Sets reported_at = now() and writes audit_log row.
 *
 * Used by the ReportingBanner "Report now" CTA flow.
 */
export async function markIncidentReported(
  incidentId: string
): Promise<ActionResult> {
  const auth = await requirePaidAuth()
  if (auth.error) return { error: auth.message }
  const { supabase, user } = auth

  // Fetch the incident first for audit logging context
  const { data: existing, error: fetchError } = await supabase
    .from("incidents")
    .select("id, incident_id, severity")
    .eq("id", incidentId)
    .eq("client_id", user.id)
    .single()

  if (fetchError || !existing) {
    return { error: "Incident not found." }
  }

  const { error: updateError } = await supabase
    .from("incidents")
    .update({ reported_at: new Date().toISOString() })
    .eq("id", incidentId)
    .eq("client_id", user.id)

  if (updateError) {
    return { error: updateError.message }
  }

  // Mirror existing audit_log write pattern from createIncident / updateIncident
  const { error: auditError } = await supabase.from("audit_log").insert({
    client_id: user.id,
    event_type: "incident.reported_to_authority",
    description: `Marked incident ${existing.incident_id} as reported to authority`,
    metadata: { incident_id: existing.incident_id, severity: existing.severity },
  })
  if (auditError) console.error("[markIncidentReported] Audit log failed:", auditError.message)

  return { success: true }
}

/**
 * Returns the most recent open reportable incident for a client.
 * Used by app/dashboard/layout.tsx to feed the jurisdiction/role-aware ReportingBanner.
 *
 * "Open" = reported_at IS NULL.
 * "Reportable" = severity in a list that matches both new-spec values
 *                (fatality/hospitalization/amputation/eye_loss) AND existing
 *                shipped values that map to reportable (serious/in_patient/fatal).
 *
 * Returns null when no such incident exists (no banner rendered).
 */
export async function getOpenReportableIncident(
  clientId: string
): Promise<Incident | null> {
  const supabase = await createClient()

  const REPORTABLE_SEVERITIES = [
    "fatality",
    "hospitalization",
    "amputation",
    "eye_loss",
    "serious",
    "in_patient",
    "fatal",
  ]

  const { data, error } = await supabase
    .from("incidents")
    .select("*")
    .eq("client_id", clientId)
    .is("reported_at", null)
    .in("severity", REPORTABLE_SEVERITIES)
    .order("incident_date", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) return null
  return data as Incident
}
