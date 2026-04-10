"use server"

import { createClient } from "@/lib/supabase/server"
import type { ScoreLead, ScoreLeadAnonymous, ScoreLeadCapture } from "@/lib/types/score"

/** Phase 1: Save anonymous score (no email required) */
export async function saveAnonymousScore(
  lead: ScoreLeadAnonymous
): Promise<{ success: true; id: string } | { error: string }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("compliance_score_leads")
      .insert({
        industry: lead.answers.industry,
        employee_count: lead.answers.employee_count,
        posture_has_wvpp: lead.answers.has_wvpp,
        posture_wvpp_site_specific: lead.answers.wvpp_site_specific,
        posture_has_incident_log: lead.answers.has_incident_log,
        posture_pii_stripped: lead.answers.pii_stripped,
        posture_training_current: lead.answers.training_current,
        posture_audit_ready: lead.answers.audit_ready,
        score: lead.result.score,
        score_tier: lead.result.tier,
        gaps: lead.result.gaps,
        estimated_fine_low: lead.result.fine_low,
        estimated_fine_high: lead.result.fine_high,
        partner_ref: lead.partner_ref ?? null,
        utm_source: lead.utm_source ?? null,
        utm_medium: lead.utm_medium ?? null,
        utm_campaign: lead.utm_campaign ?? null,
        referrer_url: lead.referrer_url ?? null,
      })
      .select("id")
      .single()

    if (error) {
      console.error("[saveAnonymousScore] Supabase insert error:", error)
      return { error: error.message }
    }

    return { success: true, id: data.id }
  } catch (err) {
    console.error("[saveAnonymousScore] Unexpected error:", err)
    return { error: "Failed to save anonymous score" }
  }
}

/** Phase 2: Capture email after anonymous score */
export async function captureScoreEmail(
  capture: ScoreLeadCapture
): Promise<{ success: true } | { error: string }> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from("compliance_score_leads")
      .update({
        email: capture.email,
        name: capture.business_name,
        pdf_downloaded: true,
        pdf_downloaded_at: new Date().toISOString(),
      })
      .eq("id", capture.lead_id)

    if (error) {
      console.error("[captureScoreEmail] Supabase update error:", error)
      return { error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error("[captureScoreEmail] Unexpected error:", err)
    return { error: "Failed to capture email" }
  }
}

/** @deprecated Use saveAnonymousScore + captureScoreEmail for two-phase submit */
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
        posture_has_wvpp: lead.answers.has_wvpp,
        posture_wvpp_site_specific: lead.answers.wvpp_site_specific,
        posture_has_incident_log: lead.answers.has_incident_log,
        posture_pii_stripped: lead.answers.pii_stripped,
        posture_training_current: lead.answers.training_current,
        posture_audit_ready: lead.answers.audit_ready,
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
