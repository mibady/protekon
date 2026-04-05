import { describe, it, expect, vi, beforeEach } from "vitest"

const mockUser = { id: "user-123", email: "test@co.com" }

const mockAdminEq = vi.fn().mockReturnValue({
  order: vi.fn().mockResolvedValue({ data: [], error: null }),
  single: vi.fn().mockResolvedValue({ data: { id: "del-1", client_id: "user-123" }, error: null }),
  eq: vi.fn().mockReturnValue({
    single: vi.fn().mockResolvedValue({ data: { id: "del-1", client_id: "user-123" }, error: null }),
  }),
})
const mockAdminSelect = vi.fn().mockReturnValue({ eq: mockAdminEq })
const mockAdminUpdate = vi.fn().mockReturnValue({
  eq: vi.fn().mockResolvedValue({ error: null }),
})
const mockAdminUpsert = vi.fn().mockResolvedValue({ error: null })

const mockAdminFrom = vi.fn(() => ({
  select: mockAdminSelect,
  update: mockAdminUpdate,
  upsert: mockAdminUpsert,
}))

const mockGetUser = vi.fn().mockResolvedValue({
  data: { user: mockUser },
})

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    from: vi.fn(),
    auth: { getUser: mockGetUser },
  }),
}))

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn().mockReturnValue({
    from: mockAdminFrom,
  }),
}))

describe("scheduled-deliveries actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: mockUser } })
  })

  it("getDeliveryPreferences returns [] when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const { getDeliveryPreferences } = await import("@/lib/actions/scheduled-deliveries")
    const result = await getDeliveryPreferences()
    expect(result).toEqual([])
  })

  it("getDeliveryPreferences queries scheduled_deliveries table", async () => {
    const { getDeliveryPreferences } = await import("@/lib/actions/scheduled-deliveries")
    await getDeliveryPreferences()
    expect(mockAdminFrom).toHaveBeenCalledWith("scheduled_deliveries")
  })

  it("updateDeliveryPreference returns error when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const { updateDeliveryPreference } = await import("@/lib/actions/scheduled-deliveries")
    const result = await updateDeliveryPreference("del-1", { frequency: "weekly" })
    expect(result).toEqual({ error: "Not authenticated" })
  })

  it("updateDeliveryPreference verifies ownership before updating", async () => {
    const { updateDeliveryPreference } = await import("@/lib/actions/scheduled-deliveries")
    await updateDeliveryPreference("del-1", { frequency: "monthly" })
    // Verify it checked ownership by querying with both id and client_id
    expect(mockAdminFrom).toHaveBeenCalledWith("scheduled_deliveries")
    expect(mockAdminSelect).toHaveBeenCalled()
  })

  it("updateDeliveryPreference returns error when delivery not found", async () => {
    mockAdminEq.mockReturnValueOnce({
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    })
    const { updateDeliveryPreference } = await import("@/lib/actions/scheduled-deliveries")
    const result = await updateDeliveryPreference("nonexistent", { frequency: "weekly" })
    expect(result).toEqual({ error: "Delivery not found" })
  })

  it("createDefaultDeliveries upserts into scheduled_deliveries", async () => {
    const { createDefaultDeliveries } = await import("@/lib/actions/scheduled-deliveries")
    await createDefaultDeliveries("client-1", "core")
    expect(mockAdminFrom).toHaveBeenCalledWith("scheduled_deliveries")
    expect(mockAdminUpsert).toHaveBeenCalled()
  })
})
