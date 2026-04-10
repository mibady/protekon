import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock submitScore action
const mockSubmitScore = vi.fn()
const mockSaveAnonymousScore = vi.fn()
const mockCaptureScoreEmail = vi.fn()
vi.mock("@/lib/actions/score", () => ({
  submitScore: (...args: unknown[]) => mockSubmitScore(...args),
  saveAnonymousScore: (...args: unknown[]) => mockSaveAnonymousScore(...args),
  captureScoreEmail: (...args: unknown[]) => mockCaptureScoreEmail(...args),
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

// Mock Supabase for capture phase
const mockSupabaseSingle = vi.fn()
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: mockSupabaseSingle,
        })),
      })),
    })),
  }),
}))

const validBody = {
  email: "test@example.com",
  name: "Test User",
  phone: "555-1234",
  answers: {
    industry: "construction",
    employee_count: "10-25",
    has_wvpp: true,
    wvpp_site_specific: false,
    has_incident_log: true,
    pii_stripped: true,
    training_current: true,
    audit_ready: false,
  },
  utm_source: "google",
  utm_medium: "cpc",
  utm_campaign: "q1",
}

const mockScoreResult = {
  score: 4,
  tier: "yellow",
  gaps: [
    { key: "wvpp_site_specific", label: "WVPP Not Site-Specific", description: "Not site-specific", citation: "Cal. Labor Code §6401.9(b)(1)", fine: 25000, citation_amount: 25000 },
    { key: "audit_ready", label: "Can't Produce Audit Package", description: "Not audit-ready", citation: "Cal. Labor Code §6401.9(a)", fine: 25000, citation_amount: 25000 },
  ],
  fine_low: 35000,
  fine_high: 65000,
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
    mockSaveAnonymousScore.mockResolvedValue({ success: true, id: "lead-id-anon" })
    mockCaptureScoreEmail.mockResolvedValue({ success: true })
    mockSend.mockResolvedValue(undefined)
    mockSupabaseSingle.mockResolvedValue({
      data: {
        score: 4,
        score_tier: "yellow",
        gaps: mockScoreResult.gaps,
        industry: "construction",
        estimated_fine_low: 35000,
        estimated_fine_high: 65000,
        partner_ref: null,
      },
      error: null,
    })
  })

  it("returns 200 with valid legacy body", async () => {
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

  it("returns 400 with missing email on legacy path", async () => {
    const { POST } = await import("@/app/api/score/submit/route")
    const { email, ...bodyWithoutEmail } = validBody
    const res = await POST(makeRequest(bodyWithoutEmail) as never)

    expect(res.status).toBe(400)
  })

  it("calls submitScore on legacy path", async () => {
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

  it("fires Inngest 'score/lead.created' event on legacy path", async () => {
    const { POST } = await import("@/app/api/score/submit/route")
    await POST(makeRequest(validBody) as never)

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "score/lead.created",
        data: expect.objectContaining({
          lead_id: "lead-id-1",
          email: "test@example.com",
          score: 4,
          score_tier: "yellow",
        }),
      })
    )
  })

  it("returns score calculation result on legacy path", async () => {
    const { POST } = await import("@/app/api/score/submit/route")
    const res = await POST(makeRequest(validBody) as never)
    const json = await res.json()

    expect(json.result).toEqual(mockScoreResult)
  })

  it("handles anonymous phase submit", async () => {
    const { POST } = await import("@/app/api/score/submit/route")
    const res = await POST(
      makeRequest({
        phase: "anonymous",
        answers: validBody.answers,
        utm_source: "google",
      }) as never
    )
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.id).toBe("lead-id-anon")
    expect(mockSaveAnonymousScore).toHaveBeenCalled()
  })

  it("handles capture phase submit", async () => {
    const { POST } = await import("@/app/api/score/submit/route")
    const res = await POST(
      makeRequest({
        phase: "capture",
        lead_id: "550e8400-e29b-41d4-a716-446655440000",
        email: "captured@example.com",
        business_name: "Test Biz",
      }) as never
    )
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(mockCaptureScoreEmail).toHaveBeenCalledWith({
      lead_id: "550e8400-e29b-41d4-a716-446655440000",
      email: "captured@example.com",
      business_name: "Test Biz",
    })
  })
})
