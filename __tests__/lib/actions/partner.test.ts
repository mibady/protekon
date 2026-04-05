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

const validApplication = {
  name: "Partner Person",
  email: "partner@biz.com",
  phone: "555-1111",
  business_name: "Partner Consulting",
  business_type: "MSP",
  website: "https://partner.com",
  city: "San Diego",
  state: "CA",
  client_count: "10-25",
  client_industries: ["construction", "healthcare"],
  verticals_interested: ["construction", "general"],
  previous_compliance_experience: "3+ years",
  tier_interest: "gold",
  referral_source: "website",
  notes: "Eager to start",
  utm_source: "linkedin",
  utm_medium: "social",
  utm_campaign: "partner-launch",
}

describe("submitPartnerApplication", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    mockSingle.mockResolvedValue({ data: { id: "app-id-1" }, error: null })
    mockSelect.mockReturnValue({ single: mockSingle })
    mockInsert.mockReturnValue({ select: mockSelect })
  })

  it("inserts into 'partner_applications' table", async () => {
    const { createClient } = await import("@/lib/supabase/server")
    const { submitPartnerApplication } = await import("@/lib/actions/partner")

    await submitPartnerApplication(validApplication)

    const supabase = await (createClient as any)()
    expect(supabase.from).toHaveBeenCalledWith("partner_applications")
  })

  it("returns { success: true, id } on success", async () => {
    const { submitPartnerApplication } = await import("@/lib/actions/partner")

    const result = await submitPartnerApplication(validApplication)

    expect(result).toEqual({ success: true, id: "app-id-1" })
  })

  it("returns { error } on database error", async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: "Unique constraint violated" } })

    const { submitPartnerApplication } = await import("@/lib/actions/partner")

    const result = await submitPartnerApplication(validApplication)

    expect(result).toEqual({ error: "Unique constraint violated" })
  })

  it("stores all fields (name, email, business_name, verticals, tier_interest, etc.)", async () => {
    const { submitPartnerApplication } = await import("@/lib/actions/partner")

    await submitPartnerApplication(validApplication)

    expect(mockInsert).toHaveBeenCalledWith({
      name: "Partner Person",
      email: "partner@biz.com",
      phone: "555-1111",
      business_name: "Partner Consulting",
      business_type: "MSP",
      website: "https://partner.com",
      city: "San Diego",
      state: "CA",
      client_count: "10-25",
      client_industries: ["construction", "healthcare"],
      verticals_interested: ["construction", "general"],
      previous_compliance_experience: "3+ years",
      tier_interest: "gold",
      referral_source: "website",
      notes: "Eager to start",
      utm_source: "linkedin",
      utm_medium: "social",
      utm_campaign: "partner-launch",
    })
  })

  it("stores UTM parameters", async () => {
    const { submitPartnerApplication } = await import("@/lib/actions/partner")

    await submitPartnerApplication(validApplication)

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        utm_source: "linkedin",
        utm_medium: "social",
        utm_campaign: "partner-launch",
      })
    )
  })
})
