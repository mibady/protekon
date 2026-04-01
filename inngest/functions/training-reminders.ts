import { inngest } from "../client"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendEmail } from "@/lib/resend"
import { trainingOverdueEmail, trainingUpcomingEmail, trainingEscalationEmail } from "@/lib/email-templates"

export const trainingReminders = inngest.createFunction(
  { id: "training-reminders", triggers: [{ cron: "0 8 * * 1" }] },
  async ({ step }) => {
    const supabase = createAdminClient()

    // Step 1: Check training deadlines
    const deadlines = await step.run("check-training-deadlines", async () => {
      const now = new Date().toISOString().slice(0, 10)
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10)

      // Overdue training
      const { data: overdue } = await supabase
        .from("training_records")
        .select("*, clients(email, business_name)")
        .eq("status", "pending")
        .lt("due_date", now)

      // Upcoming training (within 7 days)
      const { data: upcoming } = await supabase
        .from("training_records")
        .select("*, clients(email, business_name)")
        .eq("status", "pending")
        .gte("due_date", now)
        .lte("due_date", nextWeek)

      return {
        overdue: overdue ?? [],
        upcoming: upcoming ?? [],
      }
    })

    // Step 2: Send overdue reminders
    await step.run("send-overdue-reminders", async () => {
      for (const record of deadlines.overdue) {
        const clientEmail = (record.clients as { email: string; business_name: string })?.email
        if (clientEmail) {
          await sendEmail({ to: clientEmail, ...trainingOverdueEmail(record.employee_name, record.training_type, record.due_date) })
        }
      }
    })

    // Step 3: Send upcoming notices
    await step.run("send-upcoming-notices", async () => {
      for (const record of deadlines.upcoming) {
        const clientEmail = (record.clients as { email: string; business_name: string })?.email
        if (clientEmail) {
          await sendEmail({ to: clientEmail, ...trainingUpcomingEmail(record.employee_name, record.training_type, record.due_date) })
        }
      }
    })

    // Step 4: Escalate severely overdue (2+ weeks)
    await step.run("escalate-overdue", async () => {
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10)

      const severelyOverdue = deadlines.overdue.filter(
        (r) => r.due_date < twoWeeksAgo
      )

      if (severelyOverdue.length > 0) {
        const officerEmail = process.env.COMPLIANCE_OFFICER_EMAIL || "compliance@protekon.com"
        await sendEmail({ to: officerEmail, ...trainingEscalationEmail(severelyOverdue.length) })
      }
    })

    return {
      success: true,
      overdue: deadlines.overdue.length,
      upcoming: deadlines.upcoming.length,
    }
  }
)
