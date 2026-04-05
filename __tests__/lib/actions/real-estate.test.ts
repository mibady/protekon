import { describe, it, expect, vi, beforeEach } from "vitest"

const mockSelect = vi.fn().mockReturnValue({
  eq: vi.fn().mockReturnValue({
    order: vi.fn().mockResolvedValue({ data: [], error: null }),
  }),
  order: vi.fn().mockReturnValue({
    limit: vi.fn().mockResolvedValue({ data: [], error: null }),
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

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    from: mockFrom,
  }),
}))

describe("real-estate actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("getProperties returns [] when not authenticated", async () => {
    const { getAuth } = await import("@/lib/actions/shared")
    vi.mocked(getAuth).mockResolvedValueOnce({ supabase: { from: mockFrom } as any, clientId: null })
    const { getProperties } = await import("@/lib/actions/real-estate")
    const result = await getProperties()
    expect(result).toEqual([])
  })

  it("getProperties queries property_portfolio table", async () => {
    const { getProperties } = await import("@/lib/actions/real-estate")
    await getProperties()
    expect(mockFrom).toHaveBeenCalledWith("property_portfolio")
  })

  it("addProperty returns error when not authenticated", async () => {
    const { getAuth } = await import("@/lib/actions/shared")
    vi.mocked(getAuth).mockResolvedValueOnce({ supabase: { from: mockFrom } as any, clientId: null })
    const { addProperty } = await import("@/lib/actions/real-estate")
    const fd = new FormData()
    const result = await addProperty(fd)
    expect(result).toEqual({ error: "Unauthorized" })
  })

  it("addProperty inserts into property_portfolio with client_id", async () => {
    const { addProperty } = await import("@/lib/actions/real-estate")
    const fd = new FormData()
    fd.set("property_name", "Sunset Apts")
    fd.set("address", "123 Main St")
    fd.set("city", "LA")
    fd.set("state", "CA")
    fd.set("units", "10")
    fd.set("property_type", "apartment")
    await addProperty(fd)
    expect(mockFrom).toHaveBeenCalledWith("property_portfolio")
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ client_id: "user-123", property_name: "Sunset Apts" })
    )
  })

  it("getOrdinances queries municipal_ordinances table", async () => {
    const { getOrdinances } = await import("@/lib/actions/real-estate")
    await getOrdinances()
    expect(mockFrom).toHaveBeenCalledWith("municipal_ordinances")
  })
})
