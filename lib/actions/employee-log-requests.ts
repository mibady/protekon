"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { inngest } from "@/inngest/client"
import { stripPII } from "@/lib/pii"
import { revalidatePath } from "next/cache"

export type EmployeeLogRequest = {
  id: string
  client_id: string
  requester_name: string
  requester_email: string
  requester_role: string
  reason: string | null
  period_start: string
  period_end: string
  status: "pending" | "processing" | "released" | "declined" | "expired"
  due_at: string
  released_at: string | null
  released_packet_url: string | null
  decline_reason: string | null
  created_at: string
}

type ActionResult = { success: true; id?: string } | { error: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function listEmployeeLogRequests(): Promise<EmployeeLogRequest[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("employee_log_requests")
    .select("*")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })

  return (data as EmployeeLogRequest[]) ?? []
}

export async function createEmployeeLogRequest(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "You must be logged in." }

  const requesterName = (formData.get("requester_name") as string | null)?.trim()
  const requesterEmail = (formData.get("requester_email") as string | null)?.trim().toLowerCase()
  const requesterRole = (formData.get("requester_role") as string | null) || "employee"
  const reason = (formData.get("reason") as string | null)?.trim() || null
  const periodStart = formData.get("period_start") as string | null
  const periodEnd = formData.get("period_end") as string | null

  if (!requesterName) return { error: "Requester name is required." }
  if (!requesterEmail || !EMAIL_RE.test(requesterEmail)) {
    return { error: "Valid requester email is required." }
  }
  if (!periodStart || !periodEnd) return { error: "Date range is required." }
  if (new Date(periodStart) > new Date(periodEnd)) {
    return { error: "Start date must be before end date." }
  }

  const { data, error } = await supabase
    .from("employee_log_requests")
    .insert({
      client_id: user.id,
      requester_name: requesterName,
      requester_email: requesterEmail,
      requester_role: requesterRole,
      reason,
      period_start: periodStart,
      period_end: periodEnd,
    })
    .select("id, due_at")
    .single()

  if (error) return { error: error.message }

  await supabase.from("audit_log").insert({
    client_id: user.id,
    event_type: "employee_log.requested",
    description: `Log request logged for ${requesterName} (${periodStart} to ${periodEnd})`,
    metadata: { request_id: data.id, period_start: periodStart, period_end: periodEnd },
  })

  await inngest.send({
    name: "compliance/employee-log.requested",
    data: {
      requestId: data.id,
      clientId: user.id,
      dueAt: data.due_at,
    },
  })

  revalidatePath("/dashboard/incidents/log-requests")
  return { success: true, id: data.id }
}

export async function releaseEmployeeLogRequest(
  requestId: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "You must be logged in." }

  const { data: req, error: fetchErr } = await supabase
    .from("employee_log_requests")
    .select("*")
    .eq("id", requestId)
    .eq("client_id", user.id)
    .single()

  if (fetchErr || !req) return { error: "Request not found." }
  if (req.status === "released") return { error: "Already released." }

  // Pull incidents within the requested window and scrub PII.
  const admin = createAdminClient()
  const { data: incidents } = await admin
    .from("incidents")
    .select("id, incident_id, incident_date, severity, description, location")
    .eq("client_id", user.id)
    .gte("incident_date", req.period_start)
    .lte("incident_date", req.period_end)
    .order("incident_date", { ascending: true })

  const scrubbedPacket = {
    request_id: req.id,
    period: { start: req.period_start, end: req.period_end },
    generated_at: new Date().toISOString(),
    incidents: (incidents ?? []).map((i) => ({
      incident_id: i.incident_id,
      date: i.incident_date,
      severity: i.severity,
      location: stripPII(i.location ?? ""),
      description: stripPII(i.description ?? ""),
    })),
  }

  const filename = `employee-log-${req.id}.json`
  let packetUrl: string | null = null

  try {
    const { put } = await import("@vercel/blob")
    const blob = await put(filename, JSON.stringify(scrubbedPacket, null, 2), {
      access: "public",
      contentType: "application/json",
    })
    packetUrl = blob.url
  } catch {
    packetUrl = null
  }

  const { error: updateErr } = await supabase
    .from("employee_log_requests")
    .update({
      status: "released",
      released_at: new Date().toISOString(),
      released_packet_url: packetUrl,
    })
    .eq("id", requestId)
    .eq("client_id", user.id)

  if (updateErr) return { error: updateErr.message }

  await supabase.from("audit_log").insert({
    client_id: user.id,
    event_type: "employee_log.released",
    description: `Released log packet for ${req.requester_name}`,
    metadata: { request_id: req.id, packet_url: packetUrl, incident_count: (incidents ?? []).length },
  })

  revalidatePath("/dashboard/incidents/log-requests")
  return { success: true, id: requestId }
}

export async function declineEmployeeLogRequest(
  requestId: string,
  reason: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "You must be logged in." }

  if (!reason?.trim()) return { error: "Decline reason is required." }

  const { error } = await supabase
    .from("employee_log_requests")
    .update({ status: "declined", decline_reason: reason.trim() })
    .eq("id", requestId)
    .eq("client_id", user.id)

  if (error) return { error: error.message }

  await supabase.from("audit_log").insert({
    client_id: user.id,
    event_type: "employee_log.declined",
    description: `Declined log request`,
    metadata: { request_id: requestId, reason: reason.trim() },
  })

  revalidatePath("/dashboard/incidents/log-requests")
  return { success: true, id: requestId }
}
