import { beforeEach, describe, expect, it } from "vitest"
import {
  resetAllMocks,
  setMockUser,
  setTableResponse,
  setupSupabaseMocks,
} from "../../helpers/mock-supabase"

setupSupabaseMocks()

describe("getConstructionSummary", () => {
  beforeEach(() => {
    resetAllMocks()
  })

  it("returns empty summary when not authenticated", async () => {
    setMockUser(null)
    const { getConstructionSummary } = await import("@/lib/actions/construction-summary")
    const result = await getConstructionSummary()
    expect(result).toEqual({ kpis: [], recent: [], links: [] })
  })

  it("returns zero KPIs and empty recent when authenticated with no rows", async () => {
    setTableResponse("construction_subs", { data: [], error: null })
    const { getConstructionSummary } = await import("@/lib/actions/construction-summary")
    const result = await getConstructionSummary()
    expect(result.kpis.every((k) => k.value === 0)).toBe(true)
    expect(result.recent).toEqual([])
  })

  it("computes counts with expiring licenses", async () => {
    const soon = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
    setTableResponse("construction_subs", {
      data: [
        { id: "s1", company_name: "ABC", license_number: "1", license_status: "active", license_expiry: soon, updated_at: "2026-04-10T00:00:00Z" },
        { id: "s2", company_name: "XYZ", license_number: "2", license_status: "active", license_expiry: null, updated_at: "2026-04-11T00:00:00Z" },
        { id: "s3", company_name: "DEF", license_number: "3", license_status: "suspended", license_expiry: null, updated_at: "2026-04-12T00:00:00Z" },
      ],
      error: null,
    })
    const { getConstructionSummary } = await import("@/lib/actions/construction-summary")
    const result = await getConstructionSummary()
    expect(result.kpis[0].value).toBe(3)
    expect(result.kpis[1].value).toBe(2)
    expect(result.kpis[2].value).toBe(1)
    expect(result.recent).toHaveLength(3)
  })
})
