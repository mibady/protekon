import { inngest } from "../client"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendEmail } from "@/lib/resend"
import { intakeWelcomeEmail } from "@/lib/email-templates"

export const intakePipeline = inngest.createFunction(
  { id: "intake-pipeline", triggers: [{ event: "compliance/intake.submitted" }] },
  async ({ event, step }) => {
    const { email, businessName, vertical, answers } = event.data as {
      email: string; businessName: string; vertical: string; answers: Record<string, boolean>
    }
    const supabase = createAdminClient()

    // Step 1: Score compliance gaps
    const scoring = await step.run("score-compliance-gaps", async () => {
      const totalQuestions = Object.keys(answers).length || 1
      const yesCount = Object.values(answers).filter(Boolean).length
      const percentage = Math.round((yesCount / totalQuestions) * 100)
      const riskLevel =
        percentage >= 75 ? "low" : percentage >= 50 ? "medium" : "high"

      return { complianceScore: percentage, riskLevel }
    })

    // Step 2: Upsert client record
    const client = await step.run("upsert-client-record", async () => {
      const { data, error } = await supabase
        .from("clients")
        .upsert(
          {
            email,
            business_name: businessName,
            vertical,
            compliance_score: scoring.complianceScore,
            risk_level: scoring.riskLevel,
          },
          { onConflict: "email" }
        )
        .select("id")
        .single()

      if (error) throw new Error(`Failed to upsert client: ${error.message}`)
      return data
    })

    // Step 3: Generate starter documents
    await step.run("generate-documents", async () => {
      const docTypes = [
        { type: `${vertical}-compliance-plan`, filename: `${vertical}-compliance-plan.pdf` },
        { type: `${vertical}-gap-analysis`, filename: `${vertical}-gap-analysis.pdf` },
        { type: "incident-response-protocol", filename: "incident-response-protocol.pdf" },
      ]

      for (const doc of docTypes) {
        const seq = String(Math.floor(Math.random() * 900) + 100)
        await supabase.from("documents").insert({
          client_id: client.id,
          document_id: `DOC-${new Date().getFullYear()}-${seq}`,
          type: doc.type,
          filename: doc.filename,
          status: "current",
        })
      }
    })

    // Step 4: Send welcome email
    await step.run("send-welcome-email", async () => {
      await sendEmail({ to: email, ...intakeWelcomeEmail(email, scoring.complianceScore, scoring.riskLevel) })
    })

    // Step 5: Create default delivery schedules
    await step.run("create-delivery-schedules", async () => {
      const { createDefaultDeliveries } = await import("@/lib/actions/scheduled-deliveries")
      await createDefaultDeliveries(client.id)
    })

    // Step 6: Wait for onboarding period
    await step.sleep("wait-for-onboarding", "48h")

    // Step 7: Schedule first audit
    await step.run("schedule-first-audit", async () => {
      const month = new Date().toISOString().slice(0, 7)
      const seq = String(Math.floor(Math.random() * 900) + 100)

      await supabase.from("audits").insert({
        client_id: client.id,
        audit_id: `AUD-${new Date().getFullYear()}-${seq}`,
        month,
        score: scoring.complianceScore,
        status: "scheduled",
        checks: { source: "intake-pipeline", auto_generated: true },
      })
    })

    return {
      success: true,
      clientId: client.id,
      complianceScore: scoring.complianceScore,
    }
  }
)
