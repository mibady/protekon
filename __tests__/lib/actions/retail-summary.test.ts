import { beforeEach, describe, expect, it } from "vitest"
import {
  resetAllMocks,
  setMockUser,
  setTableResponse,
  setupSupabaseMocks,
} from "../../helpers/mock-supabase"

setupSupabaseMocks()

describe("getRetailSummary", () => {
  beforeEach(() => {
    resetAllMocks()
  })

  it("returns empty summary when not authenticated", async () => {
    setMockUser(null)
    const { getRetailSummary } = await import("@/lib/actions/retail-summary")
    const result = await getRetailSummary()
    expect(result).toEqual({ kpis: [], recent: [], links: [] })
  })

  it("returns zero KPIs when no rows", async () => {
    setTableResponse("retail_locations", { data: [], error: null })
    const { getRetailSummary } = await import("@/lib/actions/retail-summary")
    const result = await getRetailSummary()
    expect(result.kpis.every((k) => k.value === 0)).toBe(true)
    expect(result.recent).toEqual([])
  })

  it("counts ADA-compliant and fire-current locations", async () => {
    setTableResponse("retail_locations", {
      data: [
        { id: "r1", store_name: "Store A", city: "LA", state: "CA", fire_inspection_status: "current", ada_status: "compliant", compliance_score: 95, updated_at: "2026-04-10T00:00:00Z" },
        { id: "r2", store_name: "Store B", city: "SF", state: "CA", fire_inspection_status: "expired", ada_status: "compliant", compliance_score: 70, updated_at: "2026-04-11T00:00:00Z" },
      ],
      error: null,
    })
    const { getRetailSummary } = await import("@/lib/actions/retail-summary")
    const result = await getRetailSummary()
    expect(result.kpis[0].value).toBe(2)
    expect(result.kpis[1].value).toBe(2)
    expect(result.kpis[2].value).toBe(1)
  })
})
