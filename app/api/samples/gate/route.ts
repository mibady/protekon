import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

// In-memory rate limiter: 5 requests per minute per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Rate limit by IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
    const now = Date.now()
    const entry = rateLimitMap.get(ip)

    if (entry && entry.resetAt > now) {
      if (entry.count >= 5) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          { status: 429 }
        )
      }
      entry.count++
    } else {
      rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 })
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
