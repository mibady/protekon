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

describe("wholesale actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("getZones returns [] when not authenticated", async () => {
    const { getAuth } = await import("@/lib/actions/shared")
    vi.mocked(getAuth).mockResolvedValueOnce({ supabase: { from: mockFrom } as any, clientId: null })
    const { getZones } = await import("@/lib/actions/wholesale")
    const result = await getZones()
    expect(result).toEqual([])
  })

  it("getZones queries wholesale_zones table", async () => {
    const { getZones } = await import("@/lib/actions/wholesale")
    await getZones()
    expect(mockFrom).toHaveBeenCalledWith("wholesale_zones")
  })

  it("addZone returns error when not authenticated", async () => {
    const { getAuth } = await import("@/lib/actions/shared")
    vi.mocked(getAuth).mockResolvedValueOnce({ supabase: { from: mockFrom } as any, clientId: null })
    const { addZone } = await import("@/lib/actions/wholesale")
    const fd = new FormData()
    const result = await addZone(fd)
    expect(result).toEqual({ error: "Please log in to continue." })
  })

  it("addZone inserts into wholesale_zones with client_id", async () => {
    const { addZone } = await import("@/lib/actions/wholesale")
    const fd = new FormData()
    fd.set("zone_name", "Warehouse A")
    fd.set("zone_type", "warehouse")
    fd.set("forklift_certified_operators", "5")
    await addZone(fd)
    expect(mockFrom).toHaveBeenCalledWith("wholesale_zones")
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ client_id: "user-123", zone_name: "Warehouse A", forklift_certified_operators: 5 })
    )
  })

  it("addZone handles hazmat_present checkbox", async () => {
    const { addZone } = await import("@/lib/actions/wholesale")
    const fd = new FormData()
    fd.set("zone_name", "Chemical Zone")
    fd.set("hazmat_present", "on")
    await addZone(fd)
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ hazmat_present: true })
    )
  })
})
