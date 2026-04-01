import { inngest } from "../client"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendEmail } from "@/lib/resend"
import { auditAlertEmail } from "@/lib/email-templates"

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

    // Step 2: Audit each client
    const auditResults: { clientId: string; score: number; status: string }[] = []
    for (const client of clients) {
      const result = await step.run(`audit-${client.id}`, async () => {
        // Count documents, incidents, training for this client
        const [docRes, incRes, trainRes] = await Promise.all([
          supabase
            .from("documents")
            .select("*", { count: "exact", head: true })
            .eq("client_id", client.id)
            .eq("status", "current"),
          supabase
            .from("incidents")
            .select("*", { count: "exact", head: true })
            .eq("client_id", client.id),
          supabase
            .from("training_records")
            .select("*", { count: "exact", head: true })
            .eq("client_id", client.id)
            .eq("status", "pending"),
        ])

        const docCount = docRes.count ?? 0
        const incidentCount = incRes.count ?? 0
        const pendingTraining = trainRes.count ?? 0

        // Score: docs (40pts), low incidents (30pts), training complete (30pts)
        const docScore = Math.min(docCount * 10, 40)
        const incScore = Math.max(30 - incidentCount * 5, 0)
        const trainScore = pendingTraining === 0 ? 30 : Math.max(30 - pendingTraining * 10, 0)
        const totalScore = docScore + incScore + trainScore
        const status = totalScore >= 75 ? "compliant" : totalScore >= 50 ? "at-risk" : "non-compliant"

        const month = new Date().toISOString().slice(0, 7)
        const seq = String(Math.floor(Math.random() * 900) + 100)

        await supabase.from("audits").insert({
          client_id: client.id,
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

        // Update client compliance score
        await supabase
          .from("clients")
          .update({ compliance_score: totalScore, risk_level: status === "compliant" ? "low" : status === "at-risk" ? "medium" : "high" })
          .eq("id", client.id)

        return { clientId: client.id, score: totalScore, status }
      })

      auditResults.push(result)
    }

    // Step 3: Generate summary report
    const summary = await step.run("generate-monthly-report", async () => {
      const compliant = auditResults.filter((r) => r.status === "compliant").length
      const atRisk = auditResults.filter((r) => r.status === "at-risk").length
      const nonCompliant = auditResults.filter((r) => r.status === "non-compliant").length

      console.log(
        `[monthly-audit] Summary: ${compliant} compliant, ${atRisk} at-risk, ${nonCompliant} non-compliant`
      )

      return { compliant, atRisk, nonCompliant, total: auditResults.length }
    })

    // Step 4: Send alerts to at-risk clients
    await step.run("send-audit-emails", async () => {
      const atRiskClients = auditResults.filter(
        (r) => r.status === "at-risk" || r.status === "non-compliant"
      )
      for (const result of atRiskClients) {
        const match = clients.find((c) => c.id === result.clientId)
        if (match?.email) {
          await sendEmail({ to: match.email, ...auditAlertEmail(match.business_name, result.score, result.status) })
        }
      }
    })

    return { success: true, ...summary }
  }
)
