"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { inngest } from "@/inngest/client"
import type { ActionResult } from "@/lib/types"

export type IntakeAnswers = {
  wvpp_drafted: boolean
  training_completed: boolean
  incident_log_active: boolean
  hazards_identified: boolean
  reporting_policy: boolean
  union_confirmed: boolean
}

export async function submitIntake(answers: IntakeAnswers): Promise<ActionResult & { score?: number; riskLevel?: string }> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: "You must be logged in to submit an intake assessment." }
  }

  // Calculate compliance score
  const totalQuestions = Object.keys(answers).length
  const yesCount = Object.values(answers).filter(Boolean).length
  const percentage = Math.round((yesCount / totalQuestions) * 100)
  const riskLevel = percentage >= 75 ? "low" : percentage >= 50 ? "medium" : "high"

  const gaps = Object.entries(answers)
    .filter(([, v]) => !v)
    .map(([k]) => k)

  const admin = createAdminClient()

  // Store intake submission
  const { error: insertError } = await admin.from("intake_submissions").insert({
    email: user.email,
    business_name: user.user_metadata?.business_name || "",
    vertical: user.user_metadata?.vertical || "other",
    answers,
    compliance_score: percentage,
    risk_level: riskLevel,
    status: "completed",
  })

  if (insertError) {
    console.error("[Protekon] Failed to store intake submission:", insertError)
    return { error: "Failed to save your assessment. Please try again." }
  }

  // Update client record with score
  await admin
    .from("clients")
    .update({
      compliance_score: percentage,
      risk_level: riskLevel,
    })
    .eq("id", user.id)

  // Fire Inngest event to trigger intake pipeline
  await inngest.send({
    name: "compliance/intake.submitted",
    data: {
      email: user.email!,
      businessName: user.user_metadata?.business_name || "",
      vertical: user.user_metadata?.vertical || "other",
      answers,
    },
  })

  // Log to audit trail
  await admin.from("audit_log").insert({
    client_id: user.id,
    event_type: "intake_submitted",
    description: `Compliance assessment completed: ${percentage}% (${riskLevel} risk)`,
    metadata: { gaps, score: percentage, risk_level: riskLevel },
  })

  return { success: true, score: percentage, riskLevel }
}

export async function getIntakeStatus(): Promise<{ completed: boolean; score?: number; riskLevel?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { completed: false }

  const admin = createAdminClient()
  const { data } = await admin
    .from("intake_submissions")
    .select("compliance_score, risk_level")
    .eq("email", user.email!)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (!data) return { completed: false }

  return {
    completed: true,
    score: data.compliance_score,
    riskLevel: data.risk_level,
  }
}
