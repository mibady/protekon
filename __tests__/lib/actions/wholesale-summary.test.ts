import { beforeEach, describe, expect, it } from "vitest"
import {
  resetAllMocks,
  setMockUser,
  setTableResponse,
  setupSupabaseMocks,
} from "../../helpers/mock-supabase"

setupSupabaseMocks()

describe("getWholesaleSummary", () => {
  beforeEach(() => {
    resetAllMocks()
  })

  it("returns empty summary when not authenticated", async () => {
    setMockUser(null)
    const { getWholesaleSummary } = await import("@/lib/actions/wholesale-summary")
    const result = await getWholesaleSummary()
    expect(result).toEqual({ kpis: [], recent: [], links: [] })
  })

  it("returns zero KPIs when no rows in either table", async () => {
    setTableResponse("forklift_operators", { data: [], error: null })
    setTableResponse("wholesale_zones", { data: [], error: null })
    const { getWholesaleSummary } = await import("@/lib/actions/wholesale-summary")
    const result = await getWholesaleSummary()
    expect(result.kpis).toHaveLength(4)
    expect(result.kpis.every((k) => k.value === 0)).toBe(true)
    expect(result.recent).toEqual([])
    expect(result.links).toHaveLength(2)
  })

  it("combines operators and zones into recent sorted by updated_at", async () => {
    const soon = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
    setTableResponse("forklift_operators", {
      data: [
        { id: "o1", operator_name: "Alice", forklift_type: "Class I", evaluation_status: "current", cert_expiry: soon, updated_at: "2026-04-10T00:00:00Z" },
        { id: "o2", operator_name: "Bob", forklift_type: "Class II", evaluation_status: "expired", cert_expiry: null, updated_at: "2026-04-12T00:00:00Z" },
      ],
      error: null,
    })
    setTableResponse("wholesale_zones", {
      data: [
        { id: "z1", zone_name: "Zone A", zone_type: "warehouse", status: "compliant", hazmat_present: true, updated_at: "2026-04-15T00:00:00Z" },
        { id: "z2", zone_name: "Zone B", zone_type: "warehouse", status: "non_compliant", hazmat_present: false, updated_at: "2026-04-09T00:00:00Z" },
      ],
      error: null,
    })
    const { getWholesaleSummary } = await import("@/lib/actions/wholesale-summary")
    const result = await getWholesaleSummary()
    expect(result.kpis[0].value).toBe(2) // operators
    expect(result.kpis[1].value).toBe(1) // expiring
    expect(result.kpis[2].value).toBe(2) // zones
    expect(result.kpis[3].value).toBe(1) // hazmat zones
    expect(result.recent).toHaveLength(4)
    expect(result.recent[0].id).toBe("z1") // most recent
  })
})
