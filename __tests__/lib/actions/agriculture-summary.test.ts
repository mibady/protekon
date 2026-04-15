import { beforeEach, describe, expect, it } from "vitest"
import {
  resetAllMocks,
  setMockUser,
  setTableResponse,
  setupSupabaseMocks,
} from "../../helpers/mock-supabase"

setupSupabaseMocks()

describe("getAgricultureSummary", () => {
  beforeEach(() => {
    resetAllMocks()
  })

  it("returns empty summary when not authenticated", async () => {
    setMockUser(null)
    const { getAgricultureSummary } = await import("@/lib/actions/agriculture-summary")
    const result = await getAgricultureSummary()
    expect(result).toEqual({ kpis: [], recent: [], links: [] })
  })

  it("returns zero KPIs and empty recent when authenticated with no rows", async () => {
    setTableResponse("agriculture_crews", { data: [], error: null })
    const { getAgricultureSummary } = await import("@/lib/actions/agriculture-summary")
    const result = await getAgricultureSummary()
    expect(result.kpis).toHaveLength(3)
    expect(result.kpis[0].value).toBe(0)
    expect(result.recent).toEqual([])
    expect(result.links.length).toBeGreaterThan(0)
  })

  it("computes counts and recent from seeded rows", async () => {
    setTableResponse("agriculture_crews", {
      data: [
        { id: "c1", crew_name: "North Field", field_location: "North", heat_plan_status: "active", water_station: true, shade_available: true, updated_at: "2026-04-10T00:00:00Z" },
        { id: "c2", crew_name: "South Field", field_location: "South", heat_plan_status: "active", water_station: false, shade_available: true, updated_at: "2026-04-11T00:00:00Z" },
        { id: "c3", crew_name: "East Field", field_location: "East", heat_plan_status: "inactive", water_station: true, shade_available: false, updated_at: "2026-04-12T00:00:00Z" },
      ],
      error: null,
    })
    const { getAgricultureSummary } = await import("@/lib/actions/agriculture-summary")
    const result = await getAgricultureSummary()
    expect(result.kpis[0].value).toBe(3)
    expect(result.kpis[1].value).toBe(2) // active heat plans
    expect(result.kpis[2].value).toBe(2) // missing controls
    expect(result.recent).toHaveLength(3)
    expect(result.recent[0].id).toBe("c1") // mock returns data in insertion order
  })
})
