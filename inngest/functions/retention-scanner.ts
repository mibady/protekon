import { inngest } from "../client"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * Nightly retention-status scanner.
 *
 * Calls fn_update_retention_statuses() which flips documents to
 * expiring_soon (within 90 days of retention expiry) or expired.
 * v_retention_alerts surfaces the results to the dashboard.
 */
export const retentionScanner = inngest.createFunction(
  { id: "retention-scanner", triggers: [{ cron: "0 5 * * *" }] },
  async ({ step }) => {
    const supabase = createAdminClient()

    const result = await step.run("update-retention-statuses", async () => {
      const { data, error } = await supabase.rpc("fn_update_retention_statuses")
      if (error) throw new Error(`fn_update_retention_statuses failed: ${error.message}`)
      return data
    })

    return { success: true, result }
  }
)
