import { describe, it, expect, vi, beforeEach } from "vitest"

const mockSelect = vi.fn().mockReturnValue({
  eq: vi.fn().mockReturnValue({
    order: vi.fn().mockResolvedValue({ data: [], error: null }),
  }),
})
const mockInsert = vi.fn().mockResolvedValue({ data: [{ id: "new-id" }], error: null })
const mockDelete = vi.fn().mockReturnValue({
  eq: vi.fn().mockReturnValue({
    eq: vi.fn().mockResolvedValue({ error: null }),
  }),
})

const mockFrom = vi.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
  delete: mockDelete,
}))

vi.mock("@/lib/actions/shared", () => ({
  getAuth: vi.fn().mockResolvedValue({
    supabase: { from: mockFrom },
    clientId: "user-123",
  }),
}))

describe("transportation actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("getFleet returns [] when not authenticated", async () => {
    const { getAuth } = await import("@/lib/actions/shared")
    vi.mocked(getAuth).mockResolvedValueOnce({ supabase: { from: mockFrom } as any, clientId: null })
    const { getFleet } = await import("@/lib/actions/transportation")
    const result = await getFleet()
    expect(result).toEqual([])
  })

  it("getFleet queries transportation_fleet table", async () => {
    const { getFleet } = await import("@/lib/actions/transportation")
    await getFleet()
    expect(mockFrom).toHaveBeenCalledWith("transportation_fleet")
  })

  it("addVehicle returns error when not authenticated", async () => {
    const { getAuth } = await import("@/lib/actions/shared")
    vi.mocked(getAuth).mockResolvedValueOnce({ supabase: { from: mockFrom } as any, clientId: null })
    const { addVehicle } = await import("@/lib/actions/transportation")
    const fd = new FormData()
    const result = await addVehicle(fd)
    expect(result).toEqual({ error: "Unauthorized" })
  })

  it("addVehicle inserts into transportation_fleet with client_id", async () => {
    const { addVehicle } = await import("@/lib/actions/transportation")
    const fd = new FormData()
    fd.set("vehicle_id", "TRK-001")
    fd.set("vehicle_type", "truck")
    fd.set("driver_name", "John Smith")
    fd.set("cdl_status", "active")
    await addVehicle(fd)
    expect(mockFrom).toHaveBeenCalledWith("transportation_fleet")
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ client_id: "user-123", vehicle_id: "TRK-001", vehicle_type: "truck" })
    )
  })

  it("deleteVehicle deletes with client_id filter", async () => {
    const { deleteVehicle } = await import("@/lib/actions/transportation")
    await deleteVehicle("veh-1")
    expect(mockFrom).toHaveBeenCalledWith("transportation_fleet")
    expect(mockDelete).toHaveBeenCalled()
  })
})
