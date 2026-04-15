import { inngest } from "../client"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendEmail } from "@/lib/resend"
import { welcomeEmail } from "@/lib/email-templates"

export const postSignup = inngest.createFunction(
  { id: "post-signup-workflow", triggers: [{ event: "auth/user.signed-up" }] },
  async ({ event, step }) => {
    const { userId, email } = event.data as { userId: string; email: string }
    const supabase = createAdminClient()

    // Step 1: Ensure client record exists
    await step.run("ensure-client-record", async () => {
      const { error } = await supabase.from("clients").upsert(
        {
          id: userId,
          email,
          business_name: email.split("@")[0],
          vertical: "other",
        },
        { onConflict: "id" }
      )

      if (error) throw new Error(`Failed to upsert client: ${error.message}`)
    })

    // Step 2: Seed a year of compliance reminders for this client.
    // Safe to retry — fn_generate_client_reminders is idempotent per
    // (client_id, calendar_entry, due_date).
    await step.run("seed-client-reminders", async () => {
      const { error } = await supabase.rpc("fn_generate_client_reminders", {
        p_client_id: userId,
      })
      if (error) throw new Error(`fn_generate_client_reminders failed: ${error.message}`)
    })

    // Step 3: Send welcome email
    await step.run("send-welcome-notification", async () => {
      await sendEmail({ to: email, ...welcomeEmail(email) })
    })

    return { success: true, userId, email, status: "onboarded" }
  }
)
