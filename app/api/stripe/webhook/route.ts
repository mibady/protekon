import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/admin"
import { inngest } from "@/inngest/client"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error(`[stripe-webhook] Signature verification failed: ${message}`)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = createAdminClient()

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object
      const { userId, clientId, planId } = session.metadata ?? {}

      if (clientId) {
        await supabase
          .from("clients")
          .update({
            stripe_customer_id: session.customer as string,
            plan: planId ?? "core",
            status: "active",
          })
          .eq("id", clientId)

        await supabase.from("audit_log").insert({
          client_id: clientId,
          event_type: "billing.checkout_completed",
          description: `Subscribed to ${planId} plan via Stripe Checkout`,
          metadata: {
            stripeCustomerId: session.customer,
            subscriptionId: session.subscription,
            userId,
          },
        })
      }
      break
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object
      const customerId = invoice.customer as string

      const { data: client } = await supabase
        .from("clients")
        .select("id, email, business_name")
        .eq("stripe_customer_id", customerId)
        .single()

      if (client) {
        await inngest.send({
          name: "billing/payment.failed",
          data: {
            clientId: client.id,
            email: client.email,
            businessName: client.business_name,
            amount: (invoice.amount_due ?? 0) / 100,
            invoiceId: invoice.id,
          },
        })
      }
      break
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object
      const customerId = invoice.customer as string

      const { data: client } = await supabase
        .from("clients")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single()

      if (client) {
        await inngest.send({
          name: "billing/payment.succeeded",
          data: { clientId: client.id, invoiceId: invoice.id },
        })
      }
      break
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object
      const customerId = subscription.customer as string
      const status = subscription.status === "active" ? "active" : "inactive"

      await supabase
        .from("clients")
        .update({ status })
        .eq("stripe_customer_id", customerId)
      break
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object
      const customerId = subscription.customer as string

      const { data: client } = await supabase
        .from("clients")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single()

      if (client) {
        await supabase
          .from("clients")
          .update({ status: "churned" })
          .eq("stripe_customer_id", customerId)

        await supabase.from("audit_log").insert({
          client_id: client.id,
          event_type: "billing.subscription_cancelled",
          description: "Subscription cancelled — status set to churned",
          metadata: { subscriptionId: subscription.id },
        })
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
