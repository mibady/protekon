import { inngest } from "../client"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * Nightly COI expiration scanner.
 *
 * Calls fn_scan_coi_expirations() which generates 60-day, 30-day, and
 * expired alerts for active Certificates of Insurance, flipping the
 * per-COI alert_*_sent flags so each threshold fires exactly once.
 */
export const coiExpirationScanner = inngest.createFunction(
  { id: "coi-expiration-scanner", triggers: [{ cron: "15 5 * * *" }] },
  async ({ step }) => {
    const supabase = createAdminClient()

    const result = await step.run("scan-coi-expirations", async () => {
      const { data, error } = await supabase.rpc("fn_scan_coi_expirations")
      if (error) throw new Error(`fn_scan_coi_expirations failed: ${error.message}`)
      return data
    })

    return { success: true, result }
  }
)
