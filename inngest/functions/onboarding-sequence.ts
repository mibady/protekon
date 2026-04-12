import { inngest } from "../client"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendEmail, getSiteUrl } from "@/lib/resend"

export const onboardingSequence = inngest.createFunction(
  { id: "onboarding-sequence", triggers: [{ event: "auth/user.signed-up" }] },
  async ({ event, step }) => {
    const { email, businessName, plan } = event.data as {
      email: string; businessName: string; plan: string
    }
    const supabase = createAdminClient()
    const siteUrl = getSiteUrl()

    // Day 0: Welcome (already sent by post-signup — skip)

    // Day 2: Complete your profile
    await step.sleep("wait-day-2", "2d")
    await step.run("send-day-2", async () => {
      const { data: client } = await supabase
        .from("clients")
        .select("compliance_score")
        .eq("email", email)
        .single()
      if (client?.compliance_score && client.compliance_score > 0) return // Already active

      await sendEmail({
        to: email,
        subject: `${businessName} — Complete your compliance profile`,
        html: `<p>Hi there,</p><p>Your Protekon account is set up, but your compliance profile is incomplete. Complete it now to get your first compliance documents generated automatically.</p><p><a href="${siteUrl}/dashboard/settings">Complete your profile</a></p><p>— Your AI Compliance Officer</p>`,
      })
    })

    // Day 7: First compliance document
    await step.sleep("wait-day-7", "5d")
    await step.run("send-day-7", async () => {
      const { count } = await supabase
        .from("documents")
        .select("*", { count: "exact", head: true })
        .eq("client_id", (await supabase.from("clients").select("id").eq("email", email).single()).data?.id || "")

      await sendEmail({
        to: email,
        subject: `Your first compliance document is ready`,
        html: `<p>Hi there,</p><p>${(count ?? 0) > 0 ? `You have ${count} compliance document${count === 1 ? "" : "s"} ready in your dashboard.` : "Your AI Compliance Officer has generated your first compliance documents."} Review them now to ensure your business is protected.</p><p><a href="${siteUrl}/dashboard/documents">View documents</a></p><p>— Protekon</p>`,
      })
    })

    // Day 10: Compliance score intro
    await step.sleep("wait-day-10", "3d")
    await step.run("send-day-10", async () => {
      await sendEmail({
        to: email,
        subject: `What's your compliance score?`,
        html: `<p>Hi there,</p><p>Every California employer has a compliance risk profile. We've calculated yours based on your intake assessment and industry data from 435,000+ Cal/OSHA violations.</p><p><a href="${siteUrl}/dashboard">View your compliance score</a></p><p>— Protekon</p>`,
      })
    })

    // Day 14: Schedule review
    await step.sleep("wait-day-14", "4d")
    await step.run("send-day-14", async () => {
      await sendEmail({
        to: email,
        subject: `Schedule your first compliance review`,
        html: `<p>Hi there,</p><p>You've been on Protekon for two weeks. It's a good time to schedule your first compliance review to make sure everything is on track.</p><p><a href="${siteUrl}/contact">Schedule a review</a></p><p>— Protekon</p>`,
      })
    })

    return { success: true, email }
  }
)
