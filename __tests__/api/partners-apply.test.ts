import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock submitPartnerApplication action
const mockSubmitPartnerApplication = vi.fn()
vi.mock("@/lib/actions/partner", () => ({
  submitPartnerApplication: (...args: unknown[]) => mockSubmitPartnerApplication(...args),
}))

const validBody = {
  name: "Partner Person",
  email: "partner@biz.com",
  phone: "555-1111",
  business_name: "Partner Consulting",
  business_type: "MSP",
  website: "https://partner.com",
  city: "San Diego",
  state: "CA",
  client_count: "10-25",
  client_industries: ["construction"],
  verticals_interested: ["construction"],
  previous_compliance_experience: "3+ years",
  tier_interest: "gold",
}

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/partners/apply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("POST /api/partners/apply", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    mockSubmitPartnerApplication.mockResolvedValue({ success: true, id: "app-id-1" })
  })

  it("returns 200 with valid body", async () => {
    const { POST } = await import("@/app/api/partners/apply/route")
    const res = await POST(makeRequest(validBody) as never)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.id).toBe("app-id-1")
  })

  it("returns 400 with invalid body", async () => {
    const { POST } = await import("@/app/api/partners/apply/route")
    const res = await POST(makeRequest({ name: "" }) as never)

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe("Validation failed")
  })

  it("calls submitPartnerApplication action", async () => {
    const { POST } = await import("@/app/api/partners/apply/route")
    await POST(makeRequest(validBody) as never)

    expect(mockSubmitPartnerApplication).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Partner Person",
        email: "partner@biz.com",
        business_name: "Partner Consulting",
        tier_interest: "gold",
      })
    )
  })
})
