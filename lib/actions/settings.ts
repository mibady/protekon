"use server"

import { createClient } from "@/lib/supabase/server"
import type { ActionResult, ClientProfile } from "@/lib/types"

export async function getClientProfile(): Promise<ClientProfile | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from("clients")
    .select("*")
    .eq("id", user.id)
    .single()

  return data as ClientProfile | null
}

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in." }
  }

  const businessName = formData.get("businessName") as string
  const phone = formData.get("phone") as string | null

  const { error } = await supabase
    .from("clients")
    .update({
      business_name: businessName,
      phone: phone || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) {
    return { error: error.message }
  }

  // Update auth user metadata email display name
  const email = formData.get("email") as string
  if (email && email !== user.email) {
    const { error: authError } = await supabase.auth.updateUser({ email })
    if (authError) {
      return { error: authError.message }
    }
  }

  await supabase.from("audit_log").insert({
    client_id: user.id,
    event_type: "settings.profile_updated",
    description: "Updated profile settings",
  })

  return { success: true }
}

export async function updateCompany(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in." }
  }

  const vertical = formData.get("industry") as string
  const updates: Record<string, string | null> = {
    updated_at: new Date().toISOString(),
  }

  if (vertical) updates.vertical = vertical

  const plan = formData.get("plan") as string | null
  if (plan) updates.plan = plan

  const { error } = await supabase
    .from("clients")
    .update(updates)
    .eq("id", user.id)

  if (error) {
    return { error: error.message }
  }

  await supabase.from("audit_log").insert({
    client_id: user.id,
    event_type: "settings.company_updated",
    description: "Updated company settings",
  })

  return { success: true }
}

export async function changePassword(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in." }
  }

  const newPassword = formData.get("newPassword") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!newPassword || newPassword.length < 8) {
    return { error: "Password must be at least 8 characters." }
  }

  if (newPassword !== confirmPassword) {
    return { error: "Passwords do not match." }
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    return { error: error.message }
  }

  await supabase.from("audit_log").insert({
    client_id: user.id,
    event_type: "settings.password_changed",
    description: "Changed account password",
  })

  return { success: true }
}

export async function getNotificationPreferences(): Promise<Record<string, boolean>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return {}

  const { data } = await supabase
    .from("clients")
    .select("notification_preferences")
    .eq("id", user.id)
    .single()

  return (data?.notification_preferences as Record<string, boolean>) ?? {
    regulatory_updates: true,
    document_reminders: true,
    weekly_summaries: true,
    incident_alerts: true,
    marketing_emails: false,
  }
}

export async function updateNotificationPreferences(prefs: Record<string, boolean>): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { error } = await supabase
    .from("clients")
    .update({ notification_preferences: prefs })
    .eq("id", user.id)

  if (error) return { error: error.message }
  return { success: true }
}
