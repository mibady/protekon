"use server"

import { createClient } from "@/lib/supabase/server"
import type { ScoreLead, ScoreLeadAnonymous, ScoreLeadCapture, VerticalBenchmark } from "@/lib/types/score"

/** Fetch all 27 verticals for the industry dropdown */
export async function getVerticals(): Promise<{ slug: string; display_name: string; tier: string; compliance_stack: string[] }[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("verticals")
    .select("slug, display_name, tier, compliance_stack")
    .order("tier")
    .order("display_name")

  return (data ?? []).map((v) => ({
    ...v,
    compliance_stack: typeof v.compliance_stack === "string"
      ? (v.compliance_stack as string).split(",").map((s: string) => s.trim())
      : v.compliance_stack ?? [],
  }))
}

/** Fetch all verticals with full benchmark data (single query, no N+1) */
export async function getAllVerticalBenchmarks(): Promise<VerticalBenchmark[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("verticals")
    .select("slug, display_name, tier, national_violations, national_penalties_usd, serious_pct, top_hazcats, compliance_stack")
    .order("tier")
    .order("display_name")

  return (data ?? []).map((v) => ({
    slug: v.slug,
    display_name: v.display_name,
    tier: v.tier,
    national_violations: v.national_violations ?? 0,
    national_penalties_usd: Number(v.national_penalties_usd ?? 0),
    serious_pct: Number(v.serious_pct ?? 0),
    top_hazcats: v.top_hazcats ?? [],
    compliance_stack: typeof v.compliance_stack === "string"
      ? (v.compliance_stack as string).split(",").map((s: string) => s.trim())
      : v.compliance_stack ?? [],
  }))
}

/** Fetch enforcement benchmark data for a specific vertical */
export async function getVerticalBenchmark(slug: string): Promise<VerticalBenchmark | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("verticals")
    .select("slug, display_name, tier, national_violations, national_penalties_usd, serious_pct, top_hazcats, compliance_stack")
    .eq("slug", slug)
    .single()

  if (!data) return null

  return {
    slug: data.slug,
    display_name: data.display_name,
    tier: data.tier,
    national_violations: data.national_violations ?? 0,
    national_penalties_usd: Number(data.national_penalties_usd ?? 0),
    serious_pct: Number(data.serious_pct ?? 0),
    top_hazcats: data.top_hazcats ?? [],
    compliance_stack: typeof data.compliance_stack === "string"
      ? (data.compliance_stack as string).split(",").map((s: string) => s.trim())
      : data.compliance_stack ?? [],
  }
}

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
        // Phase 1: SB 553
        posture_has_wvpp: lead.answers.has_wvpp,
        posture_wvpp_site_specific: lead.answers.wvpp_site_specific,
        posture_has_incident_log: lead.answers.has_incident_log,
        posture_pii_stripped: lead.answers.pii_stripped,
        posture_training_current: lead.answers.training_current,
        posture_audit_ready: lead.answers.audit_ready,
        // Phase 1: Platform-wide
        posture_has_iipp: lead.answers.has_iipp,
        posture_iipp_current: lead.answers.iipp_current,
        posture_has_eap: lead.answers.has_eap,
        posture_has_hazcom: lead.answers.has_hazcom,
        posture_osha_300_current: lead.answers.osha_300_current,
        // Phase 2: Vertical-specific
        vertical_answers: lead.answers.vertical_answers ?? null,
        max_score: lead.result.max_score,
        // Results
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
        posture_has_iipp: lead.answers.has_iipp,
        posture_iipp_current: lead.answers.iipp_current,
        posture_has_eap: lead.answers.has_eap,
        posture_has_hazcom: lead.answers.has_hazcom,
        posture_osha_300_current: lead.answers.osha_300_current,
        vertical_answers: lead.answers.vertical_answers ?? null,
        max_score: lead.result.max_score,
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
