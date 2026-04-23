import { inngest } from "../client"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendEmail, getSiteUrl } from "@/lib/resend"
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

    // Step 3: Generate a magic login link so Stripe-path users (created via
    // admin.createUser with a random password) can log in the first time.
    // Self-serve signups can use their own password and ignore this link.
    // Undefined on failure — welcomeEmail() falls back to /dashboard.
    const loginUrl = await step.run("generate-login-link", async () => {
      try {
        const { data, error } = await supabase.auth.admin.generateLink({
          type: "magiclink",
          email,
          options: { redirectTo: `${getSiteUrl()}/dashboard` },
        })
        if (error) return undefined
        return data?.properties?.action_link ?? undefined
      } catch {
        return undefined
      }
    })

    // Step 4: Send welcome email with magic-link CTA
    await step.run("send-welcome-notification", async () => {
      await sendEmail({ to: email, ...welcomeEmail(email, loginUrl) })
    })

    return { success: true, userId, email, status: "onboarded" }
  }
)
