import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock Supabase clients
const mockSupabaseUser = { id: "user-123", email: "test@co.com", user_metadata: { business_name: "Test Co", vertical: "construction", plan: "professional" } }
const mockInsert = vi.fn().mockResolvedValue({ error: null })
const mockUpdate = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
const mockSelect = vi.fn().mockReturnValue({
  eq: vi.fn().mockReturnValue({
    order: vi.fn().mockReturnValue({
      limit: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null })
      })
    })
  })
})

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockSupabaseUser }, error: null }) },
  }),
}))

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === "intake_submissions") return { insert: mockInsert }
      if (table === "clients") return { update: mockUpdate }
      if (table === "audit_log") return { insert: vi.fn().mockResolvedValue({ error: null }) }
      return { select: mockSelect }
    }),
  })),
}))

vi.mock("@/inngest/client", () => ({
  inngest: { send: vi.fn().mockResolvedValue(undefined) },
}))

describe("intake actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("submitIntake calculates score correctly — all yes = 100%", async () => {
    const { submitIntake } = await import("@/lib/actions/intake")
    const result = await submitIntake({
      wvpp_drafted: true,
      training_completed: true,
      incident_log_active: true,
      hazards_identified: true,
      reporting_policy: true,
      union_confirmed: true,
    })

    expect(result.success).toBe(true)
    expect(result.score).toBe(100)
    expect(result.riskLevel).toBe("low")
  })

  it("submitIntake calculates score correctly — all no = 0%", async () => {
    const { submitIntake } = await import("@/lib/actions/intake")
    const result = await submitIntake({
      wvpp_drafted: false,
      training_completed: false,
      incident_log_active: false,
      hazards_identified: false,
      reporting_policy: false,
      union_confirmed: false,
    })

    expect(result.success).toBe(true)
    expect(result.score).toBe(0)
    expect(result.riskLevel).toBe("high")
  })

  it("submitIntake calculates score correctly — 4/6 = 67% medium", async () => {
    const { submitIntake } = await import("@/lib/actions/intake")
    const result = await submitIntake({
      wvpp_drafted: true,
      training_completed: true,
      incident_log_active: true,
      hazards_identified: true,
      reporting_policy: false,
      union_confirmed: false,
    })

    expect(result.success).toBe(true)
    expect(result.score).toBe(67)
    expect(result.riskLevel).toBe("medium")
  })

  it("submitIntake fires Inngest event", async () => {
    const { inngest } = await import("@/inngest/client")
    const { submitIntake } = await import("@/lib/actions/intake")

    await submitIntake({
      wvpp_drafted: true,
      training_completed: false,
      incident_log_active: true,
      hazards_identified: false,
      reporting_policy: true,
      union_confirmed: false,
    })

    expect(inngest.send).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "compliance/intake.submitted",
        data: expect.objectContaining({
          email: "test@co.com",
          businessName: "Test Co",
          vertical: "construction",
        }),
      })
    )
  })
})
