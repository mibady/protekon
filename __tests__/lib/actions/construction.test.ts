import { describe, it, expect, vi, beforeEach } from "vitest"

const selectChain: Record<string, unknown> = {}
selectChain.eq = vi.fn().mockReturnValue(selectChain)
selectChain.order = vi.fn().mockResolvedValue({ data: [], error: null })
selectChain.single = vi.fn().mockResolvedValue({ data: { license_number: "LIC-001" }, error: null })
const mockSelect = vi.fn().mockReturnValue(selectChain)
const mockInsertSelect = vi.fn().mockReturnValue({
  single: vi.fn().mockResolvedValue({ data: { id: "new-id" }, error: null }),
})
const mockInsert = vi.fn().mockReturnValue({ select: mockInsertSelect })
const mockDelete = vi.fn().mockReturnValue({
  eq: vi.fn().mockReturnValue({
    eq: vi.fn().mockResolvedValue({ error: null }),
  }),
})
const mockUpdate = vi.fn().mockReturnValue({
  eq: vi.fn().mockReturnValue({
    eq: vi.fn().mockResolvedValue({ error: null }),
  }),
})

const mockFrom = vi.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
  delete: mockDelete,
  update: mockUpdate,
}))

vi.mock("@/lib/actions/shared", () => ({
  getAuth: vi.fn().mockResolvedValue({
    supabase: { from: mockFrom },
    clientId: "user-123",
  }),
}))

describe("construction actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("getSubcontractors returns [] when not authenticated", async () => {
    const { getAuth } = await import("@/lib/actions/shared")
    vi.mocked(getAuth).mockResolvedValueOnce({ supabase: { from: mockFrom } as any, clientId: null })
    const { getSubcontractors } = await import("@/lib/actions/construction")
    const result = await getSubcontractors()
    expect(result).toEqual([])
  })

  it("getSubcontractors queries construction_subs table", async () => {
    const { getSubcontractors } = await import("@/lib/actions/construction")
    await getSubcontractors()
    expect(mockFrom).toHaveBeenCalledWith("v_construction_subs_dashboard")
  })

  it("addSubcontractor returns error when not authenticated", async () => {
    const { getAuth } = await import("@/lib/actions/shared")
    vi.mocked(getAuth).mockResolvedValueOnce({ supabase: { from: mockFrom } as any, clientId: null })
    const { addSubcontractor } = await import("@/lib/actions/construction")
    const fd = new FormData()
    const result = await addSubcontractor(fd)
    expect(result).toEqual({ error: "Please log in to continue." })
  })

  it("addSubcontractor inserts into construction_subs with client_id", async () => {
    const { addSubcontractor } = await import("@/lib/actions/construction")
    const fd = new FormData()
    fd.set("company_name", "ABC Plumbing")
    fd.set("license_number", "LIC-001")
    fd.set("license_status", "active")
    fd.set("insurance_status", "current")
    await addSubcontractor(fd)
    expect(mockFrom).toHaveBeenCalledWith("construction_subs")
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ client_id: "user-123", company_name: "ABC Plumbing" })
    )
  })

  it("deleteSubcontractor deletes with client_id filter", async () => {
    const { deleteSubcontractor } = await import("@/lib/actions/construction")
    await deleteSubcontractor("sub-1")
    expect(mockFrom).toHaveBeenCalledWith("construction_subs")
    expect(mockDelete).toHaveBeenCalled()
  })
})
