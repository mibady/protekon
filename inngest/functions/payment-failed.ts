import { inngest } from "../client"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendEmail } from "@/lib/resend"
import { paymentWarning1Email, paymentWarning2Email, suspensionNoticeEmail } from "@/lib/email-templates"

export const paymentFailed = inngest.createFunction(
  { id: "payment-failed", triggers: [{ event: "billing/payment.failed" }] },
  async ({ event, step }) => {
    const { clientId, email, businessName, amount, invoiceId } = event.data as {
      clientId: string; email: string; businessName: string; amount: number; invoiceId: string
    }
    const supabase = createAdminClient()

    // Step 1: Send first warning (immediate)
    await step.run("send-first-warning", async () => {
      await sendEmail({ to: email, ...paymentWarning1Email(amount, invoiceId) })
    })

    // Step 2: Wait 3 days for payment
    const paymentReceived = await step.waitForEvent("wait-for-payment-3d", {
      event: "billing/payment.succeeded",
      match: "data.clientId",
      timeout: "3d",
    })

    if (paymentReceived) {
      return { success: true, resolved: "after-first-warning", invoiceId }
    }

    // Step 3: Send second (urgent) warning
    await step.run("send-second-warning", async () => {
      await sendEmail({ to: email, ...paymentWarning2Email(businessName) })
    })

    // Step 4: Wait 7 more days
    const latePayment = await step.waitForEvent("wait-for-payment-7d", {
      event: "billing/payment.succeeded",
      match: "data.clientId",
      timeout: "7d",
    })

    if (latePayment) {
      return { success: true, resolved: "after-second-warning", invoiceId }
    }

    // Step 5: Suspend account
    await step.run("suspend-account", async () => {
      await supabase
        .from("clients")
        .update({ status: "suspended" })
        .eq("id", clientId)

      await supabase.from("audit_log").insert({
        client_id: clientId,
        event_type: "billing.account_suspended",
        description: `Account suspended after 10-day non-payment window (invoice ${invoiceId})`,
        metadata: { invoiceId, amount },
      })
    })

    // Step 6: Send suspension notice
    await step.run("send-suspension-notice", async () => {
      await sendEmail({ to: email, ...suspensionNoticeEmail(businessName, invoiceId) })
    })

    return { success: false, suspended: true, invoiceId }
  }
)
