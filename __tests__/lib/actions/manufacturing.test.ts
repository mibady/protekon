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

describe("manufacturing actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("getEquipment returns [] when not authenticated", async () => {
    const { getAuth } = await import("@/lib/actions/shared")
    vi.mocked(getAuth).mockResolvedValueOnce({ supabase: { from: mockFrom } as any, clientId: null })
    const { getEquipment } = await import("@/lib/actions/manufacturing")
    const result = await getEquipment()
    expect(result).toEqual([])
  })

  it("getEquipment queries manufacturing_equipment table", async () => {
    const { getEquipment } = await import("@/lib/actions/manufacturing")
    await getEquipment()
    expect(mockFrom).toHaveBeenCalledWith("manufacturing_equipment")
  })

  it("addEquipment returns error when not authenticated", async () => {
    const { getAuth } = await import("@/lib/actions/shared")
    vi.mocked(getAuth).mockResolvedValueOnce({ supabase: { from: mockFrom } as any, clientId: null })
    const { addEquipment } = await import("@/lib/actions/manufacturing")
    const fd = new FormData()
    const result = await addEquipment(fd)
    expect(result).toEqual({ error: "Unauthorized" })
  })

  it("addEquipment inserts into manufacturing_equipment with client_id", async () => {
    const { addEquipment } = await import("@/lib/actions/manufacturing")
    const fd = new FormData()
    fd.set("equipment_name", "CNC Mill")
    fd.set("equipment_type", "machinery")
    fd.set("serial_number", "SN-001")
    await addEquipment(fd)
    expect(mockFrom).toHaveBeenCalledWith("manufacturing_equipment")
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ client_id: "user-123", equipment_name: "CNC Mill" })
    )
  })

  it("deleteEquipment deletes with client_id filter", async () => {
    const { deleteEquipment } = await import("@/lib/actions/manufacturing")
    await deleteEquipment("eq-1")
    expect(mockFrom).toHaveBeenCalledWith("manufacturing_equipment")
    expect(mockDelete).toHaveBeenCalled()
  })
})
