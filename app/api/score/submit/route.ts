import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { calculateScore } from "@/lib/score-calculator"
import { submitScore, saveAnonymousScore, captureScoreEmail } from "@/lib/actions/score"
import { inngest } from "@/inngest/client"
import type { ScoreLead } from "@/lib/types/score"

const AnswersSchema = z.object({
  industry: z.string().min(1),
  employee_count: z.string().min(1),
  // Phase 1: SB 553
  has_wvpp: z.boolean(),
  wvpp_site_specific: z.boolean(),
  has_incident_log: z.boolean(),
  pii_stripped: z.boolean(),
  training_current: z.boolean(),
  audit_ready: z.boolean(),
  // Phase 1: Platform-wide
  has_iipp: z.boolean(),
  iipp_current: z.boolean(),
  has_eap: z.boolean(),
  has_hazcom: z.boolean(),
  osha_300_current: z.boolean(),
  // Phase 2: Vertical-specific
  vertical_answers: z.record(z.boolean()).optional(),
})

const AnonymousSubmitSchema = z.object({
  phase: z.literal("anonymous"),
  answers: AnswersSchema,
  partner_ref: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  referrer_url: z.string().optional(),
})

const CaptureSubmitSchema = z.object({
  phase: z.literal("capture"),
  lead_id: z.string().uuid(),
  email: z.string().email(),
  business_name: z.string().min(1),
})

/** @deprecated Legacy schema — use phase-based submit */
const LegacySubmitSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  phone: z.string().optional(),
  answers: AnswersSchema,
  partner_ref: z.string().optional(),
  pid: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()

    // Phase-based routing
    if (body.phase === "anonymous") {
      return handleAnonymous(body)
    }
    if (body.phase === "capture") {
      return handleCapture(body)
    }

    // Legacy path (no phase field)
    return handleLegacy(body)
  } catch (err) {
    console.error("[api/score/submit] Unexpected error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function handleAnonymous(body: unknown): Promise<NextResponse> {
  const parsed = AnonymousSubmitSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { answers, ...rest } = parsed.data
  const result = calculateScore(answers)

  const response = await saveAnonymousScore({
    answers,
    result,
    partner_ref: rest.partner_ref,
    utm_source: rest.utm_source,
    utm_medium: rest.utm_medium,
    utm_campaign: rest.utm_campaign,
    referrer_url: rest.referrer_url,
  })

  if ("error" in response) {
    return NextResponse.json({ error: response.error }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    id: response.id,
    result,
  })
}

async function handleCapture(body: unknown): Promise<NextResponse> {
  const parsed = CaptureSubmitSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { lead_id, email, business_name } = parsed.data

  const response = await captureScoreEmail({ lead_id, email, business_name })

  if ("error" in response) {
    return NextResponse.json({ error: response.error }, { status: 500 })
  }

  // Fetch the lead row to get score data for drip event
  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()
  const { data: row } = await supabase
    .from("compliance_score_leads")
    .select("score, score_tier, gaps, industry, estimated_fine_low, estimated_fine_high, partner_ref")
    .eq("id", lead_id)
    .single()

  if (row) {
    const gaps = (row.gaps ?? []) as { key: string; label: string; description: string; citation: string; fine: number }[]
    await inngest.send({
      name: "score/lead.created",
      data: {
        lead_id,
        email,
        name: business_name,
        score: row.score,
        score_tier: row.score_tier,
        gaps: gaps.map((g) => ({
          key: g.key,
          label: g.label,
          description: g.description,
          citation: g.citation,
          fine: g.fine,
        })),
        industry: row.industry,
        fine_low: row.estimated_fine_low,
        fine_high: row.estimated_fine_high,
        partner_ref: row.partner_ref,
      },
    })
  }

  return NextResponse.json({ success: true })
}

/** @deprecated Legacy handler — kept for backward compatibility */
async function handleLegacy(body: unknown): Promise<NextResponse> {
  const parsed = LegacySubmitSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { answers, ...rest } = parsed.data
  const result = calculateScore(answers)

  const lead: ScoreLead = {
    ...rest,
    answers,
    result,
  }

  const response = await submitScore(lead)

  if ("error" in response) {
    return NextResponse.json({ error: response.error }, { status: 500 })
  }

  // Trigger drip sequence
  await inngest.send({
    name: "score/lead.created",
    data: {
      lead_id: response.id,
      email: lead.email,
      name: lead.name,
      score: result.score,
      score_tier: result.tier,
      gaps: result.gaps.map((g) => ({
        key: g.key,
        label: g.label,
        description: g.description,
        citation: g.citation,
        fine: g.fine,
      })),
      industry: lead.answers.industry,
      fine_low: result.fine_low,
      fine_high: result.fine_high,
      partner_ref: lead.partner_ref,
    },
  })

  return NextResponse.json({
    success: true,
    id: response.id,
    result,
  })
}
