import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getStripe, PRICE_IDS, SETUP_FEE_IDS } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { planId } = (await request.json()) as { planId: string }
  const priceId = PRICE_IDS[planId]

  if (priceId === undefined) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
  }
  if (!priceId) {
    return NextResponse.json(
      { error: "Stripe is not configured for this plan yet. Please contact support." },
      { status: 400 }
    )
  }

  // Look up existing stripe_customer_id
  const { data: client } = await supabase
    .from("clients")
    .select("id, stripe_customer_id, email")
    .eq("user_id", user.id)
    .single()

  const origin = request.nextUrl.origin

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [
      { price: priceId, quantity: 1 },
      // Add one-time setup fee if configured
      ...(SETUP_FEE_IDS[planId] ? [{ price: SETUP_FEE_IDS[planId], quantity: 1 }] : []),
    ],
    success_url: `${origin}/dashboard?checkout=success`,
    cancel_url: `${origin}/pricing?checkout=cancelled`,
    customer: client?.stripe_customer_id || undefined,
    customer_email: client?.stripe_customer_id ? undefined : (client?.email ?? user.email),
    metadata: {
      userId: user.id,
      clientId: client?.id ?? "",
      planId,
    },
  })

  return NextResponse.json({ url: session.url })
}
