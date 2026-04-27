import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock Supabase
const mockSingle = vi.fn()
const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
const mockUpdateEq = vi.fn()
const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq })

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    from: vi.fn(() => ({
      insert: mockInsert,
      update: mockUpdate,
    })),
  }),
}))

const validLead = {
  email: "lead@example.com",
  name: "Test Lead",
  phone: "555-0000",
  answers: {
    industry: "construction",
    employee_count: "10-25",
    has_wvpp: true,
    wvpp_site_specific: false,
    has_incident_log: true,
    pii_stripped: true,
    training_current: true,
    audit_ready: false,
    has_iipp: true,
    iipp_current: true,
    has_eap: true,
    has_hazcom: true,
    osha_300_current: true,
  },
  result: {
    score: 9,
    max_score: 11,
    tier: "yellow" as const,
    gaps: [
      { key: "wvpp_site_specific", label: "WVPP Not Site-Specific", description: "Not site-specific", citation: "Cal. Labor Code §6401.9(b)(1)", fine: 25000, citation_amount: 25000, phase: "baseline" as const },
      { key: "audit_ready", label: "Can't Produce Audit Package", description: "Not audit-ready", citation: "Cal. Labor Code §6401.9(a)", fine: 25000, citation_amount: 25000, phase: "baseline" as const },
    ],
    fine_low: 35000,
    fine_high: 65000,
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
        score: 9,
        score_tier: "yellow",
        gaps: validLead.result.gaps,
        estimated_fine_low: 35000,
        estimated_fine_high: 65000,
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

  it("stores SB 553 posture booleans", async () => {
    const { submitScore } = await import("@/lib/actions/score")

    await submitScore(validLead)

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        posture_has_wvpp: true,
        posture_wvpp_site_specific: false,
        posture_has_incident_log: true,
        posture_pii_stripped: true,
        posture_training_current: true,
        posture_audit_ready: false,
      })
    )
  })
})

describe("saveAnonymousScore", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    mockSingle.mockResolvedValue({ data: { id: "anon-id-1" }, error: null })
    mockSelect.mockReturnValue({ single: mockSingle })
    mockInsert.mockReturnValue({ select: mockSelect })
  })

  it("inserts without email and returns id", async () => {
    const { saveAnonymousScore } = await import("@/lib/actions/score")

    const result = await saveAnonymousScore({
      answers: validLead.answers,
      result: validLead.result,
      utm_source: "google",
    })

    expect(result).toEqual({ success: true, id: "anon-id-1" })
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        industry: "construction",
        posture_has_wvpp: true,
        score: 9,
      })
    )
    // Should NOT include email
    expect(mockInsert).toHaveBeenCalledWith(
      expect.not.objectContaining({ email: expect.anything() })
    )
  })
})

describe("captureScoreEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    mockUpdateEq.mockResolvedValue({ error: null })
    mockUpdate.mockReturnValue({ eq: mockUpdateEq })
  })

  it("updates lead with email and pdf_downloaded", async () => {
    const { captureScoreEmail } = await import("@/lib/actions/score")

    const result = await captureScoreEmail({
      lead_id: "anon-id-1",
      email: "captured@example.com",
      business_name: "Test Biz",
    })

    expect(result).toEqual({ success: true })
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "captured@example.com",
        name: "Test Biz",
        pdf_downloaded: true,
      })
    )
  })
})
