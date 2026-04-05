import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock submitScore action
const mockSubmitScore = vi.fn()
vi.mock("@/lib/actions/score", () => ({
  submitScore: (...args: unknown[]) => mockSubmitScore(...args),
}))

// Mock calculateScore
const mockCalculateScore = vi.fn()
vi.mock("@/lib/score-calculator", () => ({
  calculateScore: (...args: unknown[]) => mockCalculateScore(...args),
}))

// Mock Inngest
const mockSend = vi.fn().mockResolvedValue(undefined)
vi.mock("@/inngest/client", () => ({
  inngest: { send: mockSend },
}))

const validBody = {
  email: "test@example.com",
  name: "Test User",
  phone: "555-1234",
  answers: {
    industry: "construction",
    employee_count: "10-49",
    location_count: "1",
    city: "LA",
    state: "CA",
    has_iipp: true,
    iipp_site_specific: false,
    has_incident_log: true,
    training_current: true,
    has_industry_programs: false,
    audit_ready: false,
  },
  utm_source: "google",
  utm_medium: "cpc",
  utm_campaign: "q1",
}

const mockScoreResult = {
  score: 50,
  tier: "moderate",
  gaps: [{ key: "iipp", label: "IIPP", description: "Missing" }],
  fine_low: 5000,
  fine_high: 25000,
}

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/score/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("POST /api/score/submit", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    mockCalculateScore.mockReturnValue(mockScoreResult)
    mockSubmitScore.mockResolvedValue({ success: true, id: "lead-id-1" })
    mockSend.mockResolvedValue(undefined)
  })

  it("returns 200 with valid body", async () => {
    const { POST } = await import("@/app/api/score/submit/route")
    const res = await POST(makeRequest(validBody) as never)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.id).toBe("lead-id-1")
  })

  it("returns 400 with invalid body (Zod validation)", async () => {
    const { POST } = await import("@/app/api/score/submit/route")
    const res = await POST(makeRequest({ email: "not-an-email" }) as never)

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe("Validation failed")
  })

  it("returns 400 with missing email", async () => {
    const { POST } = await import("@/app/api/score/submit/route")
    const { email, ...bodyWithoutEmail } = validBody
    const res = await POST(makeRequest(bodyWithoutEmail) as never)

    expect(res.status).toBe(400)
  })

  it("calls submitScore action", async () => {
    const { POST } = await import("@/app/api/score/submit/route")
    await POST(makeRequest(validBody) as never)

    expect(mockSubmitScore).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "test@example.com",
        name: "Test User",
        answers: expect.objectContaining({ industry: "construction" }),
        result: mockScoreResult,
      })
    )
  })

  it("fires Inngest 'score/lead.created' event", async () => {
    const { POST } = await import("@/app/api/score/submit/route")
    await POST(makeRequest(validBody) as never)

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "score/lead.created",
        data: expect.objectContaining({
          lead_id: "lead-id-1",
          email: "test@example.com",
          score: 50,
          score_tier: "moderate",
        }),
      })
    )
  })

  it("returns score calculation result", async () => {
    const { POST } = await import("@/app/api/score/submit/route")
    const res = await POST(makeRequest(validBody) as never)
    const json = await res.json()

    expect(json.result).toEqual(mockScoreResult)
  })
})
