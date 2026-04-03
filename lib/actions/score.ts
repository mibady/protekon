"use server"

import { createClient } from "@/lib/supabase/server"
import type { ScoreLead } from "@/lib/types/score"

export async function submitScore(
  lead: ScoreLead
): Promise<{ success: true; id: string } | { error: string }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("compliance_score_leads")
      .insert({
        email: lead.email,
        name: lead.name,
        phone: lead.phone ?? null,
        industry: lead.answers.industry,
        employee_count: lead.answers.employee_count,
        location_count: lead.answers.location_count,
        city: lead.answers.city,
        state: lead.answers.state,
        has_iipp: lead.answers.has_iipp,
        iipp_site_specific: lead.answers.iipp_site_specific,
        has_incident_log: lead.answers.has_incident_log,
        training_current: lead.answers.training_current,
        has_industry_programs: lead.answers.has_industry_programs,
        audit_ready: lead.answers.audit_ready,
        score: lead.result.score,
        score_tier: lead.result.tier,
        gaps: lead.result.gaps,
        estimated_fine_low: lead.result.fine_low,
        estimated_fine_high: lead.result.fine_high,
        partner_ref: lead.partner_ref ?? null,
        utm_source: lead.utm_source ?? null,
        utm_medium: lead.utm_medium ?? null,
        utm_campaign: lead.utm_campaign ?? null,
      })
      .select("id")
      .single()

    if (error) {
      console.error("[submitScore] Supabase insert error:", error)
      return { error: error.message }
    }

    return { success: true, id: data.id }
  } catch (err) {
    console.error("[submitScore] Unexpected error:", err)
    return { error: "Failed to submit score" }
  }
}
