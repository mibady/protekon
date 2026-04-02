import { describe, it, expect, vi } from "vitest"

describe("Stripe configuration", () => {
  it("PRICE_IDS maps all 3 plan slugs", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_fake")
    vi.stubEnv("STRIPE_PRICE_CORE", "price_core_123")
    vi.stubEnv("STRIPE_PRICE_PROFESSIONAL", "price_pro_456")
    vi.stubEnv("STRIPE_PRICE_MULTI_SITE", "price_ms_789")

    // Dynamic import to pick up stubbed env
    const { PRICE_IDS } = await import("@/lib/stripe")

    expect(PRICE_IDS).toHaveProperty("core")
    expect(PRICE_IDS).toHaveProperty("professional")
    expect(PRICE_IDS).toHaveProperty("multi-site")
  })

  it("rejects unknown plan slugs", async () => {
    const { PRICE_IDS } = await import("@/lib/stripe")
    expect(PRICE_IDS["nonexistent"]).toBeUndefined()
  })
})
