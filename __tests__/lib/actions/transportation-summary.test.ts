import { beforeEach, describe, expect, it } from "vitest"
import {
  resetAllMocks,
  setMockUser,
  setTableResponse,
  setupSupabaseMocks,
} from "../../helpers/mock-supabase"

setupSupabaseMocks()

describe("getTransportationSummary", () => {
  beforeEach(() => {
    resetAllMocks()
  })

  it("returns empty summary when not authenticated", async () => {
    setMockUser(null)
    const { getTransportationSummary } = await import("@/lib/actions/transportation-summary")
    const result = await getTransportationSummary()
    expect(result).toEqual({ kpis: [], recent: [], links: [] })
  })

  it("returns zero KPIs when no rows", async () => {
    setTableResponse("transportation_fleet", { data: [], error: null })
    const { getTransportationSummary } = await import("@/lib/actions/transportation-summary")
    const result = await getTransportationSummary()
    expect(result.kpis.every((k) => k.value === 0)).toBe(true)
    expect(result.recent).toEqual([])
  })

  it("counts active fleet and expiring CDLs", async () => {
    const soon = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
    setTableResponse("transportation_fleet", {
      data: [
        { id: "v1", vehicle_id: "T-1", vehicle_type: "truck", driver_name: "Alice", cdl_status: "active", cdl_expiry: soon, next_inspection: null, status: "active", updated_at: "2026-04-10T00:00:00Z" },
        { id: "v2", vehicle_id: "T-2", vehicle_type: "van", driver_name: "Bob", cdl_status: "active", cdl_expiry: null, next_inspection: null, status: "out_of_service", updated_at: "2026-04-11T00:00:00Z" },
      ],
      error: null,
    })
    const { getTransportationSummary } = await import("@/lib/actions/transportation-summary")
    const result = await getTransportationSummary()
    expect(result.kpis[0].value).toBe(2)
    expect(result.kpis[1].value).toBe(1)
    expect(result.kpis[2].value).toBe(1)
  })
})
