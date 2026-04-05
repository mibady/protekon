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

describe("hospitality actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("getInspections returns [] when not authenticated", async () => {
    const { getAuth } = await import("@/lib/actions/shared")
    vi.mocked(getAuth).mockResolvedValueOnce({ supabase: { from: mockFrom } as any, clientId: null })
    const { getInspections } = await import("@/lib/actions/hospitality")
    const result = await getInspections()
    expect(result).toEqual([])
  })

  it("getInspections queries hospitality_inspections table", async () => {
    const { getInspections } = await import("@/lib/actions/hospitality")
    await getInspections()
    expect(mockFrom).toHaveBeenCalledWith("hospitality_inspections")
  })

  it("addInspection returns error when not authenticated", async () => {
    const { getAuth } = await import("@/lib/actions/shared")
    vi.mocked(getAuth).mockResolvedValueOnce({ supabase: { from: mockFrom } as any, clientId: null })
    const { addInspection } = await import("@/lib/actions/hospitality")
    const fd = new FormData()
    const result = await addInspection(fd)
    expect(result).toEqual({ error: "Unauthorized" })
  })

  it("addInspection inserts into hospitality_inspections with client_id", async () => {
    const { addInspection } = await import("@/lib/actions/hospitality")
    const fd = new FormData()
    fd.set("inspection_type", "health")
    fd.set("inspection_date", "2025-06-01")
    fd.set("score", "95")
    fd.set("status", "passed")
    await addInspection(fd)
    expect(mockFrom).toHaveBeenCalledWith("hospitality_inspections")
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ client_id: "user-123", inspection_type: "health" })
    )
  })

  it("addInspection parses score as float", async () => {
    const { addInspection } = await import("@/lib/actions/hospitality")
    const fd = new FormData()
    fd.set("inspection_type", "fire")
    fd.set("inspection_date", "2025-07-01")
    fd.set("score", "87.5")
    await addInspection(fd)
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ score: 87.5 })
    )
  })
})
