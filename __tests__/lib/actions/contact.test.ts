import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock next/headers
vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue("127.0.0.1"),
  }),
}))

// Mock rate-limit
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockReturnValue({ limited: false }),
}))

// Mock Supabase
const mockInsert = vi.fn()

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    from: vi.fn((table: string) => ({
      insert: mockInsert,
    })),
  }),
}))

describe("submitContact", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    mockInsert.mockResolvedValue({ data: null, error: null })
  })

  it("inserts into 'contact_submissions' table", async () => {
    const { createClient } = await import("@/lib/supabase/server")
    const { submitContact } = await import("@/lib/actions/contact")

    await submitContact({
      name: "John Doe",
      email: "john@example.com",
      company: "Acme",
      phone: "555-1234",
      subject: "General Inquiry",
      message: "Hello there",
    })

    const supabase = await (createClient as any)()
    expect(supabase.from).toHaveBeenCalledWith("contact_submissions")
  })

  it("returns { success: true } on success", async () => {
    const { submitContact } = await import("@/lib/actions/contact")

    const result = await submitContact({
      name: "John Doe",
      email: "john@example.com",
      subject: "Question",
      message: "Test message",
    })

    expect(result).toEqual({ success: true })
  })

  it("returns { error } on database error", async () => {
    mockInsert.mockResolvedValue({ data: null, error: { message: "DB connection failed" } })

    const { submitContact } = await import("@/lib/actions/contact")

    const result = await submitContact({
      name: "John Doe",
      email: "john@example.com",
      subject: "Question",
      message: "Test message",
    })

    expect(result).toEqual({ error: "DB connection failed" })
  })

  it("passes all fields correctly", async () => {
    const { submitContact } = await import("@/lib/actions/contact")

    await submitContact({
      name: "Jane Smith",
      email: "jane@acme.com",
      company: "Acme Corp",
      phone: "555-9876",
      subject: "Partnership",
      message: "Interested in your services",
    })

    expect(mockInsert).toHaveBeenCalledWith({
      name: "Jane Smith",
      email: "jane@acme.com",
      company: "Acme Corp",
      phone: "555-9876",
      subject: "Partnership",
      message: "Interested in your services",
    })
  })
})
