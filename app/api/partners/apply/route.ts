import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { submitPartnerApplication } from "@/lib/actions/partner"
import type { PartnerApplication } from "@/lib/types/partner"

const PartnerApplicationSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  business_name: z.string().min(1),
  business_type: z.string().min(1),
  website: z.union([z.string().url(), z.literal("")]).optional(),
  city: z.string().default(""),
  state: z.string().default("CA"),
  client_count: z.string().min(1),
  client_industries: z.array(z.string()).min(1),
  verticals_interested: z.array(z.string()).min(1),
  previous_compliance_experience: z.string().min(1),
  tier_interest: z.string().min(1),
  referral_source: z.string().optional(),
  notes: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const parsed = PartnerApplicationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const application: PartnerApplication = parsed.data

    const response = await submitPartnerApplication(application)

    if ("error" in response) {
      return NextResponse.json({ error: response.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      id: response.id,
    })
  } catch (err) {
    console.error("[api/partners/apply] Unexpected error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
