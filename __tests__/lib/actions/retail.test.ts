import { describe, it, expect, vi, beforeEach } from "vitest"

const mockSelect = vi.fn().mockReturnValue({
  eq: vi.fn().mockReturnValue({
    order: vi.fn().mockResolvedValue({ data: [], error: null }),
  }),
})
const mockInsert = vi.fn().mockResolvedValue({ data: [{ id: "new-id" }], error: null })

const mockFrom = vi.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
}))

vi.mock("@/lib/actions/shared", () => ({
  getAuth: vi.fn().mockResolvedValue({
    supabase: { from: mockFrom },
    clientId: "user-123",
  }),
}))

describe("retail actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("getLocations returns [] when not authenticated", async () => {
    const { getAuth } = await import("@/lib/actions/shared")
    vi.mocked(getAuth).mockResolvedValueOnce({ supabase: { from: mockFrom } as any, clientId: null })
    const { getLocations } = await import("@/lib/actions/retail")
    const result = await getLocations()
    expect(result).toEqual([])
  })

  it("getLocations queries retail_locations table", async () => {
    const { getLocations } = await import("@/lib/actions/retail")
    await getLocations()
    expect(mockFrom).toHaveBeenCalledWith("retail_locations")
  })

  it("addLocation returns error when not authenticated", async () => {
    const { getAuth } = await import("@/lib/actions/shared")
    vi.mocked(getAuth).mockResolvedValueOnce({ supabase: { from: mockFrom } as any, clientId: null })
    const { addLocation } = await import("@/lib/actions/retail")
    const fd = new FormData()
    const result = await addLocation(fd)
    expect(result).toEqual({ error: "Unauthorized" })
  })

  it("addLocation inserts into retail_locations with client_id", async () => {
    const { addLocation } = await import("@/lib/actions/retail")
    const fd = new FormData()
    fd.set("store_name", "Downtown Store")
    fd.set("address", "456 Market St")
    fd.set("city", "SF")
    fd.set("location_type", "retail")
    await addLocation(fd)
    expect(mockFrom).toHaveBeenCalledWith("retail_locations")
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ client_id: "user-123", store_name: "Downtown Store" })
    )
  })

  it("addLocation defaults compliance_score to 100", async () => {
    const { addLocation } = await import("@/lib/actions/retail")
    const fd = new FormData()
    fd.set("store_name", "Test Store")
    await addLocation(fd)
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ compliance_score: 100 })
    )
  })
})
