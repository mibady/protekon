import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getStripe, SETUP_FEE_IDS } from "@/lib/stripe"

const VALID_PLANS = ["core", "professional", "multi-site"]

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let planId: string
  try {
    const body = await request.json()
    planId = body.planId
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (!VALID_PLANS.includes(planId)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
  }

  try {
    const stripe = getStripe()

    // Resolve price via lookup key — works in both test and live mode
    const prices = await stripe.prices.list({
      lookup_keys: [`protekon_${planId}_monthly`],
      limit: 1,
    })

    if (!prices.data.length) {
      return NextResponse.json(
        { error: "Stripe is not configured for this plan yet. Please contact support." },
        { status: 400 }
      )
    }

    // Look up existing stripe_customer_id
    const { data: client } = await supabase
      .from("clients")
      .select("id, stripe_customer_id, email")
      .eq("id", user.id)
      .single()

    const origin = request.nextUrl.origin

    // If the row has a stripe_customer_id, verify it still exists in Stripe.
    // Dev DBs often carry stale ids from deleted test customers — treating
    // them as valid makes Checkout fail with "No such customer".
    let customerId: string | undefined = client?.stripe_customer_id || undefined
    if (customerId) {
      try {
        const existing = await stripe.customers.retrieve(customerId)
        if ((existing as { deleted?: boolean }).deleted) customerId = undefined
      } catch {
        customerId = undefined
      }

      if (!customerId) {
        // Clear the stale id so future requests don't pay this round-trip.
        await supabase.from("clients").update({ stripe_customer_id: null }).eq("id", user.id)
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        { price: prices.data[0].id, quantity: 1 },
        // Add one-time setup fee if configured
        ...(SETUP_FEE_IDS[planId] ? [{ price: SETUP_FEE_IDS[planId], quantity: 1 }] : []),
      ],
      success_url: `${origin}/dashboard?checkout=success`,
      cancel_url: `${origin}/pricing?checkout=cancelled`,
      customer: customerId,
      customer_email: customerId ? undefined : (client?.email ?? user.email),
      metadata: {
        userId: user.id,
        clientId: client?.id ?? "",
        planId,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create checkout session"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
