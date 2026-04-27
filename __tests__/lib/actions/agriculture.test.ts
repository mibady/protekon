import { describe, it, expect, vi, beforeEach } from "vitest"

const mockSelect = vi.fn().mockReturnValue({
  eq: vi.fn().mockReturnValue({
    order: vi.fn().mockResolvedValue({ data: [], error: null }),
  }),
})
const mockInsert = vi.fn().mockResolvedValue({ data: [{ id: "new-id" }], error: null })
const mockUpdate = vi.fn().mockReturnValue({
  eq: vi.fn().mockReturnValue({
    eq: vi.fn().mockResolvedValue({ error: null }),
  }),
})

const mockFrom = vi.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
}))

vi.mock("@/lib/actions/shared", () => ({
  getAuth: vi.fn().mockResolvedValue({
    supabase: { from: mockFrom },
    clientId: "user-123",
  }),
}))

describe("agriculture actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("getCrews returns [] when not authenticated", async () => {
    const { getAuth } = await import("@/lib/actions/shared")
    vi.mocked(getAuth).mockResolvedValueOnce({ supabase: { from: mockFrom } as any, clientId: null })
    const { getCrews } = await import("@/lib/actions/agriculture")
    const result = await getCrews()
    expect(result).toEqual([])
  })

  it("getCrews queries agriculture_crews table", async () => {
    const { getCrews } = await import("@/lib/actions/agriculture")
    await getCrews()
    expect(mockFrom).toHaveBeenCalledWith("agriculture_crews")
  })

  it("addCrew returns error when not authenticated", async () => {
    const { getAuth } = await import("@/lib/actions/shared")
    vi.mocked(getAuth).mockResolvedValueOnce({ supabase: { from: mockFrom } as any, clientId: null })
    const { addCrew } = await import("@/lib/actions/agriculture")
    const fd = new FormData()
    const result = await addCrew(fd)
    expect(result).toEqual({ error: "Please log in to continue." })
  })

  it("addCrew inserts into agriculture_crews with client_id", async () => {
    const { addCrew } = await import("@/lib/actions/agriculture")
    const fd = new FormData()
    fd.set("crew_name", "Alpha Crew")
    fd.set("field_location", "North Field")
    fd.set("crew_size", "12")
    fd.set("heat_plan_status", "active")
    await addCrew(fd)
    expect(mockFrom).toHaveBeenCalledWith("agriculture_crews")
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ client_id: "user-123", crew_name: "Alpha Crew", crew_size: 12 })
    )
  })

  it("updateCrew returns error when not authenticated", async () => {
    const { getAuth } = await import("@/lib/actions/shared")
    vi.mocked(getAuth).mockResolvedValueOnce({ supabase: { from: mockFrom } as any, clientId: null })
    const { updateCrew } = await import("@/lib/actions/agriculture")
    const result = await updateCrew("crew-1", { heat_plan_status: "expired" })
    expect(result).toEqual({ error: "Please log in to continue." })
  })
})
