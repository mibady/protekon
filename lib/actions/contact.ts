"use server"

import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { rateLimit } from "@/lib/rate-limit"
import type { ActionResult } from "@/lib/types"
import type { ContactSubmission } from "@/lib/types/partner"

export async function submitContact(data: ContactSubmission): Promise<ActionResult> {
  try {
    const hdrs = await headers()
    const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
    if (rateLimit(ip).limited) {
      return { error: "Too many requests. Please try again later." }
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
      console.error("[submitContact] Supabase insert error:", error)
      return { error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error("[submitContact] Unexpected error:", err)
    return { error: "Failed to submit contact form" }
  }
}
