import { inngest } from "../client"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendEmail, getSiteUrl } from "@/lib/resend"

export const reEngagement = inngest.createFunction(
  { id: "re-engagement", triggers: [{ cron: "0 9 * * *" }] },
  async ({ step }) => {
    const supabase = createAdminClient()
    const siteUrl = getSiteUrl()

    const inactive = await step.run("find-inactive-clients", async () => {
      const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

      // Clients who haven't logged in for 14+ days
      const { data: clients14 } = await supabase
        .from("clients")
        .select("id, email, business_name, last_login_at")
        .eq("status", "active")
        .not("last_login_at", "is", null)
        .lt("last_login_at", fourteenDaysAgo)
        .gte("last_login_at", thirtyDaysAgo)

      // Clients who haven't logged in for 30+ days
      const { data: clients30 } = await supabase
        .from("clients")
        .select("id, email, business_name, last_login_at")
        .eq("status", "active")
        .not("last_login_at", "is", null)
        .lt("last_login_at", thirtyDaysAgo)

      return {
        day14: clients14 || [],
        day30: clients30 || [],
      }
    })

    // Day 14: Dashboard has updates
    await step.run("send-day14-emails", async () => {
      for (const client of inactive.day14) {
        await sendEmail({
          to: client.email,
          subject: `${client.business_name} — Your compliance dashboard has updates`,
          html: `<p>Hi there,</p><p>Your AI Compliance Officer has been working while you were away. There may be new regulatory changes, document updates, or alerts waiting for your review.</p><p><a href="${siteUrl}/dashboard">Check your dashboard</a></p><p>— Protekon</p>`,
        })
      }
    })

    // Day 30: Action required
    await step.run("send-day30-emails", async () => {
      for (const client of inactive.day30) {
        await sendEmail({
          to: client.email,
          subject: `Action required — Regulatory changes affect ${client.business_name}`,
          html: `<p>Hi there,</p><p>It's been over 30 days since you last checked your compliance dashboard. During this time, California regulatory changes may have affected your business. Your compliance score may need updating.</p><p><a href="${siteUrl}/dashboard">Review now</a></p><p>— Protekon</p>`,
        })
      }
    })

    return {
      success: true,
      day14Sent: inactive.day14.length,
      day30Sent: inactive.day30.length,
    }
  }
)
