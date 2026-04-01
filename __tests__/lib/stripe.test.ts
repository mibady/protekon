import { describe, it, expect, vi } from "vitest"

describe("Stripe configuration", () => {
  it("PRICE_IDS maps all 3 plan slugs", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_fake")
    vi.stubEnv("STRIPE_PRICE_STARTER", "price_starter_123")
    vi.stubEnv("STRIPE_PRICE_PROFESSIONAL", "price_pro_456")
    vi.stubEnv("STRIPE_PRICE_ENTERPRISE", "price_ent_789")

    // Dynamic import to pick up stubbed env
    const { PRICE_IDS } = await import("@/lib/stripe")

    expect(PRICE_IDS).toHaveProperty("starter")
    expect(PRICE_IDS).toHaveProperty("professional")
    expect(PRICE_IDS).toHaveProperty("enterprise")
  })

  it("rejects unknown plan slugs", async () => {
    const { PRICE_IDS } = await import("@/lib/stripe")
    expect(PRICE_IDS["nonexistent"]).toBeUndefined()
  })
})
