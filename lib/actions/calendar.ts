"use server"

import { createClient } from "@/lib/supabase/server"

export type CalendarEventType = "training" | "document" | "regulatory" | "certification"
export type CalendarEventStatus = "overdue" | "upcoming" | "completed"

export interface CalendarEvent {
  id: string
  date: string
  title: string
  type: CalendarEventType
  status: CalendarEventStatus
  detail?: string
}

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const now = new Date()
  const events: CalendarEvent[] = []

  // Training renewals
  const { data: training } = await supabase
    .from("training_records")
    .select("id, training_type, completion_date, next_due")
    .eq("client_id", user.id)
    .not("next_due", "is", null)

  for (const t of training || []) {
    const due = new Date(t.next_due)
    const status: CalendarEventStatus = due < now ? "overdue" : "upcoming"
    events.push({
      id: `train-${t.id}`,
      date: t.next_due,
      title: `${t.training_type} renewal`,
      type: "training",
      status,
      detail: `Completed: ${t.completion_date}`,
    })
  }

  // Document renewals (documents with status "expiring" or recently created)
  const { data: docs } = await supabase
    .from("documents")
    .select("id, document_id, type, created_at, status")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20)

  for (const d of docs || []) {
    // Assume annual renewal from creation date
    const created = new Date(d.created_at)
    const renewalDate = new Date(created)
    renewalDate.setFullYear(renewalDate.getFullYear() + 1)
    const status: CalendarEventStatus =
      renewalDate < now ? "overdue" : "upcoming"

    events.push({
      id: `doc-${d.id}`,
      date: renewalDate.toISOString().slice(0, 10),
      title: `${d.type.replace(/-/g, " ")} renewal`,
      type: "document",
      status: d.status === "current" ? status : "overdue",
      detail: d.document_id,
    })
  }

  // Regulatory effective dates
  const { data: regs } = await supabase
    .from("regulatory_updates")
    .select("id, title, effective_date, compliance_deadline, code")
    .not("effective_date", "is", null)
    .order("effective_date", { ascending: true })
    .limit(20)

  for (const r of regs || []) {
    const effDate = new Date(r.effective_date)
    const deadline = r.compliance_deadline ? new Date(r.compliance_deadline) : null
    const targetDate = deadline || effDate
    const status: CalendarEventStatus =
      targetDate < now ? "completed" : "upcoming"

    events.push({
      id: `reg-${r.id}`,
      date: (deadline || effDate).toISOString().slice(0, 10),
      title: r.code ? `${r.code} — ${r.title}` : r.title,
      type: "regulatory",
      status,
      detail: deadline ? `Compliance deadline` : `Effective date`,
    })
  }

  return events.sort((a, b) => a.date.localeCompare(b.date))
}
