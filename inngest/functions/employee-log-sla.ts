import { inngest } from "../client"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendEmail, getComplianceOfficerEmail } from "@/lib/resend"

/**
 * SB 553 employee log request SLA tracker.
 *
 * On request creation: wait until 48h before the 15-day deadline, then email
 * the client a reminder if still pending. If the request is still pending at
 * the due_at timestamp, mark it expired and email both the client and the
 * requester (who should have been released to the employee by then).
 */
export const employeeLogSla = inngest.createFunction(
  { id: "employee-log-sla", triggers: [{ event: "compliance/employee-log.requested" }] },
  async ({ event, step }) => {
    const { requestId, clientId, dueAt } = event.data as {
      requestId: string
      clientId: string
      dueAt: string
    }

    const supabase = createAdminClient()

    const due = new Date(dueAt).getTime()
    const now = Date.now()
    const reminderAt = new Date(due - 48 * 60 * 60 * 1000)

    if (reminderAt.getTime() > now) {
      await step.sleepUntil("wait-for-reminder", reminderAt)
    }

    const { data: reminderCheck } = await supabase
      .from("employee_log_requests")
      .select("status, requester_name")
      .eq("id", requestId)
      .maybeSingle()

    if (reminderCheck && (reminderCheck.status === "pending" || reminderCheck.status === "processing")) {
      await step.run("send-reminder", async () => {
        const officerEmail = getComplianceOfficerEmail()
        if (!officerEmail) return
        await sendEmail({
          to: officerEmail,
          subject: "SB 553 log request — 48 hours to SLA deadline",
          html: `<p>You have 48 hours to release the workplace violence log packet requested by <strong>${reminderCheck.requester_name}</strong>.</p>
<p>Cal/OSHA requires release within 15 days of request under Labor Code §6401.9.</p>
<p><a href="${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/dashboard/incidents/log-requests">Open request</a></p>`,
        })
      })
    }

    await step.sleepUntil("wait-for-due", new Date(due))

    const { data: finalCheck } = await supabase
      .from("employee_log_requests")
      .select("status, requester_name, requester_email")
      .eq("id", requestId)
      .maybeSingle()

    if (finalCheck && (finalCheck.status === "pending" || finalCheck.status === "processing")) {
      await step.run("mark-expired", async () => {
        await supabase
          .from("employee_log_requests")
          .update({ status: "expired" })
          .eq("id", requestId)

        await supabase.from("audit_log").insert({
          client_id: clientId,
          event_type: "employee_log.expired",
          description: "Log request hit 15-day SLA without release",
          metadata: { request_id: requestId },
        })

        const officerEmail = getComplianceOfficerEmail()
        if (officerEmail) {
          await sendEmail({
            to: officerEmail,
            subject: "SB 553 log request — 15-day deadline passed",
            html: `<p>The workplace violence log request from <strong>${finalCheck.requester_name}</strong> has passed the Cal/OSHA 15-day deadline without release. This is a Labor Code §6401.9 violation risk.</p>
<p><a href="${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/dashboard/incidents/log-requests">Review requests</a></p>`,
          })
        }
      })
    }

    return { requestId, finalStatus: finalCheck?.status ?? "unknown" }
  }
)
