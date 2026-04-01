import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
  typescript: true,
})

// Map plan slugs to Stripe price IDs.
// Configure these in env vars after creating products in the Stripe dashboard.
export const PRICE_IDS: Record<string, string> = {
  starter: process.env.STRIPE_PRICE_STARTER || "",
  professional: process.env.STRIPE_PRICE_PROFESSIONAL || "",
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE || "",
}
