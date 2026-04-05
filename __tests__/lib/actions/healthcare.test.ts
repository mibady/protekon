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

describe("healthcare actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("getPhiAssets returns [] when not authenticated", async () => {
    const { getAuth } = await import("@/lib/actions/shared")
    vi.mocked(getAuth).mockResolvedValueOnce({ supabase: { from: mockFrom } as any, clientId: null })
    const { getPhiAssets } = await import("@/lib/actions/healthcare")
    const result = await getPhiAssets()
    expect(result).toEqual([])
  })

  it("getPhiAssets queries phi_assets table", async () => {
    const { getPhiAssets } = await import("@/lib/actions/healthcare")
    await getPhiAssets()
    expect(mockFrom).toHaveBeenCalledWith("phi_assets")
  })

  it("addPhiAsset returns error when not authenticated", async () => {
    const { getAuth } = await import("@/lib/actions/shared")
    vi.mocked(getAuth).mockResolvedValueOnce({ supabase: { from: mockFrom } as any, clientId: null })
    const { addPhiAsset } = await import("@/lib/actions/healthcare")
    const fd = new FormData()
    const result = await addPhiAsset(fd)
    expect(result).toEqual({ error: "Unauthorized" })
  })

  it("getBaaAgreements queries baa_agreements table", async () => {
    const { getBaaAgreements } = await import("@/lib/actions/healthcare")
    await getBaaAgreements()
    expect(mockFrom).toHaveBeenCalledWith("baa_agreements")
  })

  it("addBaaAgreement returns error when not authenticated", async () => {
    const { getAuth } = await import("@/lib/actions/shared")
    vi.mocked(getAuth).mockResolvedValueOnce({ supabase: { from: mockFrom } as any, clientId: null })
    const { addBaaAgreement } = await import("@/lib/actions/healthcare")
    const fd = new FormData()
    const result = await addBaaAgreement(fd)
    expect(result).toEqual({ error: "Unauthorized" })
  })

  it("addBaaAgreement inserts into baa_agreements with client_id", async () => {
    const { addBaaAgreement } = await import("@/lib/actions/healthcare")
    const fd = new FormData()
    fd.set("vendor_name", "Cloud Storage Inc")
    fd.set("service_type", "hosting")
    fd.set("phi_types", "medical records,lab results")
    fd.set("baa_status", "active")
    await addBaaAgreement(fd)
    expect(mockFrom).toHaveBeenCalledWith("baa_agreements")
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        client_id: "user-123",
        vendor_name: "Cloud Storage Inc",
        phi_types: ["medical records", "lab results"],
      })
    )
  })
})
