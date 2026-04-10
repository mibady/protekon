"use server"

import { createClient } from "@/lib/supabase/server"

type Alert = {
  id: string
  type: string
  title: string
  description: string
  date: string
  action: string
  read: boolean
}

export async function markAllAlertsRead(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "You must be logged in." }
  }

  const { error } = await supabase
    .from("alerts")
    .update({ read: true })
    .eq("client_id", user.id)
    .eq("read", false)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function getAlerts(
  offset: number = 0,
  limit: number = 20
): Promise<{ data: Alert[]; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { data: [], error: "Not authenticated" }

  const { data, error } = await supabase
    .from("alerts")
    .select("*")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("[getAlerts] Database error:", error.message)
    return { data: [], error: error.message }
  }

  const alerts = (data ?? []).map((a) => ({
    id: a.id,
    type: a.type || "info",
    title: a.title || "Alert",
    description: a.message || "",
    date: new Date(a.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    action: a.action || "View Details",
    read: a.read ?? false,
  }))

  return { data: alerts }
}

export async function markAlertRead(
  alertId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "You must be logged in." }
  }

  const { error } = await supabase
    .from("alerts")
    .update({ read: true })
    .eq("id", alertId)
    .eq("client_id", user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function dismissAlert(
  alertId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "You must be logged in." }
  }

  const { error } = await supabase
    .from("alerts")
    .delete()
    .eq("id", alertId)
    .eq("client_id", user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function getUnreadCount(): Promise<{
  count: number
  error?: string
}> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { count: 0, error: "Not authenticated" }
  }

  const { count, error } = await supabase
    .from("alerts")
    .select("*", { count: "exact", head: true })
    .eq("client_id", user.id)
    .eq("read", false)

  if (error) {
    return { count: 0, error: error.message }
  }

  return { count: count ?? 0 }
}
