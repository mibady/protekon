"use server"

import { createClient } from "@/lib/supabase/server"
import type { ActionResult } from "@/lib/types"
import type { PartnerProfile, PartnerClient, PartnerAssessment } from "@/lib/types/partner"

export async function getPartnerProfile(): Promise<PartnerProfile | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from("partner_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single()

  return data as PartnerProfile | null
}

export async function getPartnerClients(): Promise<PartnerClient[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const profile = await getPartnerProfile()
  if (!profile) return []

  const { data, error } = await supabase
    .from("partner_clients")
    .select(`
      id,
      partner_id,
      client_id,
      status,
      monthly_revenue,
      created_at,
      clients (
        business_name,
        vertical,
        compliance_score,
        plan
      )
    `)
    .eq("partner_id", profile.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[getPartnerClients] Supabase error:", error)
    return []
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    partner_id: row.partner_id,
    client_id: row.client_id,
    client_name: row.clients?.business_name ?? "",
    vertical: row.clients?.vertical ?? "",
    compliance_score: row.clients?.compliance_score ?? 0,
    plan: row.clients?.plan ?? "",
    status: row.status,
    monthly_revenue: row.monthly_revenue,
    created_at: row.created_at,
  })) as PartnerClient[]
}

export async function getPartnerStats(): Promise<{
  totalClients: number
  mrr: number
  avgScore: number
  assessmentsSent: number
}> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { totalClients: 0, mrr: 0, avgScore: 0, assessmentsSent: 0 }

  const profile = await getPartnerProfile()
  if (!profile) return { totalClients: 0, mrr: 0, avgScore: 0, assessmentsSent: 0 }

  const [clientsRes, assessmentsRes] = await Promise.all([
    supabase
      .from("partner_clients")
      .select(`
        monthly_revenue,
        clients (
          compliance_score
        )
      `)
      .eq("partner_id", profile.id)
      .eq("status", "active"),
    supabase
      .from("partner_assessments")
      .select("id", { count: "exact", head: true })
      .eq("partner_id", profile.id),
  ])

  const clients = clientsRes.data ?? []
  const totalClients = clients.length
  const mrr = clients.reduce((sum: number, c: any) => sum + (c.monthly_revenue ?? 0), 0)
  const scores = clients.map((c: any) => c.clients?.compliance_score ?? 0).filter((s: number) => s > 0)
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0
  const assessmentsSent = assessmentsRes.count ?? 0

  return { totalClients, mrr, avgScore, assessmentsSent }
}

export async function getPartnerAssessments(): Promise<PartnerAssessment[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const profile = await getPartnerProfile()
  if (!profile) return []

  const { data, error } = await supabase
    .from("partner_assessments")
    .select("*")
    .eq("partner_id", profile.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[getPartnerAssessments] Supabase error:", error)
    return []
  }

  return (data ?? []) as PartnerAssessment[]
}

export async function updatePartnerProfile(formData: FormData): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { error: "You must be logged in." }

    const updates: Record<string, unknown> = {}

    const company_name = formData.get("company_name")
    if (company_name) updates.company_name = String(company_name)

    const contact_name = formData.get("contact_name")
    if (contact_name) updates.contact_name = String(contact_name)

    const email = formData.get("email")
    if (email) updates.email = String(email)

    const phone = formData.get("phone")
    if (phone !== null) updates.phone = String(phone) || null

    const logo_url = formData.get("logo_url")
    const primary_color = formData.get("primary_color")
    if (logo_url !== null || primary_color !== null) {
      updates.branding = {
        ...(logo_url !== null ? { logo_url: String(logo_url) || null } : {}),
        ...(primary_color !== null ? { primary_color: String(primary_color) } : {}),
      }
    }

    if (Object.keys(updates).length === 0) return { success: true }

    const { error } = await supabase
      .from("partner_profiles")
      .update(updates)
      .eq("user_id", user.id)

    if (error) {
      console.error("[updatePartnerProfile] Supabase error:", error)
      return { error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error("[updatePartnerProfile] Unexpected error:", err)
    return { error: "Failed to update profile" }
  }
}

export async function sendAssessment(data: {
  prospect_name: string
  prospect_email: string
}): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { error: "You must be logged in." }

    const profile = await getPartnerProfile()
    if (!profile) return { error: "Partner profile not found." }

    const { error } = await supabase.from("partner_assessments").insert({
      partner_id: profile.id,
      prospect_name: data.prospect_name,
      prospect_email: data.prospect_email,
      status: "sent",
      sent_at: new Date().toISOString(),
    })

    if (error) {
      console.error("[sendAssessment] Supabase insert error:", error)
      return { error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error("[sendAssessment] Unexpected error:", err)
    return { error: "Failed to send assessment" }
  }
}
