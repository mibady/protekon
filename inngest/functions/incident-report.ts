import { inngest } from "../client"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendEmail, getComplianceOfficerEmail } from "@/lib/resend"
import { incidentAlertEmail } from "@/lib/email-templates"

// PII stripping regex patterns per CA Labor Code §6401.9
function stripPII(text: string): string {
  return text
    // Email addresses
    .replace(/[\w.-]+@[\w.-]+\.\w+/g, "[EMAIL REDACTED]")
    // Phone numbers (various formats)
    .replace(/(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, "[PHONE REDACTED]")
    // SSN patterns
    .replace(/\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g, "[SSN REDACTED]")
    // Common name patterns (Mr./Mrs./Ms. + capitalized word)
    .replace(/\b(Mr|Mrs|Ms|Dr|Miss)\.?\s+[A-Z][a-z]+/g, "[NAME REDACTED]")
}

export const incidentReport = inngest.createFunction(
  { id: "incident-report", triggers: [{ event: "compliance/incident.reported" }] },
  async ({ event, step }) => {
    const { clientId, businessName, incidentData } = event.data as {
      clientId: string; businessName: string
      incidentData: { description: string; location: string; date: string; severity: string }
    }
    const supabase = createAdminClient()

    // Step 1: AI classification (HEAD layer) — enhances severity + PII detection
    const aiClassification = await step.run("ai-classify-incident", async () => {
      try {
        const { classifyIncident } = await import("@/lib/ai/incident-classifier")
        return await classifyIncident({
          description: incidentData.description,
          location: incidentData.location,
          date: incidentData.date,
          vertical: "general",
          userSeverity: incidentData.severity,
        })
      } catch (err) {
        console.warn("[incident-report] AI classification failed, using manual severity:", err instanceof Error ? err.message : err)
        return null
      }
    })

    // Step 2: Strip PII from description (regex baseline + AI enhancement)
    const sanitized = await step.run("strip-pii", async () => {
      return {
        description: stripPII(incidentData.description),
        location: incidentData.location,
        date: incidentData.date,
        severity: aiClassification?.severity ?? incidentData.severity,
        aiClassification: aiClassification ? {
          oshaCode: aiClassification.oshaCode,
          category: aiClassification.category,
          osha300Recordable: aiClassification.osha300Recordable,
          recommendation: aiClassification.recommendation,
          piiDetected: aiClassification.piiDetected,
        } : null,
      }
    })

    // Step 2: Log to database
    const incident = await step.run("log-to-ledger", async () => {
      const year = new Date().getFullYear()
      const seq = String(Math.floor(Math.random() * 900) + 100)
      const incidentId = `INC-${year}-${seq}`

      const { data, error } = await supabase
        .from("incidents")
        .insert({
          client_id: clientId,
          incident_id: incidentId,
          description: sanitized.description,
          location: sanitized.location,
          incident_date: sanitized.date,
          severity: sanitized.severity,
        })
        .select("id, incident_id")
        .single()

      if (error) throw new Error(`Failed to log incident: ${error.message}`)
      return data
    })

    // Step 3: Notify compliance officer
    await step.run("notify-compliance-officer", async () => {
      const officerEmail = getComplianceOfficerEmail()
      await sendEmail({ to: officerEmail, ...incidentAlertEmail(incident.incident_id, businessName, sanitized.severity) })
    })

    // Step 4: Wait for follow-up period (severity-based)
    const waitDuration =
      sanitized.severity === "severe"
        ? "24h"
        : sanitized.severity === "serious"
          ? "72h"
          : "7d"

    await step.sleep("wait-for-follow-up", waitDuration)

    // Step 5: Schedule follow-up
    await step.run("schedule-follow-up", async () => {
      const followUpId = `FU-${incident.incident_id}`

      await supabase
        .from("incidents")
        .update({ follow_up_id: followUpId })
        .eq("id", incident.id)

      console.log(
        `[incident-report] Follow-up scheduled: ${followUpId}`
      )
    })

    return { success: true, incidentId: incident.incident_id }
  }
)
