import { inngest } from "../client"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendEmail, getSiteUrl } from "@/lib/resend"

export const sampleNurtureDrip = inngest.createFunction(
  { id: "sample-nurture-drip", triggers: [{ event: "sample/report.downloaded" }] },
  async ({ event, step }) => {
    const { email, name, vertical } = event.data as {
      email: string; name: string; vertical: string
    }
    const supabase = createAdminClient()
    const siteUrl = getSiteUrl()

    // Day 1: What a real compliance report looks like
    await step.sleep("wait-day-1", "1d")
    await step.run("send-day-1", async () => {
      // Check if already converted
      const { data: lead } = await supabase
        .from("sample_report_leads")
        .select("converted_to_intake")
        .eq("email", email)
        .single()
      if (lead?.converted_to_intake) return

      await sendEmail({
        to: email,
        subject: "Here's what a real compliance report looks like",
        html: `<p>Hi ${name || "there"},</p><p>You downloaded a sample ${vertical || "compliance"} report from Protekon. That sample is a template — a real report is customized to your business, your location, and your specific regulatory exposure.</p><p>Here's the difference:</p><ul><li><strong>Sample:</strong> Generic checklist, placeholder data</li><li><strong>Real report:</strong> Your NAICS code, your Cal/OSHA citation risk, your penalty exposure based on 435,000+ violation records</li></ul><p><a href="${siteUrl}/score">Get your free compliance score</a> — no credit card required.</p><p>— Protekon</p>`,
      })
    })

    // Day 5: Your industry's enforcement profile
    await step.sleep("wait-day-5", "4d")
    await step.run("send-day-5", async () => {
      const { data: lead } = await supabase
        .from("sample_report_leads")
        .select("converted_to_intake")
        .eq("email", email)
        .single()
      if (lead?.converted_to_intake) return

      await sendEmail({
        to: email,
        subject: `Your ${vertical || "industry"}'s Cal/OSHA enforcement profile`,
        html: `<p>Hi ${name || "there"},</p><p>Did you know that California ${vertical || "businesses"} face an average penalty of $3,000+ per violation? The top 5 most-cited standards in your industry account for over 60% of all penalties.</p><p>Your AI Compliance Officer can tell you exactly which standards affect your business and what to do about them.</p><p><a href="${siteUrl}/score">See your risk profile</a></p><p>— Protekon</p>`,
      })
    })

    // Day 14: Limited time offer
    await step.sleep("wait-day-14", "9d")
    await step.run("send-day-14", async () => {
      const { data: lead } = await supabase
        .from("sample_report_leads")
        .select("converted_to_intake")
        .eq("email", email)
        .single()
      if (lead?.converted_to_intake) return

      await sendEmail({
        to: email,
        subject: "Free compliance score + consultation",
        html: `<p>Hi ${name || "there"},</p><p>Two weeks ago you downloaded a compliance sample. Since then, Cal/OSHA has continued issuing citations in your area.</p><p>We're offering a free compliance score assessment plus a 15-minute consultation to review your results. No obligation.</p><p><a href="${siteUrl}/score">Get your free score</a></p><p>Or reply to this email to schedule a call.</p><p>— Protekon</p>`,
      })
    })

    return { success: true, email }
  }
)
