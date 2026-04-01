import { inngest } from "../client"
import { createAdminClient } from "@/lib/supabase/admin"

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

    // Step 2: Send welcome email
    await step.run("send-welcome-notification", async () => {
      // Resend integration — stub for now
      console.log(`[post-signup] Welcome email to ${email}`)
    })

    return { success: true, userId, email, status: "onboarded" }
  }
)
