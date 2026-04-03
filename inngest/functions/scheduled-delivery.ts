import { inngest } from "../client"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendEmail, getSiteUrl } from "@/lib/resend"

/**
 * Scheduled Delivery Pipeline
 * Runs daily at 7 AM — checks for deliveries due today, bundles
 * compliance reports/documents, and emails them to clients.
 *
 * Delivery types: weekly-summary, monthly-report, quarterly-review, annual-audit
 */
export const scheduledDelivery = inngest.createFunction(
  { id: "scheduled-delivery", triggers: [{ cron: "0 7 * * *" }] },
  async ({ step }) => {
    const supabase = createAdminClient()
    const today = new Date().toISOString().slice(0, 10)

    // Step 1: Find all deliveries due today or overdue
    const dueDeliveries = await step.run("find-due-deliveries", async () => {
      const { data, error } = await supabase
        .from("scheduled_deliveries")
        .select("id, client_id, delivery_type, frequency")
        .eq("status", "scheduled")
        .lte("next_delivery_date", today)

      if (error) {
        console.error("[scheduled-delivery] Failed to query due deliveries:", error.message)
        return []
      }
      return data ?? []
    })

    if (dueDeliveries.length === 0) {
      return { success: true, delivered: 0, skipped: "no deliveries due" }
    }

    let delivered = 0

    // Step 2: Process each delivery
    for (const delivery of dueDeliveries) {
      await step.run(`deliver-${delivery.id}`, async () => {
        // Fetch client info
        const { data: client } = await supabase
          .from("clients")
          .select("email, business_name, vertical, compliance_score, risk_level")
          .eq("id", delivery.client_id)
          .single()

        if (!client?.email) {
          console.warn(`[scheduled-delivery] No email for client ${delivery.client_id}, skipping`)
          return
        }

        // Gather delivery content based on type
        const content = await gatherDeliveryContent(supabase, delivery.client_id, delivery.delivery_type)

        // Send email
        await sendEmail({
          to: client.email,
          subject: getSubjectLine(delivery.delivery_type, client.business_name),
          html: buildDeliveryEmail({
            businessName: client.business_name,
            deliveryType: delivery.delivery_type,
            complianceScore: client.compliance_score ?? 0,
            riskLevel: client.risk_level ?? "unknown",
            content,
          }),
        })

        // Update delivery record
        const nextDate = calculateNextDeliveryDate(delivery.frequency)
        await supabase
          .from("scheduled_deliveries")
          .update({
            last_delivered_at: new Date().toISOString(),
            next_delivery_date: nextDate,
          })
          .eq("id", delivery.id)

        // Audit log
        await supabase.from("audit_log").insert({
          client_id: delivery.client_id,
          event_type: "delivery_sent",
          description: `${delivery.delivery_type} delivered to ${client.email}`,
          metadata: { delivery_type: delivery.delivery_type, frequency: delivery.frequency },
        })

        delivered++
      })
    }

    return { success: true, delivered, total: dueDeliveries.length }
  }
)

async function gatherDeliveryContent(
  supabase: ReturnType<typeof createAdminClient>,
  clientId: string,
  deliveryType: string
) {
  const now = new Date()
  const content: {
    documents: { type: string; status: string; date: string }[]
    incidents: { severity: string; date: string; location: string }[]
    score: number
    trainingDue: number
    regulatoryUpdates: { title: string; severity: string }[]
  } = {
    documents: [],
    incidents: [],
    score: 0,
    trainingDue: 0,
    regulatoryUpdates: [],
  }

  // Date range based on delivery type
  const rangeStart = new Date(now)
  switch (deliveryType) {
    case "weekly-summary":
      rangeStart.setDate(rangeStart.getDate() - 7)
      break
    case "monthly-report":
      rangeStart.setMonth(rangeStart.getMonth() - 1)
      break
    case "quarterly-review":
      rangeStart.setMonth(rangeStart.getMonth() - 3)
      break
    case "annual-audit":
      rangeStart.setFullYear(rangeStart.getFullYear() - 1)
      break
  }
  const since = rangeStart.toISOString()

  // Documents created/updated in period
  const { data: docs } = await supabase
    .from("documents")
    .select("type, status, created_at")
    .eq("client_id", clientId)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(20)

  content.documents = (docs ?? []).map((d) => ({
    type: d.type,
    status: d.status,
    date: new Date(d.created_at).toLocaleDateString(),
  }))

  // Incidents in period
  const { data: incidents } = await supabase
    .from("incidents")
    .select("severity, incident_date, location")
    .eq("client_id", clientId)
    .gte("incident_date", since.slice(0, 10))
    .order("incident_date", { ascending: false })
    .limit(20)

  content.incidents = (incidents ?? []).map((i) => ({
    severity: i.severity,
    date: i.incident_date,
    location: i.location,
  }))

  // Current compliance score
  const { data: client } = await supabase
    .from("clients")
    .select("compliance_score")
    .eq("id", clientId)
    .single()

  content.score = client?.compliance_score ?? 0

  // Training records due
  const { count } = await supabase
    .from("training_records")
    .select("*", { count: "exact", head: true })
    .eq("client_id", clientId)
    .eq("status", "pending")
    .lte("due_date", now.toISOString().slice(0, 10))

  content.trainingDue = count ?? 0

  // Recent regulatory updates
  const { data: regs } = await supabase
    .from("regulatory_updates")
    .select("title, severity")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(5)

  content.regulatoryUpdates = (regs ?? []).map((r) => ({
    title: r.title,
    severity: r.severity,
  }))

  return content
}

function getSubjectLine(deliveryType: string, businessName: string): string {
  const labels: Record<string, string> = {
    "weekly-summary": "Your AI compliance officer's weekly report",
    "monthly-report": "Your AI compliance officer's monthly report",
    "quarterly-review": "Your AI compliance officer's quarterly review",
    "annual-audit": "Your AI compliance officer's annual audit package",
  }
  return `${labels[deliveryType] ?? "Your AI compliance officer's update"} — ${businessName}`
}

function calculateNextDeliveryDate(frequency: string): string {
  const next = new Date()
  switch (frequency) {
    case "weekly":
      next.setDate(next.getDate() + 7)
      break
    case "monthly":
      next.setMonth(next.getMonth() + 1)
      break
    case "quarterly":
      next.setMonth(next.getMonth() + 3)
      break
    case "annual":
      next.setFullYear(next.getFullYear() + 1)
      break
    default:
      next.setMonth(next.getMonth() + 1)
  }
  return next.toISOString().slice(0, 10)
}

function buildDeliveryEmail(opts: {
  businessName: string
  deliveryType: string
  complianceScore: number
  riskLevel: string
  content: Awaited<ReturnType<typeof gatherDeliveryContent>>
}): string {
  const { businessName, deliveryType, complianceScore, riskLevel, content } = opts
  const siteUrl = getSiteUrl()

  const scoreColor = riskLevel === "low" ? "#10B981" : riskLevel === "medium" ? "#F59E0B" : "#DC2626"
  const typeLabel: Record<string, string> = {
    "weekly-summary": "Weekly Summary",
    "monthly-report": "Monthly Report",
    "quarterly-review": "Quarterly Review",
    "annual-audit": "Annual Audit Package",
  }

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4efe6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:24px;font-weight:800;color:#0B1D3A;letter-spacing:2px;">PROTEKON</span>
    </div>
    <div style="background:#ffffff;border:1px solid #e8e2d8;padding:32px;">
      <h2 style="color:#0B1D3A;margin:0 0 4px;font-size:20px;">${typeLabel[deliveryType] ?? "Compliance Update"}</h2>
      <p style="color:#7A8FA5;margin:0 0 8px;font-size:13px;">${businessName} &middot; ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
      <p style="color:#555;margin:0 0 24px;font-size:14px;line-height:1.6;">Your AI compliance officer has completed its ${deliveryType.replace("-", " ")} review. Here's your compliance status:</p>

      <div style="background:#f4efe6;padding:20px;margin-bottom:24px;display:flex;align-items:center;">
        <div style="text-align:center;flex:1;">
          <div style="font-size:36px;font-weight:800;color:${scoreColor};">${complianceScore}%</div>
          <div style="font-size:11px;color:#7A8FA5;text-transform:uppercase;letter-spacing:1px;">Compliance Score</div>
        </div>
        <div style="width:1px;height:50px;background:#e8e2d8;"></div>
        <div style="text-align:center;flex:1;">
          <div style="font-size:14px;font-weight:700;color:${scoreColor};text-transform:uppercase;">${riskLevel}</div>
          <div style="font-size:11px;color:#7A8FA5;text-transform:uppercase;letter-spacing:1px;">Risk Level</div>
        </div>
      </div>

      ${content.documents.length > 0 ? `
      <h3 style="color:#0B1D3A;font-size:14px;margin:0 0 8px;border-bottom:2px solid #C41230;padding-bottom:4px;display:inline-block;">Documents</h3>
      <ul style="color:#555;font-size:13px;padding-left:20px;line-height:1.8;">
        ${content.documents.slice(0, 5).map((d) => `<li>${d.type} (${d.status}) — ${d.date}</li>`).join("")}
      </ul>` : ""}

      ${content.incidents.length > 0 ? `
      <h3 style="color:#0B1D3A;font-size:14px;margin:16px 0 8px;border-bottom:2px solid #C41230;padding-bottom:4px;display:inline-block;">Incidents</h3>
      <ul style="color:#555;font-size:13px;padding-left:20px;line-height:1.8;">
        ${content.incidents.slice(0, 5).map((i) => `<li>[${i.severity}] ${i.location} — ${i.date}</li>`).join("")}
      </ul>` : `<p style="color:#10B981;font-size:13px;font-weight:600;">No incidents reported this period.</p>`}

      ${content.trainingDue > 0 ? `<p style="color:#F59E0B;font-size:13px;font-weight:600;">&#9888; ${content.trainingDue} training record${content.trainingDue === 1 ? "" : "s"} overdue.</p>` : ""}

      ${content.regulatoryUpdates.length > 0 ? `
      <h3 style="color:#0B1D3A;font-size:14px;margin:16px 0 8px;border-bottom:2px solid #C9A84C;padding-bottom:4px;display:inline-block;">Regulatory Updates</h3>
      <ul style="color:#555;font-size:13px;padding-left:20px;line-height:1.8;">
        ${content.regulatoryUpdates.map((r) => `<li>[${r.severity}] ${r.title}</li>`).join("")}
      </ul>` : ""}

      <a href="${siteUrl}/dashboard" style="display:inline-block;margin-top:24px;padding:12px 24px;background:#0B1D3A;color:#f4efe6;text-decoration:none;font-weight:600;font-size:13px;letter-spacing:1px;">VIEW DASHBOARD</a>
    </div>
    <div style="text-align:center;margin-top:24px;font-size:11px;color:#7A8FA5;">
      Managed Compliance. Delivered. &middot; <a href="${siteUrl}/dashboard/settings" style="color:#C41230;text-decoration:none;">Manage delivery preferences</a>
    </div>
  </div>
</body>
</html>`
}
