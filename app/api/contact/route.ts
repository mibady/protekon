import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { rateLimit, getClientIp } from "@/lib/rate-limit"
import type { ContactSubmission } from "@/lib/types/partner"

export async function POST(request: Request) {
  const ip = getClientIp(request.headers)
  if (rateLimit(ip).limited) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    )
  }

  let data: ContactSubmission
  try {
    data = (await request.json()) as ContactSubmission
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!data?.name || !data?.email || !data?.subject || !data?.message) {
    return NextResponse.json(
      { error: "Missing required fields: name, email, subject, message" },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  const { error } = await supabase.from("contact_submissions").insert({
    name: data.name,
    email: data.email,
    company: data.company ?? null,
    phone: data.phone ?? null,
    subject: data.subject,
    message: data.message,
  })

  if (error) {
    console.error("[POST /api/contact] Supabase insert error:", error)
    return NextResponse.json(
      { error: "Unable to submit your message. Please try again." },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
