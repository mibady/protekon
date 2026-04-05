import { inngest } from "../client"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendEmail } from "@/lib/resend"
import { auditAlertEmail } from "@/lib/email-templates"

/**
 * Monthly audit orchestrator — fans out one event per client.
 * Each client audit runs concurrently via clientMonthlyAudit.
 */
export const monthlyAudit = inngest.createFunction(
  { id: "monthly-audit", triggers: [{ cron: "0 9 1 * *" }] },
  async ({ step }) => {
    const supabase = createAdminClient()

    // Step 1: Pull active client roster
    const clients = await step.run("pull-client-roster", async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, business_name, vertical, plan, email")
        .eq("status", "active")

      if (error) throw new Error(`Failed to pull clients: ${error.message}`)
      return data ?? []
    })

    // Step 2: Fan out — one event per client, processed in parallel
    await step.sendEvent(
      "fan-out-audits",
      clients.map((client) => ({
        name: "compliance/client.audit-due" as const,
        data: {
          clientId: client.id,
          email: client.email,
          businessName: client.business_name,
        },
      }))
    )

    return { success: true, clientsQueued: clients.length }
  }
)

/**
 * Per-client audit — runs independently and concurrently for each client.
 * A failure on one client does not block others.
 */
export const clientMonthlyAudit = inngest.createFunction(
  {
    id: "client-monthly-audit",
    triggers: [{ event: "compliance/client.audit-due" }],
  },
  async ({ event, step }) => {
    const supabase = createAdminClient()
    const { clientId, email, businessName } = event.data

    // Audit this client
    const result = await step.run("audit-client", async () => {
      const [docRes, incRes, trainRes] = await Promise.all([
        supabase
          .from("documents")
          .select("*", { count: "exact", head: true })
          .eq("client_id", clientId)
          .eq("status", "current"),
        supabase
          .from("incidents")
          .select("*", { count: "exact", head: true })
          .eq("client_id", clientId),
        supabase
          .from("training_records")
          .select("*", { count: "exact", head: true })
          .eq("client_id", clientId)
          .eq("status", "pending"),
      ])

      const docCount = docRes.count ?? 0
      const incidentCount = incRes.count ?? 0
      const pendingTraining = trainRes.count ?? 0

      // Score: docs (40pts), low incidents (30pts), training complete (30pts)
      const docScore = Math.min(docCount * 10, 40)
      const incScore = Math.max(30 - incidentCount * 5, 0)
      const trainScore =
        pendingTraining === 0 ? 30 : Math.max(30 - pendingTraining * 10, 0)
      const totalScore = docScore + incScore + trainScore
      const status =
        totalScore >= 75
          ? "compliant"
          : totalScore >= 50
            ? "at-risk"
            : "non-compliant"

      const month = new Date().toISOString().slice(0, 7)
      const seq = String(Math.floor(Math.random() * 900) + 100)

      await supabase.from("audits").insert({
        client_id: clientId,
        audit_id: `AUD-${new Date().getFullYear()}-${seq}`,
        month,
        score: totalScore,
        status,
        checks: {
          documents: docCount,
          incidents: incidentCount,
          pending_training: pendingTraining,
          doc_score: docScore,
          incident_score: incScore,
          training_score: trainScore,
        },
      })

      await supabase
        .from("clients")
        .update({
          compliance_score: totalScore,
          risk_level:
            status === "compliant"
              ? "low"
              : status === "at-risk"
                ? "medium"
                : "high",
        })
        .eq("id", clientId)

      return { score: totalScore, status }
    })

    // Send alert if at-risk or non-compliant
    if (
      email &&
      (result.status === "at-risk" || result.status === "non-compliant")
    ) {
      await step.run("send-audit-alert", async () => {
        await sendEmail({
          to: email,
          ...auditAlertEmail(businessName, result.score, result.status),
        })
      })
    }

    return { clientId, ...result }
  }
)
