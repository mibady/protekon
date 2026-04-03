import Stripe from "stripe"

// Lazy-init to avoid crashing at import time during build (no env vars in CI/sandbox)
let _stripe: Stripe | null = null
export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set")
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-03-25.dahlia",
      typescript: true,
    })
  }
  return _stripe
}


// Map plan slugs to Stripe price IDs.
// Configure these in env vars after creating products in the Stripe dashboard.
export const PRICE_IDS: Record<string, string> = {
  core: process.env.STRIPE_PRICE_CORE || "",
  professional: process.env.STRIPE_PRICE_PROFESSIONAL || "",
  "multi-site": process.env.STRIPE_PRICE_MULTI_SITE || "",
}

export const SETUP_FEE_IDS: Record<string, string> = {
  core: process.env.STRIPE_SETUP_CORE || "",
  professional: process.env.STRIPE_SETUP_PROFESSIONAL || "",
  "multi-site": process.env.STRIPE_SETUP_MULTI_SITE || "",
}
