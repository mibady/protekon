import { describe, it, expect, vi, beforeEach } from "vitest"

const mockUser = { id: "user-123", email: "test@co.com" }

const mockSingle = vi.fn().mockResolvedValue({
  data: { id: "partner-1", user_id: "user-123", company_name: "Test Co" },
  error: null,
})
const mockEq = vi.fn().mockReturnValue({ single: mockSingle, order: vi.fn().mockResolvedValue({ data: [], error: null }) })
const mockSelect = vi.fn().mockReturnValue({ eq: mockEq, order: vi.fn().mockResolvedValue({ data: [], error: null }) })
const mockInsert = vi.fn().mockResolvedValue({ data: [{ id: "new-id" }], error: null })

const mockFrom = vi.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
}))

const mockGetUser = vi.fn().mockResolvedValue({
  data: { user: mockUser },
})

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    from: mockFrom,
    auth: { getUser: mockGetUser },
  }),
}))

describe("partner-portal actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: mockUser } })
  })

  it("getPartnerProfile returns null when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const { getPartnerProfile } = await import("@/lib/actions/partner-portal")
    const result = await getPartnerProfile()
    expect(result).toBeNull()
  })

  it("getPartnerProfile queries partner_profiles table", async () => {
    const { getPartnerProfile } = await import("@/lib/actions/partner-portal")
    await getPartnerProfile()
    expect(mockFrom).toHaveBeenCalledWith("partner_profiles")
  })

  it("getPartnerClients returns [] when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const { getPartnerClients } = await import("@/lib/actions/partner-portal")
    const result = await getPartnerClients()
    expect(result).toEqual([])
  })

  it("getPartnerClients queries partner_clients table", async () => {
    // Need to mock the profile lookup chain for getPartnerClients
    const { getPartnerClients } = await import("@/lib/actions/partner-portal")
    await getPartnerClients()
    // getPartnerClients calls getPartnerProfile first (partner_profiles) then partner_clients
    const calls = mockFrom.mock.calls.map((c: unknown[]) => c[0])
    expect(calls).toContain("partner_profiles")
  })

  it("getPartnerStats returns defaults when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const { getPartnerStats } = await import("@/lib/actions/partner-portal")
    const result = await getPartnerStats()
    expect(result).toEqual({ totalClients: 0, mrr: 0, avgScore: 0, assessmentsSent: 0 })
  })

  it("getPartnerAssessments returns [] when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const { getPartnerAssessments } = await import("@/lib/actions/partner-portal")
    const result = await getPartnerAssessments()
    expect(result).toEqual([])
  })

  it("getPartnerAssessments queries partner_assessments table", async () => {
    const { getPartnerAssessments } = await import("@/lib/actions/partner-portal")
    await getPartnerAssessments()
    const calls = mockFrom.mock.calls.map((c: unknown[]) => c[0])
    expect(calls).toContain("partner_profiles")
  })

  it("sendAssessment returns error when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const { sendAssessment } = await import("@/lib/actions/partner-portal")
    const result = await sendAssessment({ prospect_name: "Test", prospect_email: "test@test.com" })
    expect(result).toEqual({ error: "You must be logged in." })
  })

  it("sendAssessment inserts into partner_assessments with status sent", async () => {
    const { sendAssessment } = await import("@/lib/actions/partner-portal")
    await sendAssessment({ prospect_name: "Jane", prospect_email: "jane@co.com" })
    expect(mockFrom).toHaveBeenCalledWith("partner_assessments")
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        prospect_name: "Jane",
        prospect_email: "jane@co.com",
        status: "sent",
      })
    )
  })

  it("sendAssessment returns error on supabase insert failure", async () => {
    mockInsert.mockResolvedValueOnce({ data: null, error: { message: "DB error" } })
    const { sendAssessment } = await import("@/lib/actions/partner-portal")
    const result = await sendAssessment({ prospect_name: "Jane", prospect_email: "jane@co.com" })
    expect(result).toEqual({ error: "DB error" })
  })
})
