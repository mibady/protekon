import { inngest } from "../client"
import { createAdminClient } from "@/lib/supabase/admin"

interface ExpirationCheck {
  table: string
  dateColumn: string
  nameColumn: string
  clientIdColumn: string
  alertType: string
  label: string
}

const CHECKS: ExpirationCheck[] = [
  { table: "construction_subs", dateColumn: "license_expiry", nameColumn: "company_name", clientIdColumn: "client_id", alertType: "certification", label: "CSLB License" },
  { table: "construction_subs", dateColumn: "insurance_expiry", nameColumn: "company_name", clientIdColumn: "client_id", alertType: "certification", label: "Insurance Policy" },
  { table: "manufacturing_equipment", dateColumn: "next_inspection", nameColumn: "equipment_name", clientIdColumn: "client_id", alertType: "certification", label: "Equipment Inspection" },
  { table: "transportation_fleet", dateColumn: "cdl_expiry", nameColumn: "vehicle_id", clientIdColumn: "client_id", alertType: "certification", label: "CDL Certificate" },
  { table: "transportation_fleet", dateColumn: "next_inspection", nameColumn: "vehicle_id", clientIdColumn: "client_id", alertType: "certification", label: "Vehicle Inspection" },
  { table: "hospitality_inspections", dateColumn: "next_inspection", nameColumn: "inspection_type", clientIdColumn: "client_id", alertType: "certification", label: "Health Inspection" },
  { table: "baa_agreements", dateColumn: "expiration_date", nameColumn: "associate_name", clientIdColumn: "client_id", alertType: "compliance", label: "BAA Agreement" },
  { table: "forklift_operators", dateColumn: "cert_expiry", nameColumn: "operator_name", clientIdColumn: "client_id", alertType: "certification", label: "Forklift Certification" },
]

export const certExpirationAlerting = inngest.createFunction(
  { id: "cert-expiration-alerting", triggers: [{ cron: "0 7 * * *" }] },
  async ({ step }) => {
    const supabase = createAdminClient()
    const now = new Date()
    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const today = now.toISOString().slice(0, 10)

    let totalAlerts = 0

    for (const check of CHECKS) {
      const alerts = await step.run(`check-${check.table}-${check.dateColumn}`, async () => {
        // Find items expiring within 30 days or already expired
        const { data: expiring } = await supabase
          .from(check.table)
          .select("*")
          .not(check.dateColumn, "is", null)
          .lte(check.dateColumn, in30Days)
          .order(check.dateColumn, { ascending: true })
          .limit(100)

        if (!expiring?.length) return 0

        let created = 0
        for (const row of expiring) {
          const r = row as unknown as Record<string, string>
          const clientId = r[check.clientIdColumn]
          const name = r[check.nameColumn] || "Unknown"
          const expiryDate = r[check.dateColumn]
          const isExpired = expiryDate < today

          const severity = isExpired ? "critical" : "high"
          const title = isExpired
            ? `${check.label} EXPIRED: ${name}`
            : `${check.label} expiring soon: ${name}`
          const message = isExpired
            ? `${check.label} for ${name} expired on ${expiryDate}. Immediate action required.`
            : `${check.label} for ${name} expires on ${expiryDate}. Renew before expiration to maintain compliance.`

          // Dedup: don't create if identical alert exists in last 7 days
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          const { data: existing } = await supabase
            .from("alerts")
            .select("id")
            .eq("client_id", clientId)
            .eq("title", title)
            .gte("created_at", weekAgo)
            .limit(1)

          if (existing?.length) continue

          await supabase.from("alerts").insert({
            client_id: clientId,
            type: check.alertType,
            title,
            message,
            severity,
            action_url: "/dashboard/alerts",
          })
          created++
        }
        return created
      })

      totalAlerts += alerts
    }

    return { success: true, alertsCreated: totalAlerts }
  }
)
