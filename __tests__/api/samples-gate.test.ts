import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock Supabase admin client
const mockInsert = vi.fn()

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn((table: string) => ({
      insert: mockInsert,
    })),
  })),
}))

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/samples/gate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": "127.0.0.1",
    },
    body: JSON.stringify(body),
  })
}

describe("POST /api/samples/gate", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    mockInsert.mockResolvedValue({ data: null, error: null })
  })

  it("returns 200 with valid body", async () => {
    const { POST } = await import("@/app/api/samples/gate/route")
    const res = await POST(makeRequest({ email: "test@example.com", companyName: "Acme" }) as never)

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
  })

  it("returns 400 with missing email", async () => {
    const { POST } = await import("@/app/api/samples/gate/route")
    const res = await POST(makeRequest({ companyName: "Acme" }) as never)

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain("email")
  })

  it("validates email format", async () => {
    const { POST } = await import("@/app/api/samples/gate/route")
    const res = await POST(makeRequest({ email: "not-an-email" }) as never)

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain("email")
  })
})
