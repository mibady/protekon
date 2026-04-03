import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { calculateScore } from "@/lib/score-calculator"
import { submitScore } from "@/lib/actions/score"
import { inngest } from "@/inngest/client"
import type { ScoreLead } from "@/lib/types/score"

const SubmitScoreSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  phone: z.string().optional(),
  answers: z.object({
    industry: z.string().min(1),
    employee_count: z.string().min(1),
    location_count: z.string().min(1),
    city: z.string().default(""),
    state: z.string().default("CA"),
    has_iipp: z.boolean(),
    iipp_site_specific: z.boolean(),
    has_incident_log: z.boolean(),
    training_current: z.boolean(),
    has_industry_programs: z.boolean(),
    audit_ready: z.boolean(),
  }),
  partner_ref: z.string().optional(),
  pid: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const parsed = SubmitScoreSchema.safeParse(body)

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
  } catch (err) {
    console.error("[api/score/submit] Unexpected error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
