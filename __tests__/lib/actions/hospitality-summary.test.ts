import { beforeEach, describe, expect, it } from "vitest"
import {
  resetAllMocks,
  setMockUser,
  setTableResponse,
  setupSupabaseMocks,
} from "../../helpers/mock-supabase"

setupSupabaseMocks()

describe("getHospitalitySummary", () => {
  beforeEach(() => {
    resetAllMocks()
  })

  it("returns empty summary when not authenticated", async () => {
    setMockUser(null)
    const { getHospitalitySummary } = await import("@/lib/actions/hospitality-summary")
    const result = await getHospitalitySummary()
    expect(result).toEqual({ kpis: [], recent: [], links: [] })
  })

  it("returns zero KPIs and empty recent when no rows", async () => {
    setTableResponse("hospitality_inspections", { data: [], error: null })
    const { getHospitalitySummary } = await import("@/lib/actions/hospitality-summary")
    const result = await getHospitalitySummary()
    expect(result.kpis.every((k) => k.value === 0)).toBe(true)
    expect(result.recent).toEqual([])
  })

  it("aggregates violations and counts passes", async () => {
    setTableResponse("hospitality_inspections", {
      data: [
        { id: "i1", inspection_type: "health", inspector: "A", inspection_date: "2026-04-10", score: 95, violations: 2, status: "passed", updated_at: "2026-04-10T00:00:00Z" },
        { id: "i2", inspection_type: "fire", inspector: "B", inspection_date: "2026-04-11", score: 80, violations: 5, status: "failed", updated_at: "2026-04-11T00:00:00Z" },
        { id: "i3", inspection_type: "health", inspector: "A", inspection_date: "2026-04-12", score: 99, violations: 0, status: "passed", updated_at: "2026-04-12T00:00:00Z" },
      ],
      error: null,
    })
    const { getHospitalitySummary } = await import("@/lib/actions/hospitality-summary")
    const result = await getHospitalitySummary()
    expect(result.kpis[0].value).toBe(3)
    expect(result.kpis[1].value).toBe(2)
    expect(result.kpis[2].value).toBe(7)
    expect(result.recent).toHaveLength(3)
  })
})
