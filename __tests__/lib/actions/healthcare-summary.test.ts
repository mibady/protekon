import { beforeEach, describe, expect, it } from "vitest"
import {
  resetAllMocks,
  setMockUser,
  setTableResponse,
  setupSupabaseMocks,
} from "../../helpers/mock-supabase"

setupSupabaseMocks()

describe("getHealthcareSummary", () => {
  beforeEach(() => {
    resetAllMocks()
  })

  it("returns empty summary when not authenticated", async () => {
    setMockUser(null)
    const { getHealthcareSummary } = await import("@/lib/actions/healthcare-summary")
    const result = await getHealthcareSummary()
    expect(result).toEqual({ kpis: [], recent: [], links: [] })
  })

  it("returns zero KPI values when authenticated with no rows", async () => {
    setTableResponse("baa_agreements", { data: [], error: null })
    setTableResponse("phi_assets", { data: [], error: null })
    const { getHealthcareSummary } = await import("@/lib/actions/healthcare-summary")
    const result = await getHealthcareSummary()
    expect(result.kpis).toHaveLength(4)
    expect(result.kpis.every((k) => k.value === 0)).toBe(true)
    expect(result.recent).toEqual([])
    expect(result.links.length).toBe(2)
  })

  it("computes combined counts from BAAs and PHI assets", async () => {
    const soon = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
    setTableResponse("baa_agreements", {
      data: [
        { id: "b1", vendor_name: "Vendor1", baa_status: "active", expiration_date: soon, updated_at: "2026-04-10T00:00:00Z" },
        { id: "b2", vendor_name: "Vendor2", baa_status: "pending", expiration_date: null, updated_at: "2026-04-09T00:00:00Z" },
      ],
      error: null,
    })
    setTableResponse("phi_assets", {
      data: [
        { id: "p1", system_name: "EMR", system_type: "database", risk_level: "high", updated_at: "2026-04-11T00:00:00Z" },
        { id: "p2", system_name: "Portal", system_type: "web", risk_level: "low", updated_at: "2026-04-08T00:00:00Z" },
      ],
      error: null,
    })
    const { getHealthcareSummary } = await import("@/lib/actions/healthcare-summary")
    const result = await getHealthcareSummary()
    expect(result.kpis[0].value).toBe(2) // BAAs
    expect(result.kpis[1].value).toBe(2) // PHI systems
    expect(result.kpis[2].value).toBe(1) // high-risk
    expect(result.kpis[3].value).toBe(1) // expiring BAAs
    expect(result.recent).toHaveLength(4)
    expect(result.recent[0].id).toBe("p1") // most recent updated_at
  })
})
