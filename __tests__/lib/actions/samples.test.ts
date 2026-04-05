import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock Supabase admin client (NOT createClient — samples uses createAdminClient)
const mockInsert = vi.fn()
const mockFrom = vi.fn((table: string) => ({
  insert: mockInsert,
}))

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: mockFrom,
  })),
}))

describe("submitSampleGate", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    mockInsert.mockResolvedValue({ data: null, error: null })
  })

  it("inserts into 'sample_report_leads' table", async () => {
    const { submitSampleGate } = await import("@/lib/actions/samples")

    const formData = new FormData()
    formData.set("email", "test@example.com")
    formData.set("companyName", "Acme")
    formData.set("vertical", "construction")

    await submitSampleGate(formData)

    expect(mockFrom).toHaveBeenCalledWith("sample_report_leads")
  })

  it("returns { success: true } on success", async () => {
    const { submitSampleGate } = await import("@/lib/actions/samples")

    const formData = new FormData()
    formData.set("email", "test@example.com")

    const result = await submitSampleGate(formData)

    expect(result).toEqual({ success: true })
  })

  it("returns { error } on database error", async () => {
    mockInsert.mockResolvedValue({ data: null, error: { message: "DB error" } })

    const { submitSampleGate } = await import("@/lib/actions/samples")

    const formData = new FormData()
    formData.set("email", "test@example.com")

    const result = await submitSampleGate(formData)

    expect(result).toEqual({ error: "Failed to submit. Please try again." })
  })

  it("extracts email, company_name, vertical from FormData", async () => {
    const { submitSampleGate } = await import("@/lib/actions/samples")

    const formData = new FormData()
    formData.set("email", "jane@corp.com")
    formData.set("companyName", "Corp Inc")
    formData.set("vertical", "healthcare")

    await submitSampleGate(formData)

    expect(mockInsert).toHaveBeenCalledWith({
      email: "jane@corp.com",
      company_name: "Corp Inc",
      vertical: "healthcare",
    })
  })
})
