import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { rateLimit, getClientIp } from "@/lib/rate-limit"
import { generateSamplePDF } from "@/lib/pdf-samples"

/* ── POST: email gate (lead capture) ── */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const ip = getClientIp(request.headers)
    if (rateLimit(ip).limited) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      )
    }

    const body = (await request.json()) as {
      email: string
      companyName?: string
      vertical?: string
    }

    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { error } = await supabase.from("sample_report_leads").insert({
      email: body.email,
      company_name: body.companyName ?? null,
      vertical: body.vertical ?? null,
    })

    if (error) {
      console.error("[Protekon] Failed to insert sample lead:", error)
      return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}

/* ── GET: download sample PDF (requires prior email capture) ── */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const report = request.nextUrl.searchParams.get("report")
  const email = request.nextUrl.searchParams.get("email")?.trim().toLowerCase()

  if (!report) {
    return NextResponse.json({ error: "Missing report parameter" }, { status: 400 })
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email required" }, { status: 403 })
  }

  // Verify the email has a recent lead row (within 24h) before serving the asset.
  const supabase = createAdminClient()
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { data: lead } = await supabase
    .from("sample_report_leads")
    .select("id")
    .ilike("email", email)
    .gte("created_at", cutoff)
    .limit(1)
    .maybeSingle()

  if (!lead) {
    return NextResponse.json({ error: "Submit the form first to access this download" }, { status: 403 })
  }

  try {
    const { buffer, filename } = await generateSamplePDF(report)

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(buffer.length),
      },
    })
  } catch {
    return NextResponse.json({ error: "Unknown report type" }, { status: 400 })
  }
}
