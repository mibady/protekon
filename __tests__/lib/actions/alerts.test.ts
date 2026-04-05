import { describe, it, expect, vi, beforeEach } from "vitest"

const mockUser = {
  id: "user-123",
  email: "test@example.com",
  user_metadata: { business_name: "Test Co" },
}

const mockGetUser = vi.fn()
const mockFrom = vi.fn()

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}))

describe("alert actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null })

    mockFrom.mockImplementation((table: string) => {
      if (table === "alerts") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                range: vi.fn().mockResolvedValue({
                  data: [
                    {
                      id: "alert-1",
                      type: "warning",
                      title: "Compliance Due",
                      description: "Annual review due",
                      created_at: "2026-04-01T00:00:00Z",
                      action: "Review Now",
                      read: false,
                    },
                  ],
                  error: null,
                }),
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          }),
        }
      }
      return {}
    })
  })

  // --- getAlerts ---

  it("getAlerts auth guard -> returns { data: [], error } when no user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    const { getAlerts } = await import("@/lib/actions/alerts")

    const result = await getAlerts()

    expect(result.data).toEqual([])
    expect(result.error).toBe("Not authenticated")
  })

  it("getAlerts queries 'alerts' table", async () => {
    const { getAlerts } = await import("@/lib/actions/alerts")

    await getAlerts()

    expect(mockFrom).toHaveBeenCalledWith("alerts")
  })

  it("getAlerts supports pagination (offset, limit)", async () => {
    const mockRange = vi.fn().mockResolvedValue({ data: [], error: null })
    const mockOrder = vi.fn().mockReturnValue({ range: mockRange })
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })

    mockFrom.mockImplementation((table: string) => {
      if (table === "alerts") return { select: mockSelect }
      return {}
    })

    const { getAlerts } = await import("@/lib/actions/alerts")

    await getAlerts(10, 5)

    // range(offset, offset + limit - 1) => range(10, 14)
    expect(mockRange).toHaveBeenCalledWith(10, 14)
  })

  it("getAlerts orders by created_at desc", async () => {
    const mockRange = vi.fn().mockResolvedValue({ data: [], error: null })
    const mockOrder = vi.fn().mockReturnValue({ range: mockRange })
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })

    mockFrom.mockImplementation((table: string) => {
      if (table === "alerts") return { select: mockSelect }
      return {}
    })

    const { getAlerts } = await import("@/lib/actions/alerts")

    await getAlerts()

    expect(mockOrder).toHaveBeenCalledWith("created_at", { ascending: false })
  })

  // --- markAllAlertsRead ---

  it("markAllAlertsRead auth guard -> returns error when no user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
    const { markAllAlertsRead } = await import("@/lib/actions/alerts")

    const result = await markAllAlertsRead()

    expect(result).toEqual({ success: false, error: "You must be logged in." })
  })

  it("markAllAlertsRead updates read=true on 'alerts' table", async () => {
    const mockEqRead = vi.fn().mockResolvedValue({ error: null })
    const mockEqClientId = vi.fn().mockReturnValue({ eq: mockEqRead })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEqClientId })

    mockFrom.mockImplementation((table: string) => {
      if (table === "alerts") return { update: mockUpdate }
      return {}
    })

    const { markAllAlertsRead } = await import("@/lib/actions/alerts")

    const result = await markAllAlertsRead()

    expect(result).toEqual({ success: true })
    expect(mockFrom).toHaveBeenCalledWith("alerts")
    expect(mockUpdate).toHaveBeenCalledWith({ read: true })
    expect(mockEqClientId).toHaveBeenCalledWith("client_id", "user-123")
    expect(mockEqRead).toHaveBeenCalledWith("read", false)
  })
})
