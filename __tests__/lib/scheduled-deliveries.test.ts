import { describe, it, expect, vi, beforeEach } from "vitest"

const mockUpsert = vi.fn().mockResolvedValue({ error: null })

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({ upsert: mockUpsert })),
  })),
}))

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) },
  }),
}))

describe("scheduled deliveries", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("createDefaultDeliveries — core plan creates monthly only", async () => {
    const { createDefaultDeliveries } = await import("@/lib/actions/scheduled-deliveries")
    await createDefaultDeliveries("client-123", "core")

    // Core = monthly-report only (1 call)
    expect(mockUpsert).toHaveBeenCalledTimes(1)
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ delivery_type: "monthly-report", frequency: "monthly" }),
      expect.any(Object)
    )
  })

  it("createDefaultDeliveries — professional plan creates 3 deliveries", async () => {
    const { createDefaultDeliveries } = await import("@/lib/actions/scheduled-deliveries")
    await createDefaultDeliveries("client-456", "professional")

    // Professional = weekly + monthly + quarterly (3 calls)
    expect(mockUpsert).toHaveBeenCalledTimes(3)

    const types = mockUpsert.mock.calls.map((c: unknown[]) => (c[0] as { delivery_type: string }).delivery_type)
    expect(types).toContain("weekly-summary")
    expect(types).toContain("monthly-report")
    expect(types).toContain("quarterly-review")
    expect(types).not.toContain("annual-audit")
  })

  it("createDefaultDeliveries — multi-site plan creates all 4 deliveries", async () => {
    const { createDefaultDeliveries } = await import("@/lib/actions/scheduled-deliveries")
    await createDefaultDeliveries("client-789", "multi-site")

    // Multi-Site = all 4 cadences
    expect(mockUpsert).toHaveBeenCalledTimes(4)

    const types = mockUpsert.mock.calls.map((c: unknown[]) => (c[0] as { delivery_type: string }).delivery_type)
    expect(types).toContain("weekly-summary")
    expect(types).toContain("monthly-report")
    expect(types).toContain("quarterly-review")
    expect(types).toContain("annual-audit")
  })

  it("createDefaultDeliveries — unknown plan defaults to core (monthly only)", async () => {
    const { createDefaultDeliveries } = await import("@/lib/actions/scheduled-deliveries")
    await createDefaultDeliveries("client-000")

    expect(mockUpsert).toHaveBeenCalledTimes(1)
  })
})
