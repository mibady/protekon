import { beforeEach, describe, expect, it } from "vitest"
import {
  resetAllMocks,
  setMockUser,
  setTableResponse,
  setupSupabaseMocks,
} from "../../helpers/mock-supabase"

setupSupabaseMocks()

describe("getManufacturingSummary", () => {
  beforeEach(() => {
    resetAllMocks()
  })

  it("returns empty summary when not authenticated", async () => {
    setMockUser(null)
    const { getManufacturingSummary } = await import("@/lib/actions/manufacturing-summary")
    const result = await getManufacturingSummary()
    expect(result).toEqual({ kpis: [], recent: [], links: [] })
  })

  it("returns zero KPIs when no rows", async () => {
    setTableResponse("manufacturing_equipment", { data: [], error: null })
    const { getManufacturingSummary } = await import("@/lib/actions/manufacturing-summary")
    const result = await getManufacturingSummary()
    expect(result.kpis.every((k) => k.value === 0)).toBe(true)
    expect(result.recent).toEqual([])
  })

  it("counts LOTO current and upcoming inspections", async () => {
    const soon = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
    setTableResponse("manufacturing_equipment", {
      data: [
        { id: "m1", equipment_name: "Press 1", equipment_type: "press", loto_status: "current", next_inspection: soon, risk_level: "high", updated_at: "2026-04-10T00:00:00Z" },
        { id: "m2", equipment_name: "Mill 1", equipment_type: "mill", loto_status: "expired", next_inspection: null, risk_level: "low", updated_at: "2026-04-11T00:00:00Z" },
      ],
      error: null,
    })
    const { getManufacturingSummary } = await import("@/lib/actions/manufacturing-summary")
    const result = await getManufacturingSummary()
    expect(result.kpis[0].value).toBe(2)
    expect(result.kpis[1].value).toBe(1)
    expect(result.kpis[2].value).toBe(1)
  })
})
