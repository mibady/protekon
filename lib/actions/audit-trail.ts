"use server"

import { createClient } from "@/lib/supabase/server"

export type AuditLogRow = {
  id: string
  client_id: string
  event_type: string
  description: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export type AuditFilters = {
  eventType?: string
  from?: string // ISO
  to?: string // ISO
  limit?: number // default 100
}

/**
 * Lists audit_log rows for the current client, newest first.
 * Read path — uses the authed supabase client (respects RLS).
 */
export async function listAuditLog(
  filters: AuditFilters = {}
): Promise<AuditLogRow[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  let q = supabase
    .from("audit_log")
    .select("id, client_id, event_type, description, metadata, created_at")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })
    .limit(filters.limit ?? 100)

  if (filters.eventType) q = q.eq("event_type", filters.eventType)
  if (filters.from) q = q.gte("created_at", filters.from)
  if (filters.to) q = q.lte("created_at", filters.to)

  const { data, error } = await q
  if (error || !data) return []
  return data as AuditLogRow[]
}

/**
 * Returns the distinct set of event_type values recorded for the current
 * client, alphabetised for stable filter dropdowns.
 */
export async function getAuditEventTypes(): Promise<string[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase
    .from("audit_log")
    .select("event_type")
    .eq("client_id", user.id)
    .limit(1000)
  const set = new Set((data ?? []).map((r) => r.event_type as string))
  return Array.from(set).sort()
}
