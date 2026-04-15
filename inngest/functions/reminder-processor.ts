import { inngest } from "../client"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * Nightly reminder processor.
 *
 * Calls fn_process_due_reminders() which finds client_reminders hitting
 * their 30d / 14d / 7d / day-of notification windows and creates alerts.
 */
export const reminderProcessor = inngest.createFunction(
  { id: "reminder-processor", triggers: [{ cron: "30 5 * * *" }] },
  async ({ step }) => {
    const supabase = createAdminClient()

    const result = await step.run("process-due-reminders", async () => {
      const { data, error } = await supabase.rpc("fn_process_due_reminders")
      if (error) throw new Error(`fn_process_due_reminders failed: ${error.message}`)
      return data
    })

    return { success: true, result }
  }
)
