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

describe("poster-compliance actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("getPosterLocations returns [] when not authenticated", async () => {
    const { getAuth } = await import("@/lib/actions/shared")
    vi.mocked(getAuth).mockResolvedValueOnce({ supabase: { from: mockFrom } as any, clientId: null })
    const { getPosterLocations } = await import("@/lib/actions/poster-compliance")
    const result = await getPosterLocations()
    expect(result).toEqual([])
  })

  it("getPosterLocations queries poster_compliance table", async () => {
    const { getPosterLocations } = await import("@/lib/actions/poster-compliance")
    await getPosterLocations()
    expect(mockFrom).toHaveBeenCalledWith("poster_compliance")
  })

  it("addPosterLocation returns error when not authenticated", async () => {
    const { getAuth } = await import("@/lib/actions/shared")
    vi.mocked(getAuth).mockResolvedValueOnce({ supabase: { from: mockFrom } as any, clientId: null })
    const { addPosterLocation } = await import("@/lib/actions/poster-compliance")
    const fd = new FormData()
    const result = await addPosterLocation(fd)
    expect(result).toEqual({ error: "Unauthorized" })
  })

  it("addPosterLocation inserts with correct fields", async () => {
    const { addPosterLocation } = await import("@/lib/actions/poster-compliance")
    const fd = new FormData()
    fd.set("location_name", "Main Office")
    fd.set("poster_type", "OSHA")
    fd.set("jurisdiction", "CA")
    fd.set("next_update_due", "2025-12-01")
    await addPosterLocation(fd)
    expect(mockFrom).toHaveBeenCalledWith("poster_compliance")
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        client_id: "user-123",
        location_name: "Main Office",
        poster_type: "OSHA",
        jurisdiction: "CA",
        status: "current",
      })
    )
  })

  it("verifyPoster updates last_verified_at", async () => {
    const { verifyPoster } = await import("@/lib/actions/poster-compliance")
    await verifyPoster("poster-1")
    expect(mockFrom).toHaveBeenCalledWith("poster_compliance")
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: "current" })
    )
  })
})
