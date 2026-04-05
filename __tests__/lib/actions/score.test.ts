import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock Supabase
const mockSingle = vi.fn()
const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    from: vi.fn((table: string) => ({
      insert: mockInsert,
    })),
  }),
}))

const validLead = {
  email: "lead@example.com",
  name: "Test Lead",
  phone: "555-0000",
  answers: {
    industry: "construction",
    employee_count: "10-49",
    location_count: "1",
    city: "Los Angeles",
    state: "CA",
    has_iipp: true,
    iipp_site_specific: false,
    has_incident_log: true,
    training_current: true,
    has_industry_programs: false,
    audit_ready: false,
  },
  result: {
    score: 50,
    tier: "yellow" as const,
    gaps: [{ key: "iipp_site_specific", label: "IIPP Site-Specific", description: "Not site-specific", citation_amount: 7000 }],
    fine_low: 5000,
    fine_high: 25000,
  },
  partner_ref: "partner-123",
  utm_source: "google",
  utm_medium: "cpc",
  utm_campaign: "compliance-q1",
}

describe("submitScore", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    mockSingle.mockResolvedValue({ data: { id: "score-id-1" }, error: null })
    mockSelect.mockReturnValue({ single: mockSingle })
    mockInsert.mockReturnValue({ select: mockSelect })
  })

  it("inserts into 'compliance_score_leads' table", async () => {
    const { createClient } = await import("@/lib/supabase/server")
    const { submitScore } = await import("@/lib/actions/score")

    await submitScore(validLead)

    const supabase = await (createClient as any)()
    expect(supabase.from).toHaveBeenCalledWith("compliance_score_leads")
  })

  it("returns { success: true, id } on success", async () => {
    const { submitScore } = await import("@/lib/actions/score")

    const result = await submitScore(validLead)

    expect(result).toEqual({ success: true, id: "score-id-1" })
  })

  it("returns { error } on database error", async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: "Insert failed" } })

    const { submitScore } = await import("@/lib/actions/score")

    const result = await submitScore(validLead)

    expect(result).toEqual({ error: "Insert failed" })
  })

  it("stores all score fields (score, score_tier, gaps, fine estimates)", async () => {
    const { submitScore } = await import("@/lib/actions/score")

    await submitScore(validLead)

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        score: 50,
        score_tier: "yellow",
        gaps: validLead.result.gaps,
        estimated_fine_low: 5000,
        estimated_fine_high: 25000,
      })
    )
  })

  it("stores UTM parameters", async () => {
    const { submitScore } = await import("@/lib/actions/score")

    await submitScore(validLead)

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        utm_source: "google",
        utm_medium: "cpc",
        utm_campaign: "compliance-q1",
        partner_ref: "partner-123",
      })
    )
  })
})
