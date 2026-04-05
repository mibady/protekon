import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock Supabase
const mockGetUser = vi.fn()
const mockSingle = vi.fn()
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: () => mockGetUser() },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: () => mockSingle(),
        })),
      })),
    })),
  }),
}))

const mockUser = { id: "user-1", email: "test@example.com" }

function makeRequest(): Request {
  return new Request("http://localhost/api/compliance/score", { method: "GET" })
}

describe("GET /api/compliance/score", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })
  })

  it("returns 401 when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null })

    const { GET } = await import("@/app/api/compliance/score/route")
    const res = await GET()

    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error).toBe("Unauthorized")
  })

  it("returns { score, riskLevel } from clients table", async () => {
    mockSingle.mockResolvedValueOnce({
      data: { compliance_score: 85, risk_level: "low" },
      error: null,
    })

    const { GET } = await import("@/app/api/compliance/score/route")
    const res = await GET()

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.score).toBe(85)
    expect(json.riskLevel).toBe("low")
  })

  it("handles missing client gracefully with 404", async () => {
    mockSingle.mockResolvedValueOnce({
      data: null,
      error: { message: "No rows found" },
    })

    const { GET } = await import("@/app/api/compliance/score/route")
    const res = await GET()

    expect(res.status).toBe(404)
    const json = await res.json()
    expect(json.error).toBe("Client not found")
  })
})
