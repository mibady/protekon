"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import type { ActionResult } from "@/lib/types"

export async function submitSampleGate(formData: FormData): Promise<ActionResult> {
  const email = (formData.get("email") as string)?.trim()
  const companyName = (formData.get("companyName") as string)?.trim() || null
  const vertical = (formData.get("vertical") as string)?.trim() || null

  if (!email) {
    return { error: "Email is required." }
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please provide a valid email address." }
  }

  const supabase = createAdminClient()

  const { error } = await supabase.from("sample_report_leads").insert({
    email,
    company_name: companyName,
    vertical,
  })

  if (error) {
    console.error("[Protekon] Failed to insert sample lead:", error)
    return { error: "Failed to submit. Please try again." }
  }

  return { success: true }
}
