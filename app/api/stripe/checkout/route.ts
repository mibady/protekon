import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getStripe, SETUP_FEE_IDS } from "@/lib/stripe"

const VALID_PLANS = ["core", "professional", "multi-site"]

export async function POST(request: NextRequest) {
  let body: {
    planId: string
    email?: string
    businessName?: string
    vertical?: string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { planId, email: bodyEmail, businessName, vertical } = body

  if (!VALID_PLANS.includes(planId)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
  }

  // Check if caller is authenticated (existing customer upgrading)
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  try {
    const stripe = getStripe()

    // Resolve price via lookup key
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

    // Resolve setup-fee line item
    let setupFeeLineItem: { price: string; quantity: number } | null = null
    const setupFeeId = SETUP_FEE_IDS[planId]
    if (setupFeeId) {
      try {
        const price = await stripe.prices.retrieve(setupFeeId)
        if (price && price.active && !(price as { deleted?: boolean }).deleted) {
          setupFeeLineItem = { price: setupFeeId, quantity: 1 }
        }
      } catch {
        setupFeeLineItem = null
      }
    }

    const origin = request.nextUrl.origin

    // ─── PATH A: Existing customer (upgrade from dashboard) ───
    if (user) {
      const { data: client } = await supabase
        .from("clients")
        .select("id, stripe_customer_id, email")
        .eq("id", user.id)
        .single()

      let customerId: string | undefined = client?.stripe_customer_id || undefined
      if (customerId) {
        try {
          const existing = await stripe.customers.retrieve(customerId)
          if ((existing as { deleted?: boolean }).deleted) customerId = undefined
        } catch {
          customerId = undefined
        }
        if (!customerId) {
          await supabase.from("clients").update({ stripe_customer_id: null }).eq("id", user.id)
        }
      }

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [
          { price: prices.data[0].id, quantity: 1 },
          ...(setupFeeLineItem ? [setupFeeLineItem] : []),
        ],
        success_url: `${origin}/dashboard?checkout=success`,
        cancel_url: `${origin}/pricing?checkout=cancelled`,
        customer: customerId,
        customer_email: customerId ? undefined : (client?.email ?? user.email),
        metadata: {
          userId: user.id,
          clientId: client?.id ?? "",
          planId,
          flow: "upgrade",
        },
      })

      return NextResponse.json({ url: session.url })
    }

    // ─── PATH B: New customer (signup from pricing page) ───
    if (!bodyEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bodyEmail)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        { price: prices.data[0].id, quantity: 1 },
        ...(setupFeeLineItem ? [setupFeeLineItem] : []),
      ],
      success_url: `${origin}/login?welcome=true`,
      cancel_url: `${origin}/pricing?checkout=cancelled`,
      customer_email: bodyEmail,
      metadata: {
        planId,
        flow: "new_signup",
        businessName: businessName || "",
        vertical: vertical || "other",
        email: bodyEmail,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create checkout session"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
