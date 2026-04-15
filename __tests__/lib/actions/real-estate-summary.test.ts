import { beforeEach, describe, expect, it } from "vitest"
import {
  resetAllMocks,
  setMockUser,
  setTableResponse,
  setupSupabaseMocks,
} from "../../helpers/mock-supabase"

setupSupabaseMocks()

describe("getRealEstateSummary", () => {
  beforeEach(() => {
    resetAllMocks()
  })

  it("returns empty summary when not authenticated", async () => {
    setMockUser(null)
    const { getRealEstateSummary } = await import("@/lib/actions/real-estate-summary")
    const result = await getRealEstateSummary()
    expect(result).toEqual({ kpis: [], recent: [], links: [] })
  })

  it("returns zero KPIs when no rows", async () => {
    setTableResponse("property_portfolio", { data: [], error: null })
    const { getRealEstateSummary } = await import("@/lib/actions/real-estate-summary")
    const result = await getRealEstateSummary()
    expect(result.kpis.every((k) => k.value === 0)).toBe(true)
    expect(result.recent).toEqual([])
  })

  it("sums units and counts compliant rows", async () => {
    setTableResponse("property_portfolio", {
      data: [
        { id: "p1", property_name: "Tower A", address: "1 Main", city: "LA", state: "CA", units: 12, property_type: "multi", compliance_status: "compliant", updated_at: "2026-04-10T00:00:00Z" },
        { id: "p2", property_name: "Tower B", address: "2 Main", city: "LA", state: "CA", units: 8, property_type: "multi", compliance_status: "non_compliant", updated_at: "2026-04-11T00:00:00Z" },
      ],
      error: null,
    })
    const { getRealEstateSummary } = await import("@/lib/actions/real-estate-summary")
    const result = await getRealEstateSummary()
    expect(result.kpis[0].value).toBe(2)
    expect(result.kpis[1].value).toBe(20)
    expect(result.kpis[2].value).toBe(1)
  })
})
