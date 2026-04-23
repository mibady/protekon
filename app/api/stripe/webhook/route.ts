import { NextRequest, NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/admin"
import { inngest } from "@/inngest/client"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET is not configured")
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 })
  }

  let event
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      webhookSecret
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
      const meta = session.metadata ?? {}
      const planId = meta.planId ?? "core"
      const flow = meta.flow ?? "upgrade"

      // ─── PATH A: Existing customer upgrade ───
      if (flow === "upgrade" && meta.clientId) {
        await supabase
          .from("clients")
          .update({
            stripe_customer_id: session.customer as string,
            plan: planId,
            status: "active",
          })
          .eq("id", meta.clientId)

        await supabase.from("audit_log").insert({
          client_id: meta.clientId,
          event_type: "billing.checkout_completed",
          description: `Subscribed to ${planId} plan via Stripe Checkout`,
          metadata: {
            stripeCustomerId: session.customer,
            subscriptionId: session.subscription,
            userId: meta.userId,
          },
        })
        break
      }

      // ─── PATH B: New customer — create account ───
      if (flow === "new_signup") {
        const email = meta.email || (session.customer_email as string)
        const businessName = meta.businessName || email.split("@")[0]
        const vertical = meta.vertical || "other"

        if (!email) {
          console.error("[stripe-webhook] new_signup: no email in metadata or session")
          break
        }

        // Generate a secure temporary password (Web Crypto API — no import needed)
        const tempPassword = Buffer.from(
          globalThis.crypto.getRandomValues(new Uint8Array(16))
        ).toString("base64url")

        // Create Supabase auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            business_name: businessName,
            vertical,
            plan: planId,
          },
        })

        if (authError) {
          console.error("[stripe-webhook] Failed to create auth user:", authError.message)
          // If user already exists (e.g. they had an old account), just update the client row
          const { data: existingUser } = await supabase.auth.admin.listUsers()
          const found = existingUser?.users?.find((u) => u.email === email)
          if (found) {
            await supabase.from("clients").upsert({
              id: found.id,
              email,
              business_name: businessName,
              vertical,
              plan: planId,
              stripe_customer_id: session.customer as string,
              compliance_score: 0,
              risk_level: "high",
              status: "active",
            }, { onConflict: "id" })
          }
          break
        }

        const userId = authData.user.id

        // Create client record
        await supabase.from("clients").upsert({
          id: userId,
          email,
          business_name: businessName,
          vertical,
          plan: planId,
          stripe_customer_id: session.customer as string,
          compliance_score: 0,
          risk_level: "high",
          status: "active",
        }, { onConflict: "id" })

        // Audit log
        await supabase.from("audit_log").insert({
          client_id: userId,
          event_type: "billing.new_signup",
          description: `New ${planId} subscription via Stripe Checkout`,
          metadata: {
            stripeCustomerId: session.customer,
            subscriptionId: session.subscription,
          },
        })

        // Fire the post-signup durable workflow (welcome email + reminder seeding).
        // The Inngest handler owns welcome email delivery for this path.
        await inngest.send({
          name: "auth/user.signed-up",
          data: { userId, email },
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
